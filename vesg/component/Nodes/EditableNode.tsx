import React from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import useStore from '../../app/zustand-test/store';
export type NodeData = {
  label: string;
};

function EditableNode({ id, data }: NodeProps<Node<NodeData>>) {
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  return (
    <>
      <input 
        value={data.label} 
        onChange={(evt) => updateNodeLabel(id, evt.target.value)}
      />

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}

export default EditableNode;