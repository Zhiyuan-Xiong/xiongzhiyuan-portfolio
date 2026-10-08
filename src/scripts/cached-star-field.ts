type Star = { x: number; y: number; r: number; a: number; phase: number };
// Rasterise the detailed field once. Motion and shimmer then use cached layers.
export function createStarLayers(stars: Star[], width: number, height: number, scaleX: number, scaleY: number, rgb: string) {
  const extentX = width * 1.5, extentY = height * 1.5;
  const ratio = Math.min(1, 1800 / extentX, 1400 / extentY);
  const layers = Array.from({length:2}, () => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(extentX * ratio)); canvas.height = Math.max(1, Math.round(extentY * ratio));
    return canvas;
  });
  const brushes = layers.map(layer => layer.getContext('2d')!);
  brushes.forEach(brush => { brush.setTransform(ratio,0,0,ratio,brush.canvas.width / 2,brush.canvas.height / 2); });
  stars.forEach(star => {
    const brush = brushes[star.phase < Math.PI ? 0 : 1];
    brush.fillStyle = `rgba(${rgb},${star.a})`;
    brush.beginPath(); brush.arc(star.x * width * scaleX, star.y * height * scaleY, star.r,0,Math.PI * 2); brush.fill();
  });
  return { layers, width:extentX, height:extentY };
}