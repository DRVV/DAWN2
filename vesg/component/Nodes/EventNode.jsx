
// import {Handle, Position} from "@xyflow/react";

// function EventNode({ data, isConnectable }) {
//   return (
//     <div className="event-node">
//       <Handle
//         type="target"
//         position={Position.Left}
//         isConnectable={isConnectable} />

//       <div>
//         <p>{data.process}</p>
//         <p>{data.parts}</p>
//         <h3>{data.label}</h3>
//       </div>
//       <Handle
//         type="target"
//         position={Position.Right}
//         isConnectable={isConnectable} />
//     </div>
//   )
// }

// export default EventNode;


import { Handle, Position } from "@xyflow/react";

function EventNode({ data, isConnectable }) {
  const processContent =
    data.process ? (
      data.process
    ) : (
      <span style={{ color: 'red', fontSize: '0.8rem' }}>?</span>
    );
  const partsContent =
    data.parts ? (
      data.parts
    ) : (
      <span style={{ color: 'red', fontSize: '0.8rem' }}>?</span>
    );

  return (
    <div className="event-node">
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />

      <div>
        <p style={{ fontSize: '0.8rem', fontWeight: 'normal', margin: 0 }}>
          {processContent}
        </p>
        <p style={{ fontSize: '0.8rem', fontWeight: 'normal', margin: 0 }}>
          {partsContent}
        </p>
        <h3>{data.label}</h3>
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </div>
  );
}

export default EventNode;
