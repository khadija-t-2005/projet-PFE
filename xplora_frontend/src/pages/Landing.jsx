import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Building2, Wallet, Map, Sparkles, CalendarDays, RefreshCw,
         Landmark, ShoppingBag, Waves, Theater, Circle, Mountain,
         Trees, Coffee, Star, Flower2, Castle, Film, Droplets,
         Sunset, GraduationCap, Palette, Shield, Anchor, UtensilsCrossed } from "lucide-react";
/* ─────────────────────────────────────────────
   MOROCCAN UNSPLASH BACKGROUNDS
   (landscape photos of Morocco - public Unsplash)
───────────────────────────────────────────── */
const MOROCCAN_BG_IMAGES = [
  "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1920&q=80",
  "https://images.unsplash.com/photo-1624802746702-60ca95bdb605?w=1920&q=80",
  "https://images.unsplash.com/photo-1590802163243-290dd8621032?w=1920&q=80",
  "https://images.unsplash.com/photo-1668312981990-4eaf23a78986?w=1920&q=80",
  "https://images.unsplash.com/photo-1574545188455-fe512926e41b?w=1920&q=80",
  "https://plus.unsplash.com/premium_photo-1664301183877-85b1070c12b8?w=1920&q=80",
  "https://images.unsplash.com/photo-1580746738099-1cb74f972feb?w=1920&q=80", // forêt enneigée
  "https://images.unsplash.com/photo-1517314815091-85f25384be22?w=1920&q=80", // ?
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80", // plage
  "https://plus.unsplash.com/premium_photo-1671127303910-754ac2224c7a?w=1920&q=80", // ?
];

/* ─────────────────────────────────────────────
   POI DATA  (5 points of interest per city)
───────────────────────────────────────────── */
const CITY_POIS = {
  Casablanca: {
    tag: "Métropole Moderne",
    intro: "Capitale économique du Maroc, Casablanca mêle architecture Art déco, influences européennes et modernité arabe en perpétuel mouvement.",
    pois: [
      { icon: <Landmark size={20} />, name: "Grande Mosquée Hassan II", desc: "L'une des plus grandes mosquées du monde, construite sur l'Atlantique avec un minaret de 210 m." },
      { icon: <Building2 size={20} />, name: "Place Mohammed V", desc: "Cœur administratif de la ville, entourée de bâtiments Art déco et d'une fontaine lumineuse emblématique." },
      { icon: <ShoppingBag size={20} />, name: "Morocco Mall", desc: "Plus grand centre commercial d'Afrique avec aquarium géant et salle IMAX." },
      { icon: <Waves size={20} />, name: "Corniche Aïn Diab", desc: "Promenade balnéaire longeant l'Atlantique, parsemée de restaurants et clubs de plage." },
      { icon: <Theater size={20} />, name: "Quartier Habous", desc: "Nouvelle médina mêlant architecture islamique et européenne, idéale pour l'artisanat." },
    ],
  },
  Chefchaouen: {
    tag: "Rêves Azurs",
    intro: "Nichée dans le Rif, la «ville bleue» du Maroc — un labyrinthe de ruelles peintes en nuances d'azur et d'indigo, hors du temps.",
    pois: [
      { icon: <Circle size={20} />, name: "Médina Bleue", desc: "Cœur historique aux murs bleus hypnotiques, réputée mondialement pour sa beauté picturale." },
      { icon: <Droplets size={20} />, name: "Cascade Ras el-Ma", desc: "Source d'eau fraîche et cascade en amont de la ville, havre de sérénité." },
      { icon: <Landmark size={20} />, name: "Grande Mosquée & Kasbah", desc: "La kasbah du XVème siècle avec musée ethnographique et jardin andalou luxuriant." },
      { icon: <Trees size={20} />, name: "Parc National de Talassemtane", desc: "Forêts de cèdres abritant des sentiers de randonnée époustouflants dans le massif du Rif." },
      { icon: <Coffee size={20} />, name: "Plaza Uta el-Hammam", desc: "Place centrale animée entourée de cafés — cœur battant de la vie sociale." },
    ],
  },
  Marrakech: {
    tag: "Majesté Ocre",
    intro: "La «Ville Rouge» envoûte par ses contrastes : médina millénaire labyrinthique, palais fastueux et jardins secrets côtoyant une scène branchée internationale.",
    pois: [
      { icon: <Star size={20} />, name: "Place Jemaa el-Fna", desc: "Place mythique classée UNESCO, spectacle de conteurs, musiciens gnaoua et charmeurs de serpents." },
      { icon: <Flower2 size={20} />, name: "Jardins Majorelle & Musée YSL", desc: "Oasis aux structures bleu cobalt conçue par Jacques Majorelle, propriété de la maison YSL." },
      { icon: <Castle size={20} />, name: "Palais Bahia", desc: "Chef-d'œuvre du XIXème siècle aux salles décorées de stuc, zellige et boiseries en cèdre sculpté." },
      { icon: <Landmark size={20} />, name: "Koutoubia & Mellah", desc: "Minaret-symbole de Marrakech dominant les toits de la médina et le quartier juif historique." },
      { icon: <ShoppingBag size={20} />, name: "Souks de la Médina", desc: "Dédale envoûtant de marchés spécialisés — épices, cuirs tannés, dinanderie, tissus." },
    ],
  },
  Ouarzazate: {
    tag: "Porte du Sahara",
    intro: "Porte du Sahara et «Hollywood d'Afrique», fascinante par ses kasbahs millénaires et paysages désertiques à couper le souffle.",
    pois: [
      { icon: <Castle size={20} />, name: "Kasbah Aït Benhaddou", desc: "Ksar classé UNESCO et décor de Gladiator et Game of Thrones — forteresse de pisé majestueuse." },
      { icon: <Film size={20} />, name: "Studios Atlas", desc: "Plus grands studios d'Afrique ayant accueilli des productions légendaires. Visite des décors monumentaux." },
      { icon: <Droplets size={20} />, name: "Lac Al-Mansour Eddahbi", desc: "Étendue d'eau turquoise au pied des montagnes, paradis pour les flamants roses." },
      { icon: <Landmark size={20} />, name: "Kasbah Taourirt", desc: "Ancienne résidence du Pacha Glaoui aux ornements intérieurs saisissants." },
      { icon: <Sunset size={20} />, name: "Vallée du Drâa & Zagora", desc: "Route mythique des caravaniers entre palmeraies et dunes, menant aux portes du Grand Erg." },
    ],
  },
  Fès: {
    tag: "Patrimoine Éternel",
    intro: "Fondée au IXème siècle, Fès el-Bali est la médina médiévale la mieux préservée au monde — 9 000 ruelles où le temps s'est arrêté.",
    pois: [
      { icon: <GraduationCap size={20} />, name: "Université Al-Quaraouiyine", desc: "Fondée en 859, la plus ancienne université du monde encore en activité." },
      { icon: <Palette size={20} />, name: "Tanneries Chouara", desc: "Bassins de teinture multicolores — les plus anciennes tanneries du monde, inchangées depuis le XIème siècle." },
      { icon: <Landmark size={20} />, name: "Médersa Bou Inania", desc: "Joyau du XIVème siècle aux zelliges et stucs d'une finesse inégalée." },
      { icon: <Shield size={20} />, name: "Borj Nord & Panorama", desc: "Forteresse du XVIème siècle avec musée des armes et vue exceptionnelle sur Fès el-Bali." },
      { icon: <Flower2 size={20} />, name: "Jardins de Jnan Sbil", desc: "Havre de paix au pied des remparts mérinides avec fontaines andalouses." },
    ],
  },
  Agadir: {
    tag: "Charme Côtier",
    intro: "Station balnéaire par excellence du Maroc — plage dorée de 10 km, soleil garanti et art de vivre atlantique.",
    pois: [
      { icon: <Waves size={20} />, name: "Plage d'Agadir", desc: "10 km de sable doré aux eaux clémentes, idéale pour le surf, le windsurf et la détente." },
      { icon: <Mountain size={20} />, name: "Oufella — Ancienne Kasbah", desc: "Ruines perchées sur une colline avec panorama grandiose sur la baie." },
      { icon: <Trees size={20} />, name: "Vallée du Paradis & Immouzer", desc: "Cascades d'arganiers et sources cristallines dans les contreforts de l'Anti-Atlas." },
      { icon: <ShoppingBag size={20} />, name: "Souk El Had", desc: "Vaste marché d'épices, argan, poteries et vêtements berbères." },
      { icon: <Anchor size={20} />, name: "Port de Pêche", desc: "Port animé où débarquent chaque matin les pêcheurs. Sardines grillées face à l'Atlantique." },
    ],
  },
  Rabat: {
    tag: "Capitale Royale",
    intro: "Capitale du Maroc inscrite au patrimoine UNESCO, conjuguant grandeur royale, remparts almohades et modernité cosmopolite.",
    pois: [
      { icon: <Landmark size={20} />, name: "Tour Hassan & Mausolée Mohammed V", desc: "Minaret du XIIème siècle et mausolée en marbre blanc — chef-d'œuvre de l'artisanat marocain." },
      { icon: <Castle size={20} />, name: "Kasbah des Oudayas", desc: "Forteresse almohade dominant l'embouchure du Bouregreg, ruelles bleues et blanches." },
      { icon: <Shield size={20} />, name: "Chellah & Remparts Almohades", desc: "Nécropole mérinide et ruines romaines de Sala Colonia — site archéologique d'une rare beauté." },
      { icon: <Palette size={20} />, name: "Musée National de l'Archéologie", desc: "Bronzes romains, mosaïques et objets préhistoriques retraçant 300 000 ans d'histoire." },
      { icon: <Waves size={20} />, name: "Médina de Salé & Corniche", desc: "La ville jumelle offre une médina authentique et des plages préservées à quelques minutes." },
    ],
  },
};
/* ─────────────────────────────────────────────
   NAV SECTIONS for filter
───────────────────────────────────────────── */
const NAV_SECTIONS = [
  { label: "Destinations", id: "cities-section" },
  { label: "Fonctionnalités", id: "features-section" },
  { label: "À propos", id: "cta-section" },
];

/* ─────────────────────────────────────────────
   POI MODAL COMPONENT
───────────────────────────────────────────── */
const POIModal = ({ city, onClose }) => {
  if (!city) return null;
  const data = CITY_POIS[city];
  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0, 0, 0, 0)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-2xl border border-white/10"
        style={{
          background: "linear-gradient(160deg, rgba(12,28,20,0.97) 0%, rgba(8,16,12,0.98) 100%)",
          animation: "modalIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-start justify-between px-6 py-5 border-b border-white/10 rounded-t-2xl"
style={{ color: "#da7756", background: "rgba(12,28,20,0.98)", backdropFilter: "blur(8px)" }}
        >
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#da7756" }}>{data.tag}</p>
            <h3 className="text-3xl font-extrabold text-stone-100 leading-tight">{city}</h3>
          </div>
          <button
            onClick={onClose}
            className="mt-1 w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all duration-200 flex-shrink-0 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-stone-400 text-sm leading-relaxed font-light mb-5">{data.intro}</p>
          <div className="flex flex-col gap-3">
            {data.pois.map((poi, i) => (
              <div
                key={i}
                className="flex gap-4 items-start p-4 rounded-xl border border-white/6 transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.03)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(218, 119, 86, 0.34)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.07)")}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(218,119,86,0.15)", color: "#da7756" }}>
                  {poi.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-200 mb-1">{poi.name}</p>
                  <p className="text-xs text-stone-400 leading-relaxed font-light">{poi.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────
   CITY CARDS DATA
───────────────────────────────────────────── */
const CITIES = [
  { name: "Casablanca",  subtitle: "Métropole Moderne", desc: "Là où la tradition rencontre la sophistication contemporaine", img: "https://images.unsplash.com/photo-1699210260021-eac11ba4ff86?w=800&q=80" },
  { name: "Chefchaouen", subtitle: "Rêves Azurs",        desc: "Une cité peinte en nuances de bleu et d'émerveillement",       img: "https://images.unsplash.com/flagged/photo-1555169048-3c4845cfcf1c?w=800&q=80" },
  { name: "Marrakech",   subtitle: "Majesté Ocre",        desc: "Palais anciens et médinas vibrantes vous attendent",            img: "https://images.unsplash.com/photo-1618423205267-e95744f57edf?w=800&q=80" },
  { name: "Fès",         subtitle: "Patrimoine Éternel",  desc: "Médinas labyrinthiques chargées d'une histoire millénaire",    img: "https://images.unsplash.com/photo-1557503799-fac6a98054b3?w=800&q=80" },
  { name: "Agadir",      subtitle: "Charme Côtier",       desc: "Brises atlantiques et vie balnéaire contemporaine",             img: "https://images.unsplash.com/photo-1538053367502-742497073841?w=800&q=80" },
  { name: "Rabat",       subtitle: "Capitale Royale",     desc: "Élégance royale, remparts historiques et modernité",           img: "https://images.unsplash.com/photo-1597081315272-a8b558ca4e86?w=800&q=80" },
];
/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const Landing = () => {
  const navigate = useNavigate();

  // Pick a random Moroccan bg on mount
  const [bgUrl] = useState(
    () => MOROCCAN_BG_IMAGES[Math.floor(Math.random() * MOROCCAN_BG_IMAGES.length)]
  );
  const [bgLoaded, setBgLoaded] = useState(false);

  const [heroLoaded, setHeroLoaded]     = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showCities, setShowCities]     = useState(false);
  const citiesRef = useRef(null);

  // Preload bg image
  useEffect(() => {
    const img = new Image();
    img.src = bgUrl;
    img.onload = () => setBgLoaded(true);
  }, [bgUrl]);

  // Hero animation
  useEffect(() => {
    if (bgLoaded) {
      const t = setTimeout(() => setHeroLoaded(true), 150);
      return () => clearTimeout(t);
    }
  }, [bgLoaded]);

  // Close modal on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") setSelectedCity(null); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // Cities fade-in on scroll
  useEffect(() => {
    if (!citiesRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setShowCities(true); },
      { threshold: 0.1 }
    );
    obs.observe(citiesRef.current);
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  /* Royal green palette */
  const G = {
    primary:     "#da7756",   // corail orangé
    bright:      "#e8956d",   // corail clair
    deep:        "#8b3a22",   // brun-rouge foncé
    darkest:     "#5c2010",   // très foncé
    glow:        "rgba(218,119,86,0.25)",
    glowLight:   "rgba(232,149,109,0.15)",
    badge:       "rgba(218,119,86,0.12)",
    badgeBorder: "rgba(218,119,86,0.35)",
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden" style={{ background: "#060e0a" }}>

      {/* ── POI MODAL ── */}
      <POIModal city={selectedCity} onClose={() => setSelectedCity(null)} />

      {/* ══════════════════════════════════════
          FIXED MOROCCAN BACKGROUND (whole page)
      ══════════════════════════════════════ */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: bgLoaded ? `url('${bgUrl}')` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          transition: "opacity 1s ease",
          opacity: bgLoaded ? 1 : 0,
        }}
      />
      {/* Dark overlay over fixed bg — keeps content readable while showing photo */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          background: "rgba(6, 14, 10, 0.07)",
        }}
      />

      {/* All content sits above fixed bg */}
      <div style={{ position: "relative", zIndex: 2 }}>

        {/* ══════════════════════════════════════
            HERO  (full-screen)
        ══════════════════════════════════════ */}
        <div className="h-screen w-screen flex flex-col overflow-hidden relative">

          {/* Extra cinematic gradient at hero bottom */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(6,14,10,0.3) 0%, transparent 40%, rgba(6,14,10,0.85) 100%)" }}
          />

          {/* ── NAVBAR ── */}
          <nav className="relative z-10 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/10 backdrop-blur-md shrink-0"
            style={{ background: "rgba(6,14,10,0.55)" }}>
            <span className="font-serif text-white text-xl md:text-2xl font-bold tracking-wide select-none">
              Smart<span style={{ color: G.primary }}> trip</span>
            </span>

            {/* Desktop nav with section filters */}
            <div className="hidden sm:flex items-center gap-1 md:gap-2">
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full transition-all duration-200"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = G.bright;
                    e.currentTarget.style.background = G.badge;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {s.label}
                </button>
              ))}
              <div className="w-px h-5 mx-2" style={{ background: "rgba(255,255,255,0.15)" }} />
              <button className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors font-medium">FR</button>
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-full transition-all"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-5 py-2 text-sm font-semibold rounded-full transition-all hover:-translate-y-px"
                style={{
                  background: `linear-gradient(135deg, ${G.deep}, ${G.primary})`,
                  color: "#fff",
                  boxShadow: `0 4px 18px ${G.glow}`,
                }}
              >
                Get started
              </button>
            </div>

            {/* Mobile */}
            <div className="flex sm:hidden items-center gap-2">
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full transition-colors"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {s.label.split(" ")[0]}
                </button>
              ))}
              <button onClick={() => navigate("/login")} className="px-4 py-2 text-sm text-white/70 border border-white/20 rounded-full">Sign in</button>
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 text-sm font-semibold rounded-full active:scale-[0.97]"
                style={{ background: `linear-gradient(135deg, ${G.deep}, ${G.primary})`, color: "#fff" }}
              >
                Start
              </button>
            </div>
          </nav>

          {/* ── HERO CONTENT ── */}
          <div className="relative z-10 flex-1 flex items-center justify-center px-5 md:px-6 min-h-0">
            <div className="max-w-3xl w-full text-center">

              {/* Animated badge */}
              <div
                style={{
                  opacity: heroLoaded ? 1 : 0,
                  transform: heroLoaded ? "translateY(0)" : "translateY(-16px)",
                  transition: "opacity 0.6s ease 0s, transform 0.6s ease 0s",
                }}
                className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border"
                style={{
                  opacity: heroLoaded ? 1 : 0,
                  transform: heroLoaded ? "translateY(0)" : "translateY(-16px)",
                  transition: "opacity 0.6s ease 0s, transform 0.6s ease 0s",
                  border: `1px solid ${G.badgeBorder}`,
                  background: G.badge,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: G.primary }} />
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: G.bright }}>Discover Morocco with AI</span>
              </div>

              {/* HEADLINE */}
              <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-stone-100 leading-tight mb-4 drop-shadow-2xl">
                <span
                  className="block"
                  style={{
                    opacity: heroLoaded ? 1 : 0,
                    transform: heroLoaded ? "translateY(0)" : "translateY(24px)",
                    transition: "opacity 0.65s ease 0.1s, transform 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.1s",
                  }}
                >
                  Morocco,
                </span>
                <span className="block">
                  {"Smartly Reimagined.".split(" ").map((word, i) => (
                    <span
                      key={i}
                      className={i === 1 ? "italic" : ""}
                      style={{
                        display: "inline-block",
                        marginRight: i === 0 ? "0.25em" : 0,
                        color: i === 1 ? G.primary : undefined,
                        opacity: heroLoaded ? 1 : 0,
                        transform: heroLoaded
                          ? "translateY(0) rotateX(0deg)"
                          : "translateY(-28px) rotateX(-40deg)",
                        transition: `opacity 0.55s ease ${0.3 + i * 0.18}s, transform 0.55s cubic-bezier(0.34,1.56,0.64,1) ${0.3 + i * 0.18}s`,
                        transformOrigin: "top center",
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </span>
              </h1>

              {/* Subline */}
              <p
                className="text-sm md:text-base lg:text-lg text-white/55 max-w-xl mx-auto leading-relaxed font-light mb-6 md:mb-7"
                style={{
                  opacity: heroLoaded ? 1 : 0,
                  transform: heroLoaded ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity 0.7s ease 0.6s, transform 0.7s ease 0.6s",
                }}
              >
                Stop scrolling, start exploring. One prompt. Total control.
                Get a day-by-day Moroccan adventure that fits your budget and soul.
                No stress, just pure Atlas magic.
              </p>

              {/* CTAs */}
              <div
                className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8 flex-wrap"
                style={{
                  opacity: heroLoaded ? 1 : 0,
                  transform: heroLoaded ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity 0.7s ease 0.75s, transform 0.7s ease 0.75s",
                }}
              >
                <button
                  onClick={() => navigate("/signup")}
                  className="px-6 md:px-8 py-3 md:py-3.5 font-semibold text-sm rounded-full transition-all hover:-translate-y-0.5 active:scale-[0.97]"
                  style={{
                    background: `linear-gradient(135deg, ${G.deep}, ${G.primary})`,
                    color: "#fff",
                    boxShadow: `0 6px 24px ${G.glow}`,
                  }}
                >
                  Start planning
                </button>
                <button
                  onClick={() => scrollTo("cities-section")}
                  className="px-6 md:px-8 py-3 md:py-3.5 border border-white/25 text-white/70 font-semibold text-sm rounded-full transition-all hover:-translate-y-0.5"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = G.badgeBorder;
                    e.currentTarget.style.color = G.bright;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                  }}
                >
                  Explore destinations ↓
                </button>
              </div>

              {/* Stats */}
              <div
                className="flex items-center justify-center gap-8 pt-6 border-t border-white/10"
                style={{
                  opacity: heroLoaded ? 1 : 0,
                  transition: "opacity 0.7s ease 0.9s",
                }}
              >
                {[["12K+", "Trips Created"], ["7", "Cities"], ["98%", "Satisfaction"]].map(([num, label]) => (
                  <div key={label} className="text-center">
                    <p className="text-xl font-bold" style={{ color: G.primary }}>{num}</p>
                    <p className="text-[10px] text-white/35 uppercase tracking-wider mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
            style={{ opacity: heroLoaded ? 0.5 : 0, transition: "opacity 0.7s ease 1.1s" }}
          >
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent animate-bounce" />
          </div>
        </div>

        {/* ══════════════════════════════════════
            CITIES SECTION
        ══════════════════════════════════════ */}
        <section
          id="cities-section"
          ref={citiesRef}
          className="relative py-24 px-4 md:px-8"
          style={{ background: "rgba(6,14,10,0.82)", backdropFilter: "blur(2px)" }}
        >
        

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: G.primary }}>Merveilles du Maroc</p>
              <h2 className="font-sans text-4xl md:text-5xl font-extrabold text-stone-100 mb-4">
                Villes &amp; Destinations
              </h2>
              <p className="text-stone-400 text-sm md:text-base font-light max-w-xl mx-auto">
                Cliquez sur une carte pour découvrir les points d'intérêt majeurs
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${G.deep})` }} />
                <div className="w-2 h-2 rotate-45" style={{ background: G.primary }} />
                <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${G.deep})` }} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {CITIES.map((city, idx) => (
                <div
                  key={idx}
                  className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    opacity: showCities ? 1 : 0,
                    transform: showCities ? "translateY(0)" : "translateY(32px)",
                    transition: `opacity 0.6s ease ${idx * 0.08}s, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${idx * 0.08}s`,
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onClick={() => setSelectedCity(city.name)}
                >
                  <div
  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
  style={{
    backgroundImage: `url('${city.img}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
/>



             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/50 transition-all duration-500" />     

                  {/* Green glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at 50% 80%, ${G.glowLight} 0%, transparent 60%)` }}
                  />

                  <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                    <div className="self-end opacity-0 group-hover:opacity-40 transition-all duration-500 transform translate-y-3 group-hover:translate-y-0">
                      <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="1.2">
                        <path d="M20 78 Q50 22 80 78" strokeLinecap="round" />
                        <path d="M28 72 Q50 32 72 72" strokeLinecap="round" opacity="0.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: G.primary }}>
                        {city.subtitle}
                      </p>
                      <h3 className="text-3xl font-extrabold text-white mb-1 group-hover:translate-x-1 transition-transform duration-300">
                        {city.name}
                      </h3>
                      <p className="text-white/60 text-xs leading-relaxed font-light group-hover:text-white/80 transition-colors">
                        {city.desc}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-xs font-semibold opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400" style={{ color: G.bright }}>
                        <span>Voir les points d'intérêt</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-opacity-25 transition-colors duration-500 pointer-events-none"
                    style={{ borderColor: `${G.primary}40` }}
                  />
                  <div
                    className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 opacity-0 group-hover:opacity-35 rounded-bl-2xl transition-all duration-500"
                    style={{ borderColor: G.primary }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FEATURES SECTION
        ══════════════════════════════════════ */}
        <section
          id="features-section"
          className="py-20 px-4 md:px-8"
          style={{ background: "rgba(6,14,10,0.88)", backdropFilter: "blur(2px)" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: G.primary }}>Technologie</p>
              <h2 className="font-sans text-3xl md:text-4xl font-extrabold text-stone-100 mb-3">Propulsé par l'Intelligence</h2>
              <p className="text-stone-400 text-sm font-light max-w-lg mx-auto">
                Une IA avancée qui comprend vos rêves de voyage et crée des expériences sur mesure
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
  { icon: <Building2 size={24} />, title: "Intelligence Culturelle",  desc: "IA formée sur le patrimoine et les traditions marocaines" },
  { icon: <Wallet size={24} />,    title: "Budget Intelligent",       desc: "Meilleur rapport qualité-prix sans compromis" },
  { icon: <Map size={24} />,       title: "Routes Personnalisées",    desc: "Itinéraires jour par jour optimisés pour vous" },
  { icon: <Sparkles size={24} />,  title: "Perles Cachées",           desc: "Conseils en temps réel et trésors insoupçonnés" },
  { icon: <CalendarDays size={24} />, title: "Réservation Facile",    desc: "Hébergement et activités en quelques clics" },
  { icon: <RefreshCw size={24} />, title: "Planification Flexible",   desc: "Modifiez votre itinéraire à tout moment" },
].map((f, i) => (
                <div
                  key={i}
                  className="group relative p-6 rounded-xl border border-white/6 transition-all duration-400 hover:-translate-y-1 overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `rgba(218,119,86,0.06)`;
                    e.currentTarget.style.borderColor = `${G.deep}80`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  }}
                >
                  <div
                    className="absolute top-0 left-0 h-0.5 w-10 group-hover:w-full transition-all duration-500"
                    style={{ background: `linear-gradient(to right, ${G.deep}, ${G.primary})` }}
                  />
                  <div className="mb-3" style={{ color: G.primary }}>{f.icon}</div>
                  <h3
                    className="text-sm font-bold text-stone-200 mb-1 transition-colors"
                    style={{}}
                    onMouseEnter={(e) => (e.currentTarget.style.color = G.bright)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                  >{f.title}</h3>
                  <p className="text-stone-500 text-xs leading-relaxed font-light">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════ */}
        <section
          id="cta-section"
          className="py-20 px-4 text-center border-t border-white/6"
          style={{ background: "rgba(6,14,10,0.90)", backdropFilter: "blur(2px)" }}
        >
          <h2 className="font-sans text-3xl md:text-4xl font-extrabold text-stone-100 mb-4">
            Commencez Votre Aventure Marocaine
          </h2>
          <p className="text-stone-400 text-sm font-light mb-8 max-w-lg mx-auto">
            Transformez vos rêves de voyage en expériences parfaitement planifiées par l'IA
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-3.5 font-semibold text-sm rounded-full transition-all hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${G.deep}, ${G.primary})`,
                color: "#fff",
                boxShadow: `0 6px 24px ${G.glow}`,
              }}
            >
              Créer mon voyage gratuit
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3.5 border border-white/20 text-white/70 font-semibold text-sm rounded-full transition-all hover:-translate-y-0.5"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = G.badgeBorder;
                e.currentTarget.style.color = G.bright;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }}
            >
              Se connecter
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FOOTER
        ══════════════════════════════════════ */}
        <footer className="border-t border-white/6 py-12 px-4 md:px-8" style={{ background: "rgba(4,10,7,0.95)" }}>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
              {[
                { title: "Produit",    links: ["Fonctionnalités", "Tarifs", "Sécurité"] },
                { title: "Société",    links: ["À propos", "Blog", "Carrières"] },
                { title: "Ressources", links: ["Guides", "Support", "Contact"] },
                { title: "Légal",      links: ["Confidentialité", "CGU", "Cookies"] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-4">{col.title}</h4>
                  <ul className="space-y-2.5">
                    {col.links.map((l) => (
                      <li key={l}>
                        <a
                          href="#"
                          className="text-stone-500 text-xs transition-colors"
                          onMouseEnter={(e) => (e.currentTarget.style.color = G.primary)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                        >{l}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-white/6 pt-8 text-center">
              <p className="text-stone-600 text-xs">
                © 2024 Agentic AI Travel Planner · Crafting magical Moroccan journeys through intelligence.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Global styles ── */}
     <style>{`
  html { scroll-behavior: smooth; }
  html, body { overflow-x: hidden; }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar:horizontal { display: none; }
  ::-webkit-scrollbar-track { background: #060e0a; }
  ::-webkit-scrollbar-thumb { background: rgba(218,119,86,0.4); border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(218,119,86,0.7); }
  * { -webkit-font-smoothing: antialiased; }
`}</style>
    </div>
  );
};

export default Landing;