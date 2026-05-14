/**
 * Google Apps Script — Lucky Stone Form Receiver
 * ================================================
 * รับข้อมูลจาก lucky-stone.html แล้วเขียนลง Google Sheet
 *
 * วิธีติดตั้ง:
 * --------------------------------------
 * 1) สร้าง Google Sheet ใหม่ ตั้งชื่ออะไรก็ได้ เช่น "Lucky Stone Leads"
 * 2) คัดลอก Sheet ID จาก URL — URL จะเป็นแบบ:
 *      https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXXXXX/edit
 *    เอาส่วน XXXXXXXX มาใส่ในค่า SHEET_ID ด้านล่าง
 * 3) ใน Sheet กด Extensions > Apps Script
 * 4) ลบโค้ดเก่าที่มีอยู่ออก แล้ววางโค้ดทั้งไฟล์นี้ลงไป
 * 5) แก้ค่า SHEET_ID และ SHEET_NAME (ถ้าต้องการ)
 * 6) กด Save (ไอคอนแผ่นดิสก์)
 * 7) กด Deploy > New deployment
 *    - Select type: Web app
 *    - Description: (ใส่อะไรก็ได้)
 *    - Execute as: Me (your account)
 *    - Who has access: Anyone           ← สำคัญ! ต้องเลือก Anyone
 * 8) กด Deploy — Google จะขอ permission กด Authorize Access
 * 9) คัดลอก Web app URL ที่ได้ (รูปแบบ https://script.google.com/macros/s/XXX/exec)
 * 10) เปิด lucky-stone.html → หา const SHEETS_ENDPOINT = '';
 *     แล้วใส่ URL ที่คัดลอกมาระหว่างเครื่องหมาย ''
 *
 * วิธีทดสอบ:
 * --------------------------------------
 * - เปิด URL ของ Web App ในเบราว์เซอร์ ควรเห็นข้อความ {"ok":true}
 * - กรอกฟอร์มในเว็บแล้วเช็คว่า Sheet มีแถวใหม่ปรากฏ
 *
 * หมายเหตุ:
 * --------------------------------------
 * - ถ้าแก้ไขโค้ดต้อง Deploy > Manage deployments > Edit > Version: New version
 * - ทุกครั้งที่ deploy ใหม่ URL จะเหมือนเดิม (ไม่ต้องเปลี่ยนใน HTML)
 */

// ====== Config ======
const SHEET_ID = 'PUT_YOUR_SHEET_ID_HERE';   // ← ใส่ Sheet ID ที่คัดลอกจาก URL
const SHEET_NAME = 'Submissions';            // ชื่อ tab ใน Sheet (ถ้าไม่มีจะสร้างให้)
// ====================

const HEADERS = [
  'Timestamp',
  'Submission ID',
  'First Name',
  'Last Name',
  'Birth Date',
  'Phone',
  'Email',
  'Day of Week',
  'Zodiac',
  'Chinese Zodiac',
  'Life Number',
  'PDPA Consent'
];

function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents
      ? e.postData.contents
      : '{}';
    const data = JSON.parse(body);

    const sheet = getOrCreateSheet_();
    ensureHeaders_(sheet);

    sheet.appendRow([
      new Date(data.timestamp || Date.now()),
      data.id || '',
      data.firstName || '',
      data.lastName || '',
      data.birthDate || '',
      data.phone || '',
      data.email || '',
      data.dayOfWeek || '',
      data.zodiac || '',
      data.cnZodiac || '',
      data.lifeNumber || '',
      data.consent ? 'Yes' : 'No'
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  // ใช้สำหรับทดสอบว่า Web App ทำงานหรือยัง — เปิด URL ในเบราว์เซอร์ดู
  return json_({
    ok: true,
    message: 'Lucky Stone receiver is live. POST submissions here.',
    time: new Date().toISOString()
  });
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#4b0082')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
