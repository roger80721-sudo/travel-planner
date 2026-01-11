import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// 👇 1. 新增：讀取目前設定的行程代碼 (如果沒設定，預設為 "default")
const getTripId = () => {
  return localStorage.getItem('trip_id') || 'default';
};

// 輔助函式：讀取資料
export const loadFromCloud = async (key: string) => {
  // 👇 2. 修改：將行程代碼加到 key 前面 (例如: japan_expenses)
  const tripId = getTripId();
  const finalKey = `${tripId}_${key}`;

  const { data, error } = await supabase
    .from('shared_data') // 維持你截圖中的 table 名稱
    .select('value')
    .eq('key', finalKey) // 使用新的 key 來查詢
    .single();

  if (error) {
    // 這裡通常是因為該行程還沒有資料，屬於正常現象，可以把 log 改成 debug 用
    console.log(`[${tripId}] 查無雲端資料 (${key}), 使用預設值`);
    return null;
  }

  return data?.value;
};

// 輔助函式：儲存資料
export const saveToCloud = async (key: string, value: any) => {
  // 👇 3. 修改：將行程代碼加到 key 前面
  const tripId = getTripId();
  const finalKey = `${tripId}_${key}`;

  const { error } = await supabase
    .from('shared_data')
    .upsert({ key: finalKey, value }, { onConflict: 'key' });

  if (error) {
    console.error('儲存失敗:', error.message);
    alert('⚠️ 雲端儲存失敗，請檢查網路！');
  } else {
    console.log(`☁️ 雲端儲存成功 [${tripId}]:`, key);
  }
};