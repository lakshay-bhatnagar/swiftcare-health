import React from 'react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  icon,
  color,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200",
        "hover:scale-105 active:scale-95",
        color
      )}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-foreground/80 text-center leading-tight">
        {name}
      </span>
    </button>
  );
};

export default CategoryCard;
