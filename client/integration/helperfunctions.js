import { Builder, By, Key, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

// Helper function to add a delay
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function testLogin(username, password, driver, baseUrl) {
  await driver.get(`${baseUrl}/auth`);

  // Fill out the login form
  await driver.wait(until.elementLocated(By.id("username")), 10000);

  // Submit the form
  await driver
    .findElement(By.xpath("//button[contains(text(), 'Login')]"))
    .click();
  await delay(500);

  await driver.findElement(By.id("username")).sendKeys(username);

  // Submit the form
  await driver
    .findElement(By.xpath("//button[contains(text(), 'Login')]"))
    .click();
  await delay(500);

  await driver.findElement(By.id("password")).sendKeys(password);

  await delay(500);

  // Submit the form
  await driver
    .findElement(By.xpath("//button[contains(text(), 'Login')]"))
    .click();

  await delay(500);

  // Wait for redirect to home page
  await driver.wait(until.urlIs(`${baseUrl}/`), 10000);
  console.log("Login test passed");
}

// Test Logout
export async function testLogout(driver, baseUrl) {
  //homepage after login
  await driver.get(`${baseUrl}/`);

  // Find and click the logout button by text 'Logout'
  await driver.wait(
    until.elementLocated(By.xpath("//button[contains(text(), 'Logout')]")),
    10000
  );
  await driver
    .findElement(By.xpath("//button[contains(text(), 'Logout')]"))
    .click();

  // Wait for the 'Log in' button to appear after logging out
  await driver.wait(
    until.elementLocated(By.xpath("//a[contains(text(), 'Log in')]")),
    10000
  );

  console.log("Logout test passed");
}

//will do later
export async function scrollIntoView(element, driver) {
  await driver.executeScript("arguments[0].scrollIntoView(true);", element);
  await delay(500); // Small delay after scrolling
}
