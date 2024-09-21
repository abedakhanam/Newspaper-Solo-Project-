import { Article, ArticleCreationAttributes } from './models/article';
import { Category } from './models/category'; // Ensure correct path
import { faker } from '@faker-js/faker';
import sequelize from './models'; // Adjust according to your setup

const seedArticles = async (): Promise<void> => {
  try {
    await sequelize.sync(); // Ensure models are synced

    const categories = await Category.findAll();
    const categoryIds = categories.map((category) => category.id); // Get existing category IDs

    const articlesToInsert: ArticleCreationAttributes[] = [];
    const batchSize = 1000; // Adjust batch size as needed
    const authorIds = [1, 2, 4]; // Author IDs to be used

    for (let i = 0; i < 1000000; i++) {
      const articleData: ArticleCreationAttributes = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        content: faker.lorem.paragraphs(3),
        thumbnailUrl: `https://picsum.photos/seed/${faker.string.alphanumeric(
          10
        )}/400/300`,
        authorId: authorIds[Math.floor(Math.random() * authorIds.length)], // Randomly select an author ID
      };

      // Randomly select categories to associate with the article
      const randomCategoryCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 random categories
      const randomCategoryIds = faker.helpers
        .shuffle(categoryIds)
        .slice(0, randomCategoryCount);

      articlesToInsert.push(articleData);

      // Insert article categories (if you have a method to associate them)
      // After you create the article, you can associate categories here if needed

      // Check if we need to insert a batch of articles
      if (articlesToInsert.length >= batchSize) {
        await Article.bulkCreate(articlesToInsert);
        console.log(`Inserted batch of ${batchSize} articles.`);
        articlesToInsert.length = 0; // Reset for the next batch
      }
    }

    // Insert any remaining articles
    if (articlesToInsert.length) {
      await Article.bulkCreate(articlesToInsert);
      console.log(
        `Inserted final batch of ${articlesToInsert.length} articles.`
      );
    }

    console.log('Seeding completed.');
  } catch (error) {
    console.error('Error seeding articles:', error);
  } finally {
    await sequelize.close(); // Ensure you close the connection
  }
};

seedArticles();
