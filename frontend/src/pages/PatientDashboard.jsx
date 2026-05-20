import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Activity, Clock, Hospital, Navigation, Star, HeartPulse, Loader2, Filter, Zap, RefreshCw, Info, ExternalLink, Globe, AlertTriangle, Bed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { overpassService, hospitalService } from '../services/api';
import toast from 'react-hot-toast';

// Leaflet Imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom Icons
const hospitalIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const CITY_COORDS = {
    Chennai: { lat: 13.0827, lng: 80.2707 },
    Bangalore: { lat: 12.9716, lng: 77.5946 },
    Hyderabad: { lat: 17.3850, lng: 78.4867 },
    Mumbai: { lat: 19.0760, lng: 72.8777 },
    Delhi: { lat: 28.6139, lng: 77.2090 },
    Kolkata: { lat: 22.5726, lng: 88.3639 },
    Villupuram: { lat: 11.9401, lng: 79.4861 },
    Puducherry: { lat: 11.9416, lng: 79.8083 }
};

// Haversine Helper
function haversine(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return isNaN(distance) ? 999 : distance;
}

const MapUpdater = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo([coords.lat, coords.lng], 13);
        }
    }, [coords, map]);
    return null;
};

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coords, setCoords] = useState({ lat: 13.0827, lng: 80.2707 });
    const [liveLocation, setLiveLocation] = useState(null);
    const [radius, setRadius] = useState(5000);
    const [locStatus, setLocStatus] = useState('pending');
    const isFetchingRef = useRef(false);

    useEffect(() => {
        detectLocation();
    }, []);

    useEffect(() => {
        if (liveLocation) {
            fetchNearbyFacilities();
        }
    }, [coords, radius, liveLocation]);

    const detectLocation = () => {
        setLocStatus('detecting');
        if (!navigator.geolocation) {
            setLocStatus('unsupported');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setLiveLocation(newCoords);
                setCoords(newCoords);
                setLocStatus('pinpointed');
                console.log("[LIVE GPS]", newCoords);
            },
            (err) => {
                setLocStatus('denied');
                const fallback = { lat: 13.0827, lng: 80.2707 };
                setLiveLocation(fallback);
                setCoords(fallback);
            }
        );
    };

    const fetchNearbyFacilities = async () => {
        if (isFetchingRef.current || !liveLocation) return;
        isFetchingRef.current = true;
        setLoading(true);

        let dbHospitals = [];
        let osmHospitals = [];

        // 1. Fetch Registered DB Resources
        try {
            console.log("[RADIUS SELECTED]", radius);
            console.log("[USER LIVE LOCATION]", liveLocation);
            console.log("[API RADIUS SENT]", radius / 1000);

            const regRes = await hospitalService.getNearby(coords.lat, coords.lng, radius / 1000);
            console.log("[PATIENT API RAW]", regRes.data);
            const rawData = regRes?.data || [];
            dbHospitals = (Array.isArray(rawData) ? rawData : []).map(h => ({
                ...h,
                latitude: parseFloat(h.latitude || h.lat),
                longitude: parseFloat(h.longitude || h.lng),
                lat: parseFloat(h.lat || h.latitude),
                lng: parseFloat(h.lng || h.longitude),
                is_registered: true,
                source: 'DB'
            }));
            console.log("[LIVE DB RESOURCES LOADED]", dbHospitals);
        } catch (err) {
            console.warn("[SYNC ERROR] DB Fetch Failed", err);
        }

        // 2. Fetch OSM Data
        try {
            const osmData = await overpassService.fetchNearby(coords.lat, coords.lng, radius);
            console.log("[OSM DATA RECEIVED]", osmData);
            
            osmHospitals = (osmData?.elements || [])
                .map(el => {
                    if (!el) return null;
                    // Support both node (direct lat/lon) and way (center.lat/center.lon) formats
                    const lat = el.lat || (el.center && el.center.lat);
                    const lon = el.lon || el.lng || (el.center && (el.center.lon || el.center.lng));
                    
                    if (!lat || !lon) return null;
                    const tags = el.tags || {};
                    
                    return {
                        id: el.id ? `osm-${el.id}` : `osm-${Math.random()}`,
                        name: tags.name || tags["name:en"] || "Medical Center",
                        address: tags['addr:full'] || tags['addr:street'] || "Regional Sector",
                        latitude: parseFloat(lat),
                        longitude: parseFloat(lon),
                        lat: parseFloat(lat),
                        lng: parseFloat(lon),
                        is_registered: false,
                        source: 'OSM'
                    };
                })
                .filter(Boolean)
                .filter(h => h.latitude && h.longitude);
                
            console.log("[PARSED OSM FACILITIES]", osmHospitals);
        } catch (err) {
            console.error("[OSM ERROR]", err);
        }

        // 3. Strategic Merge: DB Values ALWAYS Win
        const mergedMap = new Map();

        // 1. Add DB hospitals first
        dbHospitals.forEach(h => {
            const key = h.name.toLowerCase().trim();
            mergedMap.set(key, h);
        });

        // 2. Add OSM hospitals with Duplicate Detection (Name + Proximity)
        osmHospitals.forEach(h => {
            const nameKey = h.name.toLowerCase().trim();

            // Check if this OSM node is already represented by a DB hospital
            let isDuplicate = mergedMap.has(nameKey);

            if (!isDuplicate) {
                // Proximity check: Is there a DB hospital within 300m?
                for (let dbH of dbHospitals) {
                    const d = haversine(
                        dbH.latitude || dbH.lat,
                        dbH.longitude || dbH.lng,
                        h.latitude || h.lat,
                        h.longitude || h.lng
                    );
                    if (d < 0.3) { // 300 meters
                        isDuplicate = true;
                        break;
                    }
                }
            }

            if (!isDuplicate) {
                mergedMap.set(nameKey, h);
            }
        });

        const finalHospitals = Array.from(mergedMap.values())
            .map(h => {
                // DISTANCE MUST ALWAYS BE FROM USER CURRENT LOCATION (GPS)
                const refLat = liveLocation?.lat || coords.lat;
                const refLng = liveLocation?.lng || coords.lng;
                const dist = haversine(
                    refLat,
                    refLng,
                    h.latitude || h.lat,
                    h.longitude || h.lng
                );

                const final = { ...h, distance: parseFloat(dist.toFixed(2)) };
                console.log("[DISTANCE DISPLAYED]", final.name, final.distance, "KM");
                return final;
            })
            .filter(h => {
                // STRICT RADIUS FILTERING BASED ON GPS DISTANCE
                const radiusKm = radius / 1000;
                return h.distance <= radiusKm;
            });

        finalHospitals.sort((a, b) => a.distance - b.distance);
        setHospitals(finalHospitals);
        setLoading(false);
        isFetchingRef.current = false;
    };

    const handleHospitalSelection = (h) => {
        navigate('/patient/emergency', {
            state: {
                hospitalId: h.id,
                hospitalName: h.name,
                isExternal: !h.is_registered,
                location: { lat: h.latitude, lng: h.longitude },
                address: h.address
            }
        });
    };

    const handleNavigation = (h) => {
        const origin = liveLocation ? `${liveLocation.lat},${liveLocation.lng}` : '';
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${h.latitude},${h.longitude}&travelmode=driving`;
        window.open(url, "_blank");
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-10 lg:p-14 text-white shadow-2xl">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-brand-primary/20 backdrop-blur-md px-4 py-2 rounded-full border border-brand-primary/30 text-[10px] font-black uppercase tracking-widest mb-8 text-brand-primary">
                            <Activity size={14} className="animate-pulse" />
                            Live Operational Intelligence
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
                            Hospital <span className="text-brand-primary">Radar.</span>
                        </h1>
                        <p className="text-slate-400 text-lg mb-10 font-medium max-w-lg leading-relaxed">
                            Real-time resource tracking and autonomous emergency routing.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate('/patient/emergency')}
                                className="bg-brand-primary hover:bg-sky-400 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center gap-3 shadow-xl active:scale-95 shadow-sky-500/20"
                            >
                                <HeartPulse size={24} /> Raise Emergency
                            </button>
                            <button
                                onClick={() => fetchNearbyFacilities()}
                                className="bg-slate-800 hover:bg-slate-700 text-white p-5 rounded-2xl transition-all active:scale-95 border border-slate-700"
                            >
                                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    <div className="relative h-[400px] rounded-[3rem] overflow-hidden border-4 border-slate-800 shadow-2xl">
                        {liveLocation && (
                            <MapContainer center={[coords.lat, coords.lng]} zoom={13} className="w-full h-full">
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <MapUpdater coords={coords} />
                                <Marker position={[liveLocation.lat, liveLocation.lng]} icon={userIcon}><Popup>You</Popup></Marker>
                                {hospitals.map(h => (
                                    <Marker key={h.id} position={[h.latitude, h.longitude]} icon={hospitalIcon}>
                                        <Popup><div className="p-2 font-bold">{h.name}</div></Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        )}
                        {loading && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000]"><Loader2 size={40} className="animate-spin text-brand-primary" /></div>}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-sky-100 pb-10">
                <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-[2rem] shadow-xl border border-sky-100">
                    <select
                        className="bg-sky-50 px-6 py-3 rounded-[1.5rem] font-bold text-sm outline-none text-sky-700 appearance-none cursor-pointer border border-sky-200"
                        onChange={(e) => CITY_COORDS[e.target.value] && setCoords(CITY_COORDS[e.target.value])}
                    >
                        <option value="">Switch Sector (City)</option>
                        {Object.keys(CITY_COORDS).map(city => <option key={city} value={city}>{city}</option>)}
                    </select>

                    <select
                        className="bg-sky-50 px-6 py-3 rounded-[1.5rem] font-bold text-sm outline-none text-sky-700 appearance-none cursor-pointer border border-sky-200"
                        value={radius}
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                    >
                        <option value={2000}>2 KM Radius</option>
                        <option value={5000}>5 KM Radius</option>
                        <option value={10000}>10 KM Radius</option>
                        <option value={25000}>25 KM Radius</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <AnimatePresence mode='popLayout'>
                    {hospitals.map((h, i) => {
                        const hasLiveResources =
                            h.is_registered === true ||
                            h.available_beds !== undefined ||
                            h.total_beds !== undefined ||
                            h.available_icu !== undefined ||
                            h.total_icu !== undefined;

                        return (
                            <motion.div
                                key={h.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`dashboard-card group p-8 hover:border-brand-primary/50 transition-all border-l-8 shadow-xl hover:shadow-2xl hover:shadow-brand-primary/5 ${h.is_registered ? 'border-l-emerald-500' : 'border-l-slate-300'}`}
                            >
                                <div className="flex flex-col gap-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl shadow-lg ${h.is_registered ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'}`}>
                                                <Hospital size={32} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 text-2xl group-hover:text-brand-primary transition-colors">{h.name}</h3>
                                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                                                    <MapPin size={14} className="text-brand-primary" /> {h.address}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-slate-900">{h.distance ?? h.distance_km}</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KM</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center group-hover:scale-105 transition-transform">
                                            <Bed size={20} className="text-emerald-500 mb-2" />
                                            <span className="text-xl font-black text-emerald-700">{h.available_beds ?? '--'} / {h.total_beds ?? '--'}</span>
                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Beds</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200 flex flex-col items-center group-hover:scale-105 transition-transform">
                                            <Activity size={20} className="text-violet-500 mb-2" />
                                            <span className="text-xl font-black text-violet-700">{h.available_icu ?? '--'} / {h.total_icu ?? '--'}</span>
                                            <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest">ICU</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col items-center group-hover:scale-105 transition-transform">
                                            <Navigation size={20} className="text-sky-500 mb-2" />
                                            <span className="text-xl font-black text-sky-700">{h.available_ambulances ?? '--'}</span>
                                            <span className="text-[9px] font-black text-sky-600 uppercase tracking-widest">Ambs</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center group-hover:scale-105 transition-transform">
                                            <Clock size={20} className="text-amber-500 mb-2" />
                                            <span className="text-xl font-black text-amber-700">{h.wait_time ?? '--'}m</span>
                                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Wait</span>
                                        </div>
                                    </div>

                                    {!hasLiveResources && (
                                        <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Info size={12} /> Live Resources Unavailable (External Node)
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-4 border-t border-sky-100">
                                        <button
                                            onClick={() => handleHospitalSelection(h)}
                                            className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-primary transition-all active:scale-95 shadow-xl"
                                        >
                                            <HeartPulse size={18} /> Select Routing
                                        </button>
                                        <button onClick={() => handleNavigation(h)} className="p-5 bg-white border-2 border-sky-200 rounded-2xl hover:bg-sky-50 transition-all text-sky-600"><Navigation size={20} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PatientDashboard;
