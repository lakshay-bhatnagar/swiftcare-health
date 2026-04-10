import type { Pharmacy, Medicine } from '@/types';
import { supabase } from "../lib/supabase"; // Use the standard SDK instance

const toRad = (deg: number) => (deg * Math.PI) / 180;

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const pharmacyService = {
  async getNearbyPharmacies(userLat = 0, userLng = 0, limit = 20): Promise<Pharmacy[]> {
    const { data: rows, error } = await supabase
      .from('pharmacies')
      .select('*')
      .limit(limit);

    if (error) {
      console.error("Error fetching pharmacies:", error.message);
      return [];
    }

    return (rows || [])
      .map((row) => {
        const distance =
          row.latitude && row.longitude
            ? haversineKm(userLat, userLng, Number(row.latitude), Number(row.longitude))
            : 0;

        return {
          id: row.id,
          name: row.name,
          address: row.address ?? '',
          distance: `${distance.toFixed(1)} km`,
          deliveryTime: row.delivery_time ?? '20-30 mins',
          rating: Number(row.rating ?? 4.5),
          reviewCount: row.total_reviews ?? 0,
          image: row.image_url ?? '/placeholder.svg',
          isOpen: row.is_open !== false,
        };
      })
      .sort((a, b) => Number(a.distance.split(' ')[0]) - Number(b.distance.split(' ')[0]));
  },

  async getPharmacyById(id: string): Promise<Pharmacy | null> {
    const { data: row, error } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !row) return null;

    return {
      id: row.id,
      name: row.name,
      address: row.address ?? '',
      distance: '0 km',
      deliveryTime: row.delivery_time ?? '20-30 mins',
      rating: Number(row.rating ?? 4.5),
      reviewCount: row.total_reviews ?? 0,
      image: row.image_url ?? '/placeholder.svg',
      isOpen: row.is_open !== false,
    };
  },

  async getPharmacyMedicines(pharmacyId: string): Promise<Medicine[]> {
    const { data: rows, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('pharmacy_id', pharmacyId);

    if (error) return [];

    return (rows || []).map((row): Medicine => ({
      id: row.id,
      name: row.name ?? '',
      genericName: row.generic_name ?? '',
      category: row.category ?? '',
      price: Number(row.price ?? 0),
      mrp: Number(row.mrp ?? row.price ?? 0),
      discount: Number(row.discount ?? 0),
      image: row.image_url ?? '/placeholder.svg',
      description: row.description ?? '',
      dosage: row.dosage ?? '',
      manufacturer: row.manufacturer ?? '',
      prescriptionRequired: row.prescription_required ?? false,
      inStock: row.in_stock !== false,
      pharmacyId: row.pharmacy_id ?? '',
      pharmacyName: row.pharmacy_name ?? '',
    }));
  },
};

export default pharmacyService;