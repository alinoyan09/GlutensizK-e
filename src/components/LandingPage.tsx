/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { MapPin, ShieldCheck, UtensilsCrossed, Sparkles, Navigation, Info } from "lucide-react";

interface LandingPageProps {
  onExplore: () => void;
  cafeCount: number;
}

export default function LandingPage({ onExplore, cafeCount }: LandingPageProps) {
  // Let's create visual highlight points
  const features = [
    {
      icon: <MapPin className="w-6 h-6 text-natural-primary" id="feature-icon-1" />,
      title: "Konum Tabanlı Arama",
      description: "Türkiye'deki glutensiz kafeleri, fırınları ve restaurantları haritada canlı olarak bulun."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-natural-primary" id="feature-icon-2" />,
      title: "Detaylı Güvenlik Bilgisi",
      description: "Sadece glutensiz hizmet sunan mekanları ve glutensiz seçenekleri olan spotları ayırt edin."
    },
    {
      icon: <UtensilsCrossed className="w-6 h-6 text-natural-primary" id="feature-icon-3" />,
      title: "Öne Çıkan Lezzetler",
      description: "Glutensiz simit, poğaça, pasta gibi mekanların öne çıkan lezzetlerini tek tıkla görün."
    }
  ];

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text flex flex-col justify-between overflow-x-hidden font-sans" id="landing-container">
      {/* Header */}
      <header className="border-b border-natural-border bg-white/85 backdrop-blur-md sticky top-0 z-50 px-6 py-4" id="landing-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between" id="landing-header-wrapper">
          <div className="flex items-center gap-2.5" id="landing-logo">
            <div className="p-2 bg-natural-badge-bg rounded-xl text-natural-primary" id="logo-icon-container">
              <UtensilsCrossed className="w-6 h-6" id="logo-icon" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-extrabold text-2xl tracking-tight text-natural-primary" id="logo-text-brand">Glutensiz</span>
              <span className="font-semibold text-natural-badge-text text-xs bg-natural-badge-bg px-2 py-0.5 rounded-full" id="logo-text-sub">Köşe</span>
            </div>
          </div>
          <button 
            onClick={onExplore}
            className="flex items-center gap-2 bg-natural-primary hover:bg-natural-hover text-white font-semibold px-5 py-2.5 rounded-full shadow-sm transition-all h-10 hover:shadow-md active:scale-95 cursor-pointer"
            id="header-explore-btn"
          >
            <Navigation className="w-4 h-4 fill-white" />
            <span>Haritayı Aç</span>
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center" id="landing-main">
        {/* Left Side: Text and CTA */}
        <div className="lg:col-span-7 flex flex-col items-start text-left" id="landing-text-section">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-natural-badge-bg border border-[#D0D0C0] text-natural-badge-text rounded-full px-4 py-1.5 text-sm font-semibold mb-6 shadow-sm"
            id="landing-announcement"
          >
            <Sparkles className="w-4 h-4 text-natural-primary animate-pulse" />
            <span>Türkiye'nin İlk Dinamik Glutensiz Rehberi</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold tracking-tight text-natural-dark leading-[1.1] mb-6"
            id="landing-headline"
          >
            Türkiye'deki Glutensiz Kafeleri <br className="hidden sm:inline" />
            <span className="text-natural-primary relative inline">
              Haritada Keşfedin
              <span className="absolute bottom-1 left-0 w-full h-2 bg-natural-badge-bg -z-10 rounded-full"></span>
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-natural-muted mb-8 max-w-xl leading-relaxed font-sans"
            id="landing-subhead"
          >
            Çölyak hastaları ve glutensiz beslenenler için özenle derlenmiş, fotoğraflı, telefonlu ve detaylı çalışma saatlerine sahip interaktif Türkiye haritası.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            id="landing-cta-group"
          >
            <button 
              onClick={onExplore}
              className="flex items-center justify-center gap-3 bg-natural-primary hover:bg-natural-hover text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:shadow-natural-primary/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all select-none cursor-pointer"
              id="landing-primary-cta"
            >
              <Navigation className="w-5 h-5 fill-white" />
              <span>Haritayı Keşfetmeye Başla</span>
            </button>
            <div 
              className="flex items-center justify-center gap-2 text-natural-muted bg-white border border-natural-border font-semibold px-6 py-4 rounded-full"
              id="landing-stats-badge"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-605 animate-ping" style={{ backgroundColor: "#5A5A40" }}></span>
              <span className="font-extrabold text-natural-dark">{cafeCount > 0 ? cafeCount : "100+"}</span>
              <span>Kayıtlı Glutensiz Mekan</span>
            </div>
          </motion.div>

          {/* Quick info row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex items-center gap-4 mt-12 bg-white/60 border border-natural-border rounded-2xl p-4 max-w-lg shadow-sm"
            id="landing-disclaimer-box"
          >
            <Info className="w-5 h-5 text-natural-primary shrink-0" />
            <p className="text-sm text-natural-text leading-snug font-sans">
              <strong>Bilgilendirme:</strong> Verilerimiz güvenli Google Sheets alt yapısıyla senkronizedir. Adresler akıllı Nominatim motoruyla otomatik koordine edilir.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Beautiful Graphic with Interactive Elements */}
        <div className="lg:col-span-5 relative" id="landing-graphic-section">
          {/* Aesthetic Background Accents */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-radial-gradient from-natural-badge-bg/60 to-transparent -z-20 pointer-events-none rounded-full blur-3xl"></div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white border border-natural-border rounded-[24px] p-6 shadow-2xl relative overflow-hidden"
            id="landing-preview-card"
          >
            {/* Mock map graphic with a Turkey-focused preview styling */}
            <div className="w-full h-64 bg-natural-bg/50 rounded-2xl relative overflow-hidden flex items-center justify-center" id="mock-map">
              {/* Map abstract graphics */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#5A5A40_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full border border-natural-primary/10 bg-natural-badge-bg/10"></div>
              <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full border border-natural-primary/10 bg-natural-badge-bg/10"></div>
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-natural-border/60 -rotate-12"></div>
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-natural-border/60 rotate-45"></div>

              {/* Turkey Center Glowing Pin */}
              <div className="absolute flex flex-col items-center justify-center animate-bounce z-10" style={{ top: "45%", left: "50%" }} id="mock-pin-container">
                <div className="w-10 h-10 bg-natural-primary border-4 border-white rounded-full flex items-center justify-center shadow-lg text-white">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div className="w-3 h-3 bg-natural-primary/40 rounded-full -mt-1 blur-[1px]"></div>
              </div>

              {/* Tooltip Card inside mock-map */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm border border-natural-border rounded-xl p-3 shadow-md flex items-center gap-3 z-20">
                <div className="w-12 h-12 rounded-lg bg-natural-badge-bg flex items-center justify-center select-none text-natural-primary text-lg font-bold">
                  🌿
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-serif font-bold text-sm text-natural-dark leading-tight">Glutensiz Fırınım</h4>
                  <p className="text-xs text-natural-muted font-medium">Beşiktaş, İstanbul</p>
                  <p className="text-[10px] text-natural-primary mt-0.5 font-bold">★ Sadece Glutensiz Fırın</p>
                </div>
              </div>
            </div>

            {/* Simulated Live Feed Info */}
            <div className="mt-5 space-y-3.5" id="landing-live-highlights">
              <div className="flex items-center justify-between text-xs text-natural-muted border-b border-natural-border pb-2.5 font-medium">
                <span className="font-bold tracking-wider uppercase text-[10px]">Popüler Bölgeler</span>
                <span>Güncel Liste</span>
              </div>
              <div className="grid grid-cols-2 gap-2" id="popular-regions-grid">
                <div className="bg-natural-card border border-natural-border p-2.5 rounded-xl text-left">
                  <div className="text-[11px] text-[#A0A090] font-semibold mb-0.5">İstanbul</div>
                  <div className="font-bold text-sm text-natural-dark font-serif">Kadıköy & Beşiktaş</div>
                </div>
                <div className="bg-natural-card border border-natural-border p-2.5 rounded-xl text-left">
                  <div className="text-[11px] text-[#A0A090] font-semibold mb-0.5">Ankara</div>
                  <div className="font-bold text-sm text-natural-dark font-serif">Çankaya & Tunalı</div>
                </div>
                <div className="bg-natural-card border border-natural-border p-2.5 rounded-xl text-left">
                  <div className="text-[11px] text-[#A0A090] font-semibold mb-0.5">İzmir</div>
                  <div className="font-bold text-sm text-natural-dark font-serif">Alsancak & Karşıyaka</div>
                </div>
                <div className="bg-natural-card border border-natural-border p-2.5 rounded-xl text-left">
                  <div className="text-[11px] text-[#A0A090] font-semibold mb-0.5">Antalya</div>
                  <div className="font-bold text-sm text-natural-dark font-serif">Muratpaşa & Konyaaltı</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Feature section */}
      <section className="bg-white border-t border-natural-border py-16 px-6" id="landing-features">
        <div className="max-w-7xl mx-auto" id="landing-features-wrapper">
          <div className="text-center max-w-2xl mx-auto mb-12" id="landing-features-intro">
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-natural-dark tracking-tight">Nasıl Çalışıyoruz?</h2>
            <p className="text-natural-muted mt-2 text-base">Güvenli ve sağlıklı lezzet noktalarını bulmanız için tasarlanmış yenilikçi mimari.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="landing-features-grid">
            {features.map((f, i) => (
              <div 
                key={i}
                className="bg-natural-card border border-natural-border p-6 rounded-2xl text-left flex flex-col items-start hover:shadow-md transition-all duration-300"
                id={`feature-card-${i}`}
              >
                <div className="p-3 bg-white border border-natural-border rounded-xl shadow-sm mb-4" id={`feat-icon-bg-${i}`}>
                  {f.icon}
                </div>
                <h3 className="font-serif font-bold text-lg text-natural-dark mb-2">{f.title}</h3>
                <p className="text-sm text-natural-muted leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-natural-border bg-natural-card text-[#8C8C7A] py-8 px-6 text-center text-xs font-semibold" id="landing-footer">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4" id="landing-footer-wrapper">
          <p>© 2026 Glutensiz Köşe Türkiye. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-1 text-[#8C8C7A]" id="footer-dev-line">
            <span>Çölyak Dostu Proje ile Sevgiyle Hazırlandı</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
