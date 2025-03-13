import { useState } from 'react';

export default function SearchArea() {
  const [searchText, setSearchText] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [tabs, setTabs] = useState([]); // Array of tab objects: { title, content }
  const [activeTab, setActiveTab] = useState(0);

  // Fixed candidate list for demonstration purposes
  const candidateList = [
    "Candidate 1",
    "Candidate 2",
    "Candidate 3",
    "Test Candidate",
    "Another Candidate"
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value.trim() === '') {
      setFilteredCandidates([]);
    } else {
      const filtered = candidateList.filter(candidate =>
        candidate.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCandidates(filtered);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  const triggerSearch = () => {
    // Simulate search by creating placeholder tabs.
    setTabs([
      { title: "Tab 1", content: "Placeholder content for Tab 1" },
      { title: "Tab 2", content: "Placeholder content for Tab 2" },
      { title: "Tab 3", content: "Placeholder content for Tab 3" },
      { title: "Tab 4", content: "Placeholder content for Tab 4" }
    ]);
    setActiveTab(0);
  };

  const handleCandidateClick = (candidate) => {
    setSearchText(candidate);
    setFilteredCandidates([]);
  };

  return (
    <div className="search-area">
      <div className="search-input">
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
        />
        <button onClick={triggerSearch}>Search</button>
      </div>

      {filteredCandidates.length > 0 && (
        <ul className="suggestions">
          {filteredCandidates.map(candidate => (
            <li key={candidate} onClick={() => handleCandidateClick(candidate)}>
              {candidate}
            </li>
          ))}
        </ul>
      )}

      {tabs.length > 0 && (
        <div className="tabs-container">
          <div className="tabs-header">
            {tabs.map((tab, index) => (
              <div
                key={index}
                className={`tab-header ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {tab.title}
              </div>
            ))}
          </div>
          <div className="tab-content">
            {tabs[activeTab].content}
          </div>
        </div>
      )}

      <style jsx>{`
        .search-area {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .search-input {
          display: flex;
          align-items: center;
        }
        input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
        }
        button {
          margin-left: 10px;
          padding: 10px 20px;
          border: none;
          background-color: #0070f3;
          color: white;
          font-size: 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        button:hover {
          background-color: #005bb5;
        }
        .suggestions {
          margin-top: 10px;
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          list-style: none;
          padding: 0;
          max-height: 150px;
          overflow-y: auto;
        }
        .suggestions li {
          padding: 10px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .suggestions li:hover {
          background: #f0f0f0;
        }
        .tabs-container {
          margin-top: 20px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }
        .tabs-header {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
        }
        .tab-header {
          flex: 1;
          padding: 10px;
          text-align: center;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .tab-header:hover {
          background-color: #f5f5f5;
        }
        .tab-header.active {
          border-bottom: 2px solid #0070f3;
          font-weight: bold;
          background: #fff;
        }
        .tab-content {
          padding: 20px;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
}
