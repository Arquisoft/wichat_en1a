Feature: Registering a new user

Scenario: The user is not registered in the site
  Given An unregistered user
  When I fill the data in the form and press submit
  Then I am redirected to the login page

Scenario: The user is registered in the site
  Given A registered user
  When I fill the data in the login form and press submit
  Then I am redirected to the home page