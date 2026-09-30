(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/context/AppContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProvider",
    ()=>AppProvider,
    "useApp",
    ()=>useApp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
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
    }
];
const AppContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const AppProvider = ({ children })=>{
    _s();
    const [users, setUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultUsers);
    const [currentUser, setCurrentUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activityLogs, setActivityLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('dashboard');
    const currentYearMonth = new Date().toISOString().substring(0, 7);
    const [selectedMonth, setSelectedMonth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(currentYearMonth);
    const [rates, setRates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultRates);
    const [classrooms, setClassrooms] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [meetings, setMeetings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [freeTrials, setFreeTrials] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [adjustments, setAdjustments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // 1. FETCH DATA AWAL DARI SUPABASE
    const fetchAllData = async ()=>{
        try {
            // Ambil Users
            const { data: usersData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').select('*');
            if (usersData && usersData.length > 0) {
                setUsers(usersData);
            }
            // Ambil Rate Config
            const { data: ratesData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('rate_configs').select('*').eq('id', 'default_rates').single();
            if (ratesData) {
                setRates({
                    baseFees: ratesData.base_fees,
                    ldrBonus: ratesData.ldr_bonus,
                    standardBonus: ratesData.standard_bonus,
                    standardDeductions: ratesData.standard_deductions
                });
            }
            // Ambil Classrooms
            const { data: classData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('classrooms').select('*');
            if (classData) {
                setClassrooms(classData.map((c)=>({
                        id: c.id,
                        name: c.name,
                        type: c.type,
                        students: c.students,
                        totalMeetings: c.total_meetings,
                        ldrZone: c.ldr_zone,
                        status: c.status
                    })));
            }
            // Ambil Meetings
            const { data: meetingData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('meetings').select('*');
            if (meetingData) {
                setMeetings(meetingData.map((m)=>({
                        id: m.id,
                        classroomId: m.classroom_id,
                        meetingNumber: m.meeting_number,
                        tutorId: m.tutor_id,
                        tutorName: m.tutor_name,
                        date: m.date,
                        lesson: m.lesson,
                        notes: m.notes,
                        isLocked: m.is_locked,
                        ldrZoneSnapshot: m.ldr_zone_snapshot,
                        hasVideoClaim: m.has_video_claim
                    })));
            }
            // Ambil Free Trials
            const { data: trialsData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('free_trials').select('*');
            if (trialsData) {
                setFreeTrials(trialsData.map((ft)=>({
                        id: ft.id,
                        studentName: ft.student_name,
                        tutorId: ft.tutor_id,
                        tutorName: ft.tutor_name,
                        date: ft.date,
                        lesson: ft.lesson,
                        status: ft.status
                    })));
            }
            // Ambil Monthly Adjustments
            const { data: adjData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('monthly_adjustments').select('*');
            if (adjData) {
                setAdjustments(adjData.map((a)=>({
                        id: a.id,
                        tutorId: a.tutor_id,
                        month: a.month,
                        videoCount: a.video_count || 0,
                        reportCount: a.report_count || 0,
                        fnmCount: a.fnm_count || 0,
                        customBonusNominal: Number(a.custom_bonus_nominal || 0),
                        customBonusNote: a.custom_bonus_note || '',
                        applySukaDuka: a.apply_suka_duka ?? true,
                        lateAttendanceCount: a.late_attendance_count || 0,
                        violationCount: a.violation_count || 0,
                        lateVideoCount: a.late_video_count || 0,
                        suddenLeaveCount: a.sudden_leave_count || 0,
                        customDeductionNominal: Number(a.custom_deduction_nominal || 0),
                        customDeductionNote: a.custom_deduction_note || ''
                    })));
            }
            // Ambil Activity Logs
            const { data: logsData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('activity_logs').select('*').order('created_at', {
                ascending: false
            }).limit(20);
            if (logsData) {
                setActivityLogs(logsData.map((l)=>({
                        id: l.id,
                        userId: l.user_id,
                        userName: l.user_name,
                        role: l.role,
                        action: l.action,
                        details: l.details,
                        timestamp: l.timestamp
                    })));
            }
        } catch (err) {
            console.error('Gagal mengambil data dari Supabase:', err);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            fetchAllData();
        }
    }["AppProvider.useEffect"], []);
    const logActivity = async (action, details)=>{
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
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('activity_logs').insert([
            {
                id: newLog.id,
                user_id: newLog.userId,
                user_name: newLog.userName,
                role: newLog.role,
                action: newLog.action,
                details: newLog.details,
                timestamp: newLog.timestamp
            }
        ]);
    };
    const login = (username, password)=>{
        const foundUser = users.find((u)=>u.username === username && u.password === password);
        if (foundUser) {
            setCurrentUser(foundUser);
            logActivity('LOGIN', `Berhasil masuk ke dalam sistem sebagai ${foundUser.role}`);
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
    // MANAJEMEN AKUN
    const addUser = async (userData)=>{
        const newUser = {
            ...userData,
            id: `usr-${Date.now()}`,
            status: 'active'
        };
        setUsers((prev)=>[
                ...prev,
                newUser
            ]);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').insert([
            {
                id: newUser.id,
                username: newUser.username,
                name: newUser.name,
                role: newUser.role,
                password: newUser.password,
                phone: newUser.phone,
                address: newUser.address,
                institution: newUser.institution,
                status: newUser.status
            }
        ]);
        logActivity('UPDATE_PAYROLL', `Menambahkan akun baru: ${newUser.name} (${newUser.role})`);
    };
    const updateUser = async (id, updatedData)=>{
        setUsers((prev)=>prev.map((u)=>u.id === id ? {
                    ...u,
                    ...updatedData
                } : u));
        // Jika yang di-update adalah akun admin yang sedang login, update juga currentUser secara realtime
        if (currentUser?.id === id) {
            setCurrentUser((prev)=>prev ? {
                    ...prev,
                    ...updatedData
                } : prev);
        }
        // Update langsung ke database Supabase
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').update(updatedData).eq('id', id);
        logActivity('UPDATE_PAYROLL', `Memperbarui data profil/kredensial akun: ID ${id}`);
    };
    const deleteUser = async (id)=>{
        if (currentUser?.id === id) {
            alert('Tidak dapat menghapus akun yang sedang aktif digunakan saat ini!');
            return false;
        }
        const target = users.find((u)=>u.id === id);
        setUsers((prev)=>prev.filter((u)=>u.id !== id));
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('users').delete().eq('id', id);
        logActivity('UPDATE_PAYROLL', `Menghapus akun pengguna: ${target?.name || id}`);
        return true;
    };
    // RATE CONFIG
    const updateRates = async (newRates)=>{
        setRates(newRates);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('rate_configs').upsert({
            id: 'default_rates',
            base_fees: newRates.baseFees,
            ldr_bonus: newRates.ldrBonus,
            standard_bonus: newRates.standardBonus,
            standard_deductions: newRates.standardDeductions,
            updated_at: new Date().toISOString()
        });
        logActivity('UPDATE_RATES', 'Admin memperbarui konfigurasi ketentuan gaji');
    };
    const resetRatesToDefault = async ()=>{
        setRates(defaultRates);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('rate_configs').upsert({
            id: 'default_rates',
            base_fees: defaultRates.baseFees,
            ldr_bonus: defaultRates.ldrBonus,
            standard_bonus: defaultRates.standardBonus,
            standard_deductions: defaultRates.standardDeductions,
            updated_at: new Date().toISOString()
        });
        logActivity('UPDATE_RATES', 'Admin mengembalikan ketentuan gaji ke nilai default SOP');
    };
    // KELAS & SISWA
    const addClassroom = async (classroomData)=>{
        const newClassroom = {
            ...classroomData,
            id: `cls-${Date.now()}`
        };
        setClassrooms((prev)=>[
                ...prev,
                newClassroom
            ]);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('classrooms').insert([
            {
                id: newClassroom.id,
                name: newClassroom.name,
                type: newClassroom.type,
                students: newClassroom.students,
                total_meetings: newClassroom.totalMeetings,
                ldr_zone: newClassroom.ldrZone,
                status: newClassroom.status
            }
        ]);
    };
    const deleteClassroom = async (id)=>{
        setClassrooms((prev)=>prev.filter((c)=>c.id !== id));
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('classrooms').delete().eq('id', id);
    };
    // JURNAL MENGAJAR (MEETINGS)
    const addMeeting = async (meetingData)=>{
        if (!currentUser) return;
        const targetClass = classrooms.find((c)=>c.id === meetingData.classroomId);
        const existingIndex = meetings.findIndex((m)=>m.classroomId === meetingData.classroomId && m.meetingNumber === meetingData.meetingNumber);
        const meetingId = existingIndex >= 0 ? meetings[existingIndex].id : `mtg-${Date.now()}`;
        const newMeeting = {
            id: meetingId,
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
        // Simpan ke Supabase
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('meetings').upsert({
            id: newMeeting.id,
            classroom_id: newMeeting.classroomId,
            meeting_number: newMeeting.meetingNumber,
            tutor_id: newMeeting.tutorId,
            tutor_name: newMeeting.tutorName,
            date: newMeeting.date,
            lesson: newMeeting.lesson,
            notes: newMeeting.notes,
            is_locked: newMeeting.isLocked,
            ldr_zone_snapshot: newMeeting.ldrZoneSnapshot,
            has_video_claim: newMeeting.hasVideoClaim
        });
        if (meetingData.hasVideoClaim) {
            const meetingMonth = meetingData.date.substring(0, 7);
            const adj = getAdjustmentForTutor(currentUser.id, meetingMonth);
            saveAdjustment({
                ...adj,
                videoCount: (adj.videoCount || 0) + 1
            });
        }
        logActivity('CREATE_MEETING', `Mengisi jurnal pertemuan #${meetingData.meetingNumber} di kelas ${targetClass?.name || ''}${meetingData.hasVideoClaim ? ' (Klaim Video Siswa)' : ''}`);
    };
    const updateMeeting = async (meetingId, updatedData)=>{
        setMeetings((prev)=>prev.map((m)=>m.id === meetingId ? {
                    ...m,
                    ...updatedData
                } : m));
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('meetings').update({
            date: updatedData.date,
            lesson: updatedData.lesson,
            notes: updatedData.notes,
            has_video_claim: updatedData.hasVideoClaim,
            tutor_id: updatedData.tutorId,
            tutor_name: updatedData.tutorName
        }).eq('id', meetingId);
        logActivity('UPDATE_PAYROLL', `Admin mengoreksi data sesi jurnal (ID: ${meetingId})`);
    };
    const clearMeetingSlot = async (classroomId, meetingNumber)=>{
        setMeetings((prev)=>prev.filter((m)=>!(m.classroomId === classroomId && m.meetingNumber === meetingNumber)));
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('meetings').delete().eq('classroom_id', classroomId).eq('meeting_number', meetingNumber);
        logActivity('UPDATE_PAYROLL', `Admin mengosongkan / mereset slot jurnal pertemuan #${meetingNumber}`);
    };
    const toggleLockMeeting = async (meetingId)=>{
        const target = meetings.find((m)=>m.id === meetingId);
        if (!target) return;
        const newLock = !target.isLocked;
        setMeetings((prev)=>prev.map((m)=>m.id === meetingId ? {
                    ...m,
                    isLocked: newLock
                } : m));
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('meetings').update({
            is_locked: newLock
        }).eq('id', meetingId);
    };
    const lockEmptySlot = async (classroomId, meetingNumber)=>{
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
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('meetings').insert([
                {
                    id: lockedPlaceholder.id,
                    classroom_id: lockedPlaceholder.classroomId,
                    meeting_number: lockedPlaceholder.meetingNumber,
                    tutor_id: lockedPlaceholder.tutorId,
                    tutor_name: lockedPlaceholder.tutorName,
                    date: lockedPlaceholder.date,
                    lesson: lockedPlaceholder.lesson,
                    is_locked: true,
                    ldr_zone_snapshot: lockedPlaceholder.ldrZoneSnapshot,
                    has_video_claim: false
                }
            ]);
            logActivity('CREATE_MEETING', `Admin mengunci slot pertemuan #${meetingNumber} (Hangus) di kelas ${targetClass?.name || ''}`);
        }
    };
    // FREE TRIALS
    const addFreeTrial = async (trialData)=>{
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
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('free_trials').insert([
            {
                id: newTrial.id,
                student_name: newTrial.studentName,
                tutor_id: newTrial.tutorId,
                tutor_name: newTrial.tutorName,
                date: newTrial.date,
                lesson: newTrial.lesson,
                status: newTrial.status
            }
        ]);
        logActivity('CREATE_MEETING', `Mencatat sesi Free Trial untuk siswa: ${trialData.studentName}`);
    };
    const updateFreeTrial = async (trialId, updatedData)=>{
        setFreeTrials((prev)=>prev.map((ft)=>ft.id === trialId ? {
                    ...ft,
                    ...updatedData
                } : ft));
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('free_trials').update({
            student_name: updatedData.studentName,
            lesson: updatedData.lesson,
            date: updatedData.date,
            tutor_id: updatedData.tutorId,
            tutor_name: updatedData.tutorName
        }).eq('id', trialId);
        logActivity('UPDATE_PAYROLL', `Memperbarui data Free Trial ID: ${trialId}`);
    };
    const deleteFreeTrial = async (trialId)=>{
        setFreeTrials((prev)=>prev.filter((ft)=>ft.id !== trialId));
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('free_trials').delete().eq('id', trialId);
        logActivity('UPDATE_PAYROLL', `Menghapus sesi Free Trial ID: ${trialId}`);
    };
    const toggleFreeTrialStatus = async (trialId)=>{
        const target = freeTrials.find((ft)=>ft.id === trialId);
        if (!target) return;
        const newStatus = target.status === 'completed' ? 'pending' : 'completed';
        setFreeTrials((prev)=>prev.map((ft)=>ft.id === trialId ? {
                    ...ft,
                    status: newStatus
                } : ft));
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('free_trials').update({
            status: newStatus
        }).eq('id', trialId);
    };
    // MONTHLY ADJUSTMENTS
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
    const saveAdjustment = async (adj)=>{
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
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('monthly_adjustments').upsert({
            id: adj.id,
            tutor_id: adj.tutorId,
            month: adj.month,
            video_count: adj.videoCount,
            report_count: adj.reportCount,
            fnm_count: adj.fnmCount,
            custom_bonus_nominal: adj.customBonusNominal,
            custom_bonus_note: adj.customBonusNote,
            apply_suka_duka: adj.applySukaDuka,
            late_attendance_count: adj.lateAttendanceCount,
            violation_count: adj.violationCount,
            late_video_count: adj.lateVideoCount,
            sudden_leave_count: adj.suddenLeaveCount,
            custom_deduction_nominal: adj.customDeductionNominal,
            custom_deduction_note: adj.customDeductionNote
        });
        logActivity('UPDATE_PAYROLL', `Memperbarui rincian bonus & potongan untuk periode ${adj.month}`);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppContext.Provider, {
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
        lineNumber: 730,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(AppProvider, "gWcf2Bsoyzc0aOLCJupdOT9mvn8=");
_c = AppProvider;
const useApp = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
_s1(useApp, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AppProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://roghpdkljupfotpmkonv.supabase.co") || '';
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvZ2hwZGtsanVwZm90cG1rb252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNzMwNTQsImV4cCI6MjEwNTg0OTA1NH0.z8hUsZNU2KgRgLTnIrHODJedpdci7BQFTDadUlk-IlY") || '';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_00cfbni._.js.map