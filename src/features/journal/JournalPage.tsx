import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { JournalCard, type JournalEntry } from './components/JournalCard';
import { AddJournalForm } from './components/AddJournalForm';
import { Modal } from '../../components/ui/Modal';

export const JournalPage = () => {
  // 1. 讀取日記
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('travel-journal-data');
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // 2. 自動存檔
  useEffect(() => {
    localStorage.setItem('travel-journal-data', JSON.stringify(entries));
  }, [entries]);

  // 新增/修改邏輯
  const handleSave = (data: Omit<JournalEntry, 'id'>) => {
    if (editingEntry) {
      setEntries(prev => prev.map(item => item.id === editingEntry.id ? { ...data, id: item.id } : item));
    } else {
      const newEntry = { ...data, id: Date.now().toString() };
      // 新的日記排在最上面
      setEntries(prev => [newEntry, ...prev]);
    }
    setIsModalOpen(false);
  };

  // 刪除邏輯
  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除這篇日記嗎？回憶很珍貴喔！')) {
      setEntries(prev => prev.filter(item => item.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  return (
    <div className="pb-24 px-4 pt-4">
      {/* 標題區 */}
      <div className="flex items-center space-x-2 mb-6 px-2">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#5C4033]">
          <FontAwesomeIcon icon={faBookOpen} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#5C4033]">旅行日誌</h2>
          <p className="text-xs text-gray-400 font-bold">紀錄 {entries.length} 篇回憶</p>
        </div>
      </div>

      {/* 日記列表 */}
      <div className="space-y-2">
        {entries.length > 0 ? (
          entries.map(entry => (
            <JournalCard 
              key={entry.id} 
              entry={entry} 
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="text-center py-16 opacity-40">
            <div className="text-5xl mb-4">✍️</div>
            <p className="text-base font-bold text-gray-500">還沒有日記</p>
            <p className="text-xs font-bold text-gray-400 mt-1">點擊右下角，寫下第一篇回憶吧！</p>
          </div>
        )}
      </div>

      {/* 新增按鈕 (FAB) */}
      <button 
        onClick={openAddModal}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#5C4033] text-white shadow-xl flex items-center justify-center text-2xl active:scale-90 transition-transform z-40 hover:bg-[#4a332a]"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      {/* 彈出視窗 */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingEntry ? "編輯日記" : "寫日記"}
      >
        <AddJournalForm 
          initialData={editingEntry}
          onSubmit={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};