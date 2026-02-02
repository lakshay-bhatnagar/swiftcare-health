import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, MessageCircle, Calendar, Clock, CheckCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { doctorService } from '@/services/doctor.service';
import { toast } from 'sonner';

const statusConfig = {
  scheduled: { label: 'Scheduled', color: 'text-primary bg-primary-light' },
  in_progress: { label: 'In Progress', color: 'text-warning bg-warning-light' },
  completed: { label: 'Completed', color: 'text-success bg-success-light' },
  cancelled: { label: 'Cancelled', color: 'text-destructive bg-destructive-light' },
};

export const Consultations: React.FC = () => {
  const navigate = useNavigate();
  const { consultations, loadConsultations } = useApp();

  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  const handleCancel = async (id: string) => {
    try {
      await doctorService.cancelConsultation(id);
      await loadConsultations();
      toast.success('Consultation cancelled');
    } catch (error) {
      toast.error('Failed to cancel consultation');
    }
  };

  const upcomingConsultations = consultations.filter(c => c.status === 'scheduled');
  const pastConsultations = consultations.filter(c => c.status !== 'scheduled');

  return (
    <MobileLayout showNav={false}>
      <div className="safe-top pb-6">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-border">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-semibold">My Consultations</h1>
        </div>

        <div className="px-4 py-4">
          {consultations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-muted-foreground" />
              </div>
              <h2 className="font-semibold text-lg mb-2">No consultations yet</h2>
              <p className="text-muted-foreground mb-6">
                Book your first consultation with a doctor
              </p>
              <Button onClick={() => navigate('/consultation')}>
                Book Consultation
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upcoming Consultations */}
              {upcomingConsultations.length > 0 && (
                <div>
                  <h2 className="font-semibold text-lg mb-3">Upcoming</h2>
                  <div className="space-y-3">
                    {upcomingConsultations.map((consultation, index) => {
                      const status = statusConfig[consultation.status];
                      return (
                        <motion.div
                          key={consultation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="swift-card"
                        >
                          <div className="flex gap-3">
                            <img
                              src={consultation.doctor.image}
                              alt={consultation.doctor.name}
                              className="w-14 h-14 rounded-xl object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold">{consultation.doctor.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {consultation.doctor.specialty}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} className="text-primary" />
                                  <span>{format(new Date(consultation.timeSlot.date), 'MMM d')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={14} className="text-primary" />
                                  <span>{consultation.timeSlot.time}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", status.color)}>
                                {status.label}
                              </span>
                              {consultation.mode === 'video' ? (
                                <Video size={18} className="text-muted-foreground" />
                              ) : (
                                <MessageCircle size={18} className="text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(consultation.id)}
                              className="flex-1"
                            >
                              <X size={16} className="mr-1" />
                              Cancel
                            </Button>
                            <Button size="sm" className="flex-1">
                              {consultation.mode === 'video' ? (
                                <>
                                  <Video size={16} className="mr-1" />
                                  Join Call
                                </>
                              ) : (
                                <>
                                  <MessageCircle size={16} className="mr-1" />
                                  Start Chat
                                </>
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Past Consultations */}
              {pastConsultations.length > 0 && (
                <div>
                  <h2 className="font-semibold text-lg mb-3">Past</h2>
                  <div className="space-y-3">
                    {pastConsultations.map((consultation, index) => {
                      const status = statusConfig[consultation.status];
                      return (
                        <motion.div
                          key={consultation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="swift-card opacity-75"
                        >
                          <div className="flex gap-3">
                            <img
                              src={consultation.doctor.image}
                              alt={consultation.doctor.name}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium">{consultation.doctor.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(consultation.timeSlot.date), 'MMM d, yyyy')} at {consultation.timeSlot.time}
                              </p>
                            </div>
                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium h-fit", status.color)}>
                              {status.label}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Consultations;
