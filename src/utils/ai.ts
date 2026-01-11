// src/utils/ai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// 取得環境變數
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
  console.error("❌ 找不到 Google API Key，請檢查 .env 檔案");
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface ReceiptData {
  storeName: string;
  totalAmount: number;
  items: string; // 格式化後的明細字串
}

// 將 File 物件轉為 Base64 字串的輔助函式
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]); // 移除 metadata 標頭
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const parseReceipt = async (file: File): Promise<ReceiptData | null> => {
  try {
    // 1. 設定模型：使用 flash 版本最適合快速辨識
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. 準備圖片資料
    const imagePart = await fileToGenerativePart(file);

    // 3. 設定 Prompt (提示詞) - 這是 AI 準確度的關鍵
    const prompt = `
      你是一個專業的會計助理。請分析這張收據圖片。
      請擷取以下資訊並直接回傳純 JSON 格式（不要使用 Markdown 標記）：
      1. storeName: 店家名稱 (日文)
      2. totalAmount: 總金額 (純數字)
      3. items: 請將所有購買品項翻譯成「繁體中文」，並保留原日文名稱。
         格式請整理成字串："- 日文品名 (中文品名): ¥價格\\n"
         例如："- おにぎり (飯糰): ¥150"
      
      JSON 格式範例：
      {
        "storeName": "セブン-イレブン",
        "totalAmount": 1200,
        "items": "- お茶 (綠茶): ¥150\\n- 弁当 (便當): ¥500"
      }
    `;

    // 4. 發送請求
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // 5. 清理回傳的字串 (有時候 AI 會多加 ```json ... ```)
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonString) as ReceiptData;

  } catch (error) {
    console.error("Gemini 辨識失敗:", error);
    return null;
  }
};