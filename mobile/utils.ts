export function getScoreColor(score: number): string {
  if (score >= 70) return "#3D7A5C";
  if (score >= 40) return "#D9A441";
  return "#C1473A";
}
