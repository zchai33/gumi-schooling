'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MonthlyAdjustment } from '@/types';

export default function PayrollTable() {
  const {
    currentUser,
    users,
    classrooms,
    meetings,
    freeTrials,
    rates,
    selectedMonth,
    setSelectedMonth,
    getAdjustmentForTutor,
    saveAdjustment,
    setActiveTab,
  } = useApp();

  // State Modal Form Admin untuk Edit Bonus & Denda
  const [editingTutorId, setEditingTutorId] = useState<string | null>(null);
  const [adjustmentForm, setAdjustmentForm] = useState<MonthlyAdjustment | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm font-medium">
        ⚠️ Akses Terbatas: Rekap Penggajian (Payroll) hanya dapat diakses oleh akun Admin.
      </div>
    );
  }

  const tutors = users.filter((u) => u.role === 'tutor');

  // Kalkulasi rekapitulasi penggajian per tutor
  const payrollSummaries = tutors.map((tutor) => {
    // 1. Fee Mengajar Sesi Kelas
    const tutorMeetings = meetings.filter(
      (m) => m.tutorId === tutor.id && !m.isLocked && m.date.startsWith(selectedMonth)
    );

    let teachingFee = 0;
    let ldrFee = 0;

    tutorMeetings.forEach((m) => {
      const cls = classrooms.find((c) => c.id === m.classroomId);
      teachingFee += cls ? rates.baseFees[cls.type] || 0 : 0;
      if (m.ldrZoneSnapshot !== 'none') {
        ldrFee += rates.ldrBonus[m.ldrZoneSnapshot] || 0;
      }
    });

    // 2. Free Trial Selesai
    const tutorTrials = freeTrials.filter(
      (ft) => ft.tutorId === tutor.id && ft.status === 'completed' && ft.date.startsWith(selectedMonth)
    );
    const trialFee = tutorTrials.length * (rates.baseFees['Free Trial'] || 25000);

    // 3. Bonus & Denda Bulanan
    const adj = getAdjustmentForTutor(tutor.id, selectedMonth);

    const videoBonus = adj.videoCount * rates.standardBonus.videoPerItem;
    const reportBonus = adj.reportCount * rates.standardBonus.reportPerStudent;
    const fnmBonus = adj.fnmCount * rates.standardBonus.fnmPerClosing;
    const totalActivityBonus = videoBonus + reportBonus + fnmBonus + adj.customBonusNominal;

    const sukaDukaDeduction = adj.applySukaDuka ? rates.standardDeductions.sukaDuka : 0;
    const lateDeduction = adj.lateAttendanceCount * rates.standardDeductions.lateAttendance;
    const violationDeduction = adj.violationCount * rates.standardDeductions.violationOJL_GC;
    const lateVideoDeduction = adj.lateVideoCount * rates.standardDeductions.lateVideo;
    const suddenLeaveDeduction = adj.suddenLeaveCount * rates.standardDeductions.suddenLeave;
    const totalDeductions =
      sukaDukaDeduction +
      lateDeduction +
      violationDeduction +
      lateVideoDeduction +
      suddenLeaveDeduction +
      adj.customDeductionNominal;

    const grossTotal = teachingFee + ldrFee + trialFee + totalActivityBonus;
    const takeHomePay = Math.max(0, grossTotal - totalDeductions);

    return {
      tutor,
      meetingCount: tutorMeetings.length,
      trialCount: tutorTrials.length,
      teachingFee,
      ldrFee,
      trialFee,
      totalActivityBonus,
      totalDeductions,
      takeHomePay,
      adjustment: adj,
    };
  });

  const totalPayrollExpenditure = payrollSummaries.reduce((acc, curr) => acc + curr.takeHomePay, 0);

  const handleOpenEditAdjustment = (tutorId: string) => {
    const adj = getAdjustmentForTutor(tutorId, selectedMonth);
    setAdjustmentForm({ ...adj });
    setEditingTutorId(tutorId);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustmentForm) {
      saveAdjustment(adjustmentForm);
      setEditingTutorId(null);
      setAdjustmentForm(null);
    }
  };

  const handleGoToPayslip = () => {
    setActiveTab('payslip');
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bulan */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Rekapitulasi Payroll Tutor</h2>
          <p className="text-xs text-slate-500 mt-1">
            Perhitungan menyeluruh fee mengajar, bonus kegiatan, potongan denda, dan Take-Home Pay.
          </p>
        </div>

        {/* Filter Bulan Aktif */}
        <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200 self-start md:self-auto">
          <span className="text-xs font-semibold text-slate-600 pl-1">Periode Bulan:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs border rounded-lg bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Banner Ringkasan Total Pengeluaran */}
      <div className="bg-gradient-to-r from-bg-gradient-to-r from-amber-500 to-amber-600 shadow-md shadow-amber-200/50 text-white rounded-2xl p-6 shadow-md shadow-blue-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-100">
            Total Estimasi Anggaran Penggajian ({selectedMonth})
          </span>
          <div className="text-3xl font-extrabold mt-1">
            Rp {totalPayrollExpenditure.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="text-xs text-blue-100 bg-white/10 px-3 py-2 rounded-xl border border-white/20">
          💡 Angka dihitung otomatis berdasarkan sesi valid + bonus rekapitulasi dikurangi denda.
        </div>
      </div>

      {/* Tabel Payroll dengan Horizontal Scrolling */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama Tutor</th>
                <th className="py-3.5 px-4 text-center">Sesi Kelas</th>
                <th className="py-3.5 px-4 text-right">Fee Mengajar</th>
                <th className="py-3.5 px-4 text-right">Bonus LDR</th>
                <th className="py-3.5 px-4 text-right">Free Trial</th>
                <th className="py-3.5 px-4 text-right">Bonus Tambahan</th>
                <th className="py-3.5 px-4 text-right">Total Potongan</th>
                <th className="py-3.5 px-4 text-right font-extrabold text-blue-900">Take-Home Pay</th>
                <th className="py-3.5 px-4 text-center">Kelola Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrollSummaries.map((row) => (
                <tr key={row.tutor.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{row.tutor.name}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {row.meetingCount} sesi
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                    Rp {row.teachingFee.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-right text-purple-700 font-semibold">
                    +{row.ldrFee.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-right text-blue-700 font-semibold">
                    +{row.trialFee.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-700 font-semibold">
                    +{row.totalActivityBonus.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-right text-rose-600 font-semibold">
                    -{row.totalDeductions.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-sm text-slate-900 bg-blue-50/30">
                    Rp {row.takeHomePay.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditAdjustment(row.tutor.id)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-lg border border-amber-200 transition-all text-[11px]"
                      >
                        ⚙️ Input Bonus/Denda
                      </button>
                      <button
                        onClick={handleGoToPayslip}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-all text-[11px]"
                      >
                        📄 Slip
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Bonus & Denda Admin */}
      {editingTutorId && adjustmentForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Kelola Bonus & Denda Manual</h3>
                <p className="text-xs text-slate-500">
                  Tutor: <strong>{users.find((u) => u.id === editingTutorId)?.name}</strong> (Periode: {selectedMonth})
                </p>
              </div>
              <button
                onClick={() => setEditingTutorId(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              {/* Seksi Bonus */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
                <h4 className="font-bold text-emerald-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>⭐</span> Tambahan Bonus Operasional
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Video Siswa (@Rp {rates.standardBonus.videoPerItem.toLocaleString('id-ID')})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={adjustmentForm.videoCount}
                      onChange={(e) =>
                        setAdjustmentForm({ ...adjustmentForm, videoCount: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Report Siswa (@Rp {rates.standardBonus.reportPerStudent.toLocaleString('id-ID')})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={adjustmentForm.reportCount}
                      onChange={(e) =>
                        setAdjustmentForm({ ...adjustmentForm, reportCount: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      FNM Closing (@Rp {rates.standardBonus.fnmPerClosing.toLocaleString('id-ID')})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={adjustmentForm.fnmCount}
                      onChange={(e) =>
                        setAdjustmentForm({ ...adjustmentForm, fnmCount: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bonus Tambahan Lain (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={adjustmentForm.customBonusNominal}
                      onChange={(e) =>
                        setAdjustmentForm({ ...adjustmentForm, customBonusNominal: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Keterangan Bonus Lain</label>
                    <input
                      type="text"
                      placeholder="Misal: Hadiah performa terbaik"
                      value={adjustmentForm.customBonusNote}
                      onChange={(e) =>
                        setAdjustmentForm({ ...adjustmentForm, customBonusNote: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Seksi Potongan & Denda */}
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-3">
                <h4 className="font-bold text-rose-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚠️</span> Potongan & Denda Pelanggaran
                </h4>

                {/* Suka Duka Otomatis */}
                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-rose-200">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Iuran Wajib Suka Duka</p>
                    <p className="text-[10px] text-slate-500">Nominal tetap: Rp {rates.standardDeductions.sukaDuka.toLocaleString('id-ID')}</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={adjustmentForm.applySukaDuka}
                      onChange={(e) =>
                        setAdjustmentForm({ ...adjustmentForm, applySukaDuka: e.target.checked })
                      }
                      className="h-4 w-4 text-rose-600 rounded"
                    />
                    <span>{adjustmentForm.applySukaDuka ? 'Aktif Terpotong' : 'Non-aktif'}</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Keterlambatan Hadir (x Rp {rates.standardDeductions.lateAttendance.toLocaleString('id-ID')})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={adjustmentForm.lateAttendanceCount}
                      onChange={(e) =>
                        setAdjustmentForm({
                          ...adjustmentForm,
                          lateAttendanceCount: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pelanggaran OJL & GC (x Rp {rates.standardDeductions.violationOJL_GC.toLocaleString('id-ID')})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={adjustmentForm.violationCount}
                      onChange={(e) =>
                        setAdjustmentForm({
                          ...adjustmentForm,
                          violationCount: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Denda Keterlambatan Video (x Rp {rates.standardDeductions.lateVideo.toLocaleString('id-ID')})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={adjustmentForm.lateVideoCount}
                      onChange={(e) =>
                        setAdjustmentForm({
                          ...adjustmentForm,
                          lateVideoCount: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Cuti Mendadak (x Rp {rates.standardDeductions.suddenLeave.toLocaleString('id-ID')})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={adjustmentForm.suddenLeaveCount}
                      onChange={(e) =>
                        setAdjustmentForm({
                          ...adjustmentForm,
                          suddenLeaveCount: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Denda Manual Lain (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={adjustmentForm.customDeductionNominal}
                      onChange={(e) =>
                        setAdjustmentForm({
                          ...adjustmentForm,
                          customDeductionNominal: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Keterangan Denda Lain</label>
                    <input
                      type="text"
                      placeholder="Misal: Pelanggaran dresscode"
                      value={adjustmentForm.customDeductionNote}
                      onChange={(e) =>
                        setAdjustmentForm({
                          ...adjustmentForm,
                          customDeductionNote: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border rounded-xl bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingTutorId(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Simpan Penyesuaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}