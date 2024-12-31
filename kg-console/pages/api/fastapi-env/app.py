from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymilvus import connections, Collection
import numpy as np

app = FastAPI()

# Enable CORS
origins = ["http://localhost:3000"]
# origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Add your frontend's origin here
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)



# Connect to Milvus
connections.connect("default", host="127.0.0.1", port="19530")

@app.get("/test")
def test():
    return {"message": "CORS is working"}


@app.get("/cosine-similarities")
def get_cosine_similarities(collection_name: str):
    # Load collection
    collection = Collection(collection_name)
    embeddings = collection.query(expr='', output_fields=['word', "vector"], limit=100)

    # Extract embeddings
    vectors = np.array([item['vector'] for item in embeddings])

    # Calculate cosine similarity
    def cosine_similarity(v1, v2):
        return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

    word_pairs = []
    for i in range(len(vectors)):
        for j in range(i + 1, len(vectors)):
            similarity = cosine_similarity(vectors[i], vectors[j])
            word_pairs.append({
                "word1": embeddings[i]["word"],
                "word2": embeddings[j]["word"],
                "similarity": float(similarity)
            })


    print(word_pairs)

    return word_pairs
