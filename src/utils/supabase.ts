import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// 輔助函式：讀取資料
export const loadFromCloud = async (key: string) => {
  const { data, error } = await supabase
    .from('shared_data')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    console.log('查無雲端資料，使用預設值', error.message);
    return null;
  }
  return data?.value;
};

// 輔助函式：儲存資料
export const saveToCloud = async (key: string, value: any) => {
  const { error } = await supabase
    .from('shared_data')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) {
    console.error('儲存失敗:', error.message);
    alert('⚠️ 雲端儲存失敗，請檢查網路！');
  } else {
    console.log('☁️ 雲端儲存成功:', key);
  }
};