import prisma from '../config/prisma.js';

export const findAllTopics = () =>
  prisma.vocabularyTopic.findMany({
    orderBy: [{ categoryCode: 'asc' }, { level: 'asc' }],
    select: {
      id: true,
      name: true,
      description: true,
      categoryCode: true,
      level: true,
      isPremium: true,
      wordCount: true,
      thumbnailUrl: true,
    },
  });

export const findTopicById = (id) =>
  prisma.vocabularyTopic.findUnique({
    where: { id },
    include: {
      vocabularies: {
        select: {
          id: true,
          word: true,
          type: true,
          phonetic: true,
          definitionText: true,
          vietnameseMeaning: true,
          exampleJson: true,
          level: true,
        },
      },
    },
  });
