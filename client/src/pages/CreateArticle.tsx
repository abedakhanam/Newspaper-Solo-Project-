import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { fetchWithCache } from '../utils/apiFetcher';

interface Category {
  id: number;
  name: string;
}

const CreateArticleForm: React.FC = () => {
  const token = localStorage.getItem('token');
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    thumbnail: null as File | null,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchWithCache('http://localhost:3000/api/categories');
        // const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to fetch categories');
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData({
      ...formData,
      thumbnail: file,
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const categoryId = parseInt(value, 10);

    setSelectedCategories((prevSelected) =>
      checked
        ? [...prevSelected, categoryId]
        : prevSelected.filter((id) => id !== categoryId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to create an article');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('content', formData.content);
    if (formData.thumbnail) {
      formDataToSend.append('thumbnail', formData.thumbnail);
    }
    selectedCategories.forEach((id) =>
      formDataToSend.append('categoryIds[]', id.toString())
    );

    try {
      const response = await fetch('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Article created successfully!'); // Show success toast
        setError('');
        // Reset form fields after success
        setFormData({
          title: '',
          description: '',
          content: '',
          thumbnail: null,
        });
        setSelectedCategories([]);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch {
      setError('An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-sm shadow-sm w-full max-w-4xl">
        <h2 className="text-3xl font-bold mb-6 text-center">Create Article</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="description">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Thumbnail</label>
            <div className="flex items-center border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                id="thumbnail"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <label
                htmlFor="thumbnail"
                className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
              >
                <div className="text-center text-gray-500">
                  {formData.thumbnail ? (
                    <p>{formData.thumbnail.name}</p>
                  ) : (
                    <p className="text-lg">Click to upload a thumbnail</p>
                  )}
                </div>
                <div className="mt-2 text-blue-600 hover:underline text-lg">
                  Upload Image
                </div>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Categories</label>
            <div className="flex flex-wrap">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="mr-4 mb-2 flex items-center"
                >
                  <input
                    type="checkbox"
                    value={category.id}
                    onChange={handleCategoryChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Create Article
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateArticleForm;