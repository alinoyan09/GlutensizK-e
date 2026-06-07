/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import { 
  ArrowLeft, Search, MapPin, Phone, Clock, ShieldCheck, 
  Sparkles, Layers, RefreshCw, X, Menu, Compass, Eye 
} from "lucide-react";
import { Cafe } from "../types";

interface MapPageProps {
  cafes: Cafe[];
  isLoading: boolean;
  onBack: () => void;
  onRefresh: () => void;
}

export default function MapPage({ cafes, isLoading, onBack, onRefresh }: MapPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("Hepsi");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Hepsi");
  const [activeCafe, setActiveCafe] = useState<Cafe | null>(null);
  
  // Mobile UI States
  const [mobileView, setMobileView] = useState<"map" | "list">("map");

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  // Get unique districts to display as quick tags
  const uniqueDistricts = useMemo(() => {
    const districts = cafes.map(c => c.district).filter(Boolean);
    return ["Hepsi", ...Array.from(new Set(districts))].slice(0, 15); // limit to first 15 for tag layout
  }, [cafes]);

  // Filter cafes based on all parameters
  const filteredCafes = useMemo(() => {
    return cafes.filter((cafe) => {
      const matchQuery = 
        cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cafe.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cafe.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchService = 
        selectedServiceType === "Hepsi" || 
        cafe.serviceType.toLowerCase().includes(selectedServiceType.toLowerCase()) ||
        (selectedServiceType === "Sadece Glutensiz" && cafe.serviceType.toLowerCase() === "sadece glutensiz");

      const matchDistrict =
        selectedDistrict === "Hepsi" ||
        cafe.district === selectedDistrict;

      return matchQuery && matchService && matchDistrict;
    });
  }, [cafes, searchQuery, selectedServiceType, selectedDistrict]);

  // Initialize and structure the Leaflet map instance
  useEffect(() => {
    if (!mapRef.current) return;

    // Create Leaflet Map instance
    const map = L.map(mapRef.current, {
      zoomControl: false // custom position underneath
    }).setView([39.0, 35.0], 6); // default zoom centered on Turkey
    
    mapInstanceRef.current = map;

    // Add CartoDB voyager beautiful modern tile theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap, © CartoDB'
    }).addTo(map);

    // Place zoom controls in top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update dynamic marker items whenever filtered dataset changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Delete existing markers
    (Object.values(markersRef.current) as L.Marker[]).forEach((marker) => {
      marker.remove();
    });
    markersRef.current = {};

    // Position markers for active/filtered cafes
    filteredCafes.forEach((cafe) => {
      if (!cafe.lat || !cafe.lng) return;

      // Premium glowing natural olive leaf pin
      const customPinHtml = `
        <div class="relative flex items-center justify-center" id="pin-${cafe.id}">
          <div class="absolute w-8 h-8 bg-natural-primary/35 rounded-full animate-ping"></div>
          <div class="relative w-8.5 h-8.5 bg-natural-primary border-2 border-white rounded-full flex items-center justify-center shadow-lg text-white transform hover:scale-110 hover:bg-natural-hover transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 8a13 13 0 0 1-13.8 10Z"/>
              <path d="M9 22v-4h4v4"/>
            </svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customPinHtml,
        className: "custom-leaflet-pin",
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
      });

      // Construct detailed graphic popup interface
      const popupHtml = `
        <div class="rounded-2xl overflow-hidden bg-natural-card max-w-[280px]">
          ${cafe.media ? `
            <div class="h-32 w-full overflow-hidden bg-natural-bg relative">
              <img src="${cafe.media}" class="w-full h-full object-cover" alt="${cafe.name}" referrerPolicy="no-referrer" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop'" />
              <div class="absolute top-2 right-2 bg-natural-primary/95 text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded shadow-sm">
                ${cafe.serviceType || 'Glutensiz'}
              </div>
            </div>
          ` : `
            <div class="h-16 w-full bg-natural-primary flex items-center justify-center text-white font-serif text-xl font-bold">
              🌿 Gastronomi Köşesi
            </div>
          `}
          <div class="p-4 leading-normal font-sans">
            <h3 class="font-serif font-bold text-sm text-natural-dark leading-tight mb-1">${cafe.name}</h3>
            <span class="inline-block bg-[#EBEBE3] text-natural-muted font-bold text-[9px] rounded px-2 py-0.5 mb-2">${cafe.district}</span>
            
            <div class="space-y-1.5 text-xs text-natural-text">
              <p class="flex items-start gap-1">
                <span class="text-natural-primary shrink-0 mt-0.5">📍</span>
                <span class="font-medium inline-block max-w-[220px] select-text">${cafe.address}</span>
              </p>
              ${cafe.phone && cafe.phone !== 'Yok' ? `
                <p class="flex items-center gap-1 font-bold text-natural-dark mt-2">
                  <span class="text-natural-primary">📞</span>
                  <a href="tel:${cafe.phone.replace(/[^0-9]/g, '')}" class="hover:underline text-natural-primary">${cafe.phone}</a>
                </p>
              ` : ''}
              ${cafe.workingHours ? `
                <p class="flex items-center gap-1 text-natural-muted text-[11px] mt-1 bg-white border border-natural-border px-2 py-1 rounded">
                  <span>🕒 Saatler:</span>
                  <span class="font-semibold">${cafe.workingHours}</span>
                </p>
              ` : ''}
              ${cafe.featuredProducts ? `
                <p class="text-natural-primary text-[11px] mt-1.5 font-bold bg-[#E2E8CE] px-2 py-1 rounded">
                  ✨ Öne Çıkan: ${cafe.featuredProducts}
                </p>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([cafe.lat, cafe.lng], { icon: customIcon }).addTo(map);

      // Add simple descriptive Tooltip on marker hover
      marker.bindTooltip(`
        <div class="text-center font-bold font-sans">
          <div class="text-xs text-white">${cafe.name}</div>
          <div class="text-[10px] text-natural-badge-bg mt-0.5">📍 ${cafe.district}</div>
        </div>
      `, {
        direction: "top",
        offset: [0, -40]
      });

      // Add complex detail Popup on click
      marker.bindPopup(popupHtml);

      // Sync active state in sidebar list when marker is clicked on physical map
      marker.on("click", () => {
        setActiveCafe(cafe);
      });

      markersRef.current[cafe.id] = marker;
    });

    // Auto fit viewport bounds containing all currently matching pins
    if (filteredCafes.length > 0) {
      const latLngs = filteredCafes.map(cafe => [cafe.lat, cafe.lng] as L.LatLngTuple);
      const bounds = L.latLngBounds(latLngs);
      
      // If single point, center on it. Else fly to boundary containing them, politely
      if (filteredCafes.length === 1) {
        map.setView(latLngs[0], 14);
      } else {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [filteredCafes]);

  // Click handler to select and navigate to a cafe marker
  const handleSelectCafe = (cafe: Cafe) => {
    setActiveCafe(cafe);
    
    // Switch view to map on mobile device
    setMobileView("map");

    const map = mapInstanceRef.current;
    if (map && cafe.lat && cafe.lng) {
      map.flyTo([cafe.lat, cafe.lng], 15, {
        animate: true,
        duration: 1.2
      });

      // Wait a fraction for flyTo to land, then display Leaflet's HTML popup
      setTimeout(() => {
        const marker = markersRef.current[cafe.id];
        if (marker) {
          marker.openPopup();
        }
      }, 1000);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-natural-bg font-sans overflow-hidden" id="map-page-main">
      {/* Upper Navigation Rail */}
      <header className="bg-white/90 backdrop-blur-md border-b border-natural-border px-6 py-3.5 flex items-center justify-between" id="map-header">
        <div className="flex items-center gap-4" id="map-header-left">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-natural-badge-bg/60 rounded-full text-natural-muted hover:text-natural-dark transition-all active:scale-95 cursor-pointer"
            id="back-home-btn"
            title="Geri Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div id="map-title-layout">
            <h1 className="font-serif font-extrabold text-lg text-natural-dark tracking-tight leading-none" id="map-main-title">Gastronomi & Harita Rehberi</h1>
            <p className="text-xs text-natural-muted font-medium mt-1 leading-none animate-pulse" id="map-sub-title">Aktif filtrelerle {filteredCafes.length} mekan listeleniyor</p>
          </div>
        </div>

        <div className="flex items-center gap-2" id="map-header-right">
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className={`p-2 bg-natural-card hover:bg-natural-badge-bg rounded-lg text-natural-primary hover:text-natural-dark transition-all select-none flex items-center gap-1.5 text-xs font-semibold border border-natural-border cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : 'active:scale-95'}`}
            id="refresh-data-btn"
            title="Sheets Verilerini Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Listeyi Yenile</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Swapper */}
      <div className="flex bg-white border-b border-natural-border md:hidden" id="mobile-views-swapper">
        <button 
          onClick={() => setMobileView("map")}
          className={`flex-1 py-3 text-sm font-bold border-b-2 text-center transition-all ${mobileView === "map" ? "border-natural-primary text-natural-primary bg-natural-badge-bg/20" : "border-transparent text-natural-muted"}`}
          id="mobile-tab-map"
        >
          🗺️ Harita Görünümü
        </button>
        <button 
          onClick={() => setMobileView("list")}
          className={`flex-1 py-3 text-sm font-bold border-b-2 text-center transition-all ${mobileView === "list" ? "border-natural-primary text-natural-primary bg-natural-badge-bg/20" : "border-transparent text-natural-muted"}`}
          id="mobile-tab-list"
        >
          📋 Mekan Listesi ({filteredCafes.length})
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative" id="map-body-layout">
        
        {/* Left Side: Sidebar Panel (Collapsible / Mobile responsive) */}
        <aside 
          className={`w-full md:w-96 md:max-w-md bg-white border-r border-natural-border flex flex-col shrink-0 overflow-hidden z-10 transition-all duration-300 md:flex ${
            mobileView === "list" ? "block absolute inset-0 bg-white" : "hidden"
          }`}
          id="sidebar-panel"
        >
          {/* Searching and filtering stack */}
          <div className="p-4 border-b border-natural-border space-y-3 shrink-0" id="sidebar-filters">
            {/* Direct Search Bar */}
            <div className="relative" id="search-input-box">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-natural-muted w-4 h-4" />
              <input 
                type="text"
                placeholder="Mekan, sokak veya ilçe ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-natural-card border border-natural-border focus:border-natural-primary focus:ring-2 focus:ring-natural-primary/20 pl-10 pr-9 py-2.5 rounded-full text-sm font-medium text-natural-text transition-all outline-none"
                id="search-input-field"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-natural-muted hover:text-natural-dark transition-colors p-0.5 hover:bg-[#EBEBE3] rounded-full"
                  id="search-clear-btn"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Service Type Tab Filters */}
            <div className="grid grid-cols-3 gap-1 bg-natural-bg p-1 rounded-xl text-center" id="service-type-tabs">
              {[
                { label: "Hepsi", val: "Hepsi" },
                { label: "Yalnız G.S.", val: "Sadece Glutensiz" },
                { label: "Seçenekli", val: "Glutensiz Seçenekler" }
              ].map((tab) => (
                <button
                  key={tab.val}
                  onClick={() => setSelectedServiceType(tab.val)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedServiceType === tab.val 
                      ? "bg-natural-card text-natural-dark border border-natural-border shadow-sm" 
                      : "text-natural-muted hover:text-natural-dark"
                  }`}
                  id={`service-tab-${tab.val.replace(/\s+/g, '-')}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick District Picker Banner */}
            <div className="overflow-x-auto pb-1" id="district-banner">
              <div className="flex gap-1.5 whitespace-nowrap" id="district-chips-container">
                {uniqueDistricts.map((dist) => (
                  <button
                    key={dist}
                    onClick={() => setSelectedDistrict(dist)}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-all border cursor-pointer ${
                      selectedDistrict === dist
                        ? "bg-natural-primary text-white border-natural-primary shadow-sm"
                        : "bg-natural-card text-natural-muted border-natural-border hover:border-[#C0C0B0]"
                    }`}
                    id={`district-chip-${dist.replace(/\s+/g, '-')}`}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Core Cafe List Scroller */}
          <div className="flex-1 overflow-y-auto divide-y divide-natural-border p-2 space-y-2.5 bg-natural-bg/30" id="cafes-cards-list">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3" id="loading-placeholder">
                <RefreshCw className="w-8 h-8 text-natural-primary animate-spin" />
                <p className="text-sm font-semibold text-natural-muted">Mekanlar yükleniyor...</p>
              </div>
            ) : filteredCafes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center" id="no-results-placeholder">
                <div className="w-16 h-16 bg-[#EBEBE3] rounded-full flex items-center justify-center mb-4 text-2xl">
                  🌾
                </div>
                <h3 className="font-serif font-extrabold text-sm text-natural-dark">Mekan Bulunamadı</h3>
                <p className="text-xs text-natural-muted mt-1 max-w-[200px]">Filtrelerinizi temizleyerek tekrar aramayı deneyebilirsiniz.</p>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedServiceType("Hepsi");
                    setSelectedDistrict("Hepsi");
                  }}
                  className="mt-4 bg-natural-badge-bg text-natural-badge-text font-bold text-xs px-4 py-2 rounded-full border border-natural-border hover:bg-[#D4DCA9] transition-all cursor-pointer"
                  id="reset-filters-btn"
                >
                  Tüm Filtreleri Sıfırla
                </button>
              </div>
            ) : (
              filteredCafes.map((cafe) => {
                const isActive = activeCafe?.id === cafe.id;
                const isOnlyGlutenFree = cafe.serviceType.toLowerCase() === "sadece glutensiz";

                return (
                  <div 
                    key={cafe.id}
                    onClick={() => handleSelectCafe(cafe)}
                    className={`group bg-white border rounded-2xl p-3 text-left transition-all duration-300 cursor-pointer flex gap-3 select-none ${
                      isActive 
                        ? "border-natural-primary ring-2 ring-natural-primary/10 shadow-md bg-natural-badge-bg/20" 
                        : "border-natural-border hover:border-[#B0B0A0] hover:shadow-sm hover:bg-natural-card"
                    }`}
                    id={`cafe-item-${cafe.id}`}
                  >
                    {/* Visual Media Block */}
                    <div className="w-20 h-20 rounded-xl bg-natural-bg overflow-hidden shrink-0 relative" id={`cafe-img-container-${cafe.id}`}>
                      {cafe.media ? (
                        <img 
                          src={cafe.media} 
                          alt={cafe.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            // fallback on load error safely
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl bg-natural-badge-bg text-natural-primary font-bold">
                          🌾
                        </div>
                      )}
                      
                      {/* Only Gluten free badge */}
                      <span className={`absolute top-1 left-1 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm text-white ${isOnlyGlutenFree ? 'bg-natural-primary/95' : 'bg-natural-muted/95'}`}>
                        {isOnlyGlutenFree ? "Sadece G.S." : "Seçenekli"}
                      </span>
                    </div>

                    {/* Meta stack */}
                    <div className="flex-1 min-w-0" id={`cafe-info-stack-${cafe.id}`}>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h4 className="font-serif font-extrabold text-sm text-natural-dark group-hover:text-natural-primary transition-colors leading-tight truncate">
                          {cafe.name}
                        </h4>
                      </div>
                      <span className="inline-block bg-[#EBEBE3] text-natural-muted text-[9px] font-bold px-1.5 py-0.5 rounded mb-1.5">
                        📍 {cafe.district}
                      </span>
                      
                      {cafe.featuredProducts && (
                        <p className="text-[10px] text-natural-badge-text font-bold truncate bg-natural-badge-bg px-1.5 py-0.5 rounded inline-block max-w-full">
                          ✨ {cafe.featuredProducts}
                        </p>
                      )}

                      <p className="text-[10px] text-natural-muted truncate mt-1 leading-normal">
                        {cafe.address}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Side: Map Canvas Container (Always rendered) */}
        <main 
          className={`flex-1 h-full relative ${
            mobileView === "list" ? "hidden md:block" : "block"
          }`}
          id="map-canvas-container"
        >
          {/* Geolocation status disclaimer indicator */}
          <div className="absolute top-4 left-4 z-[9] bg-natural-card/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-natural-border flex items-center gap-1.5 text-[11px] font-bold text-natural-muted shadow-sm pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-natural-primary animate-pulse"></span>
            <span>OpenStreetMap Canlı</span>
          </div>

          <div 
            ref={mapRef} 
            className="w-full h-full z-0 outline-none" 
            id="map-view-canvas"
          />
        </main>
      </div>
    </div>
  );
}
