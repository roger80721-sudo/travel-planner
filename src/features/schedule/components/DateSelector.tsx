import { useRef, useEffect } from 'react';

interface DateOption {
  date: string; // "2025-02-27"
  label: string; // "1", "2" (第幾天)
}

interface DateSelectorProps {
  dates: DateOption[];
  selectedDate: string;
  onSelect: (date: string) => void;
}

// 輔助函式：取得星期幾
const getWeekday = (dateString: string) => {
  const date = new Date(dateString);
  const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  return weekdays[date.getDay()];
};

// 輔助函式：格式化日期 (取月/日)
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const DateSelector = ({ dates, selectedDate, onSelect }: DateSelectorProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自動捲動到選中的日期
  useEffect(() => {
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector('[data-selected="true"]') as HTMLElement;
      if (selectedEl) {
        scrollRef.current.scrollTo({
          left: selectedEl.offsetLeft - scrollRef.current.offsetWidth / 2 + selectedEl.offsetWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedDate]);

  return (
    <div className="sticky top-20 z-10 bg-[#F7F4EB]/95 backdrop-blur-sm pb-2 pt-1">
      <div 
        ref={scrollRef}
        className="flex space-x-3 overflow-x-auto px-4 py-2 no-scrollbar snap-x"
      >
        {dates.map((d) => {
          const isSelected = d.date === selectedDate;
          return (
            <button
              key={d.date}
              data-selected={isSelected}
              onClick={() => onSelect(d.date)}
              className={`
                flex-shrink-0 flex flex-col items-center justify-center px-4 py-2 rounded-2xl border-2 transition-all snap-center min-w-[80px]
                ${isSelected 
                  ? 'bg-[#5C4033] border-[#5C4033] text-white shadow-lg scale-105' 
                  : 'bg-white border-orange-100 text-gray-400 hover:border-orange-200'
                }
              `}
            >
              {/* 第一行：顯示 Day X */}
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Day {d.label}
              </span>
              
              {/* 第二行：顯示 日期 + 星期 */}
              <span className="text-sm font-black mt-0.5 whitespace-nowrap">
                {formatDate(d.date)} {getWeekday(d.date)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};