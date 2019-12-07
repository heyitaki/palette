import { color } from 'd3-color';

export function setNodeColor(node, nodeColor: string) {
  if (!node) return;
  // Normalize input color
  const parsedColor = color(nodeColor).toString();

  // Color node using given color and background color
  node.select('.node-body')
    .style('stroke', parsedColor)
    .style('fill', parsedColor);

  node.select('.node-glyph-top')
    .style('stroke', parsedColor)
    .style('fill', '#fafafa');

  node.select('.node-glyph-top-text')
    .style('stroke', parsedColor)
    .style('fill', parsedColor);
    
  node.select('.node-icon')
    .style('stroke', parsedColor)
    .style('fill', '#fafafa');
}
