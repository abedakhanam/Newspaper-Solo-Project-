import fs from 'fs';
import path from 'path';
import { Article } from './models/article'; // Adjust if necessary
import { Category } from './models/category'; // Adjust if necessary
import sequelize from './models/index'; // Adjust if necessary to import your sequelize instance

const filePath = path.join(__dirname, 'dumy.txt'); // Path to your text file

// Function to get a random user ID from the list [1, 2, 3, 4]
const getRandomUserId = () => {
  const userIds = [1, 2, 3, 4];
  return userIds[Math.floor(Math.random() * userIds.length)];
};

const seedArticles = async () => {
  try {
    // Read and parse the JSON data from the file
    const data = fs.readFileSync(filePath, 'utf-8');
    const articles = JSON.parse(data);

    for (const item of articles) {
      // Assign a random user ID
      const userId = getRandomUserId();

      // Prepare the article object
      const articleData = {
        title: item.title,
        description: item.description,
        content: item.content,
        thumbnailUrl: item.image_url || 'default_thumbnail_url.png', // Use image_url or a default
        authorId: userId, // Assign the random userId
      };

      // Create the article
      const article = await Article.create(articleData);
      console.log(`Inserted article: ${article.title} by User ID: ${userId}`);

      // Handle categories
      if (item.ai_tag) {
        const tags = item.ai_tag.split(','); // Assuming ai_tag contains category names separated by commas

        for (const tag of tags) {
          // Find or create the category
          const [category, created] = await Category.findOrCreate({
            where: { name: tag.trim() }, // Use the trimmed tag name
          });

          // Associate the category with the article
          await article.addCategories(category);
          console.log(
            `Associated category: ${category.name} with article: ${article.title}`
          );
        }
      }
    }

    console.log('All articles have been seeded!');
  } catch (error) {
    console.error('Error seeding articles:', error);
  }
};

// Call the seeder function and ensure the connection is established
sequelize.sync().then(() => {
  seedArticles();
});
