"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const article_1 = require("./models/article"); // Adjust if necessary
const category_1 = require("./models/category"); // Adjust if necessary
const index_1 = __importDefault(require("./models/index")); // Adjust if necessary to import your sequelize instance
const filePath = path_1.default.join(__dirname, 'dumy.txt'); // Path to your text file
const seedArticles = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Read and parse the JSON data from the file
        const data = fs_1.default.readFileSync(filePath, 'utf-8');
        const articles = JSON.parse(data);
        const userId = 1; // Use the specified authorId for all articles
        for (const item of articles) {
            // Prepare the article object
            const articleData = {
                title: item.title,
                description: item.description,
                content: item.content,
                thumbnailUrl: item.image_url || 'default_thumbnail_url.png', // Use image_url or a default
                authorId: userId,
            };
            // Create the article
            const article = yield article_1.Article.create(articleData);
            console.log(`Inserted article: ${article.title}`);
            // Handle categories
            if (item.ai_tag) {
                const tags = item.ai_tag.split(','); // Assuming ai_tag contains category names separated by commas
                for (const tag of tags) {
                    // Find or create the category
                    const [category, created] = yield category_1.Category.findOrCreate({
                        where: { name: tag.trim() }, // Use the trimmed tag name
                    });
                    // Associate the category with the article
                    yield article.addCategories(category);
                    console.log(`Associated category: ${category.name} with article: ${article.title}`);
                }
            }
        }
        console.log('All articles have been seeded!');
    }
    catch (error) {
        console.error('Error seeding articles:', error);
    }
});
// Call the seeder function and ensure the connection is established
index_1.default.sync().then(() => {
    seedArticles();
});
