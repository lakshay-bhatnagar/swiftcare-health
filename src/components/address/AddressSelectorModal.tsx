import React from 'react';
import { X, MapPin, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Address } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AddressSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (address: Address) => void;
}

export const AddressSelectorModal: React.FC<AddressSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const navigate = useNavigate();
  const { addresses, selectedAddress, setSelectedAddress } = useApp();

  const handleSelect = (address: Address) => {
    setSelectedAddress(address);
    onSelect?.(address);
    onClose();
  };

  const handleAddNew = () => {
    onClose();
    navigate('/address/new');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3">
              <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-lg font-semibold">Select Delivery Address</h2>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-3">
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin size={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No addresses saved</p>
                  <Button onClick={handleAddNew}>
                    <Plus size={18} className="mr-2" />
                    Add New Address
                  </Button>
                </div>
              ) : (
                <>
                  {addresses.map((address) => {
                    const isSelected = selectedAddress?.id === address.id;
                    return (
                      <button
                        key={address.id}
                        onClick={() => handleSelect(address)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary-light"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}
                          >
                            <MapPin size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{address.label}</span>
                              {address.isDefault && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {address.name} • {address.phone}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                              , {address.city}, {address.state} - {address.pincode}
                            </p>
                          </div>
                          {isSelected && (
                            <Check size={20} className="text-primary shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}

                  <Button
                    variant="outline"
                    onClick={handleAddNew}
                    className="w-full"
                  >
                    <Plus size={18} className="mr-2" />
                    Add New Address
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddressSelectorModal;
