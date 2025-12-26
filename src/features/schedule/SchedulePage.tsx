import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faClock, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { DateSelector } from './components/DateSelector';
import { TimelineItem, type ScheduleItem } from './components/TimelineItem';
import { Modal } from '../../components/ui/Modal';
import { AddScheduleForm } from './components/AddScheduleForm';
import { ManageDatesForm } from './components/ManageDatesForm'; // 1. 引入新元件

// 這裡必須要 export 讓 ManageDatesForm 使用
export interface ScheduleDay {
  date: string;
  dayOfWeek: string;
  items: ScheduleItem[];
}

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
  const [schedules, setSchedules] = useState<ScheduleDay[]>(() => {
    const saved = localStorage.getItem('travel-planner-data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_DATA; }
    }
    return INITIAL_DATA;
  });

  const [tripTitle, setTripTitle] = useState(() => {
    return localStorage.getItem('travel-trip-title') || '我的日本之旅 🇯🇵';
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [selectedDate, setSelectedDate] = useState(INITIAL_DATA[0].date);
  
  // Modal 狀態
  const [isModalOpen, setIsModalOpen] = useState(false); // 新增行程用
  const [isDateManageOpen, setIsDateManageOpen] = useState(false); // 2. 管理日期用
  
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  useEffect(() => { localStorage.setItem('travel-planner-data', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('travel-trip-title', tripTitle); }, [tripTitle]);

  // 如果選中的日期被刪掉了，自動跳回第一天
  useEffect(() => {
    if (schedules.length > 0) {
      const exists = schedules.find(d => d.date === selectedDate);
      if (!exists) {
        setSelectedDate(schedules[0].date);
      }
    }
  }, [schedules, selectedDate]);

  const currentDay = schedules.find(d => d.date === selectedDate);
  const currentItems = currentDay ? currentDay.items : [];

  const getCountdown = () => {
    if (schedules.length === 0) return 0;
    const startDate = new Date(schedules[0].date);
    const today = new Date();
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = startDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

  // 3. 儲存日期變更的邏輯
  const handleSaveDates = (newSchedules: ScheduleDay[]) => {
    // 這裡我們直接覆蓋 schedules，但要小心保留原本每個日期裡的 items
    // (因為 ManageDatesForm 只是在改日期，它回傳的 newSchedules 裡的 items 可能是空的或是舊的，
    //  但在我們的實作中，ManageDatesForm 是直接操作整個物件陣列，所以 items 會跟著走，沒問題)
    setSchedules(newSchedules);
    setIsDateManageOpen(false);
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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
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

          {/* 4. 新增：管理日期按鈕 */}
          <button 
            onClick={() => setIsDateManageOpen(true)}
            className="bg-white border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center shadow-sm hover:bg-gray-50"
          >
            <FontAwesomeIcon icon={faCalendarDays} className="mr-1.5" />
            調整日期
          </button>
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

      {/* 新增行程的 Modal */}
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

      {/* 5. 新增：日期管理的 Modal */}
      <Modal 
        isOpen={isDateManageOpen} 
        onClose={() => setIsDateManageOpen(false)} 
        title="調整旅程日期"
      >
        <ManageDatesForm 
          schedules={schedules}
          onSave={handleSaveDates}
          onCancel={() => setIsDateManageOpen(false)}
        />
      </Modal>
    </div>
  );
};