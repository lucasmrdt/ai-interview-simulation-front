import { useCallback, useState } from "react";
import { styled } from "styled-components";
import { useAtom, useSetAtom } from "jotai";
import { FaBars, FaCheck, FaLaugh, FaTimes } from "react-icons/fa";
import { RemoveScroll } from "react-remove-scroll";

import { DARK_WHITE, GREEN, LIGHT_BLUE, LIGHT_WHITE, RED } from "colors";
import { InterviewType, InterviewStatus } from "types";
import {
  interviewListAtom,
  interviewResultAtom,
  selectedInterviewAtom,
} from "store";

const HEADER_HEIGHT = 70;

const Wrapper = styled(RemoveScroll)<{ $open: boolean }>`
  z-index: 1;
  display: flex;
  flex-direction: column;
  position: fixed;
  justify-content: flex-start;
  top: 0;
  left: 0;
  right: 0;
  background: ${LIGHT_BLUE};
  height: ${(props) => (props.$open ? "100vh" : HEADER_HEIGHT + "px")};
  transition: height 0.3s ease-in-out;
`;

const FakeSpace = styled.div`
  height: ${HEADER_HEIGHT}px;
`;

const Header = styled.header`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  min-height: ${HEADER_HEIGHT}px;
  max-height: ${HEADER_HEIGHT}px;
  padding: 0 20px;
`;

const MenuButton = styled.button`
  cursor: pointer;
  display: flex;
  border: none;
  background: transparent;
`;

const MenuList = styled.ul`
  display: flex;
  flex-direction: column;
  overflow: scroll;
`;

const InterviewButton = styled.button<{ $isAccepted: boolean }>`
  display: flex;
  cursor: pointer;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 34px;
  border: none;
  border-bottom: 1px solid ${DARK_WHITE};
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;
  color: ${DARK_WHITE};
  background: transparent;

  & span {
    display: flex;
  }
`;

const Score = styled.div`
  display: flex;
  align-items: center;
  color: ${LIGHT_WHITE};
  font-weight: 700;
  line-height: 32px;
  font-size: 24px;

  :nth-child(1) {
    margin-right: 10px;
  }
`;

export const Menu = () => {
  const [interviewList] = useAtom(interviewListAtom);
  const [interviewResult] = useAtom(interviewResultAtom);
  const setSelectedInterview = useSetAtom(selectedInterviewAtom);

  const [isOpened, setIsOpened] = useState(false);

  const toggleMenu = useCallback(() => setIsOpened((prev) => !prev), []);

  return (
    <>
      <FakeSpace />
      <Wrapper $open={isOpened} enabled={isOpened}>
        <Header>
          <MenuButton onClick={toggleMenu}>
            {isOpened ? (
              <FaTimes fontSize={24} color={LIGHT_WHITE} />
            ) : (
              <FaBars fontSize={24} color={LIGHT_WHITE} />
            )}
          </MenuButton>
          {interviewResult.state === "hasData" && (
            <Score>
              <span>
                {interviewResult.data.nbAccepted}/{interviewResult.data.nbTotal}
              </span>
              <FaCheck />
            </Score>
          )}
        </Header>
        <MenuList>
          {interviewList.state === "hasData" &&
            interviewList.data.map((interview: InterviewType) => (
              <InterviewButton
                key={interview.id}
                $isAccepted={interview.status === InterviewStatus.ACCEPTED}
                onClick={() => {
                  setSelectedInterview(interview);
                  setIsOpened(false);
                  console.log(interview);
                }}
              >
                <span>InterviewType {interview.name}</span>
                <span>
                  {interview.status === InterviewStatus.ACCEPTED && (
                    <FaCheck color={GREEN} />
                  )}
                  {interview.status === InterviewStatus.REJECTED && (
                    <FaTimes color={RED} />
                  )}
                  {interview.status === InterviewStatus.RAN_BY_USER && (
                    <FaLaugh color={LIGHT_WHITE} />
                  )}
                </span>
              </InterviewButton>
            ))}
        </MenuList>
      </Wrapper>
    </>
  );
};
