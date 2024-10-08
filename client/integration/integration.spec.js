import { Builder, By, Key, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { delay, testLogin, testLogout } from "./helperfunctions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let driver;
const baseUrl = "http://localhost:5173";

async function runTests() {
  try {
    // Set up Chrome WebDriver
    driver = await new Builder().forBrowser("chrome").build();

    async function testCreateArticle() {
      await driver.get(`${baseUrl}/`);

      const popoverButton = await driver.findElement(By.css(".popoverbutton"));
      await popoverButton.click();
      await delay(500);

      const createArticleLink = await driver.findElement(
        By.linkText("Create Article")
      );
      await createArticleLink.click();
      await delay(1000);

      // Submit the form
      await driver.findElement(By.css('button[type="submit"]')).click();
      await delay(500);

      await driver.findElement(By.id("title")).sendKeys("Test Article Title");

      await driver.findElement(By.css('button[type="submit"]')).click();
      await delay(1000);

      await driver
        .findElement(By.id("description"))
        .sendKeys("This is a test article description");

      await driver.findElement(By.css('button[type="submit"]')).click();
      await delay(1000);

      await driver
        .findElement(By.id("content"))
        .sendKeys(
          "This is the content of the test article. It can be quite long."
        );

      // Upload a thumbnail
      const thumbnailPath = path.join(__dirname, "test.jpg");
      await driver.findElement(By.id("thumbnail")).sendKeys(thumbnailPath);

      await delay(500);

      // Select a category
      const categoryCheckbox = await driver.findElement(
        By.css('input[type="checkbox"]')
      );
      await categoryCheckbox.click();

      await delay(1000);

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
      console.log(successMessage);

      await delay(1000);

      await driver.get(`${baseUrl}/`);

      console.log("Create Article test passed");
    }

    //update article
    async function testUpdateArticle() {
      await driver.get(`${baseUrl}/`);
      // console.log("Navigated to home page");

      // Wait for the first article
      const firstArticle = await driver.findElement(
        By.css(".grid > div:first-child")
      );
      await firstArticle.click();
      // console.log("Clicked on the first article");

      await driver.wait(
        until.elementLocated(By.xpath("//button[contains(text(), 'Update')]")),
        10000
      );
      await delay(1000);
      await driver
        .findElement(By.xpath("//button[contains(text(), 'Update')]"))
        .click();
      // console.log("Clicked Update button");

      // Wait for the edit page to load
      await driver.wait(until.urlContains("/edit"), 10000);
      // console.log("Navigated to edit page");

      // Update the title field
      const titleField = await driver.findElement(By.id("title"));
      await titleField.clear(); // Clear the existing value
      await titleField.sendKeys("Updated Test Article Title");

      await delay(1000);

      // Update the description field
      const descriptionField = await driver.findElement(By.id("description"));
      await descriptionField.clear();
      await descriptionField.sendKeys(
        "Updated description for the test article"
      );

      await delay(1000);

      // Update the content field
      const contentField = await driver.findElement(By.id("content"));
      await contentField.clear();
      await contentField.sendKeys(
        "Updated content for the test article. This content can be quite long."
      );

      await delay(1000);

      // Update the thumbnail image
      const thumbnailPath = path.join(__dirname, "mobile_data.jpg"); // Make sure this file exists
      const thumbnailInput = await driver.findElement(By.id("thumbnail"));
      await thumbnailInput.sendKeys(thumbnailPath);

      await delay(1000);

      // Update categories if needed
      const categoryCheckbox = await driver.findElement(
        By.css('input[type="checkbox"]')
      );
      if (!(await categoryCheckbox.isSelected())) {
        await categoryCheckbox.click();
      }

      await driver.findElement(By.css('button[type="submit"]')).click();

      await driver.wait(
        until.elementLocated(By.css(".Toastify__toast--success")),
        10000
      );
      const successMessage = await driver
        .findElement(By.css(".Toastify__toast--success"))
        .getText();
      console.log(successMessage);

      await delay(500);
      // await driver.navigate().refresh();
      // await delay(1000);
      console.log("Update Article test passed");
    }

    //delete article
    async function testDeleteArticle() {
      console.log("Starting delete Article test");

      await driver.get(`${baseUrl}/`);
      console.log("Navigated to home page");

      await driver.wait(
        until.elementLocated(By.css(".grid > div:first-child")),
        10000
      );

      // Click on the first article
      const firstArticle = await driver.findElement(
        By.css(".grid > div:first-child")
      );
      await firstArticle.click();
      console.log("Clicked on the first article");

      await delay(1000);

      //article details page to load
      await driver.wait(until.urlContains("/articles/"), 10000);
      const articleUrlBeforeDelete = await driver.getCurrentUrl();
      const articleIdBeforeDelete = articleUrlBeforeDelete.split("/").pop();
      console.log("Loaded article with ID:", articleIdBeforeDelete);

      const deleteButton = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(text(), 'Delete')]")),
        10000
      );
      await deleteButton.click();
      console.log("Clicked the 'Delete' button");

      await delay(1000);

      const confirmButton = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(text(), 'Confirm')]")),
        10000
      );
      await confirmButton.click();
      console.log("Confirmed article deletion");

      await driver.wait(
        until.elementLocated(By.css(".Toastify__toast--success")),
        10000
      );
      console.log("Delete success toast displayed");

      await driver.wait(until.urlIs(`${baseUrl}/`), 10000);
      await driver.navigate().refresh();
      console.log("Redirected back to the homepage");

      // // Click on the first article again
      // const firstArticleAfterDelete = await driver.findElement(
      //   By.css(".grid > div:first-child")
      // );
      // await firstArticleAfterDelete.click();
      // console.log("Clicked on the first article after deletion");

      // // Wait for the article details page to load
      // await driver.wait(until.urlContains("/articles/"), 10000);
      // const articleUrlAfterDelete = await driver.getCurrentUrl();
      // const articleIdAfterDelete = articleUrlAfterDelete.split("/").pop();

      // // Compare the article IDs before and after deletion
      // if (articleIdBeforeDelete !== articleIdAfterDelete) {
      //   console.log(
      //     `Article successfully deleted. New article ID is ${articleIdAfterDelete}`
      //   );
      // } else {
      //   console.log("Article was not deleted. The same article still exists.");
      // }
    }

    await driver.sleep(2000);
    await testLogin("abeda", "1234", driver, baseUrl);
    await driver.sleep(2000);
    await testCreateArticle();
    await driver.sleep(2000);
    await testUpdateArticle();
    await driver.sleep(2000);
    await testDeleteArticle();
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

// async function testCreateArticle() {
//   await driver.get(`${baseUrl}/`);

//   const popoverButton = await driver.findElement(By.css(".popoverbutton"));
//   await popoverButton.click();
//   await delay(500);

//   const createArticleLink = await driver.findElement(
//     By.linkText("Create Article")
//   );
//   await createArticleLink.click();
//   await delay(1000);

//   // Submit the form
//   await driver.findElement(By.css('button[type="submit"]')).click();
//   await delay(500);

//   await driver.findElement(By.id("title")).sendKeys("Test Article Title");

//   await driver.findElement(By.css('button[type="submit"]')).click();
//   await delay(1000);

//   await driver
//     .findElement(By.id("description"))
//     .sendKeys("This is a test article description");

//   await driver.findElement(By.css('button[type="submit"]')).click();
//   await delay(1000);

//   await driver
//     .findElement(By.id("content"))
//     .sendKeys(
//       "This is the content of the test article. It can be quite long."
//     );

//   // Upload a thumbnail
//   const thumbnailPath = path.join(__dirname, "test.jpg"); // Make sure this file exists
//   await driver.findElement(By.id("thumbnail")).sendKeys(thumbnailPath);

//   await delay(500);

//   // Select a category (assuming there's at least one category)
//   const categoryCheckbox = await driver.findElement(
//     By.css('input[type="checkbox"]')
//   );
//   await categoryCheckbox.click();

//   await delay(1000);

//   // Submit the form
//   await driver.findElement(By.css('button[type="submit"]')).click();

//   // Wait for success message
//   await driver.wait(
//     until.elementLocated(By.css(".Toastify__toast--success")),
//     10000
//   );
//   const successMessage = await driver
//     .findElement(By.css(".Toastify__toast--success"))
//     .getText();
//   console.log(successMessage); // Should log: "Article created successfully!"

//   await delay(1000);

//   await driver.get(`${baseUrl}/`);

//   console.log("Create Article test passed");
// }
