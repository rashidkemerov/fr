import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BackButton: React.FC<{ onClick?: () => void, className?: string }> = ({ onClick, className = '' }) => {
  const navigate = useNavigate();
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Crucial for working inside touch areas
    if (onClick) onClick();
    else navigate(-1);
  };

  return (
    <button 
      onClick={handleClick}
      className={`w-10 h-10 bg-white rounded-2xl shadow-md flex items-center justify-center text-blue-900 active:scale-95 transition-transform ${className}`}
    >
      <ChevronLeft size={24} strokeWidth={3} />
    </button>
  );
};