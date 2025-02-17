import { useCallback, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import EditableCsvTable from "../EditableCsvTable";
import CsvLoaderFromUrl from "../CsvLoaderFromUrl";

function DesignTableNode ({ data, isConnectable }) {

  return (
    <div className="design-table-node">
      {/* no target handles, since this is the root */}
      <div>
        <h2>{data.csvUrl}</h2>
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

export default DesignTableNode;