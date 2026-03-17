import core from './doctorService';
import { supabaseClient } from './supabaseClient';

export const getUserId = async () => {
  const raw = localStorage.getItem("swiftcare_supabase_session");

  if (!raw) {
    throw new Error("User not authenticated");
  }

  let session;
  try {
    session = JSON.parse(raw);
  } catch {
    localStorage.removeItem("swiftcare_supabase_session");
    throw new Error("Invalid session");
  }

  if (!session?.access_token) {
    throw new Error("User not authenticated");
  }

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
    }
  );

  if (!res.ok) {
    localStorage.removeItem("swiftcare_supabase_session");
    throw new Error("Session expired");
  }

  const user = await res.json();

  if (!user?.id) {
    throw new Error("Invalid user");
  }

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
