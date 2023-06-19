import { FaPaperPlane } from "react-icons/fa";
import { styled } from "styled-components";
import { BeatLoader } from "react-spinners";

import { DARK_WHITE, LIGHT_BLUE, LIGHT_WHITE } from "colors";
import { useEffect, useRef, useState } from "react";

const Wrapper = styled.form`
  display: flex;
  align-items: center;
  width: 100%;
  background: ${LIGHT_BLUE};
  height: 67px;
`;

const TextInput = styled.input`
  display: flex;
  flex: 1;
  padding: 14px;
  padding-right: ${28 + 25}px;
  color: ${LIGHT_WHITE};
  font-weight: 400;
  font-size: 16px;
  line-height: 21px;
  background: ${LIGHT_BLUE};
  border: none;

  &:focus {
    border: none;
    outline: none;
  }

  &::placeholder {
    font-style: italic;
    color: ${DARK_WHITE};
    opacity: 75%;
    font-size: 14px;
  }

  &:disabled {
    opacity: 50%;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  right: 15px;
  width: 25px;
`;

interface Props {
  isLoading?: boolean;
  onSubmit?: (value: string) => void;
  placeholder?: string;
}

export const Input = ({
  isLoading,
  onSubmit,
  placeholder = "Send a message as Mistral AI...",
}: Props) => {
  const [value, setValue] = useState("");
  const prevIsLoading = useRef(isLoading);

  useEffect(() => {
    if (prevIsLoading.current && !isLoading) {
      setValue("");
    }
    prevIsLoading.current = isLoading;
  }, [isLoading]);

  return (
    <Wrapper
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit && onSubmit(value);
      }}
    >
      <TextInput
        placeholder={placeholder}
        type="text"
        disabled={isLoading}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ cursor: isLoading ? "wait" : "text" }}
      />
      <IconWrapper>
        {isLoading ? (
          <BeatLoader size={6} color={LIGHT_WHITE} />
        ) : (
          <FaPaperPlane
            size={16}
            color={LIGHT_WHITE}
            onClick={() => onSubmit && onSubmit(value)}
            style={{ cursor: "pointer" }}
          />
        )}
      </IconWrapper>
    </Wrapper>
  );
};
