import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileAudio, 
  Presentation, 
  Video, 
  Network, 
  FileBarChart, 
  CreditCard, 
  HelpCircle, 
  Image, 
  Table2, 
  BookOpen, 
  ExternalLink,
  Plus,
  RefreshCw
} from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { fetchDriveFiles } from '../services/apiService';

interface ContentManagerProps {
  files: MediaItem[];
  setFiles: (files: MediaItem[]) => void;
  onSelect: (item: MediaItem) => void;
  activeItemId?: string;
}

const CATEGORIES = [
  { type: MediaType.AUDIO, label: 'סקירה קולית', icon: FileAudio, color: 'bg-indigo-500' },
  { type: MediaType.PRESENTATION, label: 'מצגת', icon: Presentation, color: 'bg-blue-500' },
  { type: MediaType.VIDEO, label: 'סרטון סקירה', icon: Video, color: 'bg-red-500' },
  { type: MediaType.MIND_MAP, label: 'מפת חשיבה', icon: Network, color: 'bg-emerald-500' },
  { type: MediaType.DOCUMENT, label: 'דוחות', icon: FileBarChart, color: 'bg-slate-500' },
  { type: MediaType.DOCUMENT, label: 'כרטיסי עזר', icon: CreditCard, color: 'bg-amber-500' },
  { type: MediaType.QUIZ, label: 'בוחן', icon: HelpCircle, color: 'bg-purple-500' },
  { type: MediaType.INFOGRAPHIC, label: 'אינפוגרפיקה', icon: Image, color: 'bg-pink-500' },
  { type: MediaType.DATA_TABLE, label: 'טבלת נתונים', icon: Table2, color: 'bg-cyan-500' },
  { type: MediaType.DOCUMENT, label: 'מקורות NotebookLM', icon: BookOpen, color: 'bg-orange-500' },
];

export const ContentManager: React.FC<ContentManagerProps> = ({ files, setFiles, onSelect, activeItemId }) => {
  const [filter, setFilter] = useState<MediaType | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncDrive = async () => {
    setIsSyncing(true);
    const driveFiles = await fetchDriveFiles();
    if (driveFiles.length > 0) {
      setFiles(driveFiles);
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    // Check if we have files in state, if not, sync once
    if (files.length <= 1) { // 1 is the initial dummy
      syncDrive();
    }

    // Set up automatic background sync every 5 minutes
    const interval = setInterval(() => {
      console.log('Background sync starting...');
      syncDrive();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const filteredFiles = filter 
    ? files.filter(f => f.type === filter) 
    : files;

  useEffect(() => {
    if (activeItemId) {
      localStorage.setItem('hub_last_viewed', activeItemId);
    }
  }, [activeItemId]);

  return (
    <div className="space-y-8">
      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {CATEGORIES.map((cat, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter(filter === cat.type ? null : cat.type)}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border ${
              filter === cat.type 
              ? 'bg-brand-blue/20 border-brand-blue shadow-lg shadow-brand-blue/20' 
              : 'glass-item border-white/5 hover:bg-white/5'
            }`}
          >
            <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
              <cat.icon size={20} />
            </div>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight">{cat.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          ניהול תוכן Drive
          <span className="noa-badge">G-Drive Sync Active</span>
        </h3>
        <div className="flex gap-2">
           <button 
             onClick={syncDrive}
             disabled={isSyncing}
             className="glass-item px-4 py-2 text-xs font-bold text-brand-blue flex items-center gap-2 hover:bg-brand-blue/10 transition-all disabled:opacity-50"
           >
             <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} /> 
             {isSyncing ? 'מסנכרן...' : 'סנכרן תיקייה'}
           </button>
        </div>
      </div>

      {/* Content List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFiles.map((file) => {
          const IconComponent = CATEGORIES.find(c => c.type === file.type)?.icon || BookOpen;
          return (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onSelect(file)}
              className={`group cursor-pointer rounded-2xl flex items-center gap-4 p-4 transition-all ${
                activeItemId === file.id 
                ? 'bg-white text-slate-900 shadow-2xl' 
                : 'glass-item border-white/5 hover:bg-white/5 text-white'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                activeItemId === file.id ? 'bg-slate-100 text-brand-blue' : 'bg-white/5 text-slate-400 group-hover:text-white'
              }`}>
                <IconComponent size={24} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate uppercase tracking-tight">{file.title}</h4>
                <p className={`text-[10px] mt-1 ${activeItemId === file.id ? 'text-slate-500' : 'text-brand-muted'} truncate`}>
                   מקור: Google Drive • {file.type}
                </p>
              </div>

              <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeItemId === file.id ? 'text-brand-blue' : 'text-brand-muted'}`}>
                <ExternalLink size={16} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
