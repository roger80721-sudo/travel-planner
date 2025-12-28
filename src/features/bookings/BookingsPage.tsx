import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCloudArrowDown } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

import { BookingCard, type BookingItem } from './components/BookingCard';
import { AddBookingForm } from './components/AddBookingForm';
import { Modal } from '../../components/ui/Modal';
import { loadFromCloud, saveToCloud } from '../../utils/supabase'; // 引入雲端工具

// 預設資料 (只有在雲端完全沒資料時才會顯示)
const INITIAL_BOOKINGS: BookingItem[] = [
  { 
    id: '1', type: 'flight', title: 'JX820', provider: '星宇航空', 
    date: '2025-02-27', time: '08:30', reference: '6XK9P2', link: 'https://www.starlux-airlines.com',
    departCode: 'TPE', departName: '桃園機場', arriveCode: 'KIX', arriveName: '關西機場', baggage: '23kg'
  }
];

export const BookingsPage = () => {
  const [bookings, setBookings] = useState<BookingItem[]>(INITIAL_BOOKINGS);
  const [isLoading, setIsLoading] = useState(true); // 讀取狀態

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BookingItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'flight' | 'hotel'>('all');

  // ▼▼▼ 1. 初始化：從雲端載入 ▼▼▼
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      const cloudData = await loadFromCloud('travel-bookings-data');
      if (cloudData) {
        setBookings(cloudData);
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  // ▼▼▼ 2. 儲存輔助函式 ▼▼▼
  const saveAllToCloud = (newData: BookingItem[]) => {
    setBookings(newData);
    saveToCloud('travel-bookings-data', newData);
  };

  const handleSave = (formData: Omit<BookingItem, 'id'>) => {
    let newBookings;
    if (editingItem) {
      newBookings = bookings.map(item => item.id === editingItem.id ? { ...formData, id: item.id } : item);
    } else {
      newBookings = [...bookings, { ...formData, id: Date.now().toString() }];
    }
    saveAllToCloud(newBookings); // 存到雲端
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除這筆預訂嗎？')) {
      const newBookings = bookings.filter(item => item.id !== id);
      saveAllToCloud(newBookings); // 存到雲端
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const newItems = Array.from(bookings);
    const [reorderedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, reorderedItem);
    
    saveAllToCloud(newItems); // 存到雲端
  };

  const filteredBookings = filterType === 'all' 
    ? bookings 
    : bookings.filter(b => b.type === filterType);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#8DD2BA]">
        <FontAwesomeIcon icon={faCloudArrowDown} className="text-4xl animate-bounce mb-2" />
        <p className="font-bold">正在從雲端載入預訂...</p>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar">
        {['all', 'flight', 'hotel', 'activity'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors
              ${filterType === type ? 'bg-[#5C4033] text-white shadow-lg' : 'bg-white text-gray-400 border border-transparent'}`}
          >
            {type === 'all' ? '全部' : type === 'flight' ? '機票' : type === 'hotel' ? '住宿' : '票券'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filterType === 'all' ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="bookings-list">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {filteredBookings.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.8 : 1 }}
                        >
                          <BookingCard 
                            item={item} 
                            onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }}
                            onDelete={handleDelete}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          filteredBookings.map(item => (
            <BookingCard 
              key={item.id} 
              item={item} 
              onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }}
              onDelete={handleDelete}
            />
          ))
        )}
        
        {filteredBookings.length === 0 && (
          <div className="text-center py-10 text-gray-400 opacity-50">沒有資料</div>
        )}
      </div>

      <button 
        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#5C4033] text-white shadow-xl flex items-center justify-center text-2xl active:scale-90 transition-transform z-40"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "編輯預訂" : "新增預訂"}>
        <AddBookingForm initialData={editingItem} onSubmit={handleSave} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};