import { NextRequest, NextResponse } from "next/server";
import { appendWorksheetSubmission } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

interface WorksheetRow {
  cantBecause: string;
  reframed: boolean;
  neverEasierBecause: string;
}

interface SubmissionBody {
  username: string;
  email: string;
  day: number;
  worksheetData: WorksheetRow[];
  notes?: string;
}

// Validation helpers
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{2,}$/;
  return usernameRegex.test(username);
}

export async function POST(request: NextRequest) {
  try {
    console.log("📝 POST /api/homework/submit - Processing submission...");

    const body: SubmissionBody = await request.json();
    const { username, email, day, worksheetData, notes } = body;

    // Validate required fields
    const errors: Record<string, string> = {};

    if (!username || !isValidUsername(username)) {
      errors.username = "Username must be at least 2 characters (letters, numbers, underscores only)";
    }

    if (!email || !isValidEmail(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!worksheetData || worksheetData.length === 0) {
      errors.worksheet = "Please complete at least one reframe";
    }

    if (notes && notes.length > 500) {
      errors.notes = "Notes must be 500 characters or less";
    }

    if (Object.keys(errors).length > 0) {
      console.log("❌ Validation errors:", errors);
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    // Generate a submission ID
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Append to Google Sheet
    await appendWorksheetSubmission({
      timestamp: new Date().toISOString(),
      submissionId,
      dayNumber: day || 1,
      username,
      email,
      worksheetData,
      notes: notes || "",
      status: "Pending Review",
    });

    console.log("✅ Homework submission successful for:", username);
    return NextResponse.json({
      success: true,
      message: "Homework submitted successfully!",
      submissionId,
    });
  } catch (error) {
    console.error("❌ Submission error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit homework. Please try again." },
      { status: 500 }
    );
  }
}
