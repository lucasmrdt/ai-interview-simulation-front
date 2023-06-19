import { atom } from "jotai";
import { loadable } from "jotai/utils";

import { fetchInterviews, fetchMessages } from "api";
import { InterviewStatus, InterviewType } from "types";

const NO_INTERVIEW_SELECTED_ERROR = new Error("No interview selected");

export const stateSeedAtom = atom(0);

export const hasOnboardedAtom = atom(false);

export const interviewListAtom = loadable(
  atom(async (get) => {
    get(stateSeedAtom);
    const interviewList = await fetchInterviews();
    return interviewList
      .filter(
        (interview) =>
          interview.status === InterviewStatus.ACCEPTED ||
          interview.status === InterviewStatus.REJECTED ||
          interview.status === InterviewStatus.RAN_BY_USER
      )
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
  })
);

export const interviewResultAtom = atom((get) => {
  const interviewList = get(interviewListAtom);
  if (interviewList.state !== "hasData") {
    return { state: interviewList.state };
  }
  const nbAccepted = interviewList.data.reduce(
    (acc, cur) => acc + +(cur.status === InterviewStatus.ACCEPTED),
    0
  );
  const nbTotal = interviewList.data.filter(
    ({ status }) =>
      status === InterviewStatus.ACCEPTED || status === InterviewStatus.REJECTED
  ).length;
  return {
    state: interviewList.state,
    data: {
      nbAccepted,
      nbTotal,
    },
  };
});

export const selectedInterviewAtom = atom<InterviewType | null>(null);

export const APIMessagesAtom = loadable(
  atom(async (get) => {
    const selectedInterview = get(selectedInterviewAtom);
    if (!selectedInterview) {
      throw NO_INTERVIEW_SELECTED_ERROR;
    }
    const messages = await fetchMessages(selectedInterview.id);
    return messages.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  })
);

export const hasErrorAtom = atom((get) => {
  const interviewList = get(interviewListAtom);
  const messages = get(APIMessagesAtom);
  return (
    interviewList.state === "hasError" ||
    (messages.state === "hasError" &&
      messages.error !== NO_INTERVIEW_SELECTED_ERROR)
  );
});
