import { atom } from "jotai";
import { loadable } from "jotai/utils";

import { fetchInterviews, fetchMessages } from "api";
import { InterviewStatus, InterviewType } from "types";

export const stateSeedAtom = atom(0);

export const interviewListAtom = loadable(
  atom(async (get) => {
    get(stateSeedAtom);
    const interviewList = await fetchInterviews();
    return interviewList
      .filter(
        (interview) =>
          interview.status !== InterviewStatus.ERROR &&
          interview.status !== InterviewStatus.IN_PROGRESS
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
    // get(stateSeedAtom);
    const selectedInterview = get(selectedInterviewAtom);
    if (!selectedInterview) {
      return [];
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
  return interviewList.state === "hasError" || messages.state === "hasError";
});
