MATCH (n)-[r:related]->(m)
WHERE
  (
    r.Provider = 'Provider2' OR
    r.Provider = 'Provider3' OR
    (r.Provider IS NOT NULL AND ANY(provider IN r.Provider WHERE provider IN ['Provider2', 'Provider3']))
  )
RETURN n, r, m
