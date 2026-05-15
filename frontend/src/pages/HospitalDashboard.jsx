import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
    Bed, Stethoscope, Truck, Activity, 
    MoreVertical, Plus, Loader2, Save, X, Phone, User, MapPin, Clock
} from 'lucide-react';
import { hospitalService, emergencyService } from '../services/api';
import toast from 'react-hot-toast';

const HospitalDashboard = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [hospital, setHospital] = useState(null);
    const [resources, setResources] = useState(null);
    const [queue, setQueue] = useState([]);
    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
    const [isCaseModalOpen, setCaseModalOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);

    // Form states for update resources
    const [resForm, setResForm] = useState({
        total_beds: 0, available_beds: 0,
        total_icu: 0, available_icu: 0,
        on_duty_staff: 0, total_ambulances: 0,
        available_ambulances: 0, wait_time: 0, 
        er_status: 'normal'
    });

    // Sync active tab with URL path
    useEffect(() => {
        const path = location.pathname.split('/').pop();
        if (['resources', 'queue'].includes(path)) {
            setActiveTab(path);
        } else {
            setActiveTab('overview');
        }
    }, [location]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 20000); // 20s auto-refresh
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const hRes = await hospitalService.getProfile();
            console.log("[HOSPITAL PROFILE RESPONSE]", hRes.data);
            setHospital(hRes.data);
            
            const resData = {
                total_beds: hRes.data.total_beds || 0,
                available_beds: hRes.data.available_beds || 0,
                total_icu: hRes.data.total_icu || 0,
                available_icu: hRes.data.available_icu || 0,
                on_duty_staff: hRes.data.on_duty_staff || 0,
                total_ambulances: hRes.data.total_ambulances || 0,
                available_ambulances: hRes.data.available_ambulances || 0,
                wait_time: hRes.data.wait_time || 0,
                er_status: hRes.data.er_status || 'normal'
            };
            setResources(resData);
            setResForm(resData);
            console.log("[DISPLAYED RESOURCE STATE]", resData);
            
            const qRes = await emergencyService.getQueue();
            setQueue(qRes.data || []);
        } catch (err) {
            console.error("Dashboard sync error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateResources = async (e) => {
        e.preventDefault();
        
        const payload = {
            total_beds: Number(resForm.total_beds || 0),
            available_beds: Number(resForm.available_beds || 0),
            total_icu: Number(resForm.total_icu || 0),
            available_icu: Number(resForm.available_icu || 0),
            on_duty_staff: Number(resForm.on_duty_staff || 0),
            total_ambulances: Number(resForm.total_ambulances || 0),
            available_ambulances: Number(resForm.available_ambulances || 0),
            wait_time: Number(resForm.wait_time || 0),
            er_status: resForm.er_status || "normal"
        };

        if (payload.available_beds > payload.total_beds) return toast.error("Available beds cannot exceed total.");
        if (payload.available_icu > payload.total_icu) return toast.error("Available ICU cannot exceed total.");
        if (payload.available_ambulances > payload.total_ambulances) return toast.error("Available ambulances cannot exceed total.");

        setLoading(true);
        console.log("[RESOURCE UPDATE PAYLOAD]", payload);
        
        try {
            const response = await hospitalService.updateResources(payload);
            toast.success("Resources synchronized!");
            
            // Use the flattened response directly
            const syncedData = response.data;
            setHospital(syncedData);
            setResources(syncedData);
            setResForm(syncedData);
            
            console.log("[DISPLAYED RESOURCE STATE SYNCED]", syncedData);
            setUpdateModalOpen(false);
        } catch (err) {
            toast.error("Failed to update resources.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (reqId, status) => {
        try {
            await emergencyService.updateStatus(reqId, status);
            toast.success(`Priority updated: ${status}`);
            fetchData(); // Immediate refresh
            if (isCaseModalOpen) setCaseModalOpen(false);
        } catch (err) {
            toast.error("Status update failed.");
        }
    };

    if (loading && !hospital) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
            <Loader2 className="animate-spin text-brand-primary" size={64} />
            <p className="text-xl font-black text-slate-900 uppercase tracking-[0.2em]">Syncing Provider Node...</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Command Center</h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">
                        Live OPS: <span className="text-brand-primary">{hospital?.name || 'Loading...'}</span>
                    </p>
                </div>
                <button 
                    onClick={() => setUpdateModalOpen(true)}
                    className="bg-slate-900 text-white py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center gap-2 active:scale-95"
                >
                    <Plus size={18} /> Update Payload
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "Beds Available", value: resources?.available_beds || 0, total: resources?.total_beds || 0, icon: Bed, color: "sky" },
                                { label: "ICU Vacancy", value: resources?.available_icu || 0, total: resources?.total_icu || 0, icon: Activity, color: "rose" },
                                { label: "On-Duty Staff", value: resources?.on_duty_staff || 0, total: "Active", icon: Stethoscope, color: "emerald" },
                                { label: "Ambulances", value: resources?.available_ambulances || 0, total: resources?.total_ambulances || 0, icon: Truck, color: "indigo" },
                            ].map((item, i) => (
                                <div key={i} className="dashboard-card group">
                                    <div className={`p-4 bg-${item.color}-50 text-${item.color}-600 rounded-2xl w-fit mb-8`}>
                                        <item.icon size={26} />
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter">{item.value}</span>
                                        {item.total !== "Active" && (
                                            <span className="text-sm font-bold text-slate-400">/ {item.total}</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2 space-y-6">
                                <h2 className="text-2xl font-black text-slate-900">Priority Feed</h2>
                                <div className="space-y-4">
                                    {queue.length === 0 ? (
                                        <div className="py-16 text-center space-y-4 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No emergency requests assigned yet.</p>
                                        </div>
                                    ) : (
                                        queue.slice(0, 5).map((req, i) => (
                                            <div key={i} className="dashboard-card flex items-center justify-between group hover:border-brand-primary/20 transition-all cursor-pointer" onClick={() => {setSelectedCase(req); setCaseModalOpen(true);}}>
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${req.severity_level === 'critical' ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400'}`}>
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900">{req.emergency_type}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: {req.status}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${req.severity_level === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'}`}>
                                                    {req.severity_level}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="dashboard-card border-none bg-slate-900 text-white p-10 flex flex-col justify-between">
                                 <div>
                                    <h3 className="text-xl font-black mb-2 uppercase tracking-widest">Protocol Core</h3>
                                    <p className="text-slate-500 text-xs font-bold leading-relaxed">System automating dispatch based on H-score (Hostility + Distance).</p>
                                 </div>
                                 <div className="space-y-4 mt-10">
                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                                        <Truck className="text-brand-primary" />
                                        <p className="font-black text-sm">3 Units Standby</p>
                                    </div>
                                 </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'resources' && (
                    <motion.div key="resources" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="dashboard-card p-12 max-w-4xl mx-auto space-y-12">
                        <h2 className="text-3xl font-black text-slate-900">Resource Registry</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                             <div className="space-y-6">
                                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b">Bed Asset Mgmt</p>
                                 <div className="flex justify-between font-bold"><span className="text-slate-500">Total Capacity</span><span>{resources?.total_beds}</span></div>
                                 <div className="flex justify-between font-bold"><span className="text-slate-500">Available Now</span><span className="text-emerald-500">{resources?.available_beds}</span></div>
                             </div>
                             <div className="space-y-6">
                                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b">Critical Care</p>
                                 <div className="flex justify-between font-bold"><span className="text-slate-500">ICU Total</span><span>{resources?.total_icu}</span></div>
                                 <div className="flex justify-between font-bold"><span className="text-slate-500">On-Duty Doctors</span><span className="text-indigo-500">{resources?.on_duty_staff}</span></div>
                             </div>
                        </div>
                        <button onClick={() => setUpdateModalOpen(true)} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl">Update Live Data</button>
                    </motion.div>
                )}

                {activeTab === 'queue' && (
                    <motion.div key="queue" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        {queue.length === 0 ? (
                            <div className="dashboard-card py-40 text-center space-y-6">
                                <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <Activity size={48} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Quiet Sector</h2>
                                <p className="text-slate-500 max-w-sm mx-auto font-medium">No emergency requests are currently assigned to your facility.</p>
                            </div>
                        ) : (
                            queue.map((req, i) => (
                                <div key={i} className="dashboard-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl ${req.severity_level === 'critical' ? 'bg-rose-50 text-rose-500 animate-pulse' : 'bg-slate-50 text-slate-300'}`}>
                                            <Activity size={32} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-2xl font-black text-slate-900">{req.patient_name}</h3>
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${req.severity_level === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'}`}>{req.severity_level}</span>
                                            </div>
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{req.emergency_type} • Age {req.age}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: <span className="text-brand-primary font-black">{req.status}</span></p>
                                        </div>
                                    </div>
                                     <div className="flex gap-4">
                                          {['pending', 'requested'].includes(req.status) && (
                                              <button onClick={() => handleStatusUpdate(req.id, 'accepted')} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95">Accept Case</button>
                                          )}
                                          {req.status === 'accepted' && (
                                              <button onClick={() => handleStatusUpdate(req.id, 'dispatched')} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95">Dispatch Ambulance</button>
                                          )}
                                         <button onClick={() => {setSelectedCase(req); setCaseModalOpen(true);}} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100"><MoreVertical size={24} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal for Update Resources */}
            <AnimatePresence>
                {isUpdateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUpdateModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-20 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                                 <div>
                                    <h3 className="text-2xl font-black">Sync Resources</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Live Asset Management</p>
                                 </div>
                                 <button onClick={() => setUpdateModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
                            </div>
                        <form onSubmit={handleUpdateResources} className="p-10 grid grid-cols-2 gap-6">
                            {[
                                { label: "Total Beds", key: "total_beds" },
                                { label: "Available Beds", key: "available_beds" },
                                { label: "Total ICU", key: "total_icu" },
                                { label: "Available ICU", key: "available_icu" },
                                { label: "Total Ambulances", key: "total_ambulances" },
                                { label: "Available Ambulances", key: "available_ambulances" },
                                { label: "Staff On-Duty", key: "on_duty_staff" },
                                { label: "Wait Time (Min)", key: "wait_time" },
                            ].map((field) => (
                                <div key={field.key} className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">{field.label}</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={resForm[field.key]} 
                                        onChange={(e) => setResForm({...resForm, [field.key]: parseInt(e.target.value) || 0})}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-brand-primary/10 transition-all"
                                    />
                                </div>
                            ))}
                            <button type="submit" disabled={loading} className="col-span-2 py-5 mt-4 bg-brand-primary text-white rounded-[2rem] font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                                Push Asset Update
                            </button>
                        </form>
                        </motion.div>
                    </div>
                )}

                {isCaseModalOpen && selectedCase && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCaseModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl relative z-20 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="bg-rose-500 p-10 text-white flex justify-between items-center relative overflow-hidden">
                                 <div className="relative z-10">
                                    <h3 className="text-3xl font-black mb-2">{selectedCase.patient_name}</h3>
                                    <div className="flex gap-4">
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-80">Severity: {selectedCase.severity_level}</p>
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-80">Type: {selectedCase.emergency_type}</p>
                                    </div>
                                 </div>
                                 <Activity className="absolute -right-10 -bottom-10 w-48 h-48 text-white/10 rotate-12" />
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient Vitals</h4>
                                        <p className="text-lg font-black text-slate-900 bg-slate-50 p-4 rounded-2xl border border-slate-100">Age: {selectedCase.age} • {selectedCase.phone}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</h4>
                                        <p className="text-lg font-black text-brand-primary bg-sky-50 p-4 rounded-2xl border border-sky-100 uppercase">{selectedCase.status}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Symptoms Reported</h4>
                                     <p className="text-xl font-bold text-slate-700 bg-slate-50 p-6 rounded-2xl border border-slate-100">{selectedCase.symptoms}</p>
                                </div>
                                 <div className="flex gap-4">
                                     {['pending', 'requested'].includes(selectedCase.status) && (
                                         <button onClick={() => handleStatusUpdate(selectedCase.id, 'accepted')} className="flex-1 py-5 bg-emerald-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl active:scale-95">Accept Case</button>
                                     )}
                                     {selectedCase.status === 'accepted' && (
                                         <button onClick={() => handleStatusUpdate(selectedCase.id, 'dispatched')} className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl active:scale-95">Dispatch Unit</button>
                                     )}
                                    {['dispatched', 'en_route'].includes(selectedCase.status) && (
                                        <button onClick={() => handleStatusUpdate(selectedCase.id, 'completed')} className="flex-1 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl active:scale-95">Mark Completed</button>
                                    )}
                                    <a href={`tel:${selectedCase.phone}`} className="flex-1 py-5 bg-white border border-slate-200 text-slate-500 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"><Phone size={20} /> Contact Patient</a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HospitalDashboard;
