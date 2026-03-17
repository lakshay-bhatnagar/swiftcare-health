import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Star, Phone, Mail, Pill } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { MedicineCard } from '@/components/common/MedicineCard';
import { ListSkeleton } from '@/components/common/LoadingSkeleton';
import { pharmacyService } from '@/services/pharmacy.service';
import { Pharmacy, Medicine } from '@/types';
import { cn } from '@/lib/utils';

export const PharmacyDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const [pharmacyData, medicinesData] = await Promise.all([
          pharmacyService.getPharmacyById(id),
          pharmacyService.getPharmacyMedicines(id),
        ]);
        
        setPharmacy(pharmacyData || null);
        setMedicines(medicinesData);
      } catch (error) {
        console.error('Failed to load pharmacy data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <MobileLayout showNav={false}>
        <div className="safe-top px-4 py-4">
          <ListSkeleton count={3} />
        </div>
      </MobileLayout>
    );
  }

  if (!pharmacy) {
    return (
      <MobileLayout showNav={false}>
        <div className="safe-top flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <p className="text-muted-foreground">Pharmacy not found</p>
          <button onClick={() => navigate(-1)} className="text-primary mt-4">
            Go back
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNav={false}>
      <div className="safe-top pb-6">
        {/* Header Image */}
        <div className="relative h-48">
          <img
            src={pharmacy.image}
            alt={pharmacy.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-2 bg-white/90 rounded-full"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Pharmacy Info */}
        <div className="px-4 -mt-12 relative z-10">
          <div className="swift-card">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold">{pharmacy.name}</h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  <span>{pharmacy.address}</span>
                </div>
              </div>
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  pharmacy.isOpen
                    ? "bg-success-light text-success"
                    : "bg-destructive-light text-destructive"
                )}
              >
                {pharmacy.isOpen ? 'Open' : 'Closed'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 font-semibold">
                  <Star size={16} className="text-warning fill-warning" />
                  <span>{pharmacy.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pharmacy.reviewCount} reviews
                </p>
              </div>
              <div className="text-center">
                <div className="font-semibold">{pharmacy.distance}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Distance</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 font-semibold text-primary">
                  <Clock size={14} />
                  <span>{pharmacy.deliveryTime}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Delivery</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-light rounded-xl text-primary font-medium text-sm">
                <Phone size={16} />
                Call
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-muted rounded-xl text-foreground font-medium text-sm">
                <Mail size={16} />
                Message
              </button>
            </div>
          </div>
        </div>

        {/* Medicines from this pharmacy */}
        <div className="px-4 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Pill size={20} className="text-primary" />
            <h2 className="font-semibold text-lg">Available Medicines</h2>
          </div>

          {medicines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No medicines available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(medicines || []).map((medicine, index) => (
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
    </MobileLayout>
  );
};

export default PharmacyDetail;
