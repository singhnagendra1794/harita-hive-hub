import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizResult } from '@/types/skill-assessment';

interface RadarChartProps {
  results: QuizResult[];
}

export const RadarChart: React.FC<RadarChartProps> = ({ results }) => {
  // Create SVG radar chart
  const width = 300;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 100;
  
  const categories = ['GIS Basics', 'Remote Sensing', 'Python', 'SQL', 'QGIS', 'GeoAI'];
  const angleStep = (2 * Math.PI) / categories.length;
  
  // Get scores for each category (default to 0 if not taken)
  const scores = categories.map(category => {
    const result = results.find(r => r.category === category);
    return result ? result.score : 0;
  });
  
  // Calculate points for the polygon
  const dataPoints = scores.map((score, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const distance = (score / 100) * radius;
    return {
      x: centerX + distance * Math.cos(angle),
      y: centerY + distance * Math.sin(angle)
    };
  });
  
  // Create grid circles
  const gridLevels = [20, 40, 60, 80, 100];
  const gridCircles = gridLevels.map(level => (
    <circle
      key={level}
      cx={centerX}
      cy={centerY}
      r={(level / 100) * radius}
      fill="none"
      stroke="hsl(var(--border))"
      strokeWidth="1"
      opacity="0.3"
    />
  ));
  
  // Create axis lines
  const axisLines = categories.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const endX = centerX + radius * Math.cos(angle);
    const endY = centerY + radius * Math.sin(angle);
    
    return (
      <line
        key={index}
        x1={centerX}
        y1={centerY}
        x2={endX}
        y2={endY}
        stroke="hsl(var(--border))"
        strokeWidth="1"
        opacity="0.3"
      />
    );
  });
  
  // Create data polygon
  const polygonPoints = dataPoints.map(point => `${point.x},${point.y}`).join(' ');
  
  // Create category labels
  const labels = categories.map((category, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const labelDistance = radius + 20;
    const x = centerX + labelDistance * Math.cos(angle);
    const y = centerY + labelDistance * Math.sin(angle);
    
    return (
      <text
        key={category}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs fill-current"
        fill="hsl(var(--foreground))"
      >
        {category}
      </text>
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Assessment Radar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <svg width={width + 40} height={height + 40} className="overflow-visible">
            {gridCircles}
            {axisLines}
            
            {/* Data polygon */}
            <polygon
              points={polygonPoints}
              fill="hsl(var(--primary))"
              fillOpacity="0.2"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
            
            {/* Data points */}
            {dataPoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="hsl(var(--primary))"
              />
            ))}
            
            {labels}
            
            {/* Grid level labels */}
            {gridLevels.map(level => (
              <text
                key={level}
                x={centerX + 5}
                y={centerY - (level / 100) * radius}
                className="text-xs fill-current"
                fill="hsl(var(--muted-foreground))"
              >
                {level}%
              </text>
            ))}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium">Score Breakdown:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {categories.map((category, index) => (
              <div key={category} className="flex justify-between">
                <span className="text-muted-foreground">{category}:</span>
                <span className="font-medium">{scores[index]}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};