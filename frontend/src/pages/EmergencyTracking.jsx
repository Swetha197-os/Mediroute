import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    MapPin, Truck, Hospital, CheckCircle, Clock, Loader2, 
    Phone, ShieldCheck, Activity, Navigation, ArrowLeft
} from 'lucide-react';
import { emergencyService } from '../services/api';
import toast from 'react-hot-toast';

const EmergencyTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracking = async () => {
            try {
                const res = await emergencyService.track(id);
                setData(res.data);
            } catch (err) {
                toast.error("Failed to load tracking data.");
            } finally {
                setLoading(false);
            }
        };

        fetchTracking();
        const interval = setInterval(fetchTracking, 10000); //Auto refresh
        return () => clearInterval(interval);
    }, [id]);

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
            <Loader2 className="animate-spin text-brand-primary" size={64} />
            <p className="text-xl font-black text-slate-900 uppercase tracking-[0.2em]">Locating Dispatch Unit...</p>
        </div>
    );

    const steps = [
        { label: "Requested", status: "completed" },
        { label: "Accepted", status: data.status !== 'requested' ? "completed" : "pending" },
        { label: "Dispatched", status: ['dispatched', 'en_route', 'arrived', 'completed'].includes(data.status) ? "completed" : "pending" },
        { label: "En Route", status: ['en_route', 'arrived', 'completed'].includes(data.status) ? "completed" : "pending" },
        { label: "Arrived", status: ['arrived', 'completed'].includes(data.status) ? "completed" : "pending" },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate('/patient/dashboard')}
                    className="flex items-center gap-3 text-slate-500 font-bold hover:text-brand-primary transition-all p-2 rounded-xl group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Emergency ID</p>
                    <p className="font-black text-slate-900 tracking-tighter text-xl">#RD-{id.padStart(6, '0')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Status Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Progress Bar */}
                    <div className="dashboard-card p-10 relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-slate-900 mb-10">Live Dispatch Timeline</h2>
                            <div className="relative">
                                {/* Track Line */}
                                <div className="absolute left-[27px] top-4 bottom-4 w-1.5 bg-slate-100 rounded-full">
                                    <div 
                                        className="w-full bg-brand-primary rounded-full transition-all duration-1000" 
                                        style={{ height: `${(steps.filter(s => s.status === 'completed').length - 1) / (steps.length - 1) * 100}%` }}
                                    ></div>
                                </div>

                                <div className="space-y-12">
                                    {steps.map((step, i) => (
                                        <div key={i} className="flex items-center gap-8 relative z-20">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${step.status === 'completed' ? 'bg-brand-primary text-white scale-110' : 'bg-white text-slate-300 border-2 border-slate-100'}`}>
                                                {step.status === 'completed' ? <CheckCircle size={28} /> : i + 1}
                                            </div>
                                            <div>
                                                <p className={`font-black uppercase tracking-widest text-sm ${step.status === 'completed' ? 'text-slate-900' : 'text-slate-300'}`}>{step.label}</p>
                                                {step.status === 'completed' && <p className="text-[10px] font-bold text-brand-primary uppercase mt-1 tracking-tighter">Action Verified</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Activity className="absolute -top-20 -right-20 w-80 h-80 text-slate-50 rotate-45 pointer-events-none" />
                    </div>

                    {/* Mock Map View */}
                    <div className="dashboard-card h-[400px] bg-slate-100 p-0 overflow-hidden relative border-4 border-white shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-73.9741,40.7441,13,0/1000x600?access_token=pk.xxx')] bg-cover bg-center opacity-50 grayscale"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                             <div className="relative">
                                <div className="absolute inset-0 animate-ping bg-brand-primary/20 rounded-full"></div>
                                <div className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-brand-primary relative z-10 border-4 border-brand-primary/10">
                                    <Truck size={32} className="animate-bounce" />
                                </div>
                             </div>
                        </div>
                        <div className="absolute bottom-6 left-6 right-6 flex gap-4">
                             <div className="flex-1 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-xl flex items-center gap-6 border border-white">
                                <div className="p-4 bg-slate-900 text-white rounded-2xl"><MapPin size={24} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Headed To</p>
                                    <p className="font-black text-slate-900">{data.hospital || "Assigning Hospital..."}</p>
                                </div>
                             </div>
                             <button className="p-6 bg-brand-primary text-white rounded-3xl shadow-xl shadow-sky-500/20 active:scale-95 transition-all">
                                <Navigation size={28} />
                             </button>
                        </div>
                    </div>
                </div>

                {/* Details Sidebar */}
                <div className="space-y-10">
                    <div className="dashboard-card bg-slate-900 text-white p-8">
                         <div className="p-4 bg-white/10 rounded-2xl w-fit mb-8 border border-white/10">
                            <Truck size={32} className="text-brand-primary" />
                         </div>
                         <h3 className="text-2xl font-black mb-2">Ambulance Details</h3>
                         <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mb-10">Assigned Unit Identification</p>
                         
                         <div className="space-y-6">
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Unit ID</span>
                                <span className="font-black tracking-tight">{data.ambulance || "Wait..."}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Driver Contact</span>
                                <span className="font-black text-brand-primary tracking-tight">+1 202-555-0912</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Oxygen Level</span>
                                <span className="font-black text-emerald-400 tracking-tight">Normal (98%)</span>
                            </div>
                         </div>

                         <div className="mt-10 flex gap-4">
                            <button className="flex-1 py-4 bg-white text-slate-900 rounded-[1.25rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                                <Phone size={16} /> Call Driver
                            </button>
                         </div>
                    </div>

                    <div className="dashboard-card ring-2 ring-slate-100">
                         <h3 className="text-lg font-black text-slate-900 mb-8 border-b border-slate-100 pb-4 flex items-center gap-3">
                            <ShieldCheck className="text-emerald-500" />
                            Safety Protocols
                         </h3>
                         <ul className="space-y-6 text-sm text-slate-500 font-bold">
                            <li className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                                Stay where you are and keep the phone active.
                            </li>
                            <li className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                                Keep identification records ready (ID, Health Card).
                            </li>
                            <li className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                                Don't move the patient unless critical.
                            </li>
                         </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyTracking;
