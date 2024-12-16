import React, { useState, useEffect, useRef } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';

export default function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');

  const inputRef = useRef(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    data.onLabelChange && data.onLabelChange(id, label);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      data.onLabelChange && data.onLabelChange(id, label);
    }
  };

  // Focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Compute the path and label position
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#555' : '#222',
          strokeWidth: selected ? 2 : 1.5,
          
        }}
        markerEnd={markerEnd}

      />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(${labelX}px, ${labelY}px) translate(-50%, -50%)`,
            background: selected ? '#f0f0f0' : '#fff',
            pointerEvents: 'all',
          }}

          
        >
          {isEditing ? (
            <input
              ref={inputRef}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%'
              }}
            />
          ) : (
            <span 
            onDoubleClick={handleDoubleClick}
            onKeyDown={(e) => e.stopPropagation()} // prevent ReactFlow shortcuts
            >{label}</span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
