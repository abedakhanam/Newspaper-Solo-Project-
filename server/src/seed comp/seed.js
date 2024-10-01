const fs = require("fs");
const path = require("path");
const { Article } = require("../models/article"); // Adjust if necessary
const { Category } = require("../models/category"); // Adjust if necessary
const sequelize = require("../models/index"); // Adjust if necessary to import your sequelize instance

const filePath = path.join(__dirname, "dumy.txt"); // Path to your text file

const seedArticles = async () => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const articles = JSON.parse(data);

    const userId = 1;

    for (const item of articles) {
      const articleData = {
        title: item.title,
        description: item.description,
        content: item.content,
        thumbnailUrl: item.image_url || "default_thumbnail_url.png",
        authorId: userId,
      };

      const article = await Article.create(articleData);
      console.log(`Inserted article: ${article.title}`);

      if (item.ai_tag) {
        const tags = item.ai_tag.split(",");

        for (const tag of tags) {
          const [category] = await Category.findOrCreate({
            where: { name: tag.trim() },
          });

          await article.addCategories(category);
          console.log(
            `Associated category: ${category.name} with article: ${article.title}`
          );
        }
      }
    }

    console.log("All articles have been seeded!");
  } catch (error) {
    console.error("Error seeding articles:", error);
  }
};

sequelize.sync().then(() => {
  seedArticles();
});
