// Offline quiz bank — questions/options localized (english | hindi | marathi).

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** [question, opt0, opt1, opt2, opt3] per locale; correctIdx is 0–3 */
function q(id, correctIdx, english, hindi, marathi) {
  const pack = (row) => ({ q: row[0], options: row.slice(1) });
  return {
    id,
    correctIndex: correctIdx,
    text: {
      english: pack(english),
      hindi: pack(hindi),
      marathi: pack(marathi),
    },
  };
}

const MATH_POOL = [
  q(
    'm0',
    1,
    ['What is 7 + 8?', '14', '15', '16', '13'],
    ['7 + 8 कितना है?', '14', '15', '16', '13'],
    ['७ + ८ किती आहे?', '14', '15', '16', '13'],
  ),
  q(
    'm1',
    1,
    ['What is 36 ÷ 6?', '5', '6', '7', '8'],
    ['36 ÷ 6 कितना है?', '5', '6', '7', '8'],
    ['३६ ÷ ६ किती आहे?', '5', '6', '7', '8'],
  ),
  q(
    'm2',
    0,
    ['What is 9 × 4?', '36', '32', '45', '27'],
    ['9 × 4 कितना है?', '36', '32', '45', '27'],
    ['९ × ४ किती आहे?', '36', '32', '45', '27'],
  ),
  q(
    'm3',
    0,
    ['What is 100 − 47?', '53', '63', '43', '57'],
    ['100 − 47 कितना है?', '53', '63', '43', '57'],
    ['१०० − ४७ किती आहे?', '53', '63', '43', '57'],
  ),
  q(
    'm4',
    1,
    ['Which fraction equals 0.5?', '1/3', '1/2', '2/5', '3/4'],
    ['कौन सा भिन्न 0.5 के बराबर है?', '1/3', '1/2', '2/5', '3/4'],
    ['कोणता अपूर्णांक 0.5 इतका आहे?', '1/3', '1/2', '2/5', '3/4'],
  ),
  q(
    'm5',
    2,
    ['What is the perimeter of a square with side 5 cm?', '10 cm', '15 cm', '20 cm', '25 cm'],
    ['5 सेमी भुजा वाले वर्ग का परिमाप कितना है?', '10 सेमी', '15 सेमी', '20 सेमी', '25 सेमी'],
    ['५ सेमी बाजू असलेल्या चौरसाची परिमिती किती?', '10 सेमी', '15 सेमी', '20 सेमी', '25 सेमी'],
  ),
  q(
    'm6',
    1,
    ['What is 2³ (2 to the power 3)?', '6', '8', '9', '4'],
    ['2³ (2 की घात 3) कितना है?', '6', '8', '9', '4'],
    ['2³ (२ चा घात ३) किती आहे?', '6', '8', '9', '4'],
  ),
  q(
    'm7',
    1,
    ['Round 12.67 to one decimal place.', '12.6', '12.7', '13.0', '12.5'],
    ['12.67 को एक दशमलव स्थान तक पूर्णांकित करें।', '12.6', '12.7', '13.0', '12.5'],
    ['12.67 ला एक दशांश स्थानापर्यंत पूर्णांकित करा.', '12.6', '12.7', '13.0', '12.5'],
  ),
  q(
    'm8',
    1,
    ['What is 3/4 of 20?', '12', '15', '10', '18'],
    ['20 का 3/4 कितना है?', '12', '15', '10', '18'],
    ['२० चे ३/४ किती?', '12', '15', '10', '18'],
  ),
  q(
    'm9',
    2,
    ['If x + 5 = 12, what is x?', '5', '6', '7', '8'],
    ['यदि x + 5 = 12, तो x कितना है?', '5', '6', '7', '8'],
    ['जर x + 5 = 12, तर x किती?', '5', '6', '7', '8'],
  ),
  q(
    'm10',
    2,
    ['What is the area of a rectangle 4 m by 6 m?', '10 m²', '20 m²', '24 m²', '16 m²'],
    ['4 मी × 6 मी आयत का क्षेत्रफल कितना है?', '10 मी²', '20 मी²', '24 मी²', '16 मी²'],
    ['४ मी × ६ मी आयताचे क्षेत्रफळ किती?', '10 मी²', '20 मी²', '24 मी²', '16 मी²'],
  ),
  q(
    'm11',
    1,
    ['Which is the smallest?', '0.8', '0.09', '0.5', '0.12'],
    ['सबसे छोटा कौन सा है?', '0.8', '0.09', '0.5', '0.12'],
    ['सगळ्यात लहान कोणते?', '0.8', '0.09', '0.5', '0.12'],
  ),
];

const SCIENCE_POOL = [
  q(
    's0',
    2,
    ['What gas do plants take in for photosynthesis?', 'Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
    ['प्रकाश संश्लेषण के लिए पौधे कौन सी गैस लेते हैं?', 'ऑक्सीजन', 'नाइट्रोजन', 'कार्बन डाइऑक्साइड', 'हाइड्रोजन'],
    ['प्रकाशसंश्लेषणासाठी वनस्पती कोणती वायू घेतात?', 'ऑक्सिजन', 'नायट्रोजन', 'कार्बन डायऑक्साइड', 'हायड्रोजन'],
  ),
  q(
    's1',
    2,
    ['What is the centre of our Solar System?', 'Earth', 'Moon', 'Sun', 'Mars'],
    ['हमारे सौर मंडल का केंद्र क्या है?', 'पृथ्वी', 'चंद्रमा', 'सूर्य', 'मंगल'],
    ['आपल्या सूर्यमालेचे केंद्र काय आहे?', 'पृथ्वी', 'चंद्र', 'सूर्य', 'मंगळ'],
  ),
  q(
    's2',
    2,
    ['Water boils at 100°C at sea level. What is this process called?', 'Melting', 'Freezing', 'Boiling', 'Condensing'],
    ['समुद्र तल पर पानी 100°C पर उबलता है। इसे क्या कहते हैं?', 'पिघलना', 'जमना', 'उबालना', 'संघनन'],
    ['समुद्रसपाटीवर पाणी 100°C वर उकळते. याला काय म्हणतात?', 'द्रवण', 'गोठणे', 'उकळणे', 'संघनन'],
  ),
  q(
    's3',
    1,
    ['Which organ pumps blood in the human body?', 'Lungs', 'Heart', 'Liver', 'Kidney'],
    ['मानव शरीर में रक्त कौन सा अंग पंप करता है?', 'फेफड़े', 'हृदय', 'यकृत', 'वृक्क'],
    ['मानवी शरीरात रक्त कोणता अवयव पंप करतो?', 'फुफ्फुसे', 'हृदय', 'यकृत', 'मूत्रपिंड'],
  ),
  q(
    's4',
    2,
    ['What force pulls objects toward Earth?', 'Magnetism', 'Friction', 'Gravity', 'Electricity'],
    ['कौन सा बल वस्तुओं को पृथ्वी की ओर खींचता है?', 'चुंबकत्व', 'घर्षण', 'गुरुत्वाकर्षण', 'विद्युत'],
    ['कोणते बल वस्तू पृथ्वीकडे ओढते?', 'चुंबकत्व', 'घर्षण', 'गुरुत्वाकर्षण', 'वीज'],
  ),
  q(
    's5',
    2,
    ['Which state of matter has a fixed shape and volume?', 'Liquid', 'Gas', 'Solid', 'Plasma'],
    ['पदार्थ की किस अवस्था में आकार और आयतन निश्चित होता है?', 'द्रव', 'गैस', 'ठोस', 'प्लाज्मा'],
    ['पदार्थाच्या कोणत्या अवस्थेत आकार व आयतन निश्चित असते?', 'द्रव', 'वायू', 'घन', 'प्लाझ्मा'],
  ),
  q(
    's6',
    2,
    ['What part of the plant absorbs water from soil?', 'Leaf', 'Stem', 'Root', 'Flower'],
    ['पौधे का कौन सा भाग मिट्टी से पानी सोखता है?', 'पत्ती', 'तना', 'जड़', 'फूल'],
    ['वनस्पतीचा कोणता भाग मातीतून पाणी शोषतो?', 'पान', 'खोड', 'मूळ', 'फूल'],
  ),
  q(
    's7',
    2,
    ['Which planet is known as the Red Planet?', 'Venus', 'Jupiter', 'Mars', 'Saturn'],
    ['किस ग्रह को लाल ग्रह कहा जाता है?', 'शुक्र', 'बृहस्पति', 'मंगल', 'शनि'],
    ['कोणत्या ग्रहाला लाल ग्रह म्हणतात?', 'शुक्र', 'गुरु', 'मंगळ', 'शनि'],
  ),
  q(
    's8',
    2,
    ['Sound travels fastest through which?', 'Air', 'Water', 'Steel', 'Vacuum'],
    ['ध्वनि सबसे तेज़ किसमें यात्रा करती है?', 'हवा', 'पानी', 'इस्पात', 'निर्वात'],
    ['ध्वनी सर्वात जलद कोणत्या माध्यमातून जाते?', 'हवा', 'पाणी', 'स्टील', 'निर्वात'],
  ),
  q(
    's9',
    1,
    ['What is H₂O commonly called?', 'Salt water', 'Water', 'Oxygen', 'Hydrogen'],
    ['H₂O को आमतौर पर क्या कहते हैं?', 'नमकीन पानी', 'पानी', 'ऑक्सीजन', 'हाइड्रोजन'],
    ['H₂O ला सामान्यपणे काय म्हणतात?', 'खारे पाणी', 'पाणी', 'ऑक्सिजन', 'हायड्रोजन'],
  ),
];

const ENGLISH_POOL = [
  q(
    'e0',
    2,
    ['Choose the correct past tense: I ___ to school yesterday.', 'go', 'goes', 'went', 'going'],
    ['सही भूतकाल चुनें: मैं कल स्कूल ___।', 'go', 'goes', 'went', 'going'],
    ['बरोबर भूतकाल निवडा: मी काल शाळेत ___।', 'go', 'goes', 'went', 'going'],
  ),
  q(
    'e1',
    1,
    ['Which is a noun?', 'quickly', 'happiness', 'run', 'and'],
    ['संज्ञा कौन सी है?', 'quickly', 'happiness', 'run', 'and'],
    ['नाम कुठले आहे?', 'quickly', 'happiness', 'run', 'and'],
  ),
  q(
    'e2',
    1,
    ['What is the plural of "child"?', 'childs', 'children', 'childes', 'child'],
    ['"child" का बहुवचन क्या है?', 'childs', 'children', 'childes', 'child'],
    ['"child" चे बहुवचन काय?', 'childs', 'children', 'childes', 'child'],
  ),
  q(
    'e3',
    1,
    ['Pick the correct spelling.', 'recieve', 'receive', 'receeve', 'receiv'],
    ['सही वर्तनी चुनें।', 'recieve', 'receive', 'receeve', 'receiv'],
    ['बरोबर स्पेलिंग निवडा.', 'recieve', 'receive', 'receeve', 'receiv'],
  ),
  q(
    'e4',
    1,
    ['Which sentence is correct?', "She don't like apples.", "She doesn't like apples.", 'She not like apples.', "She doesn't likes apples."],
    ['कौन सा वाक्य सही है?', "She don't like apples.", "She doesn't like apples.", 'She not like apples.', "She doesn't likes apples."],
    ['कोणते वाक्य बरोबर आहे?', "She don't like apples.", "She doesn't like apples.", 'She not like apples.', "She doesn't likes apples."],
  ),
  q(
    'e5',
    1,
    ['What is a synonym of "happy"?', 'sad', 'joyful', 'angry', 'tired'],
    ['"happy" का समानार्थी क्या है?', 'sad', 'joyful', 'angry', 'tired'],
    ['"happy" चा समानार्थी शब्द कोणता?', 'sad', 'joyful', 'angry', 'tired'],
  ),
  q(
    'e6',
    1,
    ['Complete: "An" is used before words starting with a ___ sound.', 'consonant', 'vowel', 'number', 'silent letter'],
    ['पूरा करें: "An" का प्रयोग ___ ध्वनि से शुरू होने वाले शब्दों से पहले होता है।', 'consonant', 'vowel', 'number', 'silent letter'],
    ['पूर्ण करा: "An" हे ___ आवाजाने सुरू होणाऱ्या शब्दांपूर्वी वापरतात.', 'consonant', 'vowel', 'number', 'silent letter'],
  ),
  q(
    'e7',
    1,
    ['Which word is an adverb?', 'slow', 'slowly', 'slowness', 'slowed'],
    ['कौन सा शब्द क्रिया विशेषण है?', 'slow', 'slowly', 'slowness', 'slowed'],
    ['कोणता शब्द क्रियाविशेषण आहे?', 'slow', 'slowly', 'slowness', 'slowed'],
  ),
  q(
    'e8',
    1,
    ['What is the opposite of "ancient"?', 'old', 'modern', 'rusty', 'wise'],
    ['"ancient" का विलोम क्या है?', 'old', 'modern', 'rusty', 'wise'],
    ['"ancient" चा विरुद्धार्थी शब्द कोणता?', 'old', 'modern', 'rusty', 'wise'],
  ),
  q(
    'e9',
    1,
    ['Choose the correct article: ___ honest person.', 'A', 'An', 'The', 'No article'],
    ['सही उपपद चुनें: ___ ईमानदार व्यक्ति।', 'A', 'An', 'The', 'No article'],
    ['बरोबर उपपद निवडा: ___ प्रामाणिक व्यक्ती.', 'A', 'An', 'The', 'No article'],
  ),
];

/** Same pools for every class (labels only differ in UI). */
const byClass = {};
for (let c = 1; c <= 10; c++) {
  byClass[String(c)] = {
    math: MATH_POOL.map((item) => ({ ...item, text: { ...item.text } })),
    science: SCIENCE_POOL.map((item) => ({ ...item, text: { ...item.text } })),
    english: ENGLISH_POOL.map((item) => ({ ...item, text: { ...item.text } })),
  };
}

const FALLBACK_LOCALE = 'english';

export function normalizeQuizLocale(locale) {
  if (locale === 'hindi' || locale === 'marathi') return locale;
  return 'english';
}

/**
 * @param {object} raw — item from pool with .text and .correctIndex
 * @param {string} locale
 */
export function localizeQuestion(raw, locale) {
  const loc = normalizeQuizLocale(locale);
  const block = raw.text[loc] || raw.text[FALLBACK_LOCALE];
  return {
    id: raw.id,
    correctIndex: raw.correctIndex,
    question: block.q,
    options: [...block.options],
  };
}

/**
 * @param {string} classLevel
 * @param {string} subject  math | science | english
 * @param {number} count
 * @param {string} [locale]
 */
export function pickQuizQuestions(classLevel, subject, count = 5, locale = 'english') {
  const cls = byClass[classLevel] || byClass['5'];
  const pool = cls[subject] || cls.math;
  return shuffle(pool)
    .slice(0, Math.min(count, pool.length))
    .map((q) => localizeQuestion(q, locale));
}

/**
 * @param {string} classLevel
 * @param {number} count
 * @param {string} [locale]
 */
export function pickDailyQuestions(classLevel, count = 3, locale = 'english') {
  const cls = byClass[classLevel] || byClass['5'];
  const pool = [...cls.math, ...cls.science, ...cls.english];
  return shuffle(pool)
    .slice(0, Math.min(count, pool.length))
    .map((q) => localizeQuestion(q, locale));
}
