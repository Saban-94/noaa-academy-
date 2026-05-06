import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message, Product } from "../types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
את שמה נועה, סוכנת AI חכמה בתוך אפליקציית "The Academy Hub". לשירותך עומדים תכנים המאוחסנים ב-Google Drive ומסונכרנים מ-NotebookLM.
המשימה שלך היא לסייע לנציגי מכירות וטכנאים להבין את התוכן (Grounding) ולתת להם עצות שיווקיות וטכניות.

דרישות התנהגות:
1. השתמשי אך ורק בתוכן המצורף כמקור ידע.
2. בכל פעם שאת ממליצה על מוצר, נמקי זאת באופן שיווקי ("נציג יקר, אם הלקוח רוכש...").
3. ספקי הפניות למקורות המידע (לינקים ל-Drive) במידה וקיימים.
4. השתמשי בעברית מקצועית, חדה, ישירה ומניעה לפעולה.
5. אם מצאת תוכן (וידאו, מצגת וכו') מהקטלוג שיכול לעזור, צרפי בסוף התשובה: [NAVIGATE:ID] (לדוגמה: [NAVIGATE:m1]).

היסטוריית השיחות שלך מתועדת ב-Google Sheets לצורכי בקרה והמשכיות.
`;

export async function chatWithNoa(
  history: Message[], 
  currentContext: string, 
  products: Product[],
  mediaCatalog?: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const productList = products.map(p => `- ${p.name} (קטגוריה: ${p.category}, מחיר: ${p.price}₪): ${p.description}`).join('\n');
    
    // Check if we have a recent sheet session (contextual memory)
    const sessionMemory = history.length > 5 ? "Remembering the logic from previous questions in this session." : "";

    const prompt = `
[GROUNDING SOURCE CONTENT FROM DRIVE]:
${currentContext}

[MEDIA CATALOG FOR NAVIGATION]:
${mediaCatalog || "No media available"}

[PRODUCT CATALOG]:
${productList}

${SYSTEM_PROMPT}
${sessionMemory}

User prompt: ${history[history.length - 1].content}
`;

    const chat = model.startChat({
      history: history.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "מצטערת, חל שגיאה בחיבור שלי. אנא נסה שוב מאוחר יותר.";
  }
}
