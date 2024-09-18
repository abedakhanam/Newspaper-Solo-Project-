import { Article, ArticleCreationAttributes } from '../models/article';
import { Category } from '../models/category'; // Ensure correct path
import { faker } from '@faker-js/faker';

import sequelize from '../models/index'; // Adjust according to your setup

const seedArticles = async (): Promise<void> => {
  try {
    await sequelize.sync(); // Ensure models are synced

    const categories = await Category.findAll();
    const categoryIds = categories.map((category) => category.id); // Get existing category IDs

    for (let i = 0; i < 100; i++) {
      const articleData: ArticleCreationAttributes = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        content: faker.lorem.paragraphs(3),
        thumbnailUrl: `https://picsum.photos/seed/${faker.string.alphanumeric(
          10
        )}/400/300`, // Use alphaNumeric for a random string
        authorId: 1, // Replace with a valid author ID
      };

      const article = await Article.create(articleData);

      // Randomly select categories to associate with the article
      const randomCategoryCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 random categories
      const randomCategoryIds = faker.helpers
        .shuffle(categoryIds)
        .slice(0, randomCategoryCount);

      // Fetch the Category instances based on the selected IDs
      const randomCategories = await Category.findAll({
        where: {
          id: randomCategoryIds,
        },
      });

      await article.setCategories(randomCategories); // Associate categories with the article
      console.log(`Inserted article ${i + 1}: ${article.title}`);
    }

    console.log('Seeding completed.');
  } catch (error) {
    console.error('Error seeding articles:', error);
  } finally {
    await sequelize.close(); // Ensure you close the connection
  }
};

seedArticles();
