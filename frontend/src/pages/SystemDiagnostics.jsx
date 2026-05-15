import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Globe, Database, User, AlertTriangle, CheckCircle2, Loader2, Server } from 'lucide-react';
import { authService, hospitalService } from '../services/api';

const SystemDiagnostics = () => {
    const [results, setResults] = useState({
        backend: { status: 'testing', data: null },
        health: { status: 'testing', data: null },
        hospitals: { status: 'testing', data: null },
        auth: { status: 'testing', data: null },
    });

    const [envInfo, setEnvInfo] = useState({
        baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
        browser: navigator.userAgent,
        timestamp: new Date().toISOString()
    });

    const [userState, setUserState] = useState(null);

    useEffect(() => {
        runDiagnostics();
    }, []);

    const runDiagnostics = async () => {
        // 1. Check reachability / Health
        try {
            const hRes = await authService.checkHealth();
            setResults(prev => ({ 
                ...prev, 
                backend: { status: 'pass', data: 'Reachable' },
                health: { status: 'pass', data: hRes.data } 
            }));
        } catch (err) {
            setResults(prev => ({ 
                ...prev, 
                backend: { status: 'fail', data: err.message },
                health: { status: 'fail', data: 'Endpoint unreachable' } 
            }));
        }

        // 2. Check Hospitals API
        try {
            const hospRes = await hospitalService.getNearby(13.0827, 80.2707, 50);
            setResults(prev => ({ ...prev, hospitals: { status: 'pass', data: `${hospRes.data.length} hospitals found` } }));
        } catch (err) {
            setResults(prev => ({ ...prev, hospitals: { status: 'fail', data: err.message } }));
        }

        // 3. User State
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const meRes = await authService.getMe();
                setResults(prev => ({ ...prev, auth: { status: 'pass', data: `Logged in as ${meRes.data.full_name}` } }));
                setUserState(meRes.data);
            } catch (err) {
                setResults(prev => ({ ...prev, auth: { status: 'fail', data: 'Token invalid or failed' } }));
            }
        } else {
            setResults(prev => ({ ...prev, auth: { status: 'warn', data: 'No session token found' } }));
        }
    };

    const StatusBadge = ({ state }) => {
        if (state === 'testing') return <Loader2 size={20} className="animate-spin text-slate-400" />;
        if (state === 'pass') return <CheckCircle2 size={20} className="text-emerald-500" />;
        if (state === 'fail') return <AlertTriangle size={20} className="text-rose-500" />;
        return <AlertTriangle size={20} className="text-amber-500" />;
    };

    return (
        <div className="max-w-4xl mx-auto py-20 px-6 space-y-12 animate-in fade-in duration-700">
            <div className="flex items-center gap-6 mb-12">
                <div className="p-5 bg-slate-900 text-white rounded-[2rem] shadow-2xl">
                    <ShieldCheck size={40} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">System Diagnostics</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">MediRoute AI Connection Analyzer</p>
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="ml-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                    Re-Run Tests
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Connection Matrix */}
                <div className="dashboard-card p-10 space-y-8">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <Globe size={24} className="text-brand-primary" />
                        Connectivity Matrix
                    </h3>
                    <div className="space-y-6">
                        {[
                            { label: 'Backend Reachability', state: results.backend.status, desc: results.backend.data },
                            { label: 'Health Endpoint (/health)', state: results.health.status, desc: JSON.stringify(results.health.data) },
                            { label: 'Nearby Hospitals API', state: results.hospitals.status, desc: results.hospitals.data },
                            { label: 'Auth Middleware', state: results.auth.status, desc: results.auth.data }
                        ].map((test, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="font-black text-sm text-slate-800">{test.label}</p>
                                    <p className="text-[10px] font-bold text-slate-400 truncate max-w-[200px]">{test.desc}</p>
                                </div>
                                <StatusBadge state={test.state} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Configuration */}
                <div className="dashboard-card p-10 space-y-8 bg-slate-900 text-white">
                    <h3 className="text-xl font-black flex items-center gap-3">
                        <Server size={24} className="text-brand-primary" />
                        Core Configuration
                    </h3>
                    <div className="space-y-6">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Mapped Base URL</p>
                            <code className="text-brand-primary font-black text-sm">{envInfo.baseURL}</code>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Local Auth ID</p>
                            <code className="text-sky-300 font-bold text-xs">{localStorage.getItem('user_id') || 'Null'}</code>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            {results.backend.status === 'fail' && (
                <div className="p-10 bg-rose-50 border-4 border-rose-100 rounded-[3rem] space-y-4">
                    <div className="flex items-center gap-4 text-rose-600">
                        <AlertTriangle size={32} />
                        <h4 className="text-2xl font-black">Critical: Backend Unreachable</h4>
                    </div>
                    <ul className="list-disc list-inside text-rose-800/70 font-medium space-y-2 ml-4">
                        <li>Ensure the FastAPI server is running (main.py) on port 8000.</li>
                        <li>Check if your firewall is blocking port 8000.</li>
                        <li>Verify that CORS allowed origins match your browser URL.</li>
                        <li>Check if VITE_API_BASE_URL is pointing to 127.0.0.1 or localhost (mismatch causes errors).</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SystemDiagnostics;
