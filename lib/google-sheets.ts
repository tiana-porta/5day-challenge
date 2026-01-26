interface WorksheetRow {
  cantBecause: string;
  reframed: boolean;
  neverEasierBecause: string;
}

interface WorksheetSubmission {
  timestamp: string;
  submissionId: string;
  dayNumber: number;
  username: string;
  email: string;
  worksheetData: WorksheetRow[];
  notes: string;
  status: string;
}

// Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzN58ZlASkKwjPNsTKyUU0TSfLIQOcb6BprOBHqUJVwbS6osiv67CWyrHINmIjv-edhjQ/exec";

export async function appendWorksheetSubmission(data: WorksheetSubmission): Promise<void> {
  // Format worksheet data as a readable string for the sheet
  const reframesText = data.worksheetData
    .map((row, i) => `${i + 1}. "${row.cantBecause}" → "${row.neverEasierBecause}"`)
    .join("\n");

  const payload = {
    timestamp: data.timestamp,
    submissionId: data.submissionId,
    dayNumber: data.dayNumber,
    username: data.username,
    email: data.email,
    reframes: reframesText,
    reframeCount: data.worksheetData.length,
    notes: data.notes,
    status: data.status,
  };

  console.log("📊 Sending submission to Google Sheets...");

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    console.log("✅ Successfully sent submission to Google Sheet");
  } catch (error) {
    console.error("❌ Error sending to Google Sheets:", error);
    // Log locally as fallback
    console.log("📊 Logging submission locally as fallback:");
    console.log("-------------------------------------------");
    console.log(`Timestamp: ${data.timestamp}`);
    console.log(`Submission ID: ${data.submissionId}`);
    console.log(`Day: ${data.dayNumber}`);
    console.log(`Username: ${data.username}`);
    console.log(`Email: ${data.email}`);
    console.log(`Reframes: ${reframesText}`);
    console.log(`Notes: ${data.notes}`);
    console.log("-------------------------------------------");
    // Don't throw - let the submission succeed even if sheets fails
  }
}
