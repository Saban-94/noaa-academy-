import React from 'react';
import { motion } from 'motion/react';
import { Search, Filter, ShoppingCart, Tag, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface ProductCatalogProps {
  products: Product[];
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ products }) => {
  return (
    <div className="content-card h-full flex flex-col">
      <div className="p-6 border-b border-slate-100 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">קטלוג מוצרים</h2>
            <p className="text-sm text-slate-500">חמרי בניין, כלי עבודה ופתרונות מתקדמים</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="חיפוש מוצר..." 
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
          {products.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -5 }}
              className="group bg-white rounded-xl border border-slate-200/50 shadow-md hover:shadow-xl transition-all overflow-hidden"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img 
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
                <h4 className="font-bold text-slate-800 group-hover:text-brand-blue transition-colors uppercase truncate tracking-tight">
                  {product.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[2.5rem]">
                  {product.description}
                </p>
                
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">מחיר לצרכן</span>
                    <span className="text-xl font-black text-brand-dark">₪{product.price}</span>
                  </div>
                  <button className="w-12 h-12 bg-brand-blue hover:bg-brand-dark text-brand-dark hover:text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-brand-blue/20 active:scale-95">
                    <ShoppingCart size={20} />
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
    </div>
  );
};
