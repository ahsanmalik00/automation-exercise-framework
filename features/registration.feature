@registration
Feature: User registration
  As a new visitor
  I want to create an account with my personal details
  So that I can shop and check out as a registered customer

  @regression
  Scenario Outline: A new visitor registers an account successfully
    Given the user is on the home page
    When the user starts signing up with a fresh name and a unique email address
    And the user submits the mandatory account information as "<title>"
    Then the account should be created successfully
    And the user should be signed in as the new account holder

    @smoke
    Examples:
      | title |
      | Mr.   |

    Examples:
      | title |
      | Mrs.  |

  @regression
  Scenario: Registration is rejected for an email address that is already in use
    Given a registered user exists
    And the user is on the login page
    When the user tries to sign up using the existing account's email address
    Then the signup should be rejected because the email is already registered
