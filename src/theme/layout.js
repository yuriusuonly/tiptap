// Shared responsive layout tokens for web and Android. See DESIGN.md.
//
// Four supported layout classes, selected by viewport width (dp on Android,
// CSS px on web):
//
//   wearable  < 480   (320 x 480 reference)
//   phone     >= 480  (480 x 720 reference)
//   tablet    >= 720  (720 x 1280 reference)
//   desktop   >= 1080 (1080 x 1920 reference)
//
// Content is centered and never grows wider than `contentMaxWidth` (1920) on
// either platform.

export const breakpoints = {
  phone: 480,
  tablet: 720,
  desktop: 1080,
};

export const contentMaxWidth = 1920;

export const layoutClasses = ["wearable", "phone", "tablet", "desktop"];

/**
 * Resolves a viewport width to one of the four supported layout classes.
 * Non-finite widths (for example during static web rendering) fall back to the
 * smallest class so server HTML and the first client render stay identical.
 */
export function getLayoutClass(width) {
  if (!Number.isFinite(width) || width < breakpoints.phone) return "wearable";
  if (width < breakpoints.tablet) return "phone";
  if (width < breakpoints.desktop) return "tablet";
  return "desktop";
}

export const responsiveLayout = {
  wearable: {
    gutter: 16,
    pagePaddingVertical: 24,
    stack: true,
    gap: 24,
    eyebrow: {fontSize: 11, lineHeight: 16, letterSpacing: 1},
    title: {fontSize: 32, lineHeight: 36, letterSpacing: -0.8},
    description: {fontSize: 15, lineHeight: 22, maxWidth: 300},
    logoCard: {size: 232, radius: 24, padding: 16, gap: 12},
    logoSize: 132,
    haloSize: 160,
    home: {
      maxWidth: 480,
      gap: 8,
      titleSize: 24,
      titleLineHeight: 30,
      subtitleSize: 14,
      subtitleLineHeight: 20,
    },
    profile: {maxWidth: 560, gap: 4, cardPadding: 8, headerSize: 11},
    blobs: {
      primary: {size: 220, top: -100, left: -90, opacity: 0.14},
      secondary: {size: 260, bottom: -120, right: -100, opacity: 0.14},
    },
  },
  phone: {
    gutter: 20,
    pagePaddingVertical: 32,
    stack: true,
    gap: 32,
    eyebrow: {fontSize: 12, lineHeight: 17, letterSpacing: 1.1},
    title: {fontSize: 40, lineHeight: 44, letterSpacing: -1.2},
    description: {fontSize: 16, lineHeight: 24, maxWidth: 420},
    logoCard: {size: 300, radius: 28, padding: 20, gap: 16},
    logoSize: 168,
    haloSize: 200,
    home: {
      maxWidth: 560,
      gap: 8,
      titleSize: 30,
      titleLineHeight: 36,
      subtitleSize: 16,
      subtitleLineHeight: 24,
    },
    profile: {maxWidth: 560, gap: 8, cardPadding: 8, headerSize: 12},
    blobs: {
      primary: {size: 280, top: -140, left: -120, opacity: 0.15},
      secondary: {size: 320, bottom: -160, right: -140, opacity: 0.15},
    },
  },
  tablet: {
    gutter: 32,
    pagePaddingVertical: 48,
    stack: true,
    gap: 40,
    eyebrow: {fontSize: 12, lineHeight: 18, letterSpacing: 1.2},
    title: {fontSize: 52, lineHeight: 56, letterSpacing: -1.4},
    description: {fontSize: 17, lineHeight: 26, maxWidth: 520},
    logoCard: {size: 360, radius: 32, padding: 24, gap: 20},
    logoSize: 210,
    haloSize: 240,
    home: {
      maxWidth: 640,
      gap: 8,
      titleSize: 36,
      titleLineHeight: 42,
      subtitleSize: 18,
      subtitleLineHeight: 26,
    },
    profile: {maxWidth: 640, gap: 8, cardPadding: 12, headerSize: 12},
    blobs: {
      primary: {size: 360, top: -180, left: -150, opacity: 0.16},
      secondary: {size: 420, bottom: -200, right: -160, opacity: 0.16},
    },
  },
  desktop: {
    gutter: 48,
    pagePaddingVertical: 64,
    stack: false,
    gap: 64,
    eyebrow: {fontSize: 13, lineHeight: 18, letterSpacing: 1.2},
    title: {fontSize: 64, lineHeight: 66, letterSpacing: -1.5},
    description: {fontSize: 18, lineHeight: 28, maxWidth: 460},
    logoCard: {size: 380, radius: 32, padding: 32, gap: 24},
    logoSize: 260,
    haloSize: 220,
    home: {
      maxWidth: 880,
      gap: 8,
      titleSize: 44,
      titleLineHeight: 52,
      subtitleSize: 20,
      subtitleLineHeight: 30,
    },
    profile: {maxWidth: 720, gap: 12, cardPadding: 16, headerSize: 13},
    blobs: {
      primary: {size: 520, top: -240, left: -160, opacity: 0.16},
      secondary: {size: 560, bottom: -280, right: -200, opacity: 0.16},
    },
  },
};
