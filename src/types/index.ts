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
  stevilo: number;
  datum?: string;
}

export interface UserStats {
  workHours: number;
  messages: number;
  completedTasks: number;
}
