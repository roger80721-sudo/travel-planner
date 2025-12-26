import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons'; // 修正：拿掉沒用到的 faCalendarDays
import type { ScheduleDay } from '../SchedulePage';

interface ManageDatesFormProps {
  schedules: ScheduleDay[];
  onSave: (newSchedules: ScheduleDay[]) => void;
  onCancel: () => void;
}

export const ManageDatesForm = ({ schedules, onSave, onCancel }: ManageDatesFormProps) => {
  // 複製一份資料來編輯
  const [tempSchedules, setTempSchedules] = useState<ScheduleDay[]>(JSON.parse(JSON.stringify(schedules)));

  // ▼▼▼ 修正：原本這裡有一個沒用到的 handleDateChange，已經刪除 ▼▼▼

  // 修改某一天的日期 (透過 Index，比較安全)
  const updateDate = (index: number, newDate: string) => {
    setTempSchedules(prev => {
      const newArr = [...prev];
      newArr[index] = { ...newArr[index], date: newDate };
      return newArr;
    });
  };

  // 刪除某一天
  const deleteDay = (index: number) => {
    if (tempSchedules.length <= 1) {
      alert('至少要保留一天行程喔！');
      return;
    }
    if (window.confirm('確定要刪除這一天嗎？當天的所有行程也會被刪除喔！')) {
      setTempSchedules(prev => prev.filter((_, i) => i !== index));
    }
  };

  // 新增一天
  const addDay = () => {
    setTempSchedules(prev => {
      const lastDay = prev.length > 0 ? new Date(prev[prev.length - 1].date) : new Date();
      lastDay.setDate(lastDay.getDate() + 1);
      
      const nextDateStr = lastDay.toISOString().split('T')[0];
      
      return [
        ...prev,
        {
          date: nextDateStr,
          dayOfWeek: (prev.length + 1).toString(),
          items: []
        }
      ];
    });
  };

  // 儲存
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 儲存前，依照日期重新排序
    const sorted = [...tempSchedules].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 重新標記 Day 1, Day 2...
    const reindexed = sorted.map((day, index) => ({
      ...day,
      dayOfWeek: (index + 1).toString()
    }));

    onSave(reindexed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-orange-50 p-3 rounded-xl text-xs text-[#5C4033] mb-4">
        <p>💡 提示：系統會自動根據日期幫您排序 Day 1、Day 2 喔！</p>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {tempSchedules.map((day, index) => (
          <div key={index} className="flex items-center space-x-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-12 flex flex-col items-center justify-center bg-gray-100 rounded-lg py-1">
              <span className="text-[10px] text-gray-400 font-bold">DAY</span>
              <span className="text-xl font-black text-gray-600">{index + 1}</span>
            </div>

            <div className="flex-1">
              <input 
                type="date" 
                value={day.date}
                onChange={(e) => updateDate(index, e.target.value)}
                className="w-full font-bold text-gray-700 bg-transparent outline-none"
              />
            </div>

            <button 
              type="button"
              onClick={() => deleteDay(index)}
              className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
          </div>
        ))}
      </div>

      <button 
        type="button"
        onClick={addDay}
        className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-400 rounded-xl font-bold hover:border-orange-300 hover:text-orange-400 hover:bg-orange-50 transition-all flex items-center justify-center space-x-2"
      >
        <FontAwesomeIcon icon={faPlus} />
        <span>增加一天</span>
      </button>

      <div className="pt-4 flex space-x-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-gray-100">取消</button>
        <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg">儲存變更</button>
      </div>
    </form>
  );
};