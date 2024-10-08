import { Builder, By, Key, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { delay, testLogin, testLogout } from "./helperfunctions.js";

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

      await delay(500);

      await driver
        .findElement(
          By.xpath(
            "//button[contains(text(), 'Need an account? Register here')]"
          )
        )
        .click();

      //random user data
      const username = `TestUser${generateRandomString(5)}`;
      const email = `testuser_${generateRandomString(5)}@example.com`;
      const password = generateRandomString(10);

      //registration form
      await driver.wait(until.elementLocated(By.id("username")), 10000);

      await driver
        .findElement(By.xpath("//button[contains(text(), 'Register')]"))
        .click();
      await delay(500);

      await driver.findElement(By.id("username")).sendKeys(username);

      await driver
        .findElement(By.xpath("//button[contains(text(), 'Register')]"))
        .click();
      await delay(500);

      await driver.findElement(By.id("email")).sendKeys(email);

      await driver
        .findElement(By.xpath("//button[contains(text(), 'Register')]"))
        .click();
      await delay(500);

      await driver.findElement(By.id("password")).sendKeys(password);

      //Submit
      await driver
        .findElement(By.xpath("//button[contains(text(), 'Register')]"))
        .click();

      await driver.wait(until.elementLocated(By.css(".text-green-500")), 10000);
      const successMessage = await driver
        .findElement(By.css(".text-green-500"))
        .getText();

      await delay(500);
      console.log(successMessage);
      console.log("Registration test passed");

      return { username, email, password };
    }

    const { username, password } = await testRegistration();
    await driver.sleep(2000);
    await testLogin(username, password, driver, baseUrl);
    await driver.sleep(2000);
    await testLogout(driver, baseUrl);

    console.log("All tests completed successfully");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

runTests();
