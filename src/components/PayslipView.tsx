'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';

export default function PayslipView() {
  const { currentUser, users, classrooms, meetings, freeTrials, rates, selectedMonth, getAdjustmentForTutor } = useApp();

  const isAdmin = currentUser?.role === 'admin';
  const tutors = useMemo(() => users.filter((u) => u.role === 'tutor'), [users]);

  // Default: Jika Admin maka 'all', jika Tutor selalu terkunci ke ID pribadinya
  const [selectedTutorId, setSelectedTutorId] = useState<string>(
    isAdmin ? 'all' : currentUser?.id || ''
  );

  // Helper fungsi hitung gaji per tutor (murni hitungan matematis tanpa efek samping)
  const calculateTutorPayroll = (tutorId: string) => {
    const tMeetings = meetings.filter(
      (m) => m.tutorId === tutorId && !m.isLocked && m.date && m.date.startsWith(selectedMonth)
    );

    let baseEarnings = 0;
    let ldrEarnings = 0;
    tMeetings.forEach((m) => {
      const cls = classrooms.find((c) => c.id === m.classroomId);
      baseEarnings += cls ? rates.baseFees[cls.type] || 0 : 0;
      if (m.ldrZoneSnapshot && m.ldrZoneSnapshot !== 'none') {
        ldrEarnings += rates.ldrBonus[m.ldrZoneSnapshot] || 0;
      }
    });

    const tTrials = freeTrials.filter(
      (ft) => ft.tutorId === tutorId && ft.status === 'completed' && ft.date && ft.date.startsWith(selectedMonth)
    );
    const trialTotal = tTrials.length * (rates.baseFees['Free Trial'] || 25000);

    const adj = getAdjustmentForTutor ? getAdjustmentForTutor(tutorId, selectedMonth) : null;
    const videoTotal = (adj?.videoCount || 0) * rates.standardBonus.videoPerItem;
    const reportTotal = (adj?.reportCount || 0) * rates.standardBonus.reportPerStudent;
    const fnmTotal = (adj?.fnmCount || 0) * rates.standardBonus.fnmPerClosing;
    const customBonus = Number(adj?.customBonusNominal || 0);

    const totalIncome =
      baseEarnings +
      ldrEarnings +
      trialTotal +
      videoTotal +
      reportTotal +
      fnmTotal +
      customBonus;

    const sukaDukaNominal = adj?.applySukaDuka ? rates.standardDeductions.sukaDuka : 0;
    const lateAttendanceNominal = (adj?.lateAttendanceCount || 0) * rates.standardDeductions.lateAttendance;
    const violationNominal = (adj?.violationCount || 0) * rates.standardDeductions.violationOJL_GC;
    const lateVideoNominal = (adj?.lateVideoCount || 0) * rates.standardDeductions.lateVideo;
    const suddenLeaveNominal = (adj?.suddenLeaveCount || 0) * rates.standardDeductions.suddenLeave;
    const customDeduction = Number(adj?.customDeductionNominal || 0);

    const totalDeductions =
      sukaDukaNominal +
      lateAttendanceNominal +
      violationNominal +
      lateVideoNominal +
      suddenLeaveNominal +
      customDeduction;

    const takeHomePay = Math.max(0, totalIncome - totalDeductions);

    return {
      sessionCount: tMeetings.length,
      takeHomePay,
    };
  };

  // HANYA hitung ringkasan semua tutor jika Admin sedang memilih 'all'
  const summaryList = useMemo(() => {
    if (!isAdmin || selectedTutorId !== 'all') return [];
    return tutors.map((t) => {
      const calc = calculateTutorPayroll(t.id);
      return {
        id: t.id,
        name: t.name,
        sessionCount: calc.sessionCount,
        takeHomePay: calc.takeHomePay,
      };
    });
  }, [isAdmin, selectedTutorId, tutors, meetings, classrooms, freeTrials, rates, selectedMonth]);

  const grandTotalPayroll = useMemo(() => {
    return summaryList.reduce((acc, curr) => acc + curr.takeHomePay, 0);
  }, [summaryList]);

  const handlePrint = () => {
    window.print();
  };

  // ==========================================
  // VIEW 1: ADMIN - RINGKASAN SEMUA TUTOR
  // ==========================================
  if (isAdmin && selectedTutorId === 'all') {
    return (
      <div className="space-y-6">
        {/* Header Kontrol */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Rekap Slip Gaji Tutor</h2>
            <p className="text-xs text-slate-500 mt-1">
              Ringkasan total perolehan gaji seluruh tutor untuk periode {selectedMonth}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedTutorId}
              onChange={(e) => setSelectedTutorId(e.target.value)}
              className="px-3 py-2 text-xs border rounded-xl bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">👥 Semua Tutor (Tabel Ringkasan)</option>
              {tutors.map((t) => (
                <option key={t.id} value={t.id}>
                  👤 {t.name}
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <span>🖨️</span> Cetak / Simpan PDF
            </button>
          </div>
        </div>

        {/* Tabel Ringkasan Simpel */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-3xl mx-auto space-y-6 print:border-none print:shadow-none print:p-0">
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-extrabold text-sm">
                  GS
                </div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">GUMI SCHOOLING</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">Ringkasan Pengeluaran Gaji Tutor</p>
            </div>
            <div className="text-right text-xs">
              <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                Periode: {selectedMonth}
              </span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4 text-center w-16">No</th>
                  <th className="py-3 px-4">Nama Tutor</th>
                  <th className="py-3 px-4 text-right">Total Gaji</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {summaryList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      Tidak ada data tutor terdaftar.
                    </td>
                  </tr>
                ) : (
                  summaryList.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedTutorId(item.id)}
                      title="Klik untuk melihat slip gaji detail"
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400">{index + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {item.name}
                        <span className="ml-2 text-[10px] text-blue-600 font-normal print:hidden">
                          (Lihat Detail ↗)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                        Rp {item.takeHomePay.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
                  <td colSpan={2} className="py-4 px-4 text-left uppercase tracking-wider text-xs">
                    Keseluruhan Gaji Tutor
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-emerald-400 font-black">
                    Rp {grandTotalPayroll.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-[11px] text-slate-400 text-center print:hidden">
            * Klik nama tutor untuk membuka rincian slip gaji satuan.
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: SLIP GAJI DETAIL (TUTOR / ADMIN)
  // ==========================================
  // Jika Tutor login, paksa ke akun pribadinya
  const targetId = isAdmin ? selectedTutorId : currentUser?.id;
  const activeTutor = users.find((u) => u.id === targetId) || tutors[0];

  if (!activeTutor) {
    return <div className="p-6 text-slate-400">Data tutor tidak ditemukan.</div>;
  }

  // 1. Data Pertemuan Kelas Bulan Ini
  const tutorMeetings = meetings.filter(
    (m) => m.tutorId === activeTutor.id && !m.isLocked && m.date && m.date.startsWith(selectedMonth)
  );

  const classroomBreakdown: Record<string, { type: string; count: number; feePerMeeting: number; total: number }> = {};
  tutorMeetings.forEach((m) => {
    const cls = classrooms.find((c) => c.id === m.classroomId);
    if (cls) {
      const fee = rates.baseFees[cls.type] || 0;
      if (!classroomBreakdown[cls.type]) {
        classroomBreakdown[cls.type] = {
          type: cls.type,
          count: 0,
          feePerMeeting: fee,
          total: 0,
        };
      }
      classroomBreakdown[cls.type].count += 1;
      classroomBreakdown[cls.type].total += fee;
    }
  });

  // 2. Bonus LDR
  const ldrBreakdown: Record<string, { count: number; bonusRate: number; total: number }> = {};
  tutorMeetings.forEach((m) => {
    if (m.ldrZoneSnapshot && m.ldrZoneSnapshot !== 'none') {
      const bonus = rates.ldrBonus[m.ldrZoneSnapshot] || 0;
      if (!ldrBreakdown[m.ldrZoneSnapshot]) {
        ldrBreakdown[m.ldrZoneSnapshot] = {
          count: 0,
          bonusRate: bonus,
          total: 0,
        };
      }
      ldrBreakdown[m.ldrZoneSnapshot].count += 1;
      ldrBreakdown[m.ldrZoneSnapshot].total += bonus;
    }
  });

  // 3. Free Trial
  const tutorTrials = freeTrials.filter(
    (ft) => ft.tutorId === activeTutor.id && ft.status === 'completed' && ft.date && ft.date.startsWith(selectedMonth)
  );
  const trialRate = rates.baseFees['Free Trial'] || 25000;
  const trialTotal = tutorTrials.length * trialRate;

  // 4. Penyesuaian Bonus & Potongan
  const adj = getAdjustmentForTutor ? getAdjustmentForTutor(activeTutor.id, selectedMonth) : null;

  const videoTotal = (adj?.videoCount || 0) * rates.standardBonus.videoPerItem;
  const reportTotal = (adj?.reportCount || 0) * rates.standardBonus.reportPerStudent;
  const fnmTotal = (adj?.fnmCount || 0) * rates.standardBonus.fnmPerClosing;
  const customBonusNominal = Number(adj?.customBonusNominal || 0);

  const totalTeachingAndBonus =
    Object.values(classroomBreakdown).reduce((acc, c) => acc + c.total, 0) +
    Object.values(ldrBreakdown).reduce((acc, l) => acc + l.total, 0) +
    trialTotal +
    videoTotal +
    reportTotal +
    fnmTotal +
    customBonusNominal;

  const sukaDukaNominal = adj?.applySukaDuka ? rates.standardDeductions.sukaDuka : 0;
  const lateAttendanceNominal = (adj?.lateAttendanceCount || 0) * rates.standardDeductions.lateAttendance;
  const violationNominal = (adj?.violationCount || 0) * rates.standardDeductions.violationOJL_GC;
  const lateVideoNominal = (adj?.lateVideoCount || 0) * rates.standardDeductions.lateVideo;
  const suddenLeaveNominal = (adj?.suddenLeaveCount || 0) * rates.standardDeductions.suddenLeave;
  const customDeductionNominal = Number(adj?.customDeductionNominal || 0);

  const totalDeductions =
    sukaDukaNominal +
    lateAttendanceNominal +
    violationNominal +
    lateVideoNominal +
    suddenLeaveNominal +
    customDeductionNominal;

  const takeHomePay = Math.max(0, totalTeachingAndBonus - totalDeductions);

  return (
    <div className="space-y-6">
      {/* Header Kontrol */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Slip Gaji Tutor</h2>
          <p className="text-xs text-slate-500 mt-1">
            Rincian resmi jam mengajar, bonus kegiatan, dan potongan periode {selectedMonth}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <select
              value={selectedTutorId}
              onChange={(e) => setSelectedTutorId(e.target.value)}
              className="px-3 py-2 text-xs border rounded-xl bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">👥 Semua Tutor (Tabel Ringkasan)</option>
              {tutors.map((t) => (
                <option key={t.id} value={t.id}>
                  👤 {t.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <span>🖨️</span> Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* DOKUMEN SLIP GAJI FISIK */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-3xl mx-auto space-y-6 print:border-none print:shadow-none print:p-0">
        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-extrabold text-sm">
                GS
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">GUMI SCHOOLING</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">Tutor Salary &amp; Activity Statement</p>
          </div>
          <div className="text-right text-xs">
            <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              Periode: {selectedMonth}
            </span>
          </div>
        </div>

        {/* Info Tutor */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Nama Tutor:</span>
            <strong className="text-slate-800 text-sm">{activeTutor.name}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Role / Posisi:</span>
            <span className="text-slate-700 font-semibold">Tutor Pengajar</span>
          </div>
        </div>

        {/* Tabel Rincian Pendapatan */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            Rincian Pendapatan (Earnings &amp; Bonuses)
          </h3>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Details (Kategori)</th>
                  <th className="py-2.5 px-3 text-center">Durations</th>
                  <th className="py-2.5 px-3 text-right">Balance (Tarif)</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Amount (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {Object.keys(classroomBreakdown).length === 0 && tutorTrials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      Tidak ada aktivitas mengajar pada periode ini.
                    </td>
                  </tr>
                ) : (
                  Object.entries(classroomBreakdown).map(([type, data]) => (
                    <tr key={type}>
                      <td className="py-2 px-3 font-semibold text-slate-800">Kelas: {type}</td>
                      <td className="py-2 px-3 text-center text-slate-500">60 - 90 Menit</td>
                      <td className="py-2 px-3 text-right">Rp {data.feePerMeeting.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-3 text-center font-bold">{data.count} sesi</td>
                      <td className="py-2 px-3 text-right font-semibold">Rp {data.total.toLocaleString('id-ID')}</td>
                    </tr>
                  ))
                )}

                {tutorTrials.length > 0 && (
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-800">Free Trial Class</td>
                    <td className="py-2 px-3 text-center text-slate-500">60 Menit</td>
                    <td className="py-2 px-3 text-right">Rp {trialRate.toLocaleString('id-ID')}</td>
                    <td className="py-2 px-3 text-center font-bold">{tutorTrials.length} siswa</td>
                    <td className="py-2 px-3 text-right font-semibold">Rp {trialTotal.toLocaleString('id-ID')}</td>
                  </tr>
                )}

                {Object.entries(ldrBreakdown).map(([zone, data]) => (
                  <tr key={zone}>
                    <td className="py-2 px-3 text-purple-700">Bonus Transport LDR ({zone.replace('_', ' >').toUpperCase()} KM)</td>
                    <td className="py-2 px-3 text-center text-slate-400">-</td>
                    <td className="py-2 px-3 text-right">Rp {data.bonusRate.toLocaleString('id-ID')}</td>
                    <td className="py-2 px-3 text-center font-bold">{data.count} sesi</td>
                    <td className="py-2 px-3 text-right font-semibold text-purple-700">Rp {data.total.toLocaleString('id-ID')}</td>
                  </tr>
                ))}

                {(adj?.videoCount || 0) > 0 && (
                  <tr>
                    <td className="py-2 px-3 text-emerald-700">Bonus Konten Video Siswa</td>
                    <td className="py-2 px-3 text-center text-slate-400">-</td>
                    <td className="py-2 px-3 text-right">Rp {rates.standardBonus.videoPerItem.toLocaleString('id-ID')}</td>
                    <td className="py-2 px-3 text-center font-bold">{adj?.videoCount} video</td>
                    <td className="py-2 px-3 text-right font-semibold text-emerald-700">Rp {videoTotal.toLocaleString('id-ID')}</td>
                  </tr>
                )}

                {(adj?.reportCount || 0) > 0 && (
                  <tr>
                    <td className="py-2 px-3 text-emerald-700">Bonus Laporan Progres Siswa</td>
                    <td className="py-2 px-3 text-center text-slate-400">-</td>
                    <td className="py-2 px-3 text-right">Rp {rates.standardBonus.reportPerStudent.toLocaleString('id-ID')}</td>
                    <td className="py-2 px-3 text-center font-bold">{adj?.reportCount} murid</td>
                    <td className="py-2 px-3 text-right font-semibold text-emerald-700">Rp {reportTotal.toLocaleString('id-ID')}</td>
                  </tr>
                )}

                {(adj?.fnmCount || 0) > 0 && (
                  <tr>
                    <td className="py-2 px-3 text-emerald-700">Fee New Member (Closing FNM)</td>
                    <td className="py-2 px-3 text-center text-slate-400">-</td>
                    <td className="py-2 px-3 text-right">Rp {rates.standardBonus.fnmPerClosing.toLocaleString('id-ID')}</td>
                    <td className="py-2 px-3 text-center font-bold">{adj?.fnmCount} closing</td>
                    <td className="py-2 px-3 text-right font-semibold text-emerald-700">Rp {fnmTotal.toLocaleString('id-ID')}</td>
                  </tr>
                )}

                {customBonusNominal > 0 && (
                  <tr>
                    <td className="py-2 px-3 text-emerald-700">Bonus Lainnya: {adj?.customBonusNote || 'Apresiasi'}</td>
                    <td className="py-2 px-3 text-center text-slate-400">-</td>
                    <td className="py-2 px-3 text-right">Rp {customBonusNominal.toLocaleString('id-ID')}</td>
                    <td className="py-2 px-3 text-center font-bold">1</td>
                    <td className="py-2 px-3 text-right font-semibold text-emerald-700">Rp {customBonusNominal.toLocaleString('id-ID')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Potongan */}
        <div className="space-y-3">
          <h3 className="font-bold text-rose-800 text-xs uppercase tracking-wider">
            Potongan &amp; Denda (Deductions)
          </h3>

          <div className="border border-rose-200 bg-rose-50/20 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <tbody className="divide-y divide-rose-100 text-rose-700">
                {adj?.applySukaDuka && (
                  <tr>
                    <td className="py-2 px-3">Iuran Wajib Suka Duka Bulanan</td>
                    <td className="py-2 px-3 text-right font-semibold">-Rp {sukaDukaNominal.toLocaleString('id-ID')}</td>
                  </tr>
                )}
                {lateAttendanceNominal > 0 && (
                  <tr>
                    <td className="py-2 px-3">Denda Keterlambatan Hadir ({adj?.lateAttendanceCount}x)</td>
                    <td className="py-2 px-3 text-right font-semibold">-Rp {lateAttendanceNominal.toLocaleString('id-ID')}</td>
                  </tr>
                )}
                {violationNominal > 0 && (
                  <tr>
                    <td className="py-2 px-3">Denda Pelanggaran OJL &amp; GC ({adj?.violationCount}x)</td>
                    <td className="py-2 px-3 text-right font-semibold">-Rp {violationNominal.toLocaleString('id-ID')}</td>
                  </tr>
                )}
                {lateVideoNominal > 0 && (
                  <tr>
                    <td className="py-2 px-3">Denda Keterlambatan Video ({adj?.lateVideoCount}x)</td>
                    <td className="py-2 px-3 text-right font-semibold">-Rp {lateVideoNominal.toLocaleString('id-ID')}</td>
                  </tr>
                )}
                {suddenLeaveNominal > 0 && (
                  <tr>
                    <td className="py-2 px-3">Denda Cuti Mendadak ({adj?.suddenLeaveCount}x)</td>
                    <td className="py-2 px-3 text-right font-semibold">-Rp {suddenLeaveNominal.toLocaleString('id-ID')}</td>
                  </tr>
                )}
                {customDeductionNominal > 0 && (
                  <tr>
                    <td className="py-2 px-3">Denda Lainnya: {adj?.customDeductionNote || 'Pelanggaran'}</td>
                    <td className="py-2 px-3 text-right font-semibold">-Rp {customDeductionNominal.toLocaleString('id-ID')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ringkasan Total Akhir */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Total Gaji Diterima (Take-Home Pay)
            </span>
            <span className="text-xs text-slate-400">
              (Total Pendapatan - Total Pemotongan)
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            Rp {takeHomePay.toLocaleString('id-ID')}
          </div>
        </div>
      </div>
    </div>
  );
}