import { useCallback, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import EditableCsvTable from "../EditableCsvTable";
import CsvLoaderFromUrl from "../CsvLoaderFromUrl";

function StateChangeNode ({ data, isConnectable }) {

  return (
    <div className="state-change-table-node">
      {/* no target handles, since this is the root */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <div>
        <h2>{data.label}</h2>
        <CsvLoaderFromUrl 
          dataUrl={data.dataUrl}
          candidatesUrl={data.candidatesUrl}
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  )}

export default StateChangeNode;