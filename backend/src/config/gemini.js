import { GoogleGenerativeAI } from '@google/generative-ai';

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Pool model siêu tốc đã kiểm chứng qua benchmark thực tế (thời gian phản hồi 1.3s - 2.0s)
export const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
];

export const getModelList = () => {
  const envModel = process.env.GEMINI_MODEL;
  const isExcluded =
    !envModel ||
    envModel === 'gemini-flash-latest' ||
    envModel.includes('2.5-flash') ||
    envModel.includes('3.6-flash') ||
    envModel.includes('1.5-flash') ||
    envModel.includes('2.0-flash');

  const preferredModel = !isExcluded ? envModel : null;

  return preferredModel
    ? [preferredModel, ...CANDIDATE_MODELS.filter((m) => m !== preferredModel)]
    : CANDIDATE_MODELS;
};

// ponytail: Helper timeout ngắn gọn để ngắt kết nối ngay lập tức nếu model bị treo
const withTimeout = (promise, ms = 4500) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout sau ${ms}ms`)), ms)),
  ]);

/**
 * Gọi generateContent với cơ chế tự động chuyển model dự phòng (Failover Strategy)
 */
export const generateContentWithFailover = async ({
  prompt,
  contents,
  systemInstruction,
  tools,
  generationConfig,
  timeoutMs = 4500,
}) => {
  const modelList = getModelList();
  let lastError = null;

  for (const modelName of modelList) {
    try {
      const modelOptions = { model: modelName };
      if (systemInstruction) modelOptions.systemInstruction = systemInstruction;
      if (tools) modelOptions.tools = tools;
      if (generationConfig) modelOptions.generationConfig = generationConfig;

      const model = genAI.getGenerativeModel(modelOptions);
      const payload = contents !== undefined ? { contents } : prompt;
      const result = await withTimeout(model.generateContent(payload), timeoutMs);
      return { result, modelName };
    } catch (err) {
      console.warn(
        `[GeminiClient] Model ${modelName} lỗi (${err.status || err.message}). Thử model tiếp theo...`
      );
      lastError = err;
      if (
        err.status === 503 ||
        err.status === 429 ||
        err.status === 404 ||
        err.status === 500 ||
        (err.message && err.message.includes('Timeout'))
      ) {
        continue;
      }
      throw err;
    }
  }

  throw new Error(
    `Tất cả các mô hình AI đều đang bận, vui lòng thử lại sau: ${lastError?.message || ''}`
  );
};

/**
 * Gọi generateContentStream với cơ chế tự động chuyển model dự phòng cho các tác vụ streaming SSE
 */
export const generateContentStreamWithFailover = async ({
  contents,
  systemInstruction,
  generationConfig,
  timeoutMs = 4500,
}) => {
  const modelList = getModelList();
  let lastError = null;

  for (const modelName of modelList) {
    try {
      const modelOptions = { model: modelName };
      if (systemInstruction) modelOptions.systemInstruction = systemInstruction;
      if (generationConfig) modelOptions.generationConfig = generationConfig;

      const model = genAI.getGenerativeModel(modelOptions);
      const resultStream = await withTimeout(
        model.generateContentStream({ contents }),
        timeoutMs
      );
      return { resultStream, modelName };
    } catch (err) {
      console.warn(
        `[GeminiClient] Stream model ${modelName} lỗi (${err.status || err.message}). Thử model tiếp theo...`
      );
      lastError = err;
      if (
        err.status === 503 ||
        err.status === 429 ||
        err.status === 404 ||
        err.status === 500 ||
        (err.message && err.message.includes('Timeout'))
      ) {
        continue;
      }
      throw err;
    }
  }

  throw new Error(
    `Tất cả các mô hình AI đều đang bận, vui lòng thử lại sau: ${lastError?.message || ''}`
  );
};

export default genAI;
