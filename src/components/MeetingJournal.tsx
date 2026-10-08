'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Classroom, Meeting, User } from '@/types';

export default function MeetingJournal() {
  const {
    currentUser,
    users,
    classrooms,
    meetings,
    addMeeting,
    updateMeeting,
    clearMeetingSlot,
    toggleLockMeeting,
    lockEmptySlot,
    selectedMonth,
    setSelectedMonth,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  // State Saklar Kunci Pengisian Jurnal (Audit Mode)
  const [isJournalLocked, setIsJournalLocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gumi_journal_submission_locked') === 'true';
    }
    return false;
  });

  const handleToggleJournalLock = () => {
    const nextState = !isJournalLocked;
    setIsJournalLocked(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gumi_journal_submission_locked', String(nextState));
    }
  };

  // 1. Tab Kategori Program
  const tabTypes: { id: string; label: string }[] = [
    { id: 'all', label: 'Semua Program' },
    { id: 'Kids-A', label: 'Kids-A' },
    { id: 'Kids-B', label: 'Kids-B' },
    { id: 'SPL-A', label: 'SPL-A' },
    { id: 'SPL-B', label: 'SPL-B' },
    { id: 'Group', label: 'Group' },
    { id: 'Test Prep-A', label: 'Test Prep-A (1.5 Jam)' },
    { id: 'Test Prep-B', label: 'Test Prep-B (1 Jam)' },
    { id: 'Social Banjar/Panti', label: 'Social/Panti' },
  ];
  const [activeTabType, setActiveTabType] = useState<string>('all');

  // 2. Search Nama Murid / Kelas
  const [searchStudent, setSearchStudent] = useState<string>('');

  // 3. State Modal Pengisian Sesi Kosong
  const [activeSlot, setActiveSlot] = useState<{ classId: string; meetingNumber: number } | null>(null);
  const [inputDate, setInputDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [inputLesson, setInputLesson] = useState<string>('');
  const [inputNotes, setInputNotes] = useState<string>('');
  const [claimVideo, setClaimVideo] = useState<boolean>(false);

  // 4. State Modal Edit Sesi untuk Admin (Human Error Correction)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editLesson, setEditLesson] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editTutorId, setEditTutorId] = useState<string>('');
  const [editClaimVideo, setEditClaimVideo] = useState<boolean>(false);

  // Filter Kelas berdasarkan Tab & Search
  const filteredClassrooms: Classroom[] = classrooms.filter((cls: Classroom) => {
    const matchType = activeTabType === 'all' || cls.type === activeTabType;
    const matchSearch =
      searchStudent.trim() === '' ||
      cls.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      cls.students.some((st: string) => st.toLowerCase().includes(searchStudent.toLowerCase()));
    return matchType && matchSearch;
  });

  const handleOpenFillModal = (classId: string, meetingNumber: number) => {
    if (!isAdmin && isJournalLocked) {
      alert('Pengisian jurnal sedang dinonaktifkan untuk proses audit oleh Admin.');
      return;
    }
    setActiveSlot({ classId, meetingNumber });
    setInputDate(`${selectedMonth}-01`);
    setInputLesson('');
    setInputNotes('');
    setClaimVideo(false);
  };

  const handleSubmitMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlot) return;
    if (!isAdmin && isJournalLocked) {
      alert('Pengisian jurnal sedang dinonaktifkan untuk proses audit oleh Admin.');
      return;
    }
    if (!inputLesson.trim()) {
      alert('Harap masukkan materi pelajaran (lesson)!');
      return;
    }

    addMeeting({
      classroomId: activeSlot.classId,
      meetingNumber: activeSlot.meetingNumber,
      date: inputDate,
      lesson: inputLesson,
      notes: inputNotes,
      hasVideoClaim: claimVideo,
    });

    setActiveSlot(null);
  };

  const handleOpenEditModal = (mtg: Meeting) => {
    setEditingMeeting(mtg);
    setEditDate(mtg.date);
    setEditLesson(mtg.lesson);
    setEditNotes(mtg.notes || '');
    setEditTutorId(mtg.tutorId);
    setEditClaimVideo(mtg.hasVideoClaim || false);
  };

  const handleSaveEditMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting) return;

    const assignedTutor = users.find((u: User) => u.id === editTutorId);

    updateMeeting(editingMeeting.id, {
      date: editDate,
      lesson: editLesson,
      notes: editNotes,
      hasVideoClaim: editClaimVideo,
      tutorId: editTutorId,
      tutorName: assignedTutor ? assignedTutor.name : editingMeeting.tutorName,
    });

    setEditingMeeting(null);
  };

  const handleClearSlot = (classroomId: string, meetingNumber: number) => {
    if (confirm(`Yakin ingin mengosongkan/menghapus isi sesi pertemuan #${meetingNumber}? Kolom akan bersih kembali.`)) {
      clearMeetingSlot(classroomId, meetingNumber);
    }
  };

  const selectedClassForModal = classrooms.find((c: Classroom) => c.id === activeSlot?.classId);

  return (
    <div className="space-y-6">
      {/* Header Halaman & Filter Bulan Jurnal */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lembar Jurnal Mengajar</h2>
          <p className="text-xs text-slate-500 mt-1">
            Format spreadsheet matriks per murid. Menampilkan aktivitas bulan <strong>{selectedMonth}</strong> secara default.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* SAKLAR AUDIT KHUSUS ADMIN */}
          {isAdmin && (
            <button
              onClick={handleToggleJournalLock}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 border ${
                isJournalLocked
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Kunci atau buka izin pengisian jurnal untuk seluruh tutor"
            >
              <span>{isJournalLocked ? '🔒' : '🔓'}</span>
              <span>{isJournalLocked ? 'Akses Tutor: TERKUNCI (Audit)' : 'Akses Tutor: TERBUKA'}</span>
            </button>
          )}

          {/* Pemilih Periode Bulan Jurnal */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600 pl-1">Periode:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs border rounded-lg bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* BANNER NOTIFIKASI JIKA SEDANG AUDIT (SISI TUTOR) */}
      {!isAdmin && isJournalLocked && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900 animate-in fade-in">
          <span className="text-2xl">🔒</span>
          <div>
            <h4 className="font-bold text-xs">Akses Pengisian Jurnal Sedang Ditutup (Audit Mode)</h4>
            <p className="text-[11px] text-amber-800/80 mt-0.5">
              Admin sedang melakukan peninjauan & audit sesi bulanan. Anda tetap dapat melihat catatan dan mencari data murid, namun tombol pengisian sesi baru sementara dinonaktifkan.
            </p>
          </div>
        </div>
      )}

      {/* Kontrol Tab Program & Search Murid */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        {/* Tab Program */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 font-semibold shrink-0 mr-1">Program Sheet:</span>
          {tabTypes.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTabType === tab.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input Cari Murid */}
        <div className="relative max-w-md pt-1">
          <input
            type="text"
            placeholder="Ketik nama murid untuk mencari (misal: Ayu Widya)..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <span className="absolute left-3 top-3 text-xs text-slate-400">🔍</span>
          {searchStudent && (
            <button
              onClick={() => setSearchStudent('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid Tabel Matriks Jurnal */}
      {filteredClassrooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          Tidak ditemukan murid atau kelas yang cocok dengan pencarian &quot;{searchStudent}&quot;.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredClassrooms.map((cls: Classroom) => {
            const classMeetings: Meeting[] = meetings.filter(
              (m: Meeting) => m.classroomId === cls.id && m.date?.startsWith(selectedMonth)
            );
            const highestMeetingNum =
              classMeetings.length > 0
                ? Math.max(...classMeetings.map((m: Meeting) => m.meetingNumber))
                : 0;
            const totalCols = Math.max(cls.totalMeetings || 4, highestMeetingNum, 4);
            const colIndexes: number[] = Array.from({ length: totalCols }, (_, i) => i + 1);

            return (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden"
              >
                {/* HEADER KOTAK KELAS & NAMA MURID */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start md:items-center gap-3.5">
                    <span className="px-3 py-1.5 bg-amber-500 text-white font-black text-xs uppercase rounded-lg tracking-wider shrink-0 shadow-sm">
                      CLASS
                    </span>
                    <div>
                      {/* NAMA MURID BESAR */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          Murid:
                        </span>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                          {cls.students.join(', ')}
                        </h3>
                      </div>

                      {/* DETAIL KELAS */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                          {cls.name}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                          Program: {cls.type}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          Bulan: {selectedMonth}
                        </span>
                        {cls.ldrZone !== 'none' && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                              📍 {cls.ldrZone.replace('_', ' >').toUpperCase()} KM
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabel Matriks Horizontal */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse min-w-[750px]">
                    <tbody>
                      {/* Baris 1: Meet This Month */}
                      <tr className="border-b border-slate-200">
                        <td className="w-40 py-2.5 px-4 font-bold bg-amber-100 text-slate-800 border-r border-slate-300">
                          Meet This Month
                        </td>
                        {colIndexes.map((num: number) => (
                          <td
                            key={num}
                            className="py-2.5 px-3 text-center font-bold bg-rose-50 text-slate-800 border-r border-slate-200 min-w-[145px]"
                          >
                            {num}
                          </td>
                        ))}
                      </tr>

                      {/* Baris 2: Class meetings */}
                      <tr className="border-b border-slate-200">
                        <td className="py-2.5 px-4 font-bold bg-amber-100 text-slate-800 border-r border-slate-300">
                          Class meetings
                        </td>
                        {colIndexes.map((num: number) => (
                          <td
                            key={num}
                            className="py-2.5 px-3 text-center font-bold text-slate-700 border-r border-slate-200"
                          >
                            {num}
                          </td>
                        ))}
                      </tr>

                      {/* Baris 3: Date */}
                      <tr className="border-b border-slate-200">
                        <td className="py-2.5 px-4 font-bold bg-amber-100 text-slate-800 border-r border-slate-300">
                          Date
                        </td>
                        {colIndexes.map((num: number) => {
                          const mtg = classMeetings.find((m: Meeting) => m.meetingNumber === num);
                          return (
                            <td
                              key={num}
                              className="py-2 px-3 text-center text-slate-700 border-r border-slate-200 font-medium"
                            >
                              {mtg ? (
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                  {mtg.date}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Baris 4: Tutor */}
                      <tr className="border-b border-slate-200">
                        <td className="py-2.5 px-4 font-bold bg-amber-100 text-slate-800 border-r border-slate-300">
                          Tutor
                        </td>
                        {colIndexes.map((num: number) => {
                          const mtg = classMeetings.find((m: Meeting) => m.meetingNumber === num);
                          return (
                            <td
                              key={num}
                              className="py-2 px-3 text-center border-r border-slate-200 font-semibold text-slate-800"
                            >
                              {mtg ? mtg.tutorName : <span className="text-slate-300">-</span>}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Baris 5: Lesson, Status, Edit & Reset */}
                      <tr>
                        <td className="py-3 px-4 font-bold bg-amber-100 text-slate-800 border-r border-slate-300">
                          Lesson
                        </td>
                        {colIndexes.map((num: number) => {
                          const mtg = classMeetings.find((m: Meeting) => m.meetingNumber === num);

                          return (
                            <td
                              key={num}
                              className="py-2.5 px-3 border-r border-slate-200 text-slate-700 align-top"
                            >
                              {mtg ? (
                                <div className="space-y-1.5">
                                  <p className="font-medium text-slate-800 leading-snug">{mtg.lesson}</p>

                                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                    {mtg.hasVideoClaim && (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                                        🎬 Video
                                      </span>
                                    )}

                                    {mtg.isLocked && (
                                      <span className="inline-block text-[9px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200">
                                        🔒 Terkunci / Hangus
                                      </span>
                                    )}
                                  </div>

                                  {/* KONTROL ADMIN UNTUK MEMPERBAIKI KESALAHAN TUTOR */}
                                  {isAdmin && (
                                    <div className="pt-1.5 flex items-center gap-2 border-t border-slate-100">
                                      <button
                                        onClick={() => handleOpenEditModal(mtg)}
                                        className="text-[10px] text-amber-600 hover:text-amber-800 font-semibold hover:underline"
                                      >
                                        ✏️ Edit
                                      </button>
                                      <span className="text-slate-300 text-[10px]">•</span>
                                      <button
                                        onClick={() => handleClearSlot(cls.id, num)}
                                        className="text-[10px] text-rose-600 hover:text-rose-800 font-semibold hover:underline"
                                      >
                                        🗑️ Kosongkan
                                      </button>
                                      <span className="text-slate-300 text-[10px]">•</span>
                                      <button
                                        onClick={() => toggleLockMeeting(mtg.id)}
                                        className="text-[10px] text-slate-500 hover:text-slate-700 hover:underline"
                                      >
                                        {mtg.isLocked ? 'Buka' : 'Kunci'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                /* KOLOM KOSONG DI BULAN INI */
                                <div className="space-y-1.5">
                                  {!isAdmin && isJournalLocked ? (
                                    <div className="w-full py-1 text-[10px] text-slate-400 bg-slate-50 border border-slate-200 rounded text-center font-medium">
                                      🔒 Terkunci (Audit)
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenFillModal(cls.id, num)}
                                      className="w-full py-1 text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-dashed border-emerald-300 rounded font-semibold transition-all"
                                    >
                                      + Isi Sesi #{num}
                                    </button>
                                  )}

                                  {isAdmin && (
                                    <button
                                      onClick={() => lockEmptySlot(cls.id, num)}
                                      className="w-full py-0.5 text-[10px] text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-all flex items-center justify-center gap-1"
                                      title="Kunci sesi ini agar hangus"
                                    >
                                      <span>🔒</span> Kunci Slot
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: INPUT JURNAL BARU */}
      {activeSlot && selectedClassForModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Input Jurnal Mengajar
                </span>
                <h3 className="font-black text-slate-900 text-lg leading-snug">
                  {selectedClassForModal.students.join(', ')}
                </h3>
                <p className="text-xs text-slate-500">
                  Kelas: {selectedClassForModal.name} ({selectedClassForModal.type})
                </p>
              </div>
              <button
                onClick={() => setActiveSlot(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitMeeting} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pertemuan Ke</label>
                  <input
                    type="text"
                    disabled
                    value={`Pertemuan #${activeSlot.meetingNumber}`}
                    className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-100 text-slate-700 font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Mengajar</label>
                  <input
                    type="date"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Tutor</label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser?.name} (Akun Anda)`}
                  className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Materi Pelajaran / Topik Bahasan (Lesson)
                </label>
                <textarea
                  rows={3}
                  placeholder="Misal: Alfabet W and H, Phonics Review"
                  value={inputLesson}
                  onChange={(e) => setInputLesson(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* CHECKBOX KLAIM FEE VIDEO */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                    <span>🎬</span> Klaim Fee Video Siswa
                  </div>
                  <p className="text-[10px] text-amber-700/80 mt-0.5">
                    Centang jika sesi ini mengunggah konten video murid (+Rp 10.000).
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={claimVideo}
                    onChange={(e) => setClaimVideo(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500"
                  />
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setActiveSlot(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Simpan ke Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT SESI (KHUSUS ADMIN) */}
      {editingMeeting && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Koreksi / Edit Jurnal (Mode Admin)
                </span>
                <h3 className="font-black text-slate-900 text-base leading-snug">
                  Pertemuan #{editingMeeting.meetingNumber}
                </h3>
              </div>
              <button
                onClick={() => setEditingMeeting(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditMeeting} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Mengajar</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ganti Tutor Pengajar</label>
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Materi Pelajaran / Topik Bahasan (Lesson)
                </label>
                <textarea
                  rows={3}
                  value={editLesson}
                  onChange={(e) => setEditLesson(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* CHECKBOX KLAIM FEE VIDEO */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                    <span>🎬</span> Klaim Fee Video Siswa
                  </div>
                  <p className="text-[10px] text-amber-700/80 mt-0.5">
                    Status bonus video dokumentasi murid (+Rp 10.000).
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={editClaimVideo}
                    onChange={(e) => setEditClaimVideo(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500"
                  />
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingMeeting(null)}
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