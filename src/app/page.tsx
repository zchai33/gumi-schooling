'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DashboardView } from '@/components/DashboardView';
import RateConfigPanel from '@/components/RateConfigPanel';
import ClassroomManager from '@/components/ClassroomManager';
import MeetingJournal from '@/components/MeetingJournal';
import FreeTrialLog from '@/components/FreeTrialLog';
import PayrollTable from '@/components/PayrollTable';
import PayslipView from '@/components/PayslipView';
import UserManager from '@/components/UserManager';
import BackupManager from '@/components/BackupManager';

export default function HomePage() {
  const { currentUser, isAuthReady, isDataReady, login, logout, activeTab, setActiveTab } = useApp();

  // State Login Form
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('admin');
  const [loginError, setLoginError] = useState('');

  // State Mobile Menu Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = login(usernameInput, passwordInput);
    if (!success) {
      setLoginError('Username atau password salah! Coba admin / admin atau dewi / tutor');
    }
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // 1. TAHAN RENDER JIKA SESI ATAU DATA AWAL MASIH DIMUAT
  if (!isAuthReady || (currentUser && !isDataReady)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">
            {!isAuthReady ? 'Memeriksa sesi...' : 'Memuat data Gumi Schooling...'}
          </p>
        </div>
      </div>
    );
  }

  // 2. JIKA BELUM LOGIN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8 space-y-6">
          <div className="text-center">
            <div className="h-16 w-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto shadow-lg shadow-blue-200">
              GS
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mt-4">Gumi Schooling</h2>
            <p className="text-sm text-slate-500">Sistem Jurnal Mengajar &amp; Rekap Payroll</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-medium">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Username</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Masukkan username"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-blue-200"
            >
              Masuk ke Aplikasi
            </button>
          </form>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Akun Pengujian Demo:</p>
            <p>
              <strong>Admin:</strong> username: <code className="text-blue-600">admin</code> | pass: <code className="text-blue-600">admin</code>
            </p>
            <p>
              <strong>Tutor:</strong> username: <code className="text-blue-600">dewi</code> | pass: <code className="text-blue-600">tutor</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. DAFTAR MENU
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', adminOnly: false },
    { id: 'rates', label: 'Ketentuan Gaji', icon: '⚙️', adminOnly: true },
    { id: 'users', label: 'Kelola Akun', icon: '👥', adminOnly: true },
    { id: 'classrooms', label: 'Kelas / Siswa', icon: '🏫', adminOnly: true },
    { id: 'meetings', label: 'Isi Jurnal', icon: '📖', adminOnly: false },
    { id: 'free-trials', label: 'Free Trials', icon: '🎯', adminOnly: false },
    { id: 'payroll', label: 'Rekap Payroll', icon: '💼', adminOnly: true },
    { id: 'payslip', label: 'Slip Gaji', icon: '📄', adminOnly: false },
    { id: 'backup', label: 'Cadangan Data', icon: '📦', adminOnly: true },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* BACKDROP MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 p-5 z-50 transition-transform duration-200 ease-in-out print:hidden ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                GS
              </div>
              <div>
                <h2 className="font-bold text-slate-800 leading-tight">Gumi Schooling</h2>
                <p className="text-[11px] text-slate-400">Journal &amp; Payroll</p>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
            {menuItems.map((item) => {
              if (item.adminOnly && currentUser.role !== 'admin') return null;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">{currentUser.name}</p>
              <span
                className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  currentUser.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {currentUser.role}
              </span>
            </div>
            <button
              onClick={logout}
              title="Keluar dari sistem"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              title="Buka Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-bold text-slate-800 text-base md:text-lg">
              {menuItems.find((m) => m.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3 text-xs">
            <span className="hidden sm:inline text-slate-400">Status Akses:</span>
            <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 md:px-3 py-1 rounded-full text-[11px] md:text-xs">
              Mode {currentUser.role === 'admin' ? '🛡️ Admin' : '✏️ Tutor'}
            </span>
          </div>
        </header>

        <main className="p-4 md:p-8 flex-1 overflow-y-auto print:p-0 print:overflow-visible">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'rates' && <RateConfigPanel />}
          {activeTab === 'users' && <UserManager />}
          {activeTab === 'classrooms' && <ClassroomManager />}
          {activeTab === 'meetings' && <MeetingJournal />}
          {activeTab === 'free-trials' && <FreeTrialLog />}
          {activeTab === 'payroll' && <PayrollTable />}
          {activeTab === 'payslip' && <PayslipView />}
          {activeTab === 'backup' && <BackupManager />}
        </main>
      </div>
    </div>
  );
}