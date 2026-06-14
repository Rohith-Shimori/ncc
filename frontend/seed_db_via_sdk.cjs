const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Read environment variables from .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseAnonKey = env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Data Definition
const SYLLABUS_DEFINITION = [
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
  { wing: 'Army', level: 'A', courses: [
    'Field Craft Basics', 'Drill with Arms', 'Weapon Training', 'Section Formation', 'Guard Mounting', 'Battle Craft Basics'
  ]},
  { wing: 'Army', level: 'B', courses: [
    'Advanced Weapon Training', 'Field Signals', 'Patrolling', 'Camouflage & Concealment', 'Section Battle Drill', 'Ambush & Defence'
  ]},
  { wing: 'Army', level: 'C', courses: [
    'Tactical Exercises', 'Platoon Formation', 'Advanced Battle Craft', 'Internal Security Duties', 'Field Engineering', 'Communication Procedures', 'Map Reading Advanced'
  ]},
  { wing: 'Navy', level: 'A', courses: [
    'Naval Orientation', 'Parts of Ship', 'Seamanship', 'Boat Pulling', 'Rigging', 'Naval Communication Basics'
  ]},
  { wing: 'Navy', level: 'B', courses: [
    'Navigation', 'Anchoring', 'Ship Modelling', 'Naval Signals', 'Boat Sailing', 'Tides & Compass'
  ]},
  { wing: 'Navy', level: 'C', courses: [
    'Advanced Navigation', 'Naval Warfare Basics', 'Ship Organisation', 'Communication Systems', 'Sailing Expeditions', 'Naval Weapons Basics', 'Leadership at Sea'
  ]},
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
      content_data: {},
      order_index: 1,
      content: `# Introduction to ${title}\n\n## Overview\nThis chapter covers the basic fundamentals of **${title}**, required for National Cadet Corps (NCC) Certificate **${def.level}** cadets of the **${def.wing}** wing.`
    };

    let ch2 = {
      id: ch2Id,
      module_id: mod1Id,
      title: `Theoretical Principles of ${title}`,
      content_type: 'markdown',
      content_data: {},
      order_index: 2,
      content: `# Theoretical Principles of ${title}\n\n## Study Material\nHere we explore the detailed guidelines and regulations surrounding **${title}**.`
    };

    let ch3 = {
      id: ch3Id,
      module_id: mod2Id,
      title: `Practical Training & Operations`,
      content_type: 'markdown',
      content_data: {},
      order_index: 1,
      content: `# Practical Training & Operations\n\n## Field Training\nThis section outlines the practical activities and camp drills associated with **${title}**.`
    };

    let ch4 = {
      id: ch4Id,
      module_id: mod2Id,
      title: `Mock Evaluation & Exercises`,
      content_type: 'markdown',
      content_data: {},
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
        content_data: {},
        order_index: 1,
        content: `# Attention and Stand at Ease\n\n## Position of Attention (Savdhan)\nThe Position of Attention is the basic military position.`
      };
      ch2 = {
        id: 'c1000000-0000-0000-0000-000000000005',
        module_id: mod1Id,
        title: 'Turning and Saluting',
        content_type: 'markdown',
        content_data: {},
        order_index: 2,
        content: `# Turning and Saluting\n\n## Turnings at the Halt\nAll turnings are done in two movements.`
      };
    } else if (title === 'Health, Hygiene & Sanitation') {
      ch1 = {
        id: 'c1000000-0000-0000-0000-000000000006',
        module_id: mod1Id,
        title: 'Fractures and Bandaging',
        content_type: 'markdown',
        content_data: {},
        order_index: 1,
        content: `# Fractures and Bandaging\n\n## Types of Fractures\n1. Simple (Closed): Bone breaks but skin is intact.`
      };
    } else if (title === 'Map Reading') {
      ch1 = {
        id: 'c1000000-0000-0000-0000-000000000007',
        module_id: mod1Id,
        title: 'Topographic Maps and Conventional Signs',
        content_type: 'markdown',
        content_data: {},
        order_index: 1,
        content: `# Topographic Maps and Conventional Signs\n\n## What is a Topographic Map?`
      };
    }

    if (isSingleModule) {
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

async function run() {
  console.log('Signing in to Supabase...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@ncc.gov.in',
    password: 'Admin@123'
  });

  if (authError) {
    console.error('Authentication failed:', authError.message);
    process.exit(1);
  }

  console.log('Authenticated successfully. User ID:', authData.user.id);

  // Set the authorization header for client requests
  supabase.auth.setSession(authData.session);

  console.log('Cleaning up existing data...');
  // Delete in reverse dependency order
  await supabase.from('test_attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('question_banks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('chapters').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('modules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('Inserting courses...');
  const { error: errCourses } = await supabase.from('courses').insert(generatedCourses);
  if (errCourses) { console.error('Error inserting courses:', errCourses); process.exit(1); }

  console.log('Inserting modules...');
  // Insert in batches of 50 to prevent size limit errors
  for (let i = 0; i < generatedModules.length; i += 50) {
    const { error: errMod } = await supabase.from('modules').insert(generatedModules.slice(i, i + 50));
    if (errMod) { console.error('Error inserting modules:', errMod); process.exit(1); }
  }

  console.log('Inserting chapters...');
  // Insert in batches of 30
  for (let i = 0; i < generatedChapters.length; i += 30) {
    const { error: errCh } = await supabase.from('chapters').insert(generatedChapters.slice(i, i + 30));
    if (errCh) { console.error('Error inserting chapters:', errCh); process.exit(1); }
  }

  console.log('Inserting question banks...');
  const { error: errBanks } = await supabase.from('question_banks').insert(generatedQuestionBanks);
  if (errBanks) { console.error('Error inserting banks:', errBanks); process.exit(1); }

  console.log('Inserting questions...');
  // Insert in batches of 30
  for (let i = 0; i < generatedQuestions.length; i += 30) {
    const { error: errQ } = await supabase.from('questions').insert(generatedQuestions.slice(i, i + 30));
    if (errQ) { console.error('Error inserting questions:', errQ); process.exit(1); }
  }

  console.log('Inserting tests...');
  const { error: errTests } = await supabase.from('tests').insert(generatedTests);
  if (errTests) { console.error('Error inserting tests:', errTests); process.exit(1); }

  console.log('DB successfully seeded!');
}

run();
