import React from 'react';
import { Plus, Minus, FileText } from 'lucide-react';
import { Medicine } from '@/context/AppContext';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MedicineCardProps {
  medicine: Medicine;
  onClick?: () => void;
  compact?: boolean;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onClick,
  compact = false,
}) => {
  const { cart, addToCart, updateCartQuantity } = useApp();
  const cartItem = cart.find((item) => item.medicine.id === medicine.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(medicine);
  };

  const handleUpdateQuantity = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    updateCartQuantity(medicine.id, quantity + delta);
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="swift-card-hover flex gap-3 cursor-pointer"
      >
        <img
          src={medicine.image}
          alt={medicine.name}
          className="w-16 h-16 rounded-xl object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{medicine.name}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {medicine.pharmacyName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-primary">₹{medicine.price}</span>
            {medicine.discount > 0 && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  ₹{medicine.mrp}
                </span>
                <span className="swift-badge-success">{medicine.discount}% off</span>
              </>
            )}
          </div>
        </div>
        {quantity > 0 ? (
          <div className="flex items-center gap-1 bg-primary rounded-xl overflow-hidden">
            <button
              onClick={(e) => handleUpdateQuantity(e, -1)}
              className="p-2 hover:bg-primary/80 text-primary-foreground"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center text-sm font-bold text-primary-foreground">
              {quantity}
            </span>
            <button
              onClick={(e) => handleUpdateQuantity(e, 1)}
              className="p-2 hover:bg-primary/80 text-primary-foreground"
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <Button
            onClick={handleAddToCart}
            size="sm"
            variant="soft"
            className="self-center"
          >
            <Plus size={16} />
            Add
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="swift-card-hover cursor-pointer flex flex-col"
    >
      {/* Image */}
      <div className="relative mb-3">
        <img
          src={medicine.image}
          alt={medicine.name}
          className="w-full h-28 rounded-xl object-cover"
        />
        {medicine.discount > 0 && (
          <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            {medicine.discount}% OFF
          </span>
        )}
        {medicine.prescriptionRequired && (
          <span className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-lg">
            <FileText size={12} />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
          {medicine.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{medicine.pharmacyName}</p>
      </div>

      {/* Price & Action */}
      <div className="flex items-center justify-between mt-3">
        <div>
          <span className="font-bold text-primary">₹{medicine.price}</span>
          {medicine.mrp > medicine.price && (
            <span className="text-xs text-muted-foreground line-through ml-1">
              ₹{medicine.mrp}
            </span>
          )}
        </div>

        {quantity > 0 ? (
          <div className="flex items-center gap-0.5 bg-primary rounded-xl overflow-hidden">
            <button
              onClick={(e) => handleUpdateQuantity(e, -1)}
              className="p-1.5 hover:bg-primary/80 text-primary-foreground"
            >
              <Minus size={12} />
            </button>
            <span className="w-5 text-center text-xs font-bold text-primary-foreground">
              {quantity}
            </span>
            <button
              onClick={(e) => handleUpdateQuantity(e, 1)}
              className="p-1.5 hover:bg-primary/80 text-primary-foreground"
            >
              <Plus size={12} />
            </button>
          </div>
        ) : (
          <Button
            onClick={handleAddToCart}
            size="sm"
            variant="soft"
            className="h-8 px-3"
          >
            <Plus size={14} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MedicineCard;
