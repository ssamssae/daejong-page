/**
 * 메모요 베타테스터 사전예약 - Google Apps Script
 *
 * 기능:
 * 1. 웹 폼에서 이메일 수신 (doPost)
 * 2. Google Sheets에 기록
 * 3. 확인 이메일 발송
 * 4. 관리자 알림
 */

// ===== CONFIG =====
const CONFIG = {
  SHEET_NAME: 'Testers',
  ADMIN_EMAIL: 'ssamssae@naver.com',
  OPT_IN_URL: 'https://play.google.com/apps/testing/com.daejongkang.simple_memo_app',
};

/**
 * POST 요청 처리 - 이메일 수집
 */
function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    const data = JSON.parse(e.postData.contents);
    const email = (data.email || '').trim().toLowerCase();

    // 이메일 유효성 검사
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return jsonResponse({ success: false, error: '유효한 이메일을 입력해주세요.' });
    }

    // 중복 체크
    const sheet = getOrCreateSheet();
    const existingEmails = sheet.getRange('A:A').getValues().flat().map(v => String(v).toLowerCase());
    if (existingEmails.includes(email)) {
      return jsonResponse({ success: false, error: '이미 등록된 이메일입니다.' });
    }

    // 동시성 제어
    lock.waitLock(30000);

    // 1. Sheets에 기록
    sheet.appendRow([email, new Date(), 'registered']);

    // 2. 확인 이메일 발송
    try {
      sendConfirmationEmail(email);
    } catch (err) {
      Logger.log('Email send failed: ' + err.message);
    }

    // 3. 관리자에게 알림
    try {
      var totalCount = sheet.getLastRow() - 1; // 헤더 제외
      MailApp.sendEmail({
        to: CONFIG.ADMIN_EMAIL,
        subject: '[메모요] 새 사전예약! (' + totalCount + '번째)',
        body: '새 사전예약이 등록됐습니다.\n\n' +
              '이메일: ' + email + '\n' +
              '시간: ' + new Date().toLocaleString('ko-KR') + '\n' +
              '누적 등록: ' + totalCount + '명\n\n' +
              '시트 확인: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
      });
    } catch (err) {
      Logger.log('Admin notification failed: ' + err.message);
    }

    lock.releaseLock();
    return jsonResponse({ success: true, message: '사전예약이 완료되었습니다! 이메일을 확인해주세요.' });

  } catch (err) {
    if (lock.hasLock()) lock.releaseLock();
    Logger.log('doPost error: ' + err.message);
    return jsonResponse({ success: false, error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
  }
}

/**
 * GET 요청 - 등록 수 확인 (공개)
 */
function doGet(e) {
  try {
    var sheet = getOrCreateSheet();
    var count = Math.max(0, sheet.getLastRow() - 1);
    return jsonResponse({ count: count });
  } catch (err) {
    return jsonResponse({ count: 0 });
  }
}

/**
 * 확인 이메일 발송
 */
function sendConfirmationEmail(email) {
  MailApp.sendEmail({
    to: email,
    subject: '[메모요] 사전예약 완료! 베타 테스트 안내',
    body: '안녕하세요!\n\n' +
      '메모요 베타 테스트에 사전예약해 주셔서 감사합니다.\n\n' +
      '베타 테스트에 참여하시려면 아래 링크를 클릭해주세요:\n' +
      CONFIG.OPT_IN_URL + '\n\n' +
      '위 링크에서 "테스터로 참여"를 눌러주시면 Google Play에서 메모요를 다운로드하실 수 있습니다.\n\n' +
      '* Google 계정(' + email + ')으로 로그인된 상태에서 클릭해주세요.\n' +
      '* 링크가 활성화되기까지 최대 몇 분 정도 걸릴 수 있습니다.\n\n' +
      '감사합니다!\n' +
      '강대종 드림'
  });
}

/**
 * 시트 가져오기 (없으면 생성)
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    sheet.appendRow(['Email', 'Registered At', 'Status']);
    sheet.getRange('1:1').setFontWeight('bold');
    sheet.setColumnWidth(1, 250);
    sheet.setColumnWidth(2, 200);
  }
  return sheet;
}

/**
 * JSON 응답 헬퍼
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 수동 실행: 전체 이메일 목록을 CSV로 로그에 출력
 * (Play Console 업로드용)
 */
function exportEmailsForPlayConsole() {
  var sheet = getOrCreateSheet();
  var data = sheet.getRange('A2:A' + sheet.getLastRow()).getValues();
  var emails = data.flat().filter(e => e).join('\n');
  Logger.log('=== Play Console 업로드용 이메일 목록 ===\n' + emails);
  Logger.log('총 ' + data.flat().filter(e => e).length + '명');
}
