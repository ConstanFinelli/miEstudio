import React, { useState, useEffect, useMemo, useRef } from "react";
import styles from "./ColorPickerRGB.module.css";
import { SlidersHorizontal, Check, Pipette, Palette } from "lucide-react";
import {
  PRESET_COLORS,
  parseColorToRgb,
  rgbToHex,
  clampChannel,
} from "./colorUtils";
import type { RGBColor } from "./colorUtils";

export interface ColorPickerRGBProps {
  value: string;
  onChange: (hexColor: string) => void;
  label?: string;
  hint?: string;
  defaultExpandedSliders?: boolean;
}

export const ColorPickerRGB: React.FC<ColorPickerRGBProps> = ({
  value,
  onChange,
  label = "Color Identificador",
  hint,
  defaultExpandedSliders = false,
}) => {
  const [rgb, setRgb] = useState<RGBColor>(() => parseColorToRgb(value));
  const [hexInput, setHexInput] = useState<string>(() =>
    (value || "#3b82f6").replace(/^#/, "").toUpperCase()
  );
  const [showSliders, setShowSliders] = useState<boolean>(defaultExpandedSliders);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Synchronize when external value prop changes
  useEffect(() => {
    const parsed = parseColorToRgb(value);
    setRgb(parsed);
    setHexInput(rgbToHex(parsed.r, parsed.g, parsed.b).replace(/^#/, "").toUpperCase());
  }, [value]);

  const currentHex = useMemo(
    () => rgbToHex(rgb.r, rgb.g, rgb.b),
    [rgb.r, rgb.g, rgb.b]
  );

  const handleChannelChange = (channel: keyof RGBColor, val: number) => {
    const clamped = clampChannel(val);
    const nextRgb = { ...rgb, [channel]: clamped };
    setRgb(nextRgb);
    const nextHex = rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b);
    setHexInput(nextHex.replace(/^#/, "").toUpperCase());
    onChange(nextHex);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
    setHexInput(raw.toUpperCase());

    if (raw.length === 6) {
      const parsed = parseColorToRgb(`#${raw}`);
      setRgb(parsed);
      onChange(`#${raw.toLowerCase()}`);
    }
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    const parsed = parseColorToRgb(newHex);
    setRgb(parsed);
    setHexInput(newHex.replace(/^#/, "").toUpperCase());
    onChange(newHex);
  };

  const handleSelectPreset = (preset: string) => {
    const parsed = parseColorToRgb(preset);
    setRgb(parsed);
    setHexInput(preset.replace(/^#/, "").toUpperCase());
    onChange(preset);
  };

  return (
    <div className={styles.container}>
      {/* Label and Hint */}
      <div>
        <div className={styles.headerRow}>
          <label className={styles.label}>
            <Palette size={13} color="var(--primary)" />
            <span>{label}</span>
          </label>
        </div>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>

      {/* Preset color dots */}
      <div className={styles.paletteRow}>
        {PRESET_COLORS.map((c) => {
          const isSelected = currentHex.toLowerCase() === c.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              className={`${styles.presetDot} ${
                isSelected ? styles.presetDotSelected : ""
              }`}
              style={{ backgroundColor: c }}
              onClick={() => handleSelectPreset(c)}
              title={c}
            >
              {isSelected && (
                <Check size={12} color="#ffffff" strokeWidth={3} />
              )}
            </button>
          );
        })}
      </div>

      {/* Bar with Swatch / Native Picker, Hex input, RGB badge, and RGB Sliders toggle */}
      <div className={styles.controlBar}>
        <div className={styles.swatchAndInputs}>
          <div
            className={styles.swatchBtn}
            style={{ backgroundColor: currentHex }}
            title="Abrir selector de color nativo / cuentagotas"
            onClick={() => colorInputRef.current?.click()}
          >
            <Pipette
              size={12}
              color="#ffffff"
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
                pointerEvents: "none",
              }}
            />
            <input
              ref={colorInputRef}
              type="color"
              className={styles.nativeColorInput}
              value={currentHex}
              onChange={handleNativeColorChange}
            />
          </div>

          <div className={styles.hexInputWrapper}>
            <span className={styles.hashPrefix}>#</span>
            <input
              type="text"
              className={styles.hexInput}
              value={hexInput}
              onChange={handleHexInputChange}
              maxLength={6}
              placeholder="RRGGBB"
              title="Código Hexadecimal"
            />
          </div>

          <span className={styles.rgbBadge}>
            RGB({rgb.r}, {rgb.g}, {rgb.b})
          </span>
        </div>

        <button
          type="button"
          className={`${styles.toggleSlidersBtn} ${
            showSliders ? styles.toggleSlidersBtnActive : ""
          }`}
          onClick={() => setShowSliders(!showSliders)}
          title={showSliders ? "Ocultar canales RGB" : "Ajustar canales RGB"}
        >
          <SlidersHorizontal size={12} />
          <span>{showSliders ? "Ocultar RGB" : "Ajustar RGB"}</span>
        </button>
      </div>

      {/* RGB Sliders Section */}
      {showSliders && (
        <div className={styles.slidersContainer}>
          {/* Red Channel */}
          <div className={styles.sliderRow}>
            <span className={`${styles.channelTag} ${styles.channelTagR}`}>
              R
            </span>
            <input
              type="range"
              min={0}
              max={255}
              value={rgb.r}
              onChange={(e) =>
                handleChannelChange("r", parseInt(e.target.value, 10))
              }
              className={styles.rangeInput}
              style={{
                background: `linear-gradient(to right, rgb(0, ${rgb.g}, ${rgb.b}), rgb(255, ${rgb.g}, ${rgb.b}))`,
              }}
            />
            <input
              type="number"
              min={0}
              max={255}
              value={rgb.r}
              onChange={(e) =>
                handleChannelChange("r", parseInt(e.target.value, 10))
              }
              className={styles.numberInput}
            />
          </div>

          {/* Green Channel */}
          <div className={styles.sliderRow}>
            <span className={`${styles.channelTag} ${styles.channelTagG}`}>
              G
            </span>
            <input
              type="range"
              min={0}
              max={255}
              value={rgb.g}
              onChange={(e) =>
                handleChannelChange("g", parseInt(e.target.value, 10))
              }
              className={styles.rangeInput}
              style={{
                background: `linear-gradient(to right, rgb(${rgb.r}, 0, ${rgb.b}), rgb(${rgb.r}, 255, ${rgb.b}))`,
              }}
            />
            <input
              type="number"
              min={0}
              max={255}
              value={rgb.g}
              onChange={(e) =>
                handleChannelChange("g", parseInt(e.target.value, 10))
              }
              className={styles.numberInput}
            />
          </div>

          {/* Blue Channel */}
          <div className={styles.sliderRow}>
            <span className={`${styles.channelTag} ${styles.channelTagB}`}>
              B
            </span>
            <input
              type="range"
              min={0}
              max={255}
              value={rgb.b}
              onChange={(e) =>
                handleChannelChange("b", parseInt(e.target.value, 10))
              }
              className={styles.rangeInput}
              style={{
                background: `linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, 0), rgb(${rgb.r}, ${rgb.g}, 255))`,
              }}
            />
            <input
              type="number"
              min={0}
              max={255}
              value={rgb.b}
              onChange={(e) =>
                handleChannelChange("b", parseInt(e.target.value, 10))
              }
              className={styles.numberInput}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPickerRGB;
