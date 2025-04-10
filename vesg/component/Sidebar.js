import { useState } from 'react';

// Fixed options for numeric inputs (displayed as float values)
const fixedFloatValues = {
  width: [1.0, 2.0, 3.0],
  length: [5.0, 10.0, 15.0],
  capacitance: [100, 200, 300],
  voltage: [5, 12, 24]
};

import GenericDropdown from './GenericDropdown';
import {parts} from '@/data/dropdown/parts';
import { processes } from '@/data/dropdown/processes';
import { useSearchStore } from '@/store/searchStore';

// Fixed options for string inputs
const fixedStringValues = {
  parts: ['Part A', 'Part B', 'Part C'],
  process: ['Process X', 'Process Y', 'Process Z']
};

export default function Sidebar() {
  const [inputs, setInputs] = useState({
    width: fixedFloatValues.width[0],
    length: fixedFloatValues.length[0],
    capacitance: fixedFloatValues.capacitance[0],
    voltage: fixedFloatValues.voltage[0],
    parts: fixedStringValues.parts[0],
    process: fixedStringValues.process[0]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  
  // const [selectedPart, setSelectedPart] = useState(parts[0]);
  // const [selectedProcess, setSelectedProcess] = useState(parts[0]);

  const {
    selectedPart, setSelectedPart, selectedProcess, setSelectedProcess
  } = useSearchStore();


  return (
    
    <aside>
      <h3>Parameters</h3>
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px'}}>
      {/* <div style={{ display: 'flex', flex-direction: 'column' }}> */}
        <GenericDropdown options={parts}
        selected={selectedPart}
        onChange={setSelectedPart}
        placeholder="Select a part"
        label="部位"
      />
      <GenericDropdown options={processes}
        selected={selectedProcess}
        onChange={setSelectedProcess}
        placeholder="Select a process"
        label="工程"
      />
      </div>
      {/* </div> */}
      <section className="group">
        <h4>Numeric Values</h4>
        {Object.entries(fixedFloatValues).map(([key, options]) => (
          <div className="input-group" key={key}>
            <label>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
            <select name={key} value={inputs[key]} onChange={handleChange}>
              {options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </section>
      <section className="group">
        <h4>String Values</h4>
        {Object.entries(fixedStringValues).map(([key, options]) => (
          <div className="input-group" key={key}>
            <label>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
            <select name={key} value={inputs[key]} onChange={handleChange}>
              {options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </section>

      <style jsx>{`
        aside {
          background:rgb(227, 227, 227);
          border-right: 1px solid #e0e0e0;
          padding: 20px;
          width: 280px;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
          height: 100vh;
        }
        h3 {
          margin-bottom: 20px;
          font-size: 1.2rem;
          color: #333;
        }
        .group {
          margin-bottom: 30px;
        }
        h4 {
          margin-bottom: 10px;
          font-size: 1rem;
          color: #555;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 15px;
        }
        label {
          font-size: 0.9rem;
          margin-bottom: 5px;
          color: #666;
        }
        select {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 0.9rem;
        }
      `}</style>
    </aside>

  );
}
