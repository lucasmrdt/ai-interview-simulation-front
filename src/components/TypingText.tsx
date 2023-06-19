import { useState } from "react";
import Typed from "react-typed";
import { styled } from "styled-components";

import { DARK_WHITE } from "colors";

const Text = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${DARK_WHITE};
  max-width: 350px;
  width: 90%;
`;

export const TypingText = ({
  children,
  keepCursorOnComplete = false,
  onComplete,
  className,
}: {
  children: string;
  keepCursorOnComplete?: boolean;
  onComplete?: () => void;
  className?: string;
}) => {
  const [hasCompleted, setHasCompleted] = useState(false);

  return (
    <Text className={className}>
      {hasCompleted && !keepCursorOnComplete ? (
        children
      ) : (
        <Typed
          strings={[children]}
          typeSpeed={20}
          onComplete={() => {
            setHasCompleted(true);
            onComplete && onComplete();
          }}
        />
      )}
    </Text>
  );
};
