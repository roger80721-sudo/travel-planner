import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { BookingCard, type BookingItem } from './components/BookingCard';
import { AddBookingForm } from './components/AddBookingForm';
import { Modal } from '../../components/ui/Modal';

const INITIAL_BOOKINGS: BookingItem[] = [
  { 
    id: '1', type: 'flight', title: '去程：台北 - 大阪', provider: '星宇航空 JX820', 
    date: '2025-02-27', time: '08:30', reference: '6XK9P2', link: 'https://www.starlux-airlines.com' 
  },
  { 
    id: '2', type: 'hotel', title: '大阪梅田大和魯內酒店', provider: 'Agoda', 
    date: '2025-02-27', time: '15:00', reference: 'HB-29384' 
  }
];

export const BookingsPage = () => {
  // 1. 讀取 LocalStorage
  const [bookings, setBookings] = useState<BookingItem[]>(() => {
    const saved = localStorage.getItem('travel-bookings-data');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BookingItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'flight' | 'hotel'>('all');

  // 2. 自動存檔
  useEffect(() => {
    localStorage.setItem('travel-bookings-data', JSON.stringify(bookings));
  }, [bookings]);

  // 新增/修改邏輯
  const handleSave = (formData: Omit<BookingItem, 'id'>) => {
    if (editingItem) {
      setBookings(prev => prev.map(item => item.id === editingItem.id ? { ...formData, id: item.id } : item));
    } else {
      setBookings(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
  };

  // 刪除邏輯
  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除這筆預訂嗎？')) {
      setBookings(prev => prev.filter(item => item.id !== id));
    }
  };

  // 篩選顯示
  const filteredBookings = filterType === 'all' 
    ? bookings 
    : bookings.filter(b => b.type === filterType);

  return (
    <div className="pb-24 px-4 pt-4">
      {/* 頂部篩選按鈕 */}
      <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar">
        {['all', 'flight', 'hotel', 'activity'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors
              ${filterType === type 
                ? 'bg-[#5C4033] text-white shadow-lg' 
                : 'bg-white text-gray-400 border border-transparent'}`}
          >
            {type === 'all' ? '全部' : type === 'flight' ? '機票' : type === 'hotel' ? '住宿' : '票券'}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div className="space-y-4">
        {filteredBookings.map(item => (
          <BookingCard 
            key={item.id} 
            item={item} 
            onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }}
            onDelete={handleDelete}
          />
        ))}
        {filteredBookings.length === 0 && (
          <div className="text-center py-10 text-gray-400 opacity-50">沒有資料</div>
        )}
      </div>

      {/* 新增按鈕 */}
      <button 
        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#5C4033] text-white shadow-xl flex items-center justify-center text-2xl active:scale-90 transition-transform z-40"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? "編輯預訂" : "新增預訂"}
      >
        <AddBookingForm 
          initialData={editingItem}
          onSubmit={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};