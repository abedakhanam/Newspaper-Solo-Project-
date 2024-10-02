import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/react';
import {
  Bars3Icon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithCache } from '../utils/apiFetcher';

// Debounce function
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

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce for 300ms

  // Function to capitalize the first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchWithCache('http://localhost:3000/api/categories');
        // if (!response.ok) {
        //   throw new Error('Failed to fetch categories');
        // }
        // const data = await response.json();
        setCategories(data);
      } catch (error) {
        setError('Error fetching categories');
        console.error('Fetch categories error:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch article suggestions based on search query
  useEffect(() => {
    if (!debouncedSearchQuery) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/articles?search=${debouncedSearchQuery}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        const data = await response.json();
        setSuggestions(data.articles);
      } catch (error) {
        console.error('Fetch suggestions error:', error);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchToggle = () => {
    setSearchOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node)
    ) {
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const mainCategories = categories.slice(0, 5);
  const moreCategories = categories.slice(5);

  const getActiveCategoryId = () => {
    const categoryPath = location.pathname.split('/')[2];
    return categoryPath ? parseInt(categoryPath, 10) : null;
  };

  const activeCategoryId = getActiveCategoryId();

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setDropdownOpen(false); // Close dropdown before navigation
    navigate(`/categories/${category.id}`); // Navigate to the selected category
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-md">
      <nav aria-label="Global" className="mx-auto max-w-5xl py-2 px-4 lg:px-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Popover className="relative">
              <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 p-1 rounded-md hover:bg-gray-100">
                <Bars3Icon
                  aria-hidden="true"
                  className="h-5 w-5 text-gray-400"
                />
              </PopoverButton>
              <PopoverPanel className="absolute z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-gray-900/5">
                <div className="py-2">
                  <Link
                    to="/create-article"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Create Article
                  </Link>
                  <Link
                    to="/my-articles"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    My Articles
                  </Link>
                  <Link
                    to="/recommended-articles"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Recommended Articles
                  </Link>
                </div>
              </PopoverPanel>
            </Popover>
            <div className="text-sm font-medium text-gray-700 ml-2">
              {new Date().toLocaleDateString()}
            </div>
          </div>

          <Link
            to="/"
            className="-m-1.5 p-1.5 flex justify-center items-center"
          >
            <span className="text-2xl font-bold text-blue-600">
              Project Code Times
            </span>
          </Link>

          <div className="flex justify-end items-center">
            {user ? (
              <div className="flex items-center">
                <span className="text-sm font-semibold leading-6 text-gray-900 p-1">
                  {user.username.toUpperCase()}
                </span>
                <button
                  onClick={logout}
                  className="ml-2 text-sm font-semibold leading-6 text-white p-1 bg-red-500 hover:bg-red-700 rounded-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="text-sm font-semibold leading-6 text-blue-gray-50 p-1 bg-green-500 rounded-sm hover:bg-black hover:text-white"
              >
                Log in
              </Link>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <PopoverGroup className="flex items-center lg:gap-x-4">
            {mainCategories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.id}`}
                className={`text-sm font-semibold leading-6 p-1 rounded-md ${
                  activeCategoryId === category.id
                    ? 'bg-gray-200 shadow-md'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="truncate w-24">
                  {capitalizeFirstLetter(category.name)}
                </span>
              </Link>
            ))}
            {moreCategories.length > 0 && (
              <Popover
                className="relative"
                open={dropdownOpen}
                onOpenChange={setDropdownOpen}
              >
                <PopoverButton
                  className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 p-1 rounded-md hover:bg-gray-100"
                  onClick={() => setDropdownOpen((prev) => !prev)} // Toggle dropdown
                >
                  <span className="truncate w-24">
                    {selectedCategory
                      ? capitalizeFirstLetter(selectedCategory.name)
                      : 'More'}
                  </span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="h-5 w-5 text-gray-400"
                  />
                </PopoverButton>
                <PopoverPanel className="absolute z-10 mt-3 w-48 rounded-md bg-white shadow-lg ring-1 ring-gray-900/5 overflow-auto max-h-80">
                  <div className="py-2">
                    {/* Show all categories in the "More" dropdown */}
                    {moreCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category)} // Select category
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 ${
                          selectedCategory &&
                          selectedCategory.id === category.id
                            ? 'bg-gray-200'
                            : ''
                        }`}
                      >
                        <span className="truncate">
                          {capitalizeFirstLetter(category.name)}
                        </span>
                      </button>
                    ))}
                  </div>
                </PopoverPanel>
              </Popover>
            )}
          </PopoverGroup>

          <div className="flex items-center">
            <button
              onClick={handleSearchToggle}
              className="flex items-center p-1 rounded-md bg-gray-200 hover:bg-gray-300 ml-2"
              aria-label="Toggle search"
            >
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="h-5 w-5 text-gray-600"
              />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="mt-2" ref={searchRef}>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="border border-gray-300 rounded-md p-2 w-full mx-auto transition-all duration-300 ease-in-out"
            />
            {/* {suggestions.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md">
                {suggestions.map((article) => (
                  <li key={article.id} className="p-2 hover:bg-gray-100">
                    <Link to={`/articles/${article.id}`}>{article.title}</Link>
                  </li>
                ))}
              </ul>
            )} */}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
