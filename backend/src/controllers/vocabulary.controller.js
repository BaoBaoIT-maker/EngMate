import * as vocabularyService from '../services/vocabulary.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await vocabularyService.getCategories();
    return sendSuccess(res, categories, 'Categories loaded');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const getTopics = async (req, res) => {
  try {
    const topics = await vocabularyService.getTopics();
    return sendSuccess(res, topics, 'Topics loaded');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

export const getTopicDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await vocabularyService.getTopicDetail(id);
    return sendSuccess(res, topic, 'Topic detail loaded');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};
