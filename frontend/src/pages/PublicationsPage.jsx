import React, { useEffect, useState, useCallback } from 'react';
import { getAllPublications, searchPublications } from '../services/publicationService';
import PublicationCard from '../components/publications/PublicationCard';
import SearchBar from '../components/common/SearchBar';
import Loader from '../components/common/Loader';
import ReactPaginate from 'react-paginate';
import { CATEGORIES, SORT_OPTIONS } from '../utils/constants';
import { FiFilter, FiX } from 'react-icons/fi';
import './PublicationsPage.css';

const PublicationsPage = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(1);
  const [query, setQuery]               = useState('');
  const [category, setCategory]         = useState('');
  const [sort, setSort]                 = useState('newest');
  const [total, setTotal]               = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, limit: 9, sort };
      if (category) params.category = category;

      const res = query
        ? await searchPublications(query, params)
        : await getAllPublications(params);

      const data = res.data;
      const items = data?.data?.items || data?.publications || (Array.isArray(data) ? data : []);
      setPublications(items);
      setTotalPages(data?.data?.totalPages || data?.totalPages || 1);
      setTotal(data?.data?.total || data?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, query, category, sort]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (q) => { setQuery(q); setPage(0); };
  const handleCategory = (c) => { setCategory(c === category ? '' : c); setPage(0); };
  const clearFilters = () => { setQuery(''); setCategory(''); setSort('newest'); setPage(0); };

  return (
    <div className="page-wrapper pub-page">
      <div className="pub-page-header fade-up">
        <div>
          <h1 className="section-title">Publications</h1>
          <p className="section-subtitle">
            {total > 0 ? `${total} research papers available` : 'Explore all research papers'}
          </p>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="pub-controls fade-up delay-1">
        <SearchBar onSearch={handleSearch} />
        <div className="sort-select-wrap">
          <label>Sort by</label>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Category filters */}
      <div className="category-filters fade-up delay-2">
        <span className="filter-label"><FiFilter /> Filter:</span>
        {CATEGORIES.slice(0, 8).map((c) => (
          <button
            key={c}
            className={`cat-btn ${category === c ? 'active' : ''}`}
            onClick={() => handleCategory(c)}
          >
            {c}
          </button>
        ))}
        {(query || category) && (
          <button className="cat-btn clear" onClick={clearFilters}><FiX /> Clear</button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <Loader text="Fetching publications…" />
      ) : publications.length === 0 ? (
        <div className="empty-state fade-in">
          <h3>No publications found</h3>
          <p>Try adjusting your search or filters.</p>
          <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={clearFilters}>Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="pub-grid fade-in">
            {publications.map((pub, i) => (
              <div key={pub._id} className={`delay-${Math.min(i + 1, 6)}`}>
                <PublicationCard publication={pub} />
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <ReactPaginate
              pageCount={totalPages}
              forcePage={page}
              onPageChange={({ selected }) => { setPage(selected); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              previousLabel="← Prev"
              nextLabel="Next →"
              containerClassName="pagination"
              activeClassName="selected"
              disabledClassName="disabled"
            />
          )}
        </>
      )}
    </div>
  );
};

export default PublicationsPage;
