import { GoogleGenerativeAI } from '@google/generative-ai';

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Pool model theo thứ tự ưu tiên khi Google gặp tải cao (503 Service Unavailable / 429 Rate Limit)
export const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
];

export const getModelList = () => {
  const envModel = process.env.GEMINI_MODEL;
  const preferredModel =
    envModel && !envModel.includes('2.5-flash') && !envModel.includes('3.6-flash')
      ? envModel
      : null;

  return preferredModel
    ? [preferredModel, ...CANDIDATE_MODELS.filter((m) => m !== preferredModel)]
    : CANDIDATE_MODELS;
};

/**
 * Gọi generateContent với cơ chế tự động chuyển model dự phòng (Failover Strategy)
 */
export const generateContentWithFailover = async ({ prompt, contents, systemInstruction, tools }) => {
  const modelList = getModelList();
  let lastError = null;

  for (const modelName of modelList) {
    try {
      const modelOptions = { model: modelName };
      if (systemInstruction) modelOptions.systemInstruction = systemInstruction;
      if (tools) modelOptions.tools = tools;

      const model = genAI.getGenerativeModel(modelOptions);
      const payload = contents !== undefined ? { contents } : prompt;
      const result = await model.generateContent(payload);
      return { result, modelName };
    } catch (err) {
      console.warn(
        `[GeminiClient] Model ${modelName} lỗi (${err.status || err.message}). Thử model tiếp theo...`
      );
      lastError = err;
      if (err.status === 503 || err.status === 429 || err.status === 404 || err.status === 500) {
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
export const generateContentStreamWithFailover = async ({ contents, systemInstruction }) => {
  const modelList = getModelList();
  let lastError = null;

  for (const modelName of modelList) {
    try {
      const modelOptions = { model: modelName };
      if (systemInstruction) modelOptions.systemInstruction = systemInstruction;

      const model = genAI.getGenerativeModel(modelOptions);
      const resultStream = await model.generateContentStream({ contents });
      return { resultStream, modelName };
    } catch (err) {
      console.warn(
        `[GeminiClient] Stream model ${modelName} lỗi (${err.status || err.message}). Thử model tiếp theo...`
      );
      lastError = err;
      if (err.status === 503 || err.status === 429 || err.status === 404 || err.status === 500) {
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
