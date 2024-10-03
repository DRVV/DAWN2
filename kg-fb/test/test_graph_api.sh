#!/bin/bash

# test_feedback_api.sh
# Script to test the Feedback App's graph API endpoints

# Base URL of the Feedback App API
BASE_URL="http://localhost:3000/api/graph"

# Sample graph data to be sent (simulate data from another app)
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

# Function to perform a POST request to submit graph data
test_post_graph() {
  echo "===== POST /api/graph ====="
  
  RESPONSE=$(curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "$GRAPH_DATA" \
    -w "\nHTTP_STATUS:%{http_code}")

  echo "$RESPONSE"
  
  # Extract HTTP status code
  HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
  
  if [ "$HTTP_STATUS" -eq 201 ] || [ "$HTTP_STATUS" -eq 200 ]; then
    echo "POST Request Successful. HTTP Status: $HTTP_STATUS"
  else
    echo "POST Request Failed. HTTP Status: $HTTP_STATUS"
    exit 1
  fi
  
  echo ""
}

# Function to perform a GET request to retrieve graph data
test_get_graph() {
  echo "===== GET /api/graph ====="
  
  RESPONSE=$(curl -s -X GET "$BASE_URL" \
    -H "Content-Type: application/json" \
    -w "\nHTTP_STATUS:%{http_code}")
  
  echo "$RESPONSE"
  
  # Extract HTTP status code
  HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
  
  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "GET Request Successful. HTTP Status: $HTTP_STATUS"
    # Extract JSON body by removing the status line
    JSON_BODY=$(echo "$RESPONSE" | sed '$d')
    
    # Optional: Compare the sent and received data
    # For simplicity, we'll just print the received data
    echo "Received Graph Data:"
    echo "$JSON_BODY"
  else
    echo "GET Request Failed. HTTP Status: $HTTP_STATUS"
    exit 1
  fi
  
  echo ""
}

# Function to perform a DELETE request to clear graph data (if supported)
test_delete_graph() {
  echo "===== DELETE /api/graph ====="
  
  RESPONSE=$(curl -s -X DELETE "$BASE_URL" \
    -H "Content-Type: application/json" \
    -w "\nHTTP_STATUS:%{http_code}")
  
  echo "$RESPONSE"
  
  # Extract HTTP status code
  HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
  
  if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 204 ]; then
    echo "DELETE Request Successful. HTTP Status: $HTTP_STATUS"
  else
    echo "DELETE Request Failed. HTTP Status: $HTTP_STATUS"
    exit 1
  fi
  
  echo ""
}

# Execute the test functions
echo "Starting API Tests for Feedback App's /api/graph...\n"

# 1. Test GET request before POST to ensure initial state
echo "1. Testing GET request before POST..."
test_get_graph

# 2. Test POST request to submit graph data
echo "2. Testing POST request to submit graph data..."
test_post_graph

# 3. Test GET request after POST to verify data submission
echo "3. Testing GET request after POST..."
test_get_graph

# 4. (Optional) Test DELETE request to clear graph data
# Uncomment the following lines if your API supports DELETE operations
# echo "4. Testing DELETE request to clear graph data..."
# test_delete_graph

# 5. Test GET request after DELETE to ensure data is cleared
# Uncomment the following lines if you performed a DELETE request
# echo "5. Testing GET request after DELETE..."
# test_get_graph

echo "API Tests Completed."
