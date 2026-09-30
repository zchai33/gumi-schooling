'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export const DashboardView: React.FC = () => {
  const { currentUser, classrooms, meetings, activityLogs, rates, adjustments, setActiveTab } = useApp();

  if (!currentUser) return null;

  // Statistik Admin
  const totalClasses = classrooms.length;
  const totalCompletedMeetings = meetings.filter((m) => !m.isLocked).length;
  
  // Hitung estimasi cepat pengeluaran payroll berjalan
  const totalBaseEarnings = meetings.reduce((acc, m) => {
    if (m.isLocked) return acc;
    const targetClass = classrooms.find((c) => c.id === m.classroomId);
    const baseFee = targetClass ? rates.baseFees[targetClass.type] || 0 : 0;
    const ldrFee = m.ldrZoneSnapshot !== 'none' ? rates.ldrBonus[m.ldrZoneSnapshot] || 0 : 0;
    return acc + baseFee + ldrFee;
  }, 0);

  // Statistik Tutor Pribadi
  const tutorMeetings = meetings.filter((m) => m.tutorId === currentUser.id && !m.isLocked);
  const tutorEarnings = tutorMeetings.reduce((acc, m) => {
    const targetClass = classrooms.find((c) => c.id === m.classroomId);
    const baseFee = targetClass ? rates.baseFees[targetClass.type] || 0 : 0;
    const ldrFee = m.ldrZoneSnapshot !== 'none' ? rates.ldrBonus[m.ldrZoneSnapshot] || 0 : 0;
    return acc + baseFee + ldrFee;
  }, 0);

  const tutorAdjustment = adjustments.find((a) => a.tutorId === currentUser.id);
  const tutorVideoBonus = (tutorAdjustment?.videoCount || 0) * rates.standardBonus.videoPerItem;
  const tutorReportBonus = (tutorAdjustment?.reportCount || 0) * rates.standardBonus.reportPerStudent;
  const tutorEstTotal = tutorEarnings + tutorVideoBonus + tutorReportBonus - (tutorAdjustment?.applySukaDuka ? rates.standardDeductions.sukaDuka : 0);

  return (
    <div className="space-y-6">
      {/* Header Sambutan */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Selamat Datang
          </span>
          <h1 className="text-2xl font-bold text-slate-800 mt-2">
            Halo, {currentUser.name} 👋
          </h1>
          <p className="text-sm text-slate-500">
            Anda masuk sebagai <strong className="capitalize text-slate-700">{currentUser.role}</strong> di Sistem Manajemen Operasional Gumi Schooling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.role === 'admin' ? (
            <button
              onClick={() => setActiveTab('payroll')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm shadow-indigo-200"
            >
              Lihat Rekap Payroll
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('meetings')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm shadow-emerald-200"
            >
              + Isi Jurnal Mengajar
            </button>
          )}
        </div>
      </div>

      {/* METRIK ADMIN */}
      {currentUser.role === 'admin' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kelas Aktif</span>
              <div className="text-3xl font-extrabold text-slate-800 mt-2">{totalClasses}</div>
              <p className="text-xs text-slate-500 mt-1">Total kelompok belajar saat ini</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pertemuan Selesai</span>
              <div className="text-3xl font-extrabold text-indigo-600 mt-2">{totalCompletedMeetings}</div>
              <p className="text-xs text-slate-500 mt-1">Sesi terisi & terverifikasi bulan ini</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimasi Pengeluaran Gaji</span>
              <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                Rp {totalBaseEarnings.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-slate-500 mt-1">Fee mengajar + bonus LDR berjalan</p>
            </div>
          </div>

          {/* Audit Trail / Activity Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <span>📋</span> Rekam Aktivitas Pengguna (Audit Log)
              </h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                Real-time
              </span>
            </div>

            {activityLogs.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Belum ada aktivitas tercatat pada sesi ini.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-2">
                {activityLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{log.userName}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          log.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {log.role}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* METRIK TUTOR */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pertemuan Diisi</span>
            <div className="text-3xl font-extrabold text-indigo-600 mt-2">{tutorMeetings.length}</div>
            <p className="text-xs text-slate-500 mt-1">Jurnal sesi yang Anda selesaikan</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rekap Video & Laporan</span>
            <div className="text-3xl font-extrabold text-slate-800 mt-2">
              {tutorAdjustment?.videoCount || 0} <span className="text-sm font-normal text-slate-400">video</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              +{tutorAdjustment?.reportCount || 0} laporan progres siswa
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimasi Gaji Anda</span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">
              Rp {Math.max(0, tutorEstTotal).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-500 mt-1">Fee mengajar + bonus (dikurangi suka duka)</p>
          </div>
        </div>
      )}
    </div>
  );
};