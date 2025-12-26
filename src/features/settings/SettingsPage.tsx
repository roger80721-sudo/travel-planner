import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faUpload, faTriangleExclamation, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export const SettingsPage = () => {
  const [message, setMessage] = useState('');

  // 定義所有用到的 Key (確保沒漏掉)
  const STORAGE_KEYS = [
    'travel-planner-data',   // 行程
    'travel-bookings-data',  // 預訂
    'travel-expenses-data',  // 記帳紀錄
    'travel-budget',         // 預算
    'travel-exchange-rate',  // 匯率
    'travel-journal-data',   // 日誌
    'travel-prep-data'       // 準備清單
  ];

  // 1. 匯出功能 (下載 JSON)
  const handleExport = () => {
    const data: Record<string, any> = {};
    let hasData = false;

    STORAGE_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        data[key] = JSON.parse(value);
        hasData = true;
      }
    });

    if (!hasData) {
      alert('目前沒有任何資料可以備份喔！');
      return;
    }

    // 建立下載連結
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `日本旅遊備份_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setMessage('備份檔案已下載！請妥善保存。');
  };

  // 2. 匯入功能 (讀取 JSON)
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);

        // 檢查檔案格式是否大致正確
        if (typeof data !== 'object') throw new Error('格式錯誤');

        if (window.confirm('確定要匯入嗎？這將會覆蓋現有的所有資料！')) {
          // 清空舊資料並寫入新資料
          STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
          
          Object.keys(data).forEach(key => {
            if (STORAGE_KEYS.includes(key)) {
              localStorage.setItem(key, JSON.stringify(data[key]));
            }
          });

          alert('資料還原成功！App 將會重新整理。');
          window.location.href = '/'; // 回首頁並重整
        }
      } catch (err) {
        alert('匯入失敗：檔案格式不正確');
      }
    };
    reader.readAsText(file);
    // 清空 input 讓同個檔案可以重複選
    event.target.value = '';
  };

  // 3. 重置功能
  const handleReset = () => {
    if (confirm('⚠️ 警告：這將會永久刪除所有行程、記帳與日記，無法復原！\n\n確定要清空嗎？')) {
      if (confirm('再次確認：真的要全部清空？')) {
        localStorage.clear();
        alert('所有資料已重置。');
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="pb-24 px-4 pt-4">
      {/* 提示訊息 */}
      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded-xl mb-6 flex items-center text-sm font-bold animate-pulse">
          <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* 備份區塊 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-2 text-lg">資料備份</h3>
          <p className="text-xs text-gray-400 mb-4">
            將所有行程、記帳、日記打包成一個檔案。建議定期備份，或在換手機前使用。
          </p>
          
          <button 
            onClick={handleExport}
            className="w-full bg-[#5C4033] text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-transform"
          >
            <FontAwesomeIcon icon={faDownload} />
            <span>下載備份檔案</span>
          </button>
        </div>

        {/* 還原區塊 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-2 text-lg">資料還原</h3>
          <p className="text-xs text-gray-400 mb-4">
            讀取之前的備份檔案。注意：這會覆蓋目前的資料。
          </p>
          
          <label className="w-full bg-white border-2 border-[#5C4033] text-[#5C4033] py-3 rounded-xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-transform cursor-pointer hover:bg-orange-50">
            <FontAwesomeIcon icon={faUpload} />
            <span>選擇檔案匯入</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImport}
              className="hidden" 
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
            將 App 回復到剛安裝的狀態，所有資料都會消失。
          </p>
          
          <button 
            onClick={handleReset}
            className="w-full bg-white border border-red-200 text-red-500 py-3 rounded-xl font-bold active:scale-95 transition-transform hover:bg-red-100"
          >
            清空所有資料
          </button>
        </div>
      </div>
      
      <div className="text-center mt-8 text-xs text-gray-300 font-mono">
        App Version 1.0.0
      </div>
    </div>
  );
};