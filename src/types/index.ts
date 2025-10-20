export interface UserProfile {
  id: string;
  ime: string;
  username?: string;
  naziv: string;
  title?: string;
  email: string;
  telefon: string;
}

export interface WorkHour {
  id: string;
  datum: string;
  dan: string;
  prihod: string;
  odhod: string;
  stevilo: number;
}

export interface UserStats {
  workHours: number;
  messages: number;
  completedTasks: number;
}

export interface WorkOrder {
  serijska: string;
  lokacija: string;
  vrsta: string;
  material: string;
  rok_izvedbe: string;
  nacrti?: string;
}

export interface WorkOrderDetail extends WorkOrder {
  naslov: string;
  narocnik: string;
  izvajalec: string;
  datum_razpisa: string;
  opis_dela: string;
}
