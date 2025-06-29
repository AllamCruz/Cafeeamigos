import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5c3d2e] via-[#6b4423] to-[#5c3d2e] flex items-center justify-center p-4">
      <div className={`max-w-md w-full text-center transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/IMG_20250629_114221.jpg" 
              alt="Logo Café & Amigos Bistrô Bar" 
              className="h-24 w-auto object-contain"
            />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-8 text-amber-50">
          <h2 className="text-2xl font-serif mb-3">Bem-vindos!</h2>
          <p className="text-amber-100 leading-relaxed">
            Descubra nossos sabores únicos e momentos especiais em um ambiente acolhedor.
          </p>
        </div>

        {/* Info Cards */}
        <div className="space-y-3 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center space-x-3">
            <Clock className="h-5 w-5 text-amber-200" />
            <div className="text-left text-amber-50">
              <p className="text-sm font-medium">Horário de Funcionamento</p>
              <p className="text-xs text-amber-100">Seg-Dom: 08h às 23h</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-amber-200" />
            <div className="text-left text-amber-50">
              <p className="text-sm font-medium">Localização</p>
              <p className="text-xs text-amber-100">Centro da cidade</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center space-x-3">
            <Phone className="h-5 w-5 text-amber-200" />
            <div className="text-left text-amber-50">
              <p className="text-sm font-medium">Contato</p>
              <p className="text-xs text-amber-100">(88) 98134-4755</p>
            </div>
          </div>
        </div>

        {/* Enter Button */}
        <button
          onClick={onEnter}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Ver Cardápio
        </button>

        <p className="text-amber-200/70 text-xs mt-4">
          Toque para explorar nosso cardápio
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;