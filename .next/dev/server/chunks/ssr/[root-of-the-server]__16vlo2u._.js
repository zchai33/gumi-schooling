module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[project]/src/context/AppContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProvider",
    ()=>AppProvider,
    "useApp",
    ()=>useApp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
const defaultRates = {
    baseFees: {
        'Kids-A': 35000,
        'Kids-B': 30000,
        'SPL-A': 36000,
        'SPL-B': 32000,
        'Group': 35000,
        'Test Prep-A': 55000,
        'Test Prep-B': 40000,
        'Social Banjar/Panti': 50000,
        'Free Trial': 25000
    },
    ldrBonus: {
        ldr_10: 10000,
        ldr_15: 15000,
        ldr_20: 20000,
        panti_klungkung: 50000
    },
    standardBonus: {
        videoPerItem: 10000,
        reportPerStudent: 25000,
        fnmPerClosing: 50000
    },
    standardDeductions: {
        sukaDuka: 10000,
        lateAttendance: 20000,
        violationOJL_GC: 25000,
        lateVideo: 10000,
        suddenLeave: 50000
    }
};
const defaultUsers = [
    {
        id: 'usr-admin',
        username: 'admin',
        name: 'Admin Gumi',
        role: 'admin',
        password: 'admin',
        phone: '081234567890',
        address: 'Denpasar, Bali',
        status: 'active'
    },
    {
        id: 'usr-dewi',
        username: 'dewi',
        name: 'Dewi Ayu',
        role: 'tutor',
        password: 'tutor',
        phone: '081987654321',
        address: 'Gianyar, Bali',
        institution: 'Universitas Udayana',
        status: 'active'
    },
    {
        id: 'usr-putu',
        username: 'putu',
        name: 'Putu Agus',
        role: 'tutor',
        password: 'tutor',
        phone: '082112345678',
        address: 'Badung, Bali',
        institution: 'Undiksha',
        status: 'active'
    },
    {
        id: 'usr-kadek',
        username: 'kadek',
        name: 'Kadek Sarah',
        role: 'tutor',
        password: 'tutor',
        phone: '085712345678',
        address: 'Klungkung, Bali',
        institution: 'Universitas Warmadewa',
        status: 'active'
    }
];
const AppContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const AppProvider = ({ children })=>{
    const [users, setUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultUsers);
    const [currentUser, setCurrentUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultUsers[0]);
    const [activityLogs, setActivityLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('dashboard');
    // Default periode bulan berjalan saat ini (YYYY-MM)
    const currentYearMonth = new Date().toISOString().substring(0, 7);
    const [selectedMonth, setSelectedMonth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(currentYearMonth);
    const [rates, setRates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultRates);
    const [classrooms, setClassrooms] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: 'cls-1',
            name: 'Kids A - Morning Group',
            type: 'Kids-A',
            students: [
                'Ayu Widya',
                'Budi Santoso',
                'Ketut Radit'
            ],
            totalMeetings: 12,
            ldrZone: 'ldr_10',
            status: 'active'
        },
        {
            id: 'cls-2',
            name: 'SPL A - Advanced',
            type: 'SPL-A',
            students: [
                'Nyoman Gede',
                'Wayan Sinta'
            ],
            totalMeetings: 10,
            ldrZone: 'ldr_15',
            status: 'active'
        }
    ]);
    const [meetings, setMeetings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: 'mtg-1',
            classroomId: 'cls-1',
            meetingNumber: 1,
            tutorId: 'usr-dewi',
            tutorName: 'Dewi Ayu',
            date: '2026-09-01',
            lesson: 'Introduction to Letters',
            isLocked: false,
            ldrZoneSnapshot: 'ldr_10',
            hasVideoClaim: true
        },
        {
            id: 'mtg-2',
            classroomId: 'cls-1',
            meetingNumber: 2,
            tutorId: 'usr-dewi',
            tutorName: 'Dewi Ayu',
            date: '2026-09-08',
            lesson: 'Basic Phonics',
            isLocked: false,
            ldrZoneSnapshot: 'ldr_10',
            hasVideoClaim: false
        }
    ]);
    const [freeTrials, setFreeTrials] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: 'ft-1',
            studentName: 'Made Junior',
            tutorId: 'usr-dewi',
            tutorName: 'Dewi Ayu',
            date: '2026-09-12',
            lesson: 'Phonics & Ice Breaking',
            status: 'completed'
        }
    ]);
    const [adjustments, setAdjustments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: 'adj-1',
            tutorId: 'usr-dewi',
            month: '2026-09',
            videoCount: 1,
            reportCount: 3,
            fnmCount: 0,
            customBonusNominal: 0,
            customBonusNote: '',
            applySukaDuka: true,
            lateAttendanceCount: 0,
            violationCount: 0,
            lateVideoCount: 0,
            suddenLeaveCount: 0,
            customDeductionNominal: 0,
            customDeductionNote: ''
        }
    ]);
    const logActivity = (action, details)=>{
        if (!currentUser) return;
        const newLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            userId: currentUser.id,
            userName: currentUser.name,
            role: currentUser.role,
            action,
            details,
            timestamp: new Date().toLocaleString('id-ID')
        };
        setActivityLogs((prev)=>[
                newLog,
                ...prev
            ]);
    };
    const login = (username, password)=>{
        const foundUser = users.find((u)=>u.username === username && u.password === password);
        if (foundUser) {
            setCurrentUser(foundUser);
            const logEntry = {
                id: `log-${Date.now()}`,
                userId: foundUser.id,
                userName: foundUser.name,
                role: foundUser.role,
                action: 'LOGIN',
                details: `Berhasil masuk ke dalam sistem sebagai ${foundUser.role}`,
                timestamp: new Date().toLocaleString('id-ID')
            };
            setActivityLogs((prev)=>[
                    logEntry,
                    ...prev
                ]);
            return true;
        }
        return false;
    };
    const logout = ()=>{
        if (currentUser) {
            logActivity('LOGOUT', 'Keluar dari sistem aplikasi');
        }
        setCurrentUser(null);
    };
    const addUser = (userData)=>{
        const newUser = {
            ...userData,
            id: `usr-${Date.now()}`,
            status: 'active'
        };
        setUsers((prev)=>[
                ...prev,
                newUser
            ]);
        logActivity('UPDATE_PAYROLL', `Menambahkan akun baru: ${newUser.name} (${newUser.role})`);
    };
    const updateUser = (id, updatedData)=>{
        setUsers((prev)=>prev.map((u)=>u.id === id ? {
                    ...u,
                    ...updatedData
                } : u));
        logActivity('UPDATE_PAYROLL', `Memperbarui data profil akun: ID ${id}`);
    };
    const deleteUser = (id)=>{
        if (currentUser?.id === id) {
            alert('Tidak dapat menghapus akun yang sedang aktif digunakan saat ini!');
            return false;
        }
        const target = users.find((u)=>u.id === id);
        setUsers((prev)=>prev.filter((u)=>u.id !== id));
        logActivity('UPDATE_PAYROLL', `Menghapus akun pengguna: ${target?.name || id}`);
        return true;
    };
    const updateRates = (newRates)=>{
        setRates(newRates);
        logActivity('UPDATE_RATES', 'Admin memperbarui konfigurasi ketentuan gaji');
    };
    const resetRatesToDefault = ()=>{
        setRates(defaultRates);
        logActivity('UPDATE_RATES', 'Admin mengembalikan ketentuan gaji ke nilai default SOP');
    };
    const addClassroom = (classroomData)=>{
        const newClassroom = {
            ...classroomData,
            id: `cls-${Date.now()}`
        };
        setClassrooms((prev)=>[
                ...prev,
                newClassroom
            ]);
    };
    const deleteClassroom = (id)=>{
        setClassrooms((prev)=>prev.filter((c)=>c.id !== id));
    };
    const addMeeting = (meetingData)=>{
        if (!currentUser) return;
        const targetClass = classrooms.find((c)=>c.id === meetingData.classroomId);
        const existingIndex = meetings.findIndex((m)=>m.classroomId === meetingData.classroomId && m.meetingNumber === meetingData.meetingNumber);
        const newMeeting = {
            id: existingIndex >= 0 ? meetings[existingIndex].id : `mtg-${Date.now()}`,
            classroomId: meetingData.classroomId,
            meetingNumber: meetingData.meetingNumber,
            tutorId: currentUser.id,
            tutorName: currentUser.name,
            date: meetingData.date,
            lesson: meetingData.lesson,
            notes: meetingData.notes,
            isLocked: false,
            ldrZoneSnapshot: targetClass ? targetClass.ldrZone : 'none',
            hasVideoClaim: meetingData.hasVideoClaim || false
        };
        if (existingIndex >= 0) {
            setMeetings((prev)=>{
                const copy = [
                    ...prev
                ];
                copy[existingIndex] = newMeeting;
                return copy;
            });
        } else {
            setMeetings((prev)=>[
                    ...prev,
                    newMeeting
                ]);
        }
        if (meetingData.hasVideoClaim) {
            const meetingMonth = meetingData.date.substring(0, 7);
            setAdjustments((prev)=>{
                const idx = prev.findIndex((a)=>a.tutorId === currentUser.id && a.month === meetingMonth);
                if (idx >= 0) {
                    const updated = [
                        ...prev
                    ];
                    updated[idx] = {
                        ...updated[idx],
                        videoCount: (updated[idx].videoCount || 0) + 1
                    };
                    return updated;
                } else {
                    return [
                        ...prev,
                        {
                            id: `adj-${currentUser.id}-${meetingMonth}`,
                            tutorId: currentUser.id,
                            month: meetingMonth,
                            videoCount: 1,
                            reportCount: 0,
                            fnmCount: 0,
                            customBonusNominal: 0,
                            customBonusNote: '',
                            applySukaDuka: true,
                            lateAttendanceCount: 0,
                            violationCount: 0,
                            lateVideoCount: 0,
                            suddenLeaveCount: 0,
                            customDeductionNominal: 0,
                            customDeductionNote: ''
                        }
                    ];
                }
            });
        }
        logActivity('CREATE_MEETING', `Mengisi jurnal pertemuan #${meetingData.meetingNumber} di kelas ${targetClass?.name || ''}${meetingData.hasVideoClaim ? ' (Klaim Video Siswa)' : ''}`);
    };
    const updateMeeting = (meetingId, updatedData)=>{
        setMeetings((prev)=>prev.map((m)=>{
                if (m.id === meetingId) {
                    return {
                        ...m,
                        ...updatedData
                    };
                }
                return m;
            }));
        logActivity('UPDATE_PAYROLL', `Admin mengoreksi data sesi jurnal (ID: ${meetingId})`);
    };
    const clearMeetingSlot = (classroomId, meetingNumber)=>{
        const target = meetings.find((m)=>m.classroomId === classroomId && m.meetingNumber === meetingNumber);
        if (!target) return;
        setMeetings((prev)=>prev.filter((m)=>!(m.classroomId === classroomId && m.meetingNumber === meetingNumber)));
        logActivity('UPDATE_PAYROLL', `Admin mengosongkan / mereset slot jurnal pertemuan #${meetingNumber} kelas ID: ${classroomId}`);
    };
    const toggleLockMeeting = (meetingId)=>{
        setMeetings((prev)=>prev.map((m)=>m.id === meetingId ? {
                    ...m,
                    isLocked: !m.isLocked
                } : m));
    };
    const lockEmptySlot = (classroomId, meetingNumber)=>{
        if (currentUser?.role !== 'admin') return;
        const existing = meetings.find((m)=>m.classroomId === classroomId && m.meetingNumber === meetingNumber);
        if (existing) {
            toggleLockMeeting(existing.id);
        } else {
            const targetClass = classrooms.find((c)=>c.id === classroomId);
            const lockedPlaceholder = {
                id: `mtg-locked-${Date.now()}`,
                classroomId,
                meetingNumber,
                tutorId: '-',
                tutorName: 'Admin (Audit Lock)',
                date: new Date().toISOString().split('T')[0],
                lesson: 'Sesi Dikosongkan / Hangus oleh Admin',
                isLocked: true,
                ldrZoneSnapshot: targetClass ? targetClass.ldrZone : 'none',
                hasVideoClaim: false
            };
            setMeetings((prev)=>[
                    ...prev,
                    lockedPlaceholder
                ]);
            logActivity('CREATE_MEETING', `Admin mengunci slot pertemuan #${meetingNumber} (Hangus) di kelas ${targetClass?.name || ''}`);
        }
    };
    // Free Trials
    const addFreeTrial = (trialData)=>{
        if (!currentUser) return;
        const newTrial = {
            id: `ft-${Date.now()}`,
            studentName: trialData.studentName,
            tutorId: currentUser.id,
            tutorName: currentUser.name,
            date: trialData.date,
            lesson: trialData.lesson,
            status: 'completed'
        };
        setFreeTrials((prev)=>[
                ...prev,
                newTrial
            ]);
        logActivity('CREATE_MEETING', `Mencatat sesi Free Trial untuk siswa: ${trialData.studentName}`);
    };
    const updateFreeTrial = (trialId, updatedData)=>{
        setFreeTrials((prev)=>prev.map((ft)=>ft.id === trialId ? {
                    ...ft,
                    ...updatedData
                } : ft));
        logActivity('UPDATE_PAYROLL', `Memperbarui data Free Trial ID: ${trialId}`);
    };
    const deleteFreeTrial = (trialId)=>{
        setFreeTrials((prev)=>prev.filter((ft)=>ft.id !== trialId));
        logActivity('UPDATE_PAYROLL', `Menghapus sesi Free Trial ID: ${trialId}`);
    };
    const toggleFreeTrialStatus = (trialId)=>{
        setFreeTrials((prev)=>prev.map((ft)=>ft.id === trialId ? {
                    ...ft,
                    status: ft.status === 'completed' ? 'pending' : 'completed'
                } : ft));
    };
    const getAdjustmentForTutor = (tutorId, month)=>{
        const existing = adjustments.find((a)=>a.tutorId === tutorId && a.month === month);
        if (existing) return existing;
        return {
            id: `adj-${tutorId}-${month}`,
            tutorId,
            month,
            videoCount: 0,
            reportCount: 0,
            fnmCount: 0,
            customBonusNominal: 0,
            customBonusNote: '',
            applySukaDuka: true,
            lateAttendanceCount: 0,
            violationCount: 0,
            lateVideoCount: 0,
            suddenLeaveCount: 0,
            customDeductionNominal: 0,
            customDeductionNote: ''
        };
    };
    const saveAdjustment = (adj)=>{
        setAdjustments((prev)=>{
            const idx = prev.findIndex((a)=>a.tutorId === adj.tutorId && a.month === adj.month);
            if (idx >= 0) {
                const copy = [
                    ...prev
                ];
                copy[idx] = adj;
                return copy;
            }
            return [
                ...prev,
                adj
            ];
        });
        logActivity('UPDATE_PAYROLL', `Memperbarui rincian bonus & potongan untuk periode ${adj.month}`);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AppContext.Provider, {
        value: {
            currentUser,
            users,
            activityLogs,
            login,
            logout,
            addUser,
            updateUser,
            deleteUser,
            activeTab,
            setActiveTab,
            selectedMonth,
            setSelectedMonth,
            rates,
            updateRates,
            resetRatesToDefault,
            classrooms,
            addClassroom,
            deleteClassroom,
            meetings,
            addMeeting,
            updateMeeting,
            clearMeetingSlot,
            toggleLockMeeting,
            lockEmptySlot,
            freeTrials,
            addFreeTrial,
            updateFreeTrial,
            deleteFreeTrial,
            toggleFreeTrialStatus,
            adjustments,
            getAdjustmentForTutor,
            saveAdjustment
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/AppContext.tsx",
        lineNumber: 582,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const useApp = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__16vlo2u._.js.map