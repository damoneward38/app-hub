import { motion } from 'motion/react';
import { Upload, FileText, Archive, Shield, Plus } from 'lucide-react';
import { useState, ChangeEvent } from 'react';

export default function VaultDrop() {
  const [files, setFiles] = useState([
    { name: 'VaultX_Auth_v2.html', size: '847 KB', type: 'Web App', price: '$49', icon: '🔐' },
    { name: 'SaaS_Guide_2025.pdf', size: '12.4 MB', type: 'PDF', price: '$19', icon: '📄' },
    { name: 'CodePulse_Pro.html', size: '234 KB', type: 'Web App', price: '$29', icon: '⚡' },
    { name: 'WhiteLabel_Kit.zip', size: '4.2 MB', type: 'Package', price: '$199', icon: '📦' },
  ]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;
    
    // Simulate upload
    Array.from(uploadedFiles).forEach((file: File) => {
      const newFile = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: 'Assigned',
        price: 'SET PRICE',
        icon: '📄'
      };
      setFiles(prev => [newFile, ...prev]);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter">Vault<span className="text-gold">Drop</span> 📦</h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Drop your apps, PDFs, and files. Set your price. They unlock. You collect.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="max-w-3xl mx-auto mb-16">
        <label className="relative group block cursor-pointer">
          <input type="file" className="hidden" multiple onChange={handleFileUpload} />
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="border-2 border-dashed border-gold/20 rounded-[40px] px-8 py-20 bg-gold/2 transition-all group-hover:bg-gold/5 group-hover:border-gold/50 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-transparent via-gold/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-3xl bg-gold/10 flex items-center justify-center mx-auto mb-6 text-5xl group-hover:scale-110 transition-all">
                <Upload className="text-gold" size={40} />
              </div>
              <h3 className="text-2xl font-black mb-2 uppercase tracking-wide">Drop Files Into The Vault</h3>
              <p className="text-slate-500 font-bold text-sm mb-8 uppercase tracking-[2px]">Apps • PDFs • Tools • Guides • Anything</p>
              <button className="px-10 py-4 rounded-xl bg-linear-to-br from-gold-light to-gold text-black font-black uppercase text-[11px] tracking-widest shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                📦 Choose Files To Upload
              </button>
              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-gold/40 uppercase tracking-[4px]">
                <Shield size={14} /> Quantum Encrypted Storage Active
              </div>
            </div>
          </motion.div>
        </label>
      </div>

      {/* Files List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {files.map((file, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group bg-card-dark border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:border-gold/30 transition-all cursor-pointer"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
              file.icon === '📄' ? 'bg-red-neon/10 text-red-neon' :
              file.icon === '⚡' ? 'bg-green-neon/10 text-green-neon' :
              'bg-gold/10 text-gold'
            }`}>
              {file.name.endsWith('.pdf') ? <FileText /> : file.name.endsWith('.zip') ? <Archive /> : <Plus />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-slate-200 truncate group-hover:text-gold transition-colors">{file.name}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                {file.size} • {file.type}
              </div>
            </div>
            <div className="text-lg font-black text-gradient-gold shrink-0">{file.price}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
