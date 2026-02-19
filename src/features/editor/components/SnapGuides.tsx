"use client";

import React from "react";
import { Line } from "react-konva";

export interface SnapGuide {
  axis: 'x' | 'y';
  position: number;
  type: 'center' | 'edge';
}

interface SnapGuidesProps {
  guides: SnapGuide[];
  width: number;
  height: number;
}

export const SnapGuides: React.FC<SnapGuidesProps> = ({ guides, width, height }) => {
  return (
    <>
      {guides.map((guide, index) => {
        const isVertical = guide.axis === 'x';
        const color = guide.type === 'center' ? '#3b82f6' : '#ef4444';

        return (
          <Line
            key={index}
            points={isVertical
              ? [guide.position, 0, guide.position, height]
              : [0, guide.position, width, guide.position]
            }
            stroke={color}
            strokeWidth={2}
            dash={[5, 5]}
            listening={false}
          />
        );
      })}
    </>
  );
};
