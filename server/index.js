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
const express_1 = __importDefault(require("express"));
const models_1 = __importDefault(require("./src/models")); // Import the initialized Sequelize instance
const cors = require('cors');
const path_1 = __importDefault(require("path"));
// Import route files
const userRoutes_1 = __importDefault(require("./src/routes/userRoutes"));
const commentRoutes_1 = __importDefault(require("./src/routes/commentRoutes"));
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const articleRoutes_1 = __importDefault(require("./src/routes/articleRoutes"));
const categoryRoutes_1 = __importDefault(require("./src/routes/categoryRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware to parse JSON requests
app.use(express_1.default.json());
// Enable CORS for all routes
app.use(cors());
// Serve static files from the uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Your API routes go here
app.get('/', (req, res) => {
    res.send('Hello World');
});
// Use route files
app.use('/api', userRoutes_1.default); // Routes for user-related operations
app.use('/api', commentRoutes_1.default); // Routes for comment-related operations
app.use('/api', authRoutes_1.default); // Routes for authentication operations
app.use('/api', articleRoutes_1.default); // Routes for article-related operations
app.use('/api', categoryRoutes_1.default); // Routes for category-related operations
// Connect to the database and start the server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield models_1.default.authenticate();
        console.log('Database connection has been established successfully.');
        // Sync models with the database
        yield models_1.default.sync({ force: false }); // force: true will drop the tables on each start
        console.log('Models synced with the database.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});
startServer();
