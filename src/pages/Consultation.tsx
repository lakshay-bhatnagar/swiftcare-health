import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Video, MessageCircle, Calendar, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const specialties = [
  { id: 'general', name: 'General Physician', icon: '👨‍⚕️' },
  { id: 'pediatric', name: 'Pediatrician', icon: '👶' },
  { id: 'derma', name: 'Dermatologist', icon: '🧴' },
  { id: 'cardio', name: 'Cardiologist', icon: '❤️' },
  { id: 'ortho', name: 'Orthopedic', icon: '🦴' },
  { id: 'gyno', name: 'Gynecologist', icon: '👩‍⚕️' },
];

const doctors = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'General Physician',
    experience: '12 years',
    rating: 4.9,
    reviews: 324,
    fee: 299,
    nextSlot: '10:30 AM',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
  },
  {
    id: 'doc-2',
    name: 'Dr. Michael Chen',
    specialty: 'Cardiologist',
    experience: '15 years',
    rating: 4.8,
    reviews: 256,
    fee: 499,
    nextSlot: '11:00 AM',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
  },
  {
    id: 'doc-3',
    name: 'Dr. Priya Sharma',
    specialty: 'Dermatologist',
    experience: '8 years',
    rating: 4.7,
    reviews: 189,
    fee: 349,
    nextSlot: '2:00 PM',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
  },
];

export const Consultation: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [consultType, setConsultType] = useState<'video' | 'chat'>('video');

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
          <h1 className="text-lg font-semibold">Doctor Consultation</h1>
        </div>

        {/* Consult Type Toggle */}
        <div className="px-4 py-4">
          <div className="flex bg-muted p-1 rounded-xl">
            <button
              onClick={() => setConsultType('video')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all font-medium text-sm",
                consultType === 'video'
                  ? "bg-card shadow-md text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Video size={18} />
              Video Call
            </button>
            <button
              onClick={() => setConsultType('chat')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all font-medium text-sm",
                consultType === 'chat'
                  ? "bg-card shadow-md text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <MessageCircle size={18} />
              Chat
            </button>
          </div>
        </div>

        {/* Specialties */}
        <div className="px-4 pb-4">
          <h2 className="font-semibold mb-3">Select Specialty</h2>
          <div className="grid grid-cols-3 gap-2">
            {specialties.map((spec) => (
              <button
                key={spec.id}
                onClick={() => setSelectedSpecialty(spec.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                  "border-2",
                  selectedSpecialty === spec.id
                    ? "border-primary bg-primary-light"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <span className="text-2xl">{spec.icon}</span>
                <span className="text-xs font-medium text-center leading-tight">
                  {spec.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Available Doctors */}
        <div className="px-4 pb-6">
          <h2 className="font-semibold mb-3">Available Doctors</h2>
          <div className="space-y-3">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="swift-card-hover"
              >
                <div className="flex gap-3">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{doctor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {doctor.specialty} • {doctor.experience}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Star size={12} className="text-warning fill-warning" />
                        <span className="font-medium">{doctor.rating}</span>
                        <span className="text-muted-foreground">
                          ({doctor.reviews})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">₹{doctor.fee}</p>
                    <p className="text-xs text-muted-foreground">per session</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1 text-sm text-success">
                    <Clock size={14} />
                    <span>Next: {doctor.nextSlot}</span>
                  </div>
                  <Button size="sm" variant="soft" onClick={() => navigate(`/doctor/${doctor.id}`)}>
                    <Calendar size={14} />
                    Book Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Consultation;
