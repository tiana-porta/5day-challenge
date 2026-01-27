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
    type: "day1",
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

  console.log("📊 Sending Day 1 submission to Google Sheets...");

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
  }
}

// Day 2 submission interface
interface Day2Submission {
  timestamp: string;
  submissionId: string;
  dayNumber: number;
  username: string;
  email: string;
  market: string;
  whyProfitable: string;
  problem: string;
  desiredOutcome: string;
  researchLink: string;
  notes: string;
  status: string;
}

export async function appendDay2Submission(data: Day2Submission): Promise<void> {
  const payload = {
    type: "day2",
    timestamp: data.timestamp,
    submissionId: data.submissionId,
    dayNumber: data.dayNumber,
    username: data.username,
    email: data.email,
    market: data.market,
    whyProfitable: data.whyProfitable,
    problem: data.problem,
    desiredOutcome: data.desiredOutcome,
    researchLink: data.researchLink,
    notes: data.notes,
    status: data.status,
  };

  console.log("📊 Sending Day 2 submission to Google Sheets...");

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

    console.log("✅ Successfully sent Day 2 submission to Google Sheet");
  } catch (error) {
    console.error("❌ Error sending to Google Sheets:", error);
    console.log("📊 Logging Day 2 submission locally as fallback:");
    console.log("-------------------------------------------");
    console.log(`Timestamp: ${data.timestamp}`);
    console.log(`Submission ID: ${data.submissionId}`);
    console.log(`Day: ${data.dayNumber}`);
    console.log(`Username: ${data.username}`);
    console.log(`Email: ${data.email}`);
    console.log(`Market: ${data.market}`);
    console.log(`Why Profitable: ${data.whyProfitable}`);
    console.log(`Problem: ${data.problem}`);
    console.log(`Desired Outcome: ${data.desiredOutcome}`);
    console.log(`Research Link: ${data.researchLink}`);
    console.log(`Notes: ${data.notes}`);
    console.log("-------------------------------------------");
  }
}
