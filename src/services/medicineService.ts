import type { Category, Medicine } from '@/types';
import { supabase } from "../lib/supabase";

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
    const { data: rows, error } = await supabase
      .from('medicine_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Error categories:", error.message);
      return [];
    }

    return (rows || []).map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon ?? '💊',
      color: row.color ?? 'bg-primary-light',
    }));
  },

  async getMedicines(params?: { categoryId?: string; search?: string; limit?: number; offset?: number }): Promise<Medicine[]> {
    let query = supabase.from('medicines').select('*, pharmacies(name)');

    if (params?.categoryId) {
      query = query.eq('category_id', params.categoryId);
    }
    
    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    query = query.order('name', { ascending: true });

    if (typeof params?.limit === 'number') query = query.limit(params.limit);
    if (typeof params?.offset === 'number') query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

    const { data: rows, error } = await query;
    
    if (error) {
      console.error("Error medicines:", error.message);
      return [];
    }

    return (rows || []).map(mapMedicine);
  },

  async getMedicineById(id: string): Promise<Medicine | null> {
    const { data, error } = await supabase
      .from('medicines')
      .select('*, pharmacies(name)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapMedicine(data);
  },

  async getPopularMedicines(limit = 10): Promise<Medicine[]> {
    const { data: rows, error } = await supabase
      .from('medicines')
      .select('*, pharmacies(name)')
      .order('order_count', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error || !rows || rows.length === 0) {
      return this.getMedicines({ limit });
    }
    
    return rows.map(mapMedicine);
  },
};

export default medicineService;