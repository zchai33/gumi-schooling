'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ClassType, RateConfig } from '@/types';

export default function RateConfigPanel() {
  const { currentUser, rates, updateRates, resetRatesToDefault } = useApp();

  // State lokal agar nilai tidak langsung berubah liar sebelum tombol simpan ditekan
  const [formData, setFormData] = useState<RateConfig>(rates);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm font-medium">
        ⚠️ Akses Terbatas: Pengaturan Ketentuan Gaji hanya dapat diakses oleh akun Admin.
      </div>
    );
  }

  const handleBaseFeeChange = (type: ClassType, value: number) => {
    setFormData((prev) => ({
      ...prev,
      baseFees: {
        ...prev.baseFees,
        [type]: value,
      },
    }));
  };

  const handleLdrChange = (zone: keyof RateConfig['ldrBonus'], value: number) => {
    setFormData((prev) => ({
      ...prev,
      ldrBonus: {
        ...prev.ldrBonus,
        [zone]: value,
      },
    }));
  };

  const handleStandardBonusChange = (key: keyof RateConfig['standardBonus'], value: number) => {
    setFormData((prev) => ({
      ...prev,
      standardBonus: {
        ...prev.standardBonus,
        [key]: value,
      },
    }));
  };

  const handleStandardDeductionChange = (key: keyof RateConfig['standardDeductions'], value: number) => {
    setFormData((prev) => ({
      ...prev,
      standardDeductions: {
        ...prev.standardDeductions,
        [key]: value,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateRates(formData);
    setSaveMessage('Ketentuan gaji berhasil disimpan dan diterapkan ke seluruh sistem!');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan semua nominal tarif ke standar SOP Gumi Schooling?')) {
      resetRatesToDefault();
      setFormData(rates);
      setSaveMessage('Ketentuan gaji berhasil dikembalikan ke nilai default SOP.');
      setTimeout(() => setSaveMessage(null), 3500);
    }
  };

  const classTypeList: ClassType[] = [
    'Kids-A',
    'Kids-B',
    'SPL-A',
    'SPL-B',
    'Group',
    'Test Prep-A',
    'Test Prep-B',
    'Social Banjar/Panti',
    'Free Trial',
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Ketentuan &amp; Tarif Gaji</h2>
          <p className="text-xs text-slate-500 mt-1">
            Ubah besaran fee mengajar, bonus jarak LDR, bonus kegiatan, dan ketentuan denda operasional.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-all"
          >
            Reset Default SOP
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-200 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-200 transition-all"
          >
            💾 Simpan Perubahan
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span>✅</span>
          <span>{saveMessage}</span>
        </div>
      )}

      {/* 1. Tarif Dasar Sesi Kelas */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
          <span className="text-emerald-600 text-base font-extrabold">Rp</span>
          Tarif Dasar per Pertemuan Sesi Kelas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classTypeList.map((type) => (
            <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-700">{type}</span>
              <div className="flex items-center gap-1.5 w-36">
                <span className="text-xs text-slate-400">Rp</span>
                <input
                  type="number"
                  value={formData.baseFees[type] ?? 0}
                  onChange={(e) => handleBaseFeeChange(type, Number(e.target.value))}
                  className="w-full px-2.5 py-1 text-xs border rounded-lg bg-white text-right font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Bonus Jarak LDR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
          <span className="text-purple-600 text-base">📍</span>
          Bonus Jarak / Transport (LDR)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'ldr_10', label: 'Jarak > 10 KM' },
            { id: 'ldr_15', label: 'Jarak > 15 KM' },
            { id: 'ldr_20', label: 'Jarak > 20 KM' },
            { id: 'panti_klungkung', label: 'Panti Klungkung' },
          ].map((item) => (
            <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-700 block mb-2">{item.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Rp</span>
                <input
                  type="number"
                  value={formData.ldrBonus[item.id as keyof RateConfig['ldrBonus']] ?? 0}
                  onChange={(e) =>
                    handleLdrChange(item.id as keyof RateConfig['ldrBonus'], Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1 text-xs border rounded-lg bg-white text-right font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Bonus Standar Kegiatan & Denda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bonus Standar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
            <span className="text-blue-600 text-base">⭐</span>
            Bonus Standar Operasional
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-700">Video Siswa</p>
                <p className="text-[10px] text-slate-400">Per 1 konten video dokumentasi</p>
              </div>
              <div className="flex items-center gap-1 w-32">
                <span className="text-xs text-slate-400">Rp</span>
                <input
                  type="number"
                  value={formData.standardBonus.videoPerItem}
                  onChange={(e) => handleStandardBonusChange('videoPerItem', Number(e.target.value))}
                  className="w-full px-2.5 py-1 text-xs border rounded-lg bg-white text-right font-semibold text-slate-800 outline-none"
                  step="1000"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-700">Laporan Progres (Report)</p>
                <p className="text-[10px] text-slate-400">Per 1 rekap murid</p>
              </div>
              <div className="flex items-center gap-1 w-32">
                <span className="text-xs text-slate-400">Rp</span>
                <input
                  type="number"
                  value={formData.standardBonus.reportPerStudent}
                  onChange={(e) => handleStandardBonusChange('reportPerStudent', Number(e.target.value))}
                  className="w-full px-2.5 py-1 text-xs border rounded-lg bg-white text-right font-semibold text-slate-800 outline-none"
                  step="1000"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-700">Closing Member Baru (FNM)</p>
                <p className="text-[10px] text-slate-400">Fee New Member per siswa daftar</p>
              </div>
              <div className="flex items-center gap-1 w-32">
                <span className="text-xs text-slate-400">Rp</span>
                <input
                  type="number"
                  value={formData.standardBonus.fnmPerClosing}
                  onChange={(e) => handleStandardBonusChange('fnmPerClosing', Number(e.target.value))}
                  className="w-full px-2.5 py-1 text-xs border rounded-lg bg-white text-right font-semibold text-slate-800 outline-none"
                  step="1000"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Denda Standar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
            <span className="text-rose-600 text-base">⚠️</span>
            Ketentuan Potongan &amp; Denda
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-700">Iuran Suka Duka</p>
                <p className="text-[10px] text-slate-400">Potongan tetap bulanan per tutor</p>
              </div>
              <div className="flex items-center gap-1 w-32">
                <span className="text-xs text-slate-400">Rp</span>
                <input
                  type="number"
                  value={formData.standardDeductions.sukaDuka}
                  onChange={(e) => handleStandardDeductionChange('sukaDuka', Number(e.target.value))}
                  className="w-full px-2.5 py-1 text-xs border rounded-lg bg-white text-right font-semibold text-slate-800 outline-none"
                  step="1000"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-700">Denda Keterlambatan Hadir</p>
                <p className="text-[10px] text-slate-400">Per kejadian telat</p>
              </div>
              <div className="flex items-center gap-1 w-32">
                <span className="text-xs text-slate-400">Rp</span>
                <input
                  type="number"
                  value={formData.standardDeductions.lateAttendance}
                  onChange={(e) => handleStandardDeductionChange('lateAttendance', Number(e.target.value))}
                  className="w-full px-2.5 py-1 text-xs border rounded-lg bg-white text-right font-semibold text-slate-800 outline-none"
                  step="1000"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-700">Pelanggaran OJL &amp; GC</p>
                <p className="text-[10px] text-slate-400">Per kejadian pelanggaran</p>
              </div>
              <div className="flex items-center gap-1 w-32">
                <span className="text-xs text-slate-400">Rp</span>
                <input
                  type="number"
                  value={formData.standardDeductions.violationOJL_GC}
                  onChange={(e) => handleStandardDeductionChange('violationOJL_GC', Number(e.target.value))}
                  className="w-full px-2.5 py-1 text-xs border rounded-lg bg-white text-right font-semibold text-slate-800 outline-none"
                  step="1000"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}