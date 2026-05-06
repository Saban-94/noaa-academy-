import { MediaItem, Product } from '../types';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyN6o-RcJMD7qZ_lmLfdvdnTyRaYnX5Hapmzu0iwCmIIz5O9XG7lzYbRitW5BLVtvh4aw/exec';

export async function fetchDriveFiles(): Promise<MediaItem[]> {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getFiles`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
}

export async function fetchChatHistory() {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getHistory`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

export async function logChat(payload: { question: string; answer: string; sourceUrl?: string; author?: string }) {
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'logChat', payload }),
      mode: 'no-cors' // Google Apps Script often requires no-cors for POST requests from browser
    });
  } catch (error) {
    console.error('Error logging chat:', error);
  }
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getProducts`);
    const data = await response.json();
    // Expected Mapping:
    // A: ID, B: Name, C: Price, D: Complementary Product, E: Description, F: Video, G: PDF, H: Category, I: Image
    const seenIds = new Set<string>();
    return data.map((row: any, idx: number) => {
      let id = row[0] ? String(row[0]) : `prod-${idx}`;
      // Fallback if ID is already seen in this fetch
      if (seenIds.has(id)) {
        id = `${id}-duplicate-${idx}`;
      }
      seenIds.add(id);
      
      return {
        id: id,
        name: String(row[1]),
        price: parseFloat(row[2]) || 0,
        complementaryProductId: row[3] ? String(row[3]) : undefined,
        description: String(row[4]),
        videoUrl: row[5] ? String(row[5]) : undefined,
        pdfUrl: row[6] ? String(row[6]) : undefined,
        category: String(row[7]),
        image: row[8] ? String(row[8]) : 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400',
        upsellProducts: row[3] ? [String(row[3])] : []
      };
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getFileId(productName: string): Promise<string | null> {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getFileId&name=${encodeURIComponent(productName)}`);
    const data = await response.json();
    return data.fileId || null;
  } catch (error) {
    console.error('Error getting file ID:', error);
    return null;
  }
}
