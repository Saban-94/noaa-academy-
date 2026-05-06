import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Video, 
  BookOpen, 
  Settings, 
  Bell, 
  Search, 
  LogOut,
  Layers,
  Sparkles
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
    { id: 'academy', label: 'האקדמיה', icon: BookOpen },
    { id: 'media', label: 'מרכז מדיה', icon: Video },
    { id: 'catalog', label: 'קטלוג מוצרים', icon: Layers },
    { id: 'settings', label: 'הגדרות', icon: Settings },
  ];

  return (
    <div className="grid grid-cols-[220px_1fr] grid-rows-[64px_1fr] h-screen bg-brand-dark overflow-hidden font-sans">
      {/* Header */}
      <header className="col-span-2 bg-brand-dark/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <div className="text-xl font-black text-brand-blue tracking-tighter">THE ACADEMY HUB</div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="glass-item py-1 px-3 text-xs text-brand-muted hidden md:block">
            מרכז שליטה טכנולוגי
          </div>
          <button className="relative p-2 text-brand-muted hover:text-white transition-all">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-blue rounded-full border-2 border-brand-dark" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center font-bold text-brand-blue shadow-lg">
              ע
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar - Dark Mode */}
      <aside className="bg-black/20 border-l border-white/5 flex flex-col p-6 gap-6 z-30">
        <div className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">ניווט ראשי</div>
        
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item w-full flex items-center gap-3 ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="glass-item p-4 text-[11px] leading-relaxed text-brand-muted">
            <span className="text-brand-blue block font-bold mb-1">סטטוס מערכת:</span>
            מחובר לענן NotebookLM
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 mt-4 text-slate-500 hover:text-brand-blue transition-all">
            <LogOut size={18} />
            <span className="font-medium text-sm">התנתקות</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="bg-brand-content flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-6xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
