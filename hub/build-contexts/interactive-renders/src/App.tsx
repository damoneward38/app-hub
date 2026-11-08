import { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Cursor from './components/Cursor';
import HeroCanvas from './components/HeroCanvas';
import ArtCard from './components/ArtCard';
import Lightbox from './components/Lightbox';
import { Upload, Play, Image as ImageIcon, Info, Sparkles, X } from 'lucide-react';

type Page = 'home' | 'gallery' | 'videos' | 'about';

interface Asset {
  id: number | string;
  name: string;
  src: string;
  date: string;
  type: 'image' | 'video';
}

export default function App() {
  const [activePage, setActivePage] = useState<Page>('home');
  const [scrolled, setScrolled] = useState(false);
  const [artworks, setArtworks] = useState<Asset[]>([]);
  const [videos, setVideos] = useState<Asset[]>([]);
  const [lightboxItem, setLightboxItem] = useState<Asset | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const savedArt = localStorage.getItem('dim_art');
    const savedVid = localStorage.getItem('dim_vid');

    if (savedArt) {
      setArtworks(JSON.parse(savedArt));
    } else {
      setArtworks([
        { id: 1, name: 'Cyber Void', src: 'https://images.unsplash.com/photo-1614728263952-84ea206f99b6?auto=format&fit=crop&w=800&q=80', date: '2024.04', type: 'image' },
        { id: 2, name: 'Neon Protocol', src: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=800&q=80', date: '2024.04', type: 'image' },
        { id: 3, name: 'Digital Fluidity', src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', date: '2024.04', type: 'image' }
      ]);
    }

    if (savedVid) {
      setVideos(JSON.parse(savedVid));
    }

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const asset: Asset = {
          id: Date.now() + Math.random(),
          name: file.name.split('.')[0],
          src: e.target?.result as string,
          date: new Date().toLocaleDateString(),
          type: type
        };

        if (type === 'image') {
          const newArt = [asset, ...artworks];
          setArtworks(newArt);
          localStorage.setItem('dim_art', JSON.stringify(newArt));
        } else {
          const newVid = [asset, ...videos];
          setVideos(newVid);
          localStorage.setItem('dim_vid', JSON.stringify(newVid));
        }
        showToast(`✦ Asset "${asset.name}" Integrated`);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="min-h-screen selection:bg-v1/30">
      <Cursor />
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[5000] flex items-center justify-between px-6 md:px-16 transition-all duration-500 ${scrolled ? 'h-[70px] bg-bg/85 backdrop-blur-2xl border-b border-v1/20' : 'h-20'}`}>
        <button onClick={() => setActivePage('home')} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-v1 to-p1 rounded-xl flex items-center justify-center font-black text-xl shadow-accent group-hover:scale-110 transition-transform">D</div>
          <span className="font-display text-xl font-black tracking-widest text-white hidden sm:block">DIMENSION</span>
        </button>

        <div className="hidden md:flex gap-2 bg-white/3 p-1.5 rounded-full border border-white/5">
          {(['home', 'gallery', 'videos', 'about'] as Page[]).map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activePage === page ? 'bg-v1/20 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setActivePage('gallery')}
          className="px-7 py-2.5 bg-white text-black rounded-full text-sm font-extrabold hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all"
        >
          Upload Art
        </button>
      </nav>

      <main className="pt-20">
        <AnimatePresence mode="wait">
          {/* Home Page */}
          {activePage === 'home' && (
            <motion.section
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden px-6"
            >
              <HeroCanvas />
              <div className="relative z-10 text-center max-w-5xl">
                <div className="inline-flex items-center gap-2.5 px-6 py-2 bg-v1/10 border border-v2/30 rounded-full text-[10px] font-black text-v3 uppercase tracking-[0.2em] mb-10">
                  <Sparkles size={12} />
                  Available v2.4.0 — Spatial Art Engine
                </div>
                <h1 className="font-display text-5xl md:text-8xl lg:text-[120px] leading-[0.9] font-black mb-8">
                  <span className="block text-gradient">CREATE WITHOUT</span>
                  <span className="block text-gradient">BOUNDARIES.</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                  Transform static imagery into interactive 3D experiences using our real-time spatial motion engine. No plugins. No rendering. Just pure code.
                </p>
                <button 
                  onClick={() => setActivePage('gallery')}
                  className="px-12 py-5 bg-gradient-to-br from-v1 to-p1 rounded-full text-white font-black text-lg shadow-accent hover:translate-y-[-5px] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] transition-all duration-300"
                >
                  Launch Gallery
                </button>
              </div>
            </motion.section>
          )}

          {/* Gallery Page */}
          {activePage === 'gallery' && (
            <motion.section
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-[1600px] mx-auto px-6 md:px-16 py-20"
            >
              <div 
                onClick={() => document.getElementById('file-input')?.click()}
                className="group relative bg-gradient-to-b from-v1/5 to-transparent border-2 border-dashed border-v1/20 rounded-[30px] p-24 text-center mb-16 cursor-pointer hover:border-v1 hover:bg-v1/10 transition-all duration-500"
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_10px_#7c3aed]">✦</div>
                <h2 className="font-display text-3xl font-black mb-3">Integrate New Asset</h2>
                <p className="text-gray-400">Drop your high-fidelity renders here or click to browse.</p>
                <input type="file" id="file-input" hidden accept="image/*" multiple onChange={(e) => handleUpload(e, 'image')} />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div>
                  <div className="inline-block px-4 py-1.5 bg-v1/10 border border-v2/30 rounded-full text-[10px] font-black text-v3 uppercase tracking-[0.2em] mb-4">Asset Database</div>
                  <h2 className="font-display text-4xl md:text-5xl font-black text-white">Interactive Renders</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {artworks.map((item) => (
                  <ArtCard key={item.id} item={item} onClick={() => setLightboxItem(item)} />
                ))}
              </div>
            </motion.section>
          )}

          {/* Videos Page */}
          {activePage === 'videos' && (
            <motion.section
              key="videos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-[1600px] mx-auto px-6 md:px-16 py-20"
            >
              <div 
                onClick={() => document.getElementById('video-input')?.click()}
                className="group relative bg-gradient-to-b from-c1/5 to-transparent border-2 border-dashed border-c1/20 rounded-[30px] p-24 text-center mb-16 cursor-pointer hover:border-c1 hover:bg-c1/10 transition-all duration-500"
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_10px_#00d4ff]">🎬</div>
                <h2 className="font-display text-3xl font-black mb-3">Upload Motion</h2>
                <p className="text-gray-400">MP4 or WebM — Auto-wraps in 3D perspective.</p>
                <input type="file" id="video-input" hidden accept="video/*" multiple onChange={(e) => handleUpload(e, 'video')} />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div>
                  <div className="inline-block px-4 py-1.5 bg-c1/10 border border-c1/30 rounded-full text-[10px] font-black text-c1 uppercase tracking-[0.2em] mb-4">Motion Data</div>
                  <h2 className="font-display text-4xl md:text-5xl font-black text-white">Dynamic Volumes</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {videos.map((item) => (
                  <ArtCard key={item.id} item={item} onClick={() => setLightboxItem(item)} />
                ))}
                {videos.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-500 font-medium italic">
                    No motion assets integrated yet.
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* About Page */}
          {activePage === 'about' && (
            <motion.section
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto px-6 py-20 text-center"
            >
              <div className="inline-block px-4 py-1.5 bg-v1/10 border border-v2/30 rounded-full text-[10px] font-black text-v3 uppercase tracking-[0.2em] mb-6">Engineering Documentation</div>
              <h2 className="font-display text-5xl md:text-6xl font-black mb-12 text-gradient">The Core Engine</h2>
              
              <div className="bg-bg-secondary p-10 md:p-16 rounded-[40px] border border-white/10 text-left leading-relaxed text-gray-400">
                <p className="mb-8 text-lg">
                  DIMENSION utilizes a proprietary <strong className="text-white">Spatial Motion Transformation Layer</strong>. Unlike traditional WebGL which renders to a flat canvas, Dimension applies 3D matrices directly to DOM elements.
                </p>
                <p className="mb-12 text-lg">
                  When you hover over a card, our <code className="bg-white/5 px-2 py-1 rounded text-v3">tiltHandler</code> calculates the normalized vector between the mouse position and the element's center. This data is fed into a <code className="bg-white/5 px-2 py-1 rounded text-v3">matrix3d</code> calculation that simulates Z-depth and parallax.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
                  {[
                    { title: "Real-time Raycasting", desc: "Simulated via CSS drop-shadows that react to tilt angle." },
                    { title: "Asset Persistence", desc: "LocalStorage integration for offline session recovery." },
                    { title: "Performance", desc: "120FPS rendering via hardware-accelerated transforms." },
                    { title: "Zero Latency", desc: "Immediate asset wrap on upload." }
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="text-v3 font-black text-xl">✦</div>
                      <div>
                        <h4 className="text-white font-bold mb-1">{feature.title}</h4>
                        <p className="text-sm">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <Lightbox 
        isOpen={!!lightboxItem} 
        onClose={() => setLightboxItem(null)} 
        item={lightboxItem} 
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 right-10 bg-white text-black px-8 py-4 rounded-2xl font-black text-sm z-[10000] shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
