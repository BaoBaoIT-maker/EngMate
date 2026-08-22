const LEVEL_TARGET_OPTIONS = [
  { value: 'A1', label: 'A1', targetWords: 300 },
  { value: 'A2', label: 'A2', targetWords: 700 },
  { value: 'B1', label: 'B1', targetWords: 1500 },
  { value: 'B2', label: 'B2', targetWords: 2500 },
  { value: 'C1', label: 'C1', targetWords: 4000 },
  { value: 'C2', label: 'C2', targetWords: 6000 },
];

export const TARGET_TYPES = {
  LEVEL: 'LEVEL',
  SCORE: 'SCORE',
  WORD_COUNT: 'WORD_COUNT',
};

export const DEFAULT_CATEGORY_TARGET_CONFIGS = {
  GENERAL: {
    targetType: TARGET_TYPES.LEVEL,
    defaultTarget: 'B1',
    options: LEVEL_TARGET_OPTIONS,
  },
  TOEIC: {
    targetType: TARGET_TYPES.SCORE,
    defaultTarget: '650',
    minScore: 10,
    maxScore: 990,
    options: [
      { value: '250', label: '250', targetWords: 300 },
      { value: '350', label: '350', targetWords: 450 },
      { value: '450', label: '450', targetWords: 600 },
      { value: '550', label: '550', targetWords: 900 },
      { value: '650', label: '650', targetWords: 1200 },
      { value: '730', label: '730', targetWords: 1500 },
      { value: '800', label: '800', targetWords: 1800 },
      { value: '850', label: '850', targetWords: 2200 },
      { value: '900', label: '900', targetWords: 2800 },
      { value: '990', label: '990', targetWords: 3500 },
    ],
  },
  IELTS: {
    targetType: TARGET_TYPES.SCORE,
    defaultTarget: '6.5',
    minScore: 1,
    maxScore: 9,
    options: [
      { value: '1.0', label: '1.0', targetWords: 100 },
      { value: '2.0', label: '2.0', targetWords: 250 },
      { value: '3.0', label: '3.0', targetWords: 450 },
      { value: '4.0', label: '4.0', targetWords: 800 },
      { value: '5.0', label: '5.0', targetWords: 1200 },
      { value: '5.5', label: '5.5', targetWords: 1500 },
      { value: '6.0', label: '6.0', targetWords: 2000 },
      { value: '6.5', label: '6.5', targetWords: 2500 },
      { value: '7.0', label: '7.0', targetWords: 3200 },
      { value: '7.5', label: '7.5', targetWords: 4000 },
      { value: '8.0', label: '8.0', targetWords: 5000 },
      { value: '8.5', label: '8.5', targetWords: 6000 },
      { value: '9.0', label: '9.0', targetWords: 7000 },
    ],
  },
};

const normalizeOption = (option) => {
  const value = option?.value === undefined ? null : String(option.value);
  const targetWords = Number(option?.targetWords);
  if (!value || !Number.isFinite(targetWords) || targetWords < 1) return null;

  return {
    value,
    label: option.label ? String(option.label) : value,
    targetWords: Math.round(targetWords),
  };
};

const normalizeTargetConfig = (config) => {
  if (!config || typeof config !== 'object') return null;

  const targetType = String(config.targetType || '').toUpperCase();
  if (!Object.values(TARGET_TYPES).includes(targetType)) return null;

  const options = Array.isArray(config.options)
    ? config.options.map(normalizeOption).filter(Boolean)
    : [];

  return {
    targetType,
    defaultTarget: config.defaultTarget === undefined || config.defaultTarget === null
      ? null
      : String(config.defaultTarget),
    minScore: config.minScore === undefined ? null : Number(config.minScore),
    maxScore: config.maxScore === undefined ? null : Number(config.maxScore),
    options,
  };
};

export const getCategoryTargetConfig = (category) => {
  const code = String(category?.code || '').toUpperCase();
  return normalizeTargetConfig(category?.targetConfig)
    || DEFAULT_CATEGORY_TARGET_CONFIGS[code]
    || {
      targetType: TARGET_TYPES.LEVEL,
      defaultTarget: 'B1',
      options: LEVEL_TARGET_OPTIONS,
    };
};

export const validateTargetConfig = (config) => {
  if (config === null || config === undefined) return null;

  const normalized = normalizeTargetConfig(config);
  if (!normalized) {
    const error = new Error('targetConfig is invalid');
    error.statusCode = 400;
    throw error;
  }

  if (normalized.targetType !== TARGET_TYPES.WORD_COUNT && normalized.options.length === 0) {
    const error = new Error('targetConfig options are required');
    error.statusCode = 400;
    throw error;
  }

  return normalized;
};

export const resolveConfiguredTargetWords = ({ category, targetLevel, targetScore, targetWordCount }) => {
  if (targetWordCount && targetWordCount > 0) return targetWordCount;

  const config = getCategoryTargetConfig(category);
  if (config.targetType === TARGET_TYPES.WORD_COUNT) return Number(targetWordCount) || null;

  const rawTarget = config.targetType === TARGET_TYPES.SCORE ? targetScore : targetLevel;
  if (rawTarget === undefined || rawTarget === null) return null;

  const numericTarget = Number(rawTarget);
  const byExactValue = config.options.find((option) => option.value === String(rawTarget));
  if (byExactValue) return byExactValue.targetWords;

  if (!Number.isFinite(numericTarget)) return null;

  const numericOptions = config.options
    .map((option) => ({ ...option, numericValue: Number(option.value) }))
    .filter((option) => Number.isFinite(option.numericValue))
    .sort((a, b) => a.numericValue - b.numericValue);

  return numericOptions.find((option) => numericTarget <= option.numericValue)?.targetWords
    ?? numericOptions[numericOptions.length - 1]?.targetWords
    ?? null;
};
