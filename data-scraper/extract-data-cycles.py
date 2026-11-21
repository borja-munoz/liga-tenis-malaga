import argparse
import csv
import datetime
import difflib
import os
import re
import unicodedata
import requests
from bs4 import BeautifulSoup

parser = argparse.ArgumentParser(description='Extract tennis match data')
parser.add_argument(
    '--mode',
    choices=['full', 'incremental'],
    default='full',
    help='full: reprocess everything (default). incremental: re-fetch the last '
         'processed cycle (it may have been incomplete) and any newer ones.'
)
parser.add_argument(
    '--cycles',
    help='Comma-separated list of cycles to (re)fetch; implies incremental mode. '
         'Format SEASON:CYCLE or SEASON:FIRST-LAST, e.g. "9:5-6,10:1". '
         'Existing rows for these cycles are replaced.'
)
parser.add_argument(
    '--report',
    help='Append a Markdown summary of the run (cycles fetched, new player '
         'names) to this file, e.g. $GITHUB_STEP_SUMMARY.'
)
args = parser.parse_args()

# In incremental mode, cycles that ended this many days ago or less are
# fetched again, to pick up results entered after the cycle closed
RESCRAPE_DAYS = 14
if args.cycles:
    args.mode = 'incremental'

def parse_cycles(spec):
    cycles = set()
    for item in spec.split(','):
        season, cycle_range = item.strip().split(':')
        first, _, last = cycle_range.partition('-')
        for c in range(int(first), int(last or first) + 1):
            cycles.add((int(season), c))
    return cycles

template_seasons = [
  'http://www.tenismalaga.es/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada2/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada3/Ciclo{cycle}/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada4/Ciclo{cycle}/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada5/Ciclo{cycle}/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada6/Ciclo{cycle}/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada7/Ciclo{cycle}/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada8/Ciclo{cycle}/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada9/Ciclo{cycle}/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada10/Ciclo{cycle}/Ciclo{cycle}.html'
];

column_order_seasons_1 = [
  'Puesto',
  'Jugador',
  'Puntos',
  'Ganados',
  'Perdidos',
  'No Jugados',
  'Sets Ganados',
  'Sets Perdidos',
  'Balance Sets',
  'Juegos Ganados',
  'Juegos Perdidos',
  'Balance Juegos',
  'Puntos por puesto',
  'Puntos extra',
  'Puntos total'
]

column_order_seasons_2_3 = [
  'Puesto',
  'Jugador',
  'Puntos',
  'Ganados',
  'Perdidos',
  'No Jugados',
  'Sets Ganados',
  'Sets Perdidos',
  'Balance Sets',
  'Puntos por puesto',
  'Puntos extra',
  'Puntos total'
]

column_order_seasons_4_6 = [
  'Grupo Destino',
  'Jugador',
  'Puntos',
  'Ganados',
  'Perdidos',
  'No Jugados',
  'Sets Ganados',
  'Sets Perdidos',
  'Balance Sets',
  'Puntos por puesto',
  'Puntos extra',
  'Puntos total'
]

column_order_seasons_7_10 = [
  'Puesto',
  'Grupo Destino',
  'Jugador',
  'Puntos',
  'Ganados',
  'Perdidos',
  'No Jugados',
  'Sets Ganados',
  'Sets Perdidos',
  'Balance Sets',
  'Puntos por puesto',
  'Puntos extra',
  'Puntos total'
]

column_order = [
  column_order_seasons_1,
  column_order_seasons_2_3,
  column_order_seasons_2_3,
  column_order_seasons_4_6,
  column_order_seasons_4_6,
  column_order_seasons_4_6,
  column_order_seasons_7_10,
  column_order_seasons_7_10,
  column_order_seasons_7_10,
  column_order_seasons_7_10
]

players = set()
seasons_players = []
cycle_data = []
results = []
results_players = []
results_first_row = False
results_table_row = -1
results_table_column = 0
results_cells = False
empty_result_cells = 0
empty_initial_result_columns = 0
empty_intermediate_result_columns = 0

# Cycle calendar (season, cycle) -> row. Rows for new cycles are added
# with the dates shown on the cycle page; existing rows are kept as they
# are (some pages show dates that differ from the real calendar)
cycles_calendar = {}
if os.path.exists('cycles.csv'):
    with open('cycles.csv', 'r', newline='') as f:
        for row in csv.DictReader(f):
            cycles_calendar[(int(row['season_id']), int(row['cycle_order']))] = row
new_cycles = []

def parse_page_date(text):
    day, month, year = (int(x) for x in text.split('/'))
    if year < 100:
        year += 2000
    return datetime.date(year, month, day)

def page_dates(soup):
    """Start and end date in the page header, e.g. 'CICLO 2 26/10/26 – 29/11/26'"""
    match = re.search(r'(\d{1,2}/\d{1,2}/\d{2,4})\s*\S\s*(\d{1,2}/\d{1,2}/\d{2,4})',
                      soup.get_text(' '))
    if not match:
        return None
    try:
        return parse_page_date(match.group(1)), parse_page_date(match.group(2))
    except ValueError:
        return None

processed_cycles = set()
cycles_to_fetch = None  # Explicit list of cycles to fetch (--cycles)
_existing_seasons_players = {}
_existing_results = []
_existing_standings = []

if args.mode == 'incremental':
    if os.path.exists('results.csv'):
        with open('results.csv', 'r', newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                processed_cycles.add((int(row['season']), int(row['cycle'])))
                _existing_results.append(row)

    if os.path.exists('standings.csv'):
        with open('standings.csv', 'r', newline='') as f:
            reader = csv.reader(f)
            next(reader)  # Header
            _existing_standings = list(reader)

    if args.cycles:
        cycles_to_fetch = parse_cycles(args.cycles)
    elif processed_cycles:
        # The last processed cycle may have been scraped while it was
        # still being played, so fetch it again with any newer cycles.
        # Recently finished cycles are fetched again too, as results are
        # sometimes entered a few days after the cycle ends
        processed_cycles.discard(max(processed_cycles))
        cutoff = datetime.date.today() - datetime.timedelta(days=RESCRAPE_DAYS)
        for key, row in cycles_calendar.items():
            if datetime.date.fromisoformat(row['end_date']) >= cutoff:
                processed_cycles.discard(key)

    if os.path.exists('players.csv'):
        with open('players.csv', 'r', newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                players.add(row['name'])

    if os.path.exists('seasons_players.csv'):
        with open('seasons_players.csv', 'r', newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                sid = int(row['season_id'])
                _existing_seasons_players.setdefault(sid, set()).add(row['player_name'])

known_players = set(players)

season_index = 1
for template in template_seasons:
  seasons_players.append(set())
  if args.mode == 'incremental':
    seasons_players[season_index - 1].update(
      _existing_seasons_players.get(season_index, set())
    )
  cycle_data.append([[] for _ in range(7)])
  for cycle_index in range(1, 8):
    if cycles_to_fetch is not None:
      if (season_index, cycle_index) not in cycles_to_fetch:
        continue
    elif args.mode == 'incremental' and (season_index, cycle_index) in processed_cycles:
      continue
    page = requests.get(template.format(cycle=cycle_index))
    soup = BeautifulSoup(page.content, 'html.parser')

    font_elements = soup.select('font')
    if len(font_elements) == 0:
      break
    if (season_index, cycle_index) not in cycles_calendar:
      dates = page_dates(soup)
      if dates is None:
        # Estimate: cycles last five weeks and start the day after the
        # previous one ends
        previous = cycles_calendar.get((season_index, cycle_index - 1))
        start = (datetime.date.fromisoformat(previous['end_date']) + datetime.timedelta(days=1)
                 if previous else datetime.date.today())
        dates = (start, start + datetime.timedelta(days=34))
        print(f'WARNING season {season_index} cycle {cycle_index}: dates not found '
              f'in the page, estimated as {dates[0]} - {dates[1]}')
      row = {
        'season_id': season_index,
        'cycle_order': cycle_index,
        'name': f'Ciclo {cycle_index}',
        'start_date': dates[0].isoformat(),
        'end_date': dates[1].isoformat(),
      }
      cycles_calendar[(season_index, cycle_index)] = row
      new_cycles.append(row)
    player_row = False
    results_table = False
    standings = {}
    group_index = 0
    player_index = 0
    for fe in font_elements:
      if player_row:
        if fe.text == '' and column_order_index == 0:
          player_row = False
          group_index += 1
          player_index = 0
        else:
          if column_order_index == column_order[season_index - 1].index("Jugador"):
            if fe.text not in players:
              players.add(fe.text)
            if fe.text not in seasons_players[season_index - 1]:
              seasons_players[season_index - 1].add(fe.text)
          standings[column_order[season_index - 1][column_order_index]] = fe.text
          column_order_index += 1
          if column_order_index == len(column_order[season_index - 1]):
            player_index += 1
            if 4 <= season_index <= 6:
              standings['Puesto'] = player_index
            if standings['Jugador'] != '':
              cycle_data[season_index - 1][cycle_index - 1][group_index].append(standings)
            standings = {}
            column_order_index = 0;
      elif fe.text.upper() == 'PUNTOS TOTAL':
        column_order_index = 0
        player_row = True    
        results_table = False
        cycle_data[season_index - 1][cycle_index - 1].append([])
      elif results_table:
        if fe.text == '':  # Empty cell
          if results_first_row:
            if (len(results_players) == 
                len(cycle_data[season_index - 1][cycle_index - 1][group_index - 1])):
              results_first_row = False
            elif len(results_players) == 0:
              empty_initial_result_columns += 1
            else:
              empty_intermediate_result_columns += 1
          elif results_cells:
            if (results_table_row == len(results_players) - 1 and
                results_table_column == len(results_players) - 1):
              results_table = False
              results_cells = False
            elif (results_table_column == 0 or 
                  empty_intermediate_result_columns == 0):
              empty_result_cells += 1
        elif results_first_row: # Header row
          results_players.append(fe.text)
        elif fe.text in results_players: # Start of player row
          results_table_row = results_players.index(fe.text)
          results_table_column = 0
          results_cells = True
          empty_result_cells = 0
        elif (results_table_row + 1 < len(results_players) and
              '-' not in fe.text and
              fe.text in [p['Jugador'] for p in
                          cycle_data[season_index - 1][cycle_index - 1][group_index - 1]]):
          # Row label that does not match the header of the results matrix
          # (the web page uses a different player name in the header).
          # Trust the standings name and treat it as the next row.
          results_table_row += 1
          print(f'WARNING season {season_index} cycle {cycle_index} '
                f'group {group_index}: results header name '
                f'"{results_players[results_table_row]}" replaced by row '
                f'label "{fe.text}"')
          results_players[results_table_row] = fe.text
          results_table_column = 0
          results_cells = True
          empty_result_cells = 0
        elif fe.text == 'Álvaro Lara Federico Bernard': # Special case
          results_table_row = 0
          results_table_column = 0
          results_cells = True        
          empty_result_cells = 0
        elif '-' in fe.text: # Match results
          player_a = results_players[results_table_row]
          player_b = results_players[
              results_table_column -
              empty_initial_result_columns +
              empty_result_cells]
          games_won_player_a_set_one = fe.text.split()[0].split('-')[0]
          games_won_player_b_set_one = fe.text.split()[0].split('-')[1]
          if len(fe.text.split()) > 1 and '-' in fe.text.split()[1]:
            games_won_player_a_set_two = fe.text.split()[1].split('-')[0]
            games_won_player_b_set_two = fe.text.split()[1].split('-')[1]
          else:
            games_won_player_a_set_two = 0
            games_won_player_b_set_two = 0
          super_tie_break_winner = ''
          club = ''
          retired_player = ''
          if len(fe.text.split()) >= 3:
            # Check if we have a super tie break
            if '-' in fe.text.split()[2]:
              if fe.text.split()[2].split('-')[0] == '1':
                super_tie_break_winner = player_a
              else:
                super_tie_break_winner = player_b
              if len(fe.text.split()) > 3:
                club = fe.text.split()[3]
            elif ' RET ' not in fe.text.upper():
              club = fe.text.split()[2]
            else:
              retired_player_short_name = fe.text.upper().split(' RET ')[1].split()[0]
              if retired_player_short_name in player_a.upper():
                retired_player = player_a
              elif retired_player_short_name in player_b.upper():
                retired_player = player_b
              if len(fe.text.split()) > 4:
                club = fe.text.split()[4]
          results.append({
            'season': season_index,
            'cycle': cycle_index,
            'group_number': group_index,
            'player_a': player_a,
            'player_b': player_b,
            'games_won_player_a_set_one': games_won_player_a_set_one,
            'games_won_player_a_set_two': games_won_player_a_set_two,
            'games_won_player_b_set_one': games_won_player_b_set_one,
            'games_won_player_b_set_two': games_won_player_b_set_two,
            'super_tie_break_winner': super_tie_break_winner,
            'club': club,
            'retired_player': retired_player
          })
          results_table_column += 1
        elif results_cells:   # Some other text
          results_table_column += 1
      elif fe.text.upper() == 'RESULTADOS':
        results_table = True
        results_first_row = True
        results_players = []
        results_table_row = -1
        results_table_column = 0
        results_cells = False
        empty_result_cells = 0
        empty_initial_result_columns = 0
        empty_intermediate_result_columns = 0
  season_index += 1

with open('players.csv', 'w', newline='') as csvfile:
    spamwriter = csv.writer(csvfile, delimiter=',')
    spamwriter.writerow(['name'])
    players_ordered = sorted(players)
    for player in players_ordered:
      if len(player) > 2:
        spamwriter.writerow([player])

with open('seasons_players.csv', 'w', newline='') as csvfile:
    spamwriter = csv.writer(csvfile, delimiter=',')
    spamwriter.writerow(['season_id', 'player_name'])
    for season_index in range(1, len(template_seasons) + 1):
      players_ordered = sorted(seasons_players[season_index - 1])
      for player in players_ordered:
        if len(player) > 2:
          spamwriter.writerow([season_index, player])

# Cycles fetched in this run. In incremental mode their previous rows
# are replaced; rows for every other cycle are kept untouched (including
# any manual corrections made to standings.csv).
fetched_cycles = set(
  (season_index + 1, cycle_index + 1)
  for season_index in range(len(cycle_data))
  for cycle_index in range(len(cycle_data[season_index]))
  if len(cycle_data[season_index][cycle_index]) > 0
)
fetched_cycles.update((r['season'], r['cycle']) for r in results)

def cycle_key(season, cycle):
  return (int(season), int(cycle))

# The standings may need manual editing to account for errors in the
# web page text and the parser, so review the new cycles after a run
if args.mode == 'incremental':
  kept_standings = [r for r in _existing_standings
                    if cycle_key(r[0], r[1]) not in fetched_cycles]
  kept_results = [r for r in _existing_results
                  if cycle_key(r['season'], r['cycle']) not in fetched_cycles]
else:
  kept_standings = []
  kept_results = []

new_standings = []
for season_index in range(1, len(template_seasons) + 1):
  for cycle_index in range(0, 7):
    if len(cycle_data[season_index - 1][cycle_index]) == 0:
      continue
    for group_index in range(0, len(cycle_data[season_index - 1][cycle_index])):
      for player_index in range(0, len(cycle_data[season_index - 1][cycle_index][group_index])):
        player_data = cycle_data[season_index - 1][cycle_index][group_index][player_index]
        new_standings.append([
          season_index,
          cycle_index + 1,
          group_index + 1,
          player_data['Puesto'],
          player_data.get('Grupo Destino') or '',
          player_data['Jugador'],
          player_data['Puntos'],
          player_data['Ganados'],
          player_data['Perdidos'],
          player_data['No Jugados'],
          player_data['Sets Ganados'],
          player_data['Sets Perdidos'],
          player_data['Balance Sets'],
          player_data.get('Juegos Ganados') or '',
          player_data.get('Juegos Perdidos') or '',
          player_data.get('Balance Juegos') or '',
          player_data['Puntos por puesto'],
          player_data['Puntos extra'],
          player_data['Puntos total']
        ])

# Stable sort keeps the original row order within each cycle
all_standings = sorted(kept_standings + new_standings,
                       key=lambda r: cycle_key(r[0], r[1]))
all_results = sorted(kept_results + results,
                     key=lambda r: cycle_key(r['season'], r['cycle']))

with open('standings.csv', 'w', newline='') as csvfile:
    spamwriter = csv.writer(csvfile, delimiter=',')
    spamwriter.writerow([
      'season_id',
      'cycle_id',
      'group',
      'Puesto',
      'Grupo Destino',
      'Jugador',
      'Puntos',
      'Ganados',
      'Perdidos',
      'No Jugados',
      'Sets Ganados',
      'Sets Perdidos',
      'Balance Sets',
      'Juegos Ganados',
      'Juegos Perdidos',
      'Balance Juegos',
      'Puntos por puesto',
      'Puntos extra',
      'Puntos total'
    ])
    spamwriter.writerows(all_standings)

with open('results.csv', 'w', newline='') as csvfile:
    fieldnames = [
      'season',
      'cycle',
      'group_number',
      'player_a',
      'player_b',
      'games_won_player_a_set_one',
      'games_won_player_a_set_two',
      'games_won_player_b_set_one',
      'games_won_player_b_set_two',
      'super_tie_break_winner',
      'club',
      'retired_player'
    ]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(all_results)

# The Play Off rows are added by hand, so they are kept as they are
with open('cycles.csv', 'w', newline='') as csvfile:
    fieldnames = ['season_id', 'cycle_order', 'name', 'start_date', 'end_date']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    writer.writerows(cycles_calendar[k] for k in sorted(cycles_calendar))

def normalize_name(name):
    name = unicodedata.normalize('NFKD', name.strip().lower())
    return ''.join(c for c in name if not unicodedata.combining(c))

def write_report(path):
    new_players = sorted(p for p in players if p not in known_players and len(p) > 2)
    by_normalized = {}
    for p in known_players:
        by_normalized.setdefault(normalize_name(p), []).append(p)
    lines = ['## Data scraped', '']
    lines.append('| Cycle | Standings rows | Results |')
    lines.append('|---|---|---|')
    for key in sorted(fetched_cycles, key=lambda k: cycle_key(*k)):
        season, cycle = cycle_key(*key)
        standings_rows = sum(1 for r in new_standings if (r[0], r[1]) == (season, cycle))
        result_rows = sum(1 for r in results if (r['season'], r['cycle']) == (season, cycle))
        lines.append(f'| Season {season} · Cycle {cycle} | {standings_rows} | {result_rows} |')
    lines.append('')
    for row in new_cycles:
        lines.append(f"New cycle: season {row['season_id']} {row['name']} "
                     f"({row['start_date']} – {row['end_date']})")
    if new_cycles:
        lines.append('')
    if new_players:
        lines.append('### New player names')
        lines.append('')
        lines.append('Check whether any of them is another spelling of an existing '
                     'player, and if so add it to `db-migrations/01-consolidate-players.sql`.')
        lines.append('')
        for p in new_players:
            similar = difflib.get_close_matches(normalize_name(p), by_normalized.keys(), n=3, cutoff=0.8)
            names = [n for key in similar for n in by_normalized[key]]
            hint = f" — similar to {', '.join(names)}" if names else ''
            lines.append(f'- {p}{hint}')
    else:
        lines.append('No new player names.')
    with open(path, 'a') as f:
        f.write('\n'.join(lines) + '\n')

if args.report:
    write_report(args.report)

print('Data Extracted')
# print(f'Players: {len(players)}')