'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ClassType, RateConfig } from '@/types';

export default function RateConfigPanel() {
  const { currentUser, rates, updateRates, resetRatesToDefault } = useApp();

  // Tab aktif: 'contract' | 'intern' | 'general'
  const [activeTab, setActiveTab] = useState<'contract' | 'intern' | 'general'>('contract');

  // State lokal agar nilai tidak langsung berubah sebelum tombol simpan ditekan
  const [formData, setFormData] = useState<RateConfig>(rates);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm font-medium">
        ⚠️ Akses Terbatas: Pengaturan Ketentuan Gaji hanya dapat diakses oleh akun Admin.
      </div>
    );
  }

  // Handler tarif kelas dasar (Base Fees) untuk Kontrak & Magang
  const handleBaseFeeChange = (tier: 'contract' | 'intern', type: ClassType, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        baseFees: {
          ...prev[tier].baseFees,
          [type]: value,
        },
      },
    }));
  };

  // Handler bonus jarak (LDR) untuk Kontrak & Magang
  const handleLdrChange = (
    tier: 'contract' | 'intern',
    zone: keyof RateConfig['contract']['ldrBonus'],
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        ldrBonus: {
          ...prev[tier].ldrBonus,
          [zone]: value,
        },
      },
    }));
  };

  // Handler bonus kegiatan umum
  const handleStandardBonusChange = (key: keyof RateConfig['standardBonus'], value: number) => {
    setFormData((prev) => ({
      ...prev,
      standardBonus: {
        ...prev.standardBonus,
        [key]: value,
      },
    }));
  };

  // Handler denda operasional umum
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
    setSaveMessage('Ketentuan gaji (Kontrak & Magang) berhasil disimpan dan diterapkan ke seluruh sistem!');
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

  const ldrZoneList: { id: keyof RateConfig['contract']['ldrBonus']; label: string }[] = [
    { id: 'ldr_10', label: 'Jarak > 10 KM' },
    { id: 'ldr_15', label: 'Jarak > 15 KM' },
    { id: 'ldr_20', label: 'Jarak > 20 KM' },
    { id: 'panti_klungkung', label: 'Panti Klungkung' },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header Pengaturan */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Ketentuan &amp; Tarif Gaji</h2>
          <p className="text-xs text-slate-500 mt-1">
            Ubah besaran fee mengajar &amp; bonus LDR untuk <strong>Tutor Kontrak</strong> dan <strong>Tutor Magang (3 Bulan)</strong>, serta bonus kegiatan dan denda operasional.
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
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-200 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>💾</span> Simpan Perubahan
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span>✅</span>
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Navigasi Tab Pengaturan Tarif */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('contract')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'contract'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>📜</span> Tarif Tutor Kontrak (Reguler)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('intern')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'intern'
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-200'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🌱</span> Tarif Tutor Magang (Probation 3 Bln)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'general'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>⚙️</span> Bonus &amp; Potongan SOP
        </button>
      </div>

      {/* TAB 1: KETENTUAN TUTOR KONTRAK */}
      {activeTab === 'contract' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Base Fee Kontrak */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
              <span className="text-emerald-600 text-base font-extrabold">Rp</span>
              Tarif Dasar Sesi Kelas - Tutor Kontrak
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {classTypeList.map((type) => (
                <div key={`contract-${type}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700">{type}</span>
                  <div className="flex items-center gap-1.5 w-36">
                    <span className="text-xs text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={formData.contract?.baseFees[type] ?? 0}
                      onChange={(e) => handleBaseFeeChange('contract', type, Number(e.target.value))}
                      className="w-full px-2.5 py-1 text-xs border rounded-lg bg-white text-right font-semibold text-slate-800 focus:ring-2 focus:ring-slate-800 outline-none"
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LDR Kontrak */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
              <span className="text-purple-600 text-base">📍</span>
              Bonus Jarak / Transport (LDR) - Tutor Kontrak
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ldrZoneList.map((item) => (
                <div key={`contract-${item.id}`} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700 block mb-2">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={formData.contract?.ldrBonus[item.id] ?? 0}
                      onChange={(e) => handleLdrChange('contract', item.id, Number(e.target.value))}
                      className="w-full px-2.5 py-1 text-xs border rounded-lg bg-white text-right font-semibold text-slate-800 focus:ring-2 focus:ring-slate-800 outline-none"
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KETENTUAN TUTOR MAGANG (INTERN) */}
      {activeTab === 'intern' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Base Fee Magang */}
          <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
              <span className="text-amber-600 text-base font-extrabold">Rp</span>
              Tarif Dasar Sesi Kelas - Tutor Magang (Probation 3 Bulan)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {classTypeList.map((type) => (
                <div key={`intern-${type}`} className="flex items-center justify-between p-3 bg-amber-50/30 rounded-xl border border-amber-200">
                  <span className="text-xs font-semibold text-slate-700">{type}</span>
                  <div className="flex items-center gap-1.5 w-36">
                    <span className="text-xs text-amber-600 font-bold">Rp</span>
                    <input
                      type="number"
                      value={formData.intern?.baseFees[type] ?? 0}
                      onChange={(e) => handleBaseFeeChange('intern', type, Number(e.target.value))}
                      className="w-full px-2.5 py-1 text-xs border border-amber-300 rounded-lg bg-white text-right font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LDR Magang */}
          <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
              <span className="text-purple-600 text-base">📍</span>
              Bonus Jarak / Transport (LDR) - Tutor Magang
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ldrZoneList.map((item) => (
                <div key={`intern-${item.id}`} className="p-3 bg-amber-50/30 rounded-xl border border-amber-200">
                  <span className="text-xs font-semibold text-slate-700 block mb-2">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-amber-600 font-bold">Rp</span>
                    <input
                      type="number"
                      value={formData.intern?.ldrBonus[item.id] ?? 0}
                      onChange={(e) => handleLdrChange('intern', item.id, Number(e.target.value))}
                      className="w-full px-2.5 py-1 text-xs border border-amber-300 rounded-lg bg-white text-right font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BONUS & DENDA UMUM */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
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
      )}
    </form>
  );
}