import core from './doctorService';
import { supabaseClient } from './supabaseClient';

const getUserId = async () => {
  const user = await supabaseClient.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

export const doctorService = {
  getDoctors: core.getDoctors,
  getDoctorById: core.getDoctorById,
  async getAvailableSlots(doctorId: string, date?: string) {
    return core.getAvailableSlots(doctorId, date || new Date().toISOString().slice(0, 10));
  },
  async bookConsultation(doctorId: string, slot: any, mode: 'video' | 'chat') {
    await core.bookAppointment({ patientId: await getUserId(), doctorId, appointmentDate: slot.date, appointmentTime: slot.time, consultationType: mode });
    return { id: `appt-${Date.now()}` };
  },
  async getConsultations() {
    return core.getConsultations(await getUserId());
  },
  async getUpcomingConsultations() {
    return (await core.getConsultations(await getUserId())).filter((c) => c.status === 'scheduled');
  },
  async cancelConsultation() {},
  async completeConsultation() {},
};

export default doctorService;
