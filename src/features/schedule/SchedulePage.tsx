import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faClock } from '@fortawesome/free-solid-svg-icons';
import { DateSelector } from './components/DateSelector';
import { TimelineItem, type ScheduleItem } from './components/TimelineItem';
import { Modal } from '../../components/ui/Modal';
import { AddScheduleForm } from './components/AddScheduleForm';

// ▼▼▼ 1. 新增這個介面定義，讓 TS 知道每一天長怎樣 ▼▼▼
interface ScheduleDay {
  date: string;
  dayOfWeek: string;
  items: ScheduleItem[];
}
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// 預設資料
const INITIAL_DATA: ScheduleDay[] = [
  {
    date: '2025-02-27',
    dayOfWeek: '1',
    items: [
      { id: '1', time: '10:00', type: 'transport', title: '抵達關西機場', duration: '1h', location: '關西國際機場', weather: 'sunny' },
    ] as ScheduleItem[]
  },
  {
    date: '2025-02-28',
    dayOfWeek: '2',
    items: [] as ScheduleItem[]
  }
];

export const SchedulePage = () => {
  // ▼▼▼ 2. 這裡加上 <ScheduleDay[]> 明確指定類型 ▼▼▼
  const [schedules, setSchedules] = useState<ScheduleDay[]>(() => {
    const saved = localStorage.getItem('travel-planner-data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_DATA; }
    }
    return INITIAL_DATA;
  });
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  const [tripTitle, setTripTitle] = useState(() => {
    return localStorage.getItem('travel-trip-title') || '我的日本之旅 🇯🇵';
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [selectedDate, setSelectedDate] = useState(INITIAL_DATA[0].date);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  useEffect(() => { localStorage.setItem('travel-planner-data', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('travel-trip-title', tripTitle); }, [tripTitle]);

  const currentDay = schedules.find(d => d.date === selectedDate);
  const currentItems = currentDay ? currentDay.items : [];

  const getCountdown = () => {
    if (schedules.length === 0) return 0;
    const startDate = new Date(schedules[0].date);
    const today = new Date();
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const daysLeft = getCountdown();

  const openAddModal = () => { setEditingItem(null); setIsModalOpen(true); };
  const openEditModal = (item: ScheduleItem) => { setEditingItem(item); setIsModalOpen(true); };

  const handleSaveItem = (formData: Omit<ScheduleItem, 'id'>) => {
    setSchedules(prev => {
      return prev.map(day => {
        if (day.date === selectedDate) {
          let newItems;
          if (editingItem) {
            newItems = day.items.map(item => item.id === editingItem.id ? { ...item, ...formData } : item);
          } else {
            newItems = [...day.items, { ...formData, id: Date.now().toString() }];
          }
          return { ...day, items: newItems.sort((a, b) => a.time.localeCompare(b.time)) };
        }
        return day;
      });
    });
    setIsModalOpen(false);
  };

  const handleDeleteItem = () => {
    if (!editingItem) return;
    if (window.confirm(`確定要刪除「${editingItem.title}」嗎？`)) {
      setSchedules(prev => {
        return prev.map(day => {
          if (day.date === selectedDate) {
            return { ...day, items: day.items.filter(item => item.id !== editingItem.id) };
          }
          return day;
        });
      });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="relative min-h-full pb-24">
      <div className="px-5 pt-4 mb-2">
        <div className="bg-[#5C4033] text-white rounded-2xl p-4 shadow-lg mb-4 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white opacity-10 rounded-full" />
          
          <div className="z-10">
            <div className="text-xs font-bold opacity-80 mb-1 flex items-center">
              <FontAwesomeIcon icon={faClock} className="mr-1.5" />
              距離出發還有
            </div>
            <div className="text-3xl font-black font-mono">
              {daysLeft > 0 ? `${daysLeft} 天` : daysLeft === 0 ? '就是今天！' : '旅程已結束'}
            </div>
          </div>
          <div className="text-4xl z-10 animate-bounce">
            {daysLeft > 0 ? '✈️' : daysLeft === 0 ? '🎉' : '🏠'}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isEditingTitle ? (
            <input 
              type="text" 
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
              className="w-full text-2xl font-black text-[#5C4033] bg-transparent border-b-2 border-orange-300 outline-none pb-1"
            />
          ) : (
            <h2 
              onClick={() => setIsEditingTitle(true)}
              className="text-2xl font-black text-[#5C4033] cursor-pointer hover:opacity-70 flex items-center"
            >
              {tripTitle}
              <FontAwesomeIcon icon={faPen} className="text-sm ml-2 text-gray-300" />
            </h2>
          )}
        </div>
      </div>

      <DateSelector 
        dates={schedules.map(d => ({ date: d.date, label: d.dayOfWeek }))}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />

      <div className="mt-4 px-1">
        {currentItems.length > 0 ? (
          currentItems.map((item, index) => (
            <TimelineItem 
              key={item.id} 
              item={item} 
              isLast={index === currentItems.length - 1} 
              onClick={openEditModal} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 opacity-50">
            <div className="text-4xl mb-2">🍃</div>
            <p className="text-gray-400 font-bold">今天還沒有行程喔</p>
          </div>
        )}
      </div>

      <button 
        onClick={openAddModal}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#5C4033] text-white shadow-xl flex items-center justify-center text-2xl active:scale-90 transition-transform z-40 hover:bg-[#4a332a]"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? "編輯行程" : "新增行程"}
      >
        <AddScheduleForm 
          initialData={editingItem} 
          onSubmit={handleSaveItem}
          onDelete={editingItem ? handleDeleteItem : undefined} 
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};