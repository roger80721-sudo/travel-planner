import { useState, useEffect } from 'react'; // 引入 useEffect
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { DateSelector } from './components/DateSelector';
import { TimelineItem, type ScheduleItem } from './components/TimelineItem';
import { Modal } from '../../components/ui/Modal';
import { AddScheduleForm } from './components/AddScheduleForm';

// 預設資料 (只有在第一次使用，且沒有存檔時才會顯示)
const INITIAL_DATA = [
  {
    date: '2025-02-27',
    dayOfWeek: '1',
    items: [
      { id: '1', time: '10:00', type: 'transport', title: '抵達關西機場', duration: '1h', location: '關西國際機場' },
    ] as ScheduleItem[]
  },
  {
    date: '2025-02-28',
    dayOfWeek: '2',
    items: [] as ScheduleItem[]
  }
];

export const SchedulePage = () => {
  // 1. 初始化 State：優先從 LocalStorage 讀取
  const [schedules, setSchedules] = useState(() => {
    const saved = localStorage.getItem('travel-planner-data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  const [selectedDate, setSelectedDate] = useState(INITIAL_DATA[0].date);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // 2. 自動存檔：當 schedules 改變時，同步寫入 LocalStorage
  useEffect(() => {
    localStorage.setItem('travel-planner-data', JSON.stringify(schedules));
  }, [schedules]);

  const currentDay = schedules.find(d => d.date === selectedDate);
  const currentItems = currentDay ? currentDay.items : [];

  const openAddModal = () => {
    setEditingItem(null); 
    setIsModalOpen(true);
  };

  const openEditModal = (item: ScheduleItem) => {
    setEditingItem(item); 
    setIsModalOpen(true);
  };

  const handleSaveItem = (formData: Omit<ScheduleItem, 'id'>) => {
    setSchedules(prev => {
      return prev.map(day => {
        if (day.date === selectedDate) {
          let newItems;
          
          if (editingItem) {
            newItems = day.items.map(item => 
              item.id === editingItem.id ? { ...item, ...formData } : item
            );
          } else {
            newItems = [...day.items, { ...formData, id: Date.now().toString() }];
          }

          return {
            ...day,
            items: newItems.sort((a, b) => a.time.localeCompare(b.time))
          };
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
            return {
              ...day,
              items: day.items.filter(item => item.id !== editingItem.id)
            };
          }
          return day;
        });
      });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="relative min-h-full pb-24">
      <DateSelector 
        dates={schedules.map(d => ({ date: d.date, label: d.dayOfWeek }))}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />

      <div className="mt-6 px-1">
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