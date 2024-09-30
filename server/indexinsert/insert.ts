// seedData.ts
import { Article, ArticleCreationAttributes } from '../src/models/article';
import { Category } from '../src/models/category';
import User from '../src/models/user';
import { faker } from '@faker-js/faker';
import sequelize from '../src/models/index';

const seedArticles = async (): Promise<void> => {
  try {
    await sequelize.sync();

    const categories = await Category.findAll();
    const users = await User.findAll();
    const articlesToInsert: ArticleCreationAttributes[] = [];
    const batchSize = 1000;
    const userIds = users.map((user) => user.id);

    // Generate and insert articles (modify count as needed)
    for (let i = 0; i < 10000; i++) {
      const articleData: ArticleCreationAttributes = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        content: faker.lorem.paragraphs(3),
        thumbnailUrl: `https://picsum.photos/seed/${Math.random()
          .toString(36)
          .substr(2, 9)}/400/300`,
        authorId: userIds[Math.floor(Math.random() * userIds.length)],
      };

      articlesToInsert.push(articleData);

      if (articlesToInsert.length >= batchSize) {
        const insertedArticles = await Article.bulkCreate(articlesToInsert);
        console.log(`Inserted batch of ${batchSize} articles.`);

        // Assign random categories
        for (const article of insertedArticles) {
          const randomCategories = categories
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3) + 1);
          await article.setCategories(randomCategories);
        }

        articlesToInsert.length = 0; // Clear for next batch
      }
    }

    console.log('Data insertion completed.');
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

// Execute the seeding process
seedArticles();
