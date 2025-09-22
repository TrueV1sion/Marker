
import React from 'react';
import { HeliosLogo } from './icons/HeliosLogo';
import { MenuIcon } from './icons/MenuIcon';

interface HeaderProps {
  onToggleNav: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleNav }) => {
  return (
    <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleNav}
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100 md:hidden"
          aria-label="Open navigation menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <HeliosLogo className="h-8 w-8 text-sky-500" />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Helios</h1>
          <p className="text-sm text-slate-500">Healthcare Intelligence & Opportunity Engine</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
