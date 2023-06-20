import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCheck, FaExclamation, FaLaugh, FaTimes } from "react-icons/fa";
import { styled } from "styled-components";
import { useErrorBoundary } from "react-error-boundary";

import { InterviewStatus, InterviewType, MessageType, Role } from "types";
import { APIMessagesAtom, selectedInterviewAtom, stateSeedAtom } from "store";
import { DARK_WHITE, GREEN, LIGHT_WHITE, ORANGE, RED } from "colors";
import { Message, Input, Button, TypingText, Loader } from "components";
import {
  subscribeToInterview,
  sendMessage,
  createInterview,
  startInterviewIfPossible,
  unsubscribeToInterview,
} from "api";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  padding-bottom: 130px;
`;

const FullPage = styled(Wrapper)`
  height: 100%;
  justify-content: center;
  align-items: center;
  color: ${DARK_WHITE};
  position: absolute;
  top: 0;
  padding-top: 70px;
`;

const Title = styled.h1`
  font-size: 30px;
  font-weight: 800;
  margin-bottom: 50px;
  color: ${DARK_WHITE};
  width: 100%;
  text-align: center;
  text-decoration: underline;
  padding-top: 20px;

  & > svg {
    margin-left: 10px;
    transform: translateY(5px);
  }
`;

const StatusWrapper = styled.p`
  font-size: 20px;
  font-weight: 700;
  margin-top: 30px;
  color: ${DARK_WHITE};
  width: 100%;
  text-align: center;
  padding: 0 20px;
  padding-bottom: 30px;

  & > svg {
    margin-left: 10px;
    transform: translateY(3px);
  }
`;

const FixedWrapper = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ButtonWrapper = styled.div`
  margin-bottom: 15px;
`;

const mergeNewChunkWithMessages = (
  { chunk, role }: { chunk: string; role: Role },
  prev: MessageType[]
) => {
  const prevWithoutLast = prev.slice(0, prev.length - 1);
  const last = prev[prev.length - 1];
  if (!last) {
    return [
      {
        id: 0,
        role,
        message: chunk,
        created_at: new Date().toISOString(),
      },
    ];
  } else if (last.role === role) {
    return [...prevWithoutLast, { ...last, message: last.message + chunk }];
  } else {
    return [
      ...prev,
      {
        id: last.id + 1,
        role,
        message: chunk,
        created_at: new Date().toISOString(),
      },
    ];
  }
};

export const Chat = () => {
  const { showBoundary } = useErrorBoundary();

  const setStateSeed = useSetAtom(stateSeedAtom);
  const [selectedInterview] = useAtom(selectedInterviewAtom);
  const [APIMessages] = useAtom(APIMessagesAtom);

  const [localMessages, setLocalMessages] = useState([] as MessageType[]);
  const [localInterview, setLocalInterview] = useState<InterviewType>();

  const [subscribed, setSubscribed] = useState(false);
  const [submittedValue, setSubmittedValue] = useState("");

  const [isLoadingInput, setIsLoadingInput] = useState(false);
  const [isLoadingNewSimulation, setIsLoadingNewSimulation] = useState(false);

  const hasData = localInterview || APIMessages.state === "hasData";
  const showInstructions =
    !hasData &&
    !isLoadingInput &&
    !isLoadingNewSimulation &&
    !selectedInterview &&
    !localInterview;
  const showCreateButton =
    (showInstructions ||
      isLoadingNewSimulation ||
      localInterview?.status === InterviewStatus.ACCEPTED ||
      localInterview?.status === InterviewStatus.REJECTED ||
      localInterview?.status === InterviewStatus.ERROR ||
      localInterview?.status === InterviewStatus.RAN_BY_USER ||
      localInterview?.status === InterviewStatus.IN_PROGRESS) &&
    !isLoadingInput;
  const showInput =
    (showInstructions ||
      isLoadingInput ||
      localInterview?.status === InterviewStatus.ACCEPTED ||
      localInterview?.status === InterviewStatus.REJECTED ||
      localInterview?.status === InterviewStatus.ERROR ||
      localInterview?.status === InterviewStatus.RAN_BY_USER ||
      (localInterview?.status === InterviewStatus.IN_PROGRESS &&
        isLoadingInput)) &&
    !isLoadingNewSimulation;
  const isWaitingForInterview =
    localInterview?.status === InterviewStatus.IN_PROGRESS;
  const isLoadingInterviewMessages = APIMessages.state === "loading";
  const isButtonLoading = isWaitingForInterview || isLoadingNewSimulation;

  const onChunk = useCallback(
    ({
      chunk,
      role,
      status,
    }: {
      chunk: string;
      role: Role;
      status?: InterviewStatus;
    }) => {
      setLocalMessages((prev: MessageType[]) =>
        mergeNewChunkWithMessages({ chunk, role }, prev)
      );
      if (typeof status === "string") {
        setLocalInterview((prev) => ({
          ...(prev as InterviewType),
          status,
        }));
        setStateSeed((prev) => prev + 1);
      }
    },
    [setStateSeed]
  );

  const createNewInterview = useCallback(
    async (simulate: boolean) => {
      try {
        setLocalInterview(undefined);
        setLocalMessages([]);
        if (simulate) {
          setIsLoadingNewSimulation(true);
        }
        const newInterview = await createInterview();
        await subscribeToInterview(newInterview.id, onChunk);
        setSubscribed(true);
        setLocalInterview({
          ...newInterview,
          status: simulate
            ? InterviewStatus.IN_PROGRESS
            : InterviewStatus.RAN_BY_USER,
        });
        await startInterviewIfPossible(newInterview.id, simulate);
        if (simulate) {
          setIsLoadingNewSimulation(false);
        }
        return newInterview;
      } catch (e) {
        showBoundary(e);
      }
    },
    [onChunk, showBoundary]
  );

  const onSubmit = useCallback(
    async (value: string) => {
      try {
        setIsLoadingInput(true);
        setSubmittedValue(value);
        if (localInterview?.status !== InterviewStatus.RAN_BY_USER) {
          const newInterview = await createNewInterview(false);
          if (newInterview) {
            sendMessage(newInterview.id, value);
          }
        } else if (localInterview?.status === InterviewStatus.RAN_BY_USER) {
          sendMessage(localInterview.id, value);
        }
      } catch (e) {
        showBoundary(e);
      }
    },
    [createNewInterview, localInterview, showBoundary]
  );

  // Update local messages based on API messages
  useEffect(() => {
    if (APIMessages && APIMessages.state === "hasData") {
      setLocalMessages(APIMessages.data);
    }
  }, [APIMessages]);

  // Update local interview status based on API interview status
  useEffect(() => {
    if (selectedInterview) {
      setLocalInterview(selectedInterview);
      setSubscribed(false);
    }
  }, [selectedInterview]);

  // Reset text input when sent message is displayed
  useEffect(() => {
    const lastMessage = localMessages[localMessages.length - 1];
    if (
      lastMessage &&
      lastMessage.role === Role.INTERVIEWER &&
      lastMessage.message === submittedValue
    ) {
      setSubmittedValue("");
      setIsLoadingInput(false);
    }
  }, [localMessages, submittedValue]);

  // Subscribe to interview
  useEffect(() => {
    if (localInterview && !subscribed) {
      subscribeToInterview(localInterview.id, onChunk);
      setSubscribed(true);
    }
  }, [subscribed, localInterview, onChunk]);

  // Close socket when unmounting
  useEffect(
    () => () => {
      if (localInterview) {
        unsubscribeToInterview(localInterview.id);
      }
    },
    [localInterview]
  );

  // Scroll to bottom at every render
  useEffect(() => {
    window.scrollTo({
      top: window.document.body.scrollHeight,
      behavior: "smooth",
    });
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const button = useMemo(
    () => (
      <ButtonWrapper>
        <Button
          onClick={() => createNewInterview(true)}
          isLoading={isButtonLoading}
          // outline={isButtonLoading}
          color={isButtonLoading ? "dark-white" : "gradient"}
          icon="FaPlay"
        >
          {!isWaitingForInterview
            ? "Run a new interview simulation"
            : "running simulation"}
        </Button>
      </ButtonWrapper>
    ),
    [isButtonLoading, isWaitingForInterview, createNewInterview]
  );
  const input = useMemo(
    () => (
      <Input
        onSubmit={onSubmit}
        isLoading={isLoadingInput}
        placeholder={"or engage with Lucas Marandat (AI)..."}
      />
    ),
    [isLoadingInput, onSubmit]
  );
  const instructions = useMemo(
    () => (
      <TypingText>
        Run a new interview simulation or engage directly with Lucas Marandat
        (AI) by asking questions. Explore previous simulated interviews in the
        menu. The choice is yours!
      </TypingText>
    ),
    []
  );

  const conversation = useMemo(
    () =>
      localInterview && (
        <Wrapper>
          <Title>
            Interview {localInterview.name}
            {localInterview.status === InterviewStatus.ACCEPTED && (
              <FaCheck color={GREEN} />
            )}
            {localInterview.status === InterviewStatus.REJECTED && (
              <FaTimes color={RED} />
            )}
            {localInterview.status === InterviewStatus.RAN_BY_USER && (
              <FaLaugh color={LIGHT_WHITE} />
            )}
            {localInterview.status === InterviewStatus.ERROR && (
              <FaExclamation color={ORANGE} />
            )}
          </Title>
          {localMessages.length > 0 && !isLoadingInterviewMessages ? (
            <>
              {localMessages.map(({ message, role, id }, i) => (
                <Message
                  content={message}
                  username={
                    role === Role.APPLICANT
                      ? "Lucas Marandat (AI)"
                      : "Mistral AI (AI)"
                  }
                  right={role === Role.APPLICANT}
                  light={role === Role.APPLICANT}
                  key={id}
                />
              ))}
              {localInterview.status === InterviewStatus.ACCEPTED && (
                <StatusWrapper>
                  Lucas Marandat (AI) has been accepted by Mistral AI (AI)
                  <FaCheck color={GREEN} />
                </StatusWrapper>
              )}
              {localInterview.status === InterviewStatus.REJECTED && (
                <StatusWrapper>
                  Lucas Marandat (AI) has been rejected by Mistral AI (AI)
                  <FaTimes color={RED} />
                </StatusWrapper>
              )}
              {localInterview.status === InterviewStatus.ERROR && (
                <StatusWrapper>
                  Mistral AI (AI) has not given a decision
                  <FaExclamation color={ORANGE} />
                </StatusWrapper>
              )}
            </>
          ) : (
            <FullPage>
              <Loader>
                {isLoadingInterviewMessages
                  ? "loading interview messages"
                  : "waiting for interview to start"}
              </Loader>
            </FullPage>
          )}
        </Wrapper>
      ),
    [isLoadingInterviewMessages, localInterview, localMessages]
  );

  return (
    <>
      {hasData ? (
        conversation
      ) : (
        <FullPage>
          {showInstructions ? instructions : <Loader>loading interview</Loader>}
        </FullPage>
      )}
      <FixedWrapper>
        {showCreateButton && button}
        {showInput && input}
      </FixedWrapper>
    </>
  );
};
