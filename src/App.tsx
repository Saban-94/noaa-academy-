/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from './components/Layout';
import { MediaWidget, LinkImporter } from './components/MediaWidget';
import { MediaCenter } from './components/MediaCenter';
import { ContentManager } from './components/ContentManager';
import { NoaChat } from './components/NoaChat';
import { ProductCatalog } from './components/ProductCatalog';
import { MediaItem, MediaType, Product } from './types';
import { Sparkles, MessageCircle, X, Smartphone, Monitor } from 'lucide-react';
import { fetchProducts } from './services/apiService';

const DUMMY_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'נירלט משפר היצמדות',
    price: 189,
    description: 'חומר יסוד לקירות פנים וחוץ, משפר את עמידות הצבע ומונע קילופים.',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=400',
    category: 'צבע ובנייה',
    upsellProducts: ['2']
  },
  {
    id: '2',
    name: 'סט מברשות מקצועי',
    price: 45,
    description: 'מברשת סינתטית איכותית ב-3 גדלים שונים לדיוק מרבי.',
    image: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&q=80&w=400',
    category: 'כלי עבודה',
  },
  {
    id: '3',
    name: 'סיקה פלקס 11FC',
    price: 34,
    description: 'דבק איטום גמיש וחזק במיוחד לכל סוגי התשתיות.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400',
    category: 'איטום'
  }
];

const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'm1',
    type: MediaType.VIDEO,
    title: 'הדרכת נירלט: קירות פנים',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'סרטון הדרכה מעמיק על יישום צבעים אקריליים.'
  },
  {
    id: 'm2',
    type: MediaType.AUDIO,
    title: 'סקירה קולית: צבעי נירלט 2024',
    url: 'https://drive.google.com/file/d/13Mdl9DJSEVVXEGwGifSQV3rTP_B4T6Y6/view',
    description: 'פודקאסט שיווקי שנוצר ב-NotebookLM על בסיס קטלוג המוצרים.'
  },
  {
    id: 'm3',
    type: MediaType.PRESENTATION,
    title: 'מצגת מכירות: פרויקטי תשתית',
    url: 'https://docs.google.com/presentation/d/13Mdl9DJSEVVXEGwGifSQV3rTP_B4T6Y6/edit',
    description: 'סקירה של פרויקטי בנייה ותשתיות לשנת 2024.'
  },
  {
    id: 'm4',
    type: MediaType.QUIZ,
    title: 'בוחן ריענון: בטיחות באתר בנייה',
    url: '#',
    description: 'בדיקת ידע תקופתית לנציגי המכירות.'
  },
  {
    id: 'm5',
    type: MediaType.DATA_TABLE,
    title: 'טבלת מחירונים: סיקה ונירלט',
    url: '#',
    description: 'מחירון מעודכן לקבלנים.'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [products, setProducts] = useState<Product[]>(DUMMY_PRODUCTS);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(() => {
    const lastId = localStorage.getItem('hub_last_viewed');
    return INITIAL_MEDIA.find(m => m.id === lastId) || INITIAL_MEDIA[0];
  });
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      const fetched = await fetchProducts();
      if (fetched.length > 0) {
        setProducts(fetched);
      }
    };
    loadProducts();
  }, []);

  const handleImport = (url: string) => {
    let type = MediaType.DOCUMENT;
    if (url.includes('youtube') || url.includes('video')) type = MediaType.VIDEO;
    if (url.includes('audio') || url.includes('podcast')) type = MediaType.AUDIO;

    const newItem: MediaItem = {
      id: Date.now().toString(),
      type: type,
      title: 'הדרכה חדשה',
      url: url,
      description: 'תוכן שהוטמע מהרשת'
    };
    setMediaItems([newItem, ...mediaItems]);
    setActiveMedia(newItem);
  };

  if (viewMode === 'mobile') {
    return (
      <div className="relative h-screen w-full overflow-hidden">
        <MediaCenter mediaItems={mediaItems} products={products} />
        
        {/* View Mode Toggle Overlay */}
        <button 
          onClick={() => setViewMode('desktop')}
          className="fixed bottom-6 left-6 w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white z-50 hover:bg-white/10"
          title="Switch to Desktop Admin"
        >
          <Monitor size={16} />
        </button>
      </div>
    );
  }

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-white">מרכז בקרה ותוכן</h2>
                <p className="text-brand-muted mt-1">מחובר ל-Google Drive • סנכרון תכני NotebookLM פעיל</p>
              </div>
              <LinkImporter onImport={handleImport} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
              <div className="space-y-8">
                {activeMedia && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-white">
                      <h3 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
                        <Sparkles size={16} className="text-brand-blue" />
                        נגן תוכן פעיל
                      </h3>
                      <span className="text-[10px] text-brand-muted font-mono uppercase">{activeMedia.title}</span>
                    </div>
                    <MediaWidget item={activeMedia} />
                  </div>
                )}
                
                <ContentManager 
                  files={mediaItems} 
                  setFiles={setMediaItems}
                  onSelect={setActiveMedia} 
                  activeItemId={activeMedia?.id} 
                />
              </div>

              <div className="space-y-8">
                <div className="bg-gradient-to-br from-brand-blue to-indigo-700 p-8 rounded-[2rem] text-brand-dark shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
                  <Sparkles size={40} className="mb-6 opacity-30" />
                  <h3 className="text-2xl font-black leading-tight uppercase">התקדמות הדרכה<br />רבעונית</h3>
                  <div className="mt-8 flex items-end justify-between">
                    <div>
                      <span className="text-5xl font-black">92%</span>
                      <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-brand-dark/60">נציג מצטיין החודש</p>
                    </div>
                    <div className="h-24 w-4 bg-black/10 rounded-full flex flex-col justify-end">
                      <div className="h-[92%] w-full bg-brand-dark rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="glass-item p-6 rounded-3xl border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-brand-muted uppercase tracking-widest">היסטוריית Sheets</h4>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    {[1,2].map(i => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <p className="text-[11px] text-slate-300 line-clamp-1">"איך להציע Upsell לצבע אקרילי?"</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[9px] text-brand-muted uppercase font-bold">לפני 5 דקות</span>
                          <span className="text-[9px] text-brand-blue font-bold">נועה ענתה</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-3 text-[10px] font-black text-brand-blue uppercase tracking-widest border border-brand-blue/20 rounded-xl hover:bg-brand-blue/5 transition-all">
                    צפה ביומן המלא ב-Sheets
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'catalog':
        return <ProductCatalog 
          products={products} 
          onSelectMedia={(item) => {
            setMediaItems(prev => [item, ...prev.filter(m => m.id !== item.id)]);
            setActiveMedia(item);
            setActiveTab('dashboard');
          }}
        />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-500">
            בפיתוח...
          </div>
        );
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="fixed top-24 right-8 z-50">
         <button 
           onClick={() => setViewMode('mobile')}
           className="flex items-center gap-2 bg-brand-dark/20 backdrop-blur-md px-4 py-2 rounded-xl text-brand-dark text-xs font-bold border border-brand-dark/10 hover:bg-brand-dark/30 transition-all shadow-xl"
         >
           <Smartphone size={16} />
           מסוף מובייל
         </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderActiveContent()}
        </motion.div>
      </AnimatePresence>

      {/* Floating Chat Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-8 left-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all z-50 ${isChatOpen ? 'bg-red-500 rotate-90' : 'bg-blue-600 hover:bg-blue-500 hover:scale-110'}`}
      >
        {isChatOpen ? <X size={32} className="text-white" /> : <MessageCircle size={32} className="text-white" />}
      </button>

      {/* Chat Sidebar/Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.95 }}
            className="fixed bottom-28 left-8 w-96 h-[600px] z-50 shadow-2xl"
          >
            <NoaChat 
              products={products} 
              currentContext={activeMedia?.description || 'אין תוכן מוטמע כרגע'} 
              onSelectMedia={(item) => {
                setMediaItems(prev => [item, ...prev.filter(m => m.id !== item.id)]);
                setActiveMedia(item);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
