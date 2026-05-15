import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserCircle, Hospital, ShieldCheck, ArrowRight, Loader2, Phone, MapPin, Droplets } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '', 
        password: '', 
        full_name: '', 
        role: 'patient',
        phone: '',
        blood_group: '',
        hospital_name: '',
        address: ''
    });

    const handleRegister = async (e) => {
        // Task 9: Prevent duplicate requests
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (loading) return;
        
        setLoading(true);
        try {
            const res = await authService.register(formData);
            
            // Task 7: Expect token and user info in response
            if (res.data.access_token) {
                localStorage.setItem('token', res.data.access_token);
                localStorage.setItem('role', res.data.role);
                localStorage.setItem('user_id', res.data.user_id);
                localStorage.setItem('name', res.data.name);
                
                toast.success(`Welcome to MediRoute, ${res.data.name}!`);
                
                // Task 10: Redirect to dashboard based on role
                if (res.data.role === 'patient') {
                    navigate('/patient/dashboard');
                } else if (res.data.role === 'hospital') {
                    navigate('/hospital/dashboard');
                } else if (res.data.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            } else {
                toast.success("Account created successfully! Please log in.");
                navigate('/login');
            }
        } catch (err) {
            console.error("Registration full error:", err);
            toast.error(err.response?.data?.detail || "Registration failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            <div className="hidden lg:flex w-2/5 bg-slate-900 items-center justify-center p-20 relative overflow-hidden">
                <div className="relative z-10">
                    <ShieldCheck size={64} className="text-brand-primary mb-10" />
                    <h1 className="text-5xl font-black text-white leading-tight mb-8">
                        Join the <br/> <span className="text-brand-primary">Survival Network.</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-medium">
                        Standardizing emergency response across the globe with decentralized intelligence.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -ml-20 -mb-20"></div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 lg:p-20 bg-white lg:rounded-l-[4rem] shadow-[-50px_0_100px_-20px_rgba(0,0,0,0.05)]">
                <div className="w-full max-w-xl space-y-10">
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Get Started</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Create your secure healthcare identity</p>
                    </div>

                    <div className="flex bg-slate-100 p-2 rounded-[2rem] gap-2">
                        {['patient', 'hospital'].map((role) => (
                            <button 
                                key={role}
                                type="button"
                                onClick={() => setFormData({...formData, role})}
                                className={`flex-1 py-4 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${formData.role === role ? 'bg-white text-brand-primary shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {role === 'patient' ? <User size={16} /> : <Hospital size={16} />}
                                {role} Identity
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{formData.role === 'patient' ? 'Full Legal Name' : 'Administrator Name'}</label>
                            <div className="relative">
                                <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all text-sm"
                                    placeholder={formData.role === 'patient' ? "John Doe" : "Admin Name"}
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                />
                            </div>
                        </div>

                        {formData.role === 'hospital' && (
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Official Hospital Name</label>
                                <div className="relative">
                                    <Hospital className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input 
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all text-sm"
                                        placeholder="City General Hospital"
                                        required={formData.role === 'hospital'}
                                        value={formData.hospital_name}
                                        onChange={(e) => setFormData({...formData, hospital_name: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secure Email</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    type="email"
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all text-sm"
                                    placeholder="your@email.com"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all text-sm"
                                    placeholder="+1 234 567 890"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>

                        {formData.role === 'patient' && (
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                                <div className="relative">
                                    <Droplets className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <select 
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all text-sm appearance-none"
                                        value={formData.blood_group}
                                        onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
                                        required={formData.role === 'patient'}
                                    >
                                        <option value="">Select Blood Group</option>
                                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className={formData.role === 'hospital' ? "space-y-2 md:col-span-2" : "space-y-2"}>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key (Password)</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    type="password"
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all text-sm"
                                    placeholder="Min. 8 characters"
                                    required
                                    minLength={8}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Location Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all text-sm"
                                    placeholder="Street, City, Country"
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`md:col-span-2 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50 mt-4 ${loading ? 'bg-slate-800' : 'bg-slate-900 hover:bg-black text-white hover:shadow-brand-primary/10'}`}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>Generate Secure Account <ArrowRight size={24} className="transition-transform group-hover:translate-x-1" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm font-bold text-slate-400">
                        Already in the network? <Link to="/login" className="text-brand-primary hover:underline">Sign In Here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
