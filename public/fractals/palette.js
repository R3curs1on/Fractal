export function getPaletteColor(palette, generation = 0, phase = 0, alpha = 1) {
    const mode = palette || "default";

    if (mode === "fire") {
        const hue = 16 + ((generation * 8 + phase) % 34);
        return `hsla(${hue}, 90%, 54%, ${alpha})`;
    }

    if (mode === "ice") {
        const hue = 185 + ((generation * 8 + phase) % 35);
        return `hsla(${hue}, 86%, 58%, ${alpha})`;
    }

    const hue = (generation * 23 + phase) % 360;
    return `hsla(${hue}, 78%, 56%, ${alpha})`;
}
