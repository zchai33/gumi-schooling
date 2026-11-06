'use client';

import React, { useState, useMemo } from 'react';
import { useApp, isValidYouTubeUrl } from '@/context/AppContext';
import { FreeTrial, User } from '@/types';

export default function FreeTrialLog() {
  const {
    currentUser,
    users,
    freeTrials,
    selectedMonth,
    setSelectedMonth,
    addFreeTrial,
    updateFreeTrial,
    deleteFreeTrial,
    toggleFreeTrialStatus,
    rates,
    isJournalLocked,
    isMonthLocked,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';
  const isPeriodLocked = isJournalLocked || isMonthLocked(selectedMonth);

  // Ambil fee mengajar Free Trial sesuai status kepegawaian tutor yang login
  const currentBaseFees =
    currentUser?.employmentType === 'intern'
      ? rates.intern?.baseFees
      : rates.contract?.baseFees;

  const currentFreeTrialFee = currentBaseFees?.['Free Trial'] || 25000;

  // Filter Tanggal Spesifik & Pencarian
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal Tambah Sesi
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('');
  const [lesson, setLesson] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Modal Edit Sesi
  const [editingTrial, setEditingTrial] = useState<FreeTrial | null>(null);
  const [editStudentName, setEditStudentName] = useState<string>('');
  const [editLesson, setEditLesson] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editTutorId, setEditTutorId] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editVideoUrl, setEditVideoUrl] = useState<string>('');

  // Filter Sesi Bulan Terpilih (Jika Tutor hanya miliknya, jika Admin semua)
  const monthlyTrials = useMemo(() => {
    return freeTrials.filter((ft: FreeTrial) => {
      const matchMonth = ft.date && ft.date.startsWith(selectedMonth);
      const matchTutor = isAdmin ? true : ft.tutorId === currentUser?.id;
      return matchMonth && matchTutor;
    });
  }, [freeTrials, selectedMonth, isAdmin, currentUser?.id]);

  // Filter berdasarkan tanggal & pencarian nama siswa/tutor/materi
  const filteredTrials = useMemo(() => {
    return monthlyTrials.filter((ft: FreeTrial) => {
      const matchDate = selectedDate ? ft.date === selectedDate : true;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        ft.studentName.toLowerCase().includes(q) ||
        ft.tutorName.toLowerCase().includes(q) ||
        ft.lesson.toLowerCase().includes(q);

      return matchDate && matchSearch;
    });
  }, [monthlyTrials, selectedDate, searchQuery]);

  // Generator Salin Template Pesan WhatsApp
  const handleCopyWATemplate = (ft: FreeTrial) => {
    const videoText = ft.videoUrl ? `\nLink Dokumentasi: ${ft.videoUrl}` : '';
    const noteText = ft.notes || 'Anak aktif dan antusias selama pembelajaran.';
    const text = `Halo Ayah/Bunda ${ft.studentName}, terima kasih telah mengikuti sesi *Free Trial* bersama Gumi Schooling pada ${ft.date}.\n\nMateri yang dipelajari: *${ft.lesson}*\nCatatan Perkembangan: ${noteText}${videoText}\n\nSalam hangat,\nTim Gumi Schooling Education Centre`;

    navigator.clipboard.writeText(text);
    alert('Template laporan WhatsApp berhasil disalin ke clipboard!');
  };

  const handleOpenAddModal = () => {
    setStudentName('');
    setLesson('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setVideoUrl('');
    setShowAddModal(true);
  };

  const handleSaveAddTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !lesson.trim() || !date) {
      alert('Nama Siswa, Materi, dan Tanggal wajib diisi!');
      return;
    }

    const cleanUrl = videoUrl.trim();
    if (cleanUrl && !isValidYouTubeUrl(cleanUrl)) {
      alert('Tautan video harus berupa URL YouTube yang valid!');
      return;
    }

    await addFreeTrial({
      studentName: studentName.trim(),
      lesson: lesson.trim(),
      date,
      notes: notes.trim(),
      videoUrl: cleanUrl,
    });

    setShowAddModal(false);
  };

  const handleOpenEditModal = (ft: FreeTrial) => {
    setEditingTrial(ft);
    setEditStudentName(ft.studentName);
    setEditLesson(ft.lesson);
    setEditDate(ft.date);
    setEditTutorId(ft.tutorId);
    setEditNotes(ft.notes || '');
    setEditVideoUrl(ft.videoUrl || '');
  };

  const handleSaveEditTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrial) return;

    if (!editStudentName.trim() || !editLesson.trim() || !editDate) {
      alert('Nama Siswa, Materi, dan Tanggal tidak boleh kosong!');
      return;
    }

    const cleanUrl = editVideoUrl.trim();
    if (cleanUrl && !isValidYouTubeUrl(cleanUrl)) {
      alert('Tautan video harus berupa URL YouTube yang valid!');
      return;
    }

    const assignedTutor = users.find((u: User) => u.id === editTutorId);

    await updateFreeTrial(editingTrial.id, {
      studentName: editStudentName.trim(),
      lesson: editLesson.trim(),
      date: editDate,
      tutorId: editTutorId,
      tutorName: assignedTutor ? assignedTutor.name : editingTrial.tutorName,
      notes: editNotes.trim(),
      videoUrl: cleanUrl,
    });

    setEditingTrial(null);
  };

  const handleDelete = async (ft: FreeTrial) => {
    if (confirm(`Hapus catatan sesi Free Trial siswa "${ft.studentName}"?`)) {
      await deleteFreeTrial(ft.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Periode Bulan */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl text-lg">🎯</span>
            <h2 className="text-xl font-bold text-slate-800">Log Sesi Free Trial</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan sesi uji coba calon siswa baru. Fee: <strong>Rp {currentFreeTrialFee.toLocaleString('id-ID')}</strong> / sesi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600 pl-1">Bulan:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1 text-xs border rounded-lg bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600 pl-1">Tanggal:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 text-xs border rounded-lg bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-[10px] text-slate-400 hover:text-slate-600 px-1"
                title="Tampilkan semua tanggal"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={handleOpenAddModal}
            disabled={isPeriodLocked}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md shadow-amber-200 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
          >
            <span>+</span> Catat Free Trial
          </button>
        </div>
      </div>

      {/* Input Pencarian */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder={
              isAdmin
                ? 'Cari nama calon siswa, tutor, atau materi...'
                : 'Cari nama calon siswa atau materi ajar Anda...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabel Data Free Trial */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Nama Calon Siswa</th>
                <th className="py-3.5 px-4">Tutor Pengajar</th>
                <th className="py-3.5 px-4">Materi &amp; Catatan Perkembangan</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Broadcast WA</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Belum ada sesi Free Trial yang tercatat pada filter periode ini.
                  </td>
                </tr>
              ) : (
                filteredTrials.map((ft: FreeTrial) => (
                  <tr key={ft.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      {ft.date}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      {ft.studentName}
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {ft.tutorName}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{ft.lesson}</div>
                      {ft.notes && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          &ldquo;{ft.notes}&rdquo;
                        </div>
                      )}
                      {ft.videoUrl && (
                        <div className="mt-1">
                          <a
                            href={ft.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded border border-rose-200 transition-colors"
                          >
                            ▶ Video YT ↗
                          </a>
                        </div>
                      )}
                    </td>

                    {/* HAK AKSES STATUS: ADMIN BISA KLIK, TUTOR HANYA VIEW */}
                    <td className="py-3 px-4 text-center">
                      {isAdmin ? (
                        <button
                          onClick={() => toggleFreeTrialStatus(ft.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${
                            ft.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                          title="Klik untuk mengubah status sesi"
                        >
                          {ft.status === 'completed' ? '✓ Selesai' : '⏳ Pending'}
                        </button>
                      ) : (
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-default ${
                            ft.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {ft.status === 'completed' ? '✓ Selesai' : '⏳ Pending'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleCopyWATemplate(ft)}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-[10px] font-bold shadow-sm transition-all inline-flex items-center gap-1"
                        title="Salin template format pesan WhatsApp"
                      >
                        <span>📲</span> Salin WA
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(ft)}
                          disabled={!isAdmin && isPeriodLocked}
                          className="px-2 py-1 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-all disabled:opacity-50"
                          title="Edit Sesi"
                        >
                          ✏️
                        </button>
                        {(isAdmin || ft.tutorId === currentUser?.id) && (
                          <button
                            onClick={() => handleDelete(ft)}
                            disabled={!isAdmin && isPeriodLocked}
                            className="px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
                            title="Hapus Sesi"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: TAMBAH SESI FREE TRIAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">Catat Sesi Free Trial</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddTrial} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Calon Siswa</label>
                <input
                  type="text"
                  placeholder="Misal: Kevin"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Pembelajaran</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Materi yang Diajarkan</label>
                <input
                  type="text"
                  placeholder="Misal: Basic Phonics & Numbers"
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Perkembangan Anak (Notes)</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Anak sangat aktif, cepat menangkap kosakata baru..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tautan Video YouTube (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://youtu.be/... atau https://youtube.com/shorts/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono text-[11px]"
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
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Simpan Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT SESI FREE TRIAL */}
      {editingTrial && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Koreksi Sesi Free Trial
                </span>
                <h3 className="font-bold text-slate-800 text-base">{editingTrial.studentName}</h3>
              </div>
              <button onClick={() => setEditingTrial(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTrial} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Calon Siswa</label>
                <input
                  type="text"
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  required
                />
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tutor Pengajar</label>
                  <select
                    value={editTutorId}
                    onChange={(e) => setEditTutorId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 bg-white"
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
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Materi</label>
                <input
                  type="text"
                  value={editLesson}
                  onChange={(e) => setEditLesson(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Perkembangan Anak</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tautan Video YouTube</label>
                <input
                  type="url"
                  placeholder="https://youtu.be/..."
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono text-[11px]"
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
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm"
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