// Slow ambient layers have a separate budget from interactive foreground animation.
export function scenePixelRatio(width: number, height: number, maximum = 1.4, pixels = 2_800_000) {
  return Math.min(devicePixelRatio || 1, maximum, Math.sqrt(pixels / Math.max(1, width * height)));
}
