from pymilvus import connections, list_collections

def test_milvus_connection(host="127.0.0.1", port="19530"):
    try:
        # Connect to Milvus
        connections.connect("default", host=host, port=port)
        
        # Verify the connection
        print(f"Successfully connected to Milvus at {host}:{port}")
        
        # List all collections to ensure Milvus is operational
        collections = list_collections()
        if collections:
            print("Collections in Milvus:", collections)
        else:
            print("No collections found in Milvus.")
    except Exception as e:
        print("Error while connecting to Milvus:", e)
    finally:
        # Disconnect from Milvus
        connections.disconnect("default")

if __name__ == "__main__":
    test_milvus_connection()
