import { styled } from "styled-components";

import { DARK_WHITE, LIGHT_BLUE } from "colors";
import { forwardRef } from "react";

const Username = styled.h3`
  display: flex;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 22px;
  color: ${DARK_WHITE};
`;

const Content = styled.p<{ $light: boolean }>`
  display: flex;
  padding: 10px;
  background: ${(props) => (props.$light ? DARK_WHITE : LIGHT_BLUE)};
  border-radius: 2px;
  color: ${(props) => (props.$light ? LIGHT_BLUE : DARK_WHITE)};
  font-size: 12;
  line-height: 16px;
  font-style: normal;
  font-weight: 100;
  max-width: 400px;
  white-space: pre-wrap;
`;

const Wrapper = styled.section<{ $right: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$right ? "flex-end" : "flex-start")};
  gap: 2px;
  margin: 0 10px;
  margin-bottom: 20px;
`;

interface Props {
  username: string;
  content: string;
  right?: boolean;
  light?: boolean;
}

export const Message = forwardRef(
  (
    { username, content, right = false, light = false }: Props,
    ref: React.Ref<HTMLDivElement>
  ) => (
    <Wrapper $right={right} ref={ref}>
      <Username>{username}</Username>
      <Content $light={light}>{content}</Content>
    </Wrapper>
  )
);
