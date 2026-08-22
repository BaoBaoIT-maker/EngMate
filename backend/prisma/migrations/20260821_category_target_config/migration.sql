ALTER TABLE `categories`
  ADD COLUMN `target_config` JSON NULL;

UPDATE `categories`
SET `target_config` = JSON_OBJECT(
  'targetType', 'LEVEL',
  'defaultTarget', 'B1',
  'options', JSON_ARRAY(
    JSON_OBJECT('value', 'A1', 'label', 'A1', 'targetWords', 300),
    JSON_OBJECT('value', 'A2', 'label', 'A2', 'targetWords', 700),
    JSON_OBJECT('value', 'B1', 'label', 'B1', 'targetWords', 1500),
    JSON_OBJECT('value', 'B2', 'label', 'B2', 'targetWords', 2500),
    JSON_OBJECT('value', 'C1', 'label', 'C1', 'targetWords', 4000),
    JSON_OBJECT('value', 'C2', 'label', 'C2', 'targetWords', 6000)
  )
)
WHERE `code` = 'GENERAL';

UPDATE `categories`
SET `target_config` = JSON_OBJECT(
  'targetType', 'SCORE',
  'defaultTarget', '650',
  'minScore', 10,
  'maxScore', 990,
  'options', JSON_ARRAY(
    JSON_OBJECT('value', '250', 'label', '250', 'targetWords', 300),
    JSON_OBJECT('value', '350', 'label', '350', 'targetWords', 450),
    JSON_OBJECT('value', '450', 'label', '450', 'targetWords', 600),
    JSON_OBJECT('value', '550', 'label', '550', 'targetWords', 900),
    JSON_OBJECT('value', '650', 'label', '650', 'targetWords', 1200),
    JSON_OBJECT('value', '730', 'label', '730', 'targetWords', 1500),
    JSON_OBJECT('value', '800', 'label', '800', 'targetWords', 1800),
    JSON_OBJECT('value', '850', 'label', '850', 'targetWords', 2200),
    JSON_OBJECT('value', '900', 'label', '900', 'targetWords', 2800),
    JSON_OBJECT('value', '990', 'label', '990', 'targetWords', 3500)
  )
)
WHERE `code` = 'TOEIC';

UPDATE `categories`
SET `target_config` = JSON_OBJECT(
  'targetType', 'SCORE',
  'defaultTarget', '6.5',
  'minScore', 1,
  'maxScore', 9,
  'options', JSON_ARRAY(
    JSON_OBJECT('value', '1.0', 'label', '1.0', 'targetWords', 100),
    JSON_OBJECT('value', '2.0', 'label', '2.0', 'targetWords', 250),
    JSON_OBJECT('value', '3.0', 'label', '3.0', 'targetWords', 450),
    JSON_OBJECT('value', '4.0', 'label', '4.0', 'targetWords', 800),
    JSON_OBJECT('value', '5.0', 'label', '5.0', 'targetWords', 1200),
    JSON_OBJECT('value', '5.5', 'label', '5.5', 'targetWords', 1500),
    JSON_OBJECT('value', '6.0', 'label', '6.0', 'targetWords', 2000),
    JSON_OBJECT('value', '6.5', 'label', '6.5', 'targetWords', 2500),
    JSON_OBJECT('value', '7.0', 'label', '7.0', 'targetWords', 3200),
    JSON_OBJECT('value', '7.5', 'label', '7.5', 'targetWords', 4000),
    JSON_OBJECT('value', '8.0', 'label', '8.0', 'targetWords', 5000),
    JSON_OBJECT('value', '8.5', 'label', '8.5', 'targetWords', 6000),
    JSON_OBJECT('value', '9.0', 'label', '9.0', 'targetWords', 7000)
  )
)
WHERE `code` = 'IELTS';
