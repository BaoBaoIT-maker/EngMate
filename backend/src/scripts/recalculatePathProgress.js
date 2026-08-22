import 'dotenv/config';
import { recalculateAllActivePaths } from '../services/learningProgress.service.js';
import prisma from '../config/prisma.js';

try {
  const results = await recalculateAllActivePaths();
  const updatedCount = results.filter((item) => item.updated).length;
  console.log(`Recalculated ${updatedCount}/${results.length} active learning paths.`);
} catch (error) {
  console.error('Failed to recalculate learning path progress:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
