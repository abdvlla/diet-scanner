export function getScoreColor(score: number): string {
  if (score >= 70) return "#3D7A5C";
  if (score >= 40) return "#D9A441";
  return "#C1473A";
}

export function getScoreBackgroundColor(score: number): string {
  const hex = getScoreColor(score);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.12)`;
}
