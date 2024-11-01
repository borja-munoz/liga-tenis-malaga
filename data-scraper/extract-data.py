import csv
import requests
from bs4 import BeautifulSoup

template_seasons = [
  'http://www.tenismalaga.es/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada2/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada3/Ciclo{cycle}/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada4/Ciclo{cycle}/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada5/Ciclo{cycle}/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada6/Ciclo{cycle}/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada7/Ciclo{cycle}/Ciclo{cycle}.html',
  'http://www.tenismalaga.es/temporada8/Ciclo{cycle}/Ciclo{cycle}.html'
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

column_order_seasons_7_8 = [
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
  column_order_seasons_7_8,
  column_order_seasons_7_8
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

season_index = 1
for template in template_seasons:
  seasons_players.append(set())
  cycle_data.append([])
  for cycle_index in range(1, 8):
    page = requests.get(template.format(cycle=cycle_index))
    soup = BeautifulSoup(page.content, 'html.parser')

    font_elements = soup.select('font')
    if len(font_elements) == 0:
      break
    player_row = False
    results_table = False
    standings = {}
    group_index = 0
    cycle_data[season_index - 1].append([])
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
              if fe.text.split()[2].split('-')[0] == 1:
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
    for season_index in range(1, 9):
      players_ordered = sorted(seasons_players[season_index - 1])
      for player in players_ordered:
        if len(player) > 2:
          spamwriter.writerow([season_index, player])

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
    for season_index in range(1, 9):
      for cycle_index in range(0, len(cycle_data[season_index - 1])):
          for group_index in range(0, len(cycle_data[season_index - 1][cycle_index])):
            for player_index in range(0, len(cycle_data[season_index - 1][cycle_index][group_index])):
              player_data = cycle_data[season_index - 1][cycle_index][group_index][player_index]
              spamwriter.writerow([
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
    for result in results:
      writer.writerow(result)

print('Data Extracted...')
print(f'Players: {len(players)}')