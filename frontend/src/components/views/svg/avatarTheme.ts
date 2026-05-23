export type AvatarThemeColor =
  | "blue"
  | "cherry"
  | "green"
  | "orange"
  | "pink"
  | "purple"
  | "red"
  | "sky"
  | "yellow"
  | "lime"
  | "indigo"
  | "gray";

export interface AvatarTheme {
  bgOuterGradient: string;
  bgInnerGradient: string;
  lightAccent: string;
  darkAccent: string;
}

export const getAvatarTheme = (color: string): AvatarTheme => {
  switch (color as AvatarThemeColor) {
    case "blue":
      return {
        bgOuterGradient: "#1fb4d6",
        bgInnerGradient: "#22cfe8",
        darkAccent: "#05758e",
        lightAccent: "#4ef7fa",
      };
    case "cherry":
      return {
        bgOuterGradient: "#c047e6",
        bgInnerGradient: "#fe4fac",
        darkAccent: "#9035ad",
        lightAccent: "#fe98ce",
      };
    case "indigo":
      return {
        bgOuterGradient: "#6366f1",
        bgInnerGradient: "#818cf8",
        darkAccent: "#4f46e5",
        lightAccent: "#a5b4fc",
      };
    case "green":
      return {
        bgOuterGradient: "#72b031",
        bgInnerGradient: "#a2e35f",
        darkAccent: "#4f7626",
        lightAccent: "#baff73",
      };
    case "orange":
      return {
        bgOuterGradient: "#f03d3c",
        bgInnerGradient: "#f7693e",
        darkAccent: "#842221",
        lightAccent: "#f7994e",
      };

    case "pink":
      return {
        bgOuterGradient: "#eb7891",
        bgInnerGradient: "#fbaebf",
        darkAccent: "#730029",
        lightAccent: "#ffc4c4",
      };

    case "purple":
      return {
        bgOuterGradient: "#b34ccf",
        bgInnerGradient: "#da5dfb",
        darkAccent: "#6d2f7e",
        lightAccent: "#c453e2",
      };

    case "red":
      return {
        bgOuterGradient: "#c93e7f",
        bgInnerGradient: "#f6618c",
        darkAccent: "#ab2249",
        lightAccent: "#fda4af",
      };

    case "sky":
      return {
        bgOuterGradient: "#0d8d9b",
        bgInnerGradient: "#1bcde0",
        darkAccent: "#0b5c64",
        lightAccent: "#36e0f2",
      };

    case "yellow":
      return {
        bgOuterGradient: "#f59439",
        bgInnerGradient: "#fcff4a",
        darkAccent: "#9e3737",
        lightAccent: "#ffee99",
      };

    case "gray":
      return {
        bgOuterGradient: "#64748b",
        bgInnerGradient: "#94a3b8",
        darkAccent: "#475569",
        lightAccent: "#cbd5e1",
      };

    case "lime":
      return {
        bgOuterGradient: "#65a30d",
        bgInnerGradient: "#a3e635",
        darkAccent: "#4d7c0f",
        lightAccent: "#bef264",
      };

    default:
      return {
        bgOuterGradient: "#64748b",
        bgInnerGradient: "#94a3b8",
        darkAccent: "#475569",
        lightAccent: "#cbd5e1",
      };
  }
};
