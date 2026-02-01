import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { SearchBar } from '@/components/common/SearchBar';
import { CategoryCard } from '@/components/common/CategoryCard';
import { MedicineCard } from '@/components/common/MedicineCard';
import { GridSkeleton } from '@/components/common/LoadingSkeleton';
import { api, categories } from '@/services/api';
import { Medicine } from '@/context/AppContext';
import { cn } from '@/lib/utils';

export const Browse: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    const loadMedicines = async () => {
      setIsLoading(true);
      try {
        const data = await api.getMedicines(selectedCategory || undefined);
        setMedicines(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadMedicines();
  }, [selectedCategory]);

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  };

  const filteredMedicines = searchQuery
    ? medicines.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : medicines;

  const categoryName = categories.find((c) => c.id === selectedCategory)?.name;

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
          <h1 className="text-lg font-semibold flex-1">
            {categoryName || 'Browse Medicines'}
          </h1>
          <button className="p-2 hover:bg-muted rounded-xl transition-colors">
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search in this category..."
          />
        </div>

        {/* Categories Scroll */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all",
                  "border-2",
                  selectedCategory === cat.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <span>{cat.icon}</span>
                <span className="text-sm font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="px-4 pb-3">
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${filteredMedicines.length} medicines found`}
          </p>
        </div>

        {/* Medicines Grid */}
        <div className="px-4 pb-6">
          {isLoading ? (
            <GridSkeleton count={6} />
          ) : filteredMedicines.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No medicines found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredMedicines.map((medicine, index) => (
                <motion.div
                  key={medicine.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MedicineCard
                    medicine={medicine}
                    onClick={() => navigate(`/medicine/${medicine.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Browse;
