import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Map, 
  Video, 
  Mic2, 
  FileText, 
  HelpCircle, 
  History,
  Layout as LayoutIcon,
  Search,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { MediaWidget } from './MediaWidget';
import { NoaChat } from './NoaChat';
import { MediaItem, MediaType, Product } from '../types';

interface MediaCenterProps {
  mediaItems: MediaItem[];
  products: Product[];
}

export const MediaCenter: React.FC<MediaCenterProps> = ({ mediaItems, products }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(() => {
    const lastId = localStorage.getItem('hub_last_viewed');
    return mediaItems.find(m => m.id === lastId) || mediaItems[0];
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Save progress
  useEffect(() => {
    if (activeMedia) {
      localStorage.setItem('hub_last_viewed', activeMedia.id);
    }
  }, [activeMedia]);

  const filteredItems = mediaItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectMedia = (item: MediaItem) => {
    setActiveMedia(item);
    setIsDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-brand-dark overflow-hidden flex flex-col font-sans px-safe pt-safe pb-safe h-[100svh]">
      {/* Top Bar */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 bg-black/20 backdrop-blur-md border-b border-white/5 z-40">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="w-11 h-11 flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <Menu size={24} />
        </button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-black text-white uppercase tracking-tighter">The Academy Hub</h1>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-brand-blue rounded-full pulse" />
            <span className="text-[8px] text-brand-muted uppercase font-bold tracking-widest">Media Center Active</span>
          </div>
        </div>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${isChatOpen ? 'bg-red-500/20 text-red-400' : 'bg-brand-blue/20 text-brand-blue'}`}
        >
          {isChatOpen ? <X size={20} /> : <Sparkles size={20} />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative no-scrollbar pb-40 px-safe">
        {activeMedia ? (
          <div className="p-4 space-y-4 max-w-lg mx-auto">
            {/* Context Info */}
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                   {activeMedia.type === MediaType.VIDEO && <Video size={16} className="text-brand-blue" />}
                   {activeMedia.type === MediaType.AUDIO && <Mic2 size={16} className="text-brand-blue" />}
                 </div>
                 <div>
                   <h2 className="text-white font-bold text-sm leading-none">{activeMedia.title}</h2>
                   <p className="text-[10px] text-brand-muted uppercase mt-1">מקור: Google Drive • {activeMedia.type}</p>
                 </div>
               </div>
            </div>

            <MediaWidget item={activeMedia} />

            {/* Description Card */}
            <div className="glass-item p-5 rounded-2xl border-white/5">
              <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-2 italic">תקציר AI אקטיבי</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                {activeMedia.description || 'תיאור התוכן מסונכרן אוטומטית מ-NotebookLM לקבלת תובנות מיידיות.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <LayoutIcon size={64} className="text-brand-muted mb-4 opacity-20" />
            <h3 className="text-white font-black uppercase text-xl">בחר תוכן הדרכה</h3>
            <p className="text-brand-muted text-sm mt-2">השתמש בתפריט הצד למעבר בין סרטונים, פודקאסטים ודפי ידע.</p>
          </div>
        )}
      </main>

      {/* Navigation Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 h-[85vh] bg-brand-dark/95 backdrop-blur-xl border-t border-white/10 z-[60] flex flex-col p-6 rounded-t-[2.5rem] pt-12 pb-safe font-sans"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                   <h2 className="text-white font-black text-xl uppercase italic">Catalog</h2>
                   <span className="text-[10px] text-brand-blue font-bold tracking-[0.2em]">The Academy Hub</span>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-11 h-11 bg-white/5 rounded-full flex items-center justify-center text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חפש הדרכה, סרטון או מסמך..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pr-11 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue/50"
                  dir="rtl"
                />
              </div>

              {/* Media List */}
              <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                 {filteredItems.map(item => (
                   <button
                    key={item.id}
                    onClick={() => selectMedia(item)}
                    className={`w-full text-right p-4 rounded-2xl transition-all flex items-center gap-4 border ${item.id === activeMedia?.id ? 'bg-brand-blue border-brand-blue text-brand-dark' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'}`}
                   >
                     <div className={`p-2 rounded-lg ${item.id === activeMedia?.id ? 'bg-brand-dark/20 text-brand-dark' : 'bg-brand-blue/10 text-brand-blue'}`}>
                        {item.type === MediaType.VIDEO && <Video size={18} />}
                        {item.type === MediaType.AUDIO && <Mic2 size={18} />}
                        {item.type === MediaType.PRESENTATION && <Map size={18} />}
                        {item.type === MediaType.DOCUMENT && <FileText size={18} />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate ${item.id === activeMedia?.id ? 'text-brand-dark' : 'text-white'}`}>{item.title}</p>
                        <p className={`text-[10px] truncate ${item.id === activeMedia?.id ? 'text-brand-dark/60' : 'text-brand-muted'}`}>{item.description}</p>
                     </div>
                     <ChevronLeft size={16} className="opacity-40" />
                   </button>
                 ))}
                 
                 {filteredItems.length === 0 && (
                   <div className="text-center py-12 text-brand-muted">
                      <Search size={32} className="mx-auto mb-4 opacity-20" />
                      <p className="text-xs">לא נמצאו תוצאות לחיפוש שלך</p>
                   </div>
                 )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-white/10 mt-6 space-y-3">
                 <button className="w-full p-4 bg-white/5 rounded-2xl text-slate-400 text-xs font-bold flex items-center justify-between hover:bg-white/10 transition-colors">
                    <span>היסטוריית צפייה מלאה</span>
                    <History size={16} />
                 </button>
                 <button className="w-full p-4 bg-brand-blue/10 border border-brand-blue/20 rounded-2xl text-brand-blue text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <Sparkles size={16} />
                    שאל את נועה על התוכן
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Chat Drawer */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 h-[80vh] bg-white rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] z-50 flex flex-col p-4"
          >
             <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 flex-shrink-0" onClick={() => setIsChatOpen(false)} />
             <NoaChat 
               products={products} 
               currentContext={activeMedia?.description || 'אין תוכן מוטמע'} 
               mediaItems={mediaItems}
               onNavigate={(id) => {
                 const target = mediaItems.find(m => m.id === id);
                 if (target) {
                   setActiveMedia(target);
                   setIsChatOpen(false); // Close chat to show the new media
                 }
               }}
             />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Floating Navigation for Quick Actions */}
      {!isChatOpen && (
        <div className="fixed bottom-0 inset-x-0 pb-6 pt-12 px-8 flex justify-center pointer-events-none group z-30 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent">
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex items-center gap-2 pointer-events-auto shadow-2xl active:scale-95 transition-transform mb-safe">
             <button onClick={() => setIsDrawerOpen(true)} className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors"><Map size={20}/></button>
             <div className="w-px h-6 bg-white/10" />
             <button onClick={() => setIsChatOpen(true)} className="h-12 px-6 bg-brand-blue text-brand-dark rounded-xl flex items-center gap-2 shadow-lg shadow-brand-blue/20">
                <Sparkles size={20} />
                <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">נועה Navigator</span>
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
