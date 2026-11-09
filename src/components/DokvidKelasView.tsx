'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Classroom, Meeting, FreeTrial } from '@/types';

type DokvidItem = {
  id: string;
  sourceType: 'regular' | 'free_trial';
  date: string;
  tutorId: string;
  tutorName: string;
  studentTitle: string;
  classDetail: string;
  meetingBadgeText: string;
  meetingNumberFormatted: string | number;
  lesson: string;
  notes?: string;
  videoUrl?: string;
  isSentToParent: boolean;
};

export default function DokvidKelasView() {
  const {
    currentUser,
    classrooms,
    meetings,
    freeTrials,
    selectedMonth,
    setSelectedMonth,
    toggleSentToParent,
    toggleSentToParentTrial,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  // Filter Tanggal Spesifik (Default: kosong/semua hari di bulan terpilih)
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. Gabungkan sesi Jurnal Reguler + Sesi Free Trial di bulan terpilih
  const monthlyItems = useMemo(() => {
    // A. Sesi Jurnal Reguler (Dengan Baseline Mulai November 2026)
    const regularList: DokvidItem[] = meetings
      .filter((m: Meeting) => {
        const matchMonth = m.date && m.date.startsWith(selectedMonth) && !m.isLocked;
        const matchTutor = isAdmin ? true : m.tutorId === currentUser?.id;
        return matchMonth && matchTutor;
      })
      .map((m: Meeting) => {
        const cls = classrooms.find((c: Classroom) => c.id === m.classroomId);

        // Menghitung riwayat sesi kelas ini sebelum bulan sesi berjalan
        const meetingMonth = m.date ? m.date.substring(0, 7) : selectedMonth;
        let baseCumulativeCount = 0;

        // Logika kumulatif HANYA berjalan jika bulan sesi di atas November 2026 (yaitu mulai 2026-12 ke atas)
        if (meetingMonth > '2026-11') {
          const pastMeetings = meetings.filter(
            (pm: Meeting) =>
              pm.classroomId === m.classroomId &&
              pm.date &&
              pm.date >= '2026-11-01' && // Hanya hitung sesi mulai dari November 2026
              pm.date < `${meetingMonth}-01` &&
              !pm.isLocked &&
              pm.lesson &&
              pm.lesson !== 'Sesi Dikosongkan / Hangus oleh Admin'
          );

          const maxPastMeetingNumber =
            pastMeetings.length > 0
              ? Math.max(...pastMeetings.map((pm: Meeting) => pm.meetingNumber))
              : 0;

          baseCumulativeCount = Math.max(pastMeetings.length, maxPastMeetingNumber);
        }

        const cumulativeMeetingNumber = baseCumulativeCount + m.meetingNumber;

        return {
          id: m.id,
          sourceType: 'regular',
          date: m.date,
          tutorId: m.tutorId,
          tutorName: m.tutorName,
          studentTitle: cls ? cls.students.join(', ') : 'Nama Siswa',
          classDetail: `Kelas: ${cls ? cls.name : '-'} (${cls ? cls.type : '-'})`,
          meetingBadgeText: `PERTEMUAN #${cumulativeMeetingNumber}`,
          meetingNumberFormatted: cumulativeMeetingNumber,
          lesson: m.lesson,
          notes: m.notes,
          videoUrl: m.videoUrl,
          isSentToParent: m.isSentToParent || false,
        };
      });

    // B. Sesi Free Trial
    const trialList: DokvidItem[] = freeTrials
      .filter((ft: FreeTrial) => {
        const matchMonth = ft.date && ft.date.startsWith(selectedMonth);
        const matchTutor = isAdmin ? true : ft.tutorId === currentUser?.id;
        return matchMonth && matchTutor;
      })
      .map((ft: FreeTrial) => ({
        id: ft.id,
        sourceType: 'free_trial',
        date: ft.date,
        tutorId: ft.tutorId,
        tutorName: ft.tutorName,
        studentTitle: ft.studentName,
        classDetail: 'Sesi Uji Coba Calon Siswa Baru (Free Trial)',
        meetingBadgeText: '🎯 Free Trial',
        meetingNumberFormatted: 'Free Trial',
        lesson: ft.lesson,
        notes: ft.notes,
        videoUrl: ft.videoUrl,
        isSentToParent: ft.isSentToParent || false,
      }));

    // Satukan dan urutkan berdasarkan tanggal terbaru
    return [...regularList, ...trialList].sort((a, b) => b.date.localeCompare(a.date));
  }, [meetings, freeTrials, classrooms, selectedMonth, isAdmin, currentUser?.id]);

  // 2. Filter berdasarkan tanggal dan kata kunci pencarian
  const filteredItems = useMemo(() => {
    return monthlyItems.filter((item: DokvidItem) => {
      const matchDate = selectedDate ? item.date === selectedDate : true;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        item.studentTitle.toLowerCase().includes(q) ||
        item.classDetail.toLowerCase().includes(q) ||
        item.tutorName.toLowerCase().includes(q) ||
        item.lesson.toLowerCase().includes(q);

      return matchDate && matchSearch;
    });
  }, [monthlyItems, selectedDate, searchQuery]);

  // Generator Teks Template WhatsApp
  const generateBroadcastText = (item: DokvidItem) => {
    const videoSection = item.videoUrl ? `Link : ${item.videoUrl}\n` : '';
    const noteSection = item.notes ? item.notes : 'Pembelajaran berjalan lancar dan interaktif.';

    if (item.sourceType === 'free_trial') {
      return `👋 Hello! Here's the Free Trial class update for today

Student : ${item.studentTitle} (Free Trial Class)
Date : ${item.date}
Tutor : ${item.tutorName}
Lesson : ${item.lesson}
${videoSection}Note : ${noteSection}`;
    }

    return `👋 Hello! Here's the class for today

Class : ${item.studentTitle} (${item.classDetail.replace('Kelas: ', '')})
Meeting : ${item.meetingNumberFormatted}
Date : ${item.date}
Tutor : ${item.tutorName}
Lesson : ${item.lesson}
${videoSection}Note : ${noteSection}`;
  };

  const handleCopyText = (itemId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(itemId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Handler toggle status pengiriman ke ortu sesuai jenis sesi
  const handleToggleSent = (item: DokvidItem) => {
    if (!isAdmin) return;
    if (item.sourceType === 'free_trial') {
      if (toggleSentToParentTrial) {
        toggleSentToParentTrial(item.id);
      }
    } else {
      toggleSentToParent(item.id);
    }
  };

  const totalWithVideo = filteredItems.filter((item) => item.videoUrl && item.videoUrl.trim() !== '').length;
  const totalSent = filteredItems.filter((item) => item.isSentToParent).length;

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
              ? 'Pusat tinjauan materi, video pembelajaran murid (Reguler & Free Trial), dan salin draf format broadcast WhatsApp ke orang tua.'
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
            <div className="text-2xl font-black text-slate-800 mt-0.5">{filteredItems.length} Sesi</div>
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
              {totalSent} / {filteredItems.length}
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
                ? 'Cari berdasarkan nama murid, kelas, atau tutor...'
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
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          {isAdmin
            ? 'Tidak ada sesi jurnal mengajar atau free trial pada filter tanggal/periode ini.'
            : 'Belum ada sesi kelas atau free trial yang Anda isi pada filter tanggal/periode ini.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item: DokvidItem) => {
            const broadcastText = generateBroadcastText(item);
            const hasVideo = Boolean(item.videoUrl && item.videoUrl.trim() !== '');

            return (
              <div
                key={`${item.sourceType}-${item.id}`}
                className={`bg-white rounded-3xl border transition-all p-5 shadow-sm flex flex-col justify-between space-y-4 ${
                  item.isSentToParent
                    ? 'border-emerald-300 bg-emerald-50/10'
                    : 'border-slate-300 hover:border-amber-400'
                }`}
              >
                {/* Header Kartu */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 text-white font-extrabold text-[10px] uppercase rounded-md tracking-wider ${
                          item.sourceType === 'free_trial' ? 'bg-purple-600' : 'bg-amber-500'
                        }`}
                      >
                        {item.meetingBadgeText}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        🗓️ {item.date}
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
                      {item.studentTitle}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {item.classDetail} • Tutor: <strong>{item.tutorName}</strong>
                    </p>
                  </div>

                  {/* Status Jempol: ADMIN BISA KLIK, TUTOR HANYA VIEW (READ-ONLY) */}
                  {isAdmin ? (
                    <button
                      onClick={() => handleToggleSent(item)}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
                        item.isSentToParent
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Klik untuk mengubah status pengiriman ke ortu"
                    >
                      <span>{item.isSentToParent ? '👍' : '⚪'}</span>
                      <span>{item.isSentToParent ? 'Terkirim ke Ortu' : 'Belum Dikirim'}</span>
                    </button>
                  ) : (
                    <div
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-default ${
                        item.isSentToParent
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <span>{item.isSentToParent ? '👍' : '⚪'}</span>
                      <span>{item.isSentToParent ? 'Terkirim' : 'Belum Dikirim'}</span>
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
                    onClick={() => handleCopyText(item.id, broadcastText)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                      copiedId === item.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    <span>{copiedId === item.id ? '✓' : '📋'}</span>
                    <span>{copiedId === item.id ? 'Tersalin!' : 'Salin Pesan WA'}</span>
                  </button>

                  {/* Tautan Langsung Video YouTube */}
                  {hasVideo && (
                    <a
                      href={item.videoUrl}
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