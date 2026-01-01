import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCloudArrowUp, faCloudArrowDown, faTriangleExclamation, faFileImport, faFileExport 
} from '@fortawesome/free-solid-svg-icons';
import { loadFromCloud, saveToCloud } from '../../utils/supabase';

// 定義我們要備份的所有資料 Key
const DATA_KEYS = [
  'travel-planner-data',    // 行李
  'travel-shopping-data',   // 待買清單
  'travel-bookings-data',   // 預訂
  'travel-expenses-data',   // 記帳
  'travel-members',         // 成員
  'travel-member-colors',   // 成員顏色
  'travel-exchange-rate',   // 匯率
  'travel-trip-title'       // 標題
];

export const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  // 📤 匯出備份 (下載到手機)
  const handleExport = async () => {
    setIsLoading(true);
    try {
      const backupData: Record<string, any> = {};
      
      // 1. 從雲端抓取所有最新資料
      for (const key of DATA_KEYS) {
        const data = await loadFromCloud(key);
        if (data) {
          backupData[key] = data;
        }
      }

      // 2. 加上備份時間戳記
      backupData['_backup_date'] = new Date().toISOString();

      // 3. 轉成 Blob 並下載
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      // 檔名加上日期，方便辨識
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `travel-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('✅ 備份檔案已下載！請妥善保存。');
    } catch (error) {
      console.error(error);
      alert('❌ 備份失敗，請檢查網路連線。');
    } finally {
      setIsLoading(false);
    }
  };

  // 📥 還原備份 (從手機上傳)
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('⚠️ 警告：還原備份將會「完全覆蓋」目前的資料！\n\n您後來新增的待買清單或行程將會消失，確定要還原嗎？')) {
      event.target.value = ''; // 清空選擇
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const jsonContent = e.target?.result as string;
        const backupData = JSON.parse(jsonContent);

        // 檢查檔案格式是否正確
        if (!backupData || typeof backupData !== 'object') {
          throw new Error('無效的備份檔案');
        }

        // 🔄 關鍵步驟：強制覆蓋每一筆資料
        for (const key of DATA_KEYS) {
          if (backupData[key] !== undefined) {
            // 這會直接用備份檔的資料，蓋掉雲端的資料 (Overwrite)
            await saveToCloud(key, backupData[key]);
          }
        }

        alert('🎉 還原成功！網頁將自動重新整理以載入舊資料。');
        
        // 🔄 強制重新整理，確保畫面讀取到的是剛還原的舊資料
        window.location.reload(); 

      } catch (error) {
        console.error(error);
        alert('❌ 還原失敗：檔案格式錯誤或網路問題。');
      } finally {
        setIsLoading(false);
        event.target.value = ''; // 清空選擇
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="pb-24 px-4 pt-4">
      <h2 className="text-2xl font-black text-[#5C4033] mb-6">設定與備份</h2>

      <div className="space-y-6">
        {/* 備份區塊 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-[#F2F4E7]">
          <h3 className="font-bold text-lg text-[#5E5340] mb-2 flex items-center">
            <FontAwesomeIcon icon={faCloudArrowDown} className="mr-2 text-blue-500" />
            備份資料 (Export)
          </h3>
          <p className="text-xs text-gray-400 mb-4 font-bold">
            將目前的行程、清單、記帳等所有資料下載成一個檔案 (.json) 存到手機或電腦中。
          </p>
          <button 
            onClick={handleExport}
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold text-white bg-[#5C4033] shadow-lg active:scale-95 transition-transform flex items-center justify-center"
          >
            {isLoading ? '處理中...' : <><FontAwesomeIcon icon={faFileExport} className="mr-2" /> 下載備份檔案</>}
          </button>
        </div>

        {/* 還原區塊 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-red-100">
          <h3 className="font-bold text-lg text-red-800 mb-2 flex items-center">
            <FontAwesomeIcon icon={faCloudArrowUp} className="mr-2 text-red-500" />
            還原資料 (Import)
          </h3>
          
          <div className="bg-red-50 p-3 rounded-xl mb-4 flex items-start space-x-2">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-500 mt-0.5" />
            <p className="text-xs font-bold text-red-600 leading-relaxed">
              注意：此動作會「清除」目前網頁上的所有資料，並用備份檔案完全取代。請確認您選對了檔案！
            </p>
          </div>

          <label className={`w-full py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center cursor-pointer ${isLoading ? 'bg-gray-400' : 'bg-red-500'}`}>
            <input 
              type="file" 
              accept=".json"
              onChange={handleImport}
              disabled={isLoading}
              className="hidden"
            />
            {isLoading ? '還原中...' : <><FontAwesomeIcon icon={faFileImport} className="mr-2" /> 選擇備份檔並還原</>}
          </label>
        </div>
        
        <div className="text-center text-xs text-gray-300 font-bold mt-8">
          版本 v1.0.5 | 資料儲存於 Supabase Cloud
        </div>
      </div>
    </div>
  );
};