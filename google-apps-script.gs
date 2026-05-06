/**
 * Google Apps Script (GAS) - The Academy Hub Backend
 * 
 * Instructions:
 * 1. Open a Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code.
 * 4. Replace FOLDER_ID with your Google Drive folder ID.
 * 5. Deploy as a Web App (Access: Anyone).
 */

const FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID';
const HISTORY_SHEET_NAME = 'ChatHistory';

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getFiles') {
    return ContentService.createTextOutput(JSON.stringify(getDriveFiles()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getHistory') {
    return ContentService.createTextOutput(JSON.stringify(getChatHistory()))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (data.action === 'logChat') {
    logChatToSheet(data.payload);
    return ContentService.createTextOutput('Success');
  }
}

/**
 * Scans Drive Folder for files and identifies type based on extension/name
 */
function getDriveFiles() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFiles();
  const result = [];
  
  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName().toLowerCase();
    let type = 'document';
    
    if (name.includes('survey') || name.includes('audio') || name.endsWith('.mp3')) type = 'audio';
    else if (name.includes('video') || name.endsWith('.mp4')) type = 'video';
    else if (name.includes('slide') || name.includes('presentation')) type = 'presentation';
    else if (name.includes('quiz') || name.includes('test')) type = 'quiz';
    else if (name.includes('table') || name.endsWith('.csv')) type = 'table';
    else if (name.includes('infographic')) type = 'infographic';
    else if (name.includes('mindmap')) type = 'mindmap';
    
    result.push({
      id: file.getId(),
      title: file.getName(),
      url: file.getUrl(),
      type: type,
      thumbnail: file.getThumbnail() ? file.getThumbnail().getDataAsString() : null
    });
  }
  return result;
}

/**
 * Logs chat history to Google Sheets
 * Columns: Timestamp | Representative | Question | Answer | Source Link
 */
function logChatToSheet(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(HISTORY_SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(HISTORY_SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Representative', 'Question', 'Answer', 'Source Link']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#f1f5f9');
  }
  
  sheet.appendRow([
    new Date(),
    payload.author || 'Anonymous',
    payload.question,
    payload.answer,
    payload.sourceUrl || ''
  ]);
}

function getChatHistory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HISTORY_SHEET_NAME);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.reverse().slice(0, 10).map(row => {
    return {
      timestamp: row[0],
      author: row[1],
      question: row[2],
      answer: row[3],
      sourceUrl: row[4]
    };
  });
}
