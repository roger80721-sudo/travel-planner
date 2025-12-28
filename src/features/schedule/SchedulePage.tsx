import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// ▼▼▼ 修正：補上了 faLightbulb ▼▼▼
import { faPlus, faPen, faClock, faCalendarDays, faCloudArrowDown, faBookOpen, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

import { DateSelector } from './components/DateSelector';
import { TimelineItem, type ScheduleItem } from './components/TimelineItem';
import { Modal } from '../../components/ui/Modal';
import { AddScheduleForm } from './components/AddScheduleForm';
import { ManageDatesForm } from './components/ManageDatesForm';
import { calculateNewTime } from '../../utils/timeUtils';
import { loadFromCloud, saveToCloud } from '../../utils/supabase';

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
      { 
        id: '1', time: '10:00', type: 'activity', title: '清水寺', duration: '2h', location: '京都', weather: 'sunny',
        factSummary: '你知道這裡的舞台沒用一根釘子嗎？',
        factDetails: '清水寺本堂的「清水舞台」是靠著 139 根巨大的櫸木柱並列支撐起來的，完全沒有使用任何一根釘子，採用的是日本傳統的「懸造法」建築工藝。這句「從清水舞台跳下去」（清水の舞台から飛び降りる）的日本諺語，就是形容抱著必死的決心去做某件事喔！'
      },
    ] as ScheduleItem[]
  }
];

export const SchedulePage = () => {
  const [schedules, setSchedules] = useState<ScheduleDay[]>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);

  const [tripTitle, setTripTitle] = useState('我的日本之旅 🇯🇵');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [selectedDate, setSelectedDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDateManageOpen, setIsDateManageOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  const [isFactModalOpen, setIsFactModalOpen] = useState(false);
  const [viewingFactItem, setViewingFactItem] = useState<ScheduleItem | null>(null);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      
      const cloudSchedules = await loadFromCloud('travel-planner-data');
      if (cloudSchedules) setSchedules(cloudSchedules);
      
      const cloudTitle = await loadFromCloud('travel-trip-title');
      if (cloudTitle) setTripTitle(cloudTitle);

      setIsLoading(false);
    };
    initData();
  }, []);

  useEffect(() => {
    if (!isLoading && schedules.length > 0) {
      const exists = schedules.find(d => d.date === selectedDate);
      if (!exists) {
        setSelectedDate(schedules[0].date);
      }
    }
  }, [schedules, isLoading, selectedDate]);

  const saveAllToCloud = (newSchedules: ScheduleDay[], newTitle?: string) => {
    saveToCloud('travel-planner-data', newSchedules);
    if (newTitle) saveToCloud('travel-trip-title', newTitle);
  };

  const currentDayIndex = schedules.findIndex(d => d.date === selectedDate);
  const currentItems = schedules[currentDayIndex]?.items || [];

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
  const openFactModal = (item: ScheduleItem) => { setViewingFactItem(item); setIsFactModalOpen(true); };

  const handleSaveItem = (formData: Omit<ScheduleItem, 'id'>) => {
    const newSchedules = schedules.map(day => {
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
    
    setSchedules(newSchedules);
    saveAllToCloud(newSchedules);
    setIsModalOpen(false);
  };

  const handleDeleteItem = () => {
    if (!editingItem) return;
    if (window.confirm(`確定要刪除「${editingItem.title}」嗎？`)) {
      const newSchedules = schedules.map(day => {
        if (day.date === selectedDate) {
          return { ...day, items: day.items.filter(item => item.id !== editingItem.id) };
        }
        return day;
      });
      setSchedules(newSchedules);
      saveAllToCloud(newSchedules);
      setIsModalOpen(false);
    }
  };

  const handleSaveDates = (newSchedules: ScheduleDay[]) => {
    setSchedules(newSchedules);
    saveAllToCloud(newSchedules);
    setIsDateManageOpen(false);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const newItems = Array.from(currentItems);
    const [reorderedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, reorderedItem);

    const prevItem = destinationIndex > 0 ? newItems[destinationIndex - 1] : null;
    const nextItem = destinationIndex < newItems.length - 1 ? newItems[destinationIndex + 1] : null;
    const newTime = calculateNewTime(prevItem ? prevItem.time : null, nextItem ? nextItem.time : null);
    newItems[destinationIndex] = { ...reorderedItem, time: newTime };

    const newSchedules = [...schedules];
    newSchedules[currentDayIndex] = { ...newSchedules[currentDayIndex], items: newItems };
    
    setSchedules(newSchedules);
    saveAllToCloud(newSchedules);
  };

  const handleTitleChange = (newTitle: string) => {
    setTripTitle(newTitle);
  };
  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    saveAllToCloud(schedules, tripTitle);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#8DD2BA]">
        <FontAwesomeIcon icon={faCloudArrowDown} className="text-4xl animate-bounce mb-2" />
        <p className="font-bold">正在從雲端載入行程...</p>
      </div>
    );
  }

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
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={handleTitleBlur}
                autoFocus
                className="w-full text-2xl font-black text-[#5C4033] bg-transparent border-b-2 border-orange-300 outline-none pb-1"
              />
            ) : (
              <h2 onClick={() => setIsEditingTitle(true)} className="text-2xl font-black text-[#5C4033] cursor-pointer hover:opacity-70 flex items-center">
                {tripTitle}
                <FontAwesomeIcon icon={faPen} className="text-sm ml-2 text-gray-300" />
              </h2>
            )}
          </div>
          <button onClick={() => setIsDateManageOpen(true)} className="bg-white border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center shadow-sm hover:bg-gray-50">
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="schedule-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{ 
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1
                          }}
                        >
                          <TimelineItem 
                            item={item} 
                            isLast={index === currentItems.length - 1} 
                            onEditClick={openEditModal} 
                            onFactClick={openFactModal}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 opacity-50">
                    <div className="text-4xl mb-2">🍃</div>
                    <p className="text-gray-400 font-bold">今天還沒有行程喔</p>
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <button onClick={openAddModal} className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#5C4033] text-white shadow-xl flex items-center justify-center text-2xl active:scale-90 transition-transform z-40 hover:bg-[#4a332a]">
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "編輯行程" : "新增行程"}>
        <AddScheduleForm 
          initialData={editingItem} 
          onSubmit={handleSaveItem}
          onDelete={editingItem ? handleDeleteItem : undefined} 
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={isDateManageOpen} onClose={() => setIsDateManageOpen(false)} title="調整旅程日期">
        <ManageDatesForm schedules={schedules} onSave={handleSaveDates} onCancel={() => setIsDateManageOpen(false)} />
      </Modal>

      <Modal 
        isOpen={isFactModalOpen} 
        onClose={() => setIsFactModalOpen(false)} 
        title={viewingFactItem?.title || "景點小故事"}
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-100 flex items-start space-x-3">
            <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500 text-xl mt-1" />
            <div>
              <h4 className="font-black text-yellow-700 mb-1">冷知識簡述</h4>
              <p className="text-sm font-bold text-[#796C53]">{viewingFactItem?.factSummary}</p>
            </div>
          </div>

          <div className="nook-card p-5 bg-[#FFF8E1]">
            <h4 className="font-black text-[#5E5340] mb-3 flex items-center text-lg">
              <FontAwesomeIcon icon={faBookOpen} className="mr-2 text-orange-400" />
              詳細故事
            </h4>
            <div className="text-[#796C53] font-bold leading-relaxed whitespace-pre-wrap">
              {viewingFactItem?.factDetails || "（目前還沒有詳細故事喔）"}
            </div>
          </div>

          <button 
            onClick={() => setIsFactModalOpen(false)}
            className="w-full py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg hover:bg-[#4a332a] transition-colors"
          >
            我知道了！
          </button>
        </div>
      </Modal>
    </div>
  );
};