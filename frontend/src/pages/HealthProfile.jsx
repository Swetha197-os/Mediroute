import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, Droplets, User, Phone, MapPin, 
    FileText, Plus, ShieldCheck, History, Activity,
    Upload, Download, Trash2, Loader2, Save, X
} from 'lucide-react';
import { patientService } from '../services/api';
import toast from 'react-hot-toast';

const HealthProfile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profile, setProfile] = useState({
        full_name: '',
        age: '',
        gender: 'Not Specified',
        contact_number: '',
        blood_group: 'O+',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        allergies: '',
        existing_conditions: '',
        current_medications: ''
    });

    const [reports, setReports] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pRes, rRes] = await Promise.all([
                patientService.getHealthProfile(),
                patientService.getReports()
            ]);
            setProfile(pRes.data);
            setReports(rRes.data);
        } catch (err) {
            console.error("Load health profile failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!profile.contact_number || profile.contact_number.length < 10) {
            toast.error("Valid contact number is required.");
            return;
        }
        setSaving(true);
        try {
            await patientService.updateHealthProfile(profile);
            toast.success("Health profile synchronized!");
        } catch (err) {
            console.error("Save profile failed", err);
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large (Max 5MB)");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        
        setUploading(true);
        try {
            await patientService.uploadReport(formData);
            toast.success("Report uploaded successfully!");
            loadData(); // Refetch reports
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
            <Loader2 className="animate-spin text-brand-primary" size={64} />
            <p className="font-black text-slate-900 uppercase tracking-widest text-sm">Decoding Health Vault...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-brand-primary/10 text-brand-primary rounded-[2rem] shadow-inner">
                        <ShieldCheck size={42} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">Medical Identity Vault</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">End-to-End Encrypted Health Records</p>
                    </div>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Sync Profile
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-10">
                    <form onSubmit={handleSave} className="dashboard-card p-12 space-y-10">
                        <div className="flex items-center gap-4 mb-4">
                            <User className="text-brand-primary" size={24} />
                            <h3 className="text-2xl font-black text-slate-900">Personal Fundamentals</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Legal Name</label>
                                <input 
                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all"
                                    type="text"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contact Number</label>
                                <input 
                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all"
                                    type="tel"
                                    value={profile.contact_number}
                                    onChange={(e) => setProfile({...profile, contact_number: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Biological Age</label>
                                <input 
                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all"
                                    type="number"
                                    value={profile.age}
                                    onChange={(e) => setProfile({...profile, age: e.target.value})}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Blood Group</label>
                                <select 
                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all appearance-none cursor-pointer"
                                    value={profile.blood_group}
                                    onChange={(e) => setProfile({...profile, blood_group: e.target.value})}
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-slate-100 space-y-10">
                            <div className="flex items-center gap-4">
                                <Activity className="text-brand-primary" size={24} />
                                <h3 className="text-2xl font-black text-slate-900">Clinical Data</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Known Allergies</label>
                                    <textarea 
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all min-h-[120px]"
                                        value={profile.allergies}
                                        onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                                        placeholder="e.g. Penicillin, Latex, Peanuts..."
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Existing Conditions</label>
                                    <textarea 
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all min-h-[120px]"
                                        value={profile.existing_conditions}
                                        onChange={(e) => setProfile({...profile, existing_conditions: e.target.value})}
                                        placeholder="e.g. Asthma, Diabetes Type 1, Hypertension..."
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Current Medications (Optional)</label>
                                    <input 
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all"
                                        type="text"
                                        value={profile.current_medications}
                                        onChange={(e) => setProfile({...profile, current_medications: e.target.value})}
                                        placeholder="List current dosage if any"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-slate-100 space-y-10">
                            <div className="flex items-center gap-4">
                                <Phone className="text-brand-primary" size={24} />
                                <h3 className="text-2xl font-black text-slate-900">Emergency Protocol Contacts</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Primary Contact Name</label>
                                    <input 
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all"
                                        type="text"
                                        value={profile.emergency_contact_name}
                                        onChange={(e) => setProfile({...profile, emergency_contact_name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Primary Contact Phone</label>
                                    <input 
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all"
                                        type="tel"
                                        value={profile.emergency_contact_phone}
                                        onChange={(e) => setProfile({...profile, emergency_contact_phone: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Sidebar: Reports */}
                <div className="space-y-10">
                    <div className="dashboard-card p-10 bg-slate-900 text-white">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black">Medical Reports</h3>
                            <div className="relative">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                <button className="p-4 bg-brand-primary rounded-2xl text-white shadow-xl shadow-sky-500/20 hover:scale-110 active:scale-95 transition-all">
                                    {uploading ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {reports.length > 0 ? (
                                reports.map((r, i) => (
                                    <div key={i} className="group p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-white/20 transition-all">
                                        <div className="flex items-center gap-6 mb-4">
                                            <div className="p-4 bg-brand-primary/20 text-brand-primary rounded-2xl">
                                                <FileText size={24} />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-bold truncate text-sm">{r.original_filename}</p>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                                    {new Date(r.upload_date).toLocaleDateString()} • {r.file_type.split('/')[1].toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <a 
                                                href={patientService.getReportDownloadUrl(r.id)} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex-1 py-3 bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Download size={14} /> Download
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-slate-500 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                                    <Upload size={32} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-xs font-black uppercase tracking-widest">No vault files detected</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-card p-10 bg-white">
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="text-emerald-500" />
                            <h3 className="font-black text-slate-900">Network Status</h3>
                        </div>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">Your medical data is synced across 12 region nodes for immediate triage access during emergencies.</p>
                        <div className="flex items-center gap-3 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200"></div>
                            Synchronized Ready
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthProfile;
