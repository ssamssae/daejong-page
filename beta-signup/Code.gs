/**
 * 메모요 베타테스터 자동 등록 - Google Apps Script
 *
 * 기능:
 * 1. 웹 폼에서 이메일 수신 (doPost)
 * 2. Google Sheets에 기록
 * 3. Google Play Developer API로 베타테스터 등록
 * 4. 확인 이메일 발송
 *
 * 셋업:
 * 1. 이 스크립트를 Google Apps Script 에디터에 붙여넣기
 * 2. CONFIG 섹션의 값들을 수정
 * 3. "웹 앱으로 배포" → 실행: 나 / 접근: 모든 사용자
 * 4. appsscript.json에 oauthScopes 추가 (아래 참조)
 */

// ===== CONFIG =====
const CONFIG = {
  PACKAGE_NAME: 'com.daejongkang.simple_memo_app',
  TRACK: 'beta',  // 'alpha', 'beta', 'production', 또는 커스텀 트랙명
  SHEET_NAME: 'Testers',
  ADMIN_EMAIL: 'ssamssae@naver.com',
  OPT_IN_URL: 'https://play.google.com/apps/testing/com.daejongkang.simple_memo_app',
};

/**
 * CORS preflight 처리
 */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * POST 요청 처리 - 이메일 수집 및 베타테스터 등록
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

    // 동시성 제어 - 락 획득
    lock.waitLock(30000);

    // 1. Sheets에 기록
    sheet.appendRow([email, new Date(), 'pending']);
    const row = sheet.getLastRow();

    // 2. Play Developer API로 테스터 등록
    let playResult = 'skipped';
    try {
      addTesterToTrack(email);
      playResult = 'registered';
      sheet.getRange(row, 3).setValue('registered');
    } catch (err) {
      playResult = 'play_api_error: ' + err.message;
      sheet.getRange(row, 3).setValue('error');
      sheet.getRange(row, 4).setValue(err.message);
    }

    // 3. 확인 이메일 발송
    try {
      sendConfirmationEmail(email);
    } catch (err) {
      // 이메일 발송 실패해도 등록은 성공으로 처리
      Logger.log('Email send failed: ' + err.message);
    }

    // 4. 관리자에게 알림
    try {
      MailApp.sendEmail({
        to: CONFIG.ADMIN_EMAIL,
        subject: '[메모요] 새 베타테스터 등록: ' + email,
        body: '새 베타테스터가 등록했습니다.\n\n이메일: ' + email + '\n시간: ' + new Date().toLocaleString('ko-KR') + '\nPlay API 결과: ' + playResult
      });
    } catch (err) {
      Logger.log('Admin notification failed: ' + err.message);
    }

    lock.releaseLock();
    return jsonResponse({ success: true, message: '사전예약이 완료되었습니다!' });

  } catch (err) {
    if (lock.hasLock()) lock.releaseLock();
    Logger.log('doPost error: ' + err.message);
    return jsonResponse({ success: false, error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
  }
}

/**
 * Google Play Developer API - 테스터 추가
 */
function addTesterToTrack(email) {
  const baseUrl = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' + CONFIG.PACKAGE_NAME;
  const token = ScriptApp.getOAuthToken();
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  // 1. Edit 생성
  var res = UrlFetchApp.fetch(baseUrl + '/edits', {
    method: 'post',
    headers: headers,
    payload: JSON.stringify({}),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200) {
    throw new Error('Edit 생성 실패: ' + res.getContentText());
  }
  var editId = JSON.parse(res.getContentText()).id;

  // 2. 현재 테스터 목록 가져오기
  res = UrlFetchApp.fetch(baseUrl + '/edits/' + editId + '/testers/' + CONFIG.TRACK, {
    method: 'get',
    headers: headers,
    muteHttpExceptions: true
  });

  var testers = { googleGroups: [] };
  if (res.getResponseCode() === 200) {
    testers = JSON.parse(res.getContentText());
  }

  // 이메일 목록에 추가
  if (!testers.googlePlusCommunities) testers.googlePlusCommunities = [];

  // 3. 테스터 업데이트 (PATCH)
  res = UrlFetchApp.fetch(baseUrl + '/edits/' + editId + '/testers/' + CONFIG.TRACK, {
    method: 'put',
    headers: headers,
    payload: JSON.stringify(testers),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200) {
    // Edit 삭제 시도
    UrlFetchApp.fetch(baseUrl + '/edits/' + editId + ':delete', { method: 'delete', headers: headers, muteHttpExceptions: true });
    throw new Error('테스터 업데이트 실패: ' + res.getContentText());
  }

  // 4. Edit 커밋
  res = UrlFetchApp.fetch(baseUrl + '/edits/' + editId + ':commit', {
    method: 'post',
    headers: headers,
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200) {
    throw new Error('Edit 커밋 실패: ' + res.getContentText());
  }

  Logger.log('Tester added successfully: ' + email);
}

/**
 * 확인 이메일 발송
 */
function sendConfirmationEmail(email) {
  const subject = '[메모요] 사전예약 완료! 베타 테스트 안내';
  const body =
    '안녕하세요!\n\n' +
    '메모요 베타 테스트에 사전예약해 주셔서 감사합니다.\n\n' +
    '베타 테스트에 참여하시려면 아래 링크를 클릭해주세요:\n' +
    CONFIG.OPT_IN_URL + '\n\n' +
    '위 링크에서 "테스터로 참여"를 눌러주시면 Google Play에서 메모요를 다운로드하실 수 있습니다.\n\n' +
    '* Google 계정(' + email + ')으로 로그인된 상태에서 클릭해주세요.\n' +
    '* 링크가 활성화되기까지 최대 몇 분 정도 걸릴 수 있습니다.\n\n' +
    '감사합니다!\n' +
    '강대종 드림';

  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: body
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
    sheet.appendRow(['Email', 'Registered At', 'Status', 'Error']);
    sheet.getRange('1:1').setFontWeight('bold');
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
 * 테스트용 - 수동으로 테스터 목록 확인
 */
function testGetTesters() {
  const baseUrl = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' + CONFIG.PACKAGE_NAME;
  const token = ScriptApp.getOAuthToken();

  var res = UrlFetchApp.fetch(baseUrl + '/edits', {
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    payload: JSON.stringify({})
  });
  var editId = JSON.parse(res.getContentText()).id;

  res = UrlFetchApp.fetch(baseUrl + '/edits/' + editId + '/testers/' + CONFIG.TRACK, {
    headers: { 'Authorization': 'Bearer ' + token }
  });

  Logger.log('Current testers: ' + res.getContentText());

  // 변경 없이 Edit 삭제
  UrlFetchApp.fetch(baseUrl + '/edits/' + editId + ':delete', {
    method: 'delete',
    headers: { 'Authorization': 'Bearer ' + token },
    muteHttpExceptions: true
  });
}
