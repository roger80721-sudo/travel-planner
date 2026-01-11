import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

// Debug 檢查點 1: 確認 Key 是否存在
console.log("Checking API Key:", apiKey ? "✅ Key loaded" : "❌ Key matches undefined (Did you restart npm run dev?)");

const genAI = new GoogleGenerativeAI(apiKey || "DUMMY_KEY"); // 避免初始化崩潰

export interface ReceiptData {
  storeName: string;
  totalAmount: number;
  items: string;
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
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
  // 如果 Key 不存在，直接報錯，不送請求
  if (!apiKey) {
    console.error("⛔️ 錯誤：沒有讀取到 API Key。請檢查 .env 檔案並重啟終端機。");
    alert("系統設定錯誤：找不到 API Key，請通知開發者檢查 .env");
    return null;
  }

  try {
    console.log("🚀 開始傳送圖片給 Google Gemini...");
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const imagePart = await fileToGenerativePart(file);

    const prompt = `
      你是一個專業的會計助理。請分析這張收據圖片。
      請擷取以下資訊並直接回傳純 JSON 格式（不要使用 Markdown 標記，不要有 \`\`\`json）：
      1. storeName: 店家名稱 (日文)
      2. totalAmount: 總金額 (純數字，去掉逗號和符號)
      3. items: 請將所有購買品項翻譯成「繁體中文」，格式為字串："- 日文 (中文): ¥價格\\n"
      
      JSON 範例：
      { "storeName": "7-11", "totalAmount": 1000, "items": "- お茶 (綠茶): ¥100" }
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    console.log("🤖 AI 回傳原始資料:", text); // Debug 檢查點 2

    // 清理 JSON
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonString) as ReceiptData;

  } catch (error: any) {
    // 詳細錯誤捕捉
    console.error("❌ Gemini API 發生錯誤 詳細資訊:", error);
    
    if (error.message?.includes("API key")) {
       alert("API Key 無效或權限不足，請去 Google AI Studio 檢查");
    } else if (error.message?.includes("Safety")) {
       alert("圖片被 AI 安全機制阻擋，請重拍");
    } else {
       alert(`發生未知錯誤: ${error.message}`);
    }
    return null;
  }
};