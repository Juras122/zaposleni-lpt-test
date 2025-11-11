// api.ts (Posodobljena različica)

import { UserProfile, WorkHour, WorkOrder, WorkOrderDetail, WarehouseItem, WorkEntry } from '@/types';

// *** 1. Nastavitev baznega URL-ja ***
const BASE_URL = 'https://zaposleni-lptt.onrender.com/api';

// Pomožna funkcija za obravnavo odgovorov
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP napaka: ${response.status} - ${response.statusText}. Podrobnosti: ${errorText}`);
  }
  return response.json();
}

// ------------------------------------------------------------------------------------------------------------------

// Funkcija 1: Pridobivanje uporabniškega profila
export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  // Klic na: https://zaposleni-lptt.onrender.com/api/profiles/:id
  const response = await fetch(`${BASE_URL}/profiles/${userId}`);
  
  // Backend obravnava logiko za pridobivanje iz Postgresql (glej index.js -> app.get('/api/profiles/:id'))
  return handleResponse<UserProfile>(response);
}

// Funkcija 2: Pridobivanje delovnih ur
export async function fetchWorkHours(userId: string): Promise<WorkHour[]> {
  // Klic na: https://zaposleni-lptt.onrender.com/api/workhours/:id
  const response = await fetch(`${BASE_URL}/workhours/${userId}`);
  
  // Backend obravnava logiko za pridobivanje iz Postgresql (glej index.js -> app.get('/api/workhours/:id'))
  // Opomba: Vaš backend vrne polje objektov, kar se ujema z WorkHour[]
  return handleResponse<WorkHour[]>(response);
}

// Funkcija 3: Preverjanje ID-ja
export async function validateUserId(userId: string): Promise<boolean> {
  try {
    // Klic na: https://zaposleni-lptt.onrender.com/api/profiles/:id
    const response = await fetch(`${BASE_URL}/profiles/${userId}`);
    // Uspešen odgovor (200 OK) pomeni, da je ID veljaven
    return response.ok;
  } catch {
    // Karkoli drugega (omrežna napaka, CORS, itd.) pomeni, da ne moremo potrditi veljavnosti
    return false;
  }
}

// Funkcija 4: Pridobivanje seznama delovnih nalogov (RDN)
export async function fetchWorkOrders(): Promise<WorkOrder[]> {
  // Klic na: https://zaposleni-lptt.onrender.com/api/rdn
  const response = await fetch(`${BASE_URL}/rdn`);
  
  // Backend obravnava logiko za pridobivanje iz Postgresql (glej index.js -> app.get('/api/rdn'))
  return handleResponse<WorkOrder[]>(response);
}


// Funkcija 5: Pridobivanje podrobnosti enega delovnega naloga
export async function fetchWorkOrderDetail(serijska: string): Promise<WorkOrderDetail> {
  // Klic na: https://zaposleni-lptt.onrender.com/api/rdn/:serijska
  const response = await fetch(`${BASE_URL}/rdn/${serijska}`);
  
  // Backend obravnava logiko za pridobivanje iz Postgresql (glej index.js -> app.get('/api/rdn/:serijska'))
  return handleResponse<WorkOrderDetail>(response);
}

// Funkcija 6: Pridobivanje predmetov iz skladišča
export async function fetchWarehouseItems(): Promise<WarehouseItem[]> {
  // Klic na: https://zaposleni-lptt.onrender.com/api/warehouse
  const response = await fetch(`${BASE_URL}/warehouse`);
  
  // Backend obravnava logiko za pridobivanje iz Postgresql (glej index.js -> app.get('/api/warehouse'))
  return handleResponse<WarehouseItem[]>(response);
}

// Funkcija 7: Pridobivanje vseh uporabnikov
export async function fetchAllUsers(): Promise<UserProfile[]> {
  // Klic na: https://zaposleni-lptt.onrender.com/api/profiles
  const response = await fetch(`${BASE_URL}/profiles`);
  
  // Backend obravnava logiko za pridobivanje vseh uporabnikov iz Postgresql
  return handleResponse<UserProfile[]>(response);
}

// Funkcija 8: Dodajanje work entry
export async function addWorkEntry(entry: {
  workOrderId: string;
  nazivElementa: string;
  znacilka?: string;
  dolzina?: string;
  stElementov?: string;
  material?: string;
  kvadratura?: string;
}): Promise<WorkEntry> {
  const response = await fetch(`${BASE_URL}/work-entries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  });
  
  return handleResponse<WorkEntry>(response);
}

// Funkcija 9: Pridobivanje work entries za delovni nalog
export async function fetchWorkEntries(workOrderId: string): Promise<WorkEntry[]> {
  try {
    const response = await fetch(`${BASE_URL}/work-entries/${workOrderId}`);
    
    // Če endpoint ne obstaja (404), vrni prazen array
    if (response.status === 404) {
      console.warn(`Work entries endpoint not found for order ${workOrderId}`);
      return [];
    }
    
    return handleResponse<WorkEntry[]>(response);
  } catch (error) {
    console.error('Error fetching work entries:', error);
    return [];
  }
}

// Funkcija 10: Kreiranje novega delovnega naloga
export async function createWorkOrder(orderData: {
  serijska: string;
  naslov: string;
  narocnik?: string;
  izvajalec?: string;
  status: string;
  lokacija?: string;
  vrsta?: string;
  material?: string;
  d_razpisa?: string;
  r_razpisa?: string;
  opis?: string;
  nacrt?: string;
}): Promise<WorkOrderDetail> {
  const response = await fetch(`${BASE_URL}/rdn`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  
  return handleResponse<WorkOrderDetail>(response);
}

// Funkcija 11: Posodabljanje delovnega naloga
export async function updateWorkOrder(serijska: string, orderData: {
  naslov?: string;
  narocnik?: string;
  izvajalec?: string;
  status?: string;
  lokacija?: string;
  vrsta?: string;
  material?: string;
  d_razpisa?: string;
  r_razpisa?: string;
  opis?: string;
  nacrt?: string;
}): Promise<WorkOrderDetail> {
  const response = await fetch(`${BASE_URL}/rdn/${serijska}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  
  return handleResponse<WorkOrderDetail>(response);
}

// Funkcija 12: Brisanje delovnega naloga
export async function deleteWorkOrder(serijska: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/rdn/${serijska}`, {
    method: 'DELETE',
  });
  
  await handleResponse(response);
}

// Funkcija 13: Posodabljanje work entry
export async function updateWorkEntry(entryId: string, entryData: {
  nazivElementa?: string;
  znacilka?: string;
  dolzina?: string;
  stElementov?: string;
  material?: string;
  kvadratura?: string;
}): Promise<WorkEntry> {
  const response = await fetch(`${BASE_URL}/work-entries/${entryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entryData),
  });
  
  return handleResponse<WorkEntry>(response);
}
