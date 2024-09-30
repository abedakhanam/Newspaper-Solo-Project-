import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ArticleCard from './ArtilceCard'; // Ensure correct import path

interface Article {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string;
  createdAt: string;
  author: {
    username: string;
  };
}

interface CategoryArticlesResponse {
  category: string;
  total: number;
  pages: number;
  currentPage: number;
  articles: Article[];
}

interface CategoriesProps {
  searchQuery: string;
}

const Categories: React.FC<CategoriesProps> = ({ searchQuery }) => {
  const { id } = useParams<{ id: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Reset state when category ID or search query changes
    setArticles([]);
    setPage(1);
    setHasMore(true);
  }, [id, searchQuery]);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const limit = 10;
        const response = await fetch(
          `http://localhost:3000/api/categories/${id}?page=${page}&limit=${limit}&search=${encodeURIComponent(
            searchQuery || ''
          )}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }

        const data: CategoryArticlesResponse = await response.json();
        console.log('Fetched data:', data);

        // Update articles and pagination info
        setArticles((prev) => [...prev, ...data.articles]);
        setCategoryName(data.category || '');
        setHasMore(data.currentPage < data.pages); // Check if there are more pages
      } catch (error: any) {
        console.error('Error fetching articles:', error);
        setError('Error fetching articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [id, searchQuery, page]); // Depend on `page`, `id`, and `searchQuery`

  const lastArticleRef = (node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1); // Load more articles
      }
    });
    if (node) observer.current.observe(node);
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (loading && articles.length === 0)
    return <p className="text-center text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (articles.length === 0)
    return (
      <p className="text-center text-gray-600">
        No articles found for your search.
      </p>
    );

  return (
    <div className="p-8">
      {!searchQuery && (
        <h1 className="text-2xl font-bold text-center mb-4">
          {capitalizeFirstLetter(categoryName) || 'Articles'}
        </h1>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mx-auto max-w-screen-xl">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {articles.slice(0, 2).map((article, index) => (
            <div
              key={article.id}
              className="bg-white rounded-sm shadow-sm overflow-hidden transition-transform transform hover:scale-105"
              ref={index === 1 ? lastArticleRef : null} // Set ref for the last article in the first column
            >
              <ArticleCard article={article} />
            </div>
          ))}
        </div>

        {articles[2] && (
          <div className="lg:col-span-1 flex justify-center">
            <div className="bg-white rounded-sm shadow-sm overflow-hidden transition-transform transform hover:scale-105">
              <ArticleCard article={articles[2]} />
            </div>
          </div>
        )}

        <div className="lg:col-span-2 flex flex-col gap-4">
          {articles.slice(3, 5).map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-sm shadow-sm overflow-hidden transition-transform transform hover:scale-105"
            >
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </div>

      {articles.length > 5 && (
        <div className="mt-8 mx-4 md:mx-8 lg:mx-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {articles.slice(5).map((article, index) => (
              <div
                key={article.id}
                className="bg-white rounded-sm shadow-sm overflow-hidden transition-transform transform hover:scale-105"
                ref={index === articles.length - 6 ? lastArticleRef : null} // Set ref for the last article in the grid
              >
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <p className="text-center text-gray-600">Loading more articles...</p>
      )}
    </div>
  );
};

export default Categories;
