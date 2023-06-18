import { styled } from "styled-components";

import { DARK_BLUE, DARK_WHITE } from "colors";

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: ${DARK_BLUE};
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @keyframes appear {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  animation: appear 0.5s ease-in-out;
`;

const Text = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${DARK_WHITE};
  max-width: 350px;
  width: 90%;
`;

const Title = styled(Text)`
  font-style: normal;
  font-weight: 800;
  font-size: 20px;
  line-height: 26px;
  margin-bottom: 20px;
`;

const Subtitle = styled(Text)`
  margin-top: 30px;
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
`;

interface Props {
  error: string;
}

export const Error = ({ error }: Props) => (
  <Wrapper>
    <Title>Oops!</Title>
    <Subtitle>{error}</Subtitle>
  </Wrapper>
);
