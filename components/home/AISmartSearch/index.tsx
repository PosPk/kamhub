'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SearchCategory {
  icon: LucideIcon;
  label: string;
}

interface AISmartSearchProps {
  categories: SearchCategory[];
  onSearch: (query: string) => Promise<void>;
  isNight: boolean;
}

export function AISmartSearch({ categories, onSearch, isNight }: AISmartSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Динамические цвета для категорий
  const categoryBg = isNight ? 'bg-white/30' : 'bg-gray-800/30';
  const categoryBorder = isNight ? 'border-white/40' : 'border-gray-800/40';
  const categoryText = isNight ? 'text-white' : 'text-gray-800';
  const categoryHover = isNight ? 'hover:bg-white/50' : 'hover:bg-gray-800/50';

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return;
    
    setIsSearching(true);
    try {
      await onSearch(searchQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryClick = async (label: string) => {
    setSearchQuery(label);
    setIsSearching(true);
    try {
      await onSearch(label);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mb-6">
      <div className="relative group">
        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-300/90 animate-pulse" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Спроси AI.Kam: 'Найди восхождение на вулкан для новичков'..."
          className="w-full px-5 py-3 pl-12 pr-24 bg-white/50 backdrop-blur-3xl border-2 border-white/50 rounded-2xl text-gray-800 placeholder-gray-500/70 font-light text-sm focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all shadow-2xl"
        />
        <button 
          onClick={handleSearch}
          disabled={isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg flex items-center gap-1.5 disabled:opacity-50"
        >
          {isSearching ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          AI
        </button>
      </div>
      
      {/* Quick Categories - ОПТИМИЗИРОВАНО: показываем только ТОП-8 */}
      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        {categories.slice(0, 8).map((cat, i) => (
          <button 
            key={i}
            onClick={() => handleCategoryClick(cat.label)}
            disabled={isSearching}
            className={`px-3 py-1 ${categoryBg} backdrop-blur-xl border ${categoryBorder} rounded-full ${categoryText} text-xs font-light ${categoryHover} transition-all flex items-center gap-1.5 shadow-lg disabled:opacity-50`}
          >
            <cat.icon className="w-3 h-3" />
            {cat.label}
          </button>
        ))}
        {categories.length > 8 && (
          <button 
            className={`px-3 py-1 ${isNight ? 'bg-white/40 border-white/50 hover:bg-white/60' : 'bg-gray-800/40 border-gray-800/50 hover:bg-gray-800/60'} backdrop-blur-xl border rounded-full ${categoryText} text-xs font-medium transition-all shadow-lg`}
            title="Показать все активности"
          >
            +{categories.length - 8} ещё
          </button>
        )}
      </div>
    </div>
  );
}
