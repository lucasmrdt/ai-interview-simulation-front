import { BeatLoader } from "react-spinners";
import { styled } from "styled-components";

import { DARK_WHITE } from "colors";

const Wrapper = styled.div`
  display: flex;
  position: absolute;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  color: ${DARK_WHITE};

  :last-child {
    margin-left: 10px;
  }
`;

interface Props {
  children: React.ReactNode;
}

export const Loader = ({ children }: Props) => (
  <Wrapper>
    {children}
    <BeatLoader size={7} color={DARK_WHITE} />
  </Wrapper>
);
