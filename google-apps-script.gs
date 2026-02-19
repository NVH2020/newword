// ====================================Admin ========================================
const SPREADSHEET_ID_ADMIN = "1y7OmTFZxgdLgGUtoNpo7WTIVwJyeTVE9rzSzWaY_Btc";
const ssAdmin = SpreadsheetApp.openById(SPREADSHEET_ID_ADMIN);
// ====================================GV ===========================================
const SPREADSHEET_ID = "1y7OmTFZxgdLgGUtoNpo7WTIVwJyeTVE9rzSzWaY_Btc";
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

/**
 * GOOGLE APPS SCRIPT FOR ONLINE EXAM SYSTEM
 * Chức năng: Quản lý Giáo viên, Học sinh, Đề thi và Kết quả
 */

function doPost(e) {
  var params = JSON.parse(e.postData.contents);
  var action = params.action;
  var payload = params.payload;
  
  var result;
  try {
    switch (action) {
      case 'verifyTeacher':
        result = verifyTeacher(payload.idgv);
        break;
      case 'verifyStudent':
        result = verifyStudent(payload.idgv, payload.sbd);
        break;
      case 'saveExam':
        result = saveExam(payload.config, payload.questions);
        break;
      case 'getExamData':
        result = getExamData(payload.examCode);
        break;
      case 'submitResult':
        result = submitResult(payload.result);
        break;
      case 'resetResults':
        result = resetResults(payload.mode, payload.examCode);
        break;
      default:
        result = { success: false, message: 'Action not found' };
    }
  } catch (err) {
    result = { success: false, message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function verifyTeacher(idgv) {
  var sheet = ssAdmin.getSheetByName('idgv');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == idgv) {
      return { 
        success: true, 
        data: { idNumber: data[i][0], name: data[i][1], subject: data[i][3], linkScript: data[i][2] } 
      };
    }
  }
  return { success: false, message: 'Teacher ID not found' };
}

function verifyStudent(idgv, sbd) {
  var sheet = ss.getSheetByName('danhsach');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == sbd && data[i][5] == idgv) {
      return { 
        success: true, 
        data: { sbd: data[i][0], name: data[i][1], class: data[i][2], idgv: data[i][3] } 
      };
    }
  }
  return { success: false, message: 'Student not found in this teacher\'s list' };
}

function saveExam(config, questions) {
  var examSheet = ss.getSheetByName('exams');
  
  // Lưu hoặc cập nhật Config
  var configFound = false;
  var configData = examSheet.getDataRange().getValues();
  for(var i=1; i<configData.length; i++) {
    if(configData[i][0] == config.exams) {
      examSheet.getRange(i+1, 2).setValue(JSON.stringify(config));
      examSheet.getRange(i+1, 3).setValue(JSON.stringify(questions));
      configFound = true;
      break;
    }
  }
  
  if(!configFound) {
    examSheet.appendRow([config.exams, JSON.stringify(config), JSON.stringify(questions)]);
  }
  
  return { success: true };
}

function getExamData(examCode) {
  var sheet = ss.getSheetByName('exams');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == examCode) {
      return { 
        success: true, 
        config: JSON.parse(data[i][1]), 
        questions: JSON.parse(data[i][2]) 
      };
    }
  }
  return { success: false, message: 'Exam code not found' };
}

function submitResult(res) {
  var sheet = ss.getSheetByName('ketqua');
  sheet.appendRow([
    res.timestamp, 
    res.exams, 
    res.sbd, 
    res.name, 
    res.class, 
    res.totalScore, 
    res.timeTaken, 
    res.detail
  ]);
  return { success: true };
}

function resetResults(mode, examCode) {
  var sheet = ss.getSheetByName('ketqua');
  if (mode === 'all') {
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
  } else if (mode === 'exam' && examCode) {
    var data = sheet.getDataRange().getValues();
    for (var i = data.length - 1; i >= 1; i--) {
      if (data[i][1] == examCode) {
        sheet.deleteRow(i + 1);
      }
    }
  }
  return { success: true };
}
