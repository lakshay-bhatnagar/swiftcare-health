import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ambulance, Phone, MapPin, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

export const Emergency: React.FC = () => {
  const navigate = useNavigate();
  const [isRequesting, setIsRequesting] = useState(false);
  const [emergencyInfo, setEmergencyInfo] = useState<{
    eta: string;
    hospital: string;
  } | null>(null);

  const handleRequestEmergency = async () => {
    setIsRequesting(true);
    try {
      // Mock location
      const result = await api.requestEmergencyVehicle({ lat: 0, lng: 0 });
      setEmergencyInfo(result);
    } catch (error) {
      console.error('Emergency request failed:', error);
    }
  };

  if (emergencyInfo) {
    return (
      <MobileLayout showNav={false}>
        <div className="safe-top min-h-screen flex flex-col">
          {/* Header */}
          <div className="px-4 pt-4 pb-2">
            <h1 className="text-lg font-semibold text-center">
              Emergency Vehicle Dispatched
            </h1>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-32 h-32 rounded-full gradient-emergency flex items-center justify-center mb-6 animate-pulse-emergency"
            >
              <Ambulance size={56} className="text-destructive-foreground" />
            </motion.div>

            <h2 className="text-2xl font-bold mb-2">Help is on the way!</h2>
            <p className="text-muted-foreground mb-6">
              An emergency vehicle has been dispatched to your location
            </p>

            <div className="swift-card w-full max-w-sm mb-6 space-y-4">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-primary" />
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Estimated Arrival</p>
                  <p className="font-bold text-lg">{emergencyInfo.eta}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-primary" />
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Nearest Hospital</p>
                  <p className="font-bold">{emergencyInfo.hospital}</p>
                </div>
              </div>
            </div>

            <div className="w-full max-w-sm space-y-3">
              <Button
                size="xl"
                variant="emergency"
                className="w-full"
                onClick={() => window.open('tel:102')}
              >
                <Phone size={20} />
                Call Emergency: 102
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </div>

            <p className="text-xs text-destructive mt-6">
              ⚠️ This booking cannot be cancelled
            </p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNav={false}>
      <div className="safe-top min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-semibold">Emergency Services</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-32 h-32 rounded-full bg-destructive-light flex items-center justify-center mb-6">
            <Ambulance size={56} className="text-destructive" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Emergency Medical Vehicle</h2>
          <p className="text-muted-foreground mb-8">
            Request an ambulance and get connected to the nearest hospital
          </p>

          <div className="swift-card bg-destructive-light border-destructive/20 w-full max-w-sm mb-6">
            <div className="flex gap-3">
              <AlertTriangle size={24} className="text-destructive shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-destructive">Important Notice</p>
                <p className="text-sm text-destructive/80 mt-1">
                  Once requested, this emergency booking cannot be cancelled. Only
                  use in case of genuine medical emergency.
                </p>
              </div>
            </div>
          </div>

          <Button
            size="xl"
            variant="emergency"
            className="w-full max-w-sm"
            onClick={handleRequestEmergency}
            disabled={isRequesting}
          >
            {isRequesting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Ambulance size={24} />
                Request Emergency Vehicle
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            Or call directly:{' '}
            <a href="tel:102" className="font-bold text-destructive">
              102
            </a>
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Emergency;
