import React, { useState, useEffect } from 'react';
import MenuCategory from './MenuCategory';
import { useMenu } from '../../hooks/useMenu';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MenuDisplay: React.FC = () => {
  const { categories, getMenuItemsByCategory, getParentCategories, getSubcategories, getCategoryName } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const parentCategories = getParentCategories();

  useEffect(() => {
    if (parentCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(parentCategories[0].id);
    }
  }, [parentCategories, selectedCategory]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const renderCategoryContent = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return null;

    const mainItems = getMenuItemsByCategory(categoryId, false);
    const subcategories = getSubcategories(categoryId);

    return (
      <div className="space-y-8">
        {/* Render main category items */}
        <MenuCategory
          categoryName={category.name}
          items={mainItems}
          isSubcategory={false}
        />

        {/* Render subcategories and their items */}
        {subcategories.map(subcat => {
          const subcategoryItems = getMenuItemsByCategory(subcat.id, false);
          if (subcategoryItems.length === 0) return null;

          return (
            <MenuCategory
              key={subcat.id}
              categoryName={subcat.name}
              items={subcategoryItems}
              isSubcategory={true}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative mb-8">
        <button 
          onClick={() => scrollCategories('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md z-10 text-amber-800"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div 
          ref={containerRef}
          className="flex overflow-x-auto gap-4 pb-4 px-1 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {parentCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-[#5c3d2e] text-white'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => scrollCategories('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md z-10 text-amber-800"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {selectedCategory && renderCategoryContent(selectedCategory)}
    </div>
  );
};

export default MenuDisplay;