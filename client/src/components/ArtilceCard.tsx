import React from "react";
import { useNavigate } from "react-router-dom";
import { capitalizeWords } from "../utils/sharedFunctions";

interface ArticleCardProps {
  article: {
    id: number;
    title: string;
    description: string | null; // Make description nullable
    thumbnailUrl: string;
    createdAt: string;
    author: {
      username: string; // Include author information
    };
  };
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log(`Navigating to article with ID: ${article.id}`);
    navigate(`/articles/${article.id}`);
  };

  const getImageUrl = (url: string) => {
    return url.startsWith("http") ? url : `http://localhost:3000${url}`;
  };

  const capitalizeFirstLetter = (username: string) => {
    if (!username) return "";
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  return (
    <div
      className="card border rounded-sm overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col h-full"
      onClick={handleClick}
    >
      <div className="card-image">
        <img
          className="w-full h-48 object-cover"
          src={getImageUrl(article.thumbnailUrl || "")}
          alt={article.title || "Article Image"} // Default alt text
          title={article.title}
        />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-2xl font-bold mb-2">
          {capitalizeWords(article.title)}
        </h2>
        <p className="text-gray-600 mb-2 flex-grow overflow-hidden text-ellipsis line-clamp-3">
          {article.description || "No description available."}{" "}
          {/* Default description */}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          By: {capitalizeFirstLetter(article.author.username)}
        </p>
      </div>

      <div className="p-4 flex justify-between items-center border-t">
        <p className="text-sm text-gray-500">
          {new Date(article.createdAt).toLocaleDateString() || "Unknown date"}
        </p>
      </div>
    </div>
  );
};

export default ArticleCard;
