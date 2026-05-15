import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Activity, MapPin, Truck, 
  ArrowRight, HeartPulse, Globe, Zap, Hospital,
  BarChart3, Users, ClipboardCheck, Timer
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-brand-primary/20">
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 h-24 bg-white/80 backdrop-blur-xl z-[100] border-b border-slate-100 px-6 lg:px-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-brand-primary p-2.5 rounded-2xl shadow-lg shadow-sky-500/20">
                        <Activity size={28} className="text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tight">MediRoute<span className="text-brand-primary">AI</span></span>
                </div>
                <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <button onClick={() => scrollToSection('technology')} className="hover:text-brand-primary transition-colors">Technology</button>
                    <button onClick={() => scrollToSection('workflow')} className="hover:text-brand-primary transition-colors">How it Works</button>
                    <button onClick={() => scrollToSection('network')} className="hover:text-brand-primary transition-colors">Network</button>
                    <button onClick={() => scrollToSection('impact')} className="hover:text-brand-primary transition-colors">Impact</button>
                    <button 
                        onClick={() => navigate('/login')}
                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95"
                    >
                        Access Portal
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-48 pb-32 px-6 lg:px-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 bg-sky-50 text-brand-primary px-6 py-2.5 rounded-full border border-sky-100 text-xs font-black uppercase tracking-[0.3em] mb-10"
                    >
                        <Zap size={14} className="animate-pulse" />
                        Next-gen Emergency Protocol
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl lg:text-9xl font-black leading-[0.9] tracking-tighter mb-12"
                    >
                        TIME SAVED IS <br/><span className="text-transparent bg-clip-text bg-gradient-to-tr from-brand-primary to-indigo-600">LIFE SAVED.</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto text-xl text-slate-500 font-medium leading-relaxed mb-16"
                    >
                        MediRoute AI calculates hospital capacity, doctor availability, and traffic in milliseconds to route you to the best possible care instantly.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <button 
                            onClick={() => navigate('/register')}
                            className="w-full sm:w-80 py-6 bg-brand-primary text-white rounded-[2.25rem] font-black text-xl shadow-2xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                        >
                            Get Protected Now
                            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                        <button 
                            onClick={() => scrollToSection('workflow')}
                            className="w-full sm:w-80 py-6 bg-slate-100 text-slate-600 rounded-[2.25rem] font-black text-xl hover:bg-slate-200 transition-all"
                        >
                            Explore Protocol
                        </button>
                    </motion.div>
                </div>

                {/* Animated Background Elements */}
                <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 -ml-48"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -mr-48"></div>
            </section>

            {/* Feature Grid */}
            <section id="technology" className="py-32 bg-slate-50 px-6 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-6">Cutting-edge <span className="text-brand-primary">Healthcare Tech.</span></h2>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto">The infrastructure that powers sub-second emergency routing.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: MapPin, title: "Real-time Radar", desc: "Live geolocation of every hospital node within the network." },
                            { icon: Activity, title: "Resource Tracking", desc: "Minute-by-minute updates on bed and ICU availability." },
                            { icon: ClipboardCheck, title: "Emergency Queue", desc: "Direct sync between patient submission and hospital intake." },
                            { icon: ShieldCheck, title: "AI Triage Support", desc: "Autonomous severity analysis for faster dispatch." }
                        ].map((f, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-105 transition-all"
                            >
                                <div className="bg-brand-primary/10 text-brand-primary p-4 rounded-2xl w-fit mb-8">
                                    <f.icon size={28} />
                                </div>
                                <h4 className="text-xl font-black mb-4">{f.title}</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section id="workflow" className="py-32 px-6 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <div className="lg:w-1/2">
                            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-10 leading-tight">
                                How it <br/><span className="text-brand-primary">Works.</span>
                            </h2>
                            <div className="space-y-12">
                                {[
                                    { step: "01", title: "Detect Location", desc: "System pinpoints your exact coordinates instantly." },
                                    { step: "02", title: "Find Hospitals", desc: "Algorithms scan for nearby facilities with live capacity." },
                                    { step: "03", title: "Select Routing", desc: "Choose the best path based on urgency and distance." },
                                    { step: "04", title: "Hospital Alert", desc: "The facility receives your data before you even arrive." }
                                ].map((s, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="flex gap-8"
                                    >
                                        <div className="text-2xl font-black text-brand-primary/20">{s.step}</div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black">{s.title}</h4>
                                            <p className="text-slate-500 font-medium">{s.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="bg-slate-900 rounded-[4rem] p-12 shadow-2xl relative z-10 rotate-3 overflow-hidden">
                                <div className="absolute top-0 right-0 p-8">
                                    <Activity className="text-brand-primary animate-pulse" size={48} />
                                </div>
                                <div className="space-y-8">
                                    <div className="h-6 w-1/2 bg-white/10 rounded-full"></div>
                                    <div className="h-32 bg-brand-primary/20 rounded-[2.5rem] animate-pulse"></div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="h-24 bg-white/5 rounded-3xl"></div>
                                        <div className="h-24 bg-white/5 rounded-3xl"></div>
                                    </div>
                                    <div className="h-16 w-full bg-brand-primary rounded-2xl"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section id="impact" className="py-32 bg-slate-900 text-white px-6 lg:px-20 overflow-hidden relative">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl lg:text-7xl font-black tracking-tighter mb-8">Measurable <span className="text-brand-primary">Impact.</span></h2>
                        <p className="text-slate-400 font-medium max-w-2xl mx-auto text-lg">Real data showing how MediRoute AI is transforming emergency care.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: Timer, title: "42% Faster", desc: "Average reduction in hospital routing time." },
                            { icon: Users, title: "1.2k Daily", desc: "Lives rerouted through our intelligent network." },
                            { icon: BarChart3, title: "100%", desc: "Live capacity visibility for all connected nodes." }
                        ].map((s, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="text-center p-12 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-sm"
                            >
                                <div className="bg-brand-primary p-5 rounded-3xl w-fit mx-auto mb-8 shadow-xl shadow-sky-500/20">
                                    <s.icon size={32} />
                                </div>
                                <h4 className="text-4xl font-black mb-4">{s.title}</h4>
                                <p className="text-slate-400 font-medium">{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent"></div>
            </section>

            {/* Network Section */}
            <section id="network" className="py-32 px-6 lg:px-20 text-center">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-12"
                    >
                        <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight">
                            Join the <br/><span className="text-brand-primary">Network.</span>
                        </h2>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed">
                            Whether you're a hospital administrator looking to optimize your emergency queue or a patient seeking the best care, MediRoute AI is your operational core.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button onClick={() => navigate('/register')} className="bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black text-xl hover:bg-black transition-all shadow-2xl active:scale-95">Register Facility</button>
                            <button onClick={() => navigate('/register')} className="bg-brand-primary text-white px-12 py-6 rounded-[2rem] font-black text-xl hover:bg-sky-400 transition-all shadow-2xl active:scale-95">Register as Patient</button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-24 px-6 lg:px-20 border-t border-slate-100 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                        <div className="col-span-1 lg:col-span-2 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="bg-brand-primary p-2 rounded-xl">
                                    <Activity className="text-white" size={24} />
                                </div>
                                <span className="text-2xl font-black tracking-tight">MediRoute<span className="text-brand-primary">AI</span></span>
                            </div>
                            <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
                                AI-powered emergency healthcare routing platform designed to save lives through sub-second resource intelligence.
                            </p>
                            <div className="pt-4">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Developed by</p>
                                <p className="text-lg font-black text-slate-900">Swetha R</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-8">Platform</h4>
                            <ul className="space-y-4 text-slate-500 font-bold text-sm">
                                <li><button onClick={() => scrollToSection('technology')} className="hover:text-brand-primary transition-colors">Technology</button></li>
                                <li><button onClick={() => scrollToSection('workflow')} className="hover:text-brand-primary transition-colors">Protocol</button></li>
                                <li><button onClick={() => scrollToSection('network')} className="hover:text-brand-primary transition-colors">Network</button></li>
                                <li><button onClick={() => navigate('/login')} className="hover:text-brand-primary transition-colors">Login</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-8">Legal</h4>
                            <ul className="space-y-4 text-slate-500 font-bold text-sm">
                                <li><Link to="/" className="hover:text-brand-primary transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/" className="hover:text-brand-primary transition-colors">Terms of Service</Link></li>
                                <li><Link to="/" className="hover:text-brand-primary transition-colors">Safety Standard</Link></li>
                                <li><Link to="/" className="hover:text-brand-primary transition-colors">Contact Support</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">&copy; 2026 MediRoute AI. All Rights Reserved.</p>
                        <p className="text-slate-900 text-xs font-black uppercase tracking-[0.2em]">Built by <span className="text-brand-primary underline decoration-2 underline-offset-4">Swetha R</span></p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
