import React, { useState } from 'react';
import { Handle } from '@xyflow/react';

export default function EditableNode({ id, data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    data.onLabelChange(id, label);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      data.onLabelChange(id, label);
    }
  };

  return (
    <div
      style={{
        padding: '5px 10px',
        border: '1px solid #222',
        borderRadius: '5px',
        background: selected ? '#f0f0f0' : '#fff',
        minWidth: '80px',
        textAlign: 'center'
      }}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span>{label}</span>
      )}
      <Handle type="source" position="bottom" style={{ background: '#555' }} />
      <Handle type="target" position="top" style={{ background: '#555' }} />
    </div>
  );
}
