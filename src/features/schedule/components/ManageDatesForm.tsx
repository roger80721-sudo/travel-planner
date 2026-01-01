import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashCan, faGripLines } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import type { ScheduleDay } from '../SchedulePage';

interface ManageDatesFormProps {
  schedules: ScheduleDay[];
  onSave: (newSchedules: ScheduleDay[]) => void;
  onCancel: () => void;
}

export const ManageDatesForm = ({ schedules, onSave, onCancel }: ManageDatesFormProps) => {
  const [dates, setDates] = useState<ScheduleDay[]>(schedules);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(dates);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setDates(items);
  };

  const handleDateChange = (index: number, newDate: string) => {
    const newItems = [...dates];
    newItems[index] = { ...newItems[index], date: newDate };
    setDates(newItems);
  };

  const handleDelete = (index: number) => {
    if (confirm('確定要刪除那一天的所有行程嗎？此動作無法復原。')) {
      const newItems = dates.filter((_, i) => i !== index);
      setDates(newItems);
    }
  };

  const handleAddDay = () => {
    const lastDate = dates.length > 0 ? new Date(dates[dates.length - 1].date) : new Date();
    lastDate.setDate(lastDate.getDate() + 1);
    const dateStr = lastDate.toISOString().split('T')[0];
    
    setDates([...dates, {
      date: dateStr,
      dayOfWeek: (dates.length + 1).toString(),
      items: []
    }]);
  };

  return (
    // ▼▼▼ 設定最大高度與彈性佈局，確保不會跑版 ▼▼▼
    <div className="flex flex-col h-full max-h-[70vh]">
      
      {/* 說明文字區 */}
      <div className="mb-4 px-1">
        <p className="text-xs text-gray-400 font-bold">
          拖曳可調整天數順序，修改日期會同步更新行程。
        </p>
      </div>

      {/* 捲動區域：加上 overflow-y-auto */}
      <div className="flex-1 overflow-y-auto px-1 min-h-0 space-y-3 pb-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="manage-dates">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {dates.map((day, index) => (
                  <Draggable key={day.date + index} draggableId={day.date + index} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-white border-2 border-[#F2F4E7] rounded-xl p-3 flex items-center shadow-sm"
                      >
                        <div {...provided.dragHandleProps} className="mr-3 text-gray-300 cursor-grab active:cursor-grabbing p-2">
                          <FontAwesomeIcon icon={faGripLines} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="text-[10px] font-bold text-gray-400 mb-1">Day {index + 1}</div>
                          <input 
                            type="date" 
                            value={day.date}
                            onChange={(e) => handleDateChange(index, e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 text-sm font-bold text-[#5E5340] outline-none focus:border-orange-200"
                          />
                        </div>

                        <button 
                          onClick={() => handleDelete(index)}
                          className="ml-2 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button 
          onClick={handleAddDay}
          className="w-full py-3 rounded-xl border-2 border-dashed border-[#d1cfc7] text-[#796C53] font-bold text-sm hover:bg-[#F2F4E7] transition-colors flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> 新增一天
        </button>
      </div>

      {/* 底部按鈕區：固定在下方 */}
      <div className="pt-4 mt-2 border-t border-gray-100 flex space-x-3 bg-white">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-[#F2F4E7] hover:bg-[#E8EAE0]">取消</button>
        <button onClick={() => onSave(dates)} className="flex-1 py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg hover:bg-[#4a332a]">儲存變更</button>
      </div>
    </div>
  );
};