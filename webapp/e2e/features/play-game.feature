Feature: Playing a game

Scenario: The user plays a basic game
  Given An unregistered user
  When I register correctly
  And I login correctly
  And I select the basic gamemode
  And I play the game
  Then I see my game's statistics
  And I logout sucessfuly
