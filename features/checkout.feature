@checkout
Feature: Checkout and order placement
  As a registered customer
  I want to check out the products in my cart
  So that my order is delivered to my registered address

  @smoke @regression
  Scenario: Successful checkout with valid customer details
    Given a newly registered user is logged in
    And the user's cart contains the following products:
      | product    |
      | Blue Top   |
      | Men Tshirt |
    When the user proceeds to checkout
    Then the delivery address should match the registered account details
    And the order review should list the cart products with the correct total amount
    When the user confirms the order paying with valid card details
    Then the order should be placed successfully

  @regression
  Scenario: Payment is blocked when mandatory card details are missing
    Given a newly registered user is logged in
    And the user's cart contains the following products:
      | product  |
      | Blue Top |
    When the user proceeds to checkout and continues to payment
    And the user tries to pay without providing any card details
    Then the order should not be placed
    And the payment form should indicate the mandatory card fields

  @regression
  Scenario: Guests must register or log in before checking out
    Given the user is viewing the product catalogue
    When the user adds the product "Blue Top" to the cart
    And the user proceeds to checkout as a guest
    Then the user should be prompted to register or log in before completing checkout
