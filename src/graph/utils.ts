import { color } from 'd3-color';
import { INVALID_COLOR } from './constants/error';

/**
 * Convert color string to hex format.
 * @param colorString Color, in any format
 */
export function colorToHex(colorString: string): string {
  const parsedColor = color(colorString);
  if (!parsedColor) throw INVALID_COLOR;
  return parsedColor.hex();
}

/**
 * Compute Euclidean distance between the two points given by (x1, y1) and (x2, y2).
 * @param x1 First x coordinate
 * @param y1 First y coordinate
 * @param x2 Second x coordinate
 * @param y2 Second y coordinate
 * @returns Distance between the two points
 */
export const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};
