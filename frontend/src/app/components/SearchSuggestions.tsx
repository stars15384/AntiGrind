import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, Clock, X, TrendingUp, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { companiesApi } from '@/api/companies';

interface SearchSuggestionsProps {
  placeholder?: string;
  className?: string;
}

export function SearchSuggestions({
  placeholder = 'Search companies...',
  className = '',
}: SearchSuggestionsProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchSuggestions(keyword: string) {
    setIsSearching(true);
    try {
      const result = await companiesApi.search({ q: keyword, limit: 5 });
      if (result && Array.isArray(result)) {
        setSuggestions(result.map((company: any) => company.name || company));
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSelect(keyword: string) {
    addToHistory(keyword);
    setQuery(keyword);
    setShowDropdown(false);
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      handleSelect(query);
    }
  }

  function handleInputChange(value: string) {
    setQuery(value);
    setShowDropdown(true);
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setShowDropdown(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5 animate-spin" />
          )}
        </div>
      </form>

      {showDropdown && (query.length >= 2 || history.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
        >
          {query.length >= 2 && suggestions.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                <TrendingUp className="w-4 h-4" />
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {!isSearching && query.length < 2 && history.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
              {history.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded-lg group"
                >
                  <button
                    onClick={() => handleSelect(item.keyword)}
                    className="flex-1 text-left flex items-center gap-3"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{item.keyword}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(item.keyword);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {query.length >= 2 && !isSearching && suggestions.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchSuggestions;
