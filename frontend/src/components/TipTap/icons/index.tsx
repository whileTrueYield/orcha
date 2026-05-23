import { IconTemplate } from "./Template";

// icons from https://tabler-icons.io/

interface Props {
  className: string;
}

export const LinkIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M9 15l6 -6"></path>
    <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464"></path>
    <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"></path>
  </IconTemplate>
);

export const UnlinkIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M9 15l3 -3m2 -2l1 -1"></path>
    <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464"></path>
    <path d="M3 3l18 18"></path>
    <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"></path>
  </IconTemplate>
);

export const BoldIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z"></path>
    <path d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7"></path>
  </IconTemplate>
);

export const ItalicIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M11 5l6 0"></path>
    <path d="M7 19l6 0"></path>
    <path d="M14 5l-4 14"></path>
  </IconTemplate>
);

export const UnderlineIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M7 5v5a5 5 0 0 0 10 0v-5"></path>
    <path d="M5 19h14"></path>
  </IconTemplate>
);

export const CodeIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M7 8l-4 4l4 4"></path>
    <path d="M17 8l4 4l-4 4"></path>
    <path d="M14 4l-4 16"></path>
  </IconTemplate>
);

export const StrikedThroughIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M5 12l14 0"></path>
    <path d="M16 6.5a4 2 0 0 0 -4 -1.5h-1a3.5 3.5 0 0 0 0 7h2a3.5 3.5 0 0 1 0 7h-1.5a4 2 0 0 1 -4 -1.5"></path>
  </IconTemplate>
);
export const CodeBlockIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M14.5 4h2.5a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-5"></path>
    <path d="M6 5l-2 2l2 2"></path>
    <path d="M10 9l2 -2l-2 -2"></path>
  </IconTemplate>
);
export const BlockQuoteIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M6 15h15"></path>
    <path d="M21 19h-15"></path>
    <path d="M15 11h6"></path>
    <path d="M21 7h-6"></path>
    <path d="M9 9h1a1 1 0 1 1 -1 1v-2.5a2 2 0 0 1 2 -2"></path>
    <path d="M3 9h1a1 1 0 1 1 -1 1v-2.5a2 2 0 0 1 2 -2"></path>
  </IconTemplate>
);
export const H1Icon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M19 18v-8l-2 2"></path>
    <path d="M4 6v12"></path>
    <path d="M12 6v12"></path>
    <path d="M11 18h2"></path>
    <path d="M3 18h2"></path>
    <path d="M4 12h8"></path>
    <path d="M3 6h2"></path>
    <path d="M11 6h2"></path>
  </IconTemplate>
);
export const H2Icon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M17 12a2 2 0 1 1 4 0c0 .591 -.417 1.318 -.816 1.858l-3.184 4.143l4 0"></path>
    <path d="M4 6v12"></path>
    <path d="M12 6v12"></path>
    <path d="M11 18h2"></path>
    <path d="M3 18h2"></path>
    <path d="M4 12h8"></path>
    <path d="M3 6h2"></path>
    <path d="M11 6h2"></path>
  </IconTemplate>
);
export const H3Icon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M19 14a2 2 0 1 0 -2 -2"></path>
    <path d="M17 16a2 2 0 1 0 2 -2"></path>
    <path d="M4 6v12"></path>
    <path d="M12 6v12"></path>
    <path d="M11 18h2"></path>
    <path d="M3 18h2"></path>
    <path d="M4 12h8"></path>
    <path d="M3 6h2"></path>
    <path d="M11 6h2"></path>
  </IconTemplate>
);
export const NumberedListIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M11 6h9"></path>
    <path d="M11 12h9"></path>
    <path d="M12 18h8"></path>
    <path d="M4 16a2 2 0 1 1 4 0c0 .591 -.5 1 -1 1.5l-3 2.5h4"></path>
    <path d="M6 10v-6l-2 2"></path>
  </IconTemplate>
);
export const BulletedListIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M9 6l11 0"></path>
    <path d="M9 12l11 0"></path>
    <path d="M9 18l11 0"></path>
    <path d="M5 6l0 .01"></path>
    <path d="M5 12l0 .01"></path>
    <path d="M5 18l0 .01"></path>
  </IconTemplate>
);

export const LeftAlignIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M4 6l16 0"></path>
    <path d="M4 12l10 0"></path>
    <path d="M4 18l14 0"></path>
  </IconTemplate>
);
export const CenterAlignIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M4 6l16 0"></path>
    <path d="M8 12l8 0"></path>
    <path d="M6 18l12 0"></path>
  </IconTemplate>
);
export const RightAlignIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M4 6l16 0"></path>
    <path d="M10 12l10 0"></path>
    <path d="M6 18l14 0"></path>
  </IconTemplate>
);
export const JustifyAlignIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M4 6l16 0"></path>
    <path d="M4 12l16 0"></path>
    <path d="M4 18l12 0"></path>
  </IconTemplate>
);
export const DrawingIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M3 15c2 3 4 4 7 4s7 -3 7 -7s-3 -7 -6 -7s-5 1.5 -5 4s2 5 6 5s8.408 -2.453 10 -5"></path>
  </IconTemplate>
);
export const CheckboxIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props}>
    <path d="M9 11l3 3l8 -8"></path>
    <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9"></path>
  </IconTemplate>
);
export const TextColorIcon: React.FC<Props> = (props) => (
  <IconTemplate {...props} stroke="#475569">
    <path d="M9 15v-7a3 3 0 0 1 6 0v7"></path>
    <path d="M9 11h6"></path>
    <path d="M5 20h14" strokeWidth={4} stroke="currentColor"></path>
  </IconTemplate>
);
