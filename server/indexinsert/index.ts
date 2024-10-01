import { Article } from "../src/models/article";
import { Category } from "../src/models/category";
import User from "../src/models/user";
import sequelize from "../src/models/index";
import { Client as ElasticsearchClient } from "@elastic/elasticsearch";
import https from "https"; // Import https for agent configuration

// Set up Elasticsearch client
const esClient = new ElasticsearchClient({
  node: "https://localhost:9200",
  auth: {
    username: "elastic",
    password: "cmSUa+=J61MaYudG_TiL", // Replace with your actual password
  },
  // Setting up agent to handle self-signed certificates
  tls: {
    rejectUnauthorized: false, // Accept self-signed certificates
  },
});

const indexArticles = async (): Promise<void> => {
  try {
    await sequelize.sync();
    await esClient.ping();
    console.log("Connected to Elasticsearch.");

    const users = await User.findAll();
    const batchSize = 1000;
    let offset = 0;
    let moreArticles = true;

    while (moreArticles) {
      // Fetch articles in batches
      const articles = await Article.findAll({
        limit: batchSize,
        offset,
        include: [
          {
            model: Category,
            as: "categories", // Use the alias defined in the association
          },
        ],
      });

      if (articles.length === 0) {
        moreArticles = false;
        break;
      }

      const body = [];

      for (const article of articles) {
        const author = users.find((user) => user.id === article.authorId);
        const authorUsername = author ? author.username : "Unknown";

        // Handle category IDs
        const categoryIds = article.categories
          ? article.categories.map((cat) => cat.id)
          : [];

        body.push(
          { index: { _index: "articles", _id: article.id.toString() } },
          {
            title: article.title,
            description: article.description,
            content: article.content,
            thumbnailUrl: article.thumbnailUrl,
            authorId: article.authorId,
            username: authorUsername,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
            categoryIds, // Array of category IDs
          }
        );
      }

      await esClient.bulk({ refresh: true, body });
      console.log(
        `Indexed batch of ${articles.length} articles to Elasticsearch.`
      );

      offset += batchSize;
    }

    console.log("Indexing completed.");
  } catch (error) {
    console.error("Error indexing articles:", error);
  } finally {
    await sequelize.close();
    await esClient.close();
    console.log("Database and Elasticsearch connections closed.");
  }
};

// Execute the indexing process
indexArticles();
