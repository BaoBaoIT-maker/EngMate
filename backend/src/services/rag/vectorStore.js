import 'dotenv/config';
import { QdrantVectorStore } from '@langchain/qdrant';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

/**
 * Tạo instance Embedding Model dùng Gemini text-embedding-004
 * Đây là model free và có chất lượng tốt để chuyển text → vector số
 */
function createEmbeddingModel() {
  return new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-embedding-001', // 3072 dimensions, chất lượng cao
  });
}

export async function ingestChunksToQdrant(chunks) {
  const embeddings = createEmbeddingModel();

  console.log(`=> Đang embed ${chunks.length} chunks và đẩy lên Qdrant Cloud...`);
  console.log(`=> Collection: "${process.env.QDRANT_COLLECTION_NAME}"`);

  const vectorStore = await QdrantVectorStore.fromDocuments(chunks, embeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: process.env.QDRANT_COLLECTION_NAME,
  });

  return vectorStore;
}

/**
 * Kết nối tới collection Qdrant đã tồn tại (dùng để search, không ingest lại)
 * @returns {Promise<QdrantVectorStore>}
 */
export async function getQdrantVectorStore() {
  const embeddings = createEmbeddingModel();

  return new QdrantVectorStore(embeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: process.env.QDRANT_COLLECTION_NAME,
  });
}
