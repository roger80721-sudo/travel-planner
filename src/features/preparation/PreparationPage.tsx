import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faTrashCan, faCheck, faCloudArrowDown, 
  faPalette, faUserGroup, faPen, faSuitcase, faBagShopping, 
  faMagnifyingGlassDollar, faCalculator, faArrowRightArrowLeft, faXmark,
  faComments, faUtensils, faStore, faMapLocationDot, faCircleQuestion
} from '@fortawesome/free-solid-svg-icons';
import { Modal } from '../../components/ui/Modal';
import { loadFromCloud, saveToCloud } from '../../utils/supabase';

// 資料結構
interface CheckItem {
  id: string;
  text: string;
  checkedBy: string[];
  owner?: string;
  twPrice?: number;
  jpPrice?: number;
}

interface Category {
  id: string;
  title: string;
  color: string;
  items: CheckItem[];
}

interface Phrase {
  id: string;
  cn: string;
  jp: string;
  romaji: string;
  tag: 'basic' | 'food' | 'shopping' | 'traffic';
}

const COLOR_PALETTE = [
  '#F3A76C', '#7CAFC4', '#F5E050', '#96E0C5', 
  '#BCAAA4', '#F48FB1', '#9575CD', '#4DB6AC'
];

const INITIAL_PACKING: Category[] = [
  {
    id: 'important', title: '🔴 重要證件', color: '#F48FB1', items: [
      { id: '1', text: '護照', checkedBy: [] },
      { id: '2', text: '現金/信用卡', checkedBy: [] },
    ]
  }
];

const INITIAL_SHOPPING: Category[] = [
  {
    id: 'drugstore', title: '💊 藥妝店', color: '#96E0C5', items: []
  },
  {
    id: 'electronics', title: '📷 電器/3C', color: '#7CAFC4', items: []
  }
];

const JAPANESE_PHRASES: Phrase[] = [
  { id: 'b1', cn: '不好意思 / 請問...', jp: 'すみません', romaji: 'Sumimasen', tag: 'basic' },
  { id: 'b2', cn: '謝謝', jp: 'ありがとうございます', romaji: 'Arigatou gozaimasu', tag: 'basic' },
  { id: 'b3', cn: '可以用英文嗎？', jp: '英語でもいいですか？', romaji: 'Eigo demo ii desu ka?', tag: 'basic' },
  { id: 'b4', cn: '我想去這裡 (指地圖)', jp: 'ここに行きたいです', romaji: 'Koko ni ikitai desu', tag: 'traffic' },
  { id: 'f1', cn: '請問有位子嗎？(2人)', jp: '2人ですが、入れますか？', romaji: 'Futari desuga, hairemasuka?', tag: 'food' },
  { id: 'f2', cn: '我要這個 (指菜單)', jp: 'これをください', romaji: 'Kore o kudasai', tag: 'food' },
  { id: 'f3', cn: '請給我水', jp: 'お水をください', romaji: 'Omizu o kudasai', tag: 'food' },
  { id: 'f4', cn: '請問廁所哪裡？', jp: 'トイレはどこですか？', romaji: 'Toire wa doko desuka?', tag: 'basic' },
  { id: 'f5', cn: '結帳', jp: 'お会計をお願いします', romaji: 'Okaikei o onegaishimasu', tag: 'food' },
  { id: 'f6', cn: '我不吃牛肉', jp: '牛肉は食べられません', romaji: 'Gyuniku wa taberaremasen', tag: 'food' },
  { id: 's1', cn: '這個多少錢？', jp: 'これはいくらですか？', romaji: 'Kore wa ikura desuka?', tag: 'shopping' },
  { id: 's2', cn: '可以免稅嗎？', jp: '免税できますか？', romaji: 'Menzei dekimasu ka?', tag: 'shopping' },
  { id: 's3', cn: '可以刷卡嗎？', jp: 'カードは使えますか？', romaji: 'Kaado wa tsukaemasu ka?', tag: 'shopping' },
  { id: 's4', cn: '我有袋子', jp: '袋は持っています', romaji: 'Fukuro wa motte imasu', tag: 'shopping' },
  { id: 't1', cn: '車站由哪裡？', jp: '駅はどこですか？', romaji: 'Eki wa doko desuka?', tag: 'traffic' },
  { id: 't2', cn: '這班車有到___嗎？', jp: 'この電車は___に行きますか？', romaji: 'Kono densha wa ___ ni ikimasu ka?', tag: 'traffic' },
];

export const PreparationPage = () => {
  const [activeTab, setActiveTab] = useState<'packing' | 'shopping' | 'speaking'>('packing');
  
  const [packingCats, setPackingCats] = useState<Category[]>(INITIAL_PACKING);
  const [shoppingCats, setShoppingCats] = useState<Category[]>(INITIAL_SHOPPING);
  
  const [members, setMembers] = useState<string[]>(['我']);
  const [memberColors, setMemberColors] = useState<Record<string, string>>({});
  const [exchangeRate, setExchangeRate] = useState<number>(0.22);
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentMember, setCurrentMember] = useState<string>('我');
  const [viewMode, setViewMode] = useState<'individual' | 'summary'>('individual');
  
  const [pricingItemId, setPricingItemId] = useState<string | null>(null);
  const [phraseFilter, setPhraseFilter] = useState<'all' | 'basic' | 'food' | 'shopping' | 'traffic'>('all');

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

      const cloudColors = await loadFromCloud('travel-member-colors');
      if (cloudColors) setMemberColors(cloudColors);

      const cloudRate = await loadFromCloud('travel-exchange-rate');
      if (cloudRate) setExchangeRate(Number(cloudRate));

      const cloudPacking = await loadFromCloud('travel-preparation-data');
      if (cloudPacking) setPackingCats(migrateData(cloudPacking, cloudMembers));

      const cloudShopping = await loadFromCloud('travel-shopping-data');
      if (cloudShopping) setShoppingCats(migrateData(cloudShopping, cloudMembers));

      setIsLoading(false);
    };
    initData();
  }, []);

  const migrateData = (data: any[], currentMembers: string[]) => {
    return data.map((cat: any) => ({
      ...cat,
      color: cat.color || '#F3A76C',
      items: cat.items.map((item: any) => ({
        ...item,
        checkedBy: item.checkedBy || (item.checked ? [currentMembers?.[0] || '我'] : []),
        owner: item.owner || undefined,
        twPrice: item.twPrice || undefined,
        jpPrice: item.jpPrice || undefined
      }))
    }));
  };

  const saveCurrentData = (newData: Category[]) => {
    if (activeTab === 'packing') {
      setPackingCats(newData);
      saveToCloud('travel-preparation-data', newData);
    } else if (activeTab === 'shopping') {
      setShoppingCats(newData);
      saveToCloud('travel-shopping-data', newData);
    }
  };

  const currentCategories = activeTab === 'packing' ? packingCats : shoppingCats;

  const toggleCheck = (catId: string, itemId: string) => {
    if (viewMode === 'summary') return;
    const newCategories = currentCategories.map(cat => {
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
    saveCurrentData(newCategories);
  };

  const handleSaveCategory = () => {
    if (!formCatTitle.trim()) return;
    let newCategories;
    if (editingCat) {
      newCategories = currentCategories.map(c => 
        c.id === editingCat.id ? { ...c, title: formCatTitle, color: formCatColor } : c
      );
    } else {
      newCategories = [...currentCategories, { 
        id: Date.now().toString(), 
        title: formCatTitle, 
        color: formCatColor, 
        items: [] 
      }];
    }
    saveCurrentData(newCategories);
    setIsCatModalOpen(false);
  };

  const deleteCategory = (id: string) => {
    if (confirm('確定要刪除整個分類嗎？')) {
      const newCategories = currentCategories.filter(c => c.id !== id);
      saveCurrentData(newCategories);
    }
  };

  const handleAddItemKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, catId: string) => {
    if (e.key === 'Enter') {
      const text = e.currentTarget.value.trim();
      if (text) {
        const newCategories = currentCategories.map(c => {
          if (c.id === catId) {
            return { 
              ...c, 
              items: [...c.items, { 
                id: Date.now().toString(), 
                text, 
                checkedBy: [],
                owner: activeTab === 'shopping' ? currentMember : undefined 
              }] 
            };
          }
          return c;
        });
        saveCurrentData(newCategories);
        e.currentTarget.value = '';
      }
    }
  };

  // ▼▼▼ 新增：編輯項目功能 ▼▼▼
  const editItem = (catId: string, itemId: string, oldText: string) => {
    const newText = window.prompt("修改項目名稱：", oldText);
    if (newText !== null && newText.trim() !== "") {
      const newCategories = currentCategories.map(cat => {
        if (cat.id === catId) {
          return {
            ...cat,
            items: cat.items.map(item => item.id === itemId ? { ...item, text: newText.trim() } : item)
          };
        }
        return cat;
      });
      saveCurrentData(newCategories);
    }
  };
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  const deleteItem = (catId: string, itemId: string) => {
    const newCategories = currentCategories.map(cat => {
      if (cat.id === catId) {
        return { ...cat, items: cat.items.filter(i => i.id !== itemId) };
      }
      return cat;
    });
    saveCurrentData(newCategories);
  };

  const updatePrice = (catId: string, itemId: string, field: 'twPrice' | 'jpPrice', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    const newCategories = currentCategories.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: cat.items.map(item => item.id === itemId ? { ...item, [field]: numValue } : item)
        };
      }
      return cat;
    });
    saveCurrentData(newCategories);
  };

  const searchPrice = (keyword: string, country: 'TW' | 'JP') => {
    const query = country === 'TW' ? `${keyword} 價格` : `${keyword} 日本 価格`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  const calculateProgress = (member: string) => {
    let myItems = 0;
    let myChecked = 0;
    currentCategories.forEach(cat => {
      cat.items.forEach(item => {
        if (activeTab === 'shopping') {
          if (item.owner === member) {
            myItems++;
            if (item.checkedBy.includes(member)) myChecked++;
          }
        } else {
          myItems++;
          if (item.checkedBy.includes(member)) myChecked++;
        }
      });
    });
    if (myItems === 0) return 0;
    return Math.round((myChecked / myItems) * 100);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#8DD2BA]">
        <FontAwesomeIcon icon={faCloudArrowDown} className="text-4xl animate-bounce mb-2" />
        <p className="font-bold">正在整理清單...</p>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4">
      {/* 頂部 Tab */}
      <div className="bg-[#F2F4E7] p-1 rounded-2xl flex space-x-1 mb-4 border-2 border-[#E5E7EB] overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('packing')} className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all min-w-[100px] ${activeTab === 'packing' ? 'bg-white text-[#5C4033] shadow-sm' : 'text-gray-400'}`}>
          <FontAwesomeIcon icon={faSuitcase} /><span>行李</span>
        </button>
        <button onClick={() => setActiveTab('shopping')} className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all min-w-[100px] ${activeTab === 'shopping' ? 'bg-white text-[#5C4033] shadow-sm' : 'text-gray-400'}`}>
          <FontAwesomeIcon icon={faBagShopping} /><span>待買</span>
        </button>
        <button onClick={() => setActiveTab('speaking')} className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all min-w-[100px] ${activeTab === 'speaking' ? 'bg-white text-[#5C4033] shadow-sm' : 'text-gray-400'}`}>
          <FontAwesomeIcon icon={faComments} /><span>會話</span>
        </button>
      </div>

      {/* 如果是行李或購物模式 */}
      {activeTab !== 'speaking' && (
        <>
          <div className="flex space-x-2 mb-4 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2
                ${viewMode === 'summary' ? 'bg-[#5C4033] text-white border-[#5C4033] shadow-md' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              <FontAwesomeIcon icon={faUserGroup} className="mr-1" />總覽
            </button>
            {members.map(m => (
              <button
                key={m}
                onClick={() => { setCurrentMember(m); setViewMode('individual'); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2 relative pl-8 pr-4
                  ${viewMode === 'individual' && currentMember === m ? 'bg-white text-[#5C4033] border-[#5C4033] shadow-md' : 'bg-white text-gray-400 border-transparent'}`}
              >
                <span className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-gray-100" style={{ backgroundColor: memberColors[m] || '#eee' }} />
                {m}
              </button>
            ))}
          </div>

          {/* 總覽模式 */}
          {viewMode === 'summary' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#F2F4E7] mb-6 space-y-4">
              <h2 className="font-black text-[#5E5340] mb-2 text-center">
                {activeTab === 'packing' ? '📊 行李準備進度' : '📊 採購完成度'}
              </h2>
              {members.map(m => {
                const prog = calculateProgress(m);
                return (
                  <div key={m} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: memberColors[m] || '#ccc' }}></span>
                        {m}
                      </span>
                      <span>{prog}%</span>
                    </div>
                    <div className="h-2.5 bg-[#F2F4E7] rounded-full overflow-hidden">
                       <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${prog}%`, backgroundColor: prog === 100 ? '#3AA986' : (memberColors[m] || '#F3A76C') }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 個人模式 */}
          {viewMode === 'individual' && (
            <>
              <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#F2F4E7] mb-6">
                 <div className="flex justify-between items-end mb-2">
                    <h2 className="font-black text-[#5E5340] text-lg">{currentMember} 的{activeTab === 'packing' ? '行李' : '清單'}</h2>
                    <div className="flex items-center space-x-2">
                      {activeTab === 'shopping' && (<span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">匯率: {exchangeRate}</span>)}
                      <span className="text-[#3AA986] font-black font-mono text-2xl">{calculateProgress(currentMember)}%</span>
                    </div>
                 </div>
                 <div className="h-4 bg-[#F2F4E7] rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-500" style={{ width: `${calculateProgress(currentMember)}%`, backgroundColor: calculateProgress(currentMember) === 100 ? '#3AA986' : '#8DD2BA' }} />
                 </div>
              </div>

              <div className="space-y-6">
                {currentCategories.map(cat => {
                  const visibleItems = activeTab === 'shopping' ? cat.items.filter(item => item.owner === currentMember) : cat.items;
                  return (
                    <div key={cat.id} className="nook-card overflow-hidden">
                      <div className="p-3 flex justify-between items-center text-white" style={{ backgroundColor: cat.color }}>
                         <h3 className="font-black text-lg drop-shadow-md cursor-pointer flex items-center hover:opacity-90" onClick={() => openEditCatModal(cat)}>
                           {cat.title} <FontAwesomeIcon icon={faPen} className="ml-2 text-xs opacity-50" />
                         </h3>
                         <button onClick={() => deleteCategory(cat.id)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><FontAwesomeIcon icon={faTrashCan} /></button>
                      </div>
                      
                      <div className="p-4 pt-2 space-y-2">
                         {visibleItems.map(item => {
                           const isChecked = item.checkedBy.includes(currentMember);
                           const isPricing = pricingItemId === item.id;
                           const jpPriceInTwd = (item.jpPrice || 0) * exchangeRate;
                           const priceDiff = (item.twPrice || 0) - jpPriceInTwd;
                           const hasPriceData = item.twPrice && item.jpPrice;

                           return (
                             <div key={item.id} className="group flex flex-col border-b border-dashed border-gray-100 last:border-0 pb-2 mb-2">
                               <div className="flex items-center">
                                  <button onClick={() => toggleCheck(cat.id, item.id)} className={`w-6 h-6 rounded-lg border-2 mr-3 flex items-center justify-center transition-all flex-shrink-0 ${isChecked ? 'bg-[#3AA986] border-[#3AA986] text-white' : 'border-gray-300 text-transparent hover:border-[#3AA986]'}`}>
                                    <FontAwesomeIcon icon={faCheck} className="text-sm" />
                                  </button>
                                  
                                  <div className="flex-1">
                                    <span className={`font-bold transition-all ${isChecked ? 'text-gray-300 line-through' : 'text-[#5E5340]'}`}>{item.text}</span>
                                    {hasPriceData && !isPricing && (
                                      <div className="flex items-center text-[10px] font-bold mt-0.5 space-x-2">
                                        <span className="text-gray-400">台 ${item.twPrice}</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-gray-400">日 ¥{item.jpPrice}</span>
                                        <span className="text-gray-300">→</span>
                                        <span className={priceDiff > 0 ? 'text-green-500' : 'text-red-400'}>{priceDiff > 0 ? `省 ${Math.round(priceDiff)}` : `貴 ${Math.round(Math.abs(priceDiff))}`}</span>
                                      </div>
                                    )}
                                  </div>

                                  {activeTab === 'shopping' && (
                                     <button onClick={() => setPricingItemId(isPricing ? null : item.id)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors mr-1 ${hasPriceData ? (priceDiff > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500') : 'bg-orange-50 text-orange-400 hover:bg-orange-100'}`}>
                                       {isPricing ? <FontAwesomeIcon icon={faXmark} /> : <FontAwesomeIcon icon={faCalculator} />}
                                     </button>
                                  )}

                                  {/* ▼▼▼ 新增：編輯按鈕 ▼▼▼ */}
                                  <button onClick={() => editItem(cat.id, item.id, item.text)} className="text-gray-200 hover:text-blue-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FontAwesomeIcon icon={faPen} className="text-xs" />
                                  </button>
                                  {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}

                                  <button onClick={() => deleteItem(cat.id, item.id)} className="text-gray-200 hover:text-red-300 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><FontAwesomeIcon icon={faTrashCan} className="text-xs" /></button>
                               </div>

                               {isPricing && (
                                 <div className="mt-2 bg-[#FFFAFA] border-2 border-[#F2F4E7] rounded-xl p-3 animate-fade-in">
                                   <div className="grid grid-cols-2 gap-3 mb-2">
                                     <div>
                                       <div className="flex justify-between items-center mb-1">
                                         <label className="text-[10px] font-bold text-gray-400">台灣價格 (NT$)</label>
                                         <button onClick={() => searchPrice(item.text, 'TW')} className="text-[10px] text-blue-400 hover:underline"><FontAwesomeIcon icon={faMagnifyingGlassDollar} className="mr-1"/>查價</button>
                                       </div>
                                       <input type="number" value={item.twPrice || ''} onChange={(e) => updatePrice(cat.id, item.id, 'twPrice', e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-lg px-2 py-1 text-sm font-bold text-[#5E5340] outline-none focus:border-orange-200" placeholder="0" />
                                     </div>
                                     <div>
                                       <div className="flex justify-between items-center mb-1">
                                         <label className="text-[10px] font-bold text-gray-400">日本價格 (JPY)</label>
                                         <button onClick={() => searchPrice(item.text, 'JP')} className="text-[10px] text-blue-400 hover:underline"><FontAwesomeIcon icon={faMagnifyingGlassDollar} className="mr-1"/>查價</button>
                                       </div>
                                       <input type="number" value={item.jpPrice || ''} onChange={(e) => updatePrice(cat.id, item.id, 'jpPrice', e.target.value)} className="w-full bg-white border-2 border-gray-100 rounded-lg px-2 py-1 text-sm font-bold text-[#5E5340] outline-none focus:border-orange-200" placeholder="0" />
                                     </div>
                                   </div>
                                   {hasPriceData ? (
                                     <div className={`text-center py-2 rounded-lg font-bold text-sm flex items-center justify-center space-x-2 ${priceDiff > 0 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                       <FontAwesomeIcon icon={faArrowRightArrowLeft} className="text-xs opacity-50" />
                                       <span>{priceDiff > 0 ? `在日本買現省 NT$ ${Math.round(priceDiff)}！` : `注意！台灣買便宜 NT$ ${Math.round(Math.abs(priceDiff))}`}</span>
                                     </div>
                                   ) : (
                                     <div className="text-center text-[10px] text-gray-400 py-1">輸入兩地價格，自動幫你算價差</div>
                                   )}
                                 </div>
                               )}
                             </div>
                           );
                         })}

                         <div className="mt-2 flex items-center pt-2 border-t border-dashed border-gray-100">
                            <div className="w-6 h-6 mr-3 flex items-center justify-center text-gray-300"><FontAwesomeIcon icon={faPlus} className="text-xs" /></div>
                            <input type="text" placeholder={activeTab === 'packing' ? "新增行李項目..." : `新增 ${currentMember} 的待買物品...`} className="flex-1 bg-transparent outline-none text-sm font-bold text-[#5E5340] placeholder-gray-300" onKeyDown={(e) => handleAddItemKeyDown(e, cat.id)} />
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={openAddCatModal} className="w-full mt-6 bg-[#F2F4E7] text-[#796C53] border-2 border-dashed border-[#d1cfc7] rounded-2xl py-3 font-bold hover:bg-[#E8EAE0] transition-colors">
                <FontAwesomeIcon icon={faPlus} className="mr-2" /> 新增分類清單
              </button>
            </>
          )}

          <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title={editingCat ? "編輯分類" : "新增分類"}>
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-gray-400 mb-1">分類名稱</label>
                 <input type="text" value={formCatTitle} onChange={e => setFormCatTitle(e.target.value)} placeholder="名稱..." className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 font-bold outline-none focus:border-orange-200" autoFocus />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-400 mb-1 flex items-center"><FontAwesomeIcon icon={faPalette} className="mr-1" /> 代表顏色</label>
                 <div className="flex flex-wrap gap-2">
                   {COLOR_PALETTE.map(color => (
                     <button key={color} onClick={() => setFormCatColor(color)} className={`w-8 h-8 rounded-full shadow-sm border-2 transition-transform ${formCatColor === color ? 'border-gray-500 scale-110' : 'border-white'}`} style={{ backgroundColor: color }} />
                   ))}
                 </div>
               </div>
               <button onClick={handleSaveCategory} className="w-full bg-[#5C4033] text-white py-3 rounded-xl font-bold shadow-lg">{editingCat ? '儲存變更' : '新增分類'}</button>
             </div>
          </Modal>
        </>
      )}

      {activeTab === 'speaking' && (
        <div>
          <div className="flex space-x-2 mb-4 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: '全部', icon: faComments },
              { id: 'basic', label: '基本', icon: faCircleQuestion },
              { id: 'food', label: '餐廳', icon: faUtensils },
              { id: 'shopping', label: '購物', icon: faStore },
              { id: 'traffic', label: '交通', icon: faMapLocationDot },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setPhraseFilter(cat.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 border-2 whitespace-nowrap transition-all
                  ${phraseFilter === cat.id 
                    ? 'bg-[#5C4033] text-white border-[#5C4033]' 
                    : 'bg-white text-gray-400 border-gray-200'}`}
              >
                <FontAwesomeIcon icon={cat.icon} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {JAPANESE_PHRASES
              .filter(p => phraseFilter === 'all' || p.tag === phraseFilter)
              .map(phrase => (
                <div key={phrase.id} className="nook-card p-4 hover:bg-orange-50 transition-colors cursor-pointer active:scale-95">
                   <div className="text-xs font-bold text-gray-400 mb-1">{phrase.cn}</div>
                   <div className="text-2xl font-black text-[#5E5340] mb-1">{phrase.jp}</div>
                   <div className="text-xs text-orange-400 font-mono font-bold opacity-80">{phrase.romaji}</div>
                </div>
              ))}
          </div>
          
          <div className="text-center text-xs text-gray-300 font-bold mt-8">
            💡 遇到困難時，直接給對方看螢幕吧！
          </div>
        </div>
      )}
    </div>
  );
};