const fs = require('fs');
const path = require('path');

// 1. Common Subjects & Wing-specific Subjects
const SYLLABUS_DEFINITION = [
  // 1. Common Subjects
  { wing: 'Common', level: 'A', courses: [
    'NCC At a Glance', 'Drill & Commands', 'Weapon Training & Infantry Weapons', 'National Integration',
    'Leadership & Personality Development', 'Civil Defence & Disaster Management', 'Social Service & Awareness',
    'Health, Hygiene & Sanitation', 'Yoga & Asanas', 'Home Nursing', 'Posture Training',
    'Obstacles Training & Adventure Activities'
  ]},
  { wing: 'Common', level: 'B', courses: [
    'Career in Defence Services', 'Services Tests & Interviews', 'Self-Defence', 'Environment and Ecology',
    'Famous Leaders of India', 'History of India', 'Armed Forces & Military History', 'Map Reading',
    'Communication', 'Field Craft & Battle Craft', 'Personality Development & Officer Like Qualities (OLQs)',
    'Disaster Management & Social Awareness'
  ]},
  { wing: 'Common', level: 'C', courses: [
    'Advanced Leadership', 'Advanced Drill', 'National Security', 'Armed Forces Organisation',
    'Disaster Management', 'Social Service & Community Development', 'Personality Development & Communication Skills',
    'Map Reading & Navigation', 'Field Craft & Battle Craft', 'Military History & War Heroes',
    'General Awareness & Current Affairs', 'Officer Like Qualities (OLQs) & Interview Skills'
  ]},
  // 2. Army
  { wing: 'Army', level: 'A', courses: [
    'Field Craft Basics', 'Drill with Arms', 'Weapon Training', 'Section Formation', 'Guard Mounting', 'Battle Craft Basics'
  ]},
  { wing: 'Army', level: 'B', courses: [
    'Advanced Weapon Training', 'Field Signals', 'Patrolling', 'Camouflage & Concealment', 'Section Battle Drill', 'Ambush & Defence'
  ]},
  { wing: 'Army', level: 'C', courses: [
    'Tactical Exercises', 'Platoon Formation', 'Advanced Battle Craft', 'Internal Security Duties', 'Field Engineering', 'Communication Procedures', 'Map Reading Advanced'
  ]},
  // 3. Navy
  { wing: 'Navy', level: 'A', courses: [
    'Naval Orientation', 'Parts of Ship', 'Seamanship', 'Boat Pulling', 'Rigging', 'Naval Communication Basics'
  ]},
  { wing: 'Navy', level: 'B', courses: [
    'Navigation', 'Anchoring', 'Ship Modelling', 'Naval Signals', 'Boat Sailing', 'Tides & Compass'
  ]},
  { wing: 'Navy', level: 'C', courses: [
    'Advanced Navigation', 'Naval Warfare Basics', 'Ship Organisation', 'Communication Systems', 'Sailing Expeditions', 'Naval Weapons Basics', 'Leadership at Sea'
  ]},
  // 4. Air Force
  { wing: 'Air Force', level: 'A', courses: [
    'Principles of Flight', 'Airframe & Aircraft Parts', 'Flying Basics', 'Aviation History', 'Aero Modelling', 'Air Navigation Basics'
  ]},
  { wing: 'Air Force', level: 'B', courses: [
    'Aircraft Instruments', 'Meteorology', 'Air Traffic Control Basics', 'Navigation Advanced', 'Aero Engines', 'Map Reading for Aviation'
  ]},
  { wing: 'Air Force', level: 'C', courses: [
    'Advanced Aviation Subjects', 'Flight Navigation', 'Aircraft Recognition', 'Air Power & Warfare', 'Aero Engine Systems', 'Aviation Safety', 'Air Force Leadership & Communication'
  ]}
];

// Stable hash function to generate deterministic UUIDs
const generateStableId = (prefix, name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${prefix}-0000-0000-0000-${hex.padStart(12, '0')}`;
};

const courseIdMap = {
  'NCC At a Glance': 'a1000000-0000-0000-0000-000000000001',
  'Drill & Commands': 'a1000000-0000-0000-0000-000000000002',
  'National Integration': 'a1000000-0000-0000-0000-000000000003',
  'Health, Hygiene & Sanitation': 'a1000000-0000-0000-0000-000000000004',
  'Map Reading': 'a1000000-0000-0000-0000-000000000005',
  'Weapon Training': 'a1000000-0000-0000-0000-000000000006'
};

const getCourseId = (title, wing, level) => {
  if (courseIdMap[title]) return courseIdMap[title];
  return generateStableId('a1000000', `${wing}-${level}-${title}`);
};

const generatedCourses = [];
const generatedModules = [];
const generatedChapters = [];
const generatedQuestionBanks = [];
const generatedQuestions = [];
const generatedTests = [];

SYLLABUS_DEFINITION.forEach((def) => {
  def.courses.forEach((title, cIndex) => {
    const courseId = getCourseId(title, def.wing, def.level);
    const duration = 4 + (cIndex % 7);

    generatedCourses.push({
      id: courseId,
      title: title,
      description: `${title} official training course for Certificate ${def.level} cadets in the ${def.wing} wing.`,
      target_wing: def.wing,
      certificate_level: def.level,
      duration_hours: duration
    });

    const isSingleModule = (title === 'NCC At a Glance');
    const mod1Id = generateStableId('b1000000', courseId + '1');
    const mod2Id = generateStableId('b1000000', courseId + '2');

    let module1Title = `Core Concepts of ${title}`;
    let module2Title = `Practical Training & Operations`;

    if (title === 'NCC At a Glance') {
      module1Title = 'NCC History, Aims & Organisation';
    } else if (title === 'Drill & Commands') {
      module1Title = 'Basic Foot Drill';
      module2Title = 'Parade Formations';
    } else if (title === 'Health, Hygiene & Sanitation') {
      module1Title = 'First Aid Fundamentals';
      module2Title = 'Personal Hygiene';
    } else if (title === 'Map Reading') {
      module1Title = 'Introduction to Maps';
      module2Title = 'Compass & Navigation';
    }

    if (isSingleModule) {
      generatedModules.push(
        { id: mod1Id, course_id: courseId, title: module1Title, order_index: 1 }
      );
    } else {
      generatedModules.push(
        { id: mod1Id, course_id: courseId, title: module1Title, order_index: 1 },
        { id: mod2Id, course_id: courseId, title: module2Title, order_index: 2 }
      );
    }

    const ch1Id = generateStableId('c1000000', courseId + '1-1');
    const ch2Id = generateStableId('c1000000', courseId + '1-2');
    const ch3Id = generateStableId('c1000000', courseId + '2-1');
    const ch4Id = generateStableId('c1000000', courseId + '2-2');

    let ch1 = {
      id: ch1Id,
      module_id: mod1Id,
      title: `Introduction to ${title}`,
      content_type: 'markdown',
      content_data: null,
      order_index: 1,
      content: `# Introduction to ${title}\n\n## Overview\nThis chapter covers the basic fundamentals of **${title}**, required for National Cadet Corps (NCC) Certificate **${def.level}** cadets of the **${def.wing}** wing.`
    };

    let ch2 = {
      id: ch2Id,
      module_id: mod1Id,
      title: `Theoretical Principles of ${title}`,
      content_type: 'markdown',
      content_data: null,
      order_index: 2,
      content: `# Theoretical Principles of ${title}\n\n## Study Material\nHere we explore the detailed guidelines and regulations surrounding **${title}**.`
    };

    let ch3 = {
      id: ch3Id,
      module_id: mod2Id,
      title: `Practical Training & Operations`,
      content_type: 'markdown',
      content_data: null,
      order_index: 1,
      content: `# Practical Training & Operations\n\n## Field Training\nThis section outlines the practical activities and camp drills associated with **${title}**.`
    };

    let ch4 = {
      id: ch4Id,
      module_id: mod2Id,
      title: `Mock Evaluation & Exercises`,
      content_type: 'markdown',
      content_data: null,
      order_index: 2,
      content: `# Mock Evaluation & Exercises\n\n## Self-Assessment\nTo prepare for your Certificate examination, answer the following questions.`
    };

    if (title === 'NCC At a Glance') {
      ch1 = {
        id: 'c1000000-0000-0000-0000-000000000001',
        module_id: mod1Id,
        title: 'NCC Training Slideshow',
        content_type: 'embed',
        order_index: 1,
        content_data: {
          embed_url: 'https://docs.google.com/presentation/d/11HaCvdxdSy4TXuh7HfnX7wWDA2Mkvgv2/embed?start=false&loop=false&delayms=3000'
        },
        content: 'Interactive Google Slides Presentation'
      };
    } else if (title === 'Drill & Commands') {
      ch1 = {
        id: 'c1000000-0000-0000-0000-000000000004',
        module_id: mod1Id,
        title: 'Attention and Stand at Ease',
        content_type: 'markdown',
        content_data: null,
        order_index: 1,
        content: `# Attention and Stand at Ease\n\n## Position of Attention (Savdhan)\nThe Position of Attention is the basic military position.`
      };
      ch2 = {
        id: 'c1000000-0000-0000-0000-000000000005',
        module_id: mod1Id,
        title: 'Turning and Saluting',
        content_type: 'markdown',
        content_data: null,
        order_index: 2,
        content: `# Turning and Saluting\n\n## Turnings at the Halt\nAll turnings are done in two movements.`
      };
    } else if (title === 'Health, Hygiene & Sanitation') {
      ch1 = {
        id: 'c1000000-0000-0000-0000-000000000006',
        module_id: mod1Id,
        title: 'Fractures and Bandaging',
        content_type: 'markdown',
        content_data: null,
        order_index: 1,
        content: `# Fractures and Bandaging\n\n## Types of Fractures\n1. Simple (Closed): Bone breaks but skin is intact.`
      };
    } else if (title === 'Map Reading') {
      ch1 = {
        id: 'c1000000-0000-0000-0000-000000000007',
        module_id: mod1Id,
        title: 'Topographic Maps and Conventional Signs',
        content_type: 'markdown',
        content_data: null,
        order_index: 1,
        content: `# Topographic Maps and Conventional Signs\n\n## What is a Topographic Map?`
      };
    }

    if (title === 'NCC At a Glance') {
      generatedChapters.push(ch1);
    } else {
      generatedChapters.push(ch1, ch2, ch3, ch4);
    }

    const bankId = generateStableId('d1000000', courseId);
    generatedQuestionBanks.push({
      id: bankId,
      course_id: courseId,
      title: `${title} Bank`,
      description: `Questions on ${title}`
    });

    let questionsPool = [
      { id: generateStableId('f0000001', courseId), bank_id: bankId, question_text: `What is the primary objective of ${title}?`, question_type: 'mcq', options: ['Option A', 'Option B', 'Option C', 'Option D'], correct_answer: 'Option A', difficulty: 'easy', topic_tag: 'Introduction', explanation: 'Basic concept check.', points: 1 },
      { id: generateStableId('f0000002', courseId), bank_id: bankId, question_text: `Which wing is ${title} targeted for?`, question_type: 'mcq', options: ['Army', 'Navy', 'Air Force', 'All Wings'], correct_answer: def.wing === 'Common' ? 'All Wings' : def.wing, difficulty: 'medium', topic_tag: 'Targeting', explanation: 'Syllabus alignment check.', points: 1 }
    ];

    if (title === 'NCC At a Glance') {
      questionsPool = [
        { id: generateStableId('f0000001', courseId), bank_id: bankId, question_text: 'When was the NCC established in India?', question_type: 'mcq', options: ['1946', '1947', '1948', '1950'], correct_answer: '1948', difficulty: 'easy', topic_tag: 'History', explanation: 'NCC was established on 15 July 1948 under the NCC Act XXXI of 1948.', points: 1 },
        { id: generateStableId('f0000002', courseId), bank_id: bankId, question_text: 'What is the motto of the NCC?', question_type: 'mcq', options: ['Service Before Self', 'Unity and Discipline', 'Duty Honor Country', 'Jai Hind'], correct_answer: 'Unity and Discipline', difficulty: 'easy', topic_tag: 'Basics', explanation: 'The NCC motto is "Unity and Discipline".', points: 1 },
        { id: generateStableId('f0000003', courseId), bank_id: bankId, question_text: 'Who was the first Director General of NCC?', question_type: 'mcq', options: ['Lt Gen Grubb', 'Gen Cariappa', 'Maj Gen Sinha', 'Gen Thimayya'], correct_answer: 'Lt Gen Grubb', difficulty: 'medium', topic_tag: 'History', explanation: 'Lt Gen Grubb was the first DG of NCC appointed in 1948.', points: 1 },
        { id: generateStableId('f0000004', courseId), bank_id: bankId, question_text: 'The NCC was raised on the recommendation of which committee?', question_type: 'mcq', options: ['Kunzru Committee', 'Nehru Committee', 'Patel Committee', 'Kothari Committee'], correct_answer: 'Kunzru Committee', difficulty: 'medium', topic_tag: 'History', explanation: 'Raised on recommendation of Pandit H.N. Kunzru Committee in 1946.', points: 1 }
      ];
    } else if (title === 'Drill & Commands') {
      questionsPool = [
        { id: generateStableId('f0000001', courseId), bank_id: bankId, question_text: 'What is the angle formed between feet in Attention position?', question_type: 'mcq', options: ['15 degrees', '30 degrees', '45 degrees', '60 degrees'], correct_answer: '30 degrees', difficulty: 'easy', topic_tag: 'Foot Drill', explanation: 'In Savdhan, feet are turned out equally forming an angle of 30 degrees.', points: 1 },
        { id: generateStableId('f0000002', courseId), bank_id: bankId, question_text: 'What is the distance between feet in Stand at Ease position?', question_type: 'mcq', options: ['8 inches', '10 inches', '12 inches', '15 inches'], correct_answer: '12 inches', difficulty: 'easy', topic_tag: 'Foot Drill', explanation: 'In Vishram, the left foot moves 12 inches (or 30 cm) to the left.', points: 1 },
        { id: generateStableId('f0000003', courseId), bank_id: bankId, question_text: 'About Turn involves rotation of how many degrees?', question_type: 'mcq', options: ['90 degrees', '120 degrees', '180 degrees', '360 degrees'], correct_answer: '180 degrees', difficulty: 'easy', topic_tag: 'Turnings', explanation: 'About Turn (Peeche Mud) involves a 180-degree turn to the right.', points: 1 },
        { id: generateStableId('f0000004', courseId), bank_id: bankId, question_text: 'The word of command has how many parts?', question_type: 'mcq', options: ['1', '2', '3', '4'], correct_answer: '2', difficulty: 'easy', topic_tag: 'Commands', explanation: 'Word of command has Cautionary (alert) and Executive (action) parts.', points: 1 }
      ];
    } else if (title === 'Map Reading') {
      questionsPool = [
        { id: generateStableId('f0000001', courseId), bank_id: bankId, question_text: 'On a topographic map, blue color represents?', question_type: 'mcq', options: ['Roads', 'Vegetation', 'Water features', 'Contour lines'], correct_answer: 'Water features', difficulty: 'easy', topic_tag: 'Conventional Signs', explanation: 'Blue is used for water features like rivers, lakes, and wells.', points: 1 },
        { id: generateStableId('f0000002', courseId), bank_id: bankId, question_text: 'Contour lines that are close together indicate?', question_type: 'mcq', options: ['Flat ground', 'Gentle slope', 'Steep slope', 'Valley'], correct_answer: 'Steep slope', difficulty: 'easy', topic_tag: 'Contours', explanation: 'Close contour lines indicate steep slopes.', points: 1 }
      ];
    }

    generatedQuestions.push(...questionsPool);

    const testId = generateStableId('e1000000', courseId);
    generatedTests.push({
      id: testId,
      course_id: courseId,
      title: `${title} Assessment`,
      description: `Practice assessment covering ${title} for Certificate ${def.level} cadets.`,
      test_type: 'practice',
      duration_minutes: 15,
      question_count: questionsPool.length,
      passing_score: 50,
      randomize_questions: true,
      target_wing: def.wing,
      is_active: true
    });
  });
});

let sql = `-- 00015_complete_syllabus_seeds.sql
-- This migration seeds all 93 syllabus courses, modules, chapters, tests, question banks, and questions.
-- Ensures database parity with the frontend mock generator.

BEGIN;

-- Drop the old content type check constraint and add the new one that allows 'embed'
ALTER TABLE public.chapters DROP CONSTRAINT IF EXISTS chapters_content_type_check;
ALTER TABLE public.chapters ADD CONSTRAINT chapters_content_type_check CHECK (content_type IN ('images', 'markdown', 'embed'));

-- Cascade truncate all tables related to courses to prevent duplicate keys
TRUNCATE public.courses CASCADE;

-- ============================================
-- COURSES
-- ============================================
INSERT INTO public.courses (id, title, description, target_wing, certificate_level, duration_hours) VALUES
`;

sql += generatedCourses.map(c => `('${c.id}', '${c.title.replace(/'/g, "''")}', '${c.description.replace(/'/g, "''")}', '${c.target_wing}', '${c.certificate_level}', ${c.duration_hours})`).join(',\n') + ';\n\n';

sql += `-- ============================================
-- MODULES
-- ============================================
INSERT INTO public.modules (id, course_id, title, order_index) VALUES
`;

sql += generatedModules.map(m => `('${m.id}', '${m.course_id}', '${m.title.replace(/'/g, "''")}', ${m.order_index})`).join(',\n') + ';\n\n';

sql += `-- ============================================
-- CHAPTERS
-- ============================================
INSERT INTO public.chapters (id, module_id, title, content_type, content_data, order_index, content) VALUES
`;

sql += generatedChapters.map(c => {
  const contentDataStr = c.content_data ? `'${JSON.stringify(c.content_data)}'::jsonb` : "'{}'::jsonb";
  return `('${c.id}', '${c.module_id}', '${c.title.replace(/'/g, "''")}', '${c.content_type}', ${contentDataStr}, ${c.order_index}, '${c.content.replace(/'/g, "''")}')`;
}).join(',\n') + ';\n\n';

sql += `-- ============================================
-- QUESTION BANKS
-- ============================================
INSERT INTO public.question_banks (id, course_id, title, description) VALUES
`;

sql += generatedQuestionBanks.map(qb => `('${qb.id}', '${qb.course_id}', '${qb.title.replace(/'/g, "''")}', '${qb.description.replace(/'/g, "''")}')`).join(',\n') + ';\n\n';

sql += `-- ============================================
-- QUESTIONS
-- ============================================
INSERT INTO public.questions (id, bank_id, question_text, question_type, options, correct_answer, difficulty, topic_tag, explanation, points) VALUES
`;

sql += generatedQuestions.map(q => {
  const optionsStr = `'${JSON.stringify(q.options)}'::jsonb`;
  return `('${q.id}', '${q.bank_id}', '${q.question_text.replace(/'/g, "''")}', '${q.question_type}', ${optionsStr}, '${q.correct_answer.replace(/'/g, "''")}', '${q.difficulty}', '${q.topic_tag.replace(/'/g, "''")}', '${q.explanation.replace(/'/g, "''")}', ${q.points})`;
}).join(',\n') + ';\n\n';

sql += `-- ============================================
-- TESTS
-- ============================================
INSERT INTO public.tests (id, course_id, title, description, test_type, duration_minutes, question_count, passing_score, randomize_questions, target_wing, is_active) VALUES
`;

sql += generatedTests.map(t => {
  const randVal = t.randomize_questions ?? true;
  return `('${t.id}', '${t.course_id}', '${t.title.replace(/'/g, "''")}', '${t.description.replace(/'/g, "''")}', '${t.test_type}', ${t.duration_minutes}, ${t.question_count}, ${t.passing_score}, ${randVal}, '${t.target_wing}', ${t.is_active})`;
}).join(',\n') + ';\n\n';

sql += 'COMMIT;\n';

fs.writeFileSync(path.join(__dirname, 'supabase', 'migrations', '00015_complete_syllabus_seeds.sql'), sql);
console.log('Successfully generated SQL migration file: 00015_complete_syllabus_seeds.sql');
