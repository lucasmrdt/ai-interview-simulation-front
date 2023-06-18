export enum InterviewStatus {
  DEFAULT = "default",
  RAN_BY_USER = "ran_by_user",
  IN_PROGRESS = "in_progress",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  ERROR = "error",
}

export enum Role {
  INTERVIEWER = "interviewer",
  APPLICANT = "applicant",
}

export interface InterviewType {
  id: number;
  name: string;
  status: InterviewStatus;
  created_at: string;
  updated_at: string;
}

export interface MessageType {
  id: number;
  role: Role;
  message: string;
  created_at: string;
}
