import { useTheme } from '../hooks/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className="relative p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800 transition-all cursor-pointer active:scale-95 group overflow-hidden"
      aria-label="Toggle Dark Mode"
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 w-5 h-5 text-gold-500 transition-transform duration-500 ${theme === 'dark' ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} 
        />
        <Moon 
          className={`absolute inset-0 w-5 h-5 text-gold-400 transition-transform duration-500 ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} 
        />
      </div>
    </button>
  );
}
