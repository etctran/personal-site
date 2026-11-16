/** The six particle hues as designed (mid-afternoon). */
export const BASE_HUES = [6, 30, 50, 135, 190, 218]

/**
 * The palette for a local hour (0..24): the designed hues in the afternoon,
 * rotated toward blue and violet at night and back again by morning. The
 * rotation follows a cosine of the hour so midnight and dawn blend smoothly.
 */
export function paletteFor(hour: number): number[] {
  // 0 at 15:00, 1 at 03:00
  const night = (1 - Math.cos(((hour - 15) / 24) * Math.PI * 2)) / 2
  const shift = night * 150
  return BASE_HUES.map((h) => (h + shift) % 360)
}

/** Fractional local hour right now, e.g. 14.5 for 14:30. */
export function localHour(d = new Date()): number {
  return d.getHours() + d.getMinutes() / 60
}
