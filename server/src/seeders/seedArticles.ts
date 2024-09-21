import { Article, ArticleCreationAttributes } from '../models/article';
import { Category } from '../models/category';
import { faker } from '@faker-js/faker';
import sequelize from '../models/index';

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
        authorId: authorIds[Math.floor(Math.random() * authorIds.length)],
      };

      articlesToInsert.push(articleData);

      // Insert in batches
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
