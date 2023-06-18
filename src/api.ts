import { InterviewType, MessageType, Role } from "types";
import socketio, { Socket } from "socket.io-client";

// const API_URL = "https://interview-simulation-iopr.onrender.com";
const API_URL = "http://127.0.0.1:8000";

let sio: Socket;

const parseResponse = async (response: Response) => {
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw new Error(data.error);
  }
};

export const fetchInterviews = async (): Promise<InterviewType[]> => {
  const response = await fetch(`${API_URL}/interviews`);
  const json = await parseResponse(response);
  return json.interviews;
};

export const fetchMessages = async (
  interviewId: number
): Promise<MessageType[]> => {
  const response = await fetch(`${API_URL}/interviews/${interviewId}/messages`);
  const json = await parseResponse(response);
  return json.messages;
};

export const createInterview = async (): Promise<InterviewType> => {
  const response = await fetch(`${API_URL}/interviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await parseResponse(response);
  return json.interview;
};

export const connectSocketIfNeeded = () =>
  new Promise<void>((resolve, reject) => {
    if (sio && sio.connected) {
      resolve();
    }
    sio = socketio(API_URL);
    sio.on("connect", () => {
      resolve();
    });
    sio.on("error", (error) => {
      reject(error);
    });
  });

export const closeSocket = () => {
  console.log("Closing socket");
  if (sio) {
    sio.close();
  }
};

export const startInterviewIfPossible = async (
  interviewId: number,
  simulate: boolean
) =>
  new Promise<boolean>(async (resolve, reject) => {
    await connectSocketIfNeeded();
    sio.emit(
      "start_interview",
      { interview_id: interviewId, simulate },
      ({ done }: any) => {
        resolve(done);
      }
    );
  });

export const subscribeToInterview = async (
  interviewId: number,
  cb: (data: { role: Role; chunk: string; accepted?: boolean }) => any
) => {
  closeSocket();
  await connectSocketIfNeeded();
  sio.on(`interview_chunk_${interviewId}`, cb);
};

export const sendMessage = async (
  interviewId: number,
  message: string
): Promise<void> => {
  await connectSocketIfNeeded();
  sio.emit("message", {
    interview_id: interviewId,
    msg: message,
  });
};
