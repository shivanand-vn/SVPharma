import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, durationMs = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  const bgClass = type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800';
  const Icon = type === 'success' ? FaCheckCircle : FaExclamationCircle;

  return (
    <div className="fixed bottom-4 right-4 z-[100] animate-fade-in-up">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-2 ${bgClass}`}>
        <Icon className={`text-2xl ${type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
        <p className="font-bold text-sm">{message}</p>
        <button onClick={onClose} className="ml-4 hover:opacity-70">
          <FaTimes />
        </button>
      </div>
    </div>
  );
};
