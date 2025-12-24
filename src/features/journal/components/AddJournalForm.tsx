import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import type { JournalEntry } from './JournalCard';

// 心情選項
const MOODS = ['😊', '🥰', '🤣', '😎', '😴', '😭', '😡', '🤮', '🤯', '🏃'];

interface AddFormProps {
  initialData?: JournalEntry | null;
  onSubmit: (entry: Omit<JournalEntry, 'id'>) => void;
  onCancel: () => void;
}

export const AddJournalForm = ({ initialData, onSubmit, onCancel }: AddFormProps) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('😊');
  const [photoUrl, setPhotoUrl] = useState('');

  // 載入舊資料 (如果是編輯模式)
  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setTitle(initialData.title);
      setContent(initialData.content);
      setMood(initialData.mood);
      setPhotoUrl(initialData.photoUrl || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    onSubmit({ date, title, content, mood, photoUrl });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* 1. 心情選擇器 */}
      <div>
        <label className="block text-xs font-bold text-gray-400 mb-2 text-center">今天心情如何？</label>
        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar px-1">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={`text-2xl p-2 rounded-xl transition-all flex-shrink-0 ${
                mood === m ? 'bg-orange-100 scale-110 shadow-md ring-2 ring-orange-300' : 'bg-white grayscale hover:grayscale-0'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 日期與標題 */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">日期</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white border-2 border-orange-100 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">標題</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：走到腳斷掉的一天"
            className="w-full bg-white border-2 border-orange-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-orange-300 outline-none"
          />
        </div>
      </div>

      {/* 3. 照片連結 */}
      <div>
        <label className="block text-xs font-bold text-gray-400 mb-1">
          <FontAwesomeIcon icon={faImage} className="mr-1" />
          封面照片網址 (選填)
        </label>
        <input 
          type="url" 
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://..."
          className="w-full bg-white border-2 border-orange-100 rounded-xl px-4 py-2 text-sm text-blue-500 focus:border-orange-300 outline-none"
        />
        {photoUrl && (
          <div className="mt-2 h-24 w-full rounded-lg overflow-hidden bg-gray-100">
            <img src={photoUrl} alt="預覽" className="w-full h-full object-cover opacity-80" />
          </div>
        )}
      </div>

      {/* 4. 內文 */}
      <div>
        <label className="block text-xs font-bold text-gray-400 mb-1">內容</label>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今天發生了什麼有趣的事..."
          className="w-full bg-white border-2 border-orange-100 rounded-xl px-4 py-3 text-sm leading-relaxed focus:border-orange-300 outline-none h-32 resize-none"
        />
      </div>

      {/* 按鈕 */}
      <div className="pt-2 flex space-x-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-orange-100">取消</button>
        <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg">儲存日記</button>
      </div>
    </form>
  );
};