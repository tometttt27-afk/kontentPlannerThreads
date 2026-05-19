// Konten Planner untuk Threads
// Nama sheet yang akan digunakan
const SHEET_NAME = 'Konten Planner';

// Fungsi untuk mendapatkan atau membuat sheet
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Setup header
    const headers = [
      'ID',
      'Tanggal Upload',
      'Hook',
      'Body Utas',
      'Soft Sell',
      'Link Affiliate',
      'Status Konten',
      'Kategori',
      'Target Audience',
      'Hashtags',
      'Notes',
      'Tanggal Dibuat',
      'Terakhir Diupdate'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.getRange(1, 1, 1, headers.length).setBackground('#4a90e2');
    sheet.getRange(1, 1, 1, headers.length).setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

// Fungsi untuk serve HTML
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Konten Planner Threads')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Fungsi untuk include file HTML
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Fungsi untuk mendapatkan semua konten
function getAllContent() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return [];
  }
  
  const data = sheet.getRange(2, 1, lastRow - 1, 13).getValues();
  
  return data.map(row => ({
    id: row[0],
    tanggalUpload: row[1] ? Utilities.formatDate(new Date(row[1]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
    hook: row[2],
    bodyUtas: row[3],
    softSell: row[4],
    linkAffiliate: row[5],
    statusKonten: row[6],
    kategori: row[7],
    targetAudience: row[8],
    hashtags: row[9],
    notes: row[10],
    tanggalDibuat: row[11] ? Utilities.formatDate(new Date(row[11]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : '',
    terakhirDiupdate: row[12] ? Utilities.formatDate(new Date(row[12]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : ''
  }));
}

// Fungsi untuk generate ID unik
function generateId() {
  return 'THREAD-' + new Date().getTime();
}

// Fungsi untuk menambah konten baru
function addContent(data) {
  try {
    const sheet = getSheet();
    const id = generateId();
    const timestamp = new Date();
    
    const newRow = [
      id,
      data.tanggalUpload || '',
      data.hook || '',
      data.bodyUtas || '',
      data.softSell || '',
      data.linkAffiliate || '',
      data.statusKonten || 'Draft',
      data.kategori || '',
      data.targetAudience || '',
      data.hashtags || '',
      data.notes || '',
      timestamp,
      timestamp
    ];
    
    sheet.appendRow(newRow);
    
    return {
      success: true,
      message: 'Konten berhasil ditambahkan!',
      id: id
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error: ' + error.toString()
    };
  }
}

// Fungsi untuk update konten
function updateContent(data) {
  try {
    const sheet = getSheet();
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1);
    const ids = dataRange.getValues();
    
    let rowIndex = -1;
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === data.id) {
        rowIndex = i + 2;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return {
        success: false,
        message: 'Konten tidak ditemukan!'
      };
    }
    
    const timestamp = new Date();
    
    sheet.getRange(rowIndex, 2).setValue(data.tanggalUpload || '');
    sheet.getRange(rowIndex, 3).setValue(data.hook || '');
    sheet.getRange(rowIndex, 4).setValue(data.bodyUtas || '');
    sheet.getRange(rowIndex, 5).setValue(data.softSell || '');
    sheet.getRange(rowIndex, 6).setValue(data.linkAffiliate || '');
    sheet.getRange(rowIndex, 7).setValue(data.statusKonten || 'Draft');
    sheet.getRange(rowIndex, 8).setValue(data.kategori || '');
    sheet.getRange(rowIndex, 9).setValue(data.targetAudience || '');
    sheet.getRange(rowIndex, 10).setValue(data.hashtags || '');
    sheet.getRange(rowIndex, 11).setValue(data.notes || '');
    sheet.getRange(rowIndex, 13).setValue(timestamp);
    
    return {
      success: true,
      message: 'Konten berhasil diupdate!'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error: ' + error.toString()
    };
  }
}

// Fungsi untuk hapus konten
function deleteContent(id) {
  try {
    const sheet = getSheet();
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1);
    const ids = dataRange.getValues();
    
    let rowIndex = -1;
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === id) {
        rowIndex = i + 2;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return {
        success: false,
        message: 'Konten tidak ditemukan!'
      };
    }
    
    sheet.deleteRow(rowIndex);
    
    return {
      success: true,
      message: 'Konten berhasil dihapus!'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error: ' + error.toString()
    };
  }
}

// Fungsi untuk mendapatkan konten berdasarkan ID
function getContentById(id) {
  const allContent = getAllContent();
  return allContent.find(content => content.id === id);
}

// Fungsi untuk filter konten berdasarkan status
function getContentByStatus(status) {
  const allContent = getAllContent();
  if (!status || status === 'Semua') {
    return allContent;
  }
  return allContent.filter(content => content.statusKonten === status);
}

// Fungsi untuk mendapatkan statistik
function getStatistics() {
  const allContent = getAllContent();
  
  const stats = {
    total: allContent.length,
    draft: allContent.filter(c => c.statusKonten === 'Draft').length,
    scheduled: allContent.filter(c => c.statusKonten === 'Terjadwal').length,
    published: allContent.filter(c => c.statusKonten === 'Dipublikasi').length,
    archived: allContent.filter(c => c.statusKonten === 'Arsip').length
  };
  
  return stats;
}
