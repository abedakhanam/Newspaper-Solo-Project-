import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { fetchWithCache } from "../utils/apiFetcher";

interface Category {
  id: number;
  name: string;
}

const EditArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchWithCache(
          "http://localhost:3000/api/categories"
        );
        // if (!response.ok) {
        //   console.error("Failed to fetch categories:", response.statusText);
        //   return;
        // }
        // const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchArticle = async () => {
      try {
        const data = await fetchWithCache(
          `http://localhost:3000/api/articles/${id}`
        );
        // if (!response.ok) {
        //   console.error('Failed to fetch article:', response.statusText);
        //   return;
        // }
        // const data = await response.json();
        setArticle(data.article); // Access the article directly from the response
        setTitle(data.article.title || "");
        setDescription(data.article.description || "");
        setContent(data.article.content || "");

        // Extracting category IDs from the article's categories
        const categoryIds = data.article.categories.map(
          (category: { id: number }) => category.id
        );
        setSelectedCategories(categoryIds); // Setting selected categories
      } catch (error) {
        console.error("Error fetching article:", error);
      }
    };

    fetchCategories();
    fetchArticle();
  }, [id]);

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to edit an article.");
      return;
    }

    const formData = new FormData();
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);
    if (content) formData.append("content", content);
    if (selectedCategories.length > 0) {
      selectedCategories.forEach((categoryId) => {
        formData.append("categoryIds[]", String(categoryId)); // Append each categoryId individually
      });
    }
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      const response = await fetch(`http://localhost:3000/api/articles/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
        throw new Error("Failed to update article");
      }

      toast.success("Article updated successfully!");
      navigate(`/articles/${id}`);
    } catch (error) {
      console.error("Error updating article:", error);
      toast.error("Failed to update article.");
    }
  };

  if (!article) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Edit Article</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-sm"
            rows={5}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Thumbnail</label>
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files) {
                setThumbnail(e.target.files[0]);
              }
            }}
            className="w-full p-2 border border-gray-300 rounded-sm"
          />
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="hidden"
                />
                <span
                  className={`inline-block cursor-pointer px-3 py-1 rounded-sm border border-gray-300
                    ${
                      selectedCategories.includes(category.id)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                >
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition"
          >
            Update Article
          </button>
          <button
            type="button"
            onClick={() => navigate(`/articles/${id}`)}
            className="p-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditArticle;
