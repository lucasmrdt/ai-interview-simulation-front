import React, { useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Menu, Error } from "components";
import { OnBoarding, Chat } from "screens";
import { useAtom } from "jotai";
import { hasErrorAtom, hasOnboardedAtom } from "store";
import { styled } from "styled-components";

const Wrapper = styled.div``;

function App() {
  const [hasError] = useAtom(hasErrorAtom);
  const [hasOnboarded] = useAtom(hasOnboardedAtom);

  const error = useMemo(
    () => (
      <Error error="Something went wrong with the server, I should probably paid instead of using a free one 😿" />
    ),
    []
  );

  if (hasError) {
    return error;
  }

  return (
    <ErrorBoundary fallback={error}>
      <Wrapper>
        <OnBoarding />
        <Menu />
        {hasOnboarded && <Chat />}
      </Wrapper>
    </ErrorBoundary>
  );
}

export default App;
