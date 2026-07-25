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
    const { word, definition, phonetic, meaning, examples } = req.body;
    if (!word || !meaning) {
      return sendError(res, 'Word and meaning are required', 400);
    }

    const fc = await flashcardService.createCustomFlashcard(req.user.id, req.body);
    return sendSuccess(res, fc, 'Custom flashcard created');
  } catch (error) {
    return sendError(res, error.message, 500);
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
