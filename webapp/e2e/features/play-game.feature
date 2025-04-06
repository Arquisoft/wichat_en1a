Feature: Playing a game

Scenario: The user plays a basic game
  Given An unregistered user
  When I register correctly
  And I login correctly
  And I select the basic gamemode
  And I play the game
  Then I am redirected to the results page
  And I logout sucessfuly
