import api from './api';

export const generateAiFlashcard = async (word) => {
  const res = await api.post('/flashcards/ai-generate', { word });
  return res.data;
};

export const createCustomFlashcard = async (data) => {
  const res = await api.post('/flashcards/custom', data);
  return res.data;
};

export const getTopics = async () => {
  const res = await api.get('/flashcards/topics');
  return res.data;
};

export const getLearnedWords = async (params) => {
  const res = await api.get('/flashcards/learned', { params });
  return res.data;
};

export const updateCustomWord = async (id, data) => {
  const res = await api.patch(`/flashcards/custom/${id}`, data);
  return res.data;
};

export const deleteFlashcard = async (id) => {
  const res = await api.delete(`/flashcards/${id}`);
  return res.data;
};

export const getSessionCards = async ({ type, topicId, course, mode }) => {
  let url = `/flashcards/session?type=${type}`;
  if (topicId) url += `&topicId=${topicId}`;
  if (course) url += `&course=${course}`;
  if (mode) url += `&mode=${mode}`;
  const res = await api.get(url);
  return res.data;
};

export const reviewCard = async (id, quality) => {
  const res = await api.post(`/flashcards/${id}/review`, { quality });
  return res.data;
};