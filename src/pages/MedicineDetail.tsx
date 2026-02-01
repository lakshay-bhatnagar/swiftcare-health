import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, FileText, Minus, Plus, ShoppingCart, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useApp, Medicine } from '@/context/AppContext';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

export const MedicineDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { cart, addToCart, updateCartQuantity, getCartItemCount } = useApp();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  const cartItem = cart.find((item) => item.medicine.id === id);
  const quantity = cartItem?.quantity || 0;
  const totalCartItems = getCartItemCount();

  useEffect(() => {
    const loadMedicine = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await api.getMedicineById(id);
        setMedicine(data || null);
      } finally {
        setIsLoading(false);
      }
    };
    loadMedicine();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Medicine not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between safe-top">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-card/80 backdrop-blur-md rounded-full shadow-md"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className="p-2 bg-card/80 backdrop-blur-md rounded-full shadow-md"
          >
            <Heart
              size={20}
              className={cn(liked && "fill-destructive text-destructive")}
            />
          </button>
          <button className="p-2 bg-card/80 backdrop-blur-md rounded-full shadow-md">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="relative h-72 bg-muted">
        <img
          src={medicine.image}
          alt={medicine.name}
          className="w-full h-full object-cover"
        />
        {medicine.prescriptionRequired && (
          <div className="absolute bottom-4 left-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
            <FileText size={14} />
            Prescription Required
          </div>
        )}
      </div>

      {/* Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-4 py-5 space-y-4"
      >
        {/* Name & Price */}
        <div>
          <h1 className="text-xl font-bold">{medicine.name}</h1>
          <p className="text-muted-foreground text-sm">
            {medicine.genericName} • {medicine.manufacturer}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-2xl font-bold text-primary">
              ₹{medicine.price}
            </span>
            {medicine.discount > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  ₹{medicine.mrp}
                </span>
                <span className="swift-badge-success">
                  {medicine.discount}% OFF
                </span>
              </>
            )}
          </div>
        </div>

        {/* Pharmacy Info */}
        <div className="swift-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
            <span className="text-lg">🏪</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{medicine.pharmacyName}</p>
            <p className="text-xs text-muted-foreground">
              Available • Delivery in 10-15 mins
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-semibold">About this medicine</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {medicine.description}
          </p>
        </div>

        {/* Dosage */}
        <div className="space-y-2">
          <h3 className="font-semibold">Dosage</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {medicine.dosage}
          </p>
        </div>

        {/* Warning */}
        {medicine.prescriptionRequired && (
          <div className="swift-card bg-warning-light border-warning/30 flex gap-3">
            <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-warning">
                Prescription Required
              </p>
              <p className="text-xs text-warning/80 mt-0.5">
                You'll need to upload a valid prescription before checkout
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {/* Quantity Controls */}
          {quantity > 0 ? (
            <div className="flex items-center gap-1 bg-primary rounded-xl overflow-hidden">
              <button
                onClick={() => updateCartQuantity(medicine.id, quantity - 1)}
                className="p-3 hover:bg-primary/80 text-primary-foreground"
              >
                <Minus size={18} />
              </button>
              <span className="w-8 text-center text-lg font-bold text-primary-foreground">
                {quantity}
              </span>
              <button
                onClick={() => updateCartQuantity(medicine.id, quantity + 1)}
                className="p-3 hover:bg-primary/80 text-primary-foreground"
              >
                <Plus size={18} />
              </button>
            </div>
          ) : (
            <Button
              onClick={() => addToCart(medicine)}
              size="lg"
              className="flex-1"
            >
              <Plus size={18} />
              Add to Cart
            </Button>
          )}

          {/* View Cart Button */}
          {totalCartItems > 0 && (
            <Button
              onClick={() => navigate('/cart')}
              size="lg"
              variant="accent"
              className="flex-1"
            >
              <ShoppingCart size={18} />
              View Cart ({totalCartItems})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineDetail;
