import { Article } from '../src/models/article';
import { Category } from '../src/models/category';
import User from '../src/models/user';
import sequelize from '../src/models/index';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';

const esClient = new ElasticsearchClient({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: '7zTXUDoF0UnWwdv1_elp', // Replace with your actual password
  },
});

const indexArticles = async (): Promise<void> => {
  try {
    await sequelize.sync();
    await esClient.ping();
    console.log('Connected to Elasticsearch.');

    const categories = await Category.findAll();
    const users = await User.findAll();
    const batchSize = 1000;
    let offset = 0;
    let moreArticles = true;

    while (moreArticles) {
      // Fetch articles in batches
      const articles = await Article.findAll({
        limit: batchSize,
        offset,
        include: [Category],
      });

      if (articles.length === 0) {
        moreArticles = false;
        break;
      }

      const body = [];

      for (const article of articles) {
        const author = users.find((user) => user.id === article.authorId);
        const authorUsername = author ? author.username : 'Unknown';

        // Handle the possibility that 'article.Categories' might be undefined
        const categoryIds = article.categories
          ? article.categories.map((cat) => cat.id)
          : [];

        body.push(
          { index: { _index: 'articles', _id: article.id.toString() } },
          {
            title: article.title,
            description: article.description,
            content: article.content,
            thumbnailUrl: article.thumbnailUrl,
            authorId: article.authorId,
            username: authorUsername,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
            categoryIds, // Empty array if no categories
          }
        );
      }

      await esClient.bulk({ refresh: true, body });
      console.log(
        `Indexed batch of ${articles.length} articles to Elasticsearch.`
      );

      offset += batchSize;
    }

    console.log('Indexing completed.');
  } catch (error) {
    console.error('Error indexing articles:', error);
  } finally {
    await sequelize.close();
    await esClient.close();
    console.log('Database and Elasticsearch connections closed.');
  }
};

// Execute the indexing process
indexArticles();
