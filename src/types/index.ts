export type UserRole = 'admin' | 'tutor';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  institution?: string; // Kampus / Universitas / Sekolah
  status?: 'active' | 'inactive';
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE_MEETING' | 'UPDATE_RATES' | 'UPDATE_PAYROLL';
  details: string;
  timestamp: string;
}

export type ClassType =
  | 'Kids-A'
  | 'Kids-B'
  | 'SPL-A'
  | 'SPL-B'
  | 'Group'
  | 'Test Prep-A'
  | 'Test Prep-B'
  | 'Social Banjar/Panti'
  | 'Free Trial';

export type LDRZone = 'none' | 'ldr_10' | 'ldr_15' | 'ldr_20' | 'panti_klungkung';

export interface RateConfig {
  baseFees: Record<ClassType, number>;
  ldrBonus: {
    ldr_10: number;
    ldr_15: number;
    ldr_20: number;
    panti_klungkung: number;
  };
  standardBonus: {
    videoPerItem: number;
    reportPerStudent: number;
    fnmPerClosing: number;
  };
  standardDeductions: {
    sukaDuka: number;
    lateAttendance: number;
    violationOJL_GC: number;
    lateVideo: number;
    suddenLeave: number;
  };
}

export interface Classroom {
  id: string;
  name: string;
  type: ClassType;
  students: string[]; // Mendukung 1 - 10 nama siswa
  totalMeetings: number;
  ldrZone: LDRZone;
  status: 'active' | 'completed';
}

export interface Meeting {
  id: string;
  classroomId: string;
  meetingNumber: number;
  tutorId: string;
  tutorName: string;
  date: string;
  lesson: string;
  notes?: string;
  isLocked: boolean;
  ldrZoneSnapshot: LDRZone;
  hasVideoClaim?: boolean; // <-- Tambahan klaim video sesi
}

export interface FreeTrial {
  id: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  date: string;
  lesson: string;
  status: 'completed' | 'pending';
}

export interface MonthlyAdjustment {
  id: string;
  tutorId: string;
  month: string; // Format "YYYY-MM", misal "2026-09"
  // Bonus counts
  videoCount: number;
  reportCount: number;
  fnmCount: number;
  customBonusNominal: number;
  customBonusNote: string;
  // Deductions
  applySukaDuka: boolean;
  lateAttendanceCount: number;
  violationCount: number;
  lateVideoCount: number;
  suddenLeaveCount: number;
  customDeductionNominal: number;
  customDeductionNote: string;
}