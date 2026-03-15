import type { Pharmacy } from '@/types';
import { supabaseClient } from './supabaseClient';

const toRad = (deg: number) => (deg * Math.PI) / 180;
const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const pharmacyService = {
  async getNearbyPharmacies(userLat = 0, userLng = 0, limit = 20): Promise<Pharmacy[]> {
    const rows = await supabaseClient.from('pharmacies').query<any[]>(`select=*&limit=${limit}`);

    return rows
      .map((row) => {
        const distance = row.latitude && row.longitude
          ? haversineKm(userLat, userLng, Number(row.latitude), Number(row.longitude))
          : 0;

        return {
          id: row.id,
          name: row.name,
          address: row.address ?? '',
          distance: `${distance.toFixed(1)} km`,
          deliveryTime: row.delivery_time ?? '20-30 mins',
          rating: Number(row.rating ?? 4.5),
          reviewCount: 0,
          image: row.image_url ?? '/placeholder.svg',
          isOpen: row.is_open !== false,
        };
      })
      .sort((a, b) => Number(a.distance.split(' ')[0]) - Number(b.distance.split(' ')[0]));
  },
};

export default pharmacyService;
