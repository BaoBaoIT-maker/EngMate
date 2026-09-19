import { getQdrantVectorStore } from '../vectorStore.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KNOWLEDGE_DIR = path.resolve(__dirname, '../../../data/rag_knowledge');

/**
 * Tìm kiếm cục bộ trong các file Markdown khi vector store không kết nối được
 */
function searchLocalKnowledge(query, maxResults = 3) {
  try {
    if (!fs.existsSync(KNOWLEDGE_DIR)) return null;

    const files = [];
    const walk = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.isFile() && entry.name.endsWith('.md')) files.push(full);
      }
    };
    walk(KNOWLEDGE_DIR);

    const queryTokens = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 1);

    const scoredDocs = [];
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lower = content.toLowerCase();
      let score = 0;
      for (const token of queryTokens) {
        if (lower.includes(token)) score += 1;
      }
      if (score > 0) {
        const relPath = path.relative(KNOWLEDGE_DIR, filePath);
        scoredDocs.push({
          relPath,
          content: content.slice(0, 1600),
          score,
        });
      }
    }

    scoredDocs.sort((a, b) => b.score - a.score);
    const top = scoredDocs.slice(0, maxResults);
    if (top.length === 0) return null;

    return top
      .map((doc, i) => `[Tài liệu ${i + 1}] (${doc.relPath}):\n${doc.content}`)
      .join('\n\n---\n\n');
  } catch (err) {
    console.error('[searchLocalKnowledge] Fallback error:', err.message);
    return null;
  }
}

/**
 * Tool 1: Tìm kiếm thông tin tĩnh trong Knowledge Base (RAG)
 */
export const searchKnowledgeBaseTool = {
  name: 'search_knowledge_base',
  description: `Tìm kiếm thông tin trong tài liệu hướng dẫn EngMate. 
Gọi tool này khi user hỏi về: cách sử dụng tính năng (Flashcard, AI Coach, Mini-games), 
bảng giá các gói cước, chính sách thanh toán hoặc hoàn tiền, xử lý lỗi kỹ thuật (đăng nhập, micro), 
thông tin chung về EngMate, phương pháp học Spaced Repetition, thời gian hỗ trợ CSKH.
KHÔNG gọi tool này cho các câu hỏi về dữ liệu cá nhân của user.`,

  /**
   * @param {string} query - Câu truy vấn để tìm kiếm
   * @returns {Promise<string>} Các đoạn văn bản liên quan nhất
   */
  execute: async (query) => {
    // 1. Ưu tiên tìm kiếm từ Qdrant Vector Store
    try {
      const vectorStore = await getQdrantVectorStore();
      const results = await vectorStore.similaritySearch(query, 4);

      if (results && results.length > 0) {
        return results
          .map((doc, i) => `[Tài liệu ${i + 1}] (${doc.metadata.category}):\n${doc.pageContent}`)
          .join('\n\n---\n\n');
      }
    } catch (err) {
      console.warn('[searchKnowledgeBaseTool] Qdrant unavailable, falling back to local files:', err.message);
    }

    // 2. Dự phòng: Tìm kiếm trực tiếp trong kho tài liệu Markdown cục bộ
    const localResults = searchLocalKnowledge(query);
    if (localResults) {
      return localResults;
    }

    return 'Không tìm thấy thông tin liên quan trong tài liệu hướng dẫn.';
  }
};
