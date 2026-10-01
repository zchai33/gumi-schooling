'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function BackupManager() {
  const {
    currentUser,
    selectedMonth,
    setSelectedMonth,
    meetings,
    classrooms,
    users,
    freeTrials,
    adjustments,
    rates,
  } = useApp();

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold">
        ⚠️ Akses Terbatas: Menu Backup & Ekspor Data hanya dapat diakses oleh Admin.
      </div>
    );
  }

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

  // Helper pemicu download file di browser
  const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  // 1. EKSPOR JURNAL MENGAJAR (CSV)
  const exportMeetingsCSV = () => {
    const monthlyMeetings = meetings.filter((m) => m.date && m.date.startsWith(selectedMonth));

    const headers = [
      'ID Pertemuan',
      'Tanggal',
      'Nama Kelas',
      'Tipe Kelas',
      'Pertemuan Ke',
      'Tutor Pengajar',
      'Materi Pembelajaran',
      'Catatan Sesi',
      'Klaim Video',
      'Zona Jarak LDR',
      'Status Kunci',
    ];

    const rows = monthlyMeetings.map((m) => {
      const cls = classrooms.find((c) => c.id === m.classroomId);
      return [
        `"${m.id}"`,
        `"${m.date}"`,
        `"${cls?.name || '-'}"`,
        `"${cls?.type || '-'}"`,
        m.meetingNumber,
        `"${m.tutorName}"`,
        `"${(m.lesson || '').replace(/"/g, '""')}"`,
        `"${(m.notes || '').replace(/"/g, '""')}"`,
        m.hasVideoClaim ? 'Ya' : 'Tidak',
        `"${m.ldrZoneSnapshot || 'none'}"`,
        m.isLocked ? 'Terkunci / Hangus' : 'Selesai / Terisi',
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    triggerDownload(csvContent, `Gumi_Jurnal_${selectedMonth}.csv`, 'text/csv;charset=utf-8;');
  };

  // 2. EKSPOR REKAP PAYROLL (CSV)
  const exportPayrollCSV = () => {
    const tutors = users.filter((u) => u.role === 'tutor');
    const monthlyMeetings = meetings.filter((m) => m.date && m.date.startsWith(selectedMonth) && !m.isLocked);

    const headers = [
      'Nama Tutor',
      'Username',
      'Total Sesi Diisi',
      'Total Fee Mengajar Dasar',
      'Total Bonus Jarak LDR',
      'Bonus Video Siswa',
      'Bonus Laporan Progres',
      'Bonus Closing FNM',
      'Bonus Kustom Tambahan',
      'Potongan Suka Duka',
      'Denda Keterlambatan',
      'Potongan Kustom',
      'Total Gaji Bersih (Take Home Pay)',
    ];

    const rows = tutors.map((tutor) => {
      const tMeetings = monthlyMeetings.filter((m) => m.tutorId === tutor.id);
      
      let baseEarnings = 0;
      let ldrEarnings = 0;
      tMeetings.forEach((m) => {
        const cls = classrooms.find((c) => c.id === m.classroomId);
        baseEarnings += cls ? rates.baseFees[cls.type] || 0 : 0;
        ldrEarnings += m.ldrZoneSnapshot !== 'none' ? rates.ldrBonus[m.ldrZoneSnapshot] || 0 : 0;
      });

      const adj = adjustments.find((a) => a.tutorId === tutor.id && a.month === selectedMonth);
      const videoBonus = (adj?.videoCount || 0) * rates.standardBonus.videoPerItem;
      const reportBonus = (adj?.reportCount || 0) * rates.standardBonus.reportPerStudent;
      const fnmBonus = (adj?.fnmCount || 0) * rates.standardBonus.fnmPerClosing;
      const customBonus = Number(adj?.customBonusNominal || 0);

      const sukaDuka = adj?.applySukaDuka ? rates.standardDeductions.sukaDuka : 0;
      const lateDeduction = (adj?.lateAttendanceCount || 0) * rates.standardDeductions.lateAttendance;
      const customDeduction = Number(adj?.customDeductionNominal || 0);

      const totalBonus = ldrEarnings + videoBonus + reportBonus + fnmBonus + customBonus;
      const totalDeductions = sukaDuka + lateDeduction + customDeduction;
      const netPay = Math.max(0, baseEarnings + totalBonus - totalDeductions);

      return [
        `"${tutor.name}"`,
        `"${tutor.username}"`,
        tMeetings.length,
        baseEarnings,
        ldrEarnings,
        videoBonus,
        reportBonus,
        fnmBonus,
        customBonus,
        sukaDuka,
        lateDeduction,
        customDeduction,
        netPay,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    triggerDownload(csvContent, `Gumi_Payroll_${selectedMonth}.csv`, 'text/csv;charset=utf-8;');
  };

  // 3. EKSPOR DATABASE MASTER LENGKAP (JSON)
  const exportFullDatabaseJSON = () => {
    const fullBackup = {
      app: 'Gumi Schooling System',
      backupDate: new Date().toISOString(),
      metadata: {
        totalUsers: users.length,
        totalClassrooms: classrooms.length,
        totalMeetings: meetings.length,
        totalFreeTrials: freeTrials.length,
      },
      data: {
        users,
        classrooms,
        meetings,
        freeTrials,
        adjustments,
        rates,
      },
    };

    const jsonString = JSON.stringify(fullBackup, null, 2);
    const dateStamp = new Date().toISOString().split('T')[0];
    triggerDownload(jsonString, `Gumi_Full_Backup_${dateStamp}.json`, 'application/json');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pusat Cadangan & Ekspor Data (Backup)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Unduh laporan berkala Excel/CSV atau buat salinan cadangan database lokal sistem.
          </p>
        </div>

        {/* Pemilihan Periode Bulan */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start md:self-auto">
          <span className="text-xs font-medium text-slate-500">🗓️ Periode Ekspor:</span>
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

      {/* Notifikasi Sukses */}
      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>✅ Berhasil mengunduh berkas arsip: <strong>{downloadSuccess}</strong></span>
          <span className="text-[10px] text-emerald-600">Tersimpan di folder Download perangkat Anda</span>
        </div>
      )}

      {/* Kartu Pilihan Ekspor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Kartu 1: Jurnal Mengajar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">
              📖
            </div>
            <h3 className="font-bold text-slate-800 text-base">Arsip Jurnal Mengajar</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ekspor seluruh sesi pertemuan yang diisi oleh tutor pada periode <strong>{selectedMonth}</strong>, termasuk materi, catatan, dan klaim video.
            </p>
          </div>
          <button
            onClick={exportMeetingsCSV}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-sm shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            <span>📥</span> Unduh Jurnal (.CSV / Excel)
          </button>
        </div>

        {/* Kartu 2: Rekap Payroll */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">
              💼
            </div>
            <h3 className="font-bold text-slate-800 text-base">Rekapitulasi Payroll Tutor</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ekspor rekapitulasi gaji bulanan periode <strong>{selectedMonth}</strong> lengkap dengan perolehan fee dasar, bonus LDR, bonus video, dan potongan.
            </p>
          </div>
          <button
            onClick={exportPayrollCSV}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm shadow-emerald-200 transition-all flex items-center justify-center gap-2"
          >
            <span>📥</span> Unduh Payroll (.CSV / Excel)
          </button>
        </div>

        {/* Kartu 3: Backup Database Lengkap */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl">
              📦
            </div>
            <h3 className="font-bold text-slate-800 text-base">Cadangan Penuh (Full JSON)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unduh salinan mentah seluruh basis data operasional (Akun, Kelas, Siswa, Tarif Gaji, Jurnal, dan Free Trial) sebagai arsip pengaman.
            </p>
          </div>
          <button
            onClick={exportFullDatabaseJSON}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs shadow-sm shadow-purple-200 transition-all flex items-center justify-center gap-2"
          >
            <span>💾</span> Unduh Full Database (.JSON)
          </button>
        </div>
      </div>
    </div>
  );
}