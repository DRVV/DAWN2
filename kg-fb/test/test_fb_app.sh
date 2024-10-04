#!/bin/bash

# test_feedback_app.sh
# Script to test sending graph data to the Feedback app and opening the app

# Configuration
FEEDBACK_APP_API_URL="http://localhost:3000/api/graph"
FEEDBACK_APP_FRONTEND_URL="http://localhost:3000"

# Sample graph data in JSON format
GRAPH_DATA=$(cat <<EOF
{
  "nodes": [
    { "id": 1, "label": "CEO" },
    { "id": 2, "label": "CTO" },
    { "id": 3, "label": "CFO" },
    { "id": 4, "label": "Engineering Manager" },
    { "id": 5, "label": "Finance Manager" },
    { "id": 6, "label": "Software Engineer" },
    { "id": 7, "label": "Accountant" }
  ],
  "edges": [
    { "from": 1, "to": 2 },
    { "from": 1, "to": 3 },
    { "from": 2, "to": 4 },
    { "from": 4, "to": 6 },
    { "from": 3, "to": 5 },
    { "from": 5, "to": 7 }
  ]
}
EOF
)

# Function to send POST request with graph data
send_graph_data() {
  echo "Sending graph data to Feedback app API..."

  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$FEEDBACK_APP_API_URL" \
    -H "Content-Type: application/json" \
    -d "$GRAPH_DATA")

  if [ "$RESPONSE" -eq 201 ]; then
    echo "Graph data submitted successfully."
  else
    echo "Failed to submit graph data. HTTP Status: $RESPONSE"
    exit 1
  fi
}

# Function to open the Feedback app frontend in a new browser window
open_feedback_app() {
  echo "Opening Feedback app in a new browser window..."

  # Detect the operating system
  OS=$(uname)

  if [ "$OS" = "Darwin" ]; then
    # macOS
    open "$FEEDBACK_APP_FRONTEND_URL"
  elif [ "$OS" = "Linux" ]; then
    # Linux
    xdg-open "$FEEDBACK_APP_FRONTEND_URL"
  elif [[ "$OS" == MINGW* || "$OS" == MSYS* ]]; then
    # Windows (Git Bash)
    start "" "$FEEDBACK_APP_FRONTEND_URL"
  else
    echo "Please manually open your browser and navigate to $FEEDBACK_APP_FRONTEND_URL"
  fi
}

# Execute the functions
send_graph_data
open_feedback_app

echo "Test completed."
