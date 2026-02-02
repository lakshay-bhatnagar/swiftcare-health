import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Video, MessageCircle, Calendar, CheckCircle, Languages, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { doctorService, mockDoctors } from '@/services/doctor.service';
import notificationService from '@/services/notification.service';
import { Doctor, TimeSlot } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

export const DoctorProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addConsultation, addNotification } = useApp();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [consultMode, setConsultMode] = useState<'video' | 'chat'>('video');
  const [isBooking, setIsBooking] = useState(false);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      day: format(date, 'EEE'),
      dayNum: format(date, 'd'),
    };
  });

  useEffect(() => {
    const loadDoctor = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await doctorService.getDoctorById(id);
        setDoctor(data || null);
      } finally {
        setIsLoading(false);
      }
    };
    loadDoctor();
  }, [id]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!id || !selectedDate) return;
      const slotsData = await doctorService.getAvailableSlots(id, selectedDate);
      setSlots(slotsData);
      setSelectedSlot(null);
    };
    loadSlots();
  }, [id, selectedDate]);

  const handleBookConsultation = async () => {
    if (!doctor || !selectedSlot) return;
    
    setIsBooking(true);
    try {
      const consultation = await doctorService.bookConsultation(doctor.id, selectedSlot, consultMode);
      addConsultation(consultation);
      await addNotification({
        title: 'Consultation Booked 👨‍⚕️',
        message: `Your ${consultMode} consultation with ${doctor.name} is scheduled for ${selectedSlot.time} on ${format(new Date(selectedSlot.date), 'MMM d')}.`,
        type: 'consultation',
      });
      toast.success('Consultation booked successfully!');
      navigate('/consultations');
    } catch (error) {
      toast.error('Failed to book consultation');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading || !doctor) {
    return (
      <MobileLayout showNav={false}>
        <div className="safe-top flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse">Loading...</div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNav={false}>
      <div className="safe-top pb-24">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-semibold">Doctor Profile</h1>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Doctor Info */}
          <div className="swift-card flex gap-4">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-20 h-20 rounded-2xl object-cover"
            />
            <div className="flex-1">
              <h2 className="font-bold text-lg">{doctor.name}</h2>
              <p className="text-muted-foreground text-sm">{doctor.specialty}</p>
              <p className="text-muted-foreground text-sm">{doctor.experience} experience</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-sm">
                  <Star size={14} className="text-warning fill-warning" />
                  <span className="font-medium">{doctor.rating}</span>
                  <span className="text-muted-foreground">({doctor.reviews})</span>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          {doctor.about && (
            <div className="swift-card">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground">{doctor.about}</p>
            </div>
          )}

          {/* Languages & Education */}
          <div className="grid grid-cols-2 gap-3">
            {doctor.languages && (
              <div className="swift-card">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Languages size={18} />
                  <span className="font-semibold text-sm">Languages</span>
                </div>
                <p className="text-sm text-muted-foreground">{doctor.languages.join(', ')}</p>
              </div>
            )}
            {doctor.education && (
              <div className="swift-card">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <GraduationCap size={18} />
                  <span className="font-semibold text-sm">Education</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{doctor.education[0]}</p>
              </div>
            )}
          </div>

          {/* Consultation Mode */}
          <div className="swift-card">
            <h3 className="font-semibold mb-3">Consultation Mode</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setConsultMode('video')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all",
                  consultMode === 'video'
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border"
                )}
              >
                <Video size={18} />
                <span className="font-medium">Video</span>
              </button>
              <button
                onClick={() => setConsultMode('chat')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all",
                  consultMode === 'chat'
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border"
                )}
              >
                <MessageCircle size={18} />
                <span className="font-medium">Chat</span>
              </button>
            </div>
          </div>

          {/* Date Selection */}
          <div className="swift-card">
            <h3 className="font-semibold mb-3">Select Date</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={cn(
                    "flex flex-col items-center px-4 py-2 rounded-xl border-2 shrink-0 transition-all",
                    selectedDate === d.date
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border"
                  )}
                >
                  <span className="text-xs font-medium">{d.day}</span>
                  <span className="text-lg font-bold">{d.dayNum}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="swift-card">
            <h3 className="font-semibold mb-3">Available Slots</h3>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && setSelectedSlot(slot)}
                  disabled={!slot.available}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-medium transition-all",
                    !slot.available && "opacity-40 cursor-not-allowed bg-muted",
                    slot.available && selectedSlot?.id === slot.id
                      ? "bg-primary text-primary-foreground"
                      : slot.available && "border border-border hover:border-primary"
                  )}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Consultation Fee</p>
              <p className="font-bold text-xl text-primary">₹{doctor.fee}</p>
            </div>
            <Button
              onClick={handleBookConsultation}
              disabled={!selectedSlot || isBooking}
              size="lg"
            >
              {isBooking ? 'Booking...' : 'Book Now'}
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default DoctorProfile;
