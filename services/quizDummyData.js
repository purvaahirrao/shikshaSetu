// Offline quiz bank (same shape as backend quiz API). Used by pages/quiz.jsx — no server required.

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MATH_POOL = [
  { question: 'What is 7 + 8?', options: ['14', '15', '16', '13'], answer: '15' },
  { question: 'What is 36 ÷ 6?', options: ['5', '6', '7', '8'], answer: '6' },
  { question: 'What is 9 × 4?', options: ['36', '32', '45', '27'], answer: '36' },
  { question: 'What is 100 − 47?', options: ['53', '63', '43', '57'], answer: '53' },
  { question: 'Which fraction equals 0.5?', options: ['1/3', '1/2', '2/5', '3/4'], answer: '1/2' },
  { question: 'What is the perimeter of a square with side 5 cm?', options: ['10 cm', '15 cm', '20 cm', '25 cm'], answer: '20 cm' },
  { question: 'What is 2³ (2 to the power 3)?', options: ['6', '8', '9', '4'], answer: '8' },
  { question: 'Round 12.67 to one decimal place.', options: ['12.6', '12.7', '13.0', '12.5'], answer: '12.7' },
  { question: 'What is 3/4 of 20?', options: ['12', '15', '10', '18'], answer: '15' },
  { question: 'If x + 5 = 12, what is x?', options: ['5', '6', '7', '8'], answer: '7' },
  { question: 'What is the area of a rectangle 4 m by 6 m?', options: ['10 m²', '20 m²', '24 m²', '16 m²'], answer: '24 m²' },
  { question: 'Which is the smallest?', options: ['0.8', '0.09', '0.5', '0.12'], answer: '0.09' },
];

const SCIENCE_POOL = [
  { question: 'What gas do plants take in for photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], answer: 'Carbon dioxide' },
  { question: 'What is the centre of our Solar System?', options: ['Earth', 'Moon', 'Sun', 'Mars'], answer: 'Sun' },
  { question: 'Water boils at 100°C at sea level. What is this process called?', options: ['Melting', 'Freezing', 'Boiling', 'Condensing'], answer: 'Boiling' },
  { question: 'Which organ pumps blood in the human body?', options: ['Lungs', 'Heart', 'Liver', 'Kidney'], answer: 'Heart' },
  { question: 'What force pulls objects toward Earth?', options: ['Magnetism', 'Friction', 'Gravity', 'Electricity'], answer: 'Gravity' },
  { question: 'Which state of matter has a fixed shape and volume?', options: ['Liquid', 'Gas', 'Solid', 'Plasma'], answer: 'Solid' },
  { question: 'What part of the plant absorbs water from soil?', options: ['Leaf', 'Stem', 'Root', 'Flower'], answer: 'Root' },
  { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], answer: 'Mars' },
  { question: 'Sound travels fastest through which?', options: ['Air', 'Water', 'Steel', 'Vacuum'], answer: 'Steel' },
  { question: 'What is H₂O commonly called?', options: ['Salt water', 'Water', 'Oxygen', 'Hydrogen'], answer: 'Water' },
];

const ENGLISH_POOL = [
  { question: 'Choose the correct past tense: I ___ to school yesterday.', options: ['go', 'goes', 'went', 'going'], answer: 'went' },
  { question: 'Which is a noun?', options: ['quickly', 'happiness', 'run', 'and'], answer: 'happiness' },
  { question: 'What is the plural of "child"?', options: ['childs', 'children', 'childes', 'child'], answer: 'children' },
  { question: 'Pick the correct spelling.', options: ['recieve', 'receive', 'receeve', 'receiv'], answer: 'receive' },
  { question: 'Which sentence is correct?', options: ['She don\'t like apples.', 'She doesn\'t like apples.', 'She not like apples.', 'She doesn\'t likes apples.'], answer: 'She doesn\'t like apples.' },
  { question: 'What is a synonym of "happy"?', options: ['sad', 'joyful', 'angry', 'tired'], answer: 'joyful' },
  { question: 'Complete: "An" is used before words starting with a ___ sound.', options: ['consonant', 'vowel', 'number', 'silent letter'], answer: 'vowel' },
  { question: 'Which word is an adverb?', options: ['slow', 'slowly', 'slowness', 'slowed'], answer: 'slowly' },
  { question: 'What is the opposite of "ancient"?', options: ['old', 'modern', 'rusty', 'wise'], answer: 'modern' },
  { question: 'Choose the correct article: ___ honest person.', options: ['A', 'An', 'The', 'No article'], answer: 'An' },
];

/** Same pools for every class (labels only differ in UI). */
const byClass = {};
for (let c = 1; c <= 10; c++) {
  byClass[String(c)] = {
    math: MATH_POOL.map((q) => ({ ...q })),
    science: SCIENCE_POOL.map((q) => ({ ...q })),
    english: ENGLISH_POOL.map((q) => ({ ...q })),
  };
}

/**
 * @param {string} classLevel
 * @param {string} subject  math | science | english
 * @param {number} count
 */
export function pickQuizQuestions(classLevel, subject, count = 5) {
  const cls = byClass[classLevel] || byClass['5'];
  const pool = cls[subject] || cls.math;
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

/**
 * @param {string} classLevel
 * @param {number} count
 */
export function pickDailyQuestions(classLevel, count = 3) {
  const cls = byClass[classLevel] || byClass['5'];
  const pool = [...cls.math, ...cls.science, ...cls.english];
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}
