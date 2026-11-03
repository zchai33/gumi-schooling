'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Classroom, Meeting } from '@/types';

export default function DokvidKelasView() {
  const {
    currentUser,
    classrooms,
    meetings,
    selectedMonth,
    setSelectedMonth,
    toggleSentToParent,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  // Filter Tanggal Spesifik (Default: kosong/semua hari di bulan terpilih)
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Ambil sesi bulan aktif (jika Tutor, HANYA ambil sesi miliknya)
  const monthlyMeetings = useMemo(() => {
    return meetings.filter((m: Meeting) => {
      const matchMonth = m.date && m.date.startsWith(selectedMonth) && !m.isLocked;
      const matchTutor = isAdmin ? true : m.tutorId === currentUser?.id;
      return matchMonth && matchTutor;
    });
  }, [meetings, selectedMonth, isAdmin, currentUser?.id]);

  // Filter berdasarkan tanggal dan kolom pencarian
  const filteredMeetings = useMemo(() => {
    return monthlyMeetings.filter((m: Meeting) => {
      const cls = classrooms.find((c: Classroom) => c.id === m.classroomId);
      const matchDate = selectedDate ? m.date === selectedDate : true;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        (cls && cls.name.toLowerCase().includes(q)) ||
        (cls && cls.students.some((s) => s.toLowerCase().includes(q))) ||
        m.tutorName.toLowerCase().includes(q) ||
        m.lesson.toLowerCase().includes(q);

      return matchDate && matchSearch;
    });
  }, [monthlyMeetings, classrooms, selectedDate, searchQuery]);

  // Generator Teks Template WhatsApp
  const generateBroadcastText = (m: Meeting, cls?: Classroom) => {
    const studentNames = cls ? cls.students.join(', ') : 'Student';
    const className = cls ? cls.name : '-';
    const videoSection = m.videoUrl ? `Link : ${m.videoUrl}\n` : '';
    const noteSection = m.notes ? m.notes : 'Pembelajaran berjalan lancar dan interaktif.';

    return `👋 Hello! Here's the class for today

Class : ${studentNames} (${className})
Meeting : ${m.meetingNumber}
Date : ${m.date}
Tutor : ${m.tutorName}
Lesson : ${m.lesson}
${videoSection}Note : ${noteSection}`;
  };

  const handleCopyText = (meetingId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(meetingId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const totalWithVideo = filteredMeetings.filter((m) => m.videoUrl && m.videoUrl.trim() !== '').length;
  const totalSent = filteredMeetings.filter((m) => m.isSentToParent).length;

  return (
    <div className="space-y-6">
      {/* Header & Filter Kontrol */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl text-lg">📹</span>
            <h2 className="text-xl font-bold text-slate-800">Dokvid Kelas &amp; Laporan Ortu</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Pusat tinjauan materi, video pembelajaran murid, dan salin draf format broadcast WhatsApp ke orang tua.'
              : 'Daftar riwayat materi dan video pembelajaran murid yang Anda ajar.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Pemilih Periode Bulan */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600 pl-1">Bulan:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1 text-xs border rounded-lg bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Pemilih Tanggal Spesifik Hari Ini */}
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
                title="Tampilkan semua tanggal di bulan ini"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bar Statistik Ringkas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              {isAdmin ? 'Total Sesi Masuk' : 'Total Sesi Saya'}
            </span>
            <div className="text-2xl font-black text-slate-800 mt-0.5">{filteredMeetings.length} Sesi</div>
          </div>
          <span className="text-2xl p-2.5 bg-slate-50 rounded-xl">📚</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-rose-500 uppercase">Dengan Video YouTube</span>
            <div className="text-2xl font-black text-rose-600 mt-0.5">{totalWithVideo} Sesi</div>
          </div>
          <span className="text-2xl p-2.5 bg-rose-50 rounded-xl">🎬</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase">Terkirim ke Ortu</span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {totalSent} / {filteredMeetings.length}
            </div>
          </div>
          <span className="text-2xl p-2.5 bg-emerald-50 rounded-xl">👍</span>
        </div>
      </div>

      {/* Input Pencarian Nama Kelas / Siswa */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder={
              isAdmin
                ? 'Cari berdasarkan nama murid, nama kelas, atau tutor...'
                : 'Cari berdasarkan nama murid atau kelas Anda...'
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

      {/* Notifikasi Salin Berhasil */}
      {copiedId && (
        <div className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-lg shadow-emerald-200 animate-in fade-in">
          <span>✅ Draf deskripsi berhasil disalin ke clipboard! Siap di-paste ke WhatsApp orang tua.</span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">Tersalin</span>
        </div>
      )}

      {/* Daftar Kartu Dokvid Kelas */}
      {filteredMeetings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          {isAdmin
            ? 'Tidak ada sesi jurnal mengajar pada filter tanggal/periode ini.'
            : 'Belum ada sesi kelas yang Anda isi pada filter tanggal/periode ini.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMeetings.map((m: Meeting) => {
            const cls = classrooms.find((c: Classroom) => c.id === m.classroomId);
            const broadcastText = generateBroadcastText(m, cls);
            const hasVideo = Boolean(m.videoUrl && m.videoUrl.trim() !== '');

            return (
              <div
                key={m.id}
                className={`bg-white rounded-3xl border transition-all p-5 shadow-sm flex flex-col justify-between space-y-4 ${
                  m.isSentToParent
                    ? 'border-emerald-300 bg-emerald-50/10'
                    : 'border-slate-300 hover:border-amber-400'
                }`}
              >
                {/* Header Kartu */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-amber-500 text-white font-extrabold text-[10px] uppercase rounded-md tracking-wider">
                        Pertemuan #{m.meetingNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        🗓️ {m.date}
                      </span>
                      {hasVideo ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold text-[10px] rounded-full border border-rose-200">
                          🎬 Ada Video
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full">
                          Tanpa Video
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-800 mt-2">
                      {cls ? cls.students.join(', ') : 'Nama Siswa'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Kelas: <strong>{cls ? cls.name : '-'}</strong> ({cls ? cls.type : '-'}) • Tutor: <strong>{m.tutorName}</strong>
                    </p>
                  </div>

                  {/* Status Jempol: ADMIN BISA KLIK, TUTOR HANYA VIEW (READ-ONLY) */}
                  {isAdmin ? (
                    <button
                      onClick={() => toggleSentToParent(m.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
                        m.isSentToParent
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Klik untuk mengubah status pengiriman ke ortu"
                    >
                      <span>{m.isSentToParent ? '👍' : '⚪'}</span>
                      <span>{m.isSentToParent ? 'Terkirim ke Ortu' : 'Belum Dikirim'}</span>
                    </button>
                  ) : (
                    <div
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-default ${
                        m.isSentToParent
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <span>{m.isSentToParent ? '👍' : '⚪'}</span>
                      <span>{m.isSentToParent ? 'Terkirim' : 'Belum Dikirim'}</span>
                    </div>
                  )}
                </div>

                {/* Kotak Preview Format Broadcast WhatsApp */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed relative group">
                  <div className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Format Teks WhatsApp:
                  </div>
                  {broadcastText}
                </div>

                {/* Tombol Aksi Bawah */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {/* Tombol Salin */}
                  <button
                    onClick={() => handleCopyText(m.id, broadcastText)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                      copiedId === m.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    <span>{copiedId === m.id ? '✓' : '📋'}</span>
                    <span>{copiedId === m.id ? 'Tersalin!' : 'Salin Pesan WA'}</span>
                  </button>

                  {/* Tautan Langsung Video YouTube */}
                  {hasVideo && (
                    <a
                      href={m.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <span>▶️</span> Buka YouTube
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}