export const PRESET_COLORS = [
  "#3b82f6", // Azul Cobalto
  "#10b981", // Verde Esmeralda
  "#8b5cf6", // Púrpura
  "#f59e0b", // Ámbar
  "#ef4444", // Rojo Carmesí
  "#ec4899", // Rosa
  "#06b6d4", // Cian
  "#6366f1", // Índigo
  "#14b8a6", // Turquesa
  "#f97316", // Naranja
];

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export function clampChannel(val: number): number {
  if (isNaN(val)) return 0;
  return Math.max(0, Math.min(255, Math.round(val)));
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => clampChannel(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function parseColorToRgb(color: string | undefined): RGBColor {
  if (!color) {
    return { r: 59, g: 130, b: 246 }; // default #3b82f6
  }

  const str = color.trim().toLowerCase();

  // If rgb(...) or rgba(...)
  if (str.startsWith("rgb")) {
    const matches = str.match(/\d+/g);
    if (matches && matches.length >= 3) {
      return {
        r: clampChannel(parseInt(matches[0], 10)),
        g: clampChannel(parseInt(matches[1], 10)),
        b: clampChannel(parseInt(matches[2], 10)),
      };
    }
  }

  // If hex
  let hex = str.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (hex.length >= 6) {
    const num = parseInt(hex.substring(0, 6), 16);
    if (!isNaN(num)) {
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
      };
    }
  }

  return { r: 59, g: 130, b: 246 };
}
