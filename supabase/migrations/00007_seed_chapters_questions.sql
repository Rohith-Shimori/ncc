-- 00007_seed_chapters_questions.sql — Chapters with real NCC content + Questions + Tests

-- ============================================
-- CHAPTERS (with real markdown content)
-- content_data JSONB is required (NOT NULL from 00002)
-- content TEXT is the 00005 enhancement column
-- ============================================

-- Module: History & Evolution of NCC
INSERT INTO chapters (id, module_id, title, content_type, content_data, order_index, content) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Origin and Establishment of NCC', 'markdown',
'{"markdown": "# Origin and Establishment of NCC\n\n## Background\nThe National Cadet Corps (NCC) came into existence on **15 July 1948** under the NCC Act XXXI of 1948. It was raised on the recommendation of **Pandit H.N. Kunzru Committee** in 1946.\n\n## Historical Roots\n- **1666**: First Volunteer Corps raised in India\n- **1917**: University Corps established during World War I\n- **1942**: University Officers Training Corps (UOTC) formed\n- **1948**: NCC established, replacing the UOTC\n\n## NCC Motto\n**Unity and Discipline** (एकता और अनुशासन)\n\n## NCC Pledge\nWe the cadets of the National Cadet Corps do solemnly pledge that we shall always uphold the unity of India.\n\n## NCC Song\nThe NCC Song **Hum Sab Bharatiya Hain** was written by **Sudarshan Faakir**."}',
1,
'# Origin and Establishment of NCC

## Background
The National Cadet Corps (NCC) came into existence on **15 July 1948** under the NCC Act XXXI of 1948. It was raised on the recommendation of **Pandit H.N. Kunzru Committee** in 1946.

## Historical Roots
- **1666**: First Volunteer Corps raised in India
- **1917**: University Corps established during World War I
- **1942**: University Officers Training Corps (UOTC) formed
- **1948**: NCC established, replacing the UOTC

## Key Facts
| Detail | Information |
|--------|------------|
| Established | 15 July 1948 |
| First DG | Lt Gen Grubb |
| Parent Ministry | Ministry of Defence |
| Headquarters | New Delhi |
| Current Strength | ~14 Lakh cadets |

## NCC Motto
**"Unity and Discipline"** (एकता और अनुशासन)

## NCC Pledge
> We the cadets of the National Cadet Corps do solemnly pledge that we shall always uphold the unity of India. We shall never resort to violence and shall strive to be worthy citizens of our country.

## NCC Song
The NCC Song **"Hum Sab Bharatiya Hain"** was written by **Sudarshan Faakir** and composed by the great poet himself.'),

('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'NCC Aims and Objectives', 'markdown',
'{"markdown": "# NCC Aims and Objectives\n\n## Primary Aims\n1. Character Building\n2. Unity\n3. Service\n\n## Three Cardinal Principles\n1. Sense of Duty and Discipline\n2. Secular Outlook and Respect for Diversity\n3. Spirit of Selfless Service"}',
2,
'# NCC Aims and Objectives

## Primary Aims
1. **Character Building** — Develop qualities of character, courage, comradeship, discipline, leadership, secular outlook, spirit of adventure, and ideals of selfless service
2. **Unity** — Create a human resource of organized, trained, and motivated youth to provide leadership in all walks of life
3. **Service** — Provide a suitable environment to motivate the youth to take up a career in the Armed Forces

## Core Objectives
- To develop character, comradeship, discipline, and a secular outlook
- To create a pool of organized, trained, and motivated youth with leadership qualities
- To provide a suitable environment to motivate the youth to take up career in Armed Forces
- To develop qualities of selfless service among the youth

## Three Cardinal Principles
1. **Sense of Duty and Discipline**
2. **Secular Outlook and Respect for Diversity**
3. **Spirit of Selfless Service**

## NCC Flag
The NCC flag has three colors representing the three wings:
- **Red** — Army Wing
- **Dark Blue** — Navy Wing
- **Light Blue** — Air Force Wing

The NCC crest is in the center with the motto "Unity and Discipline" inscribed below.'),

('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'NCC Certificates - A, B & C', 'markdown',
'{"markdown": "# NCC Certificates — A, B and C\n\n## A Certificate\nClass VIII-X, 2 years JD/JW, Written 100 + Practical 100\n\n## B Certificate\nClass XI-XII / 1st-2nd year college, Written 150 + Practical 150\n\n## C Certificate\n2nd-3rd year college, Written 200 + Practical 200, Direct entry Armed Forces"}',
3,
'# NCC Certificates — A, B & C

## Certificate Levels

### A Certificate
- **Eligibility**: Class VIII to X (2 years in JD/JW)
- **Exam Pattern**: Written (100 marks) + Practical (100 marks)
- **Key Benefits**: 5-10 bonus marks in various state board exams

### B Certificate
- **Eligibility**: Class XI to XII / 1st & 2nd year college (2 years in SD/SW)
- **Exam Pattern**: Written (150 marks) + Practical (150 marks)
- **Key Benefits**: Preference in government jobs, bonus marks in competitive exams

### C Certificate
- **Eligibility**: 2nd & 3rd year college (minimum 3 years total NCC)
- **Exam Pattern**: Written (200 marks) + Practical (200 marks)
- **Key Benefits**: Direct entry in Armed Forces (Short Service Commission), exemption from CDS written exam

## Exam Pattern (Latest)
| Component | A Cert | B Cert | C Cert |
|-----------|--------|--------|--------|
| Written | 100 | 150 | 200 |
| Practical/Drill | 60 | 80 | 120 |
| Camp Attendance | 40 | 70 | 80 |
| **Total** | **200** | **300** | **400** |
| Passing % | 45% | 50% | 50% |

## Important Notes
- C Certificate holders get **direct entry** to Indian Military Academy (IMA) and Officers Training Academy (OTA)
- NCC C Certificate holders are **exempted from written exam** of CDS');

-- Module: Basic Foot Drill
INSERT INTO chapters (id, module_id, title, content_type, content_data, order_index, content) VALUES
('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'Attention and Stand at Ease', 'markdown',
'{"markdown": "# Attention and Stand at Ease\n\n## Position of Attention (Savdhan)\nHeels together, feet 30 degrees, knees straight, body erect.\n\n## Stand at Ease (Vishram)\nLeft foot 15 inches to the left, arms behind back."}',
1,
'# Attention and Stand at Ease

## Position of Attention (Savdhan)
The Position of Attention is the basic military position from which all drill movements begin.

### Correct Position
1. **Heels** together, touching and in line
2. **Feet** turned out equally, forming an angle of 30 degrees
3. **Knees** straight but not locked
4. **Body** erect, weight balanced on both feet
5. **Shoulders** level, square to the front
6. **Arms** hanging naturally, thumbs behind the second joint of the forefinger
7. **Head** erect, neck touching the collar, eyes looking straight ahead
8. **Chest** lifted naturally

### Word of Command
**"Squad — ATTENTION!"** (Daste — SAVDHAN!)
- Cautionary: "Squad" — to alert
- Executive: "ATTENTION" — to execute

## Stand at Ease (Vishram)
### Correct Position
1. Left foot moves **15 inches** (38 cm) to the left
2. Arms placed behind the back, right hand holding left hand
3. Body weight distributed equally on both feet
4. Remain silent and still

### Word of Command
**"Stand at — EASE!"** (Vishram!)'),

('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000004', 'Turning and Saluting', 'markdown',
'{"markdown": "# Turning and Saluting\n\n## Right Turn: 90 degrees right\n## Left Turn: 90 degrees left\n## About Turn: 180 degrees right\n\n## Hand Salute\nMiddle finger tip touches right eyebrow, upper arm horizontal."}',
2,
'# Turning and Saluting

## Turnings at the Halt
All turnings are done in two movements:

### Right Turn (Dahine Mud)
1. **Movement 1**: Turn 90° to the right on right heel and left toe
2. **Movement 2**: Bring left foot smartly alongside right foot

### Left Turn (Bayein Mud)
1. **Movement 1**: Turn 90° to the left on left heel and right toe
2. **Movement 2**: Bring right foot smartly alongside left foot

### About Turn (Peeche Mud)
1. **Movement 1**: Turn 180° to the right on right heel and left toe
2. **Movement 2**: Bring left foot smartly alongside right foot

## Saluting

### Hand Salute (Salami Shastra)
The salute is the military greeting. It is a mark of mutual respect and courtesy.

**How to perform:**
1. Raise right hand smartly by the shortest route
2. Fingers extended and close together, palm facing left
3. Tip of middle finger touches the right eyebrow (or cap brim)
4. Upper arm horizontal, forearm at 45 degrees
5. Hold for the required duration
6. Cut away smartly to the position of attention

### When to Salute
- National Flag and National Anthem
- All commissioned officers
- During funeral processions
- War memorials');

-- Module: First Aid
INSERT INTO chapters (id, module_id, title, content_type, content_data, order_index, content) VALUES
('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000011', 'Fractures and Bandaging', 'markdown',
'{"markdown": "# Fractures and Bandaging\n\n## Types: Simple, Compound, Greenstick, Comminuted\n## First Aid: Immobilize with splints above and below fracture\n## RICE: Rest, Ice, Compression, Elevation"}',
1,
'# Fractures and Bandaging

## Types of Fractures
1. **Simple (Closed)**: Bone breaks but skin is intact
2. **Compound (Open)**: Bone pierces through the skin
3. **Greenstick**: Incomplete fracture (common in children)
4. **Comminuted**: Bone shatters into multiple pieces

## Signs of Fracture
- Severe pain at the site
- Swelling and tenderness
- Deformity or unnatural position
- Loss of function of the limb
- Crepitus (grating sound)

## First Aid for Fractures
1. **Do NOT move** the casualty unnecessarily
2. **Immobilize** the fracture using splints
3. Apply splint **above and below** the fracture point
4. Pad the splint with soft material
5. Check circulation below the splint regularly
6. Treat for shock — keep warm, elevate legs

## Common Bandaging Techniques
| Type | Use |
|------|-----|
| Triangular | Arm sling, head wounds |
| Roller | Securing dressings |
| Figure-of-eight | Ankle, wrist joints |
| Spiral | Limbs |

> **Remember**: RICE — Rest, Ice, Compression, Elevation');

-- Module: Map Reading (Army)
INSERT INTO chapters (id, module_id, title, content_type, content_data, order_index, content) VALUES
('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000013', 'Topographic Maps and Conventional Signs', 'markdown',
'{"markdown": "# Topographic Maps and Conventional Signs\n\n## Map Colors: Black=man-made, Brown=contours, Blue=water, Green=vegetation, Red=roads\n## Grid References: 4-figure (1km), 6-figure (100m). Read Eastings first."}',
1,
'# Topographic Maps and Conventional Signs

## What is a Topographic Map?
A topographic map represents the physical features of the earth''s surface including hills, valleys, rivers, roads, and buildings using **contour lines** and **conventional signs**.

## Scale of Maps
| Scale | Type | Use |
|-------|------|-----|
| 1:25,000 | Large | Tactical operations |
| 1:50,000 | Medium | General military use |
| 1:250,000 | Small | Strategic planning |

## Conventional Signs
Conventional signs are **standardized symbols** used on maps:

### Colors Used
- **Black**: Man-made features (roads, buildings, text)
- **Brown**: Contour lines, earth features
- **Blue**: Water features (rivers, lakes, wells)
- **Green**: Vegetation (forests, orchards)
- **Red**: Main roads, important boundaries

## Contour Lines
- Lines joining points of **equal elevation**
- Close together = **steep slope**
- Far apart = **gentle slope**
- V-shaped pointing uphill = **valley/stream**
- V-shaped pointing downhill = **ridge/spur**

## Grid References
- **4-figure**: Identifies a grid square (e.g., 2345)
- **6-figure**: Pinpoints exact location (e.g., 234456)
- Always read **Eastings first**, then Northings
- Remember: **"Go along the corridor, then up the stairs"**');

-- ============================================
-- QUESTION BANKS & QUESTIONS
-- ============================================
INSERT INTO question_banks (id, course_id, title, description) VALUES
('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'NCC General Knowledge Bank', 'Questions on NCC history, aims, organization'),
('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Drill Training Bank', 'Questions on foot drill, parade, commands'),
('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'National Integration Bank', 'Questions on national awareness'),
('d1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'Health & First Aid Bank', 'Questions on hygiene and first aid'),
('d1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'Map Reading Bank', 'Questions on maps and navigation');

-- NCC General Questions
INSERT INTO questions (bank_id, question_text, question_type, options, correct_answer, difficulty, topic_tag, explanation, points) VALUES
('d1000000-0000-0000-0000-000000000001', 'When was the NCC established in India?', 'mcq', '["1946","1947","1948","1950"]', '1948', 'easy', 'History', 'NCC was established on 15 July 1948 under the NCC Act XXXI of 1948.', 1),
('d1000000-0000-0000-0000-000000000001', 'What is the motto of the NCC?', 'mcq', '["Service Before Self","Unity and Discipline","Duty Honor Country","Jai Hind"]', 'Unity and Discipline', 'easy', 'Basics', 'The NCC motto is "Unity and Discipline" (एकता और अनुशासन).', 1),
('d1000000-0000-0000-0000-000000000001', 'Who was the first Director General of NCC?', 'mcq', '["Lt Gen Grubb","Gen Cariappa","Maj Gen Sinha","Gen Thimayya"]', 'Lt Gen Grubb', 'medium', 'History', 'Lt Gen Grubb was the first DG of NCC appointed in 1948.', 1),
('d1000000-0000-0000-0000-000000000001', 'The NCC was raised on the recommendation of which committee?', 'mcq', '["Kunzru Committee","Nehru Committee","Patel Committee","Kothari Committee"]', 'Kunzru Committee', 'medium', 'History', 'Pandit H.N. Kunzru Committee (1946) recommended establishing NCC.', 1),
('d1000000-0000-0000-0000-000000000001', 'How many Directorates does NCC have across India?', 'mcq', '["15","17","19","21"]', '17', 'medium', 'Organization', 'NCC has 17 Directorates covering all states and UTs.', 1),
('d1000000-0000-0000-0000-000000000001', 'The NCC flag has how many colors?', 'mcq', '["2","3","4","5"]', '3', 'easy', 'Symbols', 'The NCC flag has three colors: Red (Army), Dark Blue (Navy), Light Blue (Air Force).', 1),
('d1000000-0000-0000-0000-000000000001', 'NCC Day is celebrated on which date?', 'mcq', '["4th Sunday of November","15 July","26 January","15 August"]', '4th Sunday of November', 'medium', 'Events', 'NCC Day is celebrated on the 4th Sunday of November every year.', 1),
('d1000000-0000-0000-0000-000000000001', 'The NCC song was written by?', 'mcq', '["Sudarshan Faakir","Gulzar","Pradeep","Sahir Ludhianvi"]', 'Sudarshan Faakir', 'medium', 'Culture', 'Sudarshan Faakir wrote the NCC song "Hum Sab Bharatiya Hain".', 1),
('d1000000-0000-0000-0000-000000000001', 'NCC headquarters is located in?', 'mcq', '["New Delhi","Mumbai","Pune","Bangalore"]', 'New Delhi', 'easy', 'Organization', 'NCC Directorate General is headquartered in New Delhi.', 1),
('d1000000-0000-0000-0000-000000000001', 'C Certificate holders of NCC get exemption from which exam?', 'mcq', '["CDS Written Exam","NDA Exam","SSB Interview","All of the above"]', 'CDS Written Exam', 'hard', 'Certificates', 'C Certificate holders are exempted from the written exam of CDS and get direct SSB entry.', 1),
('d1000000-0000-0000-0000-000000000001', 'Which ministry governs the NCC?', 'mcq', '["Ministry of Defence","Ministry of Education","Ministry of Home Affairs","Ministry of Youth Affairs"]', 'Ministry of Defence', 'easy', 'Organization', 'NCC functions under the Ministry of Defence, Government of India.', 1),
('d1000000-0000-0000-0000-000000000001', 'The red color in the NCC flag represents?', 'mcq', '["Army Wing","Navy Wing","Air Force Wing","All Wings"]', 'Army Wing', 'easy', 'Symbols', 'Red represents the Army Wing in the NCC flag.', 1);

-- Drill Questions
INSERT INTO questions (bank_id, question_text, question_type, options, correct_answer, difficulty, topic_tag, explanation, points) VALUES
('d1000000-0000-0000-0000-000000000002', 'At the position of attention, the angle between feet should be?', 'mcq', '["15 degrees","30 degrees","45 degrees","60 degrees"]', '30 degrees', 'easy', 'Foot Drill', 'At attention, feet are turned out equally forming a 30-degree angle.', 1),
('d1000000-0000-0000-0000-000000000002', 'In "Stand at Ease," the left foot moves how many inches to the left?', 'mcq', '["10 inches","12 inches","15 inches","18 inches"]', '15 inches', 'medium', 'Foot Drill', 'The left foot moves 15 inches (38 cm) to the left.', 1),
('d1000000-0000-0000-0000-000000000002', 'About Turn involves rotation of how many degrees?', 'mcq', '["90 degrees","120 degrees","180 degrees","360 degrees"]', '180 degrees', 'easy', 'Turnings', 'About Turn (Peeche Mud) involves a 180-degree turn to the right.', 1),
('d1000000-0000-0000-0000-000000000002', 'The word of command has how many parts?', 'mcq', '["1","2","3","4"]', '2', 'easy', 'Commands', 'Word of command has Cautionary (alert) and Executive (action) parts.', 1),
('d1000000-0000-0000-0000-000000000002', 'During hand salute, the tip of middle finger touches the?', 'mcq', '["Forehead","Right eyebrow","Left ear","Chin"]', 'Right eyebrow', 'medium', 'Saluting', 'The tip of the middle finger touches the right eyebrow or cap brim.', 1),
('d1000000-0000-0000-0000-000000000002', 'Quick march is done at how many paces per minute?', 'mcq', '["100","110","120","130"]', '120', 'medium', 'Marching', 'Quick march pace is 120 paces per minute, each pace 30 inches.', 1);

-- Map Reading Questions
INSERT INTO questions (bank_id, question_text, question_type, options, correct_answer, difficulty, topic_tag, explanation, points) VALUES
('d1000000-0000-0000-0000-000000000005', 'On a topographic map, blue color represents?', 'mcq', '["Roads","Vegetation","Water features","Contour lines"]', 'Water features', 'easy', 'Conventional Signs', 'Blue is used for water features like rivers, lakes, and wells.', 1),
('d1000000-0000-0000-0000-000000000005', 'Contour lines that are close together indicate?', 'mcq', '["Flat ground","Gentle slope","Steep slope","Valley"]', 'Steep slope', 'easy', 'Contours', 'Close contour lines indicate steep slopes.', 1),
('d1000000-0000-0000-0000-000000000005', 'A 6-figure grid reference pinpoints location to?', 'mcq', '["1 km square","100 m square","10 m square","1 m square"]', '100 m square', 'medium', 'Grid References', 'A 6-figure grid reference locates a point within a 100m square.', 1),
('d1000000-0000-0000-0000-000000000005', 'In grid references, which direction is read first?', 'mcq', '["Northings","Eastings","Southings","Westings"]', 'Eastings', 'medium', 'Grid References', 'Eastings are read first: "Along the corridor, then up the stairs."', 1),
('d1000000-0000-0000-0000-000000000005', 'Brown color on a map represents?', 'mcq', '["Water","Vegetation","Contour lines and earth","Buildings"]', 'Contour lines and earth', 'easy', 'Conventional Signs', 'Brown is used for contour lines and earth features.', 1);

-- Health & First Aid Questions
INSERT INTO questions (bank_id, question_text, question_type, options, correct_answer, difficulty, topic_tag, explanation, points) VALUES
('d1000000-0000-0000-0000-000000000004', 'RICE in first aid stands for?', 'mcq', '["Rest Ice Compression Elevation","Run Ice Cold Evaluate","Rest Inject Compress Elevate","None of the above"]', 'Rest Ice Compression Elevation', 'easy', 'First Aid', 'RICE: Rest, Ice, Compression, Elevation — standard treatment for sprains.', 1),
('d1000000-0000-0000-0000-000000000004', 'A compound fracture means?', 'mcq', '["Bone cracks partially","Bone breaks and pierces skin","Bone bends","Bone is crushed"]', 'Bone breaks and pierces skin', 'easy', 'Fractures', 'In a compound (open) fracture, the bone pierces through the skin.', 1),
('d1000000-0000-0000-0000-000000000004', 'When applying a splint, it should extend?', 'mcq', '["Only above the break","Only below the break","Above and below the break","Only at the break point"]', 'Above and below the break', 'medium', 'Fractures', 'Splints must immobilize joints above and below the fracture.', 1),
('d1000000-0000-0000-0000-000000000004', 'The normal human body temperature is?', 'mcq', '["36.5°C","37°C","38°C","35°C"]', '37°C', 'easy', 'Health', 'Normal body temperature is 37°C (98.6°F).', 1);

-- ============================================
-- TESTS
-- ============================================
INSERT INTO tests (id, course_id, title, description, test_type, duration_minutes, question_count, passing_score, target_wing) VALUES
('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'NCC General Quiz - A Certificate', 'Practice quiz covering NCC history, aims, and organization.', 'practice', 15, 10, 60, 'Common'),
('e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'A Certificate Mock Exam', 'Full mock exam simulating A Certificate written test.', 'mock', 30, 12, 50, 'Common'),
('e1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Drill Commands Assessment', 'Test your knowledge of drill positions and commands.', 'practice', 15, 6, 60, 'Common'),
('e1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 'Map Reading Assessment', 'Army wing assessment on topographic maps and navigation.', 'practice', 20, 5, 60, 'Army'),
('e1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000004', 'First Aid Quiz', 'Test on fractures, bandaging, and first aid techniques.', 'practice', 15, 4, 60, 'Common'),
('e1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'B Certificate Mock Exam', 'Comprehensive mock exam for B Certificate preparation.', 'mock', 60, 12, 50, 'Common');

-- ============================================
-- ANNOUNCEMENTS
-- ============================================
INSERT INTO announcements (title, content, priority, target_wing) VALUES
('Annual Training Camp 2026', 'Registration is now open for the Annual Training Camp (ATC) at NCC Academy, Delhi Cantt. All B & C certificate cadets are eligible. Report date: 1 June 2026.', 'high', 'Common'),
('B Certificate Exam Schedule', 'B Certificate written examination scheduled for 15 July 2026. Mock tests are now available on the platform. Start practicing today!', 'high', 'Common'),
('Republic Day Camp Selection', 'RDC 2027 selection trials will begin in September. Only cadets with outstanding performance in CATC/ATC are eligible.', 'normal', 'Common'),
('Army Wing: Firing Practice', 'Live firing practice with .22 Rifle scheduled for next weekend at the Range. Mandatory for all Army wing B/C cert cadets.', 'normal', 'Army'),
('Navy Wing: Sailing Camp', 'Naval wing sailing camp at INS Chilka for selected cadets. Apply through your ANO before 20 May 2026.', 'normal', 'Navy');
