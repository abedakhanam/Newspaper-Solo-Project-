// RelatedArticleCard.tsx
import React from 'react';

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

const RelatedArticleCard: React.FC<{ article: RelatedArticle }> = ({
  article,
}) => {
  return (
    <div className="border rounded-lg p-4 shadow-md bg-white">
      {article.thumbnailUrl && (
        <img
          src={article.thumbnailUrl}
          alt={article.title}
          className="w-full h-32 object-cover rounded-t-lg mb-2"
        />
      )}
      <h3 className="text-lg font-semibold">{article.title}</h3>
      <p className="text-gray-600 line-clamp-3">{article.description}</p>
      <p className="text-sm text-gray-500">
        By {article.author.username} on{' '}
        {new Date(article.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default RelatedArticleCard;
