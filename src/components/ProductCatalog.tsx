import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ShoppingCart, Tag, ChevronRight, X, Sparkles, ArrowLeft, Video } from 'lucide-react';
import { Product } from '../types';

interface ProductCatalogProps {
  products: Product[];
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRelatedProducts = (product: Product) => {
    // 1. Get upsell products by ID
    const upsells = products.filter(p => product.upsellProducts?.includes(p.id));
    
    // 2. Get products in same category (excluding current and upsells already found)
    const sameCategory = products.filter(p => 
      p.category === product.category && 
      p.id !== product.id && 
      !upsells.some(u => u.id === p.id)
    );

    // Combine and limit to 4
    return [...upsells, ...sameCategory].slice(0, 4);
  };

  return (
    <div className="content-card h-full flex flex-col relative overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-white z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">קטלוג מוצרים</h2>
            <p className="text-sm text-slate-500">חומרי בניין, כלי עבודה ופתרונות מתקדמים</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="חיפוש מוצר..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all text-sm w-64"
              />
              <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
            </div>
            <button className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
              <Filter size={18} className="text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-brand-light/30">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layoutId={`product-${product.id}`}
              onClick={() => setSelectedProduct(product)}
              whileHover={{ y: -5 }}
              className="group bg-white rounded-xl border border-slate-200/50 shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <motion.img 
                  layoutId={`image-${product.id}`}
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-brand-blue border border-brand-blue/20 shadow-sm">
                  {product.category}
                </div>
              </div>
              
              <div className="p-5">
                <motion.h4 layoutId={`name-${product.id}`} className="font-bold text-slate-800 group-hover:text-brand-blue transition-colors uppercase truncate tracking-tight">
                  {product.name}
                </motion.h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[2.5rem]">
                  {product.description}
                </p>
                
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">מחיר לצרכן</span>
                    <motion.span layoutId={`price-${product.id}`} className="text-xl font-black text-brand-dark">₪{product.price}</motion.span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const folderId = '13Mdl9DJSEVVXEGwGifSQV3rTP_B4T6Y6';
                      const searchUrl = `https://drive.google.com/drive/u/0/search?q=parent:${folderId}%20${encodeURIComponent(product.name)}`;
                      window.open(searchUrl, '_blank');
                    }}
                    className="w-10 h-10 bg-brand-blue hover:bg-brand-dark text-brand-dark hover:text-white rounded-lg flex items-center justify-center transition-all shadow-lg shadow-brand-blue/20 active:scale-95"
                  >
                    <Video size={18} />
                  </button>
                </div>
              </div>

              {product.upsellProducts && product.upsellProducts.length > 0 && (
                <div className="px-4 py-2 bg-brand-blue/5 border-t border-brand-blue/10 flex items-center justify-between">
                  <span className="text-[10px] font-black text-brand-blue flex items-center gap-1 uppercase tracking-tighter">
                    <Tag size={10} />
                    הצעה משלימה (Upsell)
                  </span>
                  <ChevronRight size={14} className="text-brand-blue opacity-50" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail View Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div 
              layoutId={`product-${selectedProduct.id}`}
              className="bg-white w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto sm:rounded-3xl shadow-2xl relative flex flex-col"
            >
              {/* Header with Close Button */}
              <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-4 border-b border-slate-100 flex justify-between items-center">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="text-slate-600 hidden sm:block" size={24} />
                  <X className="text-slate-600 sm:hidden" size={24} />
                </button>
                <div className="flex-1 text-center">
                   <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate px-8">
                     פרטי מוצר
                   </h3>
                </div>
                <div className="w-10" /> {/* Spacer */}
              </div>

              <div className="p-6 sm:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Product Image */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                    <motion.img 
                      layoutId={`image-${selectedProduct.id}`}
                      src={selectedProduct.image} 
                      className="w-full h-full object-contain p-4"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-brand-blue text-brand-dark px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-blue/20">
                      {selectedProduct.category}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col justify-center">
                    <motion.h2 
                      layoutId={`name-${selectedProduct.id}`}
                      className="text-3xl font-black text-brand-dark uppercase tracking-tighter mb-4"
                    >
                      {selectedProduct.name}
                    </motion.h2>
                    <p className="text-slate-600 leading-relaxed mb-8">
                      {selectedProduct.description}
                    </p>
                    
                    <div className="flex items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">מחיר מיוחד</span>
                        <motion.span layoutId={`price-${selectedProduct.id}`} className="text-3xl font-black text-brand-dark">
                          ₪{selectedProduct.price}
                        </motion.span>
                      </div>
                      <button 
                        onClick={() => {
                          const folderId = '13Mdl9DJSEVVXEGwGifSQV3rTP_B4T6Y6';
                          const searchUrl = `https://drive.google.com/drive/u/0/search?q=parent:${folderId}%20${encodeURIComponent(selectedProduct.name)}`;
                          window.open(searchUrl, '_blank');
                        }}
                        className="flex items-center gap-3 bg-brand-blue hover:bg-brand-dark text-brand-dark hover:text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-brand-blue/20 group"
                      >
                        <Video size={20} className="group-hover:scale-110 transition-transform" />
                        צפה בהדרכה
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <Tag size={12} className="text-brand-blue" />
                       מקט: {selectedProduct.id.toUpperCase()} • קטגוריה: {selectedProduct.category}
                    </div>
                  </div>
                </div>

                {/* Related Products Section */}
                <div className="mt-16 border-t border-slate-100 pt-16">
                  <div className="flex items-center gap-2 mb-8">
                    <Sparkles className="text-brand-blue" size={20} />
                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">מוצרים משלימים ודומים</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {getRelatedProducts(selectedProduct).map((related) => (
                      <motion.div 
                        key={related.id}
                        onClick={() => setSelectedProduct(related)}
                        whileHover={{ y: -5 }}
                        className="group cursor-pointer"
                      >
                        <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 mb-3 relative">
                          <img 
                            src={related.image} 
                            alt={related.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          {selectedProduct.upsellProducts?.includes(related.id) && (
                            <div className="absolute top-2 left-2 bg-brand-blue/90 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter text-brand-dark">
                              נבחר עבורך
                            </div>
                          )}
                        </div>
                        <h5 className="text-[10px] font-bold text-slate-800 uppercase truncate mb-1">{related.name}</h5>
                        <div className="text-xs font-black text-brand-blue">₪{related.price}</div>
                      </motion.div>
                    ))}
                    {getRelatedProducts(selectedProduct).length === 0 && (
                      <div className="col-span-full py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">אין מוצרים קשורים כרגע</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
