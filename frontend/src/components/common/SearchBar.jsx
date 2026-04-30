import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = 'Search by title, author, keyword…' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrap">
        <FiSearch className="search-icon" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {query && (
          <button type="button" className="search-clear" onClick={handleClear}>
            <FiX />
          </button>
        )}
      </div>
      <button type="submit" className="btn btn-primary search-btn">Search</button>
    </form>
  );
};

export default SearchBar;
