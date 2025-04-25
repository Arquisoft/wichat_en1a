Feature: Checking the leaderboard

Scenario: The user checks the leaderboard results after a game is played
  Given A registered user that exists in the database
  When The user logs in correctly
  And The user selects the basic game mode
  And The user plays the game
  Then The user sees the statistics of the game
  When The user clicks the leaderboard in the navigation bar
  Then The user sees the results, including the recently played game
  And The user logs out successfully

Scenario: A user checks the leaderboard results after another user has played
  Given Two registered users A and B
  When User A logs in correctly
  And User A selects the basic game mode
  And User A plays the game
  Then User A sees the statistics of the game
  And User A logs out successfully
  When User B logs in correctly
  And User B clicks the leaderboard in the navigation bar
  Then User B sees the stored results, including user A's game
  And User B logs out successfully
