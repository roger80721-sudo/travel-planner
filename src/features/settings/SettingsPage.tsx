import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// ▼▼▼ 修正：移除了沒用到的 faCloudArrowDown ▼▼▼
import { faDownload, faUpload, faTriangleExclamation, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { loadFromCloud, saveToCloud } from '../../utils/supabase';

export const SettingsPage = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 定義所有要備份的 Key
  const STORAGE_KEYS = [
    'travel-planner-data',
    'travel-bookings-data',
    'travel-expenses-data',
    'travel-budget',
    'travel-exchange-rate',
    'travel-journal-data',
    'travel-trip-title',
    'travel-members'
  ];

  // 1. 雲端匯出功能
  const handleExport = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const data: Record<string, any> = {};
      
      for (const key of STORAGE_KEYS) {
        const value = await loadFromCloud(key);
        if (value) {
          data[key] = value;
        }
      }

      if (Object.keys(data).length === 0) {
        alert('雲端目前沒有任何資料可以備份喔！');
        setIsLoading(false);
        return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `日本旅遊雲端備份_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage('雲端資料已成功打包下載！');
    } catch (error) {
      console.error(error);
      alert('備份失敗，請檢查網路連線');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 雲端匯入功能
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm('⚠️ 警告：這將會覆蓋「雲端」上現有的所有資料！\n\n如果你的旅伴正在編輯，他們的進度會被你洗掉。\n確定要還原嗎？')) {
      event.target.value = '';
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);

        if (typeof data !== 'object') throw new Error('格式錯誤');

        for (const key of STORAGE_KEYS) {
          if (data[key]) {
            await saveToCloud(key, data[key]);
          }
        }

        alert('還原成功！雲端資料已更新，請重新整理網頁。');
        window.location.href = '/';
      } catch (err) {
        alert('匯入失敗：檔案格式不正確');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // 3. 重置功能
  const handleReset = async () => {
    if (confirm('⚠️ 危險警告：這將會永久清空「雲端」上的所有行程與記帳！\n\n你的旅伴也會看到資料消失。\n確定要清空嗎？')) {
      if (confirm('再次確認：真的要全部清空？(建議先下載備份)')) {
        setIsLoading(true);
        for (const key of STORAGE_KEYS) {
          await saveToCloud(key, null);
        }
        alert('雲端資料已重置。');
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="pb-24 px-4 pt-4">
      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded-xl mb-6 flex items-center text-sm font-bold animate-pulse">
          <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* 備份區塊 */}
        <div className="nook-card p-6">
          <h3 className="font-bold text-[#796C53] mb-2 text-lg">封存雲端資料</h3>
          <p className="text-xs text-gray-400 mb-4">
            將目前的雲端進度下載成檔案。建議每天備份一次，以防誤刪。
          </p>
          
          <button 
            onClick={handleExport}
            disabled={isLoading}
            className="w-full bg-[#5C4033] text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faDownload} />}
            <span>{isLoading ? '處理中...' : '下載備份檔案'}</span>
          </button>
        </div>

        {/* 還原區塊 */}
        <div className="nook-card p-6">
          <h3 className="font-bold text-[#796C53] mb-2 text-lg">還原時光機</h3>
          <p className="text-xs text-gray-400 mb-4">
            讀取備份檔並覆蓋回雲端。救命專用。
          </p>
          
          <label className={`w-full bg-white border-2 border-[#5C4033] text-[#5C4033] py-3 rounded-xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-transform cursor-pointer hover:bg-orange-50 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faUpload} />}
            <span>{isLoading ? '上傳中...' : '選擇檔案還原'}</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImport}
              className="hidden" 
              disabled={isLoading}
            />
          </label>
        </div>

        {/* 危險區塊 */}
        <div className="bg-red-50 rounded-3xl p-6 border border-red-100 mt-8">
          <h3 className="font-bold text-red-700 mb-2 text-lg flex items-center">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2" />
            危險區域
          </h3>
          <p className="text-xs text-red-400 mb-4">
            清空雲端所有資料，大家重新開始。
          </p>
          
          <button 
            onClick={handleReset}
            disabled={isLoading}
            className="w-full bg-white border border-red-200 text-red-500 py-3 rounded-xl font-bold active:scale-95 transition-transform hover:bg-red-100 disabled:opacity-50"
          >
            清空雲端資料
          </button>
        </div>
      </div>
      
      <div className="text-center mt-8 text-xs text-gray-300 font-mono">
        Cloud Version 2.0.0
      </div>
    </div>
  );
};