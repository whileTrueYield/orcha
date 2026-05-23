import React, { useEffect } from "react";
import cn from "classnames";
import { useState } from "react";
import { AvatarThemeColor, getAvatarTheme } from "./svg/avatarTheme";
import { BlueAvatar } from "./svg/Blue";
import { CherryAvatar } from "./svg/Cherry";
import { GreenAvatar } from "./svg/Green";
import { OrangeAvatar } from "./svg/Orange";
import { PinkAvatar } from "./svg/Pink";
import { PurpleAvatar } from "./svg/Purple";
import { RedAvatar } from "./svg/Red";
import { SkyAvatar } from "./svg/Sky";
import { YellowAvatar } from "./svg/Yellow";

interface Props {
  name?: string;
  src?: string | null;
  alt?: string;
  className: string;
}

const Avatars = [
  BlueAvatar,
  CherryAvatar,
  GreenAvatar,
  OrangeAvatar,
  PinkAvatar,
  PurpleAvatar,
  RedAvatar,
  SkyAvatar,
  YellowAvatar,
];

const avatarThemeColors: AvatarThemeColor[] = [
  "blue",
  "pink",
  "orange",
  "red",
  "purple",
  "green",
  "yellow",
  "cherry",
  "sky",
  "lime",
  "gray",
  "indigo",
];

export const Avatar: React.FC<Props> = (props) => {
  const { className, name, alt, ...otherProps } = props;
  const [src, setSrc] = useState(props.src);

  useEffect(() => setSrc(props.src), [props.src, setSrc]);

  const imgClassName = cn("object-cover ", className);

  if (!src) {
    let pos = 0;

    if (name) {
      for (let cursor = 0; cursor < name.length; cursor++) {
        pos += name.charCodeAt(cursor);
      }
    }

    const avatarThemeColor = avatarThemeColors[pos % avatarThemeColors.length];
    const Avatar = Avatars[pos % Avatars.length];

    return (
      <Avatar
        name={name}
        theme={getAvatarTheme(avatarThemeColor)}
        className={imgClassName}
      />
    );
  }

  return (
    <img
      {...otherProps}
      className={`${imgClassName}`}
      src={src}
      alt={alt || name || ""}
      title={name}
      onError={() => setSrc("")}
    />
  );
};
