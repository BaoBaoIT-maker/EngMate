import prisma from '../src/config/prisma.js';

const topicsData = [
  {
    name: 'Business & Office',
    description: 'Từ vựng thông dụng trong môi trường văn phòng, công sở.',
    category: 'TOEIC',
    level: 'B1',
    isPremium: false,
    vocabularies: [
      {
        word: 'Meticulous',
        type: 'adj',
        phonetic: '/məˈtɪk.jʊ.ləs/',
        definitionText: 'Very careful and with great attention to every detail.',
        vietnameseMeaning: 'Tỉ mỉ, cẩn thận đến từng chi tiết',
        exampleJson: ['The report was prepared in a meticulous manner.', 'He is very meticulous about his appearance.'],
        category: 'TOEIC',
        level: 'C1',
      },
      {
        word: 'Endeavor',
        type: 'verb',
        phonetic: '/ɪnˈdev.ər/',
        definitionText: 'To try to do something.',
        vietnameseMeaning: 'Nỗ lực, cố gắng',
        exampleJson: ['Engineers are endeavoring to locate the source of the problem.', 'Please make every endeavor to arrive on time.'],
        category: 'TOEIC',
        level: 'B2',
      },
      {
        word: 'Substantial',
        type: 'adj',
        phonetic: '/səbˈstæn.ʃəl/',
        definitionText: 'Large in size, value, or importance.',
        vietnameseMeaning: 'Đáng kể, quan trọng',
        exampleJson: ['There has been a substantial increase in applications this year.'],
        category: 'TOEIC',
        level: 'B2',
      },
    ]
  },
  {
    name: 'Academic Research',
    description: 'Từ vựng học thuật dành cho phần thi IELTS Reading & Writing.',
    category: 'IELTS',
    level: 'B2',
    isPremium: false,
    vocabularies: [
      {
        word: 'Alleviate',
        type: 'verb',
        phonetic: '/əˈliː.vi.eɪt/',
        definitionText: 'To make something bad such as pain or problems less severe.',
        vietnameseMeaning: 'Giảm nhẹ (nỗi đau, vấn đề)',
        exampleJson: ['The drugs did nothing to alleviate her pain.', 'The new measures aim to alleviate financial pressure on households.'],
        category: 'IELTS',
        level: 'C1',
      },
      {
        word: 'Proliferate',
        type: 'verb',
        phonetic: '/prəˈlɪf.ər.eɪt/',
        definitionText: 'To increase a lot and suddenly in number.',
        vietnameseMeaning: 'Sinh sôi nảy nở, tăng nhanh',
        exampleJson: ['Small businesses have proliferated in the last ten years.'],
        category: 'IELTS',
        level: 'C1',
      },
      {
        word: 'Ambiguous',
        type: 'adj',
        phonetic: '/æmˈbɪɡ.ju.əs/',
        definitionText: 'Having or expressing more than one possible meaning, sometimes intentionally.',
        vietnameseMeaning: 'Mơ hồ, nhập nhằng',
        exampleJson: ['His reply to my question was somewhat ambiguous.'],
        category: 'IELTS',
        level: 'B2',
      }
    ]
  },
  {
    name: 'Travel & Tourism',
    description: 'Từ vựng giao tiếp hàng ngày khi đi du lịch.',
    category: 'GENERAL',
    level: 'A2',
    isPremium: false,
    vocabularies: [
      {
        word: 'Itinerary',
        type: 'noun',
        phonetic: '/aɪˈtɪn.ə.rər.i/',
        definitionText: 'A detailed plan or route of a journey.',
        vietnameseMeaning: 'Lịch trình chuyến đi',
        exampleJson: ['The tour operator will arrange transport and plan your itinerary.'],
        category: 'GENERAL',
        level: 'B1',
      },
      {
        word: 'Picturesque',
        type: 'adj',
        phonetic: '/ˌpɪk.tʃərˈesk/',
        definitionText: 'Attractive in appearance, especially in an old-fashioned way.',
        vietnameseMeaning: 'Đẹp như tranh vẽ',
        exampleJson: ['We strolled through the picturesque streets of the old city.'],
        category: 'GENERAL',
        level: 'B2',
      },
      {
        word: 'Souvenir',
        type: 'noun',
        phonetic: '/ˌsuː.vənˈɪər/',
        definitionText: 'Something you buy or keep to help you remember a holiday or special event.',
        vietnameseMeaning: 'Quà lưu niệm',
        exampleJson: ['He bought a model of a red London bus as a souvenir of his trip to London.'],
        category: 'GENERAL',
        level: 'A2',
      }
    ]
  }
];

async function main() {
  console.log('Start seeding topics and vocabularies...');
  
  for (const topicData of topicsData) {
    const { vocabularies, category, ...topicMeta } = topicData;
    
    // Tạo Topic — schema dùng categoryCode thay vì category
    const topic = await prisma.vocabularyTopic.upsert({
      where: { name: topicMeta.name },
      update: {},
      create: {
        ...topicMeta,
        categoryCode: category || 'GENERAL',
        wordCount: vocabularies.length
      },
    });

    // Tạo Vocabularies liên kết với Topic này
    let count = 0;
    for (const vocab of vocabularies) {
      const { category: vocabCategory, ...vocabMeta } = vocab;
      // Dùng upsert dựa vào trường hợp. Bảng chưa có @unique trên word, nhưng để an toàn cứ dùng findFirst
      const existing = await prisma.systemVocabulary.findFirst({
        where: { word: vocabMeta.word, topicId: topic.id }
      });
      
      if (!existing) {
        await prisma.systemVocabulary.create({
          data: {
            ...vocabMeta,
            categoryCode: vocabCategory || category || 'GENERAL',
            topicId: topic.id
          }
        });
        count++;
      }
    }
    console.log(`Topic "${topic.name}" seeded with ${count} new words.`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
