import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { SearchBar } from '@/components/common/SearchBar';
import { MedicineCard } from '@/components/common/MedicineCard';
import { ListSkeleton } from '@/components/common/LoadingSkeleton';
import { api } from '@/services/api';
import { Medicine } from '@/context/AppContext';

const trendingSearches = [
  'Paracetamol',
  'Vitamin D',
  'Cough Syrup',
  'Pain Relief',
  'Fever Medicine',
  'Diabetes',
];

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('swiftcare_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        const data = await api.searchMedicines(searchQuery);
        setResults(data);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && !recentSearches.includes(query)) {
      const updated = [query, ...recentSearches.slice(0, 4)];
      setRecentSearches(updated);
      localStorage.setItem('swiftcare_recent_searches', JSON.stringify(updated));
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('swiftcare_recent_searches');
  };

  return (
    <MobileLayout>
      <div className="safe-top">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          <AnimatePresence mode="wait">
            {searchQuery ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {isLoading ? (
                  <ListSkeleton count={3} />
                ) : results.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No results for "{searchQuery}"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.map((medicine, index) => (
                      <motion.div
                        key={medicine.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <MedicineCard
                          medicine={medicine}
                          compact
                          onClick={() => navigate(`/medicine/${medicine.id}`)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Clock size={16} className="text-muted-foreground" />
                        Recent Searches
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-sm text-primary"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSearch(term)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded-full text-sm"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-accent" />
                    Trending Now
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="px-3 py-1.5 bg-accent-light text-accent rounded-full text-sm font-medium hover:bg-accent/20 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Search;
