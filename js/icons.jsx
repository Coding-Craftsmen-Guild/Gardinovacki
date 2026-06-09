/* Icon library — minimal monoline SVGs, all currentColor */
const Icon = {
  Arrow: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M4 12 H20 M14 6 L20 12 L14 18" />
    </svg>
  ),
  ArrowDown: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M12 4 V20 M6 14 L12 20 L18 14" />
    </svg>
  ),
  ChevL: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M11 3 L5 9 L11 15" />
    </svg>
  ),
  ChevR: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M7 3 L13 9 L7 15" />
    </svg>
  ),
  Close: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M3 3 L15 15 M15 3 L3 15" />
    </svg>
  ),
  Menu: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2 5 H16 M2 9 H16 M2 13 H16" />
    </svg>
  ),
  Play: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 5 L19 12 L7 19 Z" />
    </svg>
  ),
  Instagram: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  ),
  Facebook: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M15 4 H13 C11.5 4 11 5 11 6.5 V9 H8 V12 H11 V20 H14 V12 H17 L17.5 9 H14 V7 C14 6.4 14.4 6 15 6 H17 V4 Z" />
    </svg>
  ),
  TikTok: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M14 4 V14.5 C14 16.4 12.4 18 10.5 18 C8.6 18 7 16.4 7 14.5 C7 12.6 8.6 11 10.5 11" />
      <path d="M14 4 C14 6.2 15.8 8 18 8" />
    </svg>
  ),
  Phone: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M5 5 C5 4.4 5.4 4 6 4 H8.5 L10 8 L8 9.5 C9 12 12 15 14.5 16 L16 14 L20 15.5 V18 C20 18.6 19.6 19 19 19 C11.3 19 5 12.7 5 5 Z" />
    </svg>
  ),
  Mail: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="3" y="6" width="18" height="12" />
      <path d="M3 6 L12 13 L21 6" />
    </svg>
  ),
  Pin: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M12 21 C12 21 5 14 5 9 A7 7 0 0 1 19 9 C19 14 12 21 12 21 Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  /* feature icons used in package detail */
  Camera: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="1" />
      <path d="M9 7 L10 5 H14 L15 7" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  ),
  Box: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8 L12 4 L21 8 L12 12 Z" />
      <path d="M3 8 V18 L12 22 V12" />
      <path d="M21 8 V18 L12 22" />
    </svg>
  ),
  Cloud: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 17 H17 A4 4 0 0 0 17 9 A5.5 5.5 0 0 0 7 10 A3.5 3.5 0 0 0 7.5 17 Z" />
    </svg>
  ),
  Book: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4 H11 C11.5 4 12 4.5 12 5 V20 C12 19.5 11.5 19 11 19 H5 Z" />
      <path d="M19 4 H13 C12.5 4 12 4.5 12 5 V20 C12 19.5 12.5 19 13 19 H19 Z" />
    </svg>
  ),
  Film: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 9 H6 M3 13 H6 M3 17 H6 M18 9 H21 M18 13 H21 M18 17 H21" />
      <path d="M9 9 H15 V15 H9 Z" />
    </svg>
  ),
  Heart: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21 C12 21 4 14 4 9 A4 4 0 0 1 12 7 A4 4 0 0 1 20 9 C20 14 12 21 12 21 Z" />
    </svg>
  ),
  Images: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="3" width="14" height="14" rx="1.5" />
      <path d="M3 7 V20 a1 1 0 0 0 1 1 H17" />
      <path d="M21 12 L17 9 L11 16" />
    </svg>
  ),
  Clock: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7 V12 L15.5 14" />
    </svg>
  ),
  Check: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12 L10 17 L19 7" />
    </svg>
  ),
};

window.Icon = Icon;
