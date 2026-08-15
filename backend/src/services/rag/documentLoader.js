import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Đọc đệ quy tất cả các file .md trong một thư mục
 * @param {string} dir Đường dẫn thư mục
 * @param {string[]} fileList Danh sách file tích lũy
 * @returns {string[]}
 */
function getFilesRecursively(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Load và bóc tách metadata (YAML Frontmatter) từ các file Markdown
 * @param {string} dataDir Thư mục chứa data RAG
 * @returns {Array<{content: string, metadata: object}>}
 */
export function loadMarkdownDocuments(dataDir) {
  if (!fs.existsSync(dataDir)) {
    throw new Error(`Data directory not found: ${dataDir}`);
  }

  const files = getFilesRecursively(dataDir);
  const documents = [];

  for (const filePath of files) {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    
    // Dùng gray-matter để tách frontmatter ra khỏi nội dung markdown
    const parsed = matter(rawContent);
    
    // Lưu ý: parsed.data chứa phần metadata YAML, parsed.content chứa phần text Markdown
    const docMetadata = {
      ...parsed.data,
      source: filePath // Giữ lại đường dẫn file để truy vết
    };

    // Chỉ lấy những file có nội dung
    if (parsed.content && parsed.content.trim() !== '') {
      documents.push({
        content: parsed.content,
        metadata: docMetadata
      });
    }
  }

  return documents;
}
