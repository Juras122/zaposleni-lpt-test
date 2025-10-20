export interface UserProfile {
  id: string;
  ime: string;
  naziv: string;
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
  status: string;
  lokacija: string;
  vrsta: string;
  material: string;
  r_razpisa: string;
  nacrt?: string;
}

export interface WorkOrderDetail extends WorkOrder {
  naslov: string;
  narocnik: string;
  izvajalec: string;
  d_razpisa: string;
  opis: string;
}

export interface WarehouseItem {
  id: string;
  serijska_koda: string;
  ime: string;
  stevilo: number;
  enota: string;
  lokacija: string;
  datum_vnosa: string;
  zadnja_sprememba: string;
}
