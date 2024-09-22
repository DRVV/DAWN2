MATCH ()-[r:related]->()
WHERE
  (
    r.Provider IN ['Provider2', 'Provider3']
    OR (r.Provider IS NOT NULL AND ANY(provider IN r.Provider WHERE provider IN ['Provider2', 'Provider3']))
  )
WITH collect(r) AS relationships
UNWIND relationships AS r
WITH DISTINCT r
MATCH (n)-[r]->(m)
RETURN n, r, m
