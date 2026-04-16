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
  TELEGRAM_BOT_TOKEN: '8312381862:AAHD9jAGeY9Z-ELOA23wyn71Ngymfn9hrcE',
  TELEGRAM_CHAT_ID: '538806975',
  PACKAGE_NAME: 'com.daejongkang.simple_memo_app',
  TRACK: 'closed:testers',  // 비공개 테스트 트랙
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

    // 3. 관리자에게 알림 (이메일 + 텔레그램)
    var totalCount = sheet.getLastRow() - 1;
    try {
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
      Logger.log('Admin email failed: ' + err.message);
    }

    // 4. Play Console 베타테스터 자동 등록
    var playResult = '미등록';
    try {
      playResult = addTesterToPlayConsole(email);
    } catch (err) {
      Logger.log('Play Console registration failed: ' + err.message);
      playResult = '실패: ' + err.message;
    }

    // 5. 시트 상태 업데이트
    if (playResult === '등록완료') {
      var lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 3).setValue('play_registered');
    }

    // 6. 텔레그램 실시간 알림
    try {
      sendTelegramNotification(email, totalCount, playResult);
    } catch (err) {
      Logger.log('Telegram notification failed: ' + err.message);
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
 * GET 요청 - 등록 수 확인 / 관리자 명령
 * ?action=delete&row=2 → 특정 행 삭제 (관리자용, secret 필요)
 * ?action=list&secret=xxx → 전체 목록
 */
function doGet(e) {
  try {
    var params = e.parameter || {};
    var action = params.action;
    var secret = params.secret;
    var ADMIN_SECRET = 'memoyo2026';

    var sheet = getOrCreateSheet();

    if (action === 'delete' && secret === ADMIN_SECRET) {
      var row = parseInt(params.row) || 2;
      if (row >= 2 && row <= sheet.getLastRow()) {
        var deleted = sheet.getRange(row, 1).getValue();
        sheet.deleteRow(row);
        return jsonResponse({ success: true, deleted: deleted, remaining: sheet.getLastRow() - 1 });
      }
      return jsonResponse({ success: false, error: 'Invalid row' });
    }

    if (action === 'list' && secret === ADMIN_SECRET) {
      var data = sheet.getDataRange().getValues();
      return jsonResponse({ entries: data.slice(1) });
    }

    var count = Math.max(0, sheet.getLastRow() - 1);
    return jsonResponse({ count: count });
  } catch (err) {
    return jsonResponse({ count: 0, error: err.message });
  }
}

/**
 * 텔레그램 실시간 알림
 */
function sendTelegramNotification(email, totalCount, playResult) {
  var text = '[메모요 사전예약] 새 등록!\n\n' +
    '이메일: ' + email + '\n' +
    '누적: ' + totalCount + '명\n' +
    'Play Console: ' + (playResult || '미확인');

  var url = 'https://api.telegram.org/bot' + CONFIG.TELEGRAM_BOT_TOKEN + '/sendMessage';
  UrlFetchApp.fetch(url, {
    method: 'post',
    payload: {
      chat_id: CONFIG.TELEGRAM_CHAT_ID,
      text: text
    },
    muteHttpExceptions: true
  });
}

/**
 * Play Console 베타테스터 자동 등록
 * REST API + ScriptApp.getOAuthToken() 사용 (Advanced Service 불필요)
 */
function addTesterToPlayConsole(newEmail) {
  var packageName = CONFIG.PACKAGE_NAME;
  var token = ScriptApp.getOAuthToken();
  var baseUrl = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' + packageName;
  var headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  // 1. Edit 생성
  var editRes = UrlFetchApp.fetch(baseUrl + '/edits', {
    method: 'post',
    headers: headers,
    payload: '{}',
    muteHttpExceptions: true
  });
  var edit = JSON.parse(editRes.getContentText());
  if (!edit.id) {
    Logger.log('Edit 생성 실패: ' + editRes.getContentText());
    return '실패: Edit 생성 오류';
  }
  var editId = edit.id;

  try {
    // 2. 현재 테스터 목록 조회
    var testersRes = UrlFetchApp.fetch(baseUrl + '/edits/' + editId + '/testers/' + CONFIG.TRACK, {
      method: 'get',
      headers: headers,
      muteHttpExceptions: true
    });
    var testers;
    if (testersRes.getResponseCode() === 200) {
      testers = JSON.parse(testersRes.getContentText());
    } else {
      testers = { googleGroups: [], testerEmails: [] };
    }
    var currentEmails = testers.testerEmails || [];

    // 3. 이미 등록되어 있으면 스킵
    if (currentEmails.indexOf(newEmail) >= 0) {
      UrlFetchApp.fetch(baseUrl + '/edits/' + editId, { method: 'delete', headers: headers, muteHttpExceptions: true });
      return '이미등록됨';
    }

    // 4. 새 이메일 추가
    currentEmails.push(newEmail);
    testers.testerEmails = currentEmails;

    // 5. 테스터 목록 업데이트
    var updateRes = UrlFetchApp.fetch(baseUrl + '/edits/' + editId + '/testers/' + CONFIG.TRACK, {
      method: 'put',
      headers: headers,
      payload: JSON.stringify(testers),
      muteHttpExceptions: true
    });
    if (updateRes.getResponseCode() !== 200) {
      throw new Error('테스터 업데이트 실패: ' + updateRes.getContentText());
    }

    // 6. Edit 커밋
    var commitRes = UrlFetchApp.fetch(baseUrl + '/edits/' + editId + ':commit', {
      method: 'post',
      headers: headers,
      muteHttpExceptions: true
    });
    if (commitRes.getResponseCode() !== 200) {
      throw new Error('커밋 실패: ' + commitRes.getContentText());
    }

    Logger.log('Play Console 테스터 등록 성공: ' + newEmail);
    return '등록완료';

  } catch (err) {
    try { UrlFetchApp.fetch(baseUrl + '/edits/' + editId, { method: 'delete', headers: headers, muteHttpExceptions: true }); } catch(e) {}
    Logger.log('Play Console 등록 실패: ' + err.message);
    throw err;
  }
}

/**
 * 수동 실행: 시트의 모든 미등록 이메일을 Play Console에 일괄 등록
 */
function syncAllTestersToPlayConsole() {
  var sheet = getOrCreateSheet();
  var data = sheet.getDataRange().getValues();
  var packageName = CONFIG.PACKAGE_NAME;
  var token = ScriptApp.getOAuthToken();
  var baseUrl = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' + packageName;
  var headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  // Edit 생성
  var editRes = UrlFetchApp.fetch(baseUrl + '/edits', { method: 'post', headers: headers, payload: '{}', muteHttpExceptions: true });
  var edit = JSON.parse(editRes.getContentText());
  if (!edit.id) throw new Error('Edit 생성 실패');
  var editId = edit.id;

  try {
    var testersRes = UrlFetchApp.fetch(baseUrl + '/edits/' + editId + '/testers/' + CONFIG.TRACK, {
      method: 'get', headers: headers, muteHttpExceptions: true
    });
    var testers = testersRes.getResponseCode() === 200
      ? JSON.parse(testersRes.getContentText())
      : { googleGroups: [], testerEmails: [] };
    var currentEmails = testers.testerEmails || [];

    var added = 0;
    for (var i = 1; i < data.length; i++) {
      var email = String(data[i][0]).trim().toLowerCase();
      if (email && currentEmails.indexOf(email) < 0) {
        currentEmails.push(email);
        added++;
        sheet.getRange(i + 1, 3).setValue('play_registered');
      }
    }

    if (added > 0) {
      testers.testerEmails = currentEmails;
      UrlFetchApp.fetch(baseUrl + '/edits/' + editId + '/testers/' + CONFIG.TRACK, {
        method: 'put', headers: headers, payload: JSON.stringify(testers), muteHttpExceptions: true
      });
      UrlFetchApp.fetch(baseUrl + '/edits/' + editId + ':commit', {
        method: 'post', headers: headers, muteHttpExceptions: true
      });
      Logger.log(added + '명 Play Console 일괄 등록 완료');
    } else {
      UrlFetchApp.fetch(baseUrl + '/edits/' + editId, { method: 'delete', headers: headers, muteHttpExceptions: true });
      Logger.log('새로 등록할 이메일 없음');
    }
    return added;
  } catch (err) {
    try { UrlFetchApp.fetch(baseUrl + '/edits/' + editId, { method: 'delete', headers: headers, muteHttpExceptions: true }); } catch(e) {}
    throw err;
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
 * 수동 실행: 첫 번째 테스트 데이터 삭제
 */
function deleteFirstTestEntry() {
  var sheet = getOrCreateSheet();
  if (sheet.getLastRow() > 1) {
    sheet.deleteRow(2); // 헤더 다음 첫 번째 행
    Logger.log('첫 번째 항목 삭제 완료. 남은 항목: ' + (sheet.getLastRow() - 1));
  }
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
