import React from 'react';
import { Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#5c3d2e] text-amber-50 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between text-sm gap-2 sm:gap-0">
          <p className="text-center sm:text-left mb-2 sm:mb-0">
            &copy; {new Date().getFullYear()} Café & Amigos Bistrô Bar. Todos Os Diretos Reservados
          </p>
          <a 
            href="https://instagram.com/_allamcruz_" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center hover:text-amber-200 transition-colors text-center sm:text-right"
          >
            Feito por &nbsp;
            <Instagram size={16} className="mr-1" />
            @_allamcruz_
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;