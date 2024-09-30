import React, { useEffect, useState, useRef } from 'react';
import ArticleCard from '../components/ArtilceCard';
import { io } from 'socket.io-client';

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

const RecommendedArticles: React.FC<HomeProps> = ({ searchQuery }) => {
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null); // Track total pages
  const observer = useRef<IntersectionObserver | null>(null);
  const lastArticleRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<any>(null);
  const [isFetching, setIsFetching] = useState(false); // Prevents multiple queries

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Initialize WebSocket for real-time updates
  useEffect(() => {
    socketRef.current = io('http://localhost:3000');

    socketRef.current.on('connect_error', (err: any) => {
      console.error('Socket connection error:', err);
    });

    socketRef.current.on('reconnect_attempt', () => {
      console.log('Trying to reconnect to the server...');
    });

    // Refresh on update
    socketRef.current.on('articleUpdated', async () => {
      setPage(1);
    });

    // Remove deleted article from the list
    socketRef.current.on('articleDeleted', (deletedId: any) => {
      setRecommendedArticles((prevArticles) =>
        prevArticles.filter((article) => article.id !== deletedId)
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Fetch articles whenever the page or search query changes
  useEffect(() => {
    const fetchRecommendedArticles = async () => {
      if (isFetching || (totalPages && page > totalPages)) return; // Stop fetching if already fetching or all pages are loaded
      setIsFetching(true);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:3000/api/visitor-activity/recommendations?page=${page}&limit=10&search=${encodeURIComponent(
            debouncedSearchQuery
          )}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch articles. Server error.');
        }

        const data = await response.json();

        // Check if no more articles to load
        if (data.recommendedArticles.length === 0) {
          setTotalPages(page); // Set current page as the last page
          return;
        }

        // Append new articles or replace if it's the first page
        setRecommendedArticles((prevArticles) =>
          page === 1
            ? data.recommendedArticles
            : [...prevArticles, ...data.recommendedArticles]
        );

        setTotalPages(data.totalPages); // Ensure totalPages is received correctly
      } catch (error: any) {
        console.error('Error fetching articles:', error);
        setError(
          error.message || 'Failed to load articles. Please try again later.'
        );
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };

    fetchRecommendedArticles();
  }, [page, debouncedSearchQuery]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (loading || (totalPages && page >= totalPages)) return; // Stop if loading or last page is reached
    if (observer.current) observer.current.disconnect();

    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && !isFetching) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    observer.current = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    if (lastArticleRef.current) {
      observer.current.observe(lastArticleRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, isFetching, totalPages]);

  if (loading && recommendedArticles.length === 0) {
    return <p className="text-center text-gray-600">Loading...</p>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-semibold">
        {error}
        <button
          onClick={() => setPage(1)}
          className="mt-4 bg-blue-500 text-white rounded px-4 py-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!loading && recommendedArticles.length === 0) {
    return (
      <div className="text-center text-gray-600">
        No articles found for your search.
        <button
          onClick={() => setPage(1)}
          className="mt-4 bg-blue-500 text-white rounded px-4 py-2"
        >
          Retry Search
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-blue-600 text-center my-6">
        Recommended Articles For You
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mx-auto max-w-screen-xl">
        {recommendedArticles.map((article, index) => {
          const isLastArticle = index === recommendedArticles.length - 1;

          return (
            <div
              ref={isLastArticle ? lastArticleRef : null}
              key={article.id}
              className={`bg-white rounded-sm shadow-sm overflow-hidden transition-transform transform hover:scale-105 ${
                index === 0
                  ? 'col-span-2 sm:col-span-2 lg:col-span-2 xl:col-span-3'
                  : 'col-span-1'
              }`}
            >
              <ArticleCard article={article} />
            </div>
          );
        })}
      </div>
      {loading && page !== totalPages && (
        <p className="text-center text-gray-600 mt-4">Loading more...</p>
      )}
    </div>
  );
};

export default RecommendedArticles;
