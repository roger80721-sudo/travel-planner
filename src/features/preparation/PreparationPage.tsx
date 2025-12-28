import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashCan, faCheck, faRotateLeft, faCloudArrowDown } from '@fortawesome/free-solid-svg-icons';
import { Modal } from '../../components/ui/Modal';
import { loadFromCloud, saveToCloud } from '../../utils/supabase'; // 引入雲端工具

interface CheckItem {
  id: string;
  text: string;
  checked: boolean;
}

interface Category {
  id: string;
  title: string;
  items: CheckItem[];
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'important', title: '🔴 重要證件', items: [
      { id: '1', text: '護照 (效期6個月以上)', checked: false },
      { id: '2', text: 'VJW 入境截圖', checked: false },
      { id: '3', text: '信用卡 / 提款卡', checked: false },
    ]
  },
  {
    id: 'clothing', title: '👕 衣物穿搭', items: [
      { id: '4', text: '換洗衣物 (3套)', checked: false },
      { id: '5', text: '睡衣', checked: false },
    ]
  }
];

export const PreparationPage = () => {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true); // 讀取狀態

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  // 新增項目暫存
  const [newItemText, setNewItemText] = useState('');
  const [targetCatId, setTargetCatId] = useState('');

  // ▼▼▼ 1. 初始化：從雲端載入 ▼▼▼
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      const cloudData = await loadFromCloud('travel-preparation-data');
      if (cloudData) {
        setCategories(cloudData);
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  // ▼▼▼ 2. 儲存輔助函式 ▼▼▼
  const saveAllToCloud = (newData: Category[]) => {
    setCategories(newData);
    saveToCloud('travel-preparation-data', newData);
  };

  // 切換勾選狀態
  const toggleCheck = (catId: string, itemId: string) => {
    const newCategories = categories.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: cat.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item)
        };
      }
      return cat;
    });
    saveAllToCloud(newCategories); // 存到雲端
  };

  // 新增分類
  const addCategory = () => {
    if (!newCatName.trim()) return;
    const newCategories = [...categories, { id: Date.now().toString(), title: newCatName, items: [] }];
    saveAllToCloud(newCategories); // 存到雲端
    setNewCatName('');
    setIsModalOpen(false);
  };

  // 刪除分類
  const deleteCategory = (id: string) => {
    if (confirm('確定要刪除整個分類嗎？')) {
      const newCategories = categories.filter(c => c.id !== id);
      saveAllToCloud(newCategories); // 存到雲端
    }
  };

  // 新增項目
  const addItem = () => {
    if (!newItemText.trim() || !targetCatId) return;
    const newCategories = categories.map(cat => {
      if (cat.id === targetCatId) {
        return {
          ...cat,
          items: [...cat.items, { id: Date.now().toString(), text: newItemText, checked: false }]
        };
      }
      return cat;
    });
    saveAllToCloud(newCategories); // 存到雲端
    setNewItemText('');
    setTargetCatId('');
  };

  // 刪除項目
  const deleteItem = (catId: string, itemId: string) => {
    const newCategories = categories.map(cat => {
      if (cat.id === catId) {
        return { ...cat, items: cat.items.filter(i => i.id !== itemId) };
      }
      return cat;
    });
    saveAllToCloud(newCategories); // 存到雲端
  };

  // 重置該分類所有勾選
  const resetCategory = (catId: string) => {
    if(!confirm('要重置這個分類的勾選狀態嗎？')) return;
    const newCategories = categories.map(cat => {
      if(cat.id === catId) {
        return { ...cat, items: cat.items.map(i => ({...i, checked: false})) };
      }
      return cat;
    });
    saveAllToCloud(newCategories); // 存到雲端
  };

  // 計算進度
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = categories.reduce((sum, cat) => sum + cat.items.filter(i => i.checked).length, 0);
  const progress = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#8DD2BA]">
        <FontAwesomeIcon icon={faCloudArrowDown} className="text-4xl animate-bounce mb-2" />
        <p className="font-bold">正在從雲端載入清單...</p>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4">
      {/* 進度條 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#F2F4E7] mb-6">
         <div className="flex justify-between items-end mb-2">
            <h2 className="font-black text-[#5E5340] text-lg">行李準備進度</h2>
            <span className="text-[#3AA986] font-black font-mono text-2xl">{progress}%</span>
         </div>
         <div className="h-4 bg-[#F2F4E7] rounded-full overflow-hidden">
            <div className="h-full bg-[#8DD2BA] transition-all duration-500" style={{ width: `${progress}%` }} />
         </div>
      </div>

      <div className="space-y-6">
        {categories.map(cat => (
          <div key={cat.id} className="nook-card p-4">
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-dashed border-[#F2F4E7]">
               <h3 className="font-black text-[#796C53] text-lg">{cat.title}</h3>
               <div className="space-x-1">
                 <button onClick={() => resetCategory(cat.id)} className="p-2 text-gray-300 hover:text-blue-400 transition-colors"><FontAwesomeIcon icon={faRotateLeft} /></button>
                 <button onClick={() => deleteCategory(cat.id)} className="p-2 text-gray-300 hover:text-red-400 transition-colors"><FontAwesomeIcon icon={faTrashCan} /></button>
               </div>
            </div>
            
            <div className="space-y-2">
               {cat.items.map(item => (
                 <div key={item.id} className="flex items-center group">
                    <button 
                      onClick={() => toggleCheck(cat.id, item.id)}
                      className={`w-6 h-6 rounded-lg border-2 mr-3 flex items-center justify-center transition-all
                        ${item.checked ? 'bg-[#3AA986] border-[#3AA986] text-white' : 'border-gray-300 text-transparent hover:border-[#3AA986]'}`}
                    >
                      <FontAwesomeIcon icon={faCheck} className="text-sm" />
                    </button>
                    <span className={`flex-1 font-bold transition-all ${item.checked ? 'text-gray-300 line-through decoration-2' : 'text-[#5E5340]'}`}>
                      {item.text}
                    </span>
                    <button onClick={() => deleteItem(cat.id, item.id)} className="text-gray-200 hover:text-red-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                    </button>
                 </div>
               ))}

               {/* 快速新增項目輸入框 */}
               <div className="mt-2 flex items-center pt-2">
                  <div className="w-6 h-6 mr-3 flex items-center justify-center text-gray-300"><FontAwesomeIcon icon={faPlus} className="text-xs" /></div>
                  <input 
                    type="text" 
                    placeholder="新增項目..."
                    className="flex-1 bg-transparent outline-none text-sm font-bold text-[#5E5340] placeholder-gray-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setTargetCatId(cat.id);
                        setNewItemText(e.currentTarget.value);
                        // 因為 setState 是非同步，這裡我們直接用 local 變數呼叫
                        const text = e.currentTarget.value;
                        if(text.trim()) {
                          const newCategories = categories.map(c => {
                            if (c.id === cat.id) return { ...c, items: [...c.items, { id: Date.now().toString(), text, checked: false }] };
                            return c;
                          });
                          saveAllToCloud(newCategories);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
               </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setIsModalOpen(true)} className="w-full mt-6 bg-[#F2F4E7] text-[#796C53] border-2 border-dashed border-[#d1cfc7] rounded-2xl py-3 font-bold hover:bg-[#E8EAE0] transition-colors">
        <FontAwesomeIcon icon={faPlus} className="mr-2" />
        新增分類清單
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新增分類">
         <div className="flex space-x-2">
           <input 
             type="text" 
             value={newCatName} 
             onChange={e => setNewCatName(e.target.value)} 
             placeholder="例如：藥品清單" 
             className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 font-bold outline-none focus:border-orange-200"
             autoFocus
           />
           <button onClick={addCategory} className="bg-[#5C4033] text-white px-4 rounded-xl font-bold">新增</button>
         </div>
      </Modal>
    </div>
  );
};