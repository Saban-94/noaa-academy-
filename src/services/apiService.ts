import { MediaItem } from '../types';

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
