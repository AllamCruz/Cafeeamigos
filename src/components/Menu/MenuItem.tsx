import React, { useState } from 'react';
import { MenuItem as MenuItemType } from '../../types';
import { Flame, Tag } from 'lucide-react';

interface MenuItemProps {
  item: MenuItemType;
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const { name, description, price, imageUrl, sizes, isOnSale, isMostRequested } = item;
  const [selectedSize, setSelectedSize] = useState(sizes?.[0]?.size || '');

  const getCurrentPrice = () => {
    if (!sizes?.length) return price;
    const size = sizes.find(s => s.size === selectedSize);
    return size?.price || price;
  };

  return (
    <div className="min-w-[260px] w-72 bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-amber-100 flex flex-col h-full relative">
      {imageUrl && (
        <div className="h-40 overflow-hidden relative">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {isMostRequested && (
              <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <Flame size={14} className="mr-1" />
                Popular
              </span>
            )}
            {isOnSale && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <Tag size={14} className="mr-1" />
                Promoção
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="p-4 flex flex-col flex-grow bg-[#fcf8f3]">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-serif text-[#5c3d2e]">{name}</h3>
          <span className="font-medium text-amber-800">
            R$ {getCurrentPrice().toFixed(2)}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 flex-grow">{description}</p>
        
        {sizes && sizes.length > 0 && (
          <div className="mt-3 border-t pt-3">
            <div className="flex flex-wrap gap-2">
              {sizes.map((sizeOption) => (
                <button
                  key={sizeOption.size}
                  onClick={() => setSelectedSize(sizeOption.size)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedSize === sizeOption.size
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {sizeOption.size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItem