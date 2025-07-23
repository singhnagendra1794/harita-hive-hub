import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ToolFiltersProps {
  selectedCategory: string;
  selectedSector: string;
  selectedDifficulty: string;
  selectedPlatform: string;
  onCategoryChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
}

const ToolFilters = ({
  selectedCategory,
  selectedSector,
  selectedDifficulty,
  selectedPlatform,
  onCategoryChange,
  onSectorChange,
  onDifficultyChange,
  onPlatformChange,
}: ToolFiltersProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="basic">🟢 Basic Tools</SelectItem>
            <SelectItem value="advanced">🟡 Advanced Tools</SelectItem>
            <SelectItem value="expert">🔴 Expert Tools</SelectItem>
            <SelectItem value="sector-specific">🧠 Sector-Specific</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="sector">Sector</Label>
        <Select value={selectedSector} onValueChange={onSectorChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            <SelectItem value="urban-planning">🏙️ Urban Planning</SelectItem>
            <SelectItem value="agriculture">🌾 Agriculture</SelectItem>
            <SelectItem value="disaster-management">🚨 Disaster Management</SelectItem>
            <SelectItem value="environment">🌍 Environment</SelectItem>
            <SelectItem value="telecom">📡 Telecom</SelectItem>
            <SelectItem value="transportation">🚗 Transportation</SelectItem>
            <SelectItem value="health">🏥 Health</SelectItem>
            <SelectItem value="energy">⚡ Energy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="difficulty">Difficulty Level</Label>
        <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">🟢 Beginner</SelectItem>
            <SelectItem value="intermediate">🟡 Intermediate</SelectItem>
            <SelectItem value="advanced">🟠 Advanced</SelectItem>
            <SelectItem value="expert">🔴 Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="platform">Platform</Label>
        <Select value={selectedPlatform} onValueChange={onPlatformChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="qgis">🗺️ QGIS</SelectItem>
            <SelectItem value="arcgis">🌍 ArcGIS</SelectItem>
            <SelectItem value="python">🐍 Python</SelectItem>
            <SelectItem value="r">📊 R</SelectItem>
            <SelectItem value="web">🌐 Web Browser</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ToolFilters;