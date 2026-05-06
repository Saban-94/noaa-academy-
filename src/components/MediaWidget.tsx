import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Music, 
  FileText, 
  ExternalLink, 
  Plus, 
  Gauge, 
  Info, 
  Presentation, 
  HelpCircle, 
  Table2, 
  Image, 
  Network,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { MediaItem, MediaType } from '../types';

interface MediaWidgetProps {
  item: MediaItem;
}

/**
 * Utility to convert Google Drive sharing links to embeddable ones
 */
const getEmbedUrl = (url: string, type: MediaType) => {
  if (!url) return url;
  
  // Handle YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
    }
  }

  if (!url.includes('drive.google.com')) return url;
  
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!fileIdMatch) return url;
  const fileId = fileIdMatch[1];

  switch (type) {
    case MediaType.PRESENTATION:
      return `https://docs.google.com/presentation/d/${fileId}/embed?start=false&loop=false&delayms=3000&rm=minimal`;
    case MediaType.VIDEO:
    case MediaType.AUDIO:
      return `https://drive.google.com/file/d/${fileId}/preview`;
    default:
      return `https://docs.google.com/viewer?srcid=${fileId}&embedded=true`;
  }
};

export const MediaWidget: React.FC<MediaWidgetProps> = ({ item }) => {
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(() => {
    return parseInt(localStorage.getItem(`slide_${item.id}`) || '1');
  });
  const [zoom, setZoom] = useState(() => {
    return parseFloat(localStorage.getItem(`zoom_${item.id}`) || '1');
  });
  const [transcriptionIndex, setTranscriptionIndex] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [rawTableData, setRawTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const totalSlides = 12;

  // Persist state
  useEffect(() => {
    localStorage.setItem(`slide_${item.id}`, currentSlide.toString());
    localStorage.setItem(`zoom_${item.id}`, zoom.toString());
  }, [currentSlide, zoom, item.id]);

  /**
   * Handle CSV/Table data loading via API to bypass iFrame blocks
   */
  useEffect(() => {
    if (item.type === MediaType.DATA_TABLE) {
      setIsLoading(true);
      // Simulating loading data from GAS for tables
      setTimeout(() => {
        setRawTableData([
          { 'מוצר': 'נירלט משפר', 'מחיר': '189', 'סטטוס': 'במלאי' },
          { 'מוצר': 'סיקה-פלקס', 'מחיר': '34', 'סטטוס': 'במלאי' },
          { 'מוצר': 'מברשת פרו', 'מחיר': '45', 'סטטוס': 'אזל' },
        ]);
        setIsLoading(false);
      }, 800);
    }
  }, [item.type, item.id]);

  const TRANSCRIPTION_DATA = [
    "ברוכים הבאים להדרכה על הבית החכם של נירלט.",
    "היום נלמד איך לשלב טכנולוגיה בעיצוב הבית.",
    "הצבעים האקריליים שלנו מותאמים במיוחד לתנאי תאורה משתנים.",
    "שימו לב לטקסטורה המיוחדת שאנחנו משיגים כאן.",
    "זהו פתרון מושלם לקבלנים שרוצים ערך מוסף ללקוח.",
    "נועה כאן לסייע לכם בכל שאלה טכנית שעולה.",
  ];

  useEffect(() => {
    if (item.type === MediaType.VIDEO) {
      const interval = setInterval(() => {
        setTranscriptionIndex((prev) => (prev + 1) % TRANSCRIPTION_DATA.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [item.type]);

  const [isMindMapExpanded, setIsMindMapExpanded] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (item.type === MediaType.PRESENTATION) {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item.type, currentSlide]);

  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 1));
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  const renderContent = () => {
    if (loadError) {
      return (
        <div className="p-12 text-center bg-brand-light rounded-2xl border-2 border-dashed border-red-200">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h4 className="font-bold text-slate-800 mb-2 uppercase">דרושה הרשאה (Authorization Required)</h4>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
            נראה כי הקובץ חסום או שאינך מחובר לחשבון הארגוני המורשה.
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={() => window.open(item.url, '_blank')} className="bg-brand-dark text-white px-6 py-2 rounded-xl text-xs font-bold">פתח ב-Drive</button>
            <button onClick={() => setLoadError(false)} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <RefreshCw size={14} /> נסה שוב
            </button>
          </div>
        </div>
      );
    }

    switch (item.type) {
      case MediaType.VIDEO:
        return (
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden group shadow-2xl">
            <iframe
              src={getEmbedUrl(item.url, MediaType.VIDEO)}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              title={item.title}
              onError={() => setLoadError(true)}
            />
            
            {/* Floating Top Controls */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all z-20">
              <div className="flex bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                 <button 
                  onClick={() => setPlaybackSpeed(prev => prev === 2 ? 0.5 : prev + 0.5)}
                  className="w-12 h-11 flex items-center justify-center text-[10px] font-black text-white hover:bg-white/10 transition-colors border-l border-white/5 uppercase"
                 >
                   x{playbackSpeed}
                 </button>
                 <button onClick={zoomIn} className="w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 transition-colors border-l border-white/5"><ZoomIn size={18}/></button>
                 <button onClick={zoomOut} className="w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 transition-colors"><ZoomOut size={18}/></button>
              </div>
              
              <button 
                onClick={() => window.open(item.url, '_blank')} 
                className="w-11 h-11 flex items-center justify-center bg-brand-blue text-brand-dark rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Maximize2 size={18} />
              </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={transcriptionIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-xl max-w-2xl mx-auto"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-2 h-2 bg-brand-blue rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">תמלול AI בזמן אמת</span>
                  </div>
                  <p className="text-white text-lg font-bold leading-tight">
                    {TRANSCRIPTION_DATA[transcriptionIndex]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="absolute top-4 right-4 bg-brand-blue/90 backdrop-blur text-brand-dark px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-xl opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">
              <Sparkles size={14} />
              AI Grounding Active
            </div>
          </div>
        );
      case MediaType.AUDIO:
        return (
          <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                <Music size={32} className="text-brand-blue" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">{item.title}</h4>
                <p className="text-slate-500 text-sm">הוטמע מ-NotebookLM • אודיו</p>
              </div>
              <div className="mr-auto">
                <button 
                  onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 1.5 : 1)}
                  className="px-3 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  x{playbackSpeed} מהירות
                </button>
              </div>
            </div>
            
            <div className="h-10 flex items-center gap-1">
              {[0.4, 0.6, 0.3, 0.8, 0.5, 0.9, 0.7, 0.4, 0.6, 0.3, 0.8, 0.5, 0.9, 0.7, 0.4, 0.6].map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-sm ${i < 9 ? 'bg-brand-blue' : 'bg-slate-300'}`} 
                  style={{ height: `${h * 100}%` }} 
                />
              ))}
            </div>
          </div>
        );
      case MediaType.PRESENTATION:
        return (
          <div className="space-y-4">
            <div className="relative aspect-[16/9] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-inner group">
               <motion.div 
                 animate={{ scale: zoom }}
                 transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                 className="absolute inset-0 w-full h-full"
               >
                 <iframe 
                   src={getEmbedUrl(item.url, MediaType.PRESENTATION)}
                   className="w-full h-full border-0"
                   sandbox="allow-scripts allow-same-origin"
                   title={item.title}
                 />
               </motion.div>

               {/* Glass UI Controls */}
               <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                 <div className="flex bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
                   <button onClick={zoomOut} className="w-11 h-11 flex items-center justify-center hover:bg-white/10 text-white transition-colors border-l border-white/5"><ZoomOut size={18}/></button>
                   <div className="px-3 flex items-center text-[10px] font-bold text-white min-w-[50px] justify-center">{Math.round(zoom * 100)}%</div>
                   <button onClick={zoomIn} className="w-11 h-11 flex items-center justify-center hover:bg-white/10 text-white transition-colors border-r border-white/5"><ZoomIn size={18}/></button>
                 </div>
                 <button onClick={() => window.open(item.url, '_blank')} className="w-11 h-11 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors">
                   <Maximize2 size={18} />
                 </button>
               </div>
               
               {/* Slide Nav Overlay */}
               <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={prevSlide} className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white pointer-events-auto hover:bg-white/20 transition-all shadow-xl active:scale-95"><ChevronRight size={24}/></button>
                 <button onClick={nextSlide} className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white pointer-events-auto hover:bg-white/20 transition-all shadow-xl active:scale-95"><ChevronLeft size={24}/></button>
               </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
               <div className="flex items-center gap-4">
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">מצגת סנכרון NotebookLM</span>
                 <div className="flex gap-1">
                   {[1,2,3,4].map(i => <div key={i} className={`h-1.5 w-8 rounded-full ${i === 1 ? 'bg-brand-blue' : 'bg-slate-200'}`} />)}
                 </div>
               </div>
               <button className="text-brand-blue font-bold text-xs flex items-center gap-2 hover:underline">
                 <ExternalLink size={16} /> דפדף ב-Google Docs
               </button>
            </div>
          </div>
        );
      case MediaType.DATA_TABLE:
        return (
          <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm min-h-[200px]">
             {isLoading ? (
               <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                 <RefreshCw size={32} className="animate-spin mb-2" />
                 <span className="text-xs font-bold uppercase tracking-widest">טוען נתונים גולמיים מ-Drive...</span>
               </div>
             ) : (
                <table className="w-full text-right">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    <tr>
                      {rawTableData.length > 0 && Object.keys(rawTableData[0]).map(k => <th key={k} className="px-6 py-4">{k}</th>)}
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {rawTableData.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        {Object.values(row).map((v: any, j) => (
                          <td key={j} className={`px-6 py-4 ${j === 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                            {j === 1 ? `₪${v}` : v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
             )}
          </div>
        );
      case MediaType.MIND_MAP:
        return (
          <div className="p-8 bg-slate-900 rounded-2xl border border-white/5 relative overflow-hidden min-h-[320px] transition-all duration-500">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <Network size={200} className="text-brand-blue -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex gap-4 mb-8">
                <motion.div 
                  animate={{ scale: isMindMapExpanded ? 1.1 : 1 }}
                  className="w-16 h-16 bg-brand-blue/20 rounded-full flex items-center justify-center border border-brand-blue/30"
                >
                  <Network size={32} className="text-brand-blue" />
                </motion.div>
              </div>

              <div className="w-full max-w-md space-y-3">
                <div 
                  onClick={() => setIsMindMapExpanded(!isMindMapExpanded)}
                  className="p-4 glass-item bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-sm">נושא מרכזי: אסטרטגיית נירלט 2025</span>
                    <Plus size={16} className={`text-brand-blue transition-transform duration-300 ${isMindMapExpanded ? 'rotate-45' : ''}`} />
                  </div>
                </div>

                <AnimatePresence>
                  {isMindMapExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-2 pr-4 border-r-2 border-brand-blue/30 mr-4"
                    >
                      <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-brand-muted">תת-נושא א: שיפור חווית לקוח דרך טכנולוגיה</div>
                      <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-brand-muted">תת-נושא ב: אופטימיזציית שרשרת האספקה</div>
                      <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-brand-muted">תת-נושא ג: דגש על בנייה ירוקה</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );
      case MediaType.QUIZ:
        return (
          <div className="p-8 bg-brand-light rounded-2xl border-2 border-dashed border-slate-200 text-center">
            <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue mx-auto mb-6">
              <HelpCircle size={40} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-2 uppercase">בוחן ריענון מ-NotebookLM</h4>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">בחן את עצמך על התוכן האחרון שהועלה וקבל משוב מיידי מנועה.</p>
            <button className="bg-brand-dark text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:scale-105 transition-transform">
              התחל בוחן (3 דקות)
            </button>
          </div>
        );
      case MediaType.INFOGRAPHIC:
        return (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
            <div className="absolute top-4 right-4 z-10">
              <span className="noa-badge bg-pink-500 text-white">אינפוגרפיקה AI</span>
            </div>
            <div className="aspect-video flex items-center justify-center p-8">
              <Image size={80} className="text-slate-300 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 italic">מיוצר אוטומטית מנתוני NotebookLM</span>
              <button className="text-brand-blue font-bold text-xs flex items-center gap-1"><ExternalLink size={14}/> הגדל תמונה</button>
            </div>
          </div>
        );
      default:
        return (
           <div className="relative h-96 bg-slate-200 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-300 group hover:border-brand-blue transition-colors overflow-hidden">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
            <FileText size={64} className="text-slate-400 group-hover:text-brand-blue transition-colors mb-4 relative z-10" />
            <div className="relative z-10 text-center">
              <p className="text-slate-600 font-bold uppercase tracking-tight">תצוגת מסמך / דו"ח</p>
              <button onClick={() => window.open(item.url, '_blank')} className="mt-4 flex items-center gap-2 px-6 py-2 bg-white shadow-xl rounded-xl text-brand-blue font-black text-xs hover:bg-slate-50 transition-colors uppercase">
                <ExternalLink size={16} />
                פתח ב-Google Drive
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="content-card mb-8 shadow-2xl border border-slate-100"
    >
      <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          {item.type === MediaType.VIDEO && <Play size={18} className="text-brand-blue" />}
          {item.type === MediaType.AUDIO && <Music size={18} className="text-brand-blue" />}
          <span className="uppercase tracking-tight text-sm font-bold">{item.title}</span>
        </h3>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{item.type}</span>
      </div>
      <div className="p-6">
        {renderContent()}
      </div>
    </motion.div>
  );
};

export const LinkImporter: React.FC<{ onImport: (url: string) => void }> = ({ onImport }) => {
  const [url, setUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-brand-blue hover:bg-cyan-400 text-brand-dark px-6 py-3 rounded-lg shadow-lg shadow-brand-blue/20 transition-all active:scale-95 z-20 font-bold"
      >
        <Plus size={20} />
        <span>ייבוא לינק חדש</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-full right-0 mt-4 w-96 glass-item p-6 rounded-2xl shadow-2xl z-50 text-slate-900 bg-white border border-slate-100"
          >
            <h4 className="font-bold mb-4 text-lg">ייבוא מ-NotebookLM</h4>
            <p className="text-sm text-slate-500 mb-4">הדבק לינק לפודקאסט, מצגת או וידאו הדרכה</p>
            <div className="space-y-4">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all text-left"
                dir="ltr"
              />
              <button 
                onClick={() => {
                  onImport(url);
                  setUrl('');
                  setIsOpen(false);
                }}
                className="w-full py-3 bg-brand-blue text-brand-dark rounded-lg font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
              >
                ייבא עכשיו
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

