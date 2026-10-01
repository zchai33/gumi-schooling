'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Classroom, ClassType, LDRZone } from '@/types';

export default function ClassroomManager() {
  const { currentUser, classrooms, addClassroom, updateClassroom, deleteClassroom } = useApp();

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold">
        ⚠️ Akses Terbatas: Manajemen Kelas &amp; Siswa hanya dapat dikelola oleh Admin.
      </div>
    );
  }

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Modal / Form Tambah Kelas
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<ClassType>('Kids-A');
  const [studentsInput, setStudentsInput] = useState('');
  const [totalMeetings, setTotalMeetings] = useState(12);
  const [ldrZone, setLdrZone] = useState<LDRZone>('none');

  // Modal / Form Edit Kelas
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<ClassType>('Kids-A');
  const [editStudentsInput, setEditStudentsInput] = useState('');
  const [editTotalMeetings, setEditTotalMeetings] = useState(12);
  const [editLdrZone, setEditLdrZone] = useState<LDRZone>('none');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const studentsArray = studentsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (studentsArray.length === 0) {
      alert('Harap masukkan minimal 1 nama murid!');
      return;
    }

    addClassroom({
      name,
      type,
      students: studentsArray,
      totalMeetings,
      ldrZone,
      status: 'active',
    });

    // Reset Form
    setName('');
    setStudentsInput('');
    setTotalMeetings(12);
    setLdrZone('none');
    setShowAddModal(false);
  };

  const handleOpenEdit = (cls: Classroom) => {
    setEditingClass(cls);
    setEditName(cls.name);
    setEditType(cls.type);
    setEditStudentsInput(cls.students.join(', '));
    setEditTotalMeetings(cls.totalMeetings);
    setEditLdrZone(cls.ldrZone);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    const studentsArray = editStudentsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (studentsArray.length === 0) {
      alert('Harap masukkan minimal 1 nama murid!');
      return;
    }

    updateClassroom(editingClass.id, {
      name: editName,
      type: editType,
      students: studentsArray,
      totalMeetings: editTotalMeetings,
      ldrZone: editLdrZone,
    });

    setEditingClass(null);
  };

  const classTypeOptions: { value: ClassType; label: string }[] = [
    { value: 'Kids-A', label: 'Kids-A' },
    { value: 'Kids-B', label: 'Kids-B' },
    { value: 'SPL-A', label: 'SPL-A' },
    { value: 'SPL-B', label: 'SPL-B' },
    { value: 'Group', label: 'Group' },
    { value: 'Test Prep-A', label: 'Test Prep-A' },
    { value: 'Test Prep-B', label: 'Test Prep-B' },
    { value: 'Social Banjar/Panti', label: 'Social Banjar/Panti' },
    { value: 'Free Trial', label: 'Free Trial' },
  ];

  // Filter Kelas Berdasarkan Search & Tipe
  const filteredClassrooms = classrooms.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.students.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedTypeFilter === 'all' || cls.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header & Aksi */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Kelas &amp; Siswa</h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftar kelompok belajar aktif, kuota paket sesi, dan zona jarak LDR.
          </p>
        </div>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-200 transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <span>+</span> Tambah Kelas Baru
          </button>
        )}
      </div>

      {/* Kontrol Pencarian & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari nama kelas atau murid..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-medium shrink-0">Filter Tipe:</span>
          <button
            onClick={() => setSelectedTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedTypeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          {classTypeOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedTypeFilter(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTypeFilter === t.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Kartu Kelas */}
      {filteredClassrooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          Tidak ada kelas yang sesuai dengan filter atau pencarian Anda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClassrooms.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {cls.type}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base mt-1.5 leading-snug">{cls.name}</h3>
                  </div>
                  {currentUser?.role === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(cls)}
                        className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                        title="Edit Kelas"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus kelas "${cls.name}"?`)) deleteClassroom(cls.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors text-sm"
                        title="Hapus Kelas"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>

                {cls.ldrZone !== 'none' && (
                  <div className="mt-2.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                      <span>📍</span> {cls.ldrZone.replace('_', ' >').toUpperCase()} KM
                    </span>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Murid ({cls.students.length} anak):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.students.map((st, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-semibold"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Kuota Paket:</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {cls.totalMeetings} Pertemuan
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Buat Kelas Baru (Admin) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Buat Kelas Belajar Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Kelompok / Kelas</label>
                <input
                  type="text"
                  placeholder="Misal: Kids A - Morning Group"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tipe / Kategori Kelas</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ClassType)}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {classTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Total Pertemuan Paket</label>
                  <select
                    value={totalMeetings}
                    onChange={(e) => setTotalMeetings(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={4}>4 Pertemuan</option>
                    <option value={6}>6 Pertemuan</option>
                    <option value={8}>8 Pertemuan</option>
                    <option value={10}>10 Pertemuan</option>
                    <option value={12}>12 Pertemuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Daftar Nama Murid (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="Selina, Wayan Sinta, Budi (1 s/d 10 anak)"
                  value={studentsInput}
                  onChange={(e) => setStudentsInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Tutor yang mengajar tidak dikunci di sini, melainkan fleksibel dicatat saat sesi jurnal diisi.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Zona Bonus Jarak (LDR)</label>
                <select
                  value={ldrZone}
                  onChange={(e) => setLdrZone(e.target.value as LDRZone)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="none">Tidak Ada Jarak Ekstra (None)</option>
                  <option value="ldr_10">LDR &gt; 10 KM (+Rp 10.000/sesi)</option>
                  <option value="ldr_15">LDR &gt; 15 KM (+Rp 15.000/sesi)</option>
                  <option value="ldr_20">LDR &gt; 20 KM (+Rp 20.000/sesi)</option>
                  <option value="panti_klungkung">Panti Klungkung (+Rp 50.000/sesi)</option>
                </select>
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
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Kelas (Admin) */}
      {editingClass && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Edit Data Kelas</h3>
              <button
                onClick={() => setEditingClass(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Kelompok / Kelas</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tipe / Kategori Kelas</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as ClassType)}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {classTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Total Pertemuan Paket</label>
                  <select
                    value={editTotalMeetings}
                    onChange={(e) => setEditTotalMeetings(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={4}>4 Pertemuan</option>
                    <option value={6}>6 Pertemuan</option>
                    <option value={8}>8 Pertemuan</option>
                    <option value={10}>10 Pertemuan</option>
                    <option value={12}>12 Pertemuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Daftar Nama Murid (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={editStudentsInput}
                  onChange={(e) => setEditStudentsInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Zona Bonus Jarak (LDR)</label>
                <select
                  value={editLdrZone}
                  onChange={(e) => setEditLdrZone(e.target.value as LDRZone)}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="none">Tidak Ada Jarak Ekstra (None)</option>
                  <option value="ldr_10">LDR &gt; 10 KM (+Rp 10.000/sesi)</option>
                  <option value="ldr_15">LDR &gt; 15 KM (+Rp 15.000/sesi)</option>
                  <option value="ldr_20">LDR &gt; 20 KM (+Rp 20.000/sesi)</option>
                  <option value="panti_klungkung">Panti Klungkung (+Rp 50.000/sesi)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Perbarui Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}