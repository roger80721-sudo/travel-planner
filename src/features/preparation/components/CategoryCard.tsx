import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrashCan, faPlus } from '@fortawesome/free-solid-svg-icons';

export interface CheckItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Category {
  id: string;
  title: string;
  color: string; // 例如 'bg-blue-100'
  items: CheckItem[];
}

interface CategoryCardProps {
  category: Category;
  onToggleItem: (categoryId: string, itemId: string) => void;
  onAddItem: (categoryId: string, text: string) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const CategoryCard = ({ category, onToggleItem, onAddItem, onDeleteItem, onDeleteCategory }: CategoryCardProps) => {
  const [newItemText, setNewItemText] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim()) {
      onAddItem(category.id, newItemText.trim());
      setNewItemText('');
    }
  };

  const completedCount = category.items.filter(i => i.checked).length;
  const totalCount = category.items.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-white rounded-3xl shadow-[4px_4px_0px_0px_#E0E5D5] border-2 border-transparent hover:border-orange-200 mb-6 overflow-hidden">
      {/* 標題區 */}
      <div className={`${category.color} p-4 flex justify-between items-center`}>
        <div>
          <h3 className="font-bold text-gray-700 text-lg">{category.title}</h3>
          <span className="text-xs font-bold text-gray-500 opacity-70">
            已完成 {completedCount}/{totalCount}
          </span>
        </div>
        {/* 進度圈圈 */}
        <div className="relative w-10 h-10 flex items-center justify-center">
           <svg className="w-full h-full transform -rotate-90">
             <circle cx="20" cy="20" r="16" stroke="white" strokeWidth="4" fill="transparent" opacity="0.3" />
             <circle 
               cx="20" cy="20" r="16" stroke="white" strokeWidth="4" fill="transparent" 
               strokeDasharray={100} strokeDashoffset={100 - progress}
               className="transition-all duration-500"
             />
           </svg>
           <span className="absolute text-[10px] font-bold text-gray-600">{progress}%</span>
        </div>
      </div>

      <div className="p-2">
        {/* 清單列表 */}
        <div className="space-y-1">
          {category.items.map(item => (
            <div 
              key={item.id} 
              className={`group flex items-center p-2 rounded-xl transition-all ${
                item.checked ? 'bg-gray-50 opacity-60' : 'hover:bg-orange-50'
              }`}
            >
              {/* 勾選框 */}
              <button
                onClick={() => onToggleItem(category.id, item.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mr-3 flex-shrink-0
                  ${item.checked 
                    ? 'bg-orange-400 border-orange-400 text-white' 
                    : 'border-gray-200 bg-white hover:border-orange-300'}`}
              >
                {item.checked && <FontAwesomeIcon icon={faCheck} className="text-sm" />}
              </button>

              {/* 文字 */}
              <span 
                onClick={() => onToggleItem(category.id, item.id)}
                className={`flex-1 text-sm font-bold cursor-pointer transition-all ${
                  item.checked ? 'text-gray-400 line-through decoration-2' : 'text-gray-700'
                }`}
              >
                {item.text}
              </span>

              {/* 刪除按鈕 (只有在 hover 時或是手機上比較容易按) */}
              <button 
                onClick={() => onDeleteItem(category.id, item.id)}
                className="text-gray-300 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
              </button>
            </div>
          ))}
        </div>

        {/* 新增項目輸入框 */}
        <form onSubmit={handleAdd} className="mt-2 p-2 flex items-center border-t border-gray-100">
          <FontAwesomeIcon icon={faPlus} className="text-gray-300 text-xs mr-3 ml-2" />
          <input 
            type="text" 
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="新增項目..."
            className="flex-1 bg-transparent text-sm font-bold text-gray-600 placeholder-gray-300 outline-none"
          />
          <button 
            type="submit" 
            disabled={!newItemText.trim()}
            className="text-xs bg-orange-100 text-orange-400 font-bold px-3 py-1 rounded-lg disabled:opacity-0 transition-opacity"
          >
            加入
          </button>
        </form>
      </div>
      
      {/* 刪除整張分類卡片 (放在很下面比較安全) */}
      <div className="bg-gray-50 p-1 flex justify-center opacity-0 hover:opacity-100 transition-opacity">
        <button onClick={() => onDeleteCategory(category.id)} className="text-[10px] text-red-300 hover:text-red-500 py-1">
          刪除此分類
        </button>
      </div>
    </div>
  );
};