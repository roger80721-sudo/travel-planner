import { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 - 點擊關閉 */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 視窗本體 */}
      <div className="bg-[#F7F4EB] relative w-full max-w-sm rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-orange-100">
          <h3 className="text-lg font-bold text-[#5C4033]">{title}</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-orange-100 text-gray-500 hover:bg-orange-200 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};