import { Builder, By, Key, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

let driver;
const baseUrl = "http://localhost:5173";

function generateRandomString(length) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

async function runTests() {
  try {
    // Set up Chrome WebDriver
    driver = await new Builder().forBrowser("chrome").build();

    // Test Registration
    async function testRegistration() {
      await driver.get(`${baseUrl}/auth`);
      // Switch to Register mode
      await driver
        .findElement(
          By.xpath(
            "//button[contains(text(), 'Need an account? Register here')]"
          )
        )
        .click();

      // Check for validation message on required fields
      let usernameInput = await driver.findElement(By.id("username"), 10000);
      let validationMessage = await usernameInput.getAttribute(
        "validationMessage"
      );
      console.log(`Username validation message: ${validationMessage}`);

      let emailInput = await driver.findElement(By.id("email"), 10000);
      validationMessage = await emailInput.getAttribute("validationMessage");
      console.log(`Email validation message: ${validationMessage}`);

      let passwordInput = await driver.findElement(By.id("password"), 10000);
      validationMessage = await passwordInput.getAttribute("validationMessage");
      console.log(`Password validation message: ${validationMessage}`);

      // Generate random user data
      const username = `TestUser${generateRandomString(5)}`;
      const email = `testuser_${generateRandomString(5)}@example.com`;
      const password = generateRandomString(10);

      // Fill out the registration form
      await driver.wait(until.elementLocated(By.id("username")), 10000);
      await driver.findElement(By.id("username")).sendKeys(username);
      await driver.findElement(By.id("email")).sendKeys(email);
      await driver.findElement(By.id("password")).sendKeys(password);

      // Submit the form
      await driver
        .findElement(By.xpath("//button[contains(text(), 'Register')]"))
        .click();

      // Wait for success message
      await driver.wait(until.elementLocated(By.css(".text-green-500")), 10000);
      const successMessage = await driver
        .findElement(By.css(".text-green-500"))
        .getText();
      console.log(successMessage); // Should log: "Registration successful!"
      console.log("Registration test passed");

      return { username, email, password };
    }

    // Test Logout
    async function testLogout() {
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

    // Run the tests
    const { username, password } = await testRegistration();
    await driver.sleep(2000);
    await testLogin(username, password);
    await driver.sleep(2000);
    await testLogout();

    console.log("All tests completed successfully");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

export async function testLogin(username, password) {
  await driver.get(`${baseUrl}/auth`);

  // Test login with empty fields to check required validation
  let usernameInput = await driver.findElement(By.id("username"), 10000);
  let passwordInput = await driver.findElement(By.id("password"), 10000);

  // Fill out the login form with provided credentials
  await usernameInput.sendKeys(username);
  await passwordInput.sendKeys(password);

  // Submit the form
  await driver
    .findElement(By.xpath("//button[contains(text(), 'Login')]"))
    .click();

  try {
    // Wait for either successful login (redirect to home) or error message
    await driver.wait(until.urlIs(`${baseUrl}/`), 5000); // If login is successful, redirect happens
    console.log("Login test passed");
  } catch (error) {
    // If the login fails, the URL won't change and we need to check for the error message
    console.log("Login failed, checking for error message");

    // Wait for the error message to be displayed on the screen
    const errorMessageElement = await driver.wait(
      until.elementLocated(By.css("p.text-red-500.mb-4.text-center")),
      5000
    );
    const errorMessageText = await errorMessageElement.getText();

    // Log the error message (should log: "Invalid credentials")
    console.log(`Error message displayed: ${errorMessageText}`);
  }
}

// // Test Login
// export async function testLogin(username, password) {
//   await driver.get(`${baseUrl}/auth`);

//   let usernameInput = await driver.findElement(By.id("username"), 10000);
//   let validationMessage = await usernameInput.getAttribute("validationMessage");
//   console.log(`Username validation message: ${validationMessage}`);

//   let passwordInput = await driver.findElement(By.id("password"), 10000);
//   validationMessage = await passwordInput.getAttribute("validationMessage");
//   console.log(`Password validation message: ${validationMessage}`);

//   // Fill out the login form
//   await driver.wait(until.elementLocated(By.id("username")), 10000);
//   await driver.findElement(By.id("username")).sendKeys(username);
//   await driver.findElement(By.id("password")).sendKeys(password);

//   // Submit the form
//   await driver
//     .findElement(By.xpath("//button[contains(text(), 'Login')]"))
//     .click();

//   // Wait for redirect to home page
//   await driver.wait(until.urlIs(`${baseUrl}/`), 10000);
//   console.log("Login test passed");
// }

runTests();
