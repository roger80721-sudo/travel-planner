// 把 "10:30" 轉成 分鐘數 (例如 630)
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// 把 分鐘數 轉回 "10:30" 格式
export const minutesToTime = (totalMinutes: number): string => {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  
  // 處理跨日問題 (簡單處理：超過 24 小時就減掉)
  if (hours >= 24) hours -= 24;
  if (hours < 0) hours += 24;

  const hStr = hours.toString().padStart(2, '0');
  const mStr = minutes.toString().padStart(2, '0');
  return `${hStr}:${mStr}`;
};

// 核心邏輯：根據前後行程，計算新的時間
export const calculateNewTime = (prevTime: string | null, nextTime: string | null): string => {
  // 情況 1: 移到最第一筆 (沒有上一個) -> 比下一個早 30 分鐘
  if (!prevTime && nextTime) {
    return minutesToTime(timeToMinutes(nextTime) - 30);
  }

  // 情況 2: 移到最後一筆 (沒有下一個) -> 比上一個晚 60 分鐘
  if (prevTime && !nextTime) {
    return minutesToTime(timeToMinutes(prevTime) + 60);
  }

  // 情況 3: 插在中間 -> 取平均值
  if (prevTime && nextTime) {
    const start = timeToMinutes(prevTime);
    const end = timeToMinutes(nextTime);
    
    // 如果時間順序不合理 (例如 上一個是 12:00，下一個是 10:00)，那就直接 +30 分鐘
    if (start >= end) {
      return minutesToTime(start + 30);
    }

    const mid = Math.floor((start + end) / 2);
    return minutesToTime(mid);
  }

  // 情況 4: 只有自己一個 -> 維持 10:00
  return "10:00";
};