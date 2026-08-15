import { MarkdownTextSplitter } from '@langchain/textsplitters';

/**
 * Cắt nhỏ (chunk) nội dung Markdown
 * @param {Array<{content: string, metadata: object}>} documents Mảng các document từ Loader
 * @returns {Array<any>} Mảng các chunk (Document của Langchain) đã được cắt và gộp metadata
 */
export async function splitMarkdownDocuments(documents) {
  // Dùng MarkdownTextSplitter vì MarkdownHeaderTextSplitter hiện chưa support native tốt trên JS
  const markdownSplitter = new MarkdownTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  let allSplits = [];

  for (const doc of documents) {
    // markdownSplitter.createDocuments trả về một mảng các Document (Langchain format)
    // Truyền metadata gốc vào để langchain tự động gán cho tất cả các chunk sinh ra từ file này
    const splits = await markdownSplitter.createDocuments([doc.content], [doc.metadata]);
    allSplits.push(...splits);
  }

  return allSplits;
}
