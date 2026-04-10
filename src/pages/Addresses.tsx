import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, MoreVertical, Trash2, Edit2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const Addresses: React.FC = () => {
  const navigate = useNavigate();
  const { addresses, selectedAddress, setSelectedAddress, deleteAddress, setDefaultAddress } = useApp();

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
      toast.success('Address deleted');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      toast.success('Default address updated');
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };

  return (
    <MobileLayout showNav={false}>
      <div className="safe-top pb-24">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-border">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-semibold">Manage Addresses</h1>
        </div>

        <div className="px-4 py-4">
          {addresses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} className="text-muted-foreground" />
              </div>
              <h2 className="font-semibold text-lg mb-2">No addresses saved</h2>
              <p className="text-muted-foreground mb-6">
                Add your first address to get started
              </p>
              <Button onClick={() => navigate('/address/new')}>
                <Plus size={18} className="mr-2" />
                Add New Address
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address, index) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "swift-card relative",
                    selectedAddress?.id === address.id && "ring-2 ring-primary"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        address.isDefault ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}
                    >
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{address.label}</span>
                        {address.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle size={10} />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {address.full_name} • {address.phone_number}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                        <br />
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-muted rounded-lg">
                          <MoreVertical size={18} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/address/edit/${address.id}`)}>
                          <Edit2 size={16} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!address.isDefault && (
                          <DropdownMenuItem onClick={() => handleSetDefault(address.id)}>
                            <CheckCircle size={16} className="mr-2" />
                            Set as Default
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(address.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
        <div className="max-w-lg mx-auto">
          <Button onClick={() => navigate('/address/new')} size="xl" className="w-full">
            <Plus size={18} className="mr-2" />
            Add New Address
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Addresses;
