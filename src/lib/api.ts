import { UserProfile, WorkHour } from '@/types';

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
    { id: '1', stevilo: 8, datum: '2025-01-15' },
    { id: '2', stevilo: 7.5, datum: '2025-01-16' },
    { id: '3', stevilo: 8, datum: '2025-01-17' },
    { id: '4', stevilo: 6, datum: '2025-01-18' }
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
