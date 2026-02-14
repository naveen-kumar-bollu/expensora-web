import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      className={`${hover ? 'glass-card-hover cursor-pointer' : 'glass-card'} p-6 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
