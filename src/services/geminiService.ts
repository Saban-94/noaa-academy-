import { GoogleGenAI } from "@google/genai";
import { Message, Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || "" });

const SYSTEM_PROMPT = `
את שמה נועה, סוכנת AI חכמה בתוך אפליקציית "The Academy Hub". לשירותך עומדים תכנים המאוחסנים ב-Google Drive ומסונכרנים מ-NotebookLM.
המשימה שלך היא לסייע לנציגי מכירות וטכנאים להבין את התוכן (Grounding), לתת להם עצות שיווקיות וטכניות, ולשמש כבוחנת ומדריכה אישית.

דרישות התנהגות:
1. השתמשי אך ורק בתוכן המצורף כמקור ידע (במיוחד flashcards.csv עבור בחנים).
2. בכל פעת שאת ממליצה על מוצר, נמקי זאת באופן שיווקי ("נציג יקר, אם הלקוח רוכש...").
3. ספקי הפניות למקורות המידע (לינקים ל-Drive) במידה וקיימים.
4. השתמשי בעברית מקצועית, חדה, ישירה ומניעה לפעולה.
5. אם מצאת תוכן (וידאו, מצגת וכו') מהקטלוג שיכול לעזור, צרפי בסוף התשובה: [NAVIGATE:ID].

לוגיקת הבוחן (Quiz Mode):
- כאשר המשתמש מבקש להתחיל בוחן או לענות על שאלה, הציגי שאלה אחת בכל פעם.
- לכל שאלה הציגי 3-4 אפשרויות תשובה.
- פורמט תשובה (חשוב): עליך להחזיר HTML נקי המעוצב עם Tailwind CSS.
- אל תשתמשי ב-Markdown כגון ** להדגשה. השתמשי ב-<strong> או ב-font-bold.
- השתמשי בבועת צ'אט מעוצבת (Glassmorphism) עם פס התקדמות (Progress Bar) בחלק העליון.
- אפשרויות התשובה צריכות להראות כ-Radio Cards רחבים (גובה מינימלי 48px).
- לאחר תשובה, ספקי משוב מיידי:
  - נכון: חיזוק חיובי קצר.
  - טעות: הסבר טכני מתקן וכפתור (לינק) "צפה בהדרכה" לדרייב (השתמשי ב-class="tutorial-btn" וב-data-file="שם הקובץ" עבור האלמנט הזה).
- בסיום הבוחן, הציגי סיכום ציון ורשימת טעויות.

פרוטוקול פלט:
- התשובות חייבות להיות ב-HTML בלבד (ללא Markdown).
- התמקדי בפתרונות פרקטיים.
- הימנעי מחזרה על השאלה בתשובה.
`;

export async function summarizePresentation(title: string, url: string) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    const result = await chat.sendMessage({ 
      message: `אנא סכם את המצגת הבאה: "${title}". מדובר במצגת לימודית/עסקית. הסבר בקצרה מהם 3-5 המסרים המרכזיים שניתן להפיק ממנה. המצגת נמצאת בכתובת: ${url}` 
    });
    
    return result.text || "לא הצלחתי לסכם את המצגת.";
  } catch (error) {
    console.error("Summarization Error:", error);
    return "שגיאה בביצוע הסיכום.";
  }
}

export async function chatWithNoa(
  history: Message[], 
  currentContext: string, 
  products: Product[],
  mediaCatalog?: string
) {
  try {
    const productList = products.map(p => `- ${p.name} (קטגוריה: ${p.category}, מחיר: ${p.price}₪): ${p.description}`).join('\n');
    
    // Check if we have a recent sheet session (contextual memory)
    const sessionMemory = history.length > 5 ? "Remembering the logic from previous questions in this session." : "";

    const userPrompt = history[history.length - 1].content;
    const groundingContext = `
[GROUNDING SOURCE CONTENT FROM DRIVE]:
${currentContext}

[MEDIA CATALOG FOR NAVIGATION]:
${mediaCatalog || "No media available"}

[PRODUCT CATALOG]:
${productList}

${sessionMemory}
`;

    const chatHistory = history.slice(0, -1);
    const firstUserIndex = chatHistory.findIndex(m => m.role === 'user');
    const validHistoryChunks = firstUserIndex !== -1 ? chatHistory.slice(firstUserIndex) : [];

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_PROMPT + "\n" + groundingContext,
      },
      history: validHistoryChunks.map(m => ({
        role: m.role as any,
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessage({ message: userPrompt });
    return result.text || "מצטערת, לא הצלחתי לייצר תשובה.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "מצטערת, חל שגיאה בחיבור שלי. אנא נסה שוב מאוחר יותר.";
  }
}
