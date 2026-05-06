# אפיון טכני: The Academy Hub

## 1. חזון המערכת
The Academy Hub היא פלטפורמה מתקדמת המיועדת להפוך דאטה גולמי (מ-NotebookLM) לחוויית הדרכה ומכירה ויזואלית ועוצמתית. המערכת משלבת את העומק הטכנולוגי של ה-Dark Mode עם הניקיון והמיקוד של ה-Light Mode באזורי התוכן.

## 2. שפת עיצוב (Light & Dark Fusion)
*   **Shell (מעטפת):** Dark Mode יוקרתי. צבעי Graphite ו-Deep Blue. שימוש ב-Glassmorphism לתפריטים וסרגלים.
*   **Workspace (אזור עבודה):** כרטיסיות Light Mode צפות. לבן נקי (#FFFFFF) עם צלליות עמוקות ליצירת הפרדה.
*   **טיפוגרפיה:** Heebo (היבו) - נקי, מקצועי ומותאם לעברית.

## 3. ארכיטקטורת יכולות

### א. תשתית הטמעת תוכן (Link Importer)
מנגנון חכם המזהה לינקים מ-NotebookLM (או מקורות אחרים) ומייצר Widget מתאים:
1.  **Audio Widget:** נגן פודקאסטים עם שליטה במהירות (x1.5).
2.  **Video Widget:** נגן עם תמיכה בתמלול AI.
3.  **Doc Viewer:** ממשק דפדוף חלק (Swipe) למצגות ומסמכים.

### ב. נועה - סוכנת AI (Noa Agent)
סוכנת המכירות וההדרכה של המערכת.
*   **ממשק:** חלון צ'אט כהה עם תגובות מהירות.
*   **לוגיקה:** ניתוח התוכן המוטמע ומתן עצות שיווקיות.
*   **כרטיסי Upsell:** הזרקת כרטיסי מוצר בהירים בתוך הצ'אט לעידוד מכירה משלימה.

### ג. מנוע Upsell וקטלוג
*   קטלוג מוצרים נקי (Light Mode).
*   אלגוריתם המלצות מובנה המקשר בין תחומי עניין למוצרים פיזיים.

## 4. מפת מסכים (Navigation Flow)
1.  **Dashboard (Main Shell):**
    *   Siderbar (Dark) - ניווט בין הדרכות, קטלוג, והגדרות.
    *   Main Content Area (Dark Background) -> Light Cards (Lessons/Media).
2.  **Media Center:**
    *   כפתור הוספה (Link Importer Modal).
    *   צפייה בתוכן (Media Widgets).
3.  **Chat & Consultation:**
    *   Floating Chat (Noa).
    *   מסך מלא לייעוץ אסטרטגי.
4.  **Product Catalog:**
    *   תצוגת גריד של מוצרים.

## 5. טכנולוגיות
*   **Frontend:** React 18, Vite.
*   **Styling:** Tailwind CSS 4.
*   **Animations:** Framer Motion.
*   **AI:** Google Gemini API (via `@google/genai`).
*   **Icons:** Lucide React.
