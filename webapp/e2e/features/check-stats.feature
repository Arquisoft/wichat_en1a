Feature: Checking the user statistics

Scenario: A user without any game played tries to see his/her statistics
  Given A registered user that exists in the database
  When The user logs in correctly
  And The user clicks the statistics in the navigation bar
  Then The user is shown an informative message
  And The user logs out successfully

Scenario: The user checks his/her personal statistics after a game is played
  Given A registered user that exists in the database
  When The user logs in correctly
  And The user selects the basic game mode
  And The user plays the game
  Then The user sees the statistics of the game
  When The user clicks the statistics in the navigation bar
  Then The user can see the statistics
  And The user can navigate through the three tabs of the statistics view
  And The user logs out successfully
