import type { Consultation, Doctor, TimeSlot } from '@/types';
import { supabaseClient } from './supabaseClient';

const mapDoctor = (row: any): Doctor => ({
  id: row.id,
  name: row.name,
  specialty: row.specialties?.name ?? 'General Physician',
  experience: `${row.experience_years ?? 0} years`,
  rating: Number(row.rating ?? 0),
  reviews: 0,
  fee: Number(row.consultation_fee ?? 0),
  nextSlot: 'Today',
  image: row.photo_url ?? '/placeholder.svg',
  about: row.about ?? undefined,
  languages: row.languages ?? undefined,
  education: row.education ?? undefined,
});

export const doctorService = {
  async getDoctors(specialtyId?: string): Promise<Doctor[]> {
    const filters = specialtyId ? `&specialty_id=eq.${specialtyId}` : '';
    const rows = await supabaseClient.from('doctors').query<any[]>(`select=*,specialties(name)${filters}`);
    return rows.map(mapDoctor);
  },

  async getDoctorById(id: string): Promise<Doctor | null> {
    const rows = await supabaseClient.from('doctors').query<any[]>(`select=*,specialties(name)&id=eq.${id}&limit=1`);
    return rows[0] ? mapDoctor(rows[0]) : null;
  },

  async getAvailableSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
    const rows = await supabaseClient
      .from('availability_slots')
      .query<any[]>(`select=*&doctor_id=eq.${doctorId}&slot_date=eq.${date}&is_available=eq.true&order=slot_time.asc`);

    return rows.map((r) => ({ id: r.id, time: r.slot_time, date: r.slot_date, available: r.is_available }));
  },

  async bookAppointment(payload: { patientId: string; doctorId: string; appointmentDate: string; appointmentTime: string; consultationType: 'video' | 'chat' }): Promise<void> {
    await supabaseClient.from('appointments').insert([{
      patient_id: payload.patientId,
      doctor_id: payload.doctorId,
      appointment_date: payload.appointmentDate,
      appointment_time: payload.appointmentTime,
      consultation_type: payload.consultationType,
      status: 'pending',
    }]);
  },

  async getConsultations(patientId: string): Promise<Consultation[]> {
    const rows = await supabaseClient
      .from('appointments')
      .query<any[]>(`select=*,doctors(*,specialties(name))&patient_id=eq.${patientId}&order=appointment_date.desc`);
    return rows.map((r) => ({
      id: r.id,
      doctorId: r.doctor_id,
      doctor: mapDoctor(r.doctors),
      userId: r.patient_id,
      timeSlot: { id: `${r.id}-slot`, date: r.appointment_date, time: r.appointment_time, available: true },
      status: r.status === 'pending' ? 'scheduled' : r.status,
      mode: r.consultation_type,
      createdAt: new Date(r.created_at),
    }));
  },
};

export default doctorService;
