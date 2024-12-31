from pymilvus import (
    connections,
    FieldSchema,
    CollectionSchema,
    DataType,
    Collection
)
import random
import string

# -----------------------------
# 1. Connect to Milvus
# -----------------------------
connections.connect(
    alias="default", 
    host="localhost",  # Adjust if you're running Milvus elsewhere
    port="19530"
)

# -----------------------------
# 2. Define the Collection Schema
# -----------------------------
collection_name = "words_collection"

# Field: 'id' as primary key (auto_id means Milvus will auto-generate it).
id_field = FieldSchema(
    name="id",
    dtype=DataType.INT64,
    is_primary=True,
    auto_id=True
)

# Field: 'word', storing random strings (up to length 255).
word_field = FieldSchema(
    name="word",
    dtype=DataType.VARCHAR,
    max_length=255,
    is_primary=False
)

# Field: 'vector', a float vector of dimension 128.
vector_field = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=128
)

# Construct the schema
schema = CollectionSchema(
    fields=[id_field, word_field, vector_field],
    description="A collection storing random words and vectors"
)

# Create or load the collection
try:
    # If it doesn't exist, this will create it
    collection = Collection(name=collection_name, schema=schema)
except:
    # If already exists with the same schema, we can just load it
    collection = Collection(name=collection_name)
    pass

# -----------------------------
# 3. Create an Index (optional, but usually recommended)
# -----------------------------
index_params = {
    "index_type": "IVF_FLAT",  # or "HNSW", "IVF_SQ8", etc.
    "metric_type": "L2",      # or "COSINE", etc.
    "params": {"nlist": 128}  # # of centroids for IVF
}

try:
    collection.create_index(field_name="vector", index_params=index_params)
except Exception as e:
    print("Index creation failed or already exists:", e)

# -----------------------------
# 4. Generate Synthetic Data
# -----------------------------
num_docs = 10  # how many records to insert
words = []
vectors = []

for _ in range(num_docs):
    # Make a random 5-letter word
    random_word = ''.join(random.choice(string.ascii_lowercase) for _ in range(5))
    # Generate a 128-dim random vector
    random_vector = [random.random() for _ in range(128)]
    
    words.append(random_word)
    vectors.append(random_vector)

# PyMilvus expects data as a list of columns,
# in the same order as fields (except auto_id fields).
entities = [
    words,    # for field: "word"
    vectors,  # for field: "vector"
]

# -----------------------------
# 5. Insert & Load
# -----------------------------
insert_result = collection.insert(entities)
print(f"Inserted {len(insert_result.primary_keys)} rows into '{collection_name}'.")

# Optional: load the collection into memory for searching
collection.load()

print("Collection loaded. You can now query or search this synthetic data in Milvus!")
