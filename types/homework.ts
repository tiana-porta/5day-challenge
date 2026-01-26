export interface HomeworkSubmission {
  timestamp: string;
  dayNumber: number;
  whopUserId: string;
  username: string;
  email: string;
  worksheetLink: string;
  notes?: string;
  status: "Pending Review" | "Reviewed" | "Needs Revision";
}

export interface Day1FormData {
  username: string;
  email: string;
  worksheetLink: string;
  notes?: string;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  submissionId?: string;
}

export interface FormErrors {
  username?: string;
  email?: string;
  worksheetLink?: string;
  notes?: string;
}
