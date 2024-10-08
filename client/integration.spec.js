import { Builder, By, Key, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let driver;
const baseUrl = "http://localhost:5173";

async function runTests() {
  try {
    // Set up Chrome WebDriver
    driver = await new Builder().forBrowser("chrome").build();

    // Test Login
    async function testLogin(username, password) {
      await driver.get(`${baseUrl}/auth`);

      // Fill out the login form
      await driver.wait(until.elementLocated(By.id("username")), 10000);
      await driver.findElement(By.id("username")).sendKeys(username);
      await driver.findElement(By.id("password")).sendKeys(password);

      // Submit the form
      await driver
        .findElement(By.xpath("//button[contains(text(), 'Login')]"))
        .click();

      // Wait for redirect to home page
      await driver.wait(until.urlIs(`${baseUrl}/`), 10000);
      console.log("Login test passed");
    }

    async function testCreateArticle() {
      await driver.get(`${baseUrl}/create-article`);

      // Fill out the article form
      await driver.findElement(By.id("title")).sendKeys("Test Article Title");
      await driver
        .findElement(By.id("description"))
        .sendKeys("This is a test article description");
      await driver
        .findElement(By.id("content"))
        .sendKeys(
          "This is the content of the test article. It can be quite long."
        );

      // Upload a thumbnail
      const thumbnailPath = path.join(__dirname, "test.jpg"); // Make sure this file exists
      await driver.findElement(By.id("thumbnail")).sendKeys(thumbnailPath);

      // Select a category (assuming there's at least one category)
      const categoryCheckbox = await driver.findElement(
        By.css('input[type="checkbox"]')
      );
      await categoryCheckbox.click();

      // Submit the form
      await driver.findElement(By.css('button[type="submit"]')).click();

      // Wait for success message
      await driver.wait(
        until.elementLocated(By.css(".Toastify__toast--success")),
        10000
      );
      const successMessage = await driver
        .findElement(By.css(".Toastify__toast--success"))
        .getText();
      console.log(successMessage); // Should log: "Article created successfully!"

      await driver.get(`${baseUrl}/`);

      console.log("Create Article test passed");
    }

    // // New test function for updating an article
    // async function testUpdateArticle() {
    //   console.log("Starting Update Article test");

    //   // Navigate to the home page
    //   await driver.get(baseUrl);
    //   console.log("Navigated to home page");

    //   // Wait for and click on the first (most recent) article
    //   await driver.wait(
    //     until.elementLocated(By.css(".grid > div:first-child")),
    //     10000
    //   );
    //   await driver.findElement(By.css(".grid > div:first-child")).click();
    //   console.log("Clicked on the first article");

    //   // Wait for the article details page to load
    //   await driver.wait(until.urlContains("/articles/"), 10000);
    //   console.log("Article details page loaded");

    //   // Wait for the Update button to be visible and clickable
    //   await driver.wait(
    //     until.elementLocated(By.xpath("//button[contains(text(), 'Update')]")),
    //     10000
    //   );
    //   await driver.wait(
    //     until.elementIsVisible(
    //       driver.findElement(By.xpath("//button[contains(text(), 'Update')]"))
    //     ),
    //     10000
    //   );
    //   console.log("Update button is visible");

    //   // Click the Update button
    //   await driver
    //     .findElement(By.xpath("//button[contains(text(), 'Update')]"))
    //     .click();
    //   console.log("Clicked Update button");

    //   // Wait for the edit page to load
    //   await driver.wait(until.urlContains("/edit"), 10000);
    //   console.log("Edit page loaded");

    //   // Update the article fields
    //   const newTitle = `Updated Title ${Date.now()}`;
    //   const newDescription = `Updated Description ${Date.now()}`;
    //   const newContent = `Updated Content ${Date.now()}`;

    //   await driver.wait(
    //     until.elementLocated(By.css('input[type="text"]')),
    //     10000
    //   );
    //   await driver.findElement(By.css('input[type="text"]')).clear();
    //   await driver.findElement(By.css('input[type="text"]')).sendKeys(newTitle);

    //   await driver
    //     .findElement(By.css('input[type="text"]:nth-of-type(2)'))
    //     .clear();
    //   await driver
    //     .findElement(By.css('input[type="text"]:nth-of-type(2)'))
    //     .sendKeys(newDescription);

    //   await driver.findElement(By.css("textarea")).clear();
    //   await driver.findElement(By.css("textarea")).sendKeys(newContent);

    //   console.log("Updated article fields");

    //   // Select a new category (if not already selected)
    //   const categoryCheckboxes = await driver.findElements(
    //     By.css('input[type="checkbox"]')
    //   );
    //   for (let checkbox of categoryCheckboxes) {
    //     if (!(await checkbox.isSelected())) {
    //       await checkbox.click();
    //       break;
    //     }
    //   }
    //   console.log("Selected a new category");

    //   // Submit the form
    //   await driver.wait(
    //     until.elementLocated(
    //       By.xpath("//button[contains(text(), 'Update Article')]")
    //     ),
    //     10000
    //   );
    //   await driver
    //     .findElement(By.xpath("//button[contains(text(), 'Update Article')]"))
    //     .click();
    //   console.log("Clicked Update Article button");

    //   // Wait for the success message
    //   await driver.wait(
    //     until.elementLocated(By.css(".Toastify__toast--success")),
    //     10000
    //   );
    //   console.log("Saw success message");

    //   // Verify that we're back on the article details page
    //   await driver.wait(until.urlContains("/articles/"), 10000);
    //   console.log("Back on article details page");

    //   // Verify the updated content
    //   const updatedTitle = await driver.findElement(By.css("h1")).getText();
    //   const updatedDescription = await driver
    //     .findElement(By.css("p.text-gray-600"))
    //     .getText();
    //   const updatedContent = await driver
    //     .findElement(By.css("div.mt-4 p"))
    //     .getText();

    //   if (
    //     updatedTitle !== newTitle ||
    //     updatedDescription !== newDescription ||
    //     updatedContent !== newContent
    //   ) {
    //     throw new Error("Article update verification failed");
    //   }

    //   console.log("Update Article test passed");
    // }

    async function testUpdateArticle() {
      console.log("Starting Update Article test");

      // Navigate to the home page
      await driver.get(baseUrl);
      console.log("Navigated to home page");

      // Wait for and click on the first (most recent) article
      await driver.wait(
        until.elementLocated(By.css(".grid > div:first-child")),
        10000
      );
      await driver.findElement(By.css(".grid > div:first-child")).click();
      console.log("Clicked on the first article");

      // Wait for the article details page to load
      await driver.wait(until.urlContains("/articles/"), 10000);
      console.log("Article details page loaded");

      // Wait for the Update button to be visible and clickable
      await driver.wait(
        until.elementLocated(By.xpath("//button[contains(text(), 'Update')]")),
        10000
      );
      await driver.wait(
        until.elementIsVisible(
          driver.findElement(By.xpath("//button[contains(text(), 'Update')]"))
        ),
        10000
      );
      console.log("Update button is visible");

      // Click the Update button
      await driver
        .findElement(By.xpath("//button[contains(text(), 'Update')]"))
        .click();
      console.log("Clicked Update button");

      // Wait for the edit page to load
      await driver.wait(until.urlContains("/edit"), 10000);
      console.log("Edit page loaded");

      // Update the article fields
      const newTitle = `Updated Title ${Date.now()}`;
      const newDescription = `Updated Description ${Date.now()}`;
      const newContent = `Updated Content ${Date.now()}`;

      // Update title, description, and content using IDs
      await driver.findElement(By.id("title")).clear();
      await driver.findElement(By.id("title")).sendKeys(newTitle);

      await driver.findElement(By.id("description")).clear();
      await driver.findElement(By.id("description")).sendKeys(newDescription);

      await driver.findElement(By.id("content")).clear();
      await driver.findElement(By.id("content")).sendKeys(newContent);

      console.log("Updated article fields");

      // Select a new category (if not already selected)
      const categoryCheckboxes = await driver.findElements(By.id("checkbox"));
      // await driver.executeScript("arguments[0].scrollIntoView();", categoryCheckboxes);
      for (let checkbox of categoryCheckboxes) {
        if (!(await checkbox.isSelected())) {
          await checkbox.click();
          break;
        }
      }
      console.log("Selected a new category");

      // Submit the form
      await driver.wait(
        until.elementLocated(
          By.xpath("//button[contains(text(), 'Update Article')]")
        ),
        10000
      );
      await driver
        .findElement(By.xpath("//button[contains(text(), 'Update Article')]"))
        .click();
      console.log("Clicked Update Article button");

      // Wait for the success message
      await driver.wait(
        until.elementLocated(By.css(".Toastify__toast--success")),
        10000
      );
      console.log("Saw success message");

      // Verify that we're back on the article details page
      await driver.wait(until.urlContains("/articles/"), 10000);
      console.log("Back on article details page");

      // Verify the updated content
      const updatedTitle = await driver.findElement(By.css("h1")).getText();
      const updatedDescription = await driver
        .findElement(By.css("p.text-gray-600"))
        .getText();
      const updatedContent = await driver
        .findElement(By.css("div.mt-4 p"))
        .getText();

      if (
        updatedTitle !== newTitle ||
        updatedDescription !== newDescription ||
        updatedContent !== newContent
      ) {
        throw new Error("Article update verification failed");
      }

      console.log("Update Article test passed");
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
    await driver.sleep(2000);
    await testLogin("abeda", "1234");
    await driver.sleep(2000);
    await testCreateArticle();
    await driver.sleep(2000);
    await testUpdateArticle();
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

runTests();
