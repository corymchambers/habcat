import React from "react";
import Svg, { Circle, Ellipse, Path, Text as SvgText } from "react-native-svg";

// Mascot colors
const mascotColors = {
  body: "#C9B99A",
  accent: "#C4A07A",
  face: "#363B47",
  cheek: "#E8C8C8",
  primary: "#4A9B82",
};

type Variant = "sitting" | "peeking" | "sleeping" | "celebrating" | "waving";
type Size = "sm" | "md" | "lg" | "xl";

interface CatMascotProps {
  variant?: Variant;
  size?: Size;
}

const sizeMap: Record<Size, number> = {
  sm: 40,
  md: 64,
  lg: 96,
  xl: 140,
};

export function CatMascot({ variant = "sitting", size = "md" }: CatMascotProps) {
  const pixelSize = sizeMap[size];

  // Sitting cat - default friendly pose
  if (variant === "sitting") {
    return (
      <Svg width={pixelSize} height={pixelSize} viewBox="0 0 100 100" fill="none">
        {/* Body */}
        <Ellipse cx="50" cy="65" rx="28" ry="25" fill={mascotColors.body} />
        {/* Head */}
        <Circle cx="50" cy="38" r="22" fill={mascotColors.body} />
        {/* Left ear */}
        <Path d="M32 22 L28 8 L42 18 Z" fill={mascotColors.body} />
        {/* Right ear */}
        <Path d="M68 22 L72 8 L58 18 Z" fill={mascotColors.body} />
        {/* Inner ears */}
        <Path d="M34 20 L32 12 L40 18 Z" fill={mascotColors.accent} />
        <Path d="M66 20 L68 12 L60 18 Z" fill={mascotColors.accent} />
        {/* Eyes - happy closed */}
        <Path
          d="M40 36 Q44 40 48 36"
          stroke={mascotColors.face}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M52 36 Q56 40 60 36"
          stroke={mascotColors.face}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Nose */}
        <Ellipse cx="50" cy="44" rx="3" ry="2" fill={mascotColors.accent} />
        {/* Mouth */}
        <Path
          d="M50 46 L50 48 M47 50 Q50 53 53 50"
          stroke={mascotColors.face}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Tail */}
        <Path
          d="M78 70 Q90 55 85 45"
          stroke={mascotColors.body}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    );
  }

  // Peeking cat - subtle, from bottom
  if (variant === "peeking") {
    return (
      <Svg
        width={pixelSize}
        height={pixelSize * 0.6}
        viewBox="0 0 100 60"
        fill="none"
      >
        {/* Head peeking up */}
        <Circle cx="50" cy="45" r="22" fill={mascotColors.body} />
        {/* Left ear */}
        <Path d="M32 30 L28 16 L42 26 Z" fill={mascotColors.body} />
        {/* Right ear */}
        <Path d="M68 30 L72 16 L58 26 Z" fill={mascotColors.body} />
        {/* Inner ears */}
        <Path d="M34 28 L32 20 L40 26 Z" fill={mascotColors.accent} />
        <Path d="M66 28 L68 20 L60 26 Z" fill={mascotColors.accent} />
        {/* Eyes - curious, open */}
        <Circle cx="42" cy="42" r="4" fill={mascotColors.face} />
        <Circle cx="58" cy="42" r="4" fill={mascotColors.face} />
        <Circle cx="43" cy="41" r="1.5" fill="white" />
        <Circle cx="59" cy="41" r="1.5" fill="white" />
        {/* Nose */}
        <Ellipse cx="50" cy="50" rx="3" ry="2" fill={mascotColors.accent} />
        {/* Paws on edge */}
        <Ellipse cx="38" cy="58" rx="8" ry="5" fill={mascotColors.body} />
        <Ellipse cx="62" cy="58" rx="8" ry="5" fill={mascotColors.body} />
      </Svg>
    );
  }

  // Sleeping cat - very calm
  if (variant === "sleeping") {
    return (
      <Svg
        width={pixelSize}
        height={pixelSize * 0.6}
        viewBox="0 0 100 60"
        fill="none"
      >
        {/* Curled body */}
        <Ellipse cx="50" cy="40" rx="35" ry="18" fill={mascotColors.body} />
        {/* Head tucked */}
        <Circle cx="30" cy="35" r="16" fill={mascotColors.body} />
        {/* Ear */}
        <Path d="M20 22 L16 12 L28 20 Z" fill={mascotColors.body} />
        <Path d="M22 21 L20 15 L27 20 Z" fill={mascotColors.accent} />
        {/* Closed eyes - sleeping */}
        <Path
          d="M24 34 L30 34"
          stroke={mascotColors.face}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M32 33 L36 33"
          stroke={mascotColors.face}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Nose */}
        <Ellipse cx="28" cy="40" rx="2" ry="1.5" fill={mascotColors.accent} />
        {/* Tail wrapped around */}
        <Path
          d="M78 35 Q90 20 75 25 Q65 28 70 38"
          stroke={mascotColors.body}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Zzz */}
        <SvgText x="45" y="20" fontSize="10" fill="#7F8694" fontWeight="500">
          z
        </SvgText>
        <SvgText x="52" y="15" fontSize="8" fill="#7F8694" fontWeight="500">
          z
        </SvgText>
        <SvgText x="58" y="12" fontSize="6" fill="#7F8694" fontWeight="500">
          z
        </SvgText>
      </Svg>
    );
  }

  // Celebrating cat - all habits done!
  if (variant === "celebrating") {
    return (
      <Svg width={pixelSize} height={pixelSize} viewBox="0 0 100 100" fill="none">
        {/* Body */}
        <Ellipse cx="50" cy="68" rx="26" ry="22" fill={mascotColors.body} />
        {/* Head */}
        <Circle cx="50" cy="40" r="22" fill={mascotColors.body} />
        {/* Left ear */}
        <Path d="M32 24 L28 10 L42 20 Z" fill={mascotColors.body} />
        {/* Right ear */}
        <Path d="M68 24 L72 10 L58 20 Z" fill={mascotColors.body} />
        {/* Inner ears */}
        <Path d="M34 22 L32 14 L40 20 Z" fill={mascotColors.accent} />
        <Path d="M66 22 L68 14 L60 20 Z" fill={mascotColors.accent} />
        {/* Eyes - super happy, closed arcs */}
        <Path
          d="M38 38 Q44 32 50 38"
          stroke={mascotColors.face}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M50 38 Q56 32 62 38"
          stroke={mascotColors.face}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Rosy cheeks */}
        <Ellipse cx="35" cy="44" rx="4" ry="2.5" fill={mascotColors.cheek} />
        <Ellipse cx="65" cy="44" rx="4" ry="2.5" fill={mascotColors.cheek} />
        {/* Nose */}
        <Ellipse cx="50" cy="46" rx="3" ry="2" fill={mascotColors.accent} />
        {/* Big smile */}
        <Path
          d="M42 50 Q50 58 58 50"
          stroke={mascotColors.face}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Raised paw */}
        <Ellipse cx="75" cy="55" rx="7" ry="6" fill={mascotColors.body} />
        {/* Sparkles */}
        <Path
          d="M20 25 L22 20 L24 25 L29 23 L24 25 L26 30 L24 25 L19 27 Z"
          fill={mascotColors.primary}
        />
        <Path
          d="M80 30 L81 27 L82 30 L85 29 L82 30 L83 33 L82 30 L79 31 Z"
          fill={mascotColors.primary}
        />
        <Circle cx="15" cy="45" r="2" fill={mascotColors.primary} opacity={0.6} />
        <Circle cx="88" cy="50" r="2" fill={mascotColors.primary} opacity={0.6} />
      </Svg>
    );
  }

  // Waving cat
  if (variant === "waving") {
    return (
      <Svg width={pixelSize} height={pixelSize} viewBox="0 0 100 100" fill="none">
        {/* Body */}
        <Ellipse cx="50" cy="68" rx="26" ry="22" fill={mascotColors.body} />
        {/* Head */}
        <Circle cx="50" cy="40" r="22" fill={mascotColors.body} />
        {/* Left ear */}
        <Path d="M32 24 L28 10 L42 20 Z" fill={mascotColors.body} />
        {/* Right ear */}
        <Path d="M68 24 L72 10 L58 20 Z" fill={mascotColors.body} />
        {/* Inner ears */}
        <Path d="M34 22 L32 14 L40 20 Z" fill={mascotColors.accent} />
        <Path d="M66 22 L68 14 L60 20 Z" fill={mascotColors.accent} />
        {/* Eyes - friendly */}
        <Circle cx="42" cy="38" r="4" fill={mascotColors.face} />
        <Circle cx="58" cy="38" r="4" fill={mascotColors.face} />
        <Circle cx="43" cy="37" r="1.5" fill="white" />
        <Circle cx="59" cy="37" r="1.5" fill="white" />
        {/* Nose */}
        <Ellipse cx="50" cy="46" rx="3" ry="2" fill={mascotColors.accent} />
        {/* Smile */}
        <Path
          d="M45 51 Q50 55 55 51"
          stroke={mascotColors.face}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Waving paw */}
        <Ellipse
          cx="78"
          cy="48"
          rx="7"
          ry="6"
          fill={mascotColors.body}
          rotation={-20}
          origin="78, 48"
        />
        {/* Tail */}
        <Path
          d="M76 72 Q88 60 84 48"
          stroke={mascotColors.body}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    );
  }

  return null;
}
