import prisma from '../../config/prisma.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { generateFlashcardContent } from '../../services/ai.service.js';

// ─── CATEGORIES ────────────────────────────────────────────────────────────────

// GET /admin/categories
export const listCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
    return sendSuccess(res, categories, 'Categories list');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// POST /admin/categories
export const createCategory = async (req, res) => {
  try {
    const { code, name, description, sortOrder } = req.body;
    if (!code || !name) return sendError(res, 'code and name are required', 400);

    const category = await prisma.category.create({
      data: { code: code.toUpperCase(), name, description, sortOrder: sortOrder || 0 },
    });
    return sendSuccess(res, category, 'Category created');
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, 'Category code already exists', 409);
    return sendError(res, error.message, 500);
  }
};

// PATCH /admin/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, sortOrder, isActive } = req.body;
    const data = {};
    if (name != null) data.name = name;
    if (description != null) data.description = description;
    if (sortOrder != null) data.sortOrder = parseInt(sortOrder);
    if (isActive != null) data.isActive = Boolean(isActive);

    const category = await prisma.category.update({ where: { id }, data });
    return sendSuccess(res, category, 'Category updated');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// DELETE /admin/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const topicCount = await prisma.vocabularyTopic.count({ where: { categoryCode: (await prisma.category.findUnique({where:{id}}))?.code } });
    if (topicCount > 0) {
      return sendError(res, `Cannot delete category with ${topicCount} topics. Remove all topics first.`, 400);
    }
    await prisma.category.delete({ where: { id } });
    return sendSuccess(res, null, 'Category deleted');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── TOPICS ────────────────────────────────────────────────────────────────────

// GET /admin/topics?page=1&search=&categoryCode=
export const listTopics = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', categoryCode = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) where.name = { contains: search };
    if (categoryCode) where.categoryCode = categoryCode;

    const [topics, total] = await Promise.all([
      prisma.vocabularyTopic.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { vocabularies: true } } },
      }),
      prisma.vocabularyTopic.count({ where }),
    ]);

    return sendSuccess(res, {
      topics,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
    }, 'Topics list');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// POST /admin/topics
export const createTopic = async (req, res) => {
  try {
    const { name, description, categoryCode, level, isPremium, thumbnailUrl } = req.body;
    if (!name || !categoryCode) return sendError(res, 'name and categoryCode are required', 400);

    const topic = await prisma.vocabularyTopic.create({
      data: {
        name,
        description,
        categoryCode: categoryCode.toUpperCase(),
        level: level || 'B1',
        isPremium: Boolean(isPremium),
        thumbnailUrl,
      },
    });
    return sendSuccess(res, topic, 'Topic created');
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, 'Topic name already exists', 409);
    return sendError(res, error.message, 500);
  }
};

// PATCH /admin/topics/:id
export const updateTopic = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, categoryCode, level, isPremium, thumbnailUrl } = req.body;
    const data = {};
    if (name != null) data.name = name;
    if (description != null) data.description = description;
    if (categoryCode != null) data.categoryCode = categoryCode.toUpperCase();
    if (level != null) data.level = level;
    if (isPremium != null) data.isPremium = Boolean(isPremium);
    if (thumbnailUrl != null) data.thumbnailUrl = thumbnailUrl;

    const topic = await prisma.vocabularyTopic.update({ where: { id }, data });
    return sendSuccess(res, topic, 'Topic updated');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// DELETE /admin/topics/:id — chỉ xóa được nếu không có từ nào
export const deleteTopic = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const vocabCount = await prisma.systemVocabulary.count({ where: { topicId: id } });
    if (vocabCount > 0) {
      return sendError(res, `Cannot delete topic with ${vocabCount} vocabularies. Remove all words first.`, 400);
    }
    await prisma.vocabularyTopic.delete({ where: { id } });
    return sendSuccess(res, null, 'Topic deleted');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── VOCABULARIES ──────────────────────────────────────────────────────────────

// GET /admin/topics/:topicId/vocabularies?page=&search=
export const listVocabularies = async (req, res) => {
  try {
    const topicId = parseInt(req.params.topicId);
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { topicId };
    if (search) where.word = { contains: search };

    const [vocabularies, total] = await Promise.all([
      prisma.systemVocabulary.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { word: 'asc' },
      }),
      prisma.systemVocabulary.count({ where }),
    ]);

    return sendSuccess(res, {
      vocabularies,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
    }, 'Vocabularies list');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// POST /admin/topics/:topicId/vocabularies
export const createVocabulary = async (req, res) => {
  try {
    const topicId = parseInt(req.params.topicId);
    const { word, type, phonetic, definitionText, vietnameseMeaning, exampleJson, categoryCode, level } = req.body;
    if (!word) return sendError(res, 'word is required', 400);

    // Lấy category từ topic nếu không truyền lên
    const topic = await prisma.vocabularyTopic.findUnique({ where: { id: topicId } });
    if (!topic) return sendError(res, 'Topic not found', 404);

    const vocab = await prisma.systemVocabulary.create({
      data: {
        topicId,
        word,
        type: type || 'noun',
        phonetic: phonetic || '',
        definitionText: definitionText || '',
        vietnameseMeaning: vietnameseMeaning || '',
        exampleJson: exampleJson || [],
        categoryCode: categoryCode || topic.categoryCode,
        level: level || topic.level,
      },
    });

    // Tăng wordCount của topic
    await prisma.vocabularyTopic.update({
      where: { id: topicId },
      data: { wordCount: { increment: 1 } },
    });

    return sendSuccess(res, vocab, 'Vocabulary created');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// POST /admin/topics/:topicId/vocabularies/ai-generate
// Admin truyền vào mảng các từ, AI sinh đồng loạt — không lưu vào DB ngay, chờ Admin review
export const aiGenerateVocabulary = async (req, res) => {
  try {
    const { words } = req.body;
    if (!words || !Array.isArray(words) || words.length === 0) {
      return sendError(res, 'words must be a non-empty array of strings', 400);
    }
    if (words.length > 30) {
      return sendError(res, 'Maximum 30 words per request', 400);
    }

    const cleanedWords = words.map(w => String(w).trim()).filter(Boolean);
    const aiResults = await generateFlashcardContent(cleanedWords);

    // Map thành dạng chuẩn để frontend hiển thị trong review table
    const formatted = Array.isArray(aiResults)
      ? aiResults.map(item => ({
          word: item.word || '',
          type: 'noun',
          phonetic: item.phonetic || '',
          definitionText: item.definition || '',
          vietnameseMeaning: item.meaning || '',
          exampleJson: item.examples || [],
        }))
      : [];

    return sendSuccess(res, formatted, `AI generated ${formatted.length} vocabulary items`);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// PATCH /admin/vocabularies/:id
export const updateVocabulary = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { word, type, phonetic, definitionText, vietnameseMeaning, exampleJson, level } = req.body;
    const data = {};
    if (word != null) data.word = word;
    if (type != null) data.type = type;
    if (phonetic != null) data.phonetic = phonetic;
    if (definitionText != null) data.definitionText = definitionText;
    if (vietnameseMeaning != null) data.vietnameseMeaning = vietnameseMeaning;
    if (exampleJson != null) data.exampleJson = exampleJson;
    if (level != null) data.level = level;

    const vocab = await prisma.systemVocabulary.update({ where: { id }, data });
    return sendSuccess(res, vocab, 'Vocabulary updated');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// POST /admin/topics/:topicId/vocabularies/bulk-save
// Lưu hàng loạt các từ Admin đã review từ kết quả AI
export const bulkSaveVocabularies = async (req, res) => {
  try {
    const topicId = parseInt(req.params.topicId);
    const { vocabularies } = req.body;

    if (!Array.isArray(vocabularies) || vocabularies.length === 0) {
      return sendError(res, 'vocabularies must be a non-empty array', 400);
    }

    const topic = await prisma.vocabularyTopic.findUnique({ where: { id: topicId } });
    if (!topic) return sendError(res, 'Topic not found', 404);

    const created = await prisma.systemVocabulary.createMany({
      data: vocabularies.map(v => ({
        topicId,
        word: v.word,
        type: v.type || 'noun',
        phonetic: v.phonetic || '',
        definitionText: v.definitionText || '',
        vietnameseMeaning: v.vietnameseMeaning || '',
        exampleJson: v.exampleJson || [],
        categoryCode: v.categoryCode || topic.categoryCode,
        level: v.level || topic.level,
      })),
      skipDuplicates: true,
    });

    // Cập nhật wordCount
    await prisma.vocabularyTopic.update({
      where: { id: topicId },
      data: { wordCount: { increment: created.count } },
    });

    return sendSuccess(res, { savedCount: created.count }, `Saved ${created.count} vocabularies`);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// DELETE /admin/vocabularies/:id
export const deleteVocabulary = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const vocab = await prisma.systemVocabulary.findUnique({ where: { id } });
    if (!vocab) return sendError(res, 'Vocabulary not found', 404);

    await prisma.systemVocabulary.delete({ where: { id } });

    if (vocab.topicId) {
      await prisma.vocabularyTopic.update({
        where: { id: vocab.topicId },
        data: { wordCount: { decrement: 1 } },
      });
    }

    return sendSuccess(res, null, 'Vocabulary deleted');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
