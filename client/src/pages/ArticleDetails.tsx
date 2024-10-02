import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
// import { io } from 'socket.io-client';
import { fetchWithCache } from "../utils/apiFetcher";
import { capitalizeWords, formatDateString } from "../utils/sharedFunctions";
interface User {
  id: number; // or string, depending on your implementation
  username: string;
}

interface Article {
  id: number;
  title: string;
  description: string;
  content: string;
  createdAt: string;
  thumbnailUrl?: string;
  author: {
    username: string;
  };
  articleComments: Array<{
    id: number;
    content: string;
    createdAt: string;
    User: {
      username: string;
    };
  }>;
  categories: Array<{
    id: number;
    name: string;
  }>;
  clickCount: number;
}

interface RelatedArticle {
  id: number;
  title: string;
  description: string;
  thumbnailUrl?: string;
  createdAt: string;
  author: {
    username: string;
  };
}

// interface ApiResponse {
//   article: Article;
//   relatedArticles: RelatedArticle[];
// }

const ArticleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const currentUrl = location.pathname;
  const { user } = useAuth() as { user: User | null };
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const commentRef = useRef<HTMLTextAreaElement>(null);
  // const socket = useRef<any>(null);
  const fetchArticle = async () => {
    setLoading(true);
    try {
      const data = await fetchWithCache(
        `http://localhost:3000/api/articles/${id}`
      );
      // if (!response.ok) throw new Error('Network response was not ok');
      // console.log('article details page ');
      // const data: ApiResponse = await response.json();
      setArticle(data.article);
      setRelatedArticles(data.relatedArticles);
    } catch (error) {
      console.error("Error fetching article details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize socket connection when the component mounts
    // socket.current = io('http://localhost:3000'); // <--- Initialize socket

    fetchArticle();

    // Cleanup socket connection when the component unmounts
    // return () => {
    //   socket.current.disconnect(); // <--- Cleanup on unmount
    // };
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to comment.");
      // console.log(`currentUrl : ${currentUrl}`);
      navigate("/auth?currentUrl=" + currentUrl);
      return;
    }

    if (comment == "") {
      toast.error("Cannot submit empty comment");
      return;
    }

    const url = editCommentId
      ? `http://localhost:3000/api/comments/${editCommentId}`
      : `http://localhost:3000/api/articles/${id}/comments`;

    const method = editCommentId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) {
        throw new Error(
          editCommentId
            ? "Failed to update comment"
            : "Failed to create comment"
        );
      }

      setComment("");
      setEditCommentId(null);
      fetchArticle();
      toast.success(
        editCommentId
          ? "Comment updated successfully!"
          : "Comment created successfully!"
      );

      if (commentRef.current) {
        commentRef.current.focus();
      }
    } catch (error) {
      console.error("Error handling comment:", error);
      setError(
        editCommentId
          ? "Failed to update comment."
          : "Failed to create comment."
      );
    }
  };

  const handleEditComment = (commentId: number, currentContent: string) => {
    setEditCommentId(commentId);
    setComment(currentContent);
    if (commentRef.current) {
      commentRef.current.focus();
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/comments/${commentToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete comment");

      toast.success("Comment deleted successfully!");
      fetchArticle();
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError("Failed to delete comment.");
    } finally {
      setIsModalOpen(false);
      setCommentToDelete(null);
    }
  };

  const handleDeleteArticle = async () => {
    if (!user) {
      setError("You must be logged in to delete this article.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/articles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete article");
      } else {
        toast.success("Article deleted successfully!");
        setTimeout(() => {
          navigate("/"); // Navigate to home page
        }, 1000);
      }

      // Emit socket event to notify about article deletion
      // socket.current.emit("articleDeleted", id);

      // Show success toast
      // toast.success("Article deleted successfully!");

      // Delay navigation to allow toast to be visible
      // setTimeout(() => {
      //   navigate("/"); // Navigate to home page
      // }, 2000); // 2000 ms = 2 seconds
    } catch (error: any) {
      console.error("Error deleting article:", error);
      setError(error.message || "Failed to delete article.");
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleCancelEdit = () => {
    setEditCommentId(null);
    setComment("");
    if (commentRef.current) {
      commentRef.current.focus();
    }
  };

  const getImageUrl = (url: string) => {
    return url && url.startsWith("http") ? url : `http://localhost:3000${url}`;
  };

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (!article)
    return <p className="text-center text-gray-600">Article not found</p>;

  const isAuthor = user && user.username === article.author.username;
  const capitalizeFirstLetter = (username: any) => {
    if (!username) return "";
    return capitalizeWords(username);
  };
  return (
    <div className="flex flex-col lg:flex-row p-4 max-w-screen-xl mx-auto">
      <ToastContainer autoClose={1000} />
      <div className="lg:w-1/4 p-6 bg-neutral-200 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Author</h2>
        <p className="text-gray-600 text-sm mb-4">
          <strong className="text-gray-900">
            {capitalizeFirstLetter(article.author.username)}
          </strong>
        </p>

        <h2 className="text-xl font-bold text-gray-800 mb-1">Published On</h2>
        <p className="text-gray-600 italic mb-4">
          {formatDateString(article.createdAt)}
        </p>

        <h2 className="text-xl font-bold text-gray-800 mb-1">Views</h2>
        <p className="text-gray-600 italic flex items-center">
          {article.clickCount} views
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 ml-1 text-gray-600" // Adjust size and color as needed
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A7.963 7.963 0 0012 19a7.963 7.963 0 00-1.875-.175M12 15.5c1.75 0 3.25-1.375 3.25-3.5S13.75 8.5 12 8.5 8.75 9.875 8.75 12s1.5 3.5 3.25 3.5zM2.5 12c0 0 3.5-6 9.5-6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
            />
          </svg>
        </p>
      </div>

      <div className="lg:w-1/2 p-4 bg-white rounded-sm shadow-sm">
        {article.thumbnailUrl && (
          <div className="flex flex-col items-center mb-4">
            <img
              src={getImageUrl(article.thumbnailUrl)}
              alt={article.title}
              className="w-full h-auto"
            />
            {/* Categories displayed just under the image */}
            <div className="mt-2 text-sm text-gray-500">
              {article.categories && article.categories.length > 0 ? (
                <span>
                  Categories:{" "}
                  {article.categories.map((cat, index) => (
                    <span key={cat.id}>
                      {cat.name}
                      {index < article.categories.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              ) : (
                <p>No categories available.</p>
              )}
            </div>
          </div>
        )}
        <h1 className="text-xl font-bold">{article.title}</h1>
        <p className="text-gray-600 font-bold text-sm mt-1">
          {article.description}
        </p>

        {/* Content section */}
        <div className="mt-4">
          <h2 className="text-l font-semibold">Content</h2>
          <p className="text-sm">{article.content}</p>
        </div>

        <div className="mt-4">
          <h2 className="text-l font-semibold">Comments:</h2>
          {article.articleComments.length > 0 ? (
            article.articleComments.map((comment) => (
              <div key={comment.id} className="border-t pt-2">
                <p>
                  <strong>{comment.User.username}:</strong> {comment.content}
                </p>
                <small className="text-gray-500">
                  {formatDateString(comment.createdAt)}
                </small>
                {user && user.username === comment.User.username && (
                  <div className="flex space-x-2 mt-1">
                    <button
                      className="text-blue-600"
                      onClick={() =>
                        handleEditComment(comment.id, comment.content)
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => {
                        setCommentToDelete(comment.id);
                        setIsModalOpen(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </div>

        <div className="mt-4">
          <h2 className="text-l font-semibold">
            {editCommentId ? "Edit Comment" : "Leave a Comment"}:
          </h2>
          {error && <p className="text-red-500">{error}</p>}
          <form
            onSubmit={handleCommentSubmit}
            className="bg-white shadow-sm rounded-sm p-4"
          >
            <textarea
              ref={commentRef}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-150 ease-in-out"
              rows={3}
            />
            <div className="flex space-x-2 mt-3">
              <button
                type="submit"
                className="p-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {editCommentId ? "Update" : "Submit"}
              </button>
              {editCommentId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="p-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="lg:w-1/4 p-4 bg-neutral-100 rounded-sm">
        {isAuthor && (
          <div className="flex flex-col space-y-2">
            <button
              className="p-1 bg-gray-900 text-white rounded-sm hover:bg-gray-600 transition text-sm"
              onClick={() => navigate(`/articles/${id}/edit`)}
            >
              Update
            </button>
            <button
              className="p-1 bg-red-500 text-white rounded-sm hover:bg-red-600 transition text-sm"
              onClick={() => setIsModalOpen(true)}
            >
              Delete
            </button>
          </div>
        )}
        <h2 className="mt-6 text-l font-semibold relative after:content-[''] after:block after:w-full after:h-[1px] after:bg-gray-800 after:mt-2">
          Related Articles
        </h2>
        {relatedArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {relatedArticles.map((related) => (
              <Link
                to={`/articles/${related.id}`}
                key={related.id}
                className="group relative block rounded-sm shadow-lg overflow-hidden bg-white hover:bg-gray-50 transition duration-200"
              >
                <div className="relative h-32">
                  {related.thumbnailUrl ? (
                    <img
                      src={getImageUrl(related.thumbnailUrl)}
                      alt={related.title}
                      className="w-full h-24 object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-24 bg-gray-200">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="font-bold text-sm text-gray-800 group-hover:text-gray-900 truncate">
                    {related.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {related.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>No related articles available.</p>
        )}
      </div>

      {/* Confirmation Modal for Comment Deletion */}
      <ConfirmModal
        isOpen={isModalOpen && commentToDelete !== null}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteComment}
        message="Are you sure you want to delete this comment?"
      />

      {/* Confirmation Modal for Article Deletion */}
      <ConfirmModal
        isOpen={isModalOpen && commentToDelete === null}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteArticle}
        message="Are you sure you want to delete this article?"
      />
    </div>
  );
};

export default ArticleDetails;
