interface DateSelectorProps {
  dates: { date: string; label: string }[];
  selectedDate: string;
  onSelect: (date: string) => void;
}

export const DateSelector = ({ dates, selectedDate, onSelect }: DateSelectorProps) => {
  return (
    <div className="sticky top-0 z-30 bg-[#F7F4EB]/95 backdrop-blur-sm pt-2 pb-4 px-1 border-b-2 border-orange-100/50">
      <div className="flex space-x-3 overflow-x-auto no-scrollbar snap-x px-1">
        {dates.map((item) => {
          const isSelected = selectedDate === item.date;
          return (
            <button
              key={item.date}
              onClick={() => onSelect(item.date)}
              className={`
                flex-shrink-0 flex flex-col items-center justify-center 
                w-16 h-20 rounded-3xl border-2 transition-all duration-200 snap-center
                ${isSelected 
                  ? 'bg-[#88A096] border-[#88A096] text-white shadow-lg translate-y-0.5' 
                  : 'bg-white border-transparent text-gray-400 hover:bg-white/80'
                }
              `}
            >
              <span className="text-xs font-bold opacity-80 mb-1">Day {item.label}</span>
              <span className={`text-xl font-black ${isSelected ? 'text-white' : 'text-[#5C4033]'}`}>
                {item.date.split('-')[2]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};