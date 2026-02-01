import React from 'react';
import { Star, Clock, MapPin } from 'lucide-react';
import { Pharmacy } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  onClick?: () => void;
}

export const PharmacyCard: React.FC<PharmacyCardProps> = ({
  pharmacy,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="swift-card-hover cursor-pointer flex gap-3"
    >
      <img
        src={pharmacy.image}
        alt={pharmacy.name}
        className="w-20 h-20 rounded-xl object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold truncate">{pharmacy.name}</h3>
          <div className="flex items-center gap-1 bg-success-light text-success px-2 py-0.5 rounded-full shrink-0">
            <Star size={12} fill="currentColor" />
            <span className="text-xs font-bold">{pharmacy.rating}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          <MapPin size={12} />
          {pharmacy.distance}
        </p>
        
        <div className="flex items-center gap-3 mt-2">
          <span
            className={cn(
              "swift-badge",
              pharmacy.isOpen
                ? "bg-success-light text-success"
                : "bg-destructive-light text-destructive"
            )}
          >
            {pharmacy.isOpen ? 'Open' : 'Closed'}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} />
            {pharmacy.deliveryTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PharmacyCard;
