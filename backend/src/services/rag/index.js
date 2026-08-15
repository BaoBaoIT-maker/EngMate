import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadMarkdownDocuments } from './documentLoader.js';
import { splitMarkdownDocuments } from './markdownSplitter.js';
import { ingestChunksToQdrant, getQdrantVectorStore } from './vectorStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn trỏ tới thư mục chứa dữ liệu Markdown
const KNOWLEDGE_BASE_DIR = path.resolve(__dirname, '../../data/rag_knowledge');

/**
 * Chạy full pipeline: Load → Split → Embed → Lưu lên Qdrant
 * Chỉ cần chạy 1 lần (hoặc khi có cập nhật dữ liệu Markdown)
 */
export async function ingestAllDocuments() {
  console.log('--- BẮT ĐẦU INGEST PIPELINE ---');

  // Bước 1: Load dữ liệu & Parse Frontmatter
  console.log(`\n[1] Loading documents from: ${KNOWLEDGE_BASE_DIR}`);
  const rawDocs = loadMarkdownDocuments(KNOWLEDGE_BASE_DIR);
  console.log(`=> Đã load được ${rawDocs.length} file markdown hợp lệ.`);

  // Bước 2: Tách thành các Chunk
  console.log('\n[2] Bắt đầu cắt (Chunking) bằng MarkdownTextSplitter...');
  const chunks = await splitMarkdownDocuments(rawDocs);
  console.log(`=> Đã cắt thành công ra ${chunks.length} chunks.`);

  // Bước 3: Embed và đẩy lên Qdrant Cloud
  console.log('\n[3] Đang embed và ingest lên Qdrant Cloud...');
  await ingestChunksToQdrant(chunks);
  console.log(`\n✅ INGEST HOÀN TẤT! ${chunks.length} chunks đã được lưu vào Qdrant.`);
}

/**
 * Test thử tìm kiếm ngữ nghĩa (Semantic Search) sau khi ingest
 */
async function testSemanticSearch(query = 'Gói Premium có những quyền lợi gì?') {
  console.log(`\n--- TEST SEMANTIC SEARCH ---`);
  console.log(`Query: "${query}"`);

  const vectorStore = await getQdrantVectorStore();
  const results = await vectorStore.similaritySearch(query, 3); // Lấy top 3 kết quả liên quan

  console.log(`\n=> Tìm được ${results.length} đoạn liên quan nhất:`);
  results.forEach((doc, i) => {
    console.log(`\n[${i + 1}] Category: ${doc.metadata.category} | Source: ${path.basename(doc.metadata.source)}`);
    console.log(`    Nội dung: ${doc.pageContent.substring(0, 150)}...`);
  });
}

// Chạy khi được gọi trực tiếp bằng: node src/services/rag/index.js [ingest|search]
if (process.argv[1] === __filename) {
  const command = process.argv[2] || 'ingest';

  if (command === 'ingest') {
    ingestAllDocuments().catch(console.error);
  } else if (command === 'search') {
    const query = process.argv[3] || 'Gói Premium có những quyền lợi gì?';
    testSemanticSearch(query).catch(console.error);
  }
}

