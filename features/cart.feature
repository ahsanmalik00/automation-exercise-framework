@cart
Feature: Shopping cart
  As a shopper
  I want to add products to my cart and review its contents
  So that I can be sure I am buying the right items at the right price

  Background:
    Given the user is viewing the product catalogue

  @smoke @regression
  Scenario: Add two different products and review the cart
    When the user adds the following products to the cart:
      | product    |
      | Blue Top   |
      | Men Tshirt |
    Then the cart should contain exactly those products
    And each cart line should show the catalogue unit price, a quantity of 1 and a matching line total

  @regression
  Scenario: Adding the same product again increases its quantity
    When the user adds the product "Blue Top" to the cart twice
    Then the cart line for "Blue Top" should show a quantity of 2
    And the line total for "Blue Top" should equal twice its unit price
