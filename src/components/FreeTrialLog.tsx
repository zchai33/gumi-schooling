'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FreeTrial, User } from '@/types';

export default function FreeTrialLog() {
  const {
    currentUser,
    users,
    freeTrials,
    addFreeTrial,
    updateFreeTrial,
    deleteFreeTrial,
    toggleFreeTrialStatus,
    selectedMonth,
    setSelectedMonth,
    rates,
  } = useApp();

  // Search & Filter
  const [searchStudent, setSearchStudent] = useState('');

  // Modal Tambah Sesi Free Trial
  const [showAddModal, setShowAddModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [lesson, setLesson] = useState('');
  const [date, setDate] = useState(`${selectedMonth}-01`);

  // Modal Edit Sesi Free Trial (Admin)
  const [editingTrial, setEditingTrial] = useState<FreeTrial | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editLesson, setEditLesson] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTutorId, setEditTutorId] = useState('');

  // Saring sesi berdasarkan bulan aktif & pencarian nama murid
  const filteredTrials = freeTrials.filter((ft: FreeTrial) => {
    const matchMonth = ft.date.startsWith(selectedMonth);
    const matchSearch =
      searchStudent.trim() === '' ||
      ft.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      ft.tutorName.toLowerCase().includes(searchStudent.toLowerCase());
    return matchMonth && matchSearch;
  });

  const handleOpenAddModal = () => {
    setStudentName('');
    setLesson('');
    // Set default tanggal hari ini jika cocok bulan berjalan, atau awal bulan terpilih
    const today = new Date().toISOString().split('T')[0];
    setDate(today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`);
    setShowAddModal(true);
  };

  const handleCreateTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !lesson.trim()) {
      alert('Harap lengkapi nama calon siswa dan materi ice breaking!');
      return;
    }

    addFreeTrial({
      studentName,
      lesson,
      date,
    });

    setShowAddModal(false);
  };

  const handleOpenEditModal = (ft: FreeTrial) => {
    setEditingTrial(ft);
    setEditStudentName(ft.studentName);
    setEditLesson(ft.lesson);
    setEditDate(ft.date);
    setEditTutorId(ft.tutorId);
  };

  const handleSaveEditTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrial) return;

    const assignedTutor = users.find((u: User) => u.id === editTutorId);

    updateFreeTrial(editingTrial.id, {
      studentName: editStudentName,
      lesson: editLesson,
      date: editDate,
      tutorId: editTutorId,
      tutorName: assignedTutor ? assignedTutor.name : editingTrial.tutorName,
    });

    setEditingTrial(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Hapus sesi Free Trial untuk siswa "${name}"?`)) {
      deleteFreeTrial(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Periode Bulan */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Catatan Sesi Free Trial</h2>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan sesi pengenalan siswa baru periode <strong>{selectedMonth}</strong>. Fee: Rp{' '}
            {(rates.baseFees['Free Trial'] || 25000).toLocaleString('id-ID')} / sesi.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Month Picker Sinkron */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600 pl-1">Periode:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1 text-xs border rounded-lg bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-200 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-200 transition-all flex items-center gap-2"
          >
            <span>🎯</span> + Catat Free Trial
          </button>
        </div>
      </div>

      {/* Bar Pencarian */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari nama calon murid atau tutor..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
          {searchStudent && (
            <button
              onClick={() => setSearchStudent('')}
              className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total: <strong className="text-slate-800">{filteredTrials.length}</strong> sesi di bulan ini
        </div>
      </div>

      {/* Tabel Data Free Trial */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Nama Calon Siswa</th>
                <th className="py-3.5 px-4">Tutor Pengajar</th>
                <th className="py-3.5 px-4">Materi / Ice Breaking</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {currentUser?.role === 'admin' && <th className="py-3.5 px-4 text-center">Aksi Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrials.length === 0 ? (
                <tr>
                  <td
                    colSpan={currentUser?.role === 'admin' ? 6 : 5}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    Belum ada catatan Free Trial untuk periode bulan {selectedMonth}.
                  </td>
                </tr>
              ) : (
                filteredTrials.map((ft: FreeTrial) => (
                  <tr key={ft.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                      {ft.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      {ft.studentName}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {ft.tutorName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs leading-relaxed">
                      {ft.lesson}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleFreeTrialStatus(ft.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                          ft.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                        title="Klik untuk mengubah status"
                      >
                        {ft.status === 'completed' ? '✓ Selesai' : '⏳ Pending'}
                      </button>
                    </td>

                    {/* Tombol Koreksi Admin */}
                    {currentUser?.role === 'admin' && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(ft)}
                            className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                            title="Edit Data"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(ft.id, ft.studentName)}
                            className="p-1 text-rose-600 hover:text-rose-800 rounded hover:bg-rose-50"
                            title="Hapus Trial"
                          >
                            🗑️️
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CATAT FREE TRIAL BARU */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">Catat Sesi Free Trial</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrial} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Calon Siswa
                </label>
                <input
                  type="text"
                  placeholder="Misal: Made Junior"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tanggal Pertemuan
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tutor Pengajar
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${currentUser?.name} (Akun Anda)`}
                    className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-100 text-slate-600 font-semibold cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Materi / Rincian Ice Breaking
                </label>
                <textarea
                  rows={3}
                  placeholder="Misal: Phonics A-B-C, Alphabet Song, Assessment Level"
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Simpan Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT FREE TRIAL (ADMIN KOREKSI ERROR) */}
      {editingTrial && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Mode Admin
                </span>
                <h3 className="font-bold text-slate-800 text-base">Edit Sesi Free Trial</h3>
              </div>
              <button
                onClick={() => setEditingTrial(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTrial} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Calon Siswa
                </label>
                <input
                  type="text"
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tanggal Pertemuan
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Ganti Tutor
                  </label>
                  <select
                    value={editTutorId}
                    onChange={(e) => setEditTutorId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {users
                      .filter((u: User) => u.role === 'tutor')
                      .map((t: User) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Materi / Rincian Ice Breaking
                </label>
                <textarea
                  rows={3}
                  value={editLesson}
                  onChange={(e) => setEditLesson(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingTrial(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}