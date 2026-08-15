import { getQdrantVectorStore } from '../vectorStore.js';

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
    const vectorStore = await getQdrantVectorStore();
    const results = await vectorStore.similaritySearch(query, 4);

    if (!results || results.length === 0) {
      return 'Không tìm thấy thông tin liên quan trong tài liệu hướng dẫn.';
    }

    return results
      .map((doc, i) => `[Tài liệu ${i + 1}] (${doc.metadata.category}):\n${doc.pageContent}`)
      .join('\n\n---\n\n');
  }
};
