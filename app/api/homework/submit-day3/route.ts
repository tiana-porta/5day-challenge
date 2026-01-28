import { NextRequest, NextResponse } from "next/server";
import { appendDay3Submission } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

interface Day3SubmissionBody {
  username: string;
  email: string;
  day: number;
  docLink: string;
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
    console.log("📝 POST /api/homework/submit-day3 - Processing submission...");

    const body: Day3SubmissionBody = await request.json();
    const { username, email, day, docLink, notes } = body;

    // Validate required fields
    const errors: Record<string, string> = {};

    if (!username || !isValidUsername(username)) {
      errors.username = "Username must be at least 2 characters (letters, numbers, underscores only)";
    }

    if (!email || !isValidEmail(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!docLink || docLink.length < 5) {
      errors.docLink = "Please paste your one-page doc link";
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
    await appendDay3Submission({
      timestamp: new Date().toISOString(),
      submissionId,
      dayNumber: day || 3,
      username,
      email,
      docLink,
      notes: notes || "",
      status: "Pending Review",
    });

    console.log("✅ Day 3 homework submission successful for:", username);
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
