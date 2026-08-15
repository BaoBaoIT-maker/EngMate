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

/**
 * Đẩy các chunks đã cắt nhỏ lên Qdrant Cloud
 * Hàm này sẽ:
 *   1. Lấy text từ từng chunk
 *   2. Gọi Gemini Embedding API để chuyển text → vector số
 *   3. Lưu vector + metadata vào Qdrant Cloud Collection
 *
 * @param {Array<any>} chunks Mảng các Document (Langchain format) từ markdownSplitter
 * @returns {Promise<QdrantVectorStore>} Instance VectorStore đã được populated
 */
export async function ingestChunksToQdrant(chunks) {
  const embeddings = createEmbeddingModel();

  console.log(`=> Đang embed ${chunks.length} chunks và đẩy lên Qdrant Cloud...`);
  console.log(`=> Collection: "${process.env.QDRANT_COLLECTION_NAME}"`);

  // QdrantVectorStore.fromDocuments sẽ tự động:
  // - Tạo collection nếu chưa tồn tại
  // - Gọi Embedding API cho từng chunk
  // - Lưu vector + metadata lên Qdrant Cloud
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
