import { UserProfile, WorkHour, WorkOrder, WorkOrderDetail } from '@/types';

const API_BASE_URL = 'https://zaposleni-lptt.onrender.com/api';

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles/${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Profil ni najden');
      }
      throw new Error('Napaka pri pridobivanju profila');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function fetchWorkHours(userId: string): Promise<WorkHour[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/workhours/${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error('Napaka pri pridobivanju delovnih ur');
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching work hours:', error);
    throw error;
  }
}

export async function validateUserId(userId: string): Promise<boolean> {
  try {
    await fetchUserProfile(userId);
    return true;
  } catch {
    return false;
  }
}

export async function fetchWorkOrders(): Promise<WorkOrder[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/rdn`);
    
    if (!response.ok) {
      throw new Error('Napaka pri pridobivanju delovnih nalogov');
    }
    
    const data = await response.json();
    const orders = Array.isArray(data) ? data : [];
    
    // Transform backend data to match frontend types
    return orders.map((order: any) => ({
      serijska: order.serijska,
      lokacija: order.lokacija,
      vrsta: order.vrsta,
      material: order.material,
      rok_izvedbe: order.r_razpisa || order.rok_izvedbe || '',
      nacrti: order.nacrt || order.nacrti
    }));
  } catch (error) {
    console.error('Error fetching work orders:', error);
    throw error;
  }
}

export async function fetchWorkOrderDetail(serijska: string): Promise<WorkOrderDetail> {
  try {
    const response = await fetch(`${API_BASE_URL}/rdn/${serijska}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Delovni nalog ni najden');
      }
      throw new Error('Napaka pri pridobivanju podatkov');
    }
    
    const data = await response.json();
    
    // Transform backend data to match frontend types
    return {
      serijska: data.serijska,
      lokacija: data.lokacija,
      vrsta: data.vrsta,
      material: data.material,
      rok_izvedbe: data.rok_izvedbe || data.r_razpisa || '',
      nacrti: data.nacrt || data.nacrti,
      naslov: data.naslov || '',
      narocnik: data.narocnik || '',
      izvajalec: data.izvajalec || '',
      datum_razpisa: data.datum_razpisa || data.r_razpisa || '',
      opis_dela: data.opis_dela || ''
    };
  } catch (error) {
    console.error('Error fetching work order detail:', error);
    throw error;
  }
}
