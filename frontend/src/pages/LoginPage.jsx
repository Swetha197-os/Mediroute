import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, Activity, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.login(formData.email, formData.password);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('user_id', res.data.user_id);
      localStorage.setItem('user_name', res.data.name);
      localStorage.setItem('user_email', formData.email); // Added store email
      
      toast.success(`Welcome back, ${res.data.name}!`);
      
      const rolePath = {
        'admin': '/admin/dashboard',
        'hospital': '/hospital/dashboard',
        'patient': '/patient/dashboard'
      }[res.data.role];
      
      navigate(rolePath || '/');
    } catch (err) {
      console.error("Login trace", err);
      toast.error(err.response?.data?.detail || "Authentication Failed. Check server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
      {/* Side Decoration */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent"></div>
        <div className="relative z-10 p-20 max-w-2xl text-center">
          <Activity size={80} className="text-brand-primary mb-12 mx-auto animate-pulse" />
          <h1 className="text-6xl font-black text-white leading-tight mb-8">
            The Neural Core of <br/> <span className="text-brand-primary">Emergency Care.</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">
            Standardizing sub-second response times through decentralized medical intelligence.
          </p>
        </div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-24 bg-white lg:rounded-l-[4rem] relative z-20 shadow-[-50px_0_100px_-20px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-md space-y-12">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Secure Sign In</h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">MediRoute Autonomous Protocol v2</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Access Email</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors">
                  <Mail size={22} />
                </div>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all placeholder:text-slate-200"
                  placeholder="name@provider.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Private Key</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors">
                  <Lock size={22} />
                </div>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all placeholder:text-slate-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 group"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <>Initiate Protocol <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" /></>}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm font-bold text-slate-400">
              New to the network? <Link to="/register" className="text-brand-primary hover:underline">Register Identity</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
