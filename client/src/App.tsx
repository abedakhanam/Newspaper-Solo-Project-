import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import AuthForm from "./pages/AuthFrom"; // Fixed the import typo
import { AuthProvider } from "./contexts/AuthContext";
import CreateArticle from "./pages/CreateArticle";
import ArticleDetails from "./pages/ArticleDetails"; // Fixed the import typo
import Categories from "./components/Categories";
import MyArticles from "./pages/MyArticles";
import EditArticle from "./components/EditArticle";
import RecommendedArticles from "./pages/RecommendedArticles"; // Fixed the import typo
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";

function App() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1); // Added currentPage state

  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-neutral font-garamond">
          <Navbar setSearchQuery={setSearchQuery} searchQuery={searchQuery} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home searchQuery={searchQuery} />} />
              <Route path="/articles/:id" element={<ArticleDetails />} />
              <Route path="/auth" element={<AuthForm />} />
              <Route
                path="/categories/:id"
                element={
                  <Categories searchQuery={searchQuery} page={currentPage} />
                }
              />
              <Route path="/create-article" element={<CreateArticle />} />
              <Route
                path="/my-articles"
                element={<MyArticles searchQuery={searchQuery} />}
              />
              <Route path="/articles/:id/edit" element={<EditArticle />} />
              <Route
                path="/recommended-articles"
                element={<RecommendedArticles searchQuery={searchQuery} />} // Fixed the import typo
              />
            </Routes>
          </main>
        </div>
      </Router>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
