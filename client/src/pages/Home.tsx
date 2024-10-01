import React, { useEffect, useState, useRef } from "react";
import ArticleCard from "../components/ArtilceCard";
import { io } from "socket.io-client";
import { fetchWithCache } from "../utils/apiFetcher";

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

interface HomeProps {
  searchQuery: string;
}

// Custom hook for debouncing the search query
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

const Home: React.FC<HomeProps> = ({ searchQuery }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]); // New state to hold all articles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastArticleRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<any>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [totalPages, setTotalPages] = useState<number>(1); //for keeping total page value

  // Fetch articles and all articles
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchWithCache(
          `http://localhost:3000/api/articles?page=${page}&limit=10`
        );

        // console.log(data.pages);
        setTotalPages(data.pages);

        // if (!response.ok) {
        //   throw new Error('Failed to fetch articles. Server error.');
        // }

        // const data = await response.json();
        setArticles((prevArticles) =>
          page === 1 ? data.articles : [...prevArticles, ...data.articles]
        );
        setAllArticles((prevArticles) =>
          page === 1 ? data.articles : [...prevArticles, ...data.articles]
        ); // Set all articles
      } catch (error: any) {
        console.error("Error fetching articles:", error);
        setError(
          error.message || "Failed to load articles. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [page]);

  // Reset to the first page when the search query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery]);

  // Filter articles based on search query
  useEffect(() => {
    if (debouncedSearchQuery) {
      const filteredArticles = allArticles.filter((article) =>
        article.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
      setArticles(filteredArticles);
    } else {
      setArticles(allArticles); // Reset to all articles if search is cleared
    }
  }, [debouncedSearchQuery, allArticles]);

  // Infinite scrolling logic
  useEffect(() => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    const callback = (entries: IntersectionObserverEntry[]) => {
      //added this totalPages > page
      if (entries[0].isIntersecting && totalPages > page) {
        setPage((prevPage) => prevPage + 1); // Load the next page when scrolled to the bottom
      }
    };

    observer.current = new IntersectionObserver(callback);
    if (lastArticleRef.current) {
      observer.current.observe(lastArticleRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, articles]);

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
              className={`bg-neutral  overflow-hidden transition-transform transform hover:scale-105 ${
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

export default Home;
