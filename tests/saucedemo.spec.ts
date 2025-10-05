import { test, expect } from '@playwright/test';

test.describe('SauceDemo - Login', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    // Fill login form
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Verify successful login
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    // Fill login form with invalid credentials
    await page.fill('#user-name', 'invalid_user');
    await page.fill('#password', 'wrong_password');
    await page.click('#login-button');

    // Verify error message
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
  });

  test('should show error when fields are empty', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    // Click login without filling fields
    await page.click('#login-button');

    // Verify error message
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Username is required');
  });
});

test.describe('SauceDemo - Product Catalog', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('https://www.saucedemo.com/');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
  });

  test('should display all products', async ({ page }) => {
    // Verify products are displayed
    const products = page.locator('.inventory_item');
    await expect(products).toHaveCount(6);
  });

  test('should sort products by price low to high', async ({ page }) => {
    // Select sort option
    await page.selectOption('[data-test="product-sort-container"]', 'lohi');

    // Get all product prices
    const prices = await page.locator('.inventory_item_price').allTextContents();
    const numericPrices = prices.map(price => parseFloat(price.replace('$', '')));

    // Verify prices are in ascending order
    for (let i = 0; i < numericPrices.length - 1; i++) {
      expect(numericPrices[i]).toBeLessThanOrEqual(numericPrices[i + 1]);
    }
  });

  test('should view product details', async ({ page }) => {
    // Click on first product
    await page.locator('.inventory_item_name').first().click();

    // Verify product details page
    await expect(page.locator('.inventory_details_name')).toBeVisible();
    await expect(page.locator('.inventory_details_desc')).toBeVisible();
    await expect(page.locator('.inventory_details_price')).toBeVisible();
  });
});

test.describe('SauceDemo - Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('https://www.saucedemo.com/');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
  });

  test('should add product to cart', async ({ page }) => {
    // Add first product to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Verify cart badge shows 1 item
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('should add multiple products to cart', async ({ page }) => {
    // Add multiple products
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();

    // Verify cart badge shows 3 items
    await expect(page.locator('.shopping_cart_badge')).toHaveText('3');
  });

  test('should remove product from cart', async ({ page }) => {
    // Add product to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Remove product from cart
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    // Verify cart badge is not visible
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  test('should view cart with added products', async ({ page }) => {
    // Add products to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Go to cart
    await page.locator('.shopping_cart_link').click();

    // Verify cart page
    await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
    await expect(page.locator('.cart_item')).toHaveCount(2);
  });
});

test.describe('SauceDemo - Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login and add products to cart
    await page.goto('https://www.saucedemo.com/');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Add products to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Go to cart
    await page.locator('.shopping_cart_link').click();
  });

  test('should complete checkout successfully', async ({ page }) => {
    // Start checkout
    await page.click('[data-test="checkout"]');

    // Fill checkout information
    await page.fill('[data-test="firstName"]', 'John');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '12345');
    await page.click('[data-test="continue"]');

    // Verify checkout overview
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');
    await expect(page.locator('.cart_item')).toHaveCount(2);

    // Complete purchase
    await page.click('[data-test="finish"]');

    // Verify success
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });

  test('should show error when checkout info is incomplete', async ({ page }) => {
    // Start checkout
    await page.click('[data-test="checkout"]');

    // Try to continue without filling fields
    await page.click('[data-test="continue"]');

    // Verify error message
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Error: First Name is required');
  });

  test('should be able to cancel checkout', async ({ page }) => {
    // Start checkout
    await page.click('[data-test="checkout"]');

    // Fill checkout information
    await page.fill('[data-test="firstName"]', 'John');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '12345');
    await page.click('[data-test="continue"]');

    // Cancel on overview page
    await page.click('[data-test="cancel"]');

    // Verify back on products page
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });
});