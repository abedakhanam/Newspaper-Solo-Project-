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

// export async function testLogin(username, password) {
//   await driver.get(`${baseUrl}/auth`);

//   // Test login with empty fields to check required validation
//   let usernameInput = await driver.findElement(By.id("username"), 10000);
//   let passwordInput = await driver.findElement(By.id("password"), 10000);

//   // Fill out the login form with provided credentials
//   await usernameInput.sendKeys(username);
//   await passwordInput.sendKeys(password);

//   // Submit the form
//   await driver
//     .findElement(By.xpath("//button[contains(text(), 'Login')]"))
//     .click();

//   try {
//     // Wait for either successful login (redirect to home) or error message
//     await driver.wait(until.urlIs(`${baseUrl}/`), 5000); // If login is successful, redirect happens
//     console.log("Login test passed");
//   } catch (error) {
//     // If the login fails, the URL won't change and we need to check for the error message
//     console.log("Login failed, checking for error message");

//     // Wait for the error message to be displayed on the screen
//     const errorMessageElement = await driver.wait(
//       until.elementLocated(By.css("p.text-red-500.mb-4.text-center")),
//       5000
//     );
//     const errorMessageText = await errorMessageElement.getText();

//     // Log the error message (should log: "Invalid credentials")
//     console.log(`Error message displayed: ${errorMessageText}`);
//   }
// }
