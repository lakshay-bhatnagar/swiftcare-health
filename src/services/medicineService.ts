import type { Category, Medicine } from '@/types';
import { supabaseClient } from './supabaseClient';

const mapMedicine = (row: any): Medicine => {
  const mrp = Number(row.price);
  const discounted = Number(row.discounted_price ?? row.price);
  const discount = mrp > 0 ? Math.round(((mrp - discounted) / mrp) * 100) : 0;

  return {
    id: row.id,
    name: row.name,
    genericName: row.generic_name ?? row.name,
    category: row.category_id ?? 'general',
    price: discounted,
    mrp,
    discount,
    image: row.image_url ?? '/placeholder.svg',
    description: row.description ?? 'No description available.',
    dosage: row.dosage ?? 'As directed by physician.',
    manufacturer: row.manufacturer ?? 'N/A',
    prescriptionRequired: Boolean(row.is_prescription_required),
    inStock: row.in_stock !== false,
    pharmacyId: row.pharmacy_id,
    pharmacyName: row.pharmacies?.name ?? 'Unknown Pharmacy',
  };
};

export const medicineService = {
  async getCategories(): Promise<Category[]> {
    const rows = await supabaseClient.from('medicine_categories').query<any[]>(
      'select=*&is_active=eq.true&order=sort_order.asc.nullslast'
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon ?? '💊',
      color: row.color ?? 'bg-primary-light',
    }));
  },

  async getMedicines(params?: { categoryId?: string; search?: string; limit?: number; offset?: number }): Promise<Medicine[]> {
    const query: string[] = ['select=*,pharmacies(name)'];
    if (params?.categoryId) query.push(`category_id=eq.${params.categoryId}`);
    if (params?.search) query.push(`name=ilike.*${encodeURIComponent(params.search)}*`);
    query.push('order=name.asc');
    if (typeof params?.limit === 'number') query.push(`limit=${params.limit}`);
    if (typeof params?.offset === 'number') query.push(`offset=${params.offset}`);

    const rows = await supabaseClient.from('medicines').query<any[]>(query.join('&'));
    return rows.map(mapMedicine);
  },

  async getMedicineById(id: string): Promise<Medicine | null> {
    const rows = await supabaseClient
      .from('medicines')
      .query<any[]>(`select=*,pharmacies(name)&id=eq.${id}&limit=1`);
    return rows[0] ? mapMedicine(rows[0]) : null;
  },

  async getPopularMedicines(limit = 10): Promise<Medicine[]> {
    const rows = await supabaseClient
      .from('medicines')
      .query<any[]>(`select=*,pharmacies(name)&order=order_count.desc.nullslast&limit=${limit}`);

    if (rows.length) return rows.map(mapMedicine);
    return this.getMedicines({ limit });
  },
};

export default medicineService;
