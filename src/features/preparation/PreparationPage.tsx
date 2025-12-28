import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faTrashCan, faCheck, faCloudArrowDown, 
  faPalette, faUserGroup, faPen 
} from '@fortawesome/free-solid-svg-icons';
import { Modal } from '../../components/ui/Modal';
import { loadFromCloud, saveToCloud } from '../../utils/supabase';

interface CheckItem {
  id: string;
  text: string;
  checkedBy: string[];
}

interface Category {
  id: string;
  title: string;
  color: string;
  items: CheckItem[];
}

const COLOR_PALETTE = [
  '#F3A76C', '#7CAFC4', '#F5E050', '#96E0C5', 
  '#BCAAA4', '#F48FB1', '#9575CD', '#4DB6AC'
];

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'important', title: '🔴 重要證件', color: '#F48FB1', items: [
      { id: '1', text: '護照', checkedBy: [] },
      { id: '2', text: '現金/信用卡', checkedBy: [] },
    ]
  }
];

export const PreparationPage = () => {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [members, setMembers] = useState<string[]>(['我']);
  // 新增：成員顏色
  const [memberColors, setMemberColors] = useState<Record<string, string>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentMember, setCurrentMember] = useState<string>('我');
  const [viewMode, setViewMode] = useState<'individual' | 'summary'>('individual');

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [formCatTitle, setFormCatTitle] = useState('');
  const [formCatColor, setFormCatColor] = useState(COLOR_PALETTE[0]);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      
      const cloudMembers = await loadFromCloud('travel-members');
      if (cloudMembers && cloudMembers.length > 0) {
        setMembers(cloudMembers);
        setCurrentMember(cloudMembers[0]);
      }

      // 新增：載入成員顏色
      const cloudColors = await loadFromCloud('travel-member-colors');
      if (cloudColors) {
        setMemberColors(cloudColors);
      }

      const cloudData = await loadFromCloud('travel-preparation-data');
      if (cloudData) {
        const migratedData = cloudData.map((cat: any) => ({
          ...cat,
          color: cat.color || '#F3A76C',
          items: cat.items.map((item: any) => ({
            ...item,
            checkedBy: item.checkedBy || (item.checked ? [cloudMembers?.[0] || '我'] : [])
          }))
        }));
        setCategories(migratedData);
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  const saveAllToCloud = (newData: Category[]) => {
    setCategories(newData);
    saveToCloud('travel-preparation-data', newData);
  };

  const toggleCheck = (catId: string, itemId: string) => {
    if (viewMode === 'summary') return;

    const newCategories = categories.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: cat.items.map(item => {
            if (item.id === itemId) {
              const isChecked = item.checkedBy.includes(currentMember);
              let newCheckedBy;
              if (isChecked) {
                newCheckedBy = item.checkedBy.filter(m => m !== currentMember);
              } else {
                newCheckedBy = [...item.checkedBy, currentMember];
              }
              return { ...item, checkedBy: newCheckedBy };
            }
            return item;
          })
        };
      }
      return cat;
    });
    saveAllToCloud(newCategories);
  };

  const handleSaveCategory = () => {
    if (!formCatTitle.trim()) return;

    let newCategories;
    if (editingCat) {
      newCategories = categories.map(c => 
        c.id === editingCat.id ? { ...c, title: formCatTitle, color: formCatColor } : c
      );
    } else {
      newCategories = [...categories, { 
        id: Date.now().toString(), 
        title: formCatTitle, 
        color: formCatColor, 
        items: [] 
      }];
    }
    saveAllToCloud(newCategories);
    setIsCatModalOpen(false);
  };

  const openAddCatModal = () => {
    setEditingCat(null);
    setFormCatTitle('');
    setFormCatColor(COLOR_PALETTE[0]);
    setIsCatModalOpen(true);
  };

  const openEditCatModal = (cat: Category) => {
    setEditingCat(cat);
    setFormCatTitle(cat.title);
    setFormCatColor(cat.color);
    setIsCatModalOpen(true);
  };

  const deleteCategory = (id: string) => {
    if (confirm('確定要刪除整個分類嗎？')) {
      const newCategories = categories.filter(c => c.id !== id);
      saveAllToCloud(newCategories);
    }
  };

  const handleAddItemKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, catId: string) => {
    if (e.key === 'Enter') {
      const text = e.currentTarget.value.trim();
      if (text) {
        const newCategories = categories.map(c => {
          if (c.id === catId) {
            return { 
              ...c, 
              items: [...c.items, { id: Date.now().toString(), text, checkedBy: [] }] 
            };
          }
          return c;
        });
        saveAllToCloud(newCategories);
        e.currentTarget.value = '';
      }
    }
  };

  const deleteItem = (catId: string, itemId: string) => {
    const newCategories = categories.map(cat => {
      if (cat.id === catId) {
        return { ...cat, items: cat.items.filter(i => i.id !== itemId) };
      }
      return cat;
    });
    saveAllToCloud(newCategories);
  };

  const calculateProgress = (member: string) => {
    const total = categories.reduce((sum, cat) => sum + cat.items.length, 0);
    if (total === 0) return 0;
    const checked = categories.reduce((sum, cat) => 
      sum + cat.items.filter(i => i.checkedBy.includes(member)).length, 0);
    return Math.round((checked / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#8DD2BA]">
        <FontAwesomeIcon icon={faCloudArrowDown} className="text-4xl animate-bounce mb-2" />
        <p className="font-bold">正在同步大家的行李清單...</p>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="flex space-x-2 mb-4 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setViewMode('summary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2
            ${viewMode === 'summary' 
              ? 'bg-[#5C4033] text-white border-[#5C4033] shadow-md' 
              : 'bg-white text-gray-500 border-gray-200'}`}
        >
          <FontAwesomeIcon icon={faUserGroup} className="mr-1" />
          全體總覽
        </button>

        {members.map(m => (
          <button
            key={m}
            onClick={() => { setCurrentMember(m); setViewMode('individual'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2 relative pl-8 pr-4
              ${viewMode === 'individual' && currentMember === m
                ? 'bg-white text-[#5C4033] border-[#5C4033] shadow-md' 
                : 'bg-white text-gray-400 border-transparent'}`}
          >
            {/* ▼▼▼ 修改：顯示成員代表色 ▼▼▼ */}
            <span 
              className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-gray-100"
              style={{ backgroundColor: memberColors[m] || '#eee' }}
            />
            {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}
            {m}
          </button>
        ))}
      </div>

      {viewMode === 'summary' && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#F2F4E7] mb-6 space-y-4">
          <h2 className="font-black text-[#5E5340] mb-2 text-center">📊 大家收好了嗎？</h2>
          {members.map(m => {
            const prog = calculateProgress(m);
            return (
              <div key={m} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span className="flex items-center">
                    {/* 總覽也加上顏色點點 */}
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: memberColors[m] || '#ccc' }}></span>
                    {m}
                  </span>
                  <span>{prog}%</span>
                </div>
                <div className="h-2.5 bg-[#F2F4E7] rounded-full overflow-hidden">
                   <div 
                     className="h-full transition-all duration-500 rounded-full" 
                     style={{ width: `${prog}%`, backgroundColor: prog === 100 ? '#3AA986' : (memberColors[m] || '#F3A76C') }} 
                   />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'individual' && (
        <>
          <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#F2F4E7] mb-6">
             <div className="flex justify-between items-end mb-2">
                <h2 className="font-black text-[#5E5340] text-lg">
                  {currentMember} 的行李
                </h2>
                <span className="text-[#3AA986] font-black font-mono text-2xl">{calculateProgress(currentMember)}%</span>
             </div>
             <div className="h-4 bg-[#F2F4E7] rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500" 
                  style={{ width: `${calculateProgress(currentMember)}%`, backgroundColor: calculateProgress(currentMember) === 100 ? '#3AA986' : '#8DD2BA' }} 
                />
             </div>
          </div>

          <div className="space-y-6">
            {categories.map(cat => (
              <div key={cat.id} className="nook-card overflow-hidden">
                <div 
                  className="p-3 flex justify-between items-center text-white"
                  style={{ backgroundColor: cat.color }}
                >
                   <h3 className="font-black text-lg drop-shadow-md cursor-pointer flex items-center hover:opacity-90" onClick={() => openEditCatModal(cat)}>
                     {cat.title}
                     <FontAwesomeIcon icon={faPen} className="ml-2 text-xs opacity-50" />
                   </h3>
                   <button onClick={() => deleteCategory(cat.id)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                     <FontAwesomeIcon icon={faTrashCan} />
                   </button>
                </div>
                
                <div className="p-4 pt-2 space-y-2">
                   {cat.items.map(item => {
                     const isChecked = item.checkedBy.includes(currentMember);
                     return (
                       <div key={item.id} className="flex items-center group">
                          <button 
                            onClick={() => toggleCheck(cat.id, item.id)}
                            className={`w-6 h-6 rounded-lg border-2 mr-3 flex items-center justify-center transition-all flex-shrink-0
                              ${isChecked 
                                ? 'bg-[#3AA986] border-[#3AA986] text-white' 
                                : 'border-gray-300 text-transparent hover:border-[#3AA986]'}`}
                          >
                            <FontAwesomeIcon icon={faCheck} className="text-sm" />
                          </button>
                          
                          <span className={`flex-1 font-bold transition-all ${isChecked ? 'text-gray-300 line-through' : 'text-[#5E5340]'}`}>
                            {item.text}
                          </span>

                          <button onClick={() => deleteItem(cat.id, item.id)} className="text-gray-200 hover:text-red-300 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                          </button>
                       </div>
                     );
                   })}

                   <div className="mt-2 flex items-center pt-2 border-t border-dashed border-gray-100">
                      <div className="w-6 h-6 mr-3 flex items-center justify-center text-gray-300"><FontAwesomeIcon icon={faPlus} className="text-xs" /></div>
                      <input 
                        type="text" 
                        placeholder="新增項目..."
                        className="flex-1 bg-transparent outline-none text-sm font-bold text-[#5E5340] placeholder-gray-300"
                        onKeyDown={(e) => handleAddItemKeyDown(e, cat.id)}
                      />
                   </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={openAddCatModal} className="w-full mt-6 bg-[#F2F4E7] text-[#796C53] border-2 border-dashed border-[#d1cfc7] rounded-2xl py-3 font-bold hover:bg-[#E8EAE0] transition-colors">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            新增分類清單
          </button>
        </>
      )}

      <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title={editingCat ? "編輯分類" : "新增分類"}>
         <div className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-gray-400 mb-1">分類名稱</label>
             <input 
               type="text" 
               value={formCatTitle} 
               onChange={e => setFormCatTitle(e.target.value)} 
               placeholder="例如：3C 用品" 
               className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 font-bold outline-none focus:border-orange-200"
               autoFocus
             />
           </div>
           
           <div>
             <label className="block text-xs font-bold text-gray-400 mb-1 flex items-center">
               <FontAwesomeIcon icon={faPalette} className="mr-1" /> 代表顏色
             </label>
             <div className="flex flex-wrap gap-2">
               {COLOR_PALETTE.map(color => (
                 <button
                   key={color}
                   onClick={() => setFormCatColor(color)}
                   className={`w-8 h-8 rounded-full shadow-sm border-2 transition-transform ${formCatColor === color ? 'border-gray-500 scale-110' : 'border-white'}`}
                   style={{ backgroundColor: color }}
                 />
               ))}
             </div>
           </div>

           <button onClick={handleSaveCategory} className="w-full bg-[#5C4033] text-white py-3 rounded-xl font-bold shadow-lg">
             {editingCat ? '儲存變更' : '新增分類'}
           </button>
         </div>
      </Modal>
    </div>
  );
};