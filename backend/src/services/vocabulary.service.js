import {
  findActiveCategories,
  findAllTopics,
  findTopicById,
} from '../repository/vocabulary.repository.js';

export const getCategories = async () => {
  const categories = await findActiveCategories();
  return categories.map((category) => ({
    ...category,
    category: category.code,
  }));
};

export const getTopics = async () => {
  const topics = await findAllTopics();
  return topics;
};

export const getTopicDetail = async (id) => {
  const topic = await findTopicById(Number(id));

  if (!topic) {
    const error = new Error('Topic không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  return topic;
};
