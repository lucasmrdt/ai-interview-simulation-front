import { styled } from "styled-components";
import * as icons from "react-icons/fa";
import { BeatLoader } from "react-spinners";

import { colors, DARK_BLUE } from "colors";

const Center = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const Wrapper = styled.button<{
  $color: keyof typeof colors;
  $outline: boolean;
}>`
  cursor: pointer;
  display: flex;
  padding: 12px 20px;
  justify-content: center;
  align-items: center;
  background: ${(props) =>
    props.$outline ? "transparent" : colors[props.$color]};
  border-radius: 10px;
  border: ${(props) =>
    props.$outline ? `2px solid ${colors[props.$color]}` : "none"};
`;

const Children = styled.span<{
  $color: keyof typeof colors;
  $outline: boolean;
}>`
  display: flex;
  color: ${(props) => (props.$outline ? colors[props.$color] : DARK_BLUE)};
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 21px;
`;

const IconWrapper = styled.span`
  display: flex;
  margin-left: 10px;
`;

interface Props {
  children: React.ReactNode;
  color?: keyof typeof colors;
  icon?: keyof typeof icons;
  isLoading?: boolean;
  outline?: boolean;
  onClick?: () => void;
}

export const Button = ({
  children,
  onClick,
  icon,
  isLoading,
  color = "green",
  outline = false,
}: Props) => {
  const Icon = icon ? icons[icon] : null;

  return (
    <Center>
      <Wrapper
        $color={color}
        $outline={outline}
        onClick={onClick}
        disabled={isLoading}
        style={{ cursor: !isLoading ? "pointer" : "wait" }}
      >
        <Children $color={color} $outline={outline}>
          {children}
        </Children>
        {(Icon || isLoading) && (
          <IconWrapper>
            {!isLoading ? (
              Icon && <Icon fontSize={13} color={outline ? color : DARK_BLUE} />
            ) : (
              <BeatLoader
                size={5}
                color={outline ? colors[color] : DARK_BLUE}
              />
            )}
          </IconWrapper>
        )}
      </Wrapper>
    </Center>
  );
};
