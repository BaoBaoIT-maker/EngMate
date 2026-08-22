const LEVEL_LABELS = {
  A1: 'A1 - Beginner',
  A2: 'A2 - Elementary',
  B1: 'B1 - Intermediate',
  B2: 'B2 - Upper-Intermediate',
  C1: 'C1 - Advanced',
  C2: 'C2 - Proficient',
};

export const LEVEL_OPTIONS = Object.keys(LEVEL_LABELS).map((value) => ({
  value,
  label: LEVEL_LABELS[value],
  desc: '',
}));

const FALLBACK_TARGET_CONFIG = {
  targetType: 'LEVEL',
  defaultTarget: 'B1',
  options: LEVEL_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
};

const BUILTIN_PRESENTATION = {
  GENERAL: { emoji: '*', accent: '#10B981' },
  TOEIC: { emoji: 'T', accent: '#F0B429' },
  IELTS: { emoji: 'I', accent: '#8B5CF6' },
};

const ACCENTS = ['#F0B429', '#8B5CF6', '#10B981', '#3B82F6', '#EF4444', '#14B8A6'];

const alpha = (hex, opacity) => {
  const clean = hex.replace('#', '');
  const red = parseInt(clean.slice(0, 2), 16);
  const green = parseInt(clean.slice(2, 4), 16);
  const blue = parseInt(clean.slice(4, 6), 16);
  return `rgba(${red},${green},${blue},${opacity})`;
};

const normalizeTargetConfig = (config) => {
  const targetType = String(config?.targetType || FALLBACK_TARGET_CONFIG.targetType).toUpperCase();
  const options = Array.isArray(config?.options) && config.options.length > 0
    ? config.options
    : FALLBACK_TARGET_CONFIG.options;

  return {
    targetType,
    defaultTarget: config?.defaultTarget ? String(config.defaultTarget) : 'B1',
    options: options.map((option) => ({
      value: String(option.value),
      label: option.label ? String(option.label) : String(option.value),
      desc: option.targetWords ? `${option.targetWords} words` : '',
    })),
  };
};

export const toLearningCategory = (category, index = 0) => {
  const code = String(category?.code || category?.category || '').toUpperCase();
  const presentation = BUILTIN_PRESENTATION[code] || {
    emoji: code.slice(0, 1) || '?',
    accent: ACCENTS[index % ACCENTS.length],
  };
  const accent = presentation.accent;
  const targetConfig = normalizeTargetConfig(category?.targetConfig);

  return {
    category: code,
    code,
    title: category?.name || code,
    desc: category?.description || '',
    emoji: presentation.emoji,
    accent,
    accentBg: alpha(accent, 0.12),
    targetConfig,
  };
};

export const usesScoreTarget = (category) => category?.targetConfig?.targetType === 'SCORE';

export const getTargetOptions = (category) => category?.targetConfig?.options || LEVEL_OPTIONS;

export const getDefaultTargetValue = (category) =>
  String(category?.targetConfig?.defaultTarget || getTargetOptions(category)[0]?.value || 'B1');

export const getCategoryByCode = (categories, code) =>
  categories.find((category) => category.category === code || category.code === code);

export const getPathTargetValue = (path, categories = []) => {
  const category = getCategoryByCode(categories, path?.category || path?.categoryCode || 'GENERAL');
  return String(
    usesScoreTarget(category)
      ? path?.targetScore || getDefaultTargetValue(category)
      : path?.targetLevel || getDefaultTargetValue(category)
  );
};

export const buildPathPayload = (category, config = {}) => {
  if (usesScoreTarget(category)) {
    return {
      category: category.category,
      targetScore: String(config.targetScore || getDefaultTargetValue(category)),
    };
  }

  return {
    category: category.category,
    targetLevel: String(config.targetLevel || getDefaultTargetValue(category)),
  };
};

export const buildDefaultPathForm = (category) => ({
  category: category.category,
  targetLevel: usesScoreTarget(category) ? null : getDefaultTargetValue(category),
  targetScore: usesScoreTarget(category) ? getDefaultTargetValue(category) : null,
  progress: null,
});
