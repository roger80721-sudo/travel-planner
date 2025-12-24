import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CategoryCard, type Category } from './components/CategoryCard';
import { AddCategoryForm } from './components/AddCategoryForm';
import { Modal } from '../../components/ui/Modal';

// 預設資料：幫使用者想好要帶什麼
const INITIAL_DATA: Category[] = [
  {
    id: '1', title: '重要證件 & 錢包', color: 'bg-yellow-100',
    items: [
      { id: '1-1', text: '護照 (檢查效期)', checked: false },
      { id: '1-2', text: '日幣現金', checked: false },
      { id: '1-3', text: '信用卡 (確認海外回饋)', checked: false },
      { id: '1-4', text: 'Visit Japan Web 截圖', checked: false },
      { id: '1-5', text: '網卡 / Wifi機', checked: false },
    ]
  },
  {
    id: '2', title: '電子產品', color: 'bg-blue-100',
    items: [
      { id: '2-1', text: '手機充電線', checked: false },
      { id: '2-2', text: '行動電源 (放隨身行李)', checked: false },
      { id: '2-3', text: '轉接頭 (日本雙孔扁插)', checked: false },
      { id: '2-4', text: '耳機', checked: false },
    ]
  },
  {
    id: '3', title: '盥洗 & 藥品', color: 'bg-green-100',
    items: [
      { id: '3-1', text: '牙刷牙膏', checked: false },
      { id: '3-2', text: '個人保養品', checked: false },
      { id: '3-3', text: '感冒藥 / 止痛藥', checked: false },
      { id: '3-4', text: 'OK繃 / 休足時間', checked: false },
    ]
  },
];

export const PreparationPage = () => {
  // 1. 讀取資料
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('travel-prep-data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. 自動存檔
  useEffect(() => {
    localStorage.setItem('travel-prep-data', JSON.stringify(categories));
  }, [categories]);

  // 計算總進度
  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedItems = categories.reduce((acc, cat) => acc + cat.items.filter(i => i.checked).length, 0);
  const totalProgress = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

  // 操作邏輯
  const toggleItem = (catId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item)
      };
    }));
  };

  const addItem = (catId: string, text: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: [...cat.items, { id: Date.now().toString(), text, checked: false }]
      };
    }));
  };

  const deleteItem = (catId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.filter(item => item.id !== itemId)
      };
    }));
  };

  const addCategory = (title: string, color: string) => {
    setCategories(prev => [
      ...prev, 
      { id: Date.now().toString(), title, color, items: [] }
    ]);
    setIsModalOpen(false);
  };

  const deleteCategory = (id: string) => {
    if (window.confirm('確定要刪除整個分類嗎？')) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="pb-24 px-4 pt-4">
      {/* 總進度卡片 */}
      <div className="bg-[#5C4033] text-white rounded-3xl p-6 shadow-xl mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1">準備進度</h2>
          <p className="text-xs font-bold opacity-60">
            {totalProgress === 100 ? '太棒了！準備出發！✈️' : `還剩下 ${totalItems - checkedItems} 個項目`}
          </p>
        </div>
        <div className="text-4xl font-black font-mono">{totalProgress}%</div>
      </div>

      {/* 分類列表 */}
      <div>
        {categories.map(cat => (
          <CategoryCard 
            key={cat.id} 
            category={cat} 
            onToggleItem={toggleItem}
            onAddItem={addItem}
            onDeleteItem={deleteItem}
            onDeleteCategory={deleteCategory}
          />
        ))}
      </div>

      {/* 新增分類按鈕 */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#5C4033] text-white shadow-xl flex items-center justify-center text-2xl active:scale-90 transition-transform z-40 hover:bg-[#4a332a]"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="新增清單分類"
      >
        <AddCategoryForm 
          onSubmit={addCategory}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};