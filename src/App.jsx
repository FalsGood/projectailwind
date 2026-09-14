import React, { useState, useEffect } from 'react';

// Daftar Koordinat Kota Indonesia
const CITIES = {
  jakarta: { name: "Jakarta", lat: -6.2088, lon: 106.8456, zone: "WIB (UTC+7)" },
  bandung: { name: "Bandung", lat: -6.9175, lon: 107.6191, zone: "WIB (UTC+7)" },
  surabaya: { name: "Surabaya", lat: -7.2575, lon: 112.7521, zone: "WIB (UTC+7)" },
  denpasar: { name: "Denpasar, Bali", lat: -8.6705, lon: 115.2126, zone: "WITA (UTC+8)" },
  makassar: { name: "Makassar", lat: -5.1477, lon: 119.4327, zone: "WITA (UTC+8)" },
  jayapura: { name: "Jayapura", lat: -2.5489, lon: 140.7181, zone: "WIT (UTC+9)" },
  medan: { name: "Medan", lat: 3.5952, lon: 98.6722, zone: "WIB (UTC+7)" }
};

// Map Kode Cuaca WMO
const getWeatherInfo = (code) => {
  if (code === 0) return { text: "Cerah", icon: "☀️" };
  if (code >= 1 && code <= 3) return { text: "Cerah Berawan", icon: "⛅" };
  if (code >= 45 && code <= 48) return { text: "Kabut", icon: "🌫️" };
  if (code >= 51 && code <= 67) return { text: "Hujan Ringan", icon: "🌧️" };
  if (code >= 80 && code <= 82) return { text: "Hujan Lebat", icon: "⛈️" };
  if (code >= 95) return { text: "Hujan Badai", icon: "🌩️" };
  return { text: "Berawan", icon: "🌦️" };
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCityKey, setSelectedCityKey] = useState('jakarta');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [times, setTimes] = useState({ wib: '', wita: '', wit: '', dateWib: '', dateWita: '', dateWit: '' });

  // Real-time Clock Effect
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      const optionsDate = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

      const wib = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      const wita = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Makassar" }));
      const wit = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jayapura" }));

      setTimes({
        wib: wib.toLocaleTimeString('id-ID', { hour12: false }),
        wita: wita.toLocaleTimeString('id-ID', { hour12: false }),
        wit: wit.toLocaleTimeString('id-ID', { hour12: false }),
        dateWib: wib.toLocaleDateString('id-ID', optionsDate),
        dateWita: wita.toLocaleDateString('id-ID', optionsDate),
        dateWit: wit.toLocaleDateString('id-ID', optionsDate),
      });
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Live Weather Data
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      const city = CITIES[selectedCityKey];
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const data = await res.json();
        setWeatherData(data);
      } catch (err) {
        console.error("Gagal mengambil data cuaca:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [selectedCityKey]);

  const currentCity = CITIES[selectedCityKey];
  const currentWeather = weatherData?.current;
  const dailyWeather = weatherData?.daily;
  const currentCondition = currentWeather ? getWeatherInfo(currentWeather.weather_code) : { text: "-", icon: "🌡️" };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false); // Tutup menu HP otomatis saat tab diklik
  };

  return (
    <div className="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen flex flex-col pt-16">
      
      {/* Navbar Responsif */}
      <nav className="fixed top-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => handleTabChange('dashboard')}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-xl flex items-center justify-center font-extrabold text-white shadow-lg shadow-sky-500/20 text-sm sm:text-base">
              ⛅
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              NusantaraCast
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-sm font-medium">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`px-4 py-1.5 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleTabChange('pencarian')}
              className={`px-4 py-1.5 rounded-lg transition ${activeTab === 'pencarian' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Prakiraan Cuaca Live
            </button>
          </div>

          {/* Hamburger Button untuk HP */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2 text-sm font-medium">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`block w-full text-left px-3 py-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300'}`}
            >
              Dashboard Jam & Zona Waktu
            </button>
            <button
              onClick={() => handleTabChange('pencarian')}
              className={`block w-full text-left px-3 py-2 rounded-lg ${activeTab === 'pencarian' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300'}`}
            >
              Prakiraan Cuaca BMKG Live
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8">
            <section className="relative rounded-2xl sm:rounded-3xl py-8 sm:py-10 px-4 sm:px-6 bg-slate-900 border border-slate-800 text-center max-w-4xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-sky-400 text-[11px] sm:text-xs font-semibold mb-3 sm:mb-4">
                🇮🇩 Real-Time Clock Indonesia
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white mb-6 tracking-tight">
                Monitoring Waktu & Cuaca
              </h1>

              {/* Grid Responsif (1 kolom di HP, 3 kolom di Desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
                <ClockCard title="WIB (UTC+7)" tag="Barat" tagColor="text-sky-400" time={times.wib} date={times.dateWib} />
                <ClockCard title="WITA (UTC+8)" tag="Tengah" tagColor="text-amber-400" time={times.wita} date={times.dateWita} />
                <ClockCard title="WIT (UTC+9)" tag="Timur" tagColor="text-emerald-400" time={times.wit} date={times.dateWit} />
              </div>
            </section>
          </div>
        )}

        {/* PRAKIRAAN CUACA BMKG TAB */}
        {activeTab === 'pencarian' && (
          <div className="space-y-6 sm:space-y-8">
            
            {/* Control Panel */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Pilih Lokasi Wilayah</h2>
                <p className="text-slate-400 text-xs mt-0.5">Data prakiraan BMKG / Open-Meteo API</p>
              </div>
              
              <select
                value={selectedCityKey}
                onChange={(e) => setSelectedCityKey(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-sky-500 font-medium w-full sm:w-auto"
              >
                {Object.keys(CITIES).map((key) => (
                  <option key={key} value={key}>{CITIES[key].name} ({CITIES[key].zone})</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="text-center py-16 text-slate-400 font-mono text-xs sm:text-sm animate-pulse">
                ⏳ Mengambil data cuaca terkini...
              </div>
            ) : (
              <>
                {/* Cuaca Saat Ini */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold text-sky-400 uppercase tracking-widest">{currentCity.zone}</span>
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-0.5">{currentCity.name}</h1>
                      <p className="text-slate-400 text-xs sm:text-sm mt-1">Kondisi: <strong className="text-white">{currentCondition.text}</strong></p>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="text-5xl sm:text-6xl">{currentCondition.icon}</span>
                      <span className="text-4xl sm:text-5xl font-black text-white">{currentWeather?.temperature_2m}°C</span>
                    </div>
                  </div>

                  {/* Grid Metric Responsif */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
                    <MetricCard label="Kelembapan" value={`${currentWeather?.relative_humidity_2m}%`} />
                    <MetricCard label="Kecepatan Angin" value={`${currentWeather?.wind_speed_10m} km/h`} />
                    <MetricCard label="Sumber Data" value="BMKG / Open-Meteo" valueColor="text-sky-400" />
                  </div>
                </div>

                {/* Prakiraan 5 Hari (Scrollable horizontal di layar HP sangat kecil) */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">📅 Prakiraan 5 Hari Ke Depan</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    {dailyWeather?.time?.slice(0, 5).map((dateStr, index) => {
                      const info = getWeatherInfo(dailyWeather.weather_code[index]);
                      const dateObj = new Date(dateStr);
                      const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

                      return (
                        <div key={dateStr} className="bg-slate-950 border border-slate-800 p-3.5 sm:p-4 rounded-xl text-center flex flex-col justify-between">
                          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 block mb-1">{dayName}</span>
                          <span className="text-3xl sm:text-4xl my-1 sm:my-2 block">{info.icon}</span>
                          <span className="text-[11px] sm:text-xs font-medium text-slate-300 block mb-2">{info.text}</span>
                          <div className="text-[11px] sm:text-xs font-bold text-white pt-2 border-t border-slate-800/80">
                            <span className="text-sky-400">{dailyWeather.temperature_2m_min[index]}°C</span> - <span className="text-amber-400">{dailyWeather.temperature_2m_max[index]}°C</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

          </div>
        )}

      </main>

      <footer className="bg-slate-950 border-t border-slate-900 text-slate-500 text-center py-4 sm:py-6 text-[11px] sm:text-xs mt-auto">
        <p>&copy; 2026 NusantaraCast. Weather data powered by Open-Meteo & BMKG Standard.</p>
      </footer>
    </div>
  );
}

// Sub Components
function ClockCard({ title, tag, tagColor, time, date }) {
  return (
    <div className="bg-slate-950 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-xs font-bold ${tagColor}`}>{title}</span>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{tag}</span>
      </div>
      <div className="text-3xl sm:text-4xl font-mono font-extrabold text-white">{time || '00:00:00'}</div>
      <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2">{date || 'Menghubungkan...'}</p>
    </div>
  );
}

function MetricCard({ label, value, valueColor = "text-white" }) {
  return (
    <div className="bg-slate-950 border border-slate-800/80 p-3 sm:p-4 rounded-xl text-center">
      <span className="text-[10px] sm:text-xs text-slate-500 block mb-0.5 sm:mb-1">{label}</span>
      <span className={`text-sm sm:text-lg font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}