import { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import { RemoveScroll } from "react-remove-scroll";
import { useAtom } from "jotai";
import { FaCheck } from "react-icons/fa";

import { DARK_BLUE, DARK_WHITE, GREEN, LIGHT_WHITE } from "colors";
import { interviewResultAtom } from "store";
import { Button, TypingText } from "components";
import { BeatLoader } from "react-spinners";

const Wrapper = styled(RemoveScroll)<{ $hasOnBoarded: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: ${DARK_BLUE};

  @keyframes disappear {
    0% {
      opacity: 1;
      top: 0;
    }
    99.999% {
      opacity: 0;
      top: 0;
    }
    100% {
      opacity: 0;
      top: -100vh;
    }
  }
  ${(props) =>
    props.$hasOnBoarded &&
    `
    animation: disappear 0.5s ease-in-out;
    opacity: 0;
    top: -100vh;
  `}
`;

const Text = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${DARK_WHITE};
  max-width: 350px;
  width: 90%;
`;

const AnimatedNumber = ({
  target,
  className,
  onComplete,
  duration = 2000,
}: {
  target: number;
  className?: string;
  onComplete?: () => void;
  duration?: number;
}) => {
  const [value, setValue] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (value >= target && intervalRef.current) {
      onComplete && onComplete();
      clearInterval(intervalRef.current!);
      intervalRef.current = undefined;
    }
  }, [value, target, onComplete]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setValue((prev) => prev + 1);
    }, Math.round(duration / target));
    return () => {
      clearInterval(intervalRef.current!);
    };
  }, [duration, target]);

  return <span className={className}>{value}</span>;
};

const FirstSection = styled(TypingText)`
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 26px;
`;

const SecondSection = styled(TypingText)`
  margin-top: 30px;
  font-style: italic;
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
`;

const ThirdAndForthSection = styled(Text)`
  margin-top: 20px;
  font-style: normal;
  font-weight: 700;
  font-size: 40px;
  line-height: 53px;

  :last-child {
    margin-left: 15px;
  }
`;

const FifthSection = styled(SecondSection)`
  margin-top: 60px;
`;

const SixthSection = styled.div`
  position: absolute;
  bottom: 120px;
`;

export const OnBoarding = () => {
  const [hasOnBoarded, setHasOnBoarded] = useState(false);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [interviewResult] = useAtom(interviewResultAtom);

  return (
    <Wrapper $hasOnBoarded={hasOnBoarded} enabled={!hasOnBoarded}>
      <FirstSection onComplete={() => setSectionIdx(1)}>
        Welcome to the interview simulation between Mistral AI and Lucas
        Marandat.
      </FirstSection>
      {sectionIdx >= 1 && (
        <SecondSection
          onComplete={() => setSectionIdx(2)}
          keepCursorOnComplete={sectionIdx <= 3}
        >
          getting simulation results
        </SecondSection>
      )}
      {sectionIdx === 2 && interviewResult.state === "loading" && (
        <ThirdAndForthSection>
          <BeatLoader size={6} color={LIGHT_WHITE} />
        </ThirdAndForthSection>
      )}
      {sectionIdx >= 2 && interviewResult.state === "hasData" && (
        <ThirdAndForthSection>
          {sectionIdx === 2 ? (
            <TypingText
              onComplete={() => setSectionIdx(3)}
            >{`0/${interviewResult.data.nbTotal}`}</TypingText>
          ) : (
            <>
              <AnimatedNumber
                target={interviewResult.data.nbAccepted}
                onComplete={() => setSectionIdx(4)}
              />
              <span>/{interviewResult.data.nbTotal}</span>
              <FaCheck color={GREEN} fontSize={40} />
            </>
          )}
        </ThirdAndForthSection>
      )}
      {sectionIdx >= 4 && (
        <FifthSection onComplete={() => setSectionIdx(5)} keepCursorOnComplete>
          All done! You can now either view the interview results or start a new
          simulation.
        </FifthSection>
      )}
      {sectionIdx >= 5 && (
        <SixthSection>
          <Button onClick={() => setHasOnBoarded(true)}>Okay!</Button>
        </SixthSection>
      )}
    </Wrapper>
  );
};
