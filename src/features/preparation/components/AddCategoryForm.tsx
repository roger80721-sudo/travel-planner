import { useState } from 'react';

const COLORS = [
  { label: '藍色', value: 'bg-blue-100' },
  { label: '綠色', value: 'bg-green-100' },
  { label: '黃色', value: 'bg-yellow-100' },
  { label: '紅色', value: 'bg-red-100' },
  { label: '紫色', value: 'bg-purple-100' },
  { label: '灰色', value: 'bg-gray-100' },
];

interface AddFormProps {
  onSubmit: (title: string, color: string) => void;
  onCancel: () => void;
}

export const AddCategoryForm = ({ onSubmit, onCancel }: AddFormProps) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('bg-blue-100');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSubmit(title, color);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-400 mb-2">分類名稱</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：伴手禮清單"
          autoFocus
          className="w-full bg-white border-2 border-orange-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-orange-300 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 mb-2">顏色標籤</label>
        <div className="flex space-x-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${c.value} ${
                color === c.value ? 'border-gray-400 scale-110' : 'border-transparent'
              }`}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div className="pt-2 flex space-x-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-orange-100">取消</button>
        <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg">新增</button>
      </div>
    </form>
  );
};