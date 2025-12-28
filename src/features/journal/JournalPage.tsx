import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrashCan, faImage, faCloudArrowDown } from '@fortawesome/free-solid-svg-icons';
import { Modal } from '../../components/ui/Modal';
import { loadFromCloud, saveToCloud } from '../../utils/supabase'; // 引入雲端工具

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  photos: string[];
  mood: string;
}

// 預設資料 (僅在雲端無資料時顯示)
const INITIAL_ENTRIES: JournalEntry[] = [
  {
    id: '1', date: '2025-02-27', content: '終於抵達日本了！天氣超級好，飛機餐也意外地好吃。',
    photos: ['https://images.unsplash.com/photo-1542051841857-5f90071e7989'],
    mood: 'excited'
  }
];

const MOODS = [
  { id: 'excited', label: '興奮', icon: '😆' },
  { id: 'happy', label: '開心', icon: '😊' },
  { id: 'tired', label: '累爆', icon: '😴' },
  { id: 'sad', label: '難過', icon: '😢' },
  { id: 'angry', label: '生氣', icon: '😡' },
];

export const JournalPage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>(INITIAL_ENTRIES);
  const [isLoading, setIsLoading] = useState(true); // 讀取狀態

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // 表單暫存狀態
  const [formDate, setFormDate] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formMood, setFormMood] = useState('happy');
  const [formPhoto, setFormPhoto] = useState('');

  // ▼▼▼ 1. 初始化：從雲端載入 ▼▼▼
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      const cloudData = await loadFromCloud('travel-journal-data');
      if (cloudData) {
        setEntries(cloudData);
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  // ▼▼▼ 2. 儲存輔助函式 ▼▼▼
  const saveAllToCloud = (newData: JournalEntry[]) => {
    setEntries(newData);
    saveToCloud('travel-journal-data', newData);
  };

  const openAddModal = () => {
    setEditingEntry(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormContent('');
    setFormMood('happy');
    setFormPhoto('');
    setIsModalOpen(true);
  };

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormDate(entry.date);
    setFormContent(entry.content);
    setFormMood(entry.mood);
    setFormPhoto(entry.photos[0] || '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formContent) return;

    const newEntry: JournalEntry = {
      id: editingEntry ? editingEntry.id : Date.now().toString(),
      date: formDate,
      content: formContent,
      mood: formMood,
      photos: formPhoto ? [formPhoto] : []
    };

    let newEntries;
    if (editingEntry) {
      newEntries = entries.map(e => e.id === editingEntry.id ? newEntry : e);
    } else {
      newEntries = [newEntry, ...entries];
    }
    
    // 儲存並排序 (按日期新到舊)
    newEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    saveAllToCloud(newEntries); // 存到雲端
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!editingEntry) return;
    if (confirm('確定要刪除這篇日記嗎？')) {
      const newEntries = entries.filter(e => e.id !== editingEntry.id);
      saveAllToCloud(newEntries); // 存到雲端
      setIsModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#8DD2BA]">
        <FontAwesomeIcon icon={faCloudArrowDown} className="text-4xl animate-bounce mb-2" />
        <p className="font-bold">正在從雲端載入回憶...</p>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="space-y-6">
        {entries.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <div className="text-4xl mb-2">📔</div>
            <p>還沒有寫日記喔</p>
          </div>
        ) : (
          entries.map(entry => {
            const mood = MOODS.find(m => m.id === entry.mood);
            return (
              <div key={entry.id} onClick={() => openEditModal(entry)} className="nook-card p-4 relative group cursor-pointer active:scale-95 transition-transform">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#F2F4E7] text-[#796C53] px-2 py-1 rounded-lg text-xs font-bold font-mono">
                      {entry.date}
                    </span>
                    <span className="text-xl" title={mood?.label}>{mood?.icon}</span>
                  </div>
                </div>

                <p className="text-[#5E5340] font-bold text-sm whitespace-pre-wrap leading-relaxed mb-3">
                  {entry.content}
                </p>

                {entry.photos.length > 0 && (
                  <div className="rounded-xl overflow-hidden h-40 w-full relative">
                    <img src={entry.photos[0]} alt="日記照片" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="absolute top-4 right-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FontAwesomeIcon icon={faPen} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <button onClick={openAddModal} className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#5C4033] text-white shadow-xl flex items-center justify-center text-2xl active:scale-90 transition-transform z-40 hover:bg-[#4a332a]">
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEntry ? "編輯日記" : "寫日記"}>
        <div className="space-y-4">
          <div className="flex space-x-2">
             <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="input-style flex-1" />
             <div className="flex bg-white rounded-xl border-2 border-gray-100 p-1">
               {MOODS.map(m => (
                 <button 
                   key={m.id} 
                   onClick={() => setFormMood(m.id)}
                   className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${formMood === m.id ? 'bg-orange-100 scale-110' : 'opacity-50 hover:opacity-100'}`}
                 >
                   {m.icon}
                 </button>
               ))}
             </div>
          </div>

          <textarea 
            value={formContent} 
            onChange={e => setFormContent(e.target.value)} 
            placeholder="今天發生了什麼有趣的事..." 
            className="input-style w-full h-32 resize-none"
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 flex items-center">
              <FontAwesomeIcon icon={faImage} className="mr-1" />
              照片網址 (選填)
            </label>
            <input type="url" value={formPhoto} onChange={e => setFormPhoto(e.target.value)} placeholder="https://..." className="input-style w-full text-blue-500 text-xs" />
            {formPhoto && (
              <div className="h-24 w-full rounded-xl overflow-hidden bg-gray-100">
                <img src={formPhoto} alt="預覽" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-2">
             {editingEntry && (
               <button onClick={handleDelete} className="px-4 py-3 rounded-xl bg-red-50 text-red-500 font-bold">
                 <FontAwesomeIcon icon={faTrashCan} />
               </button>
             )}
             <button onClick={handleSave} className="flex-1 py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg">
               儲存日記
             </button>
          </div>
        </div>
      </Modal>

      <style>{`
        .input-style { background: white; border: 2px solid #F3F4F6; border-radius: 0.75rem; padding: 0.5rem 1rem; font-weight: 700; color: #5E5340; outline: none; }
        .input-style:focus { border-color: #FDBA74; }
      `}</style>
    </div>
  );
};