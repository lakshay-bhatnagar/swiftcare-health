import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronDown, Pill, Ambulance, Stethoscope, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { SearchBar } from '@/components/common/SearchBar';
import { CategoryCard } from '@/components/common/CategoryCard';
import { PharmacyCard } from '@/components/common/PharmacyCard';
import { MedicineCard } from '@/components/common/MedicineCard';
import { ListSkeleton, GridSkeleton } from '@/components/common/LoadingSkeleton';
import { AddressSelectorModal } from '@/components/address/AddressSelectorModal';
import { useApp } from '@/context/AppContext';
import { api, categories, mockPharmacies } from '@/services/api';
import { Pharmacy, Medicine } from '@/types';
import { useEffect } from 'react';

const quickActions = [
  {
    id: 'medicines',
    label: 'Order Medicines',
    icon: Pill,
    color: 'bg-primary-light text-primary',
    route: '/browse',
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: Ambulance,
    color: 'bg-destructive-light text-destructive',
    route: '/emergency',
  },
  {
    id: 'consultation',
    label: 'Consult Doctor',
    icon: Stethoscope,
    color: 'bg-accent-light text-accent',
    route: '/consultation',
  },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectedAddress, unreadNotificationCount } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [pharmaData, medData] = await Promise.all([
          api.getNearbyPharmacies(),
          api.getMedicines(),
        ]);
        setPharmacies(pharmaData);
        setMedicines(medData.slice(0, 4));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const displayAddress = selectedAddress 
    ? `${selectedAddress.addressLine1}, ${selectedAddress.city}` 
    : 'Add your address';

  return (
    <MobileLayout>
      <div className="safe-top">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Deliver to</p>
            <button 
              onClick={() => setShowAddressModal(true)}
              className="flex items-center gap-1 font-semibold"
            >
              <MapPin size={16} className="text-primary" />
              <span className="truncate max-w-[180px]">
                {displayAddress}
              </span>
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2 bg-muted rounded-xl"
          >
            <Bell size={20} />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>
        </div>

        {/* Greeting */}
        <div className="px-4 py-3">
          <h1 className="text-2xl font-bold">
            Hello, {firstName} 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            What do you need today?
          </p>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onFocus={() => navigate('/search')}
          />
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(action.route)}
                  className={`${action.color} swift-card-hover flex flex-col items-center gap-2 py-4`}
                >
                  <Icon size={28} />
                  <span className="text-xs font-semibold text-center leading-tight">
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Promo Banner */}
        <div className="px-4 pb-4">
          <div className="gradient-primary rounded-2xl p-4 text-primary-foreground">
            <h3 className="font-bold text-lg">First Order? Get 20% OFF!</h3>
            <p className="text-sm opacity-90 mt-1">
              Use code: SWIFT20 on your first medicine order
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Browse Categories</h2>
            <button
              onClick={() => navigate('/browse')}
              className="text-sm text-primary font-medium"
            >
              See All
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {categories.slice(0, 8).map((cat) => (
              <CategoryCard
                key={cat.id}
                {...cat}
                onClick={() => navigate(`/browse?category=${cat.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Nearby Pharmacies */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Nearby Pharmacies</h2>
          </div>
          {isLoading ? (
            <ListSkeleton count={2} />
          ) : (
            <div className="space-y-3">
              {pharmacies.slice(0, 2).map((pharmacy, index) => (
                <motion.div
                  key={pharmacy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PharmacyCard
                    pharmacy={pharmacy}
                    onClick={() => navigate(`/pharmacy/${pharmacy.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Medicines */}
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Popular Medicines</h2>
            <button
              onClick={() => navigate('/browse')}
              className="text-sm text-primary font-medium"
            >
              See All
            </button>
          </div>
          {isLoading ? (
            <GridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {medicines.map((medicine, index) => (
                <motion.div
                  key={medicine.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
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

      {/* Address Selector Modal */}
      <AddressSelectorModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
      />
    </MobileLayout>
  );
};

export default Home;
