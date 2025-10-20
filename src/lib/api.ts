import { UserProfile, WorkHour, WorkOrder, WorkOrderDetail } from '@/types';

// Mock API functions - replace with actual API calls when backend is ready
export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock data for demonstration
  const mockProfiles: Record<string, UserProfile> = {
    '1': {
      id: '1',
      ime: 'Janez Novak',
      username: 'jnovak',
      naziv: 'Vodja Projekta',
      title: 'Vodja Projekta',
      email: 'janez.novak@lpt.si',
      telefon: '+386 41 234 567'
    },
    '2': {
      id: '2',
      ime: 'Ana Kovač',
      username: 'akovac',
      naziv: 'Inženir',
      title: 'Inženir',
      email: 'ana.kovac@lpt.si',
      telefon: '+386 41 345 678'
    }
  };
  
  const profile = mockProfiles[userId];
  if (!profile) {
    throw new Error('Profil ni najden');
  }
  
  return profile;
}

export async function fetchWorkHours(userId: string): Promise<WorkHour[]> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Mock data
  return [
    { id: '1', datum: '2025-01-15', dan: 'Sreda', prihod: '08:00', odhod: '16:00', stevilo: 8 },
    { id: '2', datum: '2025-01-16', dan: 'Četrtek', prihod: '07:30', odhod: '15:00', stevilo: 7.5 },
    { id: '3', datum: '2025-01-17', dan: 'Petek', prihod: '08:00', odhod: '16:00', stevilo: 8 },
    { id: '4', datum: '2025-01-18', dan: 'Ponedeljek', prihod: '09:00', odhod: '15:00', stevilo: 6 },
    { id: '5', datum: '2025-01-19', dan: 'Torek', prihod: '08:00', odhod: '16:30', stevilo: 8.5 }
  ];
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
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 250));
  
  // Mock data
  return [
    {
      serijska: 'DN-2025-001',
      lokacija: 'Ljubljana, Celovška 150',
      vrsta: 'Asfaltiranje',
      material: 'Asfalt AC 11',
      rok_izvedbe: '2025-02-15',
      nacrti: 'PDF'
    },
    {
      serijska: 'DN-2025-002',
      lokacija: 'Maribor, Titova 20',
      vrsta: 'Tlakovanje',
      material: 'Granitne kocke',
      rok_izvedbe: '2025-02-20',
      nacrti: 'PDF'
    },
    {
      serijska: 'DN-2025-003',
      lokacija: 'Kranj, Prešernova 5',
      vrsta: 'Parkiranje',
      material: 'Beton',
      rok_izvedbe: '2025-03-01',
      nacrti: 'PDF'
    }
  ];
}

export async function fetchWorkOrderDetail(serijska: string): Promise<WorkOrderDetail> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 250));
  
  // Mock detailed data
  const mockDetails: Record<string, WorkOrderDetail> = {
    'DN-2025-001': {
      serijska: 'DN-2025-001',
      naslov: 'Obnova cestišča - Celovška cesta',
      narocnik: 'Mestna občina Ljubljana',
      izvajalec: 'Janez Novak',
      datum_razpisa: '2025-01-10',
      rok_izvedbe: '2025-02-15',
      lokacija: 'Ljubljana, Celovška 150',
      vrsta: 'Asfaltiranje',
      material: 'Asfalt AC 11',
      opis_dela: 'Sanacija cestišča na odseku 200m, vključno z odstranitvijo starega asfalta in polaganjem novega. Potrebno je izvesti tudi ureditev robnikov.',
      nacrti: 'PDF'
    },
    'DN-2025-002': {
      serijska: 'DN-2025-002',
      naslov: 'Ureditev mestnega trga',
      narocnik: 'Mestna občina Maribor',
      izvajalec: 'Ana Kovač',
      datum_razpisa: '2025-01-12',
      rok_izvedbe: '2025-02-20',
      lokacija: 'Maribor, Titova 20',
      vrsta: 'Tlakovanje',
      material: 'Granitne kocke',
      opis_dela: 'Popolna obnova tlakovanja mestnega trga z granitnimi kockami. Površina 500m². Vključuje pripravo podlage in polaganje kock v vzorcu.',
      nacrti: 'PDF'
    }
  };
  
  const detail = mockDetails[serijska];
  if (!detail) {
    throw new Error('Delovni nalog ni najden');
  }
  
  return detail;
}
