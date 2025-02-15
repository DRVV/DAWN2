// Autocomplete.jsx
import React, { useEffect, useRef, useState } from "react";

// Helper to highlight matching substring
function highlightMatchingText(text, query) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} style={{ backgroundColor: "#fffa65" }}>
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

/**
 * Controlled Autocomplete component
 * Props:
 * - data: array of {id, name} to suggest
 * - value: string (current cell text)
 * - onChange: function(newValue) => void
 */
function Autocomplete({ data = [], value = "", onChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const containerRef = useRef(null);

  // Filter suggestions based on current value
  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
    } else {
      const filtered = data.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setActiveSuggestionIndex(-1);
    }
  }, [value, data]);

  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSuggestions([]);
        setActiveSuggestionIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectSuggestion = (selectedValue) => {
    if (onChange) {
      onChange(selectedValue);
    }
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveSuggestionIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          return nextIndex >= suggestions.length ? suggestions.length - 1 : nextIndex;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveSuggestionIndex((prevIndex) => {
          const nextIndex = prevIndex - 1;
          return nextIndex < 0 ? 0 : nextIndex;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
          const selectedItem = suggestions[activeSuggestionIndex];
          handleSelectSuggestion(selectedItem.name);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ width: "100%", boxSizing: "border-box", padding: "4px" }}
      />
      {suggestions.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            border: "1px solid #ccc",
            position: "absolute",
            width: "100%",
            backgroundColor: "#fff",
            zIndex: 100,
          }}
        >
          {suggestions.map((item, index) => (
            <li
              key={item.id}
              onClick={() => handleSelectSuggestion(item.name)}
              style={{
                padding: "4px 8px",
                cursor: "pointer",
                backgroundColor: index === activeSuggestionIndex ? "#eee" : "#fff",
              }}
            >
              {highlightMatchingText(item.name, value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Autocomplete;
