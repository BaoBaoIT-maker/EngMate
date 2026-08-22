import prisma from '../config/prisma.js';

/**
 * Aggregate dữ liệu học tập theo từng level bằng SQL thô.
 *
 * Lý do dùng Raw SQL thay vì Prisma ORM:
 * - ORM sẽ kéo hàng nghìn rows về Node.js rồi đếm bằng JS loop → rất chậm.
 * - SQL Aggregate giao việc đếm cho Database → chỉ trả về 6 dòng (A1→C2).
 *
 * Kỹ thuật chống Join Multiplication:
 * - ReviewLog (1-N với Flashcard) → aggregate trong Subquery TRƯỚC rồi mới JOIN vào outer query.
 * - StudyProgress (1-1 với Flashcard, vì flashcardId là @id) → JOIN trực tiếp an toàn.
 *
 * Subquery review_logs được lọc sớm bằng user_id và category_code để
 * tránh scan toàn bộ bảng khi dữ liệu lớn (hàng triệu review logs).
 *
 * @param {number} userId
 * @param {string} categoryCode - VD: 'TOEIC', 'IELTS', 'GENERAL'
 * @returns {Promise<Array<{level, totalWords, studiedWords, masteredWords, totalReviews, correctReviews}>>}
 */
export const getAggregatedProgressByLevel = async (userId, categoryCode) => {
  const rows = await prisma.$queryRaw`
    SELECT
        sv.level,
        CAST(COUNT(DISTINCT sv.id)   AS UNSIGNED) AS totalWords,
        CAST(COUNT(DISTINCT f.id)    AS UNSIGNED) AS studiedWords,
        CAST(COUNT(DISTINCT CASE
            WHEN sp.box_level >= 5 OR sp.interval >= 21 THEN f.id
        END)                         AS UNSIGNED) AS masteredWords,
        CAST(COALESCE(SUM(rs.total_reviews),   0) AS UNSIGNED) AS totalReviews,
        CAST(COALESCE(SUM(rs.correct_reviews), 0) AS UNSIGNED) AS correctReviews
    FROM system_vocabulary sv
    LEFT JOIN flashcards f
        ON  f.system_vocabulary_id = sv.id
        AND f.user_id              = ${userId}
    LEFT JOIN study_progresses sp
        ON  sp.flashcard_id = f.id
    LEFT JOIN (
        SELECT
            rl.flashcard_id,
            COUNT(*)                                            AS total_reviews,
            SUM(CASE WHEN rl.is_correct THEN 1 ELSE 0 END)     AS correct_reviews
        FROM review_logs rl
        INNER JOIN flashcards f2
            ON  f2.id      = rl.flashcard_id
            AND f2.user_id = ${userId}
        INNER JOIN system_vocabulary sv2
            ON  sv2.id            = f2.system_vocabulary_id
            AND sv2.category_code = ${categoryCode}
        GROUP BY rl.flashcard_id
    ) rs ON rs.flashcard_id = f.id
    WHERE sv.category_code = ${categoryCode}
    GROUP BY sv.level;
  `;

  // Prisma $queryRaw trả về BigInt với CAST UNSIGNED → convert về Number
  return rows.map((r) => ({
    level:          r.level,
    totalWords:     Number(r.totalWords),
    studiedWords:   Number(r.studiedWords),
    masteredWords:  Number(r.masteredWords),
    totalReviews:   Number(r.totalReviews),
    correctReviews: Number(r.correctReviews),
  }));
};
