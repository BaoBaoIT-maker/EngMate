import * as flashcardService from '../services/flashcard.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getTopics = async (req, res) => {
  try {
    const topics = await flashcardService.getTopics(req.user.id);
    return sendSuccess(res, topics, 'Topics loaded successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getSession = async (req, res) => {
  try {
    const sessionCards = await flashcardService.getFlashcardSession(req.user.id, req.query);
    return sendSuccess(res, sessionCards, 'Session loaded');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const getLearnedWords = async (req, res) => {
  try {
    const words = await flashcardService.getLearnedWords(req.user.id, req.query);
    return sendSuccess(res, words, 'Learned words loaded');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const reviewFlashcard = async (req, res) => {
  try {
    const flashcardId = parseInt(req.params.id);
    const { quality } = req.body;

    if (isNaN(flashcardId) || quality === undefined) {
      return sendError(res, 'Invalid request data', 400);
    }

    const result = await flashcardService.reviewFlashcard(req.user.id, flashcardId, quality);
    return sendSuccess(res, result, 'Review logged successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createCustom = async (req, res) => {
  try {
    const { word, meaning } = req.body;
    if (!word || !meaning) {
      return sendError(res, 'Từ vựng và Nghĩa là bắt buộc', 400);
    }

    const fc = await flashcardService.createCustomFlashcard(req.user.id, req.body);
    return sendSuccess(res, fc, 'Đã thêm từ vựng thành công');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const updateCustom = async (req, res) => {
  try {
    const flashcardId = parseInt(req.params.id);
    if (isNaN(flashcardId)) return sendError(res, 'ID không hợp lệ', 400);

    const { word, meaning } = req.body;
    if (!word || !meaning) {
      return sendError(res, 'Từ vựng và Nghĩa là bắt buộc', 400);
    }

    const updated = await flashcardService.updateCustomFlashcard(req.user.id, flashcardId, req.body);
    return sendSuccess(res, updated, 'Đã cập nhật từ vựng thành công');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const deleteFlashcard = async (req, res) => {
  try {
    const flashcardId = parseInt(req.params.id);
    if (isNaN(flashcardId)) return sendError(res, 'ID không hợp lệ', 400);

    const result = await flashcardService.deleteFlashcard(req.user.id, flashcardId);
    return sendSuccess(res, result, result.message);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const generateAI = async (req, res) => {
  try {
    const { word } = req.body;
    if (!word) {
      return sendError(res, 'Word is required', 400);
    }

    const aiData = await flashcardService.generateAIContent(word);
    return sendSuccess(res, aiData, 'AI generated content successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
