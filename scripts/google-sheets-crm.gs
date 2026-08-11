/**
 * King Auto Inc. — paste into Google Apps Script and redeploy web app.
 * Spreadsheet: King Auto WEB LEADS
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Missing POST body.");
    }

    const sheet = SpreadsheetApp.openById(
      "1tQYsw8tMGHeGveNN3PzDDdGlUB3edFbzTxzIa8S1CVI"
    );

    const data = JSON.parse(e.postData.contents);
    const type = data.formType;

    let ws;

    if (type === "vehicle_match") {
      // Tab name must match Google Sheet exactly (singular "Request")
      ws =
        sheet.getSheetByName("Vehicle Match Request") ||
        sheet.getSheetByName("Vehicle Match Requests");

      if (!ws) {
        throw new Error(
          "Sheet tab \"Vehicle Match Request\" not found in spreadsheet."
        );
      }

      ws.appendRow([
        new Date(),
        data.fullName || "",
        data.phone || "",
        data.email || "",
        data.vehicleWanted || "",
        data.budget || "",
        data.notes || "",
      ]);
    } else if (type === "quick_match") {
      ws = sheet.getSheetByName("60 Second Match");

      if (!ws) {
        throw new Error(
          "Sheet tab \"60 Second Match\" not found in spreadsheet."
        );
      }

      ws.appendRow([
        new Date(),
        data.fullName || "",
        data.phone || "",
        data.email || "",
        data.vehicleInterest || "",
        data.creditScore || "",
      ]);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Unknown form type.",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: err.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
