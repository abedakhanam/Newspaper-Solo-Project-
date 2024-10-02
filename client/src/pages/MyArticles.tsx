import React, { useEffect, useState, useRef } from "react";
import ArticleCard from "../components/ArticleCard"; // Fixed the import typo
import { io } from "socket.io-client"; // Import Socket.io client

interface Author {
  username: string;
}

interface Article {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  createdAt: string;
  author: Author;
}

interface MyArticlesProps {
  searchQuery: string; // Receive the search query as a prop
}

// Custom hook for debouncing
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const MyArticles: React.FC<MyArticlesProps> = ({ searchQuery }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastArticleRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<any>(null); // Ref for the socket instance

  // Debounce searchQuery
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500 ms debounce

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");

    socketRef.current.on("connect_error", (err: any) => {
      console.error("Socket connection error:", err);
    });

    socketRef.current.on("reconnect_attempt", () => {
      console.log("Trying to reconnect to the server...");
    });

    socketRef.current.on("articleUpdated", async () => {
      setPage(1);
    });

    socketRef.current.on("articleDeleted", (deletedId: any) => {
      setArticles((prevArticles) =>
        prevArticles.filter((article) => article.id !== deletedId)
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const fetchMyArticles = async () => {
      setLoading(true);
      setError(null); // Clear previous errors

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view your articles.");
          return;
        }

        const response = await fetch(
          `http://localhost:3000/api/articles/user/me?page=${page}&limit=10&search=${encodeURIComponent(
            debouncedSearchQuery
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch articles. Server error.");
        }

        const data = await response.json();
        setArticles((prevArticles) =>
          page === 1 ? data.articles : [...prevArticles, ...data.articles]
        );
      } catch (error: any) {
        console.error("Error fetching articles:", error);
        setError(
          error.message || "Failed to load articles. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyArticles();
  }, [page, debouncedSearchQuery]);

  useEffect(() => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    observer.current = new IntersectionObserver(callback);
    if (lastArticleRef.current) {
      observer.current.observe(lastArticleRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading]);

  if (loading && articles.length === 0) {
    return <p className="text-center text-gray-600">Loading...</p>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-semibold">
        {error}
        <button
          onClick={() => setPage(1)} // Retry loading the first page
          className="mt-4 bg-blue-500 text-white rounded px-4 py-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!loading && articles.length === 0) {
    return (
      <div className="text-center text-gray-600">
        No articles found for your search.
        <button
          onClick={() => setPage(1)} // Retry loading articles
          className="mt-4 bg-blue-500 text-white rounded px-4 py-2"
        >
          Retry Search
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mx-auto max-w-screen-xl">
        {articles.map((article, index) => {
          const isLastArticle = index === articles.length - 1;

          return (
            <div
              ref={isLastArticle ? lastArticleRef : null}
              key={article.id}
              className={`bg-white rounded-sm shadow-sm overflow-hidden transition-transform transform hover:scale-105 ${
                index === 0
                  ? "col-span-2 sm:col-span-2 lg:col-span-2 xl:col-span-3"
                  : "col-span-1"
              }`}
            >
              <ArticleCard article={article} />
            </div>
          );
        })}
      </div>
      {loading && (
        <p className="text-center text-gray-600 mt-4">Loading more...</p>
      )}
    </div>
  );
};

export default MyArticles;
