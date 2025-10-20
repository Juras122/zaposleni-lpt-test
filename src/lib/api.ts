import { UserProfile, WorkHour, WorkOrder, WorkOrderDetail, WarehouseItem } from '@/types';

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
      serijska: '284759301621',
      lokacija: 'Zaloška cesta (pri OŠ)',
      vrsta: 'novo',
      material: 'plastika',
      rok_izvedbe: '2024-10-13',
      nacrti: '3d_prehod_zaloska.dwg'
    },
    {
      serijska: '510948372605',
      lokacija: 'Barjanska cesta',
      vrsta: 'obnova',
      material: 'barva',
      rok_izvedbe: '2024-10-30',
      nacrti: 'oznake_barjanska.pdf'
    },
    {
      serijska: '936201847594',
      lokacija: 'Dunajska cesta - odsek 3',
      vrsta: 'novo',
      material: 'barva',
      rok_izvedbe: '2024-11-02',
      nacrti: 'kolesarski_pas_dunajska.pdf'
    }
  ];
}

export async function fetchWorkOrderDetail(serijska: string): Promise<WorkOrderDetail> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 250));
  
  // Mock detailed data
  const mockDetails: Record<string, WorkOrderDetail> = {
    '284759301621': {
      serijska: '284759301621',
      naslov: 'Postavitev 3D prehoda za pešce',
      narocnik: 'MOL',
      izvajalec: 'JP LPT',
      datum_razpisa: '2024-09-28',
      rok_izvedbe: '2024-10-13',
      lokacija: 'Zaloška cesta (pri OŠ)',
      vrsta: 'novo',
      material: 'plastika',
      opis_dela: 'Izvedba termoplastične 3D iluzije prehoda za pešce.',
      nacrti: '3d_prehod_zaloska.dwg'
    },
    '510948372605': {
      serijska: '510948372605',
      naslov: 'Obnova talnih oznak na križišču Barjanska/Izanska',
      narocnik: 'MOL',
      izvajalec: 'SIGNA',
      datum_razpisa: '2024-10-15',
      rok_izvedbe: '2024-10-30',
      lokacija: 'Barjanska cesta',
      vrsta: 'obnova',
      material: 'barva',
      opis_dela: 'Ponovno barvanje smernih in robnih črt ter puščic.',
      nacrti: 'oznake_barjanska.pdf'
    },
    '936201847594': {
      serijska: '936201847594',
      naslov: 'Označitev novih kolesarskih pasov',
      narocnik: 'MOL',
      izvajalec: 'SIGNA',
      datum_razpisa: '2024-10-18',
      rok_izvedbe: '2024-11-02',
      lokacija: 'Dunajska cesta - odsek 3',
      vrsta: 'novo',
      material: 'barva',
      opis_dela: 'Barvanje posebnih kolesarskih pasov z zeleno cestno barvo.',
      nacrti: 'kolesarski_pas_dunajska.pdf'
    }
  };
  
  const detail = mockDetails[serijska];
  if (!detail) {
    throw new Error('Delovni nalog ni najden');
  }
  
  return detail;
}

export async function fetchWarehouseItems(): Promise<WarehouseItem[]> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Mock data
  return [
    {
      id: '1',
      serijska_koda: 'MAT-2024-001',
      ime: 'Termoplastična barva - bela',
      stevilo: 150,
      enota: 'kg',
      lokacija: 'Skladišče A-1',
      datum_vnosa: '2024-01-10',
      zadnja_sprememba: '2024-10-15'
    },
    {
      id: '2',
      serijska_koda: 'MAT-2024-002',
      ime: 'Termoplastična barva - rumena',
      stevilo: 85,
      enota: 'kg',
      lokacija: 'Skladišče A-1',
      datum_vnosa: '2024-01-10',
      zadnja_sprememba: '2024-10-12'
    },
    {
      id: '3',
      serijska_koda: 'OPR-2024-015',
      ime: 'Stroj za črtanje Graco LineLazer',
      stevilo: 2,
      enota: 'kos',
      lokacija: 'Skladišče B-3',
      datum_vnosa: '2024-03-05',
      zadnja_sprememba: '2024-09-20'
    },
    {
      id: '4',
      serijska_koda: 'MAT-2024-008',
      ime: 'Refleksijska steklena kroglica',
      stevilo: 500,
      enota: 'kg',
      lokacija: 'Skladišče A-2',
      datum_vnosa: '2024-02-14',
      zadnja_sprememba: '2024-10-18'
    },
    {
      id: '5',
      serijska_koda: 'OPR-2024-022',
      ime: 'Merilna naprava za debelino',
      stevilo: 5,
      enota: 'kos',
      lokacija: 'Skladišče B-1',
      datum_vnosa: '2024-04-20',
      zadnja_sprememba: '2024-10-10'
    }
  ];
}
