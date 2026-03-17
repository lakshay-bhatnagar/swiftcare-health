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

  // doctorService.ts
  async getAvailableSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
    // We query using the exact names from your new schema
    const rows = await supabaseClient
      .from('availability_slots')
      .query<any[]>(
        `select=*&doctor_id=eq.${doctorId}&slot_date=eq.${date}&is_available=eq.true&order=slot_time.asc`
      );

    return rows.map((r) => ({
      id: r.id,
      time: r.slot_time, // matches slot_time column
      date: r.slot_date, // matches slot_date column
      available: r.is_available, // matches is_available column
    }));
  },

  async bookAppointment(payload: {
    patientId: string;
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    consultationType: 'video' | 'chat'
  }): Promise<void> {
    // 1. Insert the appointment record
    await supabaseClient.from('appointments').insert([{
      patient_id: payload.patientId,
      doctor_id: payload.doctorId,
      appointment_date: payload.appointmentDate,
      appointment_time: payload.appointmentTime,
      consultation_type: payload.consultationType,
      status: 'pending',
    }]);

    // 2. Mark the slot as taken so it disappears from the available list
    // Note: If your supabaseClient supports .update(), use that. 
    // Otherwise, you can use a query-based update if your client allows.
    await supabaseClient.from('availability_slots').update(
      `doctor_id=eq.${payload.doctorId}&slot_date=eq.${payload.appointmentDate}&slot_time=eq.${payload.appointmentTime}`, // filters
      { is_available: false } // payload
    );
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
