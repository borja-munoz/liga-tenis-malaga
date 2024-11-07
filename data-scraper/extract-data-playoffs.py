import csv
import requests
from bs4 import BeautifulSoup

playoff_urls = [
  'http://www.tenismalaga.es/playoff.html',
  'http://www.tenismalaga.es/temporada2/playofftemporada2.html',
  'http://www.tenismalaga.es/temporada3/playoff/playofftemporada3.html',
  'http://www.tenismalaga.es/temporada4/playoff/playofftemporada4.html',
  'http://www.tenismalaga.es/temporada5/playoff/playofftemporada5.html',
  'http://www.tenismalaga.es/temporada6/playoff/playofftemporada6.html',
  'http://www.tenismalaga.es/temporada7/playoff/playofftemporada7.html'
];

playoff_data = []
season_index = 1
rounds = []
current_round = 0
player_a_names = []
player_a_seeds = []
player_b_names = []
player_b_seeds = []
for url in playoff_urls:
  page = requests.get(url)
  soup = BeautifulSoup(page.content, 'html.parser')

  font_elements = soup.select('font')
  if len(font_elements) == 0:
    break
  group = ''
  results_table = False
  column_offset_rounds = 0
  for fe in font_elements:
    if fe.text.upper().startswith('PLAY OFF'):
      # group = fe.text.split("PLAY OFF ")[1]
      group = fe.text
      results_table = False
      rounds = []
      column_offset_rounds = 0
    elif 'FINAL' in fe.text.upper() or 'RONDA PREVIA' in fe.text.upper():
      if len(rounds) == 0:
        # Calculate initial offset for those round rows
        # that do not start in the left-most cell
        for i, node in enumerate(fe.parent.parent.parent.children):
          if str(node).find(fe.text) != -1:
            break
          elif str(node).find('<td') != -1:
            column_offset_rounds += 1
        player_a_names = []
        player_a_seeds = []
        player_b_names = []
        player_b_seeds = []
        current_round = -1
        results_table = True      
      rounds.append(fe.text)
    elif 'VS' in fe.text and len(fe.text.split(' VS ')) == 2: 
      # Player name and seed 
      player_a = fe.text.split(' VS ')[0]
      player_b = fe.text.split(' VS ')[1]
      player_a_seed = player_a[player_a.find('(') + 1:player_a.rfind(')')]
      player_b_seed = player_b[player_b.find('(') + 1:player_b.rfind(')')]
      if season_index <= 2:
        # In the first two seasons, the seed comes after the name
        player_a_name = player_a.split('(')[0].strip()
        player_b_name = player_b.split('(')[0].strip()
      else:
        # After the third season, the seed comes before the name
        player_a_name = player_a.split(')')[1].strip()
        if season_index == 3:
          player_b_name = player_b[player_b.find(')') + 1:player_b.rfind('|')].strip()
        else:
          # No pipe from season 4
          if player_b.strip() != '':
            player_b_name = player_b.split(')')[1].strip()      

            # In the first 3 seasons, the match result is in the same cell
            # In seasons 4-7, the match result is in the cell below the player names
            # For seasons 4-7, we can store an array with the player names and
            # the index based on the current round, so when we find a result, we
            # extract the players from this array with the current round index
            # We need to take into account, the column_offset_rounds for
            # blank cells at the beginning of the row

            if len(player_a_names) == 0:
              player_a_names = [''] * len(rounds)
              player_a_seeds = [''] * len(rounds)
              player_b_names = [''] * len(rounds)
              player_b_seeds = [''] * len(rounds)

            # Get current round
            current_round = -1
            no_table_cell_children = 0;
            # Usually everything is using bold font but there is one case
            # where the player names are not, so there is one less parent
            # to reach the <tr> element
            if str(fe.parent).find('<b>') == -1:
              tr_element_children = fe.parent.parent.children
            else: 
              tr_element_children = fe.parent.parent.parent.children
            for i, node in enumerate(tr_element_children):
              if str(node) == '\n':
                no_table_cell_children += 1
              elif str(node).find(fe.text) != -1:
                current_round = i - no_table_cell_children
                break
              
            player_a_names[current_round - column_offset_rounds] = player_a_name
            player_a_seeds[current_round - column_offset_rounds] = player_a_seed
            player_b_names[current_round - column_offset_rounds] = player_b_name
            player_b_seeds[current_round - column_offset_rounds] = player_b_seed
    elif '-' in fe.text:
      index = 0
      start_index = 0
      end_index = len(fe.text)- 1
      games_won_player_a = []
      games_won_player_b = []

      # Get current round
      current_round = -1
      no_table_cell_children = 0;
      for i, node in enumerate(fe.parent.parent.parent.children):
        if str(node) == '\n':
          no_table_cell_children += 1
        elif str(node).find(fe.text) != -1:
          current_round = i - no_table_cell_children
          break
        
      while index != -1:
        index = fe.text.find('-', start_index, end_index)
        if index != -1:
          games_won_player_a.append(fe.text[index-1])
          games_won_player_b.append(fe.text[index+1])
          start_index = index + 1
      games_won_player_a_set_one = games_won_player_a[0]
      games_won_player_b_set_one = games_won_player_b[0]
      if len(games_won_player_a) >= 2:
        games_won_player_a_set_two = games_won_player_a[1]
        games_won_player_b_set_two = games_won_player_b[1]
      else:  
        games_won_player_a_set_two = ''
        games_won_player_b_set_two = ''

      # To check if we have a super tie break, we need to look
      # if there are three sets and if the score for the third
      # set is 1-0 or 0-1  
      super_tie_break_winner = ''
      games_won_player_a_set_three = ''
      games_won_player_b_set_three = ''
      if len(games_won_player_a) == 3:
        if games_won_player_a[2] == 1 and games_won_player_b == 0:
          if season_index < 4:
            super_tie_break_winner = player_a_name
          else:
            super_tie_break_winner = player_a_names[current_round - column_offset_rounds]
        elif games_won_player_a[2] == 0 and games_won_player_b == 1:
          if season_index < 4:
            super_tie_break_winner = player_b_name
          else:        
            super_tie_break_winner = player_b_names[current_round - column_offset_rounds]
        else:
          games_won_player_a_set_three = games_won_player_a[2]
          games_won_player_b_set_three = games_won_player_b[2]

      # To check if we have the club, we need to split the string
      # with the blank space, take the last element and see if it
      # is a number. If it is not a number and it doesn't include
      # the ' ret ' string, then it's the club name.
      club = ''
      tokens = fe.text.split()
      if tokens[-1].find('-') == -1 and not ' RET ' in fe.text.upper():
        club = tokens[-1]

      # To check if a player has retired, we need to look for
      # the ' ret ' string
      retired_player = ''
      if ' RET ' in fe.text.upper():
        retired_player_short_name = fe.text.upper().split(' RET ')[1].split()[0]
        if season_index < 4:
          if retired_player_short_name in player_a.upper():
            retired_player = player_a_name
          elif retired_player_short_name in player_b.upper():
            retired_player = player_b_name
        else:
          player_a_current_name = player_a_names[current_round - column_offset_rounds]
          player_b_current_name = player_b_names[current_round - column_offset_rounds]
          if retired_player_short_name in player_a_current_name.upper():
            retired_player = player_a_current_name
          elif retired_player_short_name in player_b_current_name.upper():
            retired_player = player_b_current_name

      playoff_data.append({
        'season': season_index,
        'group_name': group,
        'round': rounds[current_round - column_offset_rounds],
        'round_order': current_round + 1,
        'player_a': player_a_name if season_index < 4 else player_a_names[current_round - column_offset_rounds],
        'player_a_seed': player_a_seed if season_index < 4 else player_a_seeds[current_round - column_offset_rounds],
        'player_b': player_b_name if season_index < 4 else player_b_names[current_round - column_offset_rounds],
        'player_b_seed': player_b_seed if season_index < 4 else player_b_seeds[current_round - column_offset_rounds],
        'games_won_player_a_set_one': games_won_player_a_set_one,
        'games_won_player_a_set_two': games_won_player_a_set_two,
        'games_won_player_a_set_three': games_won_player_a_set_three,
        'games_won_player_b_set_one': games_won_player_b_set_one,
        'games_won_player_b_set_two': games_won_player_b_set_two,
        'games_won_player_b_set_three': games_won_player_b_set_three,
        'super_tie_break_winner': super_tie_break_winner,
        'club': club,
        'retired_player': retired_player
      })
    # if results_table:
    #   current_round = (current_round + 1) % len(rounds)
  season_index += 1

with open('results-playoff.csv', 'w', newline='') as csvfile:
    fieldnames = [
      'season', 
      'group_name',
      'round',
      'round_order',
      'player_a',
      'player_b',
      'player_a_seed',
      'player_b_seed',
      'games_won_player_a_set_one',
      'games_won_player_a_set_two',
      'games_won_player_a_set_three',
      'games_won_player_b_set_one',
      'games_won_player_b_set_two',
      'games_won_player_b_set_three',
      'super_tie_break_winner',
      'club',
      'retired_player'
    ]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    for result in playoff_data:
      writer.writerow(result)

print('PlayOff Data Extracted')