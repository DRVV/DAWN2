import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import CsvTable from './CsvTable';
 
const handleStyle = { left: 10 };
 
function TextUpdaterNode({ data, isConnectable }) {
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);
 
  return (
    <div className="text-updater-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div>
        <textarea id="text" className="node-label-textarea noDrag" name="text" onChange={onChange}  />
        <CsvTable csvUrl="/data.csv" delimiter="," />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        isConnectable={isConnectable}
      />
    </div>
  );
}
 
export default TextUpdaterNode;