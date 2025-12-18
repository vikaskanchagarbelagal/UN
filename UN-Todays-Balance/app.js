//app.js (Google Apps Script)
const API_KEY = "balance_sheet_secret";

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.key !== API_KEY) {
    return ContentService
      .createTextOutput("Unauthorized")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  if (data.type === "log") {
    const sheet = SpreadsheetApp.getActive().getSheetByName("Sheet1");
    sheet.appendRow([
      new Date(),
      data.name,
      data.mood,
      data.energy,
      data.activity,
      data.colors.join(" · "),
      data.fabric,
      data.climate
    ]);
  }

  if (data.type === "subscribe") {
    const sheet = SpreadsheetApp.getActive().getSheetByName("Subscriptions");
    sheet.appendRow([
      new Date(),
      data.email
    ]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
