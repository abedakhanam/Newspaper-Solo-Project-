// // only indexing from db
// import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
// import { Client as PgClient } from 'pg';

// interface Article {
//   id: number;
//   title: string;
//   description: string;
//   content: string;
//   thumbnailUrl?: string;
//   authorId: number;
//   createdAt: Date;
//   updatedAt: Date;
//   username?: string;
//   CategoryId?: number;
//   categoryName?: string;
// }

// // Initialize Elasticsearch client with authentication
// const esClient = new ElasticsearchClient({
//   node: 'http://localhost:9200',
//   auth: {
//     username: 'elastic',
//     password: '7zTXUDoF0UnWwdv1_elp', // Change this to your actual password
//   },
// });

// // Initialize PostgreSQL client
// const pgClient = new PgClient({
//   user: 'postgres', // Change this to your actual user
//   host: 'localhost',
//   database: 'newspaper_db', // Change this to your actual database
//   password: 'pc9874', // Change this to your actual password
//   port: 5432,
// });

// const BATCH_SIZE = 10000;

// async function run(): Promise<void> {
//   try {
//     await pgClient.connect();
//     await esClient.ping();
//     console.log('Connected to PostgreSQL and Elasticsearch.');

//     const totalCountResult = await pgClient.query(
//       'SELECT COUNT(*) FROM articles'
//     );
//     const totalCount = parseInt(totalCountResult.rows[0].count, 10);
//     console.log(`Total articles to process: ${totalCount}`);

//     for (let offset = 0; offset < totalCount; offset += BATCH_SIZE) {
//       console.log(`Fetching articles from offset ${offset}`);
//       const res = await pgClient.query<Article>(
//         `
//         SELECT
//           a.id,
//           a.title,
//           a.description,
//           a.content,
//           a."thumbnailUrl",
//           a."authorId",
//           a."createdAt",
//           a."updatedAt",
//           u.username,
//           ac."CategoryId",
//           c.name AS categoryName
//         FROM articles a
//         LEFT JOIN users u ON a."authorId" = u.id
//         LEFT JOIN "ArticleCategories" ac ON a.id = ac."ArticleId"
//         LEFT JOIN categories c ON ac."CategoryId" = c.id
//         LIMIT $1 OFFSET $2
//       `,
//         [BATCH_SIZE, offset]
//       );

//       const articles: Article[] = res.rows;
//       console.log(`Fetched ${articles.length} articles.`);

//       if (articles.length > 0) {
//         const body = articles.flatMap((article) => {
//           console.log(
//             `Preparing to index article ID: ${article.id}, Title: ${article.title}`
//           );
//           return [
//             { index: { _index: 'articles', _id: article.id.toString() } },
//             {
//               title: article.title,
//               description: article.description,
//               content: article.content,
//               thumbnailUrl: article.thumbnailUrl,
//               authorId: article.authorId,
//               username: article.username || 'Unknown',
//               createdAt: article.createdAt,
//               updatedAt: article.updatedAt,
//               categoryId: article.CategoryId,
//               categoryName: article.categoryName || 'Uncategorized',
//             },
//           ];
//         });

//         console.log('Bulk insert body:', JSON.stringify(body, null, 2));

//         let bulkResponse;
//         let retries = 3;
//         while (retries > 0) {
//           try {
//             bulkResponse = await esClient.bulk({
//               refresh: true,
//               body,
//             });

//             if (bulkResponse.errors) {
//               console.error('Errors occurred during bulk insert:');
//               bulkResponse.items.forEach((item: any) => {
//                 if (item.index && item.index.error) {
//                   console.error(
//                     `Failed to index document ${item.index._id}: ${item.index.error}`
//                   );
//                 }
//               });
//             } else {
//               console.log(`Inserted ${articles.length} articles.`);
//             }
//             break;
//           } catch (bulkError) {
//             console.error('Error during bulk insert:', bulkError);
//             retries--;
//             if (retries === 0) {
//               console.error('Max retries reached for bulk insert.');
//             }
//           }
//         }
//       } else {
//         console.log('No more articles to process.');
//         break;
//       }
//     }

//     try {
//       const finalCount = await esClient.count({ index: 'articles' });
//       console.log(`Final count in Elasticsearch: ${finalCount.count || 0}`);
//     } catch (error) {
//       console.error('Error during final count:', error);
//     }
//   } catch (error) {
//     console.error('Error occurred:', error);
//   } finally {
//     await pgClient.end();
//     console.log('Database connection closed.');
//   }
// }

// run().catch(console.error);

//new sfresh script
import { Article, ArticleCreationAttributes } from "../src/models/article";
import { Category } from "../src/models/category";
import User from "../src/models/user";
import { faker } from "@faker-js/faker";
import sequelize from "../src/models/index";
import { Client as ElasticsearchClient } from "@elastic/elasticsearch";

const esClient = new ElasticsearchClient({
  node: "http://localhost:9200",
  auth: {
    username: "elastic",
    password: "cmSUa+=J61MaYudG_TiL", // Replace with your actual password
  },
});

const seedArticles = async (): Promise<void> => {
  try {
    await sequelize.sync();
    await esClient.ping();
    console.log("Connected to Elasticsearch.");

    const categories = await Category.findAll();
    const users = await User.findAll();
    const articlesToInsert: ArticleCreationAttributes[] = [];
    const batchSize = 1000;

    const userIds = users.map((user) => user.id);

    // Generate and insert 2000 articles
    for (let i = 0; i < 1000; i++) {
      const articleData: ArticleCreationAttributes = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        content: faker.lorem.paragraphs(3),
        thumbnailUrl: `https://picsum.photos/seed/${Math.random()
          .toString(36)
          .substr(2, 9)}/400/300`,
        authorId: userIds[Math.floor(Math.random() * userIds.length)], // Random user from available users
      };

      articlesToInsert.push(articleData);

      // Insert articles in batches
      if (articlesToInsert.length >= batchSize) {
        const insertedArticles = await Article.bulkCreate(articlesToInsert);
        console.log(`Inserted batch of ${batchSize} articles.`);

        // Prepare the data for Elasticsearch indexing
        const body = [];

        // Associate each article with 1 to 3 random categories
        for (const article of insertedArticles) {
          const randomCategories = categories
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3) + 1); // Select 1 to 3 categories randomly

          // Set categories for the article
          await article.setCategories(randomCategories);

          // Collect category IDs
          const categoryIds = randomCategories.map((cat) => cat.id);

          // Get the author's username
          const author = users.find((user) => user.id === article.authorId);
          const authorUsername = author ? author.username : "Unknown";

          // Add the article and its associated categories to the body
          body.push(
            { index: { _index: "articles", _id: article.id.toString() } },
            {
              title: article.title,
              description: article.description,
              content: article.content,
              thumbnailUrl: article.thumbnailUrl,
              authorId: article.authorId,
              username: authorUsername, // Include the author's username
              createdAt: article.createdAt,
              updatedAt: article.updatedAt,
              categoryIds: categoryIds, // Include category IDs
            }
          );
        }

        // Index the articles in Elasticsearch
        await esClient.bulk({ refresh: true, body });
        articlesToInsert.length = 0; // Reset for the next batch
      }
    }

    console.log("Seeding completed.");
  } catch (error) {
    console.error("Error seeding articles:", error);
  } finally {
    await sequelize.close();
    await esClient.close();
    console.log("Database and Elasticsearch connections closed.");
  }
};

// Execute the seeding process
seedArticles();
