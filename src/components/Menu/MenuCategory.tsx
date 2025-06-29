import React, { useRef } from 'react';
import MenuItem from './MenuItem';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MenuItem as MenuItemType } from '../../types';

interface MenuCategoryProps {
  categoryName: string;
  items: MenuItemType[];
}

const MenuCategory: React.FC<MenuCategoryProps> = ({ categoryName, items }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-serif text-[#532b1b] relative">
          {categoryName}
          <span className="absolute -bottom-1 left-0 h-0.5 bg-amber-500 w-1/2"></span>
        </h2>
        <div className="ml-4 text-sm text-gray-500 bg-amber-50 px-3 py-1 rounded-full">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </div>
      </div>
      
      <div className="relative">
        {items.length > 3 && (
          <>
            <button 
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 lg:-ml-6 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg z-10 text-amber-800 transition-all hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button 
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 lg:-mr-6 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg z-10 text-amber-800 transition-all hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 pb-4 px-1 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuCategory;