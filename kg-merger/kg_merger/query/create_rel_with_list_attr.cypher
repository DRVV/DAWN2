// Load the CSV file
LOAD CSV WITH HEADERS FROM 'file:///edges.csv' AS row

// Convert identifiers and extract data
WITH row,
     row.Source AS sourceId,
     row.Target AS targetId,
     row.Label AS labelProperty,
     // row.ItemName AS itemNameStr,
     row.Ref AS refStr,
     row.Provider AS providerStr

// Match existing Source and Target nodes
MATCH (sourceNode {id: sourceId})
MATCH (targetNode {id: targetId})

// Prepare list properties, handling empty or null values
WITH sourceNode, targetNode, labelProperty,
    //  CASE WHEN itemNameStr IS NULL OR trim(itemNameStr) = '' THEN []
    //       ELSE split(itemNameStr, '___') END AS itemNameList,
     CASE WHEN refStr IS NULL OR trim(refStr) = '' THEN []
          ELSE split(refStr, '___') END AS refList,
     CASE WHEN providerStr IS NULL OR trim(providerStr) = '' THEN []
          ELSE split(providerStr, '___') END AS providerList

// Create relationships of type :related and set properties
CREATE (sourceNode)-[rel:related]->(targetNode)
SET rel.Label = labelProperty,
    // rel.ItemName = itemNameList,
    rel.Ref = refList,
    rel.Provider = providerList

RETURN count(rel) AS relationshipsCreated
