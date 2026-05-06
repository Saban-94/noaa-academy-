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
  RefreshCw,
  FileSearch
} from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { summarizePresentation } from '../services/geminiService';

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
    case MediaType.DOCUMENT:
      // Optimized viewer URL for in-app presentation/document viewing
      return `https://docs.google.com/viewer?srcid=${fileId}&embedded=true&rm=minimal&chrome=false`;
    case MediaType.VIDEO:
    case MediaType.AUDIO:
      return `https://drive.google.com/file/d/${fileId}/preview`;
    default:
      return `https://docs.google.com/viewer?srcid=${fileId}&embedded=true`;
  }
};

const MIND_MAP_DATA = {
  id: 'root',
  label: 'אסטרטגיית נירלט 2025',
  children: [
    {
      id: 'c1',
      label: 'טכנולוגיה וחווית לקוח',
      children: [
        { id: 'c1-1', label: 'אפליקציית סריקת צבע' },
        { id: 'c1-2', label: 'מציאות רבודה (AR) לעיצוב פנים' },
        { id: 'c1-3', label: 'צ\'אטבוט "נועה" לשירות עצמי' },
      ]
    },
    {
      id: 'c2',
      label: 'קיימות ובנייה ירוקה',
      children: [
        { id: 'c2-1', label: 'פיתוח צבעים על בסיס מים' },
        { id: 'c2-2', label: 'חיסכון באנרגיה בייצור' },
        { id: 'c2-3', label: 'מיחזור אריזות' },
      ]
    },
    {
      id: 'c3',
      label: 'אופטימיזציית שרשרת אספקה',
      children: [
        { id: 'c3-1', label: 'ניהול מלאי מבוסס AI' },
        { id: 'c3-2', label: 'קיצור זמני הפצה' },
        { id: 'c3-3', label: 'שיתוף פעולה עם לוגיסטיקה חכמה' },
      ]
    }
  ]
};

interface MindMapNodeProps {
  node: any;
  level?: number;
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
}

const MindMapBranch: React.FC<MindMapNodeProps> = ({ node, level = 0, expandedNodes, toggleNode }) => {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`flex flex-col ${level > 0 ? 'mr-6 border-r-2 border-brand-blue/20 pr-4 mt-2' : 'w-full'}`}>
      <motion.div 
        layout
        onClick={() => hasChildren && toggleNode(node.id)}
        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
          level === 0 
          ? 'bg-brand-blue border-brand-blue text-brand-dark shadow-xl shadow-brand-blue/20' 
          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${level === 0 ? 'bg-brand-dark/20' : 'bg-brand-blue/10'}`}>
            <Network size={16} className={level === 0 ? 'text-brand-dark' : 'text-brand-blue'} />
          </div>
          <span className={`text-sm font-bold ${level === 0 ? 'text-brand-dark' : 'text-white'}`}>{node.label}</span>
        </div>
        {hasChildren && (
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            className={level === 0 ? 'text-brand-dark' : 'text-brand-blue'}
          >
            <Plus size={16} />
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-2"
          >
            {node.children.map((child: any) => (
              <MindMapBranch key={child.id} node={child} level={level + 1} expandedNodes={expandedNodes} toggleNode={toggleNode} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const MediaWidget: React.FC<MediaWidgetProps> = ({ item }) => {
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(() => {
    return parseInt(localStorage.getItem(`slide_${item.id}`) || '1');
  });
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(localStorage.getItem(`page_${item.id}`) || '1');
  });
  const [zoom, setZoom] = useState(() => {
    return parseFloat(localStorage.getItem(`zoom_${item.id}`) || '1');
  });
  const [transcriptionIndex, setTranscriptionIndex] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [rawTableData, setRawTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [presentationSummary, setPresentationSummary] = useState<string | null>(() => {
    return localStorage.getItem(`summary_${item.id}`);
  });
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isLocalFullscreen, setIsLocalFullscreen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const totalSlides = 12;

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      // Try to lock orientation to landscape on mobile if possible
      if (window.screen.orientation && (window.screen.orientation as any).lock) {
        (window.screen.orientation as any).lock('landscape').catch(() => {});
      }
    } else {
      document.exitFullscreen();
    }
  };

  // Persist state
  useEffect(() => {
    localStorage.setItem(`slide_${item.id}`, currentSlide.toString());
    localStorage.setItem(`page_${item.id}`, currentPage.toString());
    localStorage.setItem(`zoom_${item.id}`, zoom.toString());
  }, [currentSlide, currentPage, zoom, item.id]);

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

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));

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
  const nextPage = () => setCurrentPage(prev => prev + 1);
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  const handleSummarize = async () => {
    setIsGeneratingSummary(true);
    try {
      const summary = await summarizePresentation(item.title, item.url);
      setPresentationSummary(summary);
      localStorage.setItem(`summary_${item.id}`, summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

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
          <div ref={containerRef} className="relative aspect-video bg-black rounded-2xl overflow-hidden group shadow-2xl">
            <motion.div 
               animate={{ scale: zoom }}
               transition={{ type: 'spring', stiffness: 300, damping: 30 }}
               className="w-full h-full origin-center"
            >
              <iframe
                src={getEmbedUrl(item.url, MediaType.VIDEO)}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                title={item.title}
                onError={() => setLoadError(true)}
              />
            </motion.div>
            
            {/* Floating Top Controls */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all z-20">
              <div className="flex bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                 <button 
                  onClick={() => setPlaybackSpeed(prev => prev === 2 ? 0.5 : prev + 0.5)}
                  className="w-12 h-12 flex items-center justify-center text-[10px] font-black text-white hover:bg-white/10 transition-colors border-l border-white/5 uppercase"
                 >
                   x{playbackSpeed}
                 </button>
                 <button onClick={zoomIn} className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 transition-colors border-l border-white/5"><ZoomIn size={20}/></button>
                 <button onClick={zoomOut} className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 transition-colors"><ZoomOut size={20}/></button>
              </div>
              
              <button 
                onClick={toggleFullscreen} 
                className="w-12 h-12 flex items-center justify-center bg-brand-blue text-brand-dark rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Maximize2 size={20} />
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
      case MediaType.DOCUMENT:
        const isDoc = item.type === MediaType.DOCUMENT;
        return (
          <div className="space-y-4">
            <div 
              ref={containerRef} 
              className={`relative bg-slate-100 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group transition-all duration-500 ${
                isLocalFullscreen ? 'fixed inset-0 z-[100] rounded-none' : 'aspect-[16/9]'
              }`}
            >
               <motion.div 
                 drag={zoom > 1}
                 dragConstraints={{ left: -200 * zoom, right: 200 * zoom, top: -400 * zoom, bottom: 400 * zoom }}
                 animate={{ 
                   scale: zoom,
                   x: zoom > 1 ? undefined : 0, 
                   y: zoom > 1 ? undefined : 0
                 }}
                 transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                 className="absolute inset-0 w-full h-full origin-center"
               >
                 <iframe 
                   src={getEmbedUrl(item.url, item.type)}
                   className="w-full h-full border-0"
                   sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                   title={item.title}
                 />
               </motion.div>
 
               {/* Floating Overlay Controls (Glassmorphism) */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl z-30 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex bg-white/5 rounded-xl overflow-hidden border border-white/5">
                    <button onClick={zoomOut} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 text-white transition-colors"><ZoomOut size={18}/></button>
                    <div className="px-3 flex items-center text-[10px] font-black text-white min-w-[50px] justify-center">{Math.round(zoom * 100)}%</div>
                    <button onClick={zoomIn} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 text-white transition-colors border-r border-white/5"><ZoomIn size={18}/></button>
                  </div>

                  <div className="h-6 w-px bg-white/10 mx-1" />

                  {isDoc ? (
                    <div className="flex items-center gap-2 px-4">
                       <button onClick={prevPage} className="text-white/60 hover:text-white transition-colors"><ChevronRight size={20}/></button>
                       <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest min-w-[60px] text-center">עמוד {currentPage}</span>
                       <button onClick={nextPage} className="text-white/60 hover:text-white transition-colors"><ChevronLeft size={20}/></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4">
                       <button onClick={prevSlide} className="text-white/60 hover:text-white transition-colors"><ChevronRight size={20}/></button>
                       <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest min-w-[60px] text-center">שקף {currentSlide} / {totalSlides}</span>
                       <button onClick={nextSlide} className="text-white/60 hover:text-white transition-colors"><ChevronLeft size={20}/></button>
                    </div>
                  )}

                  <div className="h-6 w-px bg-white/10 mx-1" />

                  <button 
                    onClick={() => setIsLocalFullscreen(!isLocalFullscreen)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isLocalFullscreen ? 'bg-brand-blue text-brand-dark' : 'text-white hover:bg-white/10'}`}
                  >
                    <Maximize2 size={18} />
                  </button>
               </div>

               {/* Top Right Quick Actions */}
               <div className="absolute top-4 right-4 flex items-center gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                     <Sparkles size={12} className="text-brand-blue animte-pulse" />
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">
                       {isDoc ? 'מסמך טכני Native' : 'מצגת Native'}
                     </span>
                  </div>
               </div>
            </div>
 
            {/* Footer / Summary Bar */}
            <div className="flex flex-col gap-4 bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-blue/30 shadow-xl">
                      <img 
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" 
                        alt="Noa"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">ניתוח של נועה</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">בסיס נתונים NotebookLM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleSummarize}
                      disabled={isGeneratingSummary}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-brand-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all disabled:opacity-50"
                    >
                      {isGeneratingSummary ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <FileSearch size={14} />
                      )}
                      סיכום AI
                    </button>
 
                    <button 
                      onClick={() => window.open(item.url, '_blank')}
                      className="text-brand-blue font-bold text-xs flex items-center gap-2 hover:underline tracking-tight"
                    >
                      <ExternalLink size={16} /> לצפייה ב-Google Docs
                    </button>
                  </div>
                </div>
 
                <AnimatePresence>
                  {presentationSummary && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                           <Sparkles size={14} className="text-brand-blue" />
                           <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">תובנות מפתח מנועה (AI Insights)</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                          {presentationSummary}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
      case MediaType.MIND_MAP: {
        const toggleNode = (id: string) => {
          const next = new Set(expandedNodes);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          setExpandedNodes(next);
        };

        const expandAll = () => {
          const allIds = ['root', 'c1', 'c1-1', 'c1-2', 'c1-3', 'c2', 'c2-1', 'c2-2', 'c2-3', 'c3', 'c3-1', 'c3-2', 'c3-3'];
          setExpandedNodes(new Set(allIds));
        };

        const collapseAll = () => {
          setExpandedNodes(new Set(['root']));
        };

        return (
          <div className="p-6 bg-slate-900 rounded-3xl border border-white/5 relative overflow-hidden min-h-[400px] transition-all duration-500 font-sans text-right" dir="rtl">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <Network size={300} className="text-brand-blue -translate-x-1/4 -translate-y-1/4 absolute top-0 left-0" />
            </div>
            
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                   <h4 className="text-white font-black text-lg uppercase italic tracking-tighter">Mind Map Explorer</h4>
                   <span className="text-[10px] text-brand-blue font-bold tracking-widest uppercase mt-0.5">סנכרון לוגי NotebookLM</span>
                </div>
                
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                   <button 
                    onClick={expandAll}
                    className="px-3 py-2 text-[9px] font-black text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors uppercase tracking-widest"
                   >
                     Expand All
                   </button>
                   <div className="w-px h-4 bg-white/10 self-center" />
                   <button 
                    onClick={collapseAll}
                    className="px-3 py-2 text-[9px] font-black text-slate-400 hover:bg-white/5 rounded-lg transition-colors uppercase tracking-widest"
                   >
                     Reset
                   </button>
                </div>
              </div>

              <div className="w-full space-y-4">
                <MindMapBranch node={MIND_MAP_DATA} expandedNodes={expandedNodes} toggleNode={toggleNode} />
              </div>
            </div>
          </div>
        );
      }
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

