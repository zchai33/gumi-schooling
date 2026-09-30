'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { User } from '@/types';

export default function UserManager() {
  const { currentUser, users, addUser, updateUser, deleteUser } = useApp();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'tutor'>('all');

  // State untuk toggle visibilitas password per baris (berdasarkan User ID)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Modal Tambah Akun
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    username: '',
    name: '',
    role: 'tutor' as 'admin' | 'tutor',
    password: '',
    phone: '',
    address: '',
    institution: '',
  });

  // Modal Edit Akun
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    name: '',
    role: 'tutor' as 'admin' | 'tutor',
    password: '',
    phone: '',
    address: '',
    institution: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Proteksi Hak Akses Admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-medium">
        ⚠ Akses Ditolak: Halaman Kelola Akun hanya dapat diakses oleh Admin.
      </div>
    );
  }

  // Toggle mata intip password
  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Filter daftar pengguna
  const filteredUsers = users.filter((u: User) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch =
      searchTerm.trim() === '' ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.institution && u.institution.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchRole && matchSearch;
  });

  const handleOpenAddModal = () => {
    setAddForm({
      username: '',
      name: '',
      role: 'tutor',
      password: '',
      phone: '',
      address: '',
      institution: '',
    });
    setShowAddModal(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.username.trim() || !addForm.password.trim() || !addForm.name.trim()) {
      alert('Nama, Username, dan Password wajib diisi!');
      return;
    }

    const existing = users.find(
      (u: User) => u.username.toLowerCase() === addForm.username.toLowerCase().trim()
    );
    if (existing) {
      alert('Username tersebut sudah digunakan oleh akun lain! Gunakan username unik.');
      return;
    }

    await addUser({
      username: addForm.username.trim(),
      name: addForm.name.trim(),
      role: addForm.role,
      password: addForm.password.trim(),
      phone: addForm.phone.trim(),
      address: addForm.address.trim(),
      institution: addForm.institution.trim(),
      status: 'active',
    });

    setShowAddModal(false);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setEditForm({
      username: u.username,
      name: u.name,
      role: u.role,
      password: u.password || '',
      phone: u.phone || '',
      address: u.address || '',
      institution: u.institution || '',
      status: u.status || 'active',
    });
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editForm.username.trim() || !editForm.password.trim() || !editForm.name.trim()) {
      alert('Nama, Username, dan Password tidak boleh dikosongkan!');
      return;
    }

    const duplicate = users.find(
      (u: User) => u.id !== editingUser.id && u.username.toLowerCase() === editForm.username.toLowerCase().trim()
    );
    if (duplicate) {
      alert('Username tersebut sudah digunakan oleh akun lain!');
      return;
    }

    await updateUser(editingUser.id, {
      username: editForm.username.trim(),
      name: editForm.name.trim(),
      role: editForm.role,
      password: editForm.password.trim(),
      phone: editForm.phone.trim(),
      address: editForm.address.trim(),
      institution: editForm.institution.trim(),
      status: editForm.status,
    });

    alert('Data akun dan password berhasil diperbarui!');
    setEditingUser(null);
  };

  const handleDeleteUser = async (u: User) => {
    if (u.id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan saat ini!');
      return;
    }
    if (confirm(`Yakin ingin menghapus akun ${u.name} (@${u.username}) secara permanen?`)) {
      await deleteUser(u.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kelola Akun Pengguna</h2>
          <p className="text-xs text-slate-500 mt-1">
            Atur kredensial akun Tutor &amp; Admin. Anda dapat mengubah password dan username Admin di sini untuk keamanan.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-200 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <span>👤</span> + Tambah Akun Baru
        </button>
      </div>

      {/* Filter & Pencarian */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              roleFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              roleFilter === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Admin ({users.filter((u: User) => u.role === 'admin').length})
          </button>
          <button
            onClick={() => setRoleFilter('tutor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              roleFilter === 'tutor' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tutor ({users.filter((u: User) => u.role === 'tutor').length})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Cari nama, username, kampus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
        </div>
      </div>

      {/* Tabel Akun */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Nama &amp; Username</th>
                <th className="py-3.5 px-4">Role Akses</th>
                <th className="py-3.5 px-4">Password Terdaftar</th>
                <th className="py-3.5 px-4">Kontak / HP</th>
                <th className="py-3.5 px-4">Kampus / Asal</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u: User) => {
                const isPasswordShown = !!visiblePasswords[u.id];

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {u.name}
                        {u.id === currentUser.id && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                            Anda
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-xs">@{u.username}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.role === 'admin' ? '🛡️ Admin' : '🎓 Tutor'}
                      </span>
                    </td>

                    {/* KOLOM PASSWORD DENGAN ICON TOGGLE MATA */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        <span className="font-mono text-slate-700 text-xs tracking-wider select-all">
                          {isPasswordShown ? u.password || '-' : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
                          title={isPasswordShown ? 'Sembunyikan Password' : 'Lihat Password'}
                        >
                          {isPasswordShown ? (
                            // Icon Mata Tertutup
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          ) : (
                            // Icon Mata Terbuka
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {u.phone || '-'}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {u.institution || u.address || '-'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                          title="Edit Profil & Password"
                        >
                          ✏️ Edit / Password
                        </button>
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Hapus Akun"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: TAMBAH AKUN BARU */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">Buat Akun Pengguna Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Misal: Made Rai"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Username Login</label>
                  <input
                    type="text"
                    placeholder="maderai"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Role / Hak Akses</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value as 'admin' | 'tutor' })}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="tutor">Tutor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                <input
                  type="text"
                  placeholder="Ketik password..."
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="0812..."
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kampus / Institusi</label>
                  <input
                    type="text"
                    placeholder="Universitas Udayana"
                    value={addForm.institution}
                    onChange={(e) => setAddForm({ ...addForm, institution: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Alamat Domisili</label>
                <input
                  type="text"
                  placeholder="Denpasar, Bali"
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
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
                  Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT AKUN & GANTI PASSWORD (TERMASUK ADMIN) */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Update Kredensial &amp; Profil
                </span>
                <h3 className="font-bold text-slate-800 text-base">{editingUser.name}</h3>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Tampilan</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Username Login</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono font-semibold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Role Akun</label>
                  <select
                    disabled={editingUser.id === currentUser.id}
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'tutor' })}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="admin">Admin</option>
                    <option value="tutor">Tutor</option>
                  </select>
                </div>
              </div>

              {/* FIELD PASSWORD BARU */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl">
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  🔑 Password Login Akun
                </label>
                <input
                  type="text"
                  placeholder="Ketik password baru..."
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-amber-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold bg-white text-slate-800"
                  required
                />
                <p className="text-[10px] text-amber-700 mt-1">
                  Ganti password ini dan simpan agar aman dari akses tidak berizin.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kampus / Asal</label>
                  <input
                    type="text"
                    value={editForm.institution}
                    onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Alamat</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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