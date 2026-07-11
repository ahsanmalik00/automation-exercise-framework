@login
Feature: User login
  As a registered customer
  I want to sign in to my account
  So that I can access my personalised shopping experience

  @smoke @regression
  Scenario: Login with valid credentials
    Given a registered user exists
    And the user is on the login page
    When the user logs in with valid credentials
    Then the user should be logged in successfully

  @regression
  Scenario: Login with invalid credentials is rejected
    Given the user is on the login page
    When the user attempts to log in with credentials that are not registered
    Then the user should not be logged in

  @regression
  Scenario: An error message is shown for an invalid login attempt
    Given the user is on the login page
    When the user attempts to log in with credentials that are not registered
    Then an incorrect credentials error message should be displayed
