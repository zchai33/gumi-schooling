'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  User,
  ActivityLog,
  RateConfig,
  Classroom,
  Meeting,
  FreeTrial,
  MonthlyAdjustment,
} from '@/types';

// ==========================================
// HELPER KEAMANAN: HASHING PASSWORD (SHA-256)
// ==========================================
const HASH_PREFIX = '$sha256$';

async function hashPassword(plainText: string, salt: string = 'gumi_salt_2026'): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${plainText}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${HASH_PREFIX}${hex}`;
}

async function verifyPassword(plainInput: string, storedPassword: string): Promise<boolean> {
  if (!storedPassword) return false;
  if (!storedPassword.startsWith(HASH_PREFIX)) {
    // Akun lama (plain text legacy)
    return plainInput === storedPassword;
  }
  const inputHash = await hashPassword(plainInput);
  return inputHash === storedPassword;
}

interface AppContextType {
  // Autentikasi & Akun
  isAuthReady: boolean;
  isDataReady: boolean;
  currentUser: User | null;
  users: User[];
  activityLogs: ActivityLog[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updatedData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<boolean>;

  // Navigasi & Tampilan Aktif
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;

  // Audit Pengisian Jurnal (Lockdown SOP)
  isJournalLocked: boolean;
  toggleJournalLock: () => void;

  // Rate Config (Ketentuan Gaji)
  rates: RateConfig;
  updateRates: (newRates: RateConfig) => Promise<void>;
  resetRatesToDefault: () => Promise<void>;

  // Classrooms
  classrooms: Classroom[];
  addClassroom: (classroom: Omit<Classroom, 'id'>) => Promise<void>;
  updateClassroom: (id: string, updatedData: Partial<Classroom>) => Promise<void>;
  deleteClassroom: (id: string) => Promise<void>;

  // Meetings (Jurnal)
  meetings: Meeting[];
  addMeeting: (meetingData: {
    classroomId: string;
    meetingNumber: number;
    lesson: string;
    date: string;
    notes?: string;
    hasVideoClaim?: boolean;
  }) => Promise<void>;
  updateMeeting: (
    meetingId: string,
    updatedData: {
      date: string;
      lesson: string;
      notes?: string;
      hasVideoClaim?: boolean;
      tutorId?: string;
      tutorName?: string;
    }
  ) => Promise<void>;
  clearMeetingSlot: (classroomId: string, meetingNumber: number) => Promise<void>;
  toggleLockMeeting: (meetingId: string) => Promise<void>;
  lockEmptySlot: (classroomId: string, meetingNumber: number) => Promise<void>;

  // Free Trials
  freeTrials: FreeTrial[];
  addFreeTrial: (trialData: { studentName: string; lesson: string; date: string }) => Promise<void>;
  updateFreeTrial: (
    trialId: string,
    updatedData: { studentName: string; lesson: string; date: string; tutorId?: string; tutorName?: string }
  ) => Promise<void>;
  deleteFreeTrial: (trialId: string) => Promise<void>;
  toggleFreeTrialStatus: (trialId: string) => Promise<void>;

  // Penyesuaian Payroll (Bonus & Denda)
  adjustments: MonthlyAdjustment[];
  getAdjustmentForTutor: (tutorId: string, month: string) => MonthlyAdjustment;
  saveAdjustment: (adj: MonthlyAdjustment) => Promise<void>;

  // Trigger Refresh Data Manual
  refreshData: () => Promise<void>;
}

const defaultRates: RateConfig = {
  baseFees: {
    'Kids-A': 35000,
    'Kids-B': 30000,
    'SPL-A': 36000,
    'SPL-B': 32000,
    Group: 35000,
    'Test Prep-A': 55000,
    'Test Prep-B': 40000,
    'Social Banjar/Panti': 50000,
    'Free Trial': 25000,
  },
  ldrBonus: {
    ldr_10: 10000,
    ldr_15: 15000,
    ldr_20: 20000,
    panti_klungkung: 50000,
  },
  standardBonus: {
    videoPerItem: 10000,
    reportPerStudent: 25000,
    fnmPerClosing: 50000,
  },
  standardDeductions: {
    sukaDuka: 10000,
    lateAttendance: 20000,
    violationOJL_GC: 25000,
    lateVideo: 10000,
    suddenLeave: 50000,
  },
};

const defaultUsers: User[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Admin Gumi',
    role: 'admin',
    password: 'admin',
    phone: '081234567890',
    address: 'Denpasar, Bali',
    status: 'active',
  },
  {
    id: 'usr-dewi',
    username: 'dewi',
    name: 'Dewi Ayu',
    role: 'tutor',
    password: 'tutor',
    phone: '081987654321',
    address: 'Gianyar, Bali',
    institution: 'Universitas Udayana',
    status: 'active',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isDataReady, setIsDataReady] = useState<boolean>(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const currentYearMonth = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentYearMonth);

  // Status Kunci Jurnal (Audit SOP)
  const [isJournalLocked, setIsJournalLocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gumi_journal_submission_locked') === 'true';
    }
    return false;
  });

  const toggleJournalLock = () => {
    setIsJournalLocked((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('gumi_journal_submission_locked', String(next));
      }
      return next;
    });
  };

  const [rates, setRates] = useState<RateConfig>(defaultRates);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [freeTrials, setFreeTrials] = useState<FreeTrial[]>([]);
  const [adjustments, setAdjustments] = useState<MonthlyAdjustment[]>([]);

  // 1. Cek sesi localStorage saat browser dibuka
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('gumi_current_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Error parsing stored user session:', e);
        }
      }
      setIsAuthReady(true);
    }
  }, []);

  // 2. Simpan atau hapus ke localStorage saat status user berubah
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentUser) {
        localStorage.setItem('gumi_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('gumi_current_user');
      }
    }
  }, [currentUser]);

  // 3. Tarik seluruh data dari Supabase
  const fetchAllData = useCallback(async () => {
    try {
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData && usersData.length > 0) {
        setUsers(usersData);
      }

      const { data: ratesData } = await supabase.from('rate_configs').select('*').eq('id', 'default_rates').single();
      if (ratesData) {
        setRates({
          baseFees: ratesData.base_fees,
          ldrBonus: ratesData.ldr_bonus,
          standardBonus: ratesData.standard_bonus,
          standardDeductions: ratesData.standard_deductions,
        });
      }

      const { data: classData } = await supabase.from('classrooms').select('*');
      if (classData) {
        setClassrooms(
          classData.map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            students: c.students,
            totalMeetings: c.total_meetings,
            ldrZone: c.ldr_zone,
            status: c.status,
          }))
        );
      }

      const { data: meetingData } = await supabase.from('meetings').select('*');
      if (meetingData) {
        setMeetings(
          meetingData.map((m: any) => ({
            id: m.id,
            classroomId: m.classroom_id,
            meetingNumber: m.meeting_number,
            tutorId: m.tutor_id,
            tutorName: m.tutor_name,
            date: m.date,
            lesson: m.lesson,
            notes: m.notes,
            isLocked: m.is_locked,
            ldrZoneSnapshot: m.ldr_zone_snapshot,
            hasVideoClaim: m.has_video_claim,
          }))
        );
      }

      const { data: trialsData } = await supabase.from('free_trials').select('*');
      if (trialsData) {
        setFreeTrials(
          trialsData.map((ft: any) => ({
            id: ft.id,
            studentName: ft.student_name,
            tutorId: ft.tutor_id,
            tutorName: ft.tutor_name,
            date: ft.date,
            lesson: ft.lesson,
            status: ft.status,
          }))
        );
      }

      const { data: adjData } = await supabase.from('monthly_adjustments').select('*');
      if (adjData) {
        setAdjustments(
          adjData.map((a: any) => ({
            id: a.id,
            tutorId: a.tutor_id,
            month: a.month,
            videoCount: a.video_count || 0,
            reportCount: a.report_count || 0,
            fnmCount: a.fnm_count || 0,
            customBonusNominal: Number(a.custom_bonus_nominal || 0),
            customBonusNote: a.custom_bonus_note || '',
            applySukaDuka: a.apply_suka_duka ?? true,
            lateAttendanceCount: a.late_attendance_count || 0,
            violationCount: a.violation_count || 0,
            lateVideoCount: a.late_video_count || 0,
            suddenLeaveCount: a.sudden_leave_count || 0,
            customDeductionNominal: Number(a.custom_deduction_nominal || 0),
            customDeductionNote: a.custom_deduction_note || '',
          }))
        );
      }

      const { data: logsData } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20);
      if (logsData) {
        setActivityLogs(
          logsData.map((l: any) => ({
            id: l.id,
            userId: l.user_id,
            userName: l.user_name,
            role: l.role,
            action: l.action,
            details: l.details,
            timestamp: l.timestamp,
          }))
        );
      }
    } catch (err) {
      console.error('Gagal mengambil data dari Supabase:', err);
    } finally {
      setIsDataReady(true);
    }
  }, []);

  // 4. Supabase Realtime Listener
  useEffect(() => {
    fetchAllData();

    const channel = supabase
      .channel('gumi-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, () => {
        fetchAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'free_trials' }, () => {
        fetchAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classrooms' }, () => {
        fetchAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'monthly_adjustments' }, () => {
        fetchAllData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllData]);

  const logActivity = async (action: ActivityLog['action'], details: string) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      details,
      timestamp: new Date().toLocaleString('id-ID'),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    await supabase.from('activity_logs').insert([
      {
        id: newLog.id,
        user_id: newLog.userId,
        user_name: newLog.userName,
        role: newLog.role,
        action: newLog.action,
        details: newLog.details,
        timestamp: newLog.timestamp,
      },
    ]);
  };

  // LOGIN DENGAN VERIFIKASI HASH & AUTO-MIGRASI
  const login = async (username: string, plainPass: string): Promise<boolean> => {
    const foundUser = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!foundUser) return false;

    const isValid = await verifyPassword(plainPass, foundUser.password || '');
    if (!isValid) return false;

    // Migrasi transparan: jika password masih teks polos, hash dan simpan kembali ke database
    if (foundUser.password && !foundUser.password.startsWith(HASH_PREFIX)) {
      const hashed = await hashPassword(plainPass);
      foundUser.password = hashed;
      await supabase.from('users').update({ password: hashed }).eq('id', foundUser.id);
    }

    setCurrentUser(foundUser);
    logActivity('LOGIN', `Berhasil masuk ke dalam sistem sebagai ${foundUser.role}`);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gumi_current_user');
    setActiveTab('dashboard');
  };

  // MANAJEMEN AKUN (Password di-hash otomatis sebelum simpan)
  const addUser = async (userData: Omit<User, 'id'>) => {
    const rawPass = userData.password || 'gumi123';
    const securedPassword = rawPass.startsWith(HASH_PREFIX) ? rawPass : await hashPassword(rawPass);

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      password: securedPassword,
      status: 'active',
    };
    setUsers((prev) => [...prev, newUser]);

    await supabase.from('users').insert([
      {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        password: newUser.password,
        phone: newUser.phone,
        address: newUser.address,
        institution: newUser.institution,
        status: newUser.status,
      },
    ]);

    logActivity('UPDATE_PAYROLL', `Menambahkan akun baru: ${newUser.name} (${newUser.role})`);
  };

  const updateUser = async (id: string, updatedData: Partial<User>) => {
    const payload: Partial<User> = { ...updatedData };

    if (payload.password && !payload.password.startsWith(HASH_PREFIX)) {
      payload.password = await hashPassword(payload.password);
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...payload } : u))
    );

    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...payload } : prev));
    }

    await supabase.from('users').update(payload).eq('id', id);
    logActivity('UPDATE_PAYROLL', `Memperbarui data profil/kredensial akun: ID ${id}`);
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    if (currentUser?.id === id) {
      alert('Tidak dapat menghapus akun yang sedang aktif digunakan saat ini!');
      return false;
    }
    const target = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    await supabase.from('users').delete().eq('id', id);
    logActivity('UPDATE_PAYROLL', `Menghapus akun pengguna: ${target?.name || id}`);
    return true;
  };

  // RATE CONFIG
  const updateRates = async (newRates: RateConfig) => {
    setRates(newRates);
    await supabase.from('rate_configs').upsert({
      id: 'default_rates',
      base_fees: newRates.baseFees,
      ldr_bonus: newRates.ldrBonus,
      standard_bonus: newRates.standardBonus,
      standard_deductions: newRates.standardDeductions,
      updated_at: new Date().toISOString(),
    });
    logActivity('UPDATE_RATES', 'Admin memperbarui konfigurasi ketentuan gaji');
  };

  const resetRatesToDefault = async () => {
    setRates(defaultRates);
    await supabase.from('rate_configs').upsert({
      id: 'default_rates',
      base_fees: defaultRates.baseFees,
      ldr_bonus: defaultRates.ldrBonus,
      standard_bonus: defaultRates.standardBonus,
      standard_deductions: defaultRates.standardDeductions,
      updated_at: new Date().toISOString(),
    });
    logActivity('UPDATE_RATES', 'Admin mengembalikan ketentuan gaji ke nilai default SOP');
  };

  // KELAS & SISWA
  const addClassroom = async (classroomData: Omit<Classroom, 'id'>) => {
    const newClassroom: Classroom = {
      ...classroomData,
      id: `cls-${Date.now()}`,
    };
    setClassrooms((prev) => [...prev, newClassroom]);

    await supabase.from('classrooms').insert([
      {
        id: newClassroom.id,
        name: newClassroom.name,
        type: newClassroom.type,
        students: newClassroom.students,
        total_meetings: newClassroom.totalMeetings,
        ldr_zone: newClassroom.ldrZone,
        status: newClassroom.status,
      },
    ]);
  };

  const updateClassroom = async (id: string, updatedData: Partial<Classroom>) => {
    setClassrooms((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );

    const supabasePayload: any = {};
    if (updatedData.name !== undefined) supabasePayload.name = updatedData.name;
    if (updatedData.type !== undefined) supabasePayload.type = updatedData.type;
    if (updatedData.students !== undefined) supabasePayload.students = updatedData.students;
    if (updatedData.totalMeetings !== undefined) supabasePayload.total_meetings = updatedData.totalMeetings;
    if (updatedData.ldrZone !== undefined) supabasePayload.ldr_zone = updatedData.ldrZone;
    if (updatedData.status !== undefined) supabasePayload.status = updatedData.status;

    await supabase.from('classrooms').update(supabasePayload).eq('id', id);
    logActivity('UPDATE_PAYROLL', `Admin mengedit data kelas: ID ${id}`);
  };

  const deleteClassroom = async (id: string) => {
    setClassrooms((prev) => prev.filter((c) => c.id !== id));
    await supabase.from('classrooms').delete().eq('id', id);
  };

  // JURNAL MENGAJAR (MEETINGS)
  const addMeeting = async (meetingData: {
    classroomId: string;
    meetingNumber: number;
    lesson: string;
    date: string;
    notes?: string;
    hasVideoClaim?: boolean;
  }) => {
    if (!currentUser) return;

    const targetClass = classrooms.find((c) => c.id === meetingData.classroomId);
    const existingIndex = meetings.findIndex(
      (m) => m.classroomId === meetingData.classroomId && m.meetingNumber === meetingData.meetingNumber
    );

    const meetingId = existingIndex >= 0 ? meetings[existingIndex].id : `mtg-${Date.now()}`;
    const newMeeting: Meeting = {
      id: meetingId,
      classroomId: meetingData.classroomId,
      meetingNumber: meetingData.meetingNumber,
      tutorId: currentUser.id,
      tutorName: currentUser.name,
      date: meetingData.date,
      lesson: meetingData.lesson,
      notes: meetingData.notes,
      isLocked: false,
      ldrZoneSnapshot: targetClass ? targetClass.ldrZone : 'none',
      hasVideoClaim: meetingData.hasVideoClaim || false,
    };

    if (existingIndex >= 0) {
      setMeetings((prev) => {
        const copy = [...prev];
        copy[existingIndex] = newMeeting;
        return copy;
      });
    } else {
      setMeetings((prev) => [...prev, newMeeting]);
    }

    await supabase.from('meetings').upsert({
      id: newMeeting.id,
      classroom_id: newMeeting.classroomId,
      meeting_number: newMeeting.meetingNumber,
      tutor_id: newMeeting.tutorId,
      tutor_name: newMeeting.tutorName,
      date: newMeeting.date,
      lesson: newMeeting.lesson,
      notes: newMeeting.notes,
      is_locked: newMeeting.isLocked,
      ldr_zone_snapshot: newMeeting.ldrZoneSnapshot,
      has_video_claim: newMeeting.hasVideoClaim,
    });

    if (meetingData.hasVideoClaim) {
      const meetingMonth = meetingData.date.substring(0, 7);
      const adj = getAdjustmentForTutor(currentUser.id, meetingMonth);
      saveAdjustment({
        ...adj,
        videoCount: (adj.videoCount || 0) + 1,
      });
    }

    logActivity(
      'CREATE_MEETING',
      `Mengisi jurnal pertemuan #${meetingData.meetingNumber} di kelas ${targetClass?.name || ''}${
        meetingData.hasVideoClaim ? ' (Klaim Video Siswa)' : ''
      }`
    );
  };

  const updateMeeting = async (
    meetingId: string,
    updatedData: {
      date: string;
      lesson: string;
      notes?: string;
      hasVideoClaim?: boolean;
      tutorId?: string;
      tutorName?: string;
    }
  ) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, ...updatedData } : m))
    );

    await supabase
      .from('meetings')
      .update({
        date: updatedData.date,
        lesson: updatedData.lesson,
        notes: updatedData.notes,
        has_video_claim: updatedData.hasVideoClaim,
        tutor_id: updatedData.tutorId,
        tutor_name: updatedData.tutorName,
      })
      .eq('id', meetingId);

    logActivity('UPDATE_PAYROLL', `Admin mengoreksi data sesi jurnal (ID: ${meetingId})`);
  };

  const clearMeetingSlot = async (classroomId: string, meetingNumber: number) => {
    setMeetings((prev) =>
      prev.filter((m) => !(m.classroomId === classroomId && m.meetingNumber === meetingNumber))
    );

    await supabase
      .from('meetings')
      .delete()
      .eq('classroom_id', classroomId)
      .eq('meeting_number', meetingNumber);

    logActivity(
      'UPDATE_PAYROLL',
      `Admin mengosongkan / mereset slot jurnal pertemuan #${meetingNumber}`
    );
  };

  const toggleLockMeeting = async (meetingId: string) => {
    const target = meetings.find((m) => m.id === meetingId);
    if (!target) return;
    const newLock = !target.isLocked;

    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, isLocked: newLock } : m))
    );

    await supabase.from('meetings').update({ is_locked: newLock }).eq('id', meetingId);
  };

  const lockEmptySlot = async (classroomId: string, meetingNumber: number) => {
    if (currentUser?.role !== 'admin') return;

    const existing = meetings.find(
      (m) => m.classroomId === classroomId && m.meetingNumber === meetingNumber
    );

    if (existing) {
      toggleLockMeeting(existing.id);
    } else {
      const targetClass = classrooms.find((c) => c.id === classroomId);
      const lockedPlaceholder: Meeting = {
        id: `mtg-locked-${Date.now()}`,
        classroomId,
        meetingNumber,
        tutorId: '-',
        tutorName: 'Admin (Audit Lock)',
        date: new Date().toISOString().split('T')[0],
        lesson: 'Sesi Dikosongkan / Hangus oleh Admin',
        isLocked: true,
        ldrZoneSnapshot: targetClass ? targetClass.ldrZone : 'none',
        hasVideoClaim: false,
      };

      setMeetings((prev) => [...prev, lockedPlaceholder]);

      await supabase.from('meetings').insert([
        {
          id: lockedPlaceholder.id,
          classroom_id: lockedPlaceholder.classroomId,
          meeting_number: lockedPlaceholder.meetingNumber,
          tutor_id: lockedPlaceholder.tutorId,
          tutor_name: lockedPlaceholder.tutorName,
          date: lockedPlaceholder.date,
          lesson: lockedPlaceholder.lesson,
          is_locked: true,
          ldr_zone_snapshot: lockedPlaceholder.ldrZoneSnapshot,
          has_video_claim: false,
        },
      ]);

      logActivity(
        'CREATE_MEETING',
        `Admin mengunci slot pertemuan #${meetingNumber} (Hangus) di kelas ${targetClass?.name || ''}`
      );
    }
  };

  // FREE TRIALS
  const addFreeTrial = async (trialData: { studentName: string; lesson: string; date: string }) => {
    if (!currentUser) return;
    const newTrial: FreeTrial = {
      id: `ft-${Date.now()}`,
      studentName: trialData.studentName,
      tutorId: currentUser.id,
      tutorName: currentUser.name,
      date: trialData.date,
      lesson: trialData.lesson,
      status: 'completed',
    };
    setFreeTrials((prev) => [...prev, newTrial]);

    await supabase.from('free_trials').insert([
      {
        id: newTrial.id,
        student_name: newTrial.studentName,
        tutor_id: newTrial.tutorId,
        tutor_name: newTrial.tutorName,
        date: newTrial.date,
        lesson: newTrial.lesson,
        status: newTrial.status,
      },
    ]);

    logActivity('CREATE_MEETING', `Mencatat sesi Free Trial untuk siswa: ${trialData.studentName}`);
  };

  const updateFreeTrial = async (
    trialId: string,
    updatedData: { studentName: string; lesson: string; date: string; tutorId?: string; tutorName?: string }
  ) => {
    setFreeTrials((prev) =>
      prev.map((ft) => (ft.id === trialId ? { ...ft, ...updatedData } : ft))
    );

    await supabase
      .from('free_trials')
      .update({
        student_name: updatedData.studentName,
        lesson: updatedData.lesson,
        date: updatedData.date,
        tutor_id: updatedData.tutorId,
        tutor_name: updatedData.tutorName,
      })
      .eq('id', trialId);

    logActivity('UPDATE_PAYROLL', `Memperbarui data Free Trial ID: ${trialId}`);
  };

  const deleteFreeTrial = async (trialId: string) => {
    setFreeTrials((prev) => prev.filter((ft) => ft.id !== trialId));
    await supabase.from('free_trials').delete().eq('id', trialId);
    logActivity('UPDATE_PAYROLL', `Menghapus sesi Free Trial ID: ${trialId}`);
  };

  const toggleFreeTrialStatus = async (trialId: string) => {
    const target = freeTrials.find((ft) => ft.id === trialId);
    if (!target) return;
    const newStatus = target.status === 'completed' ? 'pending' : 'completed';

    setFreeTrials((prev) =>
      prev.map((ft) => (ft.id === trialId ? { ...ft, status: newStatus } : ft))
    );

    await supabase.from('free_trials').update({ status: newStatus }).eq('id', trialId);
  };

  // MONTHLY ADJUSTMENTS
  const getAdjustmentForTutor = (tutorId: string, month: string): MonthlyAdjustment => {
    const existing = adjustments.find((a) => a.tutorId === tutorId && a.month === month);
    if (existing) return existing;
    return {
      id: `adj-${tutorId}-${month}`,
      tutorId,
      month,
      videoCount: 0,
      reportCount: 0,
      fnmCount: 0,
      customBonusNominal: 0,
      customBonusNote: '',
      applySukaDuka: true,
      lateAttendanceCount: 0,
      violationCount: 0,
      lateVideoCount: 0,
      suddenLeaveCount: 0,
      customDeductionNominal: 0,
      customDeductionNote: '',
    };
  };

  const saveAdjustment = async (adj: MonthlyAdjustment) => {
    setAdjustments((prev) => {
      const idx = prev.findIndex((a) => a.tutorId === adj.tutorId && a.month === adj.month);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = adj;
        return copy;
      }
      return [...prev, adj];
    });

    await supabase.from('monthly_adjustments').upsert({
      id: adj.id,
      tutor_id: adj.tutorId,
      month: adj.month,
      video_count: adj.videoCount,
      report_count: adj.reportCount,
      fnm_count: adj.fnmCount,
      custom_bonus_nominal: adj.customBonusNominal,
      custom_bonus_note: adj.customBonusNote,
      apply_suka_duka: adj.applySukaDuka,
      late_attendance_count: adj.lateAttendanceCount,
      violation_count: adj.violationCount,
      late_video_count: adj.lateVideoCount,
      sudden_leave_count: adj.suddenLeaveCount,
      custom_deduction_nominal: adj.customDeductionNominal,
      custom_deduction_note: adj.customDeductionNote,
    });

    logActivity('UPDATE_PAYROLL', `Memperbarui rincian bonus & potongan untuk periode ${adj.month}`);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthReady,
        isDataReady,
        currentUser,
        users,
        activityLogs,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        activeTab,
        setActiveTab,
        selectedMonth,
        setSelectedMonth,
        isJournalLocked,
        toggleJournalLock,
        rates,
        updateRates,
        resetRatesToDefault,
        classrooms,
        addClassroom,
        updateClassroom,
        deleteClassroom,
        meetings,
        addMeeting,
        updateMeeting,
        clearMeetingSlot,
        toggleLockMeeting,
        lockEmptySlot,
        freeTrials,
        addFreeTrial,
        updateFreeTrial,
        deleteFreeTrial,
        toggleFreeTrialStatus,
        adjustments,
        getAdjustmentForTutor,
        saveAdjustment,
        refreshData: fetchAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};