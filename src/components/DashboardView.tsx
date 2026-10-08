'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    classrooms,
    meetings,
    activityLogs,
    rates,
    adjustments,
    selectedMonth,
    setSelectedMonth,
    setActiveTab,
  } = useApp();

  const [carryOverFilter, setCarryOverFilter] = useState<'all' | 'remaining' | 'completed'>('remaining');

  if (!currentUser) return null;

  // 1. FILTER PERTEMUAN BERDASARKAN BULAN YANG DIPILIH
  const filteredMeetingsByMonth = meetings.filter((m) => {
    if (!m.date) return false;
    return m.date.startsWith(selectedMonth);
  });

  // 2. STATISTIK ADMIN (Berdasarkan Bulan Terpilih)
  const totalClasses = classrooms.length;
  const totalCompletedMeetings = filteredMeetingsByMonth.filter((m) => !m.isLocked).length;

  const totalBaseEarnings = filteredMeetingsByMonth.reduce((acc, m) => {
    if (m.isLocked) return acc;
    const targetClass = classrooms.find((c) => c.id === m.classroomId);
    const baseFee = targetClass ? rates.baseFees[targetClass.type] || 0 : 0;
    const ldrFee = m.ldrZoneSnapshot !== 'none' ? rates.ldrBonus[m.ldrZoneSnapshot] || 0 : 0;
    return acc + baseFee + ldrFee;
  }, 0);

  // 3. STATISTIK TUTOR PRIBADI (Berdasarkan Bulan Terpilih)
  const tutorMeetings = filteredMeetingsByMonth.filter((m) => m.tutorId === currentUser.id && !m.isLocked);
  const tutorEarnings = tutorMeetings.reduce((acc, m) => {
    const targetClass = classrooms.find((c) => c.id === m.classroomId);
    const baseFee = targetClass ? rates.baseFees[targetClass.type] || 0 : 0;
    const ldrFee = m.ldrZoneSnapshot !== 'none' ? rates.ldrBonus[m.ldrZoneSnapshot] || 0 : 0;
    return acc + baseFee + ldrFee;
  }, 0);

  const tutorAdjustment = adjustments.find((a) => a.tutorId === currentUser.id && a.month === selectedMonth);
  const tutorVideoBonus = (tutorAdjustment?.videoCount || 0) * rates.standardBonus.videoPerItem;
  const tutorReportBonus = (tutorAdjustment?.reportCount || 0) * rates.standardBonus.reportPerStudent;
  const tutorEstTotal =
    tutorEarnings + tutorVideoBonus + tutorReportBonus - (tutorAdjustment?.applySukaDuka ? rates.standardDeductions.sukaDuka : 0);

  // 4. PELACAK KUOTA & SISA PERTEMUAN BULANAN
  const classProgressList = classrooms.map((cls) => {
    const classMeetingsInMonth = filteredMeetingsByMonth.filter((m) => m.classroomId === cls.id);
    const completedCount = classMeetingsInMonth.filter((m) => !m.isLocked).length;
    const lockedCount = classMeetingsInMonth.filter((m) => m.isLocked).length;
    const remainingCount = Math.max(0, cls.totalMeetings - (completedCount + lockedCount));
    const percent = Math.min(100, Math.round(((completedCount + lockedCount) / cls.totalMeetings) * 100));

    return {
      ...cls,
      completedCount,
      lockedCount,
      remainingCount,
      percent,
    };
  });

  const filteredClassProgress = classProgressList.filter((item) => {
    if (carryOverFilter === 'remaining') return item.remainingCount > 0;
    if (carryOverFilter === 'completed') return item.remainingCount === 0;
    return true;
  });

  // Opsi Pilihan Periode Bulan
  const currentYear = new Date().getFullYear();
  const monthOptions = [
    { value: `${currentYear}-01`, label: `Januari ${currentYear}` },
    { value: `${currentYear}-02`, label: `Februari ${currentYear}` },
    { value: `${currentYear}-03`, label: `Maret ${currentYear}` },
    { value: `${currentYear}-04`, label: `April ${currentYear}` },
    { value: `${currentYear}-05`, label: `Mei ${currentYear}` },
    { value: `${currentYear}-06`, label: `Juni ${currentYear}` },
    { value: `${currentYear}-07`, label: `Juli ${currentYear}` },
    { value: `${currentYear}-08`, label: `Agustus ${currentYear}` },
    { value: `${currentYear}-09`, label: `September ${currentYear}` },
    { value: `${currentYear}-10`, label: `Oktober ${currentYear}` },
    { value: `${currentYear}-11`, label: `November ${currentYear}` },
    { value: `${currentYear}-12`, label: `Desember ${currentYear}` },
  ];

  return (
    <div className="space-y-6">
      {/* Header Sambutan */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-indigo-50 px-3 py-1 rounded-full">
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
              className="bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-200 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm shadow-indigo-200"
            >
              Lihat Rekap Payroll
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('meetings')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm shadow-emerald-200"
            >
              + Isi Jurnal Mengajar
            </button>
          )}
        </div>
      </div>

      {/* METRIK ADMIN (3 Kartu Utama) */}
      {currentUser.role === 'admin' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kelas Terdaftar</span>
              <div className="text-3xl font-extrabold text-slate-800 mt-2">{totalClasses}</div>
              <p className="text-xs text-slate-500 mt-1">Total kelompok belajar aktif</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pertemuan Selesai</span>
              <div className="text-3xl font-extrabold text-amber-500 mt-2">{totalCompletedMeetings}</div>
              <p className="text-xs text-slate-500 mt-1">Sesi terisi di periode {selectedMonth}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimasi Pengeluaran</span>
              <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                Rp {totalBaseEarnings.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-slate-500 mt-1">Fee + bonus LDR ({selectedMonth})</p>
            </div>
          </div>

          {/* WIDGET PELACAK SISA SESI / CARRY-OVER TRACKER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span>🎯</span> Pelacak Sisa Sesi ({selectedMonth})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pantau kelas dengan paket yang belum tuntas sebelum pergantian bulan.
                </p>
              </div>

              {/* BILAH KONTROL RATA KANAN SEJAJAR */}
              <div className="flex flex-wrap items-center justify-start md:justify-end gap-2.5">
                {/* 1. Dropdown Periode Bulan */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
                  <span className="text-xs text-slate-500">🗓️</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Tombol Filter Status */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium shrink-0">
                  <button
                    onClick={() => setCarryOverFilter('remaining')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      carryOverFilter === 'remaining'
                        ? 'bg-white text-amber-700 font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Belum Tuntas ({classProgressList.filter((c) => c.remainingCount > 0).length})
                  </button>
                  <button
                    onClick={() => setCarryOverFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      carryOverFilter === 'completed'
                        ? 'bg-white text-emerald-700 font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tuntas ({classProgressList.filter((c) => c.remainingCount === 0).length})
                  </button>
                  <button
                    onClick={() => setCarryOverFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      carryOverFilter === 'all'
                        ? 'bg-white text-slate-800 font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua ({classProgressList.length})
                  </button>
                </div>
              </div>
            </div>

            {filteredClassProgress.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs border border-dashed rounded-xl">
                Tidak ada data kelas untuk filter ini pada periode {selectedMonth}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClassProgress.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                      item.remainingCount > 0
                        ? 'border-amber-200 bg-amber-50/30'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {item.type}
                        </span>
                        {item.remainingCount > 0 ? (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            Sisa {item.remainingCount} Sesi
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            ✓ Kuota Tuntas
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mt-1.5">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Murid: {item.students.join(', ')}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Progres Terisi:</span>
                        <span className="font-semibold text-slate-800">
                          {item.completedCount + item.lockedCount} / {item.totalMeetings} Sesi
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            item.remainingCount === 0 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            log.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pertemuan Diisi</span>
              <div className="text-3xl font-extrabold text-amber-500 mt-2">{tutorMeetings.length}</div>
              <p className="text-xs text-slate-500 mt-1">Sesi terisi di periode {selectedMonth}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rekap Video &amp; Laporan</span>
              <div className="text-3xl font-extrabold text-slate-800 mt-2">
                {tutorAdjustment?.videoCount || 0} <span className="text-sm font-normal text-slate-400">video</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                +{tutorAdjustment?.reportCount || 0} laporan progres ({selectedMonth})
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimasi Gaji Anda</span>
              <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                Rp {Math.max(0, tutorEstTotal).toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-slate-500 mt-1">Fee + bonus periode {selectedMonth}</p>
            </div>
          </div>

          {/* Widget Status Kuota Kelas untuk Tutor */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span>📖</span> Status Kuota Kelas Belajar ({selectedMonth})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pastikan seluruh slot jurnal diisi sebelum periode bulan berakhir.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                <span className="text-xs font-medium text-slate-500">🗓️ Periode:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classProgressList.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {item.type}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.remainingCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.remainingCount > 0 ? `Sisa ${item.remainingCount} Sesi` : 'Lengkap'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.remainingCount === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};