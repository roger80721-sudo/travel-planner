import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrashCan, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';

// 定義日記格式
export interface JournalEntry {
  id: string;
  date: string;       // 日期
  title: string;      // 標題 (例如：清水寺好美)
  content: string;    // 內文
  mood: string;       // 心情 Emoji (😊, 😭, 😴)
  photoUrl?: string;  // 照片連結
}

interface JournalCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export const JournalCard = ({ entry, onEdit, onDelete }: JournalCardProps) => {
  return (
    <div className="bg-white rounded-3xl shadow-[4px_4px_0px_0px_#E0E5D5] border-2 border-transparent hover:border-orange-200 overflow-hidden mb-6 transition-all group">
      
      {/* 1. 照片區 (如果有照片就顯示) */}
      {entry.photoUrl && (
        <div className="h-48 w-full overflow-hidden relative">
          <img 
            src={entry.photoUrl} 
            alt={entry.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              // 如果圖片讀取失敗，就隱藏它
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* 日期標籤 (浮在照片上) */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#5C4033] shadow-sm">
            {entry.date}
          </div>
        </div>
      )}

      {/* 2. 文字內容區 */}
      <div className="p-5">
        {/* 如果沒照片，日期顯示在這裡 */}
        {!entry.photoUrl && (
          <div className="text-xs font-bold text-gray-400 mb-2">{entry.date}</div>
        )}

        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800 leading-tight">
            <span className="mr-2 text-2xl">{entry.mood}</span>
            {entry.title}
          </h3>
        </div>

        <div className="relative pl-6 mb-4">
          <FontAwesomeIcon icon={faQuoteLeft} className="absolute left-0 top-0 text-gray-200 text-xl" />
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-4">
            {entry.content}
          </p>
        </div>

        {/* 操作按鈕 */}
        <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100">
          <button 
            onClick={() => onEdit(entry)}
            className="text-xs font-bold text-gray-400 hover:text-blue-500 flex items-center"
          >
            <FontAwesomeIcon icon={faPen} className="mr-1" /> 編輯
          </button>
          <button 
            onClick={() => onDelete(entry.id)}
            className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center"
          >
            <FontAwesomeIcon icon={faTrashCan} className="mr-1" /> 刪除
          </button>
        </div>
      </div>
    </div>
  );
};