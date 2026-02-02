import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import addressService from '@/services/address.service';
import { Address } from '@/types';

const labels: Array<'Home' | 'Work' | 'Other'> = ['Home', 'Work', 'Other'];

export const AddressForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addAddress, updateAddress, addresses } = useApp();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    label: 'Home' as 'Home' | 'Work' | 'Other',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (isEditing) {
      const address = addresses.find(a => a.id === id);
      if (address) {
        setForm({
          label: address.label,
          name: address.name,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || '',
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          isDefault: address.isDefault,
        });
      }
    }
  }, [id, isEditing, addresses]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.name || !form.phone || !form.addressLine1 || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setIsSaving(true);
    try {
      // Get coordinates
      const coords = await addressService.geocodeAddress(form.pincode);
      
      const addressData: Omit<Address, 'id'> = {
        ...form,
        latitude: coords?.lat,
        longitude: coords?.lng,
      };

      if (isEditing) {
        await updateAddress(id!, addressData);
        toast.success('Address updated successfully');
      } else {
        await addAddress(addressData);
        toast.success('Address added successfully');
      }
      navigate(-1);
    } catch (error) {
      toast.error(isEditing ? 'Failed to update address' : 'Failed to add address');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold">
          {isEditing ? 'Edit Address' : 'Add New Address'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        {/* Label Selection */}
        <div>
          <Label className="mb-2 block">Address Type</Label>
          <div className="flex gap-2">
            {labels.map(label => (
              <button
                key={label}
                type="button"
                onClick={() => handleChange('label', label)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl font-medium text-sm transition-all border-2",
                  form.label === label
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Enter full name"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Address Details */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="addressLine1">Address Line 1 *</Label>
            <Input
              id="addressLine1"
              value={form.addressLine1}
              onChange={e => handleChange('addressLine1', e.target.value)}
              placeholder="House/Flat No., Building Name"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              value={form.addressLine2}
              onChange={e => handleChange('addressLine2', e.target.value)}
              placeholder="Street, Area, Landmark"
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={form.city}
                onChange={e => handleChange('city', e.target.value)}
                placeholder="City"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={form.state}
                onChange={e => handleChange('state', e.target.value)}
                placeholder="State"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
              value={form.pincode}
              onChange={e => handleChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit pincode"
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Default Address Toggle */}
        <button
          type="button"
          onClick={() => handleChange('isDefault', !form.isDefault)}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-border"
        >
          <span className="font-medium">Set as default address</span>
          <div
            className={cn(
              "w-12 h-7 rounded-full relative transition-colors",
              form.isDefault ? "bg-primary" : "bg-muted"
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-card shadow transition-all",
                form.isDefault ? "right-1" : "left-1"
              )}
            />
          </div>
        </button>

        {/* Submit Button */}
        <Button
          type="submit"
          size="xl"
          className="w-full"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            isEditing ? 'Update Address' : 'Save Address'
          )}
        </Button>
      </form>
    </div>
  );
};

export default AddressForm;
