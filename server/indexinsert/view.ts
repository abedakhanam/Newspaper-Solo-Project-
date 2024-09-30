import { Sequelize } from 'sequelize';
import { Client } from '@elastic/elasticsearch';
import VisitorActivity from '../src/models/VisitorActivity'; // Import your VisitorActivity model

// Set up the Elasticsearch client
const esClient = new Client({ node: 'http://localhost:9200' });

// Set up Sequelize and connect to your database
const sequelize = new Sequelize('newspaper_db', 'postgres', 'pc9874', {
  host: 'localhost',
  dialect: 'postgres', // Use the appropriate dialect for your database
  logging: false, // Disable logging for cleaner output (optional)
});

// Initialize the VisitorActivity model
VisitorActivity.initialize(sequelize);

// Function to authenticate and sync the database
async function initializeDatabase() {
  try {
    // Authenticate the database connection
    await sequelize.authenticate();
    console.log('Connected to the database.');

    // Sync the models with the database
    await sequelize.sync(); // This will create/update the table structure if necessary
    console.log('Database synced.');
  } catch (error) {
    console.error('Error initializing the database:', error);
  }
}

// Function to update view counts in Elasticsearch
async function updateViewCounts() {
  try {
    // First authenticate the Sequelize connection
    await sequelize.authenticate();
    console.log('Connected to the database for updating views.');

    // Fetch all visitor activities from the database
    const visitorActivities = await VisitorActivity.findAll();

    if (!visitorActivities || visitorActivities.length === 0) {
      console.log('No visitor activities found.');
      return;
    }

    // Prepare bulk operations for Elasticsearch
    const bulkOps = [];

    for (const activity of visitorActivities) {
      const { articleId, visitorId, viewCount, lastViewedAt } = activity;

      // Add Elasticsearch bulk update operation
      bulkOps.push(
        {
          update: { _index: 'articles', _id: articleId.toString() }, // Assuming 'articleId' is the document ID
        },
        {
          script: {
            source: `
              if (ctx._source.views != null) {
                def found = false;
                for (view in ctx._source.views) {
                  if (view.userId == params.visitorId) {
                    view.viewCount += params.viewCount;
                    view.lastViewedAt = params.lastViewedAt;
                    found = true;
                    break;
                  }
                }
                if (!found) {
                  ctx._source.views.add(params.newView);
                }
              } else {
                ctx._source.views = [params.newView];
              }
            `,
            params: {
              visitorId,
              viewCount,
              lastViewedAt,
              newView: {
                userId: visitorId,
                viewCount,
                lastViewedAt,
              },
            },
          },
        }
      );
    }

    // Send bulk update request to Elasticsearch
    const bulkResponse = await esClient.bulk({
      refresh: true,
      body: bulkOps,
    });

    if (bulkResponse.errors) {
      console.error('Bulk update errors:', bulkResponse.errors);
    } else {
      console.log('View counts successfully updated in Elasticsearch.');
    }
  } catch (error) {
    console.error('Error updating view counts:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

// Execute the database initialization and then update Elasticsearch
(async function main() {
  await initializeDatabase(); // Initialize the database connection
  await updateViewCounts(); // Update the view counts in Elasticsearch
})();
