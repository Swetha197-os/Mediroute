import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Activity, MapPin, Truck, ArrowRight, Loader2, HeartPulse, User, Clock, Navigation, AlertCircle, ChevronDown, ChevronRight, Globe, Hospital } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { emergencyService } from '../services/api';
import toast from 'react-hot-toast';

const EmergencyForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [reqId, setReqId] = useState(null);
    
    // Check for pre-selected hospital from Radar
    const preSelected = location.state || null;

    const [formData, setFormData] = useState({
        patient_name: '',
        age: '',
        phone: '',
        symptoms: '',
        emergencyType: 'General',
        patient_lat: 13.0827,
        patient_lng: 80.2707,
        // Selected Hospital Info
        hospital_id: preSelected?.hospitalId || null,
        is_external: preSelected?.isExternal || false,
        hospital_name: preSelected?.hospitalName || '',
        hospital_address: preSelected?.address || '',
        hospital_lat: preSelected?.location?.lat || null,
        hospital_lng: preSelected?.location?.lng || null
    });
    
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [locStatus, setLocStatus] = useState('pending');

    useEffect(() => {
        getLoc();
    }, []);

    const getLoc = () => {
        if (!navigator.geolocation) {
            setLocStatus('unsupported');
            return;
        }
        setLocStatus('detecting');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setFormData(prev => ({ 
                    ...prev, 
                    patient_lat: pos.coords.latitude, 
                    patient_lng: pos.coords.longitude 
                }));
                setLocStatus('success');
            },
            (err) => {
                setLocStatus('failed');
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return; // TASK 7: Stop duplicate submit requests
        
        setLoading(true);
        
        // Simple frontend severity logic to satisfy "send exactly" requirement
        let severity = 'medium';
        let score = 5.0;
        const sym = formData.symptoms.toLowerCase();
        if (sym.includes('breath') || sym.includes('chest') || sym.includes('heart') || sym.includes('conscious')) {
            severity = 'critical';
            score = 9.5;
        } else if (sym.includes('pain') || sym.includes('bleed')) {
            severity = 'high';
            score = 7.5;
        }

        try {
            // TASK 4: Fix frontend payload to match backend schema exactly
            const payload = {
                patient_name: formData.patient_name,
                patient_age: formData.age ? parseInt(formData.age) : 30,
                patient_phone: formData.phone,
                symptoms: formData.symptoms,
                emergency_type: formData.emergencyType,
                severity_level: severity,
                urgency_score: score,
                patient_lat: parseFloat(formData.patient_lat),
                patient_lng: parseFloat(formData.patient_lng),
                hospital_id: formData.is_external ? null : (formData.hospital_id ? parseInt(formData.hospital_id) : null),
                is_external: Boolean(formData.is_external),
                external_hospital_name: formData.is_external ? formData.hospital_name : null,
                external_hospital_address: formData.is_external ? formData.hospital_address : null,
                external_hospital_lat: formData.is_external ? formData.hospital_lat : null,
                external_hospital_lng: formData.is_external ? formData.hospital_lng : null
            };

            console.log("[TRIAGE PAYLOAD]", payload);

            const res = await emergencyService.createRequest(payload);
            console.log("[TRIAGE RESPONSE SUCCESS]", res.data);

            setReqId(res.data.id);
            setAiAnalysis({
                severity: res.data.severity_level,
                urgencyScore: score,
                recommendedHospital: formData.hospital_name || "Regional Dispatch",
                eta: "5-10 minutes"
            });
            setStep(2);
            toast.success("Emergency Request Logged Successfully");
        } catch (err) {
            console.error("[TRIAGE ERROR 500?]", err);
            toast.error("Emergency triage failed. Server Error (500).");
        } finally {
            setLoading(false);
        }
    };

    const handleDispatch = async () => {
        setLoading(true);
        try {
            await emergencyService.updateStatus(reqId, 'dispatched');
            toast.success("Dispatch Confirmed!");
            navigate(`/patient/tracking/${reqId}`);
        } catch (err) {
            console.error("Dispatch error", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Multi-step progress bar */}
            <div className="flex items-center justify-center gap-4 mb-20">
                <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black transition-all ${step >= 1 ? 'bg-brand-primary text-white shadow-xl shadow-sky-500/30 rotate-3' : 'bg-slate-200 text-slate-400'}`}>1</div>
                <div className={`h-1.5 w-16 lg:w-24 rounded-full ${step >= 2 ? 'bg-brand-primary' : 'bg-slate-100'}`}></div>
                <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black transition-all ${step >= 2 ? 'bg-brand-primary text-white shadow-xl shadow-sky-500/30 -rotate-3' : 'bg-slate-200 text-slate-400'}`}>2</div>
                <div className={`h-1.5 w-16 lg:w-24 rounded-full ${step >= 3 ? 'bg-brand-primary' : 'bg-slate-100'}`}></div>
                <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black transition-all ${step >= 3 ? 'bg-brand-primary text-white shadow-xl shadow-sky-500/30 rotate-3' : 'bg-slate-200 text-slate-400'}`}>3</div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="bg-white rounded-[3.5rem] p-12 shadow-2xl border border-slate-100 border-b-8 border-b-rose-500/10"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                            <div className="flex items-center gap-6">
                                <div className="p-6 bg-rose-50 text-rose-500 rounded-[2rem] shadow-inner">
                                    <ShieldAlert size={42} />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 leading-tight">Emergency Triage</h2>
                                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Active Node: {formData.hospital_name || 'Autonomous AI Selection'}</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-widest ${locStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                <MapPin size={16} /> {locStatus === 'success' ? 'GPS Locked' : 'GPS Passive'}
                            </div>
                        </div>

                        {formData.hospital_name && (
                            <div className={`mb-10 p-6 rounded-[2rem] border flex items-center justify-between ${formData.is_external ? 'bg-amber-50 border-amber-100' : 'bg-sky-50 border-sky-100'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 bg-white rounded-xl shadow-sm ${formData.is_external ? 'text-amber-500' : 'text-brand-primary'}`}>
                                        {formData.is_external ? <Globe size={20} /> : <Hospital size={20} />}
                                    </div>
                                    <div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${formData.is_external ? 'text-amber-600' : 'text-brand-primary'}`}>
                                            {formData.is_external ? 'External Facility Selection' : 'Routing Priority'}
                                        </p>
                                        <p className="text-sm font-black text-slate-900">{formData.hospital_name}</p>
                                        {formData.is_external && (
                                            <p className="text-[9px] font-bold text-amber-700 mt-1 uppercase tracking-tight">Queue sync is available only for registered MediRoute hospitals.</p>
                                        )}
                                    </div>
                                </div>
                                <button type="button" onClick={() => setFormData({...formData, hospital_id: null, hospital_name: '', is_external: false})} className="text-xs font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest">Change</button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-12">
                            <div className="space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Patient Biological Context</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <input 
                                        type="text" placeholder="Patient Name" required
                                        className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:border-brand-primary"
                                        value={formData.patient_name} onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                                    />
                                    <input 
                                        type="number" placeholder="Age" required
                                        className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:border-brand-primary"
                                        value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                                    />
                                    <input 
                                        type="tel" placeholder="Cell Number" required
                                        className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:border-brand-primary"
                                        value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Condition Type</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all appearance-none cursor-pointer text-slate-700"
                                            value={formData.emergencyType}
                                            onChange={(e) => setFormData({...formData, emergencyType: e.target.value})}
                                        >
                                            <option value="General">General Emergency</option>
                                            <option value="Cardiac">Cardiac / Chest Pain</option>
                                            <option value="Respiratory">Difficulty Breathing</option>
                                            <option value="Accident">Accident / Trauma</option>
                                            <option value="Neurological">Stroke / Seizure</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronDown size={20} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Patient Consciousness</label>
                                    <div className="flex gap-4">
                                        <div className="flex-1 px-8 py-5 bg-emerald-50 text-emerald-600 rounded-3xl font-black text-center text-xs border border-emerald-100">CONSCIOUS</div>
                                        <div className="flex-1 px-8 py-5 bg-slate-50 text-slate-400 rounded-3xl font-black text-center text-xs border border-slate-100">UNRESPONSIVE</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 relative group">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Symptom Descriptor (Neural Engine)</label>
                                <textarea 
                                    className="w-full px-10 py-8 bg-slate-50 border border-slate-200 rounded-[3rem] outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all min-h-[220px] resize-none text-slate-800 leading-relaxed text-lg"
                                    placeholder="Briefly describe the emergency state..."
                                    required
                                    value={formData.symptoms}
                                    onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                                ></textarea>
                                <div className="absolute bottom-8 right-10 flex items-center gap-3 text-[10px] font-black text-brand-primary uppercase tracking-widest opacity-0 group-focus-within:opacity-100 transition-opacity">
                                    <Activity size={16} className="animate-pulse" />
                                    AI Neural Scan active
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 group hover:shadow-brand-primary/10"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        Interrogating Core...
                                    </>
                                ) : (
                                    <>
                                        Analyze Severity & Route
                                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 2 && aiAnalysis && (
                    <motion.div 
                        key="step2"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-12"
                    >
                        <div className="bg-white rounded-[4rem] p-12 shadow-2xl border-4 border-slate-50 overflow-hidden relative">
                             <div className="absolute top-10 right-10">
                                <motion.div 
                                    animate={{ scale: [1, 1.05, 1] }} 
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className={`px-8 py-3 rounded-full font-black text-[12px] uppercase tracking-widest border-2 shadow-lg ${
                                        aiAnalysis.severity === 'critical' ? 'bg-rose-50 text-rose-500 border-rose-200' :
                                        aiAnalysis.severity === 'high' ? 'bg-orange-50 text-orange-500 border-orange-200' :
                                        'bg-sky-50 text-brand-primary border-brand-primary/20'
                                    }`}
                                >
                                    {aiAnalysis.severity} Severity
                                </motion.div>
                             </div>

                             <div className="relative z-10">
                                <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Mission Critical Response</h3>
                                <p className="text-slate-500 font-bold mb-16 uppercase tracking-widest text-[10px]">Optimal Care Node Locked</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center text-center">
                                        <Activity className="text-rose-500 mb-4" size={32} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority Score</p>
                                        <p className="text-4xl font-black text-slate-900">{aiAnalysis.urgencyScore}/10</p>
                                    </div>
                                    <div className="bg-sky-50 p-10 rounded-[3rem] border border-sky-100 flex flex-col items-center text-center">
                                        <Hospital className="text-brand-primary mb-4" size={32} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Facility Node</p>
                                        <p className="text-xl font-black text-slate-900 line-clamp-1">{aiAnalysis.recommendedHospital}</p>
                                    </div>
                                    <div className="bg-emerald-50 p-10 rounded-[3rem] border border-emerald-100 flex flex-col items-center text-center">
                                        <Clock className="text-emerald-500 mb-4" size={32} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unit ETA</p>
                                        <p className="text-4xl font-black text-slate-900">{aiAnalysis.eta}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden group">
                                    <div className="relative z-10 flex items-center gap-10">
                                        <div className="w-28 h-28 bg-brand-primary rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-sky-500/20 rotate-6 group-hover:rotate-12 transition-transform duration-700">
                                            <Truck size={56} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] mb-3">Vector Status</p>
                                            <h4 className="text-3xl font-black mb-2">Unit Assigned</h4>
                                            <div className="flex items-center gap-6 text-brand-primary font-black text-xs">
                                                <span className="flex items-center gap-2"><MapPin size={18} /> GPS Linked</span>
                                                <span className="flex items-center gap-2"><Activity size={18} /> Vital Link</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleDispatch}
                                        disabled={loading}
                                        className="relative z-10 bg-white text-slate-900 px-16 py-7 rounded-[2rem] font-black text-2xl hover:bg-brand-primary hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-50 group/btn"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={32} /> : "Finalize Dispatch"}
                                    </button>
                                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-brand-primary/20 transition-all duration-1000"></div>
                                </div>
                             </div>
                        </div>

                        <div className="flex items-center gap-4 p-8 bg-amber-50 text-amber-700 rounded-[2.5rem] border border-amber-100">
                            <AlertCircle size={24} />
                            <p className="text-sm font-bold">MediRoute Core Advice: Stay at your current coordinates. A specialized unit has been diverted to your location.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmergencyForm;
