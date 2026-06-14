-- 00015_complete_syllabus_seeds.sql
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
('a1000000-0000-0000-0000-000000000001', 'NCC At a Glance', 'NCC At a Glance official training course for Certificate A cadets in the Common wing.', 'Common', 'A', 4),
('a1000000-0000-0000-0000-000000000002', 'Drill & Commands', 'Drill & Commands official training course for Certificate A cadets in the Common wing.', 'Common', 'A', 5),
('a1000000-0000-0000-0000-00002d6df6d2', 'Weapon Training & Infantry Weapons', 'Weapon Training & Infantry Weapons official training course for Certificate A cadets in the Common wing.', 'Common', 'A', 6),
('a1000000-0000-0000-0000-000000000003', 'National Integration', 'National Integration official training course for Certificate A cadets in the Common wing.', 'Common', 'A', 7),
('a1000000-0000-0000-0000-0000174a3d1e', 'Leadership & Personality Development', 'Leadership & Personality Development official training course for Certificate A cadets in the Common wing.', 'Common', 'A', 8),
('a1000000-0000-0000-0000-000071e9b09d', 'Civil Defence & Disaster Management', 'Civil Defence & Disaster Management official training course for Certificate A cadets in the Common wing.', 'Common', 'A', 9),
('a1000000-0000-0000-0000-000057c82e75', 'Social Service & Awareness', 'Social Service & Awareness official training course for Certificate A cadets in the Common wing.', 'Common', 'A', 10),
('a1000000-0000-0000-0000-000000000004', 'Health, Hygiene & Sanitation', 'Health, Hygiene & Sanitation official training course for Certificate A cadets in the Common wing.', 'Common', 'A', 4),
('a1000000-0000-0000-0000-00005409f313', 'Yoga & Asanas', 'Yoga & Asanas official training course for Certificate A cadets in the Common wing.', 'Common', 'A', 5),
('a1000000-0000-0000-0000-00001aefb067', 'Home Nursing', 'Home Nursing official training course for Certificate A cadets in the Common wing.', 'Common', 'A', 6),
('a1000000-0000-0000-0000-000000490880', 'Posture Training', 'Posture Training official training course for Certificate A cadets in the Common wing.', 'Common', 'A', 7),
('a1000000-0000-0000-0000-0000240e6113', 'Obstacles Training & Adventure Activities', 'Obstacles Training & Adventure Activities official training course for Certificate A cadets in the Common wing.', 'Common', 'A', 8),
('a1000000-0000-0000-0000-000008b4468c', 'Career in Defence Services', 'Career in Defence Services official training course for Certificate B cadets in the Common wing.', 'Common', 'B', 4),
('a1000000-0000-0000-0000-000038908d40', 'Services Tests & Interviews', 'Services Tests & Interviews official training course for Certificate B cadets in the Common wing.', 'Common', 'B', 5),
('a1000000-0000-0000-0000-000039ef9e7c', 'Self-Defence', 'Self-Defence official training course for Certificate B cadets in the Common wing.', 'Common', 'B', 6),
('a1000000-0000-0000-0000-00003c4316e3', 'Environment and Ecology', 'Environment and Ecology official training course for Certificate B cadets in the Common wing.', 'Common', 'B', 7),
('a1000000-0000-0000-0000-0000199562e4', 'Famous Leaders of India', 'Famous Leaders of India official training course for Certificate B cadets in the Common wing.', 'Common', 'B', 8),
('a1000000-0000-0000-0000-000071fe9b19', 'History of India', 'History of India official training course for Certificate B cadets in the Common wing.', 'Common', 'B', 9),
('a1000000-0000-0000-0000-00000ba7d77f', 'Armed Forces & Military History', 'Armed Forces & Military History official training course for Certificate B cadets in the Common wing.', 'Common', 'B', 10),
('a1000000-0000-0000-0000-000000000005', 'Map Reading', 'Map Reading official training course for Certificate B cadets in the Common wing.', 'Common', 'B', 4),
('a1000000-0000-0000-0000-0000382075a9', 'Communication', 'Communication official training course for Certificate B cadets in the Common wing.', 'Common', 'B', 5),
('a1000000-0000-0000-0000-0000266d0d05', 'Field Craft & Battle Craft', 'Field Craft & Battle Craft official training course for Certificate B cadets in the Common wing.', 'Common', 'B', 6),
('a1000000-0000-0000-0000-000016a26b66', 'Personality Development & Officer Like Qualities (OLQs)', 'Personality Development & Officer Like Qualities (OLQs) official training course for Certificate B cadets in the Common wing.', 'Common', 'B', 7),
('a1000000-0000-0000-0000-00004a803f19', 'Disaster Management & Social Awareness', 'Disaster Management & Social Awareness official training course for Certificate B cadets in the Common wing.', 'Common', 'B', 8),
('a1000000-0000-0000-0000-00002ba41949', 'Advanced Leadership', 'Advanced Leadership official training course for Certificate C cadets in the Common wing.', 'Common', 'C', 4),
('a1000000-0000-0000-0000-00000b8cf529', 'Advanced Drill', 'Advanced Drill official training course for Certificate C cadets in the Common wing.', 'Common', 'C', 5),
('a1000000-0000-0000-0000-000019d3bbde', 'National Security', 'National Security official training course for Certificate C cadets in the Common wing.', 'Common', 'C', 6),
('a1000000-0000-0000-0000-000017470581', 'Armed Forces Organisation', 'Armed Forces Organisation official training course for Certificate C cadets in the Common wing.', 'Common', 'C', 7),
('a1000000-0000-0000-0000-0000636a9bea', 'Disaster Management', 'Disaster Management official training course for Certificate C cadets in the Common wing.', 'Common', 'C', 8),
('a1000000-0000-0000-0000-000015e087f8', 'Social Service & Community Development', 'Social Service & Community Development official training course for Certificate C cadets in the Common wing.', 'Common', 'C', 9),
('a1000000-0000-0000-0000-00000f5e0237', 'Personality Development & Communication Skills', 'Personality Development & Communication Skills official training course for Certificate C cadets in the Common wing.', 'Common', 'C', 10),
('a1000000-0000-0000-0000-00007f311b52', 'Map Reading & Navigation', 'Map Reading & Navigation official training course for Certificate C cadets in the Common wing.', 'Common', 'C', 4),
('a1000000-0000-0000-0000-0000173e1464', 'Field Craft & Battle Craft', 'Field Craft & Battle Craft official training course for Certificate C cadets in the Common wing.', 'Common', 'C', 5),
('a1000000-0000-0000-0000-00002d69b84d', 'Military History & War Heroes', 'Military History & War Heroes official training course for Certificate C cadets in the Common wing.', 'Common', 'C', 6),
('a1000000-0000-0000-0000-0000282e60fa', 'General Awareness & Current Affairs', 'General Awareness & Current Affairs official training course for Certificate C cadets in the Common wing.', 'Common', 'C', 7),
('a1000000-0000-0000-0000-0000400027dd', 'Officer Like Qualities (OLQs) & Interview Skills', 'Officer Like Qualities (OLQs) & Interview Skills official training course for Certificate C cadets in the Common wing.', 'Common', 'C', 8),
('a1000000-0000-0000-0000-000004518ce7', 'Field Craft Basics', 'Field Craft Basics official training course for Certificate A cadets in the Army wing.', 'Army', 'A', 4),
('a1000000-0000-0000-0000-00005b295d90', 'Drill with Arms', 'Drill with Arms official training course for Certificate A cadets in the Army wing.', 'Army', 'A', 5),
('a1000000-0000-0000-0000-000000000006', 'Weapon Training', 'Weapon Training official training course for Certificate A cadets in the Army wing.', 'Army', 'A', 6),
('a1000000-0000-0000-0000-00007250c9a6', 'Section Formation', 'Section Formation official training course for Certificate A cadets in the Army wing.', 'Army', 'A', 7),
('a1000000-0000-0000-0000-00001cddd660', 'Guard Mounting', 'Guard Mounting official training course for Certificate A cadets in the Army wing.', 'Army', 'A', 8),
('a1000000-0000-0000-0000-000076b802f1', 'Battle Craft Basics', 'Battle Craft Basics official training course for Certificate A cadets in the Army wing.', 'Army', 'A', 9),
('a1000000-0000-0000-0000-00005bda6445', 'Advanced Weapon Training', 'Advanced Weapon Training official training course for Certificate B cadets in the Army wing.', 'Army', 'B', 4),
('a1000000-0000-0000-0000-00004ef72cf6', 'Field Signals', 'Field Signals official training course for Certificate B cadets in the Army wing.', 'Army', 'B', 5),
('a1000000-0000-0000-0000-00000fa26f23', 'Patrolling', 'Patrolling official training course for Certificate B cadets in the Army wing.', 'Army', 'B', 6),
('a1000000-0000-0000-0000-0000091f2132', 'Camouflage & Concealment', 'Camouflage & Concealment official training course for Certificate B cadets in the Army wing.', 'Army', 'B', 7),
('a1000000-0000-0000-0000-000010986329', 'Section Battle Drill', 'Section Battle Drill official training course for Certificate B cadets in the Army wing.', 'Army', 'B', 8),
('a1000000-0000-0000-0000-00002d119e7b', 'Ambush & Defence', 'Ambush & Defence official training course for Certificate B cadets in the Army wing.', 'Army', 'B', 9),
('a1000000-0000-0000-0000-000069281cf8', 'Tactical Exercises', 'Tactical Exercises official training course for Certificate C cadets in the Army wing.', 'Army', 'C', 4),
('a1000000-0000-0000-0000-0000455ec376', 'Platoon Formation', 'Platoon Formation official training course for Certificate C cadets in the Army wing.', 'Army', 'C', 5),
('a1000000-0000-0000-0000-000027c89a44', 'Advanced Battle Craft', 'Advanced Battle Craft official training course for Certificate C cadets in the Army wing.', 'Army', 'C', 6),
('a1000000-0000-0000-0000-00006a0b9015', 'Internal Security Duties', 'Internal Security Duties official training course for Certificate C cadets in the Army wing.', 'Army', 'C', 7),
('a1000000-0000-0000-0000-00006aaa9a6d', 'Field Engineering', 'Field Engineering official training course for Certificate C cadets in the Army wing.', 'Army', 'C', 8),
('a1000000-0000-0000-0000-00005baa8724', 'Communication Procedures', 'Communication Procedures official training course for Certificate C cadets in the Army wing.', 'Army', 'C', 9),
('a1000000-0000-0000-0000-00002c4f7734', 'Map Reading Advanced', 'Map Reading Advanced official training course for Certificate C cadets in the Army wing.', 'Army', 'C', 10),
('a1000000-0000-0000-0000-000007da05fb', 'Naval Orientation', 'Naval Orientation official training course for Certificate A cadets in the Navy wing.', 'Navy', 'A', 4),
('a1000000-0000-0000-0000-000010cd3522', 'Parts of Ship', 'Parts of Ship official training course for Certificate A cadets in the Navy wing.', 'Navy', 'A', 5),
('a1000000-0000-0000-0000-000078b8bad6', 'Seamanship', 'Seamanship official training course for Certificate A cadets in the Navy wing.', 'Navy', 'A', 6),
('a1000000-0000-0000-0000-000060f74a80', 'Boat Pulling', 'Boat Pulling official training course for Certificate A cadets in the Navy wing.', 'Navy', 'A', 7),
('a1000000-0000-0000-0000-00005f26bbb8', 'Rigging', 'Rigging official training course for Certificate A cadets in the Navy wing.', 'Navy', 'A', 8),
('a1000000-0000-0000-0000-00005f71361c', 'Naval Communication Basics', 'Naval Communication Basics official training course for Certificate A cadets in the Navy wing.', 'Navy', 'A', 9),
('a1000000-0000-0000-0000-000033de1536', 'Navigation', 'Navigation official training course for Certificate B cadets in the Navy wing.', 'Navy', 'B', 4),
('a1000000-0000-0000-0000-00003e351a55', 'Anchoring', 'Anchoring official training course for Certificate B cadets in the Navy wing.', 'Navy', 'B', 5),
('a1000000-0000-0000-0000-000066541bbd', 'Ship Modelling', 'Ship Modelling official training course for Certificate B cadets in the Navy wing.', 'Navy', 'B', 6),
('a1000000-0000-0000-0000-00000e385149', 'Naval Signals', 'Naval Signals official training course for Certificate B cadets in the Navy wing.', 'Navy', 'B', 7),
('a1000000-0000-0000-0000-000002b2020d', 'Boat Sailing', 'Boat Sailing official training course for Certificate B cadets in the Navy wing.', 'Navy', 'B', 8),
('a1000000-0000-0000-0000-0000173c9633', 'Tides & Compass', 'Tides & Compass official training course for Certificate B cadets in the Navy wing.', 'Navy', 'B', 9),
('a1000000-0000-0000-0000-00003bf3e26f', 'Advanced Navigation', 'Advanced Navigation official training course for Certificate C cadets in the Navy wing.', 'Navy', 'C', 4),
('a1000000-0000-0000-0000-0000446f03a2', 'Naval Warfare Basics', 'Naval Warfare Basics official training course for Certificate C cadets in the Navy wing.', 'Navy', 'C', 5),
('a1000000-0000-0000-0000-00007ebeb8bd', 'Ship Organisation', 'Ship Organisation official training course for Certificate C cadets in the Navy wing.', 'Navy', 'C', 6),
('a1000000-0000-0000-0000-00004d1d4699', 'Communication Systems', 'Communication Systems official training course for Certificate C cadets in the Navy wing.', 'Navy', 'C', 7),
('a1000000-0000-0000-0000-000056db673e', 'Sailing Expeditions', 'Sailing Expeditions official training course for Certificate C cadets in the Navy wing.', 'Navy', 'C', 8),
('a1000000-0000-0000-0000-000005e105c1', 'Naval Weapons Basics', 'Naval Weapons Basics official training course for Certificate C cadets in the Navy wing.', 'Navy', 'C', 9),
('a1000000-0000-0000-0000-00005e58b4dc', 'Leadership at Sea', 'Leadership at Sea official training course for Certificate C cadets in the Navy wing.', 'Navy', 'C', 10),
('a1000000-0000-0000-0000-00001e49cb34', 'Principles of Flight', 'Principles of Flight official training course for Certificate A cadets in the Air Force wing.', 'Air Force', 'A', 4),
('a1000000-0000-0000-0000-00003f04d489', 'Airframe & Aircraft Parts', 'Airframe & Aircraft Parts official training course for Certificate A cadets in the Air Force wing.', 'Air Force', 'A', 5),
('a1000000-0000-0000-0000-000021b5014e', 'Flying Basics', 'Flying Basics official training course for Certificate A cadets in the Air Force wing.', 'Air Force', 'A', 6),
('a1000000-0000-0000-0000-000009934b67', 'Aviation History', 'Aviation History official training course for Certificate A cadets in the Air Force wing.', 'Air Force', 'A', 7),
('a1000000-0000-0000-0000-00001e256fdc', 'Aero Modelling', 'Aero Modelling official training course for Certificate A cadets in the Air Force wing.', 'Air Force', 'A', 8),
('a1000000-0000-0000-0000-0000197a9a17', 'Air Navigation Basics', 'Air Navigation Basics official training course for Certificate A cadets in the Air Force wing.', 'Air Force', 'A', 9),
('a1000000-0000-0000-0000-00007d5b2b7b', 'Aircraft Instruments', 'Aircraft Instruments official training course for Certificate B cadets in the Air Force wing.', 'Air Force', 'B', 4),
('a1000000-0000-0000-0000-00003f85a3d5', 'Meteorology', 'Meteorology official training course for Certificate B cadets in the Air Force wing.', 'Air Force', 'B', 5),
('a1000000-0000-0000-0000-00001e091e5c', 'Air Traffic Control Basics', 'Air Traffic Control Basics official training course for Certificate B cadets in the Air Force wing.', 'Air Force', 'B', 6),
('a1000000-0000-0000-0000-00007b3ed32b', 'Navigation Advanced', 'Navigation Advanced official training course for Certificate B cadets in the Air Force wing.', 'Air Force', 'B', 7),
('a1000000-0000-0000-0000-000025fea92b', 'Aero Engines', 'Aero Engines official training course for Certificate B cadets in the Air Force wing.', 'Air Force', 'B', 8),
('a1000000-0000-0000-0000-00001042448d', 'Map Reading for Aviation', 'Map Reading for Aviation official training course for Certificate B cadets in the Air Force wing.', 'Air Force', 'B', 9),
('a1000000-0000-0000-0000-0000191cb74a', 'Advanced Aviation Subjects', 'Advanced Aviation Subjects official training course for Certificate C cadets in the Air Force wing.', 'Air Force', 'C', 4),
('a1000000-0000-0000-0000-0000665f0342', 'Flight Navigation', 'Flight Navigation official training course for Certificate C cadets in the Air Force wing.', 'Air Force', 'C', 5),
('a1000000-0000-0000-0000-000010eaf56f', 'Aircraft Recognition', 'Aircraft Recognition official training course for Certificate C cadets in the Air Force wing.', 'Air Force', 'C', 6),
('a1000000-0000-0000-0000-00002cf3b089', 'Air Power & Warfare', 'Air Power & Warfare official training course for Certificate C cadets in the Air Force wing.', 'Air Force', 'C', 7),
('a1000000-0000-0000-0000-00007f71eb3d', 'Aero Engine Systems', 'Aero Engine Systems official training course for Certificate C cadets in the Air Force wing.', 'Air Force', 'C', 8),
('a1000000-0000-0000-0000-000060be762f', 'Aviation Safety', 'Aviation Safety official training course for Certificate C cadets in the Air Force wing.', 'Air Force', 'C', 9),
('a1000000-0000-0000-0000-00004684706e', 'Air Force Leadership & Communication', 'Air Force Leadership & Communication official training course for Certificate C cadets in the Air Force wing.', 'Air Force', 'C', 10);

-- ============================================
-- MODULES
-- ============================================
INSERT INTO public.modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-0000784393e0', 'a1000000-0000-0000-0000-000000000001', 'NCC History, Aims & Organisation', 1),
('b1000000-0000-0000-0000-0000784393c1', 'a1000000-0000-0000-0000-000000000002', 'Basic Foot Drill', 1),
('b1000000-0000-0000-0000-0000784393c0', 'a1000000-0000-0000-0000-000000000002', 'Parade Formations', 2),
('b1000000-0000-0000-0000-000063203e03', 'a1000000-0000-0000-0000-00002d6df6d2', 'Core Concepts of Weapon Training & Infantry Weapons', 1),
('b1000000-0000-0000-0000-000063203e04', 'a1000000-0000-0000-0000-00002d6df6d2', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-0000784393a2', 'a1000000-0000-0000-0000-000000000003', 'Core Concepts of National Integration', 1),
('b1000000-0000-0000-0000-0000784393a1', 'a1000000-0000-0000-0000-000000000003', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00001aa16c89', 'a1000000-0000-0000-0000-0000174a3d1e', 'Core Concepts of Leadership & Personality Development', 1),
('b1000000-0000-0000-0000-00001aa16c8a', 'a1000000-0000-0000-0000-0000174a3d1e', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00000343433a', 'a1000000-0000-0000-0000-000071e9b09d', 'Core Concepts of Civil Defence & Disaster Management', 1),
('b1000000-0000-0000-0000-00000343433b', 'a1000000-0000-0000-0000-000071e9b09d', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-0000240c3a67', 'a1000000-0000-0000-0000-000057c82e75', 'Core Concepts of Social Service & Awareness', 1),
('b1000000-0000-0000-0000-0000240c3a66', 'a1000000-0000-0000-0000-000057c82e75', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000078439383', 'a1000000-0000-0000-0000-000000000004', 'First Aid Fundamentals', 1),
('b1000000-0000-0000-0000-000078439382', 'a1000000-0000-0000-0000-000000000004', 'Personal Hygiene', 2),
('b1000000-0000-0000-0000-00001eed3e8a', 'a1000000-0000-0000-0000-00005409f313', 'Core Concepts of Yoga & Asanas', 1),
('b1000000-0000-0000-0000-00001eed3e8b', 'a1000000-0000-0000-0000-00005409f313', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000050ab1641', 'a1000000-0000-0000-0000-00001aefb067', 'Core Concepts of Home Nursing', 1),
('b1000000-0000-0000-0000-000050ab1642', 'a1000000-0000-0000-0000-00001aefb067', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00006ab4b79c', 'a1000000-0000-0000-0000-000000490880', 'Core Concepts of Posture Training', 1),
('b1000000-0000-0000-0000-00006ab4b79d', 'a1000000-0000-0000-0000-000000490880', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000055702413', 'a1000000-0000-0000-0000-0000240e6113', 'Core Concepts of Obstacles Training & Adventure Activities', 1),
('b1000000-0000-0000-0000-000055702412', 'a1000000-0000-0000-0000-0000240e6113', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000022cc049a', 'a1000000-0000-0000-0000-000008b4468c', 'Core Concepts of Career in Defence Services', 1),
('b1000000-0000-0000-0000-000022cc049b', 'a1000000-0000-0000-0000-000008b4468c', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00006033a39d', 'a1000000-0000-0000-0000-000038908d40', 'Core Concepts of Services Tests & Interviews', 1),
('b1000000-0000-0000-0000-00006033a39e', 'a1000000-0000-0000-0000-000038908d40', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00003bdb4e82', 'a1000000-0000-0000-0000-000039ef9e7c', 'Core Concepts of Self-Defence', 1),
('b1000000-0000-0000-0000-00003bdb4e83', 'a1000000-0000-0000-0000-000039ef9e7c', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000030d146a1', 'a1000000-0000-0000-0000-00003c4316e3', 'Core Concepts of Environment and Ecology', 1),
('b1000000-0000-0000-0000-000030d146a0', 'a1000000-0000-0000-0000-00003c4316e3', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-0000581e038e', 'a1000000-0000-0000-0000-0000199562e4', 'Core Concepts of Famous Leaders of India', 1),
('b1000000-0000-0000-0000-0000581e038d', 'a1000000-0000-0000-0000-0000199562e4', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00007eec7289', 'a1000000-0000-0000-0000-000071fe9b19', 'Core Concepts of History of India', 1),
('b1000000-0000-0000-0000-00007eec7288', 'a1000000-0000-0000-0000-000071fe9b19', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-0000009a88f7', 'a1000000-0000-0000-0000-00000ba7d77f', 'Core Concepts of Armed Forces & Military History', 1),
('b1000000-0000-0000-0000-0000009a88f8', 'a1000000-0000-0000-0000-00000ba7d77f', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000078439364', 'a1000000-0000-0000-0000-000000000005', 'Introduction to Maps', 1),
('b1000000-0000-0000-0000-000078439363', 'a1000000-0000-0000-0000-000000000005', 'Compass & Navigation', 2),
('b1000000-0000-0000-0000-0000123ac618', 'a1000000-0000-0000-0000-0000382075a9', 'Core Concepts of Communication', 1),
('b1000000-0000-0000-0000-0000123ac617', 'a1000000-0000-0000-0000-0000382075a9', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00004a3aa10a', 'a1000000-0000-0000-0000-0000266d0d05', 'Core Concepts of Field Craft & Battle Craft', 1),
('b1000000-0000-0000-0000-00004a3aa109', 'a1000000-0000-0000-0000-0000266d0d05', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000050d1b041', 'a1000000-0000-0000-0000-000016a26b66', 'Core Concepts of Personality Development & Officer Like Qualities (OLQs)', 1),
('b1000000-0000-0000-0000-000050d1b040', 'a1000000-0000-0000-0000-000016a26b66', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-0000625c7021', 'a1000000-0000-0000-0000-00004a803f19', 'Core Concepts of Disaster Management & Social Awareness', 1),
('b1000000-0000-0000-0000-0000625c7022', 'a1000000-0000-0000-0000-00004a803f19', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000021370671', 'a1000000-0000-0000-0000-00002ba41949', 'Core Concepts of Advanced Leadership', 1),
('b1000000-0000-0000-0000-000021370672', 'a1000000-0000-0000-0000-00002ba41949', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00002d148b12', 'a1000000-0000-0000-0000-00000b8cf529', 'Core Concepts of Advanced Drill', 1),
('b1000000-0000-0000-0000-00002d148b11', 'a1000000-0000-0000-0000-00000b8cf529', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00007659e2b7', 'a1000000-0000-0000-0000-000019d3bbde', 'Core Concepts of National Security', 1),
('b1000000-0000-0000-0000-00007659e2b6', 'a1000000-0000-0000-0000-000019d3bbde', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00002d49ad86', 'a1000000-0000-0000-0000-000017470581', 'Core Concepts of Armed Forces Organisation', 1),
('b1000000-0000-0000-0000-00002d49ad85', 'a1000000-0000-0000-0000-000017470581', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-0000356c3e6c', 'a1000000-0000-0000-0000-0000636a9bea', 'Core Concepts of Disaster Management', 1),
('b1000000-0000-0000-0000-0000356c3e6b', 'a1000000-0000-0000-0000-0000636a9bea', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00001785b621', 'a1000000-0000-0000-0000-000015e087f8', 'Core Concepts of Social Service & Community Development', 1),
('b1000000-0000-0000-0000-00001785b622', 'a1000000-0000-0000-0000-000015e087f8', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00002bd326eb', 'a1000000-0000-0000-0000-00000f5e0237', 'Core Concepts of Personality Development & Communication Skills', 1),
('b1000000-0000-0000-0000-00002bd326ea', 'a1000000-0000-0000-0000-00000f5e0237', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00001fa75b86', 'a1000000-0000-0000-0000-00007f311b52', 'Core Concepts of Map Reading & Navigation', 1),
('b1000000-0000-0000-0000-00001fa75b87', 'a1000000-0000-0000-0000-00007f311b52', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000013a36038', 'a1000000-0000-0000-0000-0000173e1464', 'Core Concepts of Field Craft & Battle Craft', 1),
('b1000000-0000-0000-0000-000013a36037', 'a1000000-0000-0000-0000-0000173e1464', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00001987b7e6', 'a1000000-0000-0000-0000-00002d69b84d', 'Core Concepts of Military History & War Heroes', 1),
('b1000000-0000-0000-0000-00001987b7e7', 'a1000000-0000-0000-0000-00002d69b84d', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00004c1ea1ed', 'a1000000-0000-0000-0000-0000282e60fa', 'Core Concepts of General Awareness & Current Affairs', 1),
('b1000000-0000-0000-0000-00004c1ea1ec', 'a1000000-0000-0000-0000-0000282e60fa', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00002711b0e0', 'a1000000-0000-0000-0000-0000400027dd', 'Core Concepts of Officer Like Qualities (OLQs) & Interview Skills', 1),
('b1000000-0000-0000-0000-00002711b0df', 'a1000000-0000-0000-0000-0000400027dd', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000031fdd324', 'a1000000-0000-0000-0000-000004518ce7', 'Core Concepts of Field Craft Basics', 1),
('b1000000-0000-0000-0000-000031fdd325', 'a1000000-0000-0000-0000-000004518ce7', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00003093a947', 'a1000000-0000-0000-0000-00005b295d90', 'Core Concepts of Drill with Arms', 1),
('b1000000-0000-0000-0000-00003093a948', 'a1000000-0000-0000-0000-00005b295d90', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000078439345', 'a1000000-0000-0000-0000-000000000006', 'Core Concepts of Weapon Training', 1),
('b1000000-0000-0000-0000-000078439344', 'a1000000-0000-0000-0000-000000000006', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000070b075c0', 'a1000000-0000-0000-0000-00007250c9a6', 'Core Concepts of Section Formation', 1),
('b1000000-0000-0000-0000-000070b075c1', 'a1000000-0000-0000-0000-00007250c9a6', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000017c3941d', 'a1000000-0000-0000-0000-00001cddd660', 'Core Concepts of Guard Mounting', 1),
('b1000000-0000-0000-0000-000017c3941c', 'a1000000-0000-0000-0000-00001cddd660', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000067828d7f', 'a1000000-0000-0000-0000-000076b802f1', 'Core Concepts of Battle Craft Basics', 1),
('b1000000-0000-0000-0000-000067828d80', 'a1000000-0000-0000-0000-000076b802f1', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-0000363ab7a8', 'a1000000-0000-0000-0000-00005bda6445', 'Core Concepts of Advanced Weapon Training', 1),
('b1000000-0000-0000-0000-0000363ab7a7', 'a1000000-0000-0000-0000-00005bda6445', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000070dcf862', 'a1000000-0000-0000-0000-00004ef72cf6', 'Core Concepts of Field Signals', 1),
('b1000000-0000-0000-0000-000070dcf861', 'a1000000-0000-0000-0000-00004ef72cf6', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00006adbf357', 'a1000000-0000-0000-0000-00000fa26f23', 'Core Concepts of Patrolling', 1),
('b1000000-0000-0000-0000-00006adbf356', 'a1000000-0000-0000-0000-00000fa26f23', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00004030647b', 'a1000000-0000-0000-0000-0000091f2132', 'Core Concepts of Camouflage & Concealment', 1),
('b1000000-0000-0000-0000-00004030647a', 'a1000000-0000-0000-0000-0000091f2132', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00000615a7ff', 'a1000000-0000-0000-0000-000010986329', 'Core Concepts of Section Battle Drill', 1),
('b1000000-0000-0000-0000-00000615a800', 'a1000000-0000-0000-0000-000010986329', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-0000013486b8', 'a1000000-0000-0000-0000-00002d119e7b', 'Core Concepts of Ambush & Defence', 1),
('b1000000-0000-0000-0000-0000013486b9', 'a1000000-0000-0000-0000-00002d119e7b', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00001fdae774', 'a1000000-0000-0000-0000-000069281cf8', 'Core Concepts of Tactical Exercises', 1),
('b1000000-0000-0000-0000-00001fdae775', 'a1000000-0000-0000-0000-000069281cf8', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000045f43061', 'a1000000-0000-0000-0000-0000455ec376', 'Core Concepts of Platoon Formation', 1),
('b1000000-0000-0000-0000-000045f43062', 'a1000000-0000-0000-0000-0000455ec376', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00001f87403f', 'a1000000-0000-0000-0000-000027c89a44', 'Core Concepts of Advanced Battle Craft', 1),
('b1000000-0000-0000-0000-00001f874040', 'a1000000-0000-0000-0000-000027c89a44', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00003941c3a9', 'a1000000-0000-0000-0000-00006a0b9015', 'Core Concepts of Internal Security Duties', 1),
('b1000000-0000-0000-0000-00003941c3aa', 'a1000000-0000-0000-0000-00006a0b9015', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000057b4a120', 'a1000000-0000-0000-0000-00006aaa9a6d', 'Core Concepts of Field Engineering', 1),
('b1000000-0000-0000-0000-000057b4a121', 'a1000000-0000-0000-0000-00006aaa9a6d', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00002b301b13', 'a1000000-0000-0000-0000-00005baa8724', 'Core Concepts of Communication Procedures', 1),
('b1000000-0000-0000-0000-00002b301b14', 'a1000000-0000-0000-0000-00005baa8724', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00006dba4823', 'a1000000-0000-0000-0000-00002c4f7734', 'Core Concepts of Map Reading Advanced', 1),
('b1000000-0000-0000-0000-00006dba4822', 'a1000000-0000-0000-0000-00002c4f7734', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000071493c5c', 'a1000000-0000-0000-0000-000007da05fb', 'Core Concepts of Naval Orientation', 1),
('b1000000-0000-0000-0000-000071493c5d', 'a1000000-0000-0000-0000-000007da05fb', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00000138c2a1', 'a1000000-0000-0000-0000-000010cd3522', 'Core Concepts of Parts of Ship', 1),
('b1000000-0000-0000-0000-00000138c2a0', 'a1000000-0000-0000-0000-000010cd3522', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00003a1ad4f9', 'a1000000-0000-0000-0000-000078b8bad6', 'Core Concepts of Seamanship', 1),
('b1000000-0000-0000-0000-00003a1ad4fa', 'a1000000-0000-0000-0000-000078b8bad6', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000036283451', 'a1000000-0000-0000-0000-000060f74a80', 'Core Concepts of Boat Pulling', 1),
('b1000000-0000-0000-0000-000036283452', 'a1000000-0000-0000-0000-000060f74a80', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-0000328c594a', 'a1000000-0000-0000-0000-00005f26bbb8', 'Core Concepts of Rigging', 1),
('b1000000-0000-0000-0000-0000328c5949', 'a1000000-0000-0000-0000-00005f26bbb8', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000035406fdf', 'a1000000-0000-0000-0000-00005f71361c', 'Core Concepts of Naval Communication Basics', 1),
('b1000000-0000-0000-0000-000035406fde', 'a1000000-0000-0000-0000-00005f71361c', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00006a8d74e7', 'a1000000-0000-0000-0000-000033de1536', 'Core Concepts of Navigation', 1),
('b1000000-0000-0000-0000-00006a8d74e6', 'a1000000-0000-0000-0000-000033de1536', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00006d87611d', 'a1000000-0000-0000-0000-00003e351a55', 'Core Concepts of Anchoring', 1),
('b1000000-0000-0000-0000-00006d87611e', 'a1000000-0000-0000-0000-00003e351a55', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00007fe9cdf1', 'a1000000-0000-0000-0000-000066541bbd', 'Core Concepts of Ship Modelling', 1),
('b1000000-0000-0000-0000-00007fe9cdf0', 'a1000000-0000-0000-0000-000066541bbd', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00004a04d91a', 'a1000000-0000-0000-0000-00000e385149', 'Core Concepts of Naval Signals', 1),
('b1000000-0000-0000-0000-00004a04d919', 'a1000000-0000-0000-0000-00000e385149', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-0000501f0747', 'a1000000-0000-0000-0000-000002b2020d', 'Core Concepts of Boat Sailing', 1),
('b1000000-0000-0000-0000-0000501f0746', 'a1000000-0000-0000-0000-000002b2020d', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-0000169b7812', 'a1000000-0000-0000-0000-0000173c9633', 'Core Concepts of Tides & Compass', 1),
('b1000000-0000-0000-0000-0000169b7811', 'a1000000-0000-0000-0000-0000173c9633', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000040e09658', 'a1000000-0000-0000-0000-00003bf3e26f', 'Core Concepts of Advanced Navigation', 1),
('b1000000-0000-0000-0000-000040e09657', 'a1000000-0000-0000-0000-00003bf3e26f', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000011e005dd', 'a1000000-0000-0000-0000-0000446f03a2', 'Core Concepts of Naval Warfare Basics', 1),
('b1000000-0000-0000-0000-000011e005de', 'a1000000-0000-0000-0000-0000446f03a2', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00003698d908', 'a1000000-0000-0000-0000-00007ebeb8bd', 'Core Concepts of Ship Organisation', 1),
('b1000000-0000-0000-0000-00003698d907', 'a1000000-0000-0000-0000-00007ebeb8bd', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00007f974404', 'a1000000-0000-0000-0000-00004d1d4699', 'Core Concepts of Communication Systems', 1),
('b1000000-0000-0000-0000-00007f974403', 'a1000000-0000-0000-0000-00004d1d4699', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00000f383631', 'a1000000-0000-0000-0000-000056db673e', 'Core Concepts of Sailing Expeditions', 1),
('b1000000-0000-0000-0000-00000f383630', 'a1000000-0000-0000-0000-000056db673e', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00007b7b9123', 'a1000000-0000-0000-0000-000005e105c1', 'Core Concepts of Naval Weapons Basics', 1),
('b1000000-0000-0000-0000-00007b7b9122', 'a1000000-0000-0000-0000-000005e105c1', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-0000079a007d', 'a1000000-0000-0000-0000-00005e58b4dc', 'Core Concepts of Leadership at Sea', 1),
('b1000000-0000-0000-0000-0000079a007e', 'a1000000-0000-0000-0000-00005e58b4dc', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00007c86db38', 'a1000000-0000-0000-0000-00001e49cb34', 'Core Concepts of Principles of Flight', 1),
('b1000000-0000-0000-0000-00007c86db37', 'a1000000-0000-0000-0000-00001e49cb34', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000037bb4959', 'a1000000-0000-0000-0000-00003f04d489', 'Core Concepts of Airframe & Aircraft Parts', 1),
('b1000000-0000-0000-0000-000037bb495a', 'a1000000-0000-0000-0000-00003f04d489', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000075a6ce7d', 'a1000000-0000-0000-0000-000021b5014e', 'Core Concepts of Flying Basics', 1),
('b1000000-0000-0000-0000-000075a6ce7e', 'a1000000-0000-0000-0000-000021b5014e', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-0000102cceef', 'a1000000-0000-0000-0000-000009934b67', 'Core Concepts of Aviation History', 1),
('b1000000-0000-0000-0000-0000102ccef0', 'a1000000-0000-0000-0000-000009934b67', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00001061b93b', 'a1000000-0000-0000-0000-00001e256fdc', 'Core Concepts of Aero Modelling', 1),
('b1000000-0000-0000-0000-00001061b93c', 'a1000000-0000-0000-0000-00001e256fdc', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000076965d9f', 'a1000000-0000-0000-0000-0000197a9a17', 'Core Concepts of Air Navigation Basics', 1),
('b1000000-0000-0000-0000-000076965d9e', 'a1000000-0000-0000-0000-0000197a9a17', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00000d5d138c', 'a1000000-0000-0000-0000-00007d5b2b7b', 'Core Concepts of Aircraft Instruments', 1),
('b1000000-0000-0000-0000-00000d5d138d', 'a1000000-0000-0000-0000-00007d5b2b7b', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00001f881a32', 'a1000000-0000-0000-0000-00003f85a3d5', 'Core Concepts of Meteorology', 1),
('b1000000-0000-0000-0000-00001f881a31', 'a1000000-0000-0000-0000-00003f85a3d5', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000052def51e', 'a1000000-0000-0000-0000-00001e091e5c', 'Core Concepts of Air Traffic Control Basics', 1),
('b1000000-0000-0000-0000-000052def51d', 'a1000000-0000-0000-0000-00001e091e5c', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000024680bdb', 'a1000000-0000-0000-0000-00007b3ed32b', 'Core Concepts of Navigation Advanced', 1),
('b1000000-0000-0000-0000-000024680bda', 'a1000000-0000-0000-0000-00007b3ed32b', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00003d632797', 'a1000000-0000-0000-0000-000025fea92b', 'Core Concepts of Aero Engines', 1),
('b1000000-0000-0000-0000-00003d632798', 'a1000000-0000-0000-0000-000025fea92b', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00000cc232e8', 'a1000000-0000-0000-0000-00001042448d', 'Core Concepts of Map Reading for Aviation', 1),
('b1000000-0000-0000-0000-00000cc232e7', 'a1000000-0000-0000-0000-00001042448d', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-0000519cac85', 'a1000000-0000-0000-0000-0000191cb74a', 'Core Concepts of Advanced Aviation Subjects', 1),
('b1000000-0000-0000-0000-0000519cac86', 'a1000000-0000-0000-0000-0000191cb74a', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00002abba691', 'a1000000-0000-0000-0000-0000665f0342', 'Core Concepts of Flight Navigation', 1),
('b1000000-0000-0000-0000-00002abba690', 'a1000000-0000-0000-0000-0000665f0342', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00006643ee07', 'a1000000-0000-0000-0000-000010eaf56f', 'Core Concepts of Aircraft Recognition', 1),
('b1000000-0000-0000-0000-00006643ee08', 'a1000000-0000-0000-0000-000010eaf56f', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00006d6f05ac', 'a1000000-0000-0000-0000-00002cf3b089', 'Core Concepts of Air Power & Warfare', 1),
('b1000000-0000-0000-0000-00006d6f05ab', 'a1000000-0000-0000-0000-00002cf3b089', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-000009e2f2b6', 'a1000000-0000-0000-0000-00007f71eb3d', 'Core Concepts of Aero Engine Systems', 1),
('b1000000-0000-0000-0000-000009e2f2b5', 'a1000000-0000-0000-0000-00007f71eb3d', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00004edb218f', 'a1000000-0000-0000-0000-000060be762f', 'Core Concepts of Aviation Safety', 1),
('b1000000-0000-0000-0000-00004edb218e', 'a1000000-0000-0000-0000-000060be762f', 'Practical Training & Operations', 2),
('b1000000-0000-0000-0000-00000982ccc5', 'a1000000-0000-0000-0000-00004684706e', 'Core Concepts of Air Force Leadership & Communication', 1),
('b1000000-0000-0000-0000-00000982ccc4', 'a1000000-0000-0000-0000-00004684706e', 'Practical Training & Operations', 2);

-- ============================================
-- CHAPTERS
-- ============================================
INSERT INTO public.chapters (id, module_id, title, content_type, content_data, order_index, content) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-0000784393e0', 'NCC Training Slideshow', 'embed', '{"embed_url":"https://docs.google.com/presentation/d/11HaCvdxdSy4TXuh7HfnX7wWDA2Mkvgv2/embed?start=false&loop=false&delayms=3000"}'::jsonb, 1, 'Interactive Google Slides Presentation'),
('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-0000784393c1', 'Attention and Stand at Ease', 'markdown', '{}'::jsonb, 1, '# Attention and Stand at Ease

## Position of Attention (Savdhan)
The Position of Attention is the basic military position.'),
('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-0000784393c1', 'Turning and Saluting', 'markdown', '{}'::jsonb, 2, '# Turning and Saluting

## Turnings at the Halt
All turnings are done in two movements.'),
('c1000000-0000-0000-0000-000075ad9e1c', 'b1000000-0000-0000-0000-0000784393c0', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Drill & Commands**.'),
('c1000000-0000-0000-0000-000075ad9e1b', 'b1000000-0000-0000-0000-0000784393c0', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00001c08cee7', 'b1000000-0000-0000-0000-000063203e03', 'Introduction to Weapon Training & Infantry Weapons', 'markdown', '{}'::jsonb, 1, '# Introduction to Weapon Training & Infantry Weapons

## Overview
This chapter covers the basic fundamentals of **Weapon Training & Infantry Weapons**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00001c08cee8', 'b1000000-0000-0000-0000-000063203e03', 'Theoretical Principles of Weapon Training & Infantry Weapons', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Weapon Training & Infantry Weapons

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Weapon Training & Infantry Weapons**.'),
('c1000000-0000-0000-0000-00001c08d2a8', 'b1000000-0000-0000-0000-000063203e04', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Weapon Training & Infantry Weapons**.'),
('c1000000-0000-0000-0000-00001c08d2a9', 'b1000000-0000-0000-0000-000063203e04', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000075ad2d7e', 'b1000000-0000-0000-0000-0000784393a2', 'Introduction to National Integration', 'markdown', '{}'::jsonb, 1, '# Introduction to National Integration

## Overview
This chapter covers the basic fundamentals of **National Integration**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-000075ad2d7d', 'b1000000-0000-0000-0000-0000784393a2', 'Theoretical Principles of National Integration', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of National Integration

## Study Material
Here we explore the detailed guidelines and regulations surrounding **National Integration**.'),
('c1000000-0000-0000-0000-000075ad29bd', 'b1000000-0000-0000-0000-0000784393a1', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **National Integration**.'),
('c1000000-0000-0000-0000-000075ad29bc', 'b1000000-0000-0000-0000-0000784393a1', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000008078c13', 'b1000000-0000-0000-0000-00001aa16c89', 'Introduction to Leadership & Personality Development', 'markdown', '{}'::jsonb, 1, '# Introduction to Leadership & Personality Development

## Overview
This chapter covers the basic fundamentals of **Leadership & Personality Development**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-000008078c12', 'b1000000-0000-0000-0000-00001aa16c89', 'Theoretical Principles of Leadership & Personality Development', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Leadership & Personality Development

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Leadership & Personality Development**.'),
('c1000000-0000-0000-0000-000008078852', 'b1000000-0000-0000-0000-00001aa16c8a', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Leadership & Personality Development**.'),
('c1000000-0000-0000-0000-000008078851', 'b1000000-0000-0000-0000-00001aa16c8a', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00003f7f625e', 'b1000000-0000-0000-0000-00000343433a', 'Introduction to Civil Defence & Disaster Management', 'markdown', '{}'::jsonb, 1, '# Introduction to Civil Defence & Disaster Management

## Overview
This chapter covers the basic fundamentals of **Civil Defence & Disaster Management**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00003f7f625f', 'b1000000-0000-0000-0000-00000343433a', 'Theoretical Principles of Civil Defence & Disaster Management', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Civil Defence & Disaster Management

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Civil Defence & Disaster Management**.'),
('c1000000-0000-0000-0000-00003f7f661f', 'b1000000-0000-0000-0000-00000343433b', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Civil Defence & Disaster Management**.'),
('c1000000-0000-0000-0000-00003f7f6620', 'b1000000-0000-0000-0000-00000343433b', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000051e73703', 'b1000000-0000-0000-0000-0000240c3a67', 'Introduction to Social Service & Awareness', 'markdown', '{}'::jsonb, 1, '# Introduction to Social Service & Awareness

## Overview
This chapter covers the basic fundamentals of **Social Service & Awareness**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-000051e73702', 'b1000000-0000-0000-0000-0000240c3a67', 'Theoretical Principles of Social Service & Awareness', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Social Service & Awareness

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Social Service & Awareness**.'),
('c1000000-0000-0000-0000-000051e73342', 'b1000000-0000-0000-0000-0000240c3a66', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Social Service & Awareness**.'),
('c1000000-0000-0000-0000-000051e73341', 'b1000000-0000-0000-0000-0000240c3a66', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000078439383', 'Fractures and Bandaging', 'markdown', '{}'::jsonb, 1, '# Fractures and Bandaging

## Types of Fractures
1. Simple (Closed): Bone breaks but skin is intact.'),
('c1000000-0000-0000-0000-000075acb91e', 'b1000000-0000-0000-0000-000078439383', 'Theoretical Principles of Health, Hygiene & Sanitation', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Health, Hygiene & Sanitation

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Health, Hygiene & Sanitation**.'),
('c1000000-0000-0000-0000-000075acb55e', 'b1000000-0000-0000-0000-000078439382', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Health, Hygiene & Sanitation**.'),
('c1000000-0000-0000-0000-000075acb55d', 'b1000000-0000-0000-0000-000078439382', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00001897c9ae', 'b1000000-0000-0000-0000-00001eed3e8a', 'Introduction to Yoga & Asanas', 'markdown', '{}'::jsonb, 1, '# Introduction to Yoga & Asanas

## Overview
This chapter covers the basic fundamentals of **Yoga & Asanas**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00001897c9af', 'b1000000-0000-0000-0000-00001eed3e8a', 'Theoretical Principles of Yoga & Asanas', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Yoga & Asanas

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Yoga & Asanas**.'),
('c1000000-0000-0000-0000-00001897cd6f', 'b1000000-0000-0000-0000-00001eed3e8b', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Yoga & Asanas**.'),
('c1000000-0000-0000-0000-00001897cd70', 'b1000000-0000-0000-0000-00001eed3e8b', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00002dc1705b', 'b1000000-0000-0000-0000-000050ab1641', 'Introduction to Home Nursing', 'markdown', '{}'::jsonb, 1, '# Introduction to Home Nursing

## Overview
This chapter covers the basic fundamentals of **Home Nursing**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00002dc1705a', 'b1000000-0000-0000-0000-000050ab1641', 'Theoretical Principles of Home Nursing', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Home Nursing

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Home Nursing**.'),
('c1000000-0000-0000-0000-00002dc16c9a', 'b1000000-0000-0000-0000-000050ab1642', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Home Nursing**.'),
('c1000000-0000-0000-0000-00002dc16c99', 'b1000000-0000-0000-0000-000050ab1642', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00006f9ab9c0', 'b1000000-0000-0000-0000-00006ab4b79c', 'Introduction to Posture Training', 'markdown', '{}'::jsonb, 1, '# Introduction to Posture Training

## Overview
This chapter covers the basic fundamentals of **Posture Training**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00006f9ab9bf', 'b1000000-0000-0000-0000-00006ab4b79c', 'Theoretical Principles of Posture Training', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Posture Training

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Posture Training**.'),
('c1000000-0000-0000-0000-00006f9ab5ff', 'b1000000-0000-0000-0000-00006ab4b79d', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Posture Training**.'),
('c1000000-0000-0000-0000-00006f9ab5fe', 'b1000000-0000-0000-0000-00006ab4b79d', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000046089a51', 'b1000000-0000-0000-0000-000055702413', 'Introduction to Obstacles Training & Adventure Activities', 'markdown', '{}'::jsonb, 1, '# Introduction to Obstacles Training & Adventure Activities

## Overview
This chapter covers the basic fundamentals of **Obstacles Training & Adventure Activities**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-000046089a52', 'b1000000-0000-0000-0000-000055702413', 'Theoretical Principles of Obstacles Training & Adventure Activities', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Obstacles Training & Adventure Activities

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Obstacles Training & Adventure Activities**.'),
('c1000000-0000-0000-0000-000046089e12', 'b1000000-0000-0000-0000-000055702412', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Obstacles Training & Adventure Activities**.'),
('c1000000-0000-0000-0000-000046089e13', 'b1000000-0000-0000-0000-000055702412', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00006022b442', 'b1000000-0000-0000-0000-000022cc049a', 'Introduction to Career in Defence Services', 'markdown', '{}'::jsonb, 1, '# Introduction to Career in Defence Services

## Overview
This chapter covers the basic fundamentals of **Career in Defence Services**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00006022b441', 'b1000000-0000-0000-0000-000022cc049a', 'Theoretical Principles of Career in Defence Services', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Career in Defence Services

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Career in Defence Services**.'),
('c1000000-0000-0000-0000-00006022b081', 'b1000000-0000-0000-0000-000022cc049b', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Career in Defence Services**.'),
('c1000000-0000-0000-0000-00006022b080', 'b1000000-0000-0000-0000-000022cc049b', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000021d93601', 'b1000000-0000-0000-0000-00006033a39d', 'Introduction to Services Tests & Interviews', 'markdown', '{}'::jsonb, 1, '# Introduction to Services Tests & Interviews

## Overview
This chapter covers the basic fundamentals of **Services Tests & Interviews**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-000021d93602', 'b1000000-0000-0000-0000-00006033a39d', 'Theoretical Principles of Services Tests & Interviews', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Services Tests & Interviews

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Services Tests & Interviews**.'),
('c1000000-0000-0000-0000-000021d939c2', 'b1000000-0000-0000-0000-00006033a39e', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Services Tests & Interviews**.'),
('c1000000-0000-0000-0000-000021d939c3', 'b1000000-0000-0000-0000-00006033a39e', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00004dbe445a', 'b1000000-0000-0000-0000-00003bdb4e82', 'Introduction to Self-Defence', 'markdown', '{}'::jsonb, 1, '# Introduction to Self-Defence

## Overview
This chapter covers the basic fundamentals of **Self-Defence**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00004dbe4459', 'b1000000-0000-0000-0000-00003bdb4e82', 'Theoretical Principles of Self-Defence', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Self-Defence

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Self-Defence**.'),
('c1000000-0000-0000-0000-00004dbe4099', 'b1000000-0000-0000-0000-00003bdb4e83', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Self-Defence**.'),
('c1000000-0000-0000-0000-00004dbe4098', 'b1000000-0000-0000-0000-00003bdb4e83', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-0000419a1cbd', 'b1000000-0000-0000-0000-000030d146a1', 'Introduction to Environment and Ecology', 'markdown', '{}'::jsonb, 1, '# Introduction to Environment and Ecology

## Overview
This chapter covers the basic fundamentals of **Environment and Ecology**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-0000419a1cbc', 'b1000000-0000-0000-0000-000030d146a1', 'Theoretical Principles of Environment and Ecology', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Environment and Ecology

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Environment and Ecology**.'),
('c1000000-0000-0000-0000-0000419a18fc', 'b1000000-0000-0000-0000-000030d146a0', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Environment and Ecology**.'),
('c1000000-0000-0000-0000-0000419a18fb', 'b1000000-0000-0000-0000-000030d146a0', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00003754ad96', 'b1000000-0000-0000-0000-0000581e038e', 'Introduction to Famous Leaders of India', 'markdown', '{}'::jsonb, 1, '# Introduction to Famous Leaders of India

## Overview
This chapter covers the basic fundamentals of **Famous Leaders of India**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00003754ad97', 'b1000000-0000-0000-0000-0000581e038e', 'Theoretical Principles of Famous Leaders of India', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Famous Leaders of India

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Famous Leaders of India**.'),
('c1000000-0000-0000-0000-00003754b157', 'b1000000-0000-0000-0000-0000581e038d', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Famous Leaders of India**.'),
('c1000000-0000-0000-0000-00003754b158', 'b1000000-0000-0000-0000-0000581e038d', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00007599eea5', 'b1000000-0000-0000-0000-00007eec7289', 'Introduction to History of India', 'markdown', '{}'::jsonb, 1, '# Introduction to History of India

## Overview
This chapter covers the basic fundamentals of **History of India**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00007599eea4', 'b1000000-0000-0000-0000-00007eec7289', 'Theoretical Principles of History of India', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of History of India

## Study Material
Here we explore the detailed guidelines and regulations surrounding **History of India**.'),
('c1000000-0000-0000-0000-00007599eae4', 'b1000000-0000-0000-0000-00007eec7288', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **History of India**.'),
('c1000000-0000-0000-0000-00007599eae3', 'b1000000-0000-0000-0000-00007eec7288', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-0000441c2cdb', 'b1000000-0000-0000-0000-0000009a88f7', 'Introduction to Armed Forces & Military History', 'markdown', '{}'::jsonb, 1, '# Introduction to Armed Forces & Military History

## Overview
This chapter covers the basic fundamentals of **Armed Forces & Military History**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-0000441c2cdc', 'b1000000-0000-0000-0000-0000009a88f7', 'Theoretical Principles of Armed Forces & Military History', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Armed Forces & Military History

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Armed Forces & Military History**.'),
('c1000000-0000-0000-0000-0000441c309c', 'b1000000-0000-0000-0000-0000009a88f8', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Armed Forces & Military History**.'),
('c1000000-0000-0000-0000-0000441c309d', 'b1000000-0000-0000-0000-0000009a88f8', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000078439364', 'Topographic Maps and Conventional Signs', 'markdown', '{}'::jsonb, 1, '# Topographic Maps and Conventional Signs

## What is a Topographic Map?'),
('c1000000-0000-0000-0000-000075ac44bf', 'b1000000-0000-0000-0000-000078439364', 'Theoretical Principles of Map Reading', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Map Reading

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Map Reading**.'),
('c1000000-0000-0000-0000-000075ac40ff', 'b1000000-0000-0000-0000-000078439363', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Map Reading**.'),
('c1000000-0000-0000-0000-000075ac40fe', 'b1000000-0000-0000-0000-000078439363', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00006ea19a74', 'b1000000-0000-0000-0000-0000123ac618', 'Introduction to Communication', 'markdown', '{}'::jsonb, 1, '# Introduction to Communication

## Overview
This chapter covers the basic fundamentals of **Communication**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00006ea19a73', 'b1000000-0000-0000-0000-0000123ac618', 'Theoretical Principles of Communication', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Communication

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Communication**.'),
('c1000000-0000-0000-0000-00006ea196b3', 'b1000000-0000-0000-0000-0000123ac617', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Communication**.'),
('c1000000-0000-0000-0000-00006ea196b2', 'b1000000-0000-0000-0000-0000123ac617', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000059e97f1a', 'b1000000-0000-0000-0000-00004a3aa10a', 'Introduction to Field Craft & Battle Craft', 'markdown', '{}'::jsonb, 1, '# Introduction to Field Craft & Battle Craft

## Overview
This chapter covers the basic fundamentals of **Field Craft & Battle Craft**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-000059e97f1b', 'b1000000-0000-0000-0000-00004a3aa10a', 'Theoretical Principles of Field Craft & Battle Craft', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Field Craft & Battle Craft

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Field Craft & Battle Craft**.'),
('c1000000-0000-0000-0000-000059e982db', 'b1000000-0000-0000-0000-00004a3aa109', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Field Craft & Battle Craft**.'),
('c1000000-0000-0000-0000-000059e982dc', 'b1000000-0000-0000-0000-00004a3aa109', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000063269e5d', 'b1000000-0000-0000-0000-000050d1b041', 'Introduction to Personality Development & Officer Like Qualities (OLQs)', 'markdown', '{}'::jsonb, 1, '# Introduction to Personality Development & Officer Like Qualities (OLQs)

## Overview
This chapter covers the basic fundamentals of **Personality Development & Officer Like Qualities (OLQs)**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-000063269e5c', 'b1000000-0000-0000-0000-000050d1b041', 'Theoretical Principles of Personality Development & Officer Like Qualities (OLQs)', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Personality Development & Officer Like Qualities (OLQs)

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Personality Development & Officer Like Qualities (OLQs)**.'),
('c1000000-0000-0000-0000-000063269a9c', 'b1000000-0000-0000-0000-000050d1b040', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Personality Development & Officer Like Qualities (OLQs)**.'),
('c1000000-0000-0000-0000-000063269a9b', 'b1000000-0000-0000-0000-000050d1b040', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00003d00f185', 'b1000000-0000-0000-0000-0000625c7021', 'Introduction to Disaster Management & Social Awareness', 'markdown', '{}'::jsonb, 1, '# Introduction to Disaster Management & Social Awareness

## Overview
This chapter covers the basic fundamentals of **Disaster Management & Social Awareness**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00003d00f186', 'b1000000-0000-0000-0000-0000625c7021', 'Theoretical Principles of Disaster Management & Social Awareness', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Disaster Management & Social Awareness

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Disaster Management & Social Awareness**.'),
('c1000000-0000-0000-0000-00003d00f546', 'b1000000-0000-0000-0000-0000625c7022', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Disaster Management & Social Awareness**.'),
('c1000000-0000-0000-0000-00003d00f547', 'b1000000-0000-0000-0000-0000625c7022', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00005070cc2b', 'b1000000-0000-0000-0000-000021370671', 'Introduction to Advanced Leadership', 'markdown', '{}'::jsonb, 1, '# Introduction to Advanced Leadership

## Overview
This chapter covers the basic fundamentals of **Advanced Leadership**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00005070cc2a', 'b1000000-0000-0000-0000-000021370671', 'Theoretical Principles of Advanced Leadership', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Advanced Leadership

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Advanced Leadership**.'),
('c1000000-0000-0000-0000-00005070c86a', 'b1000000-0000-0000-0000-000021370672', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Advanced Leadership**.'),
('c1000000-0000-0000-0000-00005070c869', 'b1000000-0000-0000-0000-000021370672', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00003a1e08ee', 'b1000000-0000-0000-0000-00002d148b12', 'Introduction to Advanced Drill', 'markdown', '{}'::jsonb, 1, '# Introduction to Advanced Drill

## Overview
This chapter covers the basic fundamentals of **Advanced Drill**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00003a1e08ed', 'b1000000-0000-0000-0000-00002d148b12', 'Theoretical Principles of Advanced Drill', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Advanced Drill

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Advanced Drill**.'),
('c1000000-0000-0000-0000-00003a1e052d', 'b1000000-0000-0000-0000-00002d148b11', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Advanced Drill**.'),
('c1000000-0000-0000-0000-00003a1e052c', 'b1000000-0000-0000-0000-00002d148b11', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-0000476c0b53', 'b1000000-0000-0000-0000-00007659e2b7', 'Introduction to National Security', 'markdown', '{}'::jsonb, 1, '# Introduction to National Security

## Overview
This chapter covers the basic fundamentals of **National Security**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-0000476c0b52', 'b1000000-0000-0000-0000-00007659e2b7', 'Theoretical Principles of National Security', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of National Security

## Study Material
Here we explore the detailed guidelines and regulations surrounding **National Security**.'),
('c1000000-0000-0000-0000-0000476c0792', 'b1000000-0000-0000-0000-00007659e2b6', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **National Security**.'),
('c1000000-0000-0000-0000-0000476c0791', 'b1000000-0000-0000-0000-00007659e2b6', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000001945e62', 'b1000000-0000-0000-0000-00002d49ad86', 'Introduction to Armed Forces Organisation', 'markdown', '{}'::jsonb, 1, '# Introduction to Armed Forces Organisation

## Overview
This chapter covers the basic fundamentals of **Armed Forces Organisation**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-000001945e61', 'b1000000-0000-0000-0000-00002d49ad86', 'Theoretical Principles of Armed Forces Organisation', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Armed Forces Organisation

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Armed Forces Organisation**.'),
('c1000000-0000-0000-0000-000001945aa1', 'b1000000-0000-0000-0000-00002d49ad85', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Armed Forces Organisation**.'),
('c1000000-0000-0000-0000-000001945aa0', 'b1000000-0000-0000-0000-00002d49ad85', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000074a9b238', 'b1000000-0000-0000-0000-0000356c3e6c', 'Introduction to Disaster Management', 'markdown', '{}'::jsonb, 1, '# Introduction to Disaster Management

## Overview
This chapter covers the basic fundamentals of **Disaster Management**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-000074a9b239', 'b1000000-0000-0000-0000-0000356c3e6c', 'Theoretical Principles of Disaster Management', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Disaster Management

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Disaster Management**.'),
('c1000000-0000-0000-0000-000074a9b5f9', 'b1000000-0000-0000-0000-0000356c3e6b', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Disaster Management**.'),
('c1000000-0000-0000-0000-000074a9b5fa', 'b1000000-0000-0000-0000-0000356c3e6b', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00004cf0b785', 'b1000000-0000-0000-0000-00001785b621', 'Introduction to Social Service & Community Development', 'markdown', '{}'::jsonb, 1, '# Introduction to Social Service & Community Development

## Overview
This chapter covers the basic fundamentals of **Social Service & Community Development**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00004cf0b786', 'b1000000-0000-0000-0000-00001785b621', 'Theoretical Principles of Social Service & Community Development', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Social Service & Community Development

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Social Service & Community Development**.'),
('c1000000-0000-0000-0000-00004cf0bb46', 'b1000000-0000-0000-0000-00001785b622', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Social Service & Community Development**.'),
('c1000000-0000-0000-0000-00004cf0bb47', 'b1000000-0000-0000-0000-00001785b622', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00007c5aed79', 'b1000000-0000-0000-0000-00002bd326eb', 'Introduction to Personality Development & Communication Skills', 'markdown', '{}'::jsonb, 1, '# Introduction to Personality Development & Communication Skills

## Overview
This chapter covers the basic fundamentals of **Personality Development & Communication Skills**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00007c5aed7a', 'b1000000-0000-0000-0000-00002bd326eb', 'Theoretical Principles of Personality Development & Communication Skills', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Personality Development & Communication Skills

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Personality Development & Communication Skills**.'),
('c1000000-0000-0000-0000-00007c5af13a', 'b1000000-0000-0000-0000-00002bd326ea', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Personality Development & Communication Skills**.'),
('c1000000-0000-0000-0000-00007c5af13b', 'b1000000-0000-0000-0000-00002bd326ea', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00002cc16856', 'b1000000-0000-0000-0000-00001fa75b86', 'Introduction to Map Reading & Navigation', 'markdown', '{}'::jsonb, 1, '# Introduction to Map Reading & Navigation

## Overview
This chapter covers the basic fundamentals of **Map Reading & Navigation**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00002cc16855', 'b1000000-0000-0000-0000-00001fa75b86', 'Theoretical Principles of Map Reading & Navigation', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Map Reading & Navigation

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Map Reading & Navigation**.'),
('c1000000-0000-0000-0000-00002cc16495', 'b1000000-0000-0000-0000-00001fa75b87', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Map Reading & Navigation**.'),
('c1000000-0000-0000-0000-00002cc16494', 'b1000000-0000-0000-0000-00001fa75b87', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000047b3d36c', 'b1000000-0000-0000-0000-000013a36038', 'Introduction to Field Craft & Battle Craft', 'markdown', '{}'::jsonb, 1, '# Introduction to Field Craft & Battle Craft

## Overview
This chapter covers the basic fundamentals of **Field Craft & Battle Craft**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-000047b3d36d', 'b1000000-0000-0000-0000-000013a36038', 'Theoretical Principles of Field Craft & Battle Craft', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Field Craft & Battle Craft

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Field Craft & Battle Craft**.'),
('c1000000-0000-0000-0000-000047b3d72d', 'b1000000-0000-0000-0000-000013a36037', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Field Craft & Battle Craft**.'),
('c1000000-0000-0000-0000-000047b3d72e', 'b1000000-0000-0000-0000-000013a36037', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00002986a3f6', 'b1000000-0000-0000-0000-00001987b7e6', 'Introduction to Military History & War Heroes', 'markdown', '{}'::jsonb, 1, '# Introduction to Military History & War Heroes

## Overview
This chapter covers the basic fundamentals of **Military History & War Heroes**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-00002986a3f5', 'b1000000-0000-0000-0000-00001987b7e6', 'Theoretical Principles of Military History & War Heroes', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Military History & War Heroes

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Military History & War Heroes**.'),
('c1000000-0000-0000-0000-00002986a035', 'b1000000-0000-0000-0000-00001987b7e7', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Military History & War Heroes**.'),
('c1000000-0000-0000-0000-00002986a034', 'b1000000-0000-0000-0000-00001987b7e7', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000041022af7', 'b1000000-0000-0000-0000-00004c1ea1ed', 'Introduction to General Awareness & Current Affairs', 'markdown', '{}'::jsonb, 1, '# Introduction to General Awareness & Current Affairs

## Overview
This chapter covers the basic fundamentals of **General Awareness & Current Affairs**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-000041022af8', 'b1000000-0000-0000-0000-00004c1ea1ed', 'Theoretical Principles of General Awareness & Current Affairs', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of General Awareness & Current Affairs

## Study Material
Here we explore the detailed guidelines and regulations surrounding **General Awareness & Current Affairs**.'),
('c1000000-0000-0000-0000-000041022eb8', 'b1000000-0000-0000-0000-00004c1ea1ec', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **General Awareness & Current Affairs**.'),
('c1000000-0000-0000-0000-000041022eb9', 'b1000000-0000-0000-0000-00004c1ea1ec', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000056970cc4', 'b1000000-0000-0000-0000-00002711b0e0', 'Introduction to Officer Like Qualities (OLQs) & Interview Skills', 'markdown', '{}'::jsonb, 1, '# Introduction to Officer Like Qualities (OLQs) & Interview Skills

## Overview
This chapter covers the basic fundamentals of **Officer Like Qualities (OLQs) & Interview Skills**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Common** wing.'),
('c1000000-0000-0000-0000-000056970cc5', 'b1000000-0000-0000-0000-00002711b0e0', 'Theoretical Principles of Officer Like Qualities (OLQs) & Interview Skills', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Officer Like Qualities (OLQs) & Interview Skills

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Officer Like Qualities (OLQs) & Interview Skills**.'),
('c1000000-0000-0000-0000-000056971085', 'b1000000-0000-0000-0000-00002711b0df', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Officer Like Qualities (OLQs) & Interview Skills**.'),
('c1000000-0000-0000-0000-000056971086', 'b1000000-0000-0000-0000-00002711b0df', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-0000562a6038', 'b1000000-0000-0000-0000-000031fdd324', 'Introduction to Field Craft Basics', 'markdown', '{}'::jsonb, 1, '# Introduction to Field Craft Basics

## Overview
This chapter covers the basic fundamentals of **Field Craft Basics**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-0000562a6037', 'b1000000-0000-0000-0000-000031fdd324', 'Theoretical Principles of Field Craft Basics', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Field Craft Basics

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Field Craft Basics**.'),
('c1000000-0000-0000-0000-0000562a5c77', 'b1000000-0000-0000-0000-000031fdd325', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Field Craft Basics**.'),
('c1000000-0000-0000-0000-0000562a5c76', 'b1000000-0000-0000-0000-000031fdd325', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00005a4e792b', 'b1000000-0000-0000-0000-00003093a947', 'Introduction to Drill with Arms', 'markdown', '{}'::jsonb, 1, '# Introduction to Drill with Arms

## Overview
This chapter covers the basic fundamentals of **Drill with Arms**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-00005a4e792c', 'b1000000-0000-0000-0000-00003093a947', 'Theoretical Principles of Drill with Arms', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Drill with Arms

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Drill with Arms**.'),
('c1000000-0000-0000-0000-00005a4e7cec', 'b1000000-0000-0000-0000-00003093a948', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Drill with Arms**.'),
('c1000000-0000-0000-0000-00005a4e7ced', 'b1000000-0000-0000-0000-00003093a948', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000075abd061', 'b1000000-0000-0000-0000-000078439345', 'Introduction to Weapon Training', 'markdown', '{}'::jsonb, 1, '# Introduction to Weapon Training

## Overview
This chapter covers the basic fundamentals of **Weapon Training**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-000075abd060', 'b1000000-0000-0000-0000-000078439345', 'Theoretical Principles of Weapon Training', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Weapon Training

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Weapon Training**.'),
('c1000000-0000-0000-0000-000075abcca0', 'b1000000-0000-0000-0000-000078439344', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Weapon Training**.'),
('c1000000-0000-0000-0000-000075abcc9f', 'b1000000-0000-0000-0000-000078439344', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-0000066a0b64', 'b1000000-0000-0000-0000-000070b075c0', 'Introduction to Section Formation', 'markdown', '{}'::jsonb, 1, '# Introduction to Section Formation

## Overview
This chapter covers the basic fundamentals of **Section Formation**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-0000066a0b65', 'b1000000-0000-0000-0000-000070b075c0', 'Theoretical Principles of Section Formation', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Section Formation

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Section Formation**.'),
('c1000000-0000-0000-0000-0000066a0f25', 'b1000000-0000-0000-0000-000070b075c1', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Section Formation**.'),
('c1000000-0000-0000-0000-0000066a0f26', 'b1000000-0000-0000-0000-000070b075c1', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-0000352efb39', 'b1000000-0000-0000-0000-000017c3941d', 'Introduction to Guard Mounting', 'markdown', '{}'::jsonb, 1, '# Introduction to Guard Mounting

## Overview
This chapter covers the basic fundamentals of **Guard Mounting**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-0000352efb38', 'b1000000-0000-0000-0000-000017c3941d', 'Theoretical Principles of Guard Mounting', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Guard Mounting

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Guard Mounting**.'),
('c1000000-0000-0000-0000-0000352ef778', 'b1000000-0000-0000-0000-000017c3941c', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Guard Mounting**.'),
('c1000000-0000-0000-0000-0000352ef777', 'b1000000-0000-0000-0000-000017c3941c', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00006eead09d', 'b1000000-0000-0000-0000-000067828d7f', 'Introduction to Battle Craft Basics', 'markdown', '{}'::jsonb, 1, '# Introduction to Battle Craft Basics

## Overview
This chapter covers the basic fundamentals of **Battle Craft Basics**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-00006eead09c', 'b1000000-0000-0000-0000-000067828d7f', 'Theoretical Principles of Battle Craft Basics', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Battle Craft Basics

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Battle Craft Basics**.'),
('c1000000-0000-0000-0000-00006eeaccdc', 'b1000000-0000-0000-0000-000067828d80', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Battle Craft Basics**.'),
('c1000000-0000-0000-0000-00006eeaccdb', 'b1000000-0000-0000-0000-000067828d80', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00006d9497fc', 'b1000000-0000-0000-0000-0000363ab7a8', 'Introduction to Advanced Weapon Training', 'markdown', '{}'::jsonb, 1, '# Introduction to Advanced Weapon Training

## Overview
This chapter covers the basic fundamentals of **Advanced Weapon Training**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-00006d9497fd', 'b1000000-0000-0000-0000-0000363ab7a8', 'Theoretical Principles of Advanced Weapon Training', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Advanced Weapon Training

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Advanced Weapon Training**.'),
('c1000000-0000-0000-0000-00006d949bbd', 'b1000000-0000-0000-0000-0000363ab7a7', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Advanced Weapon Training**.'),
('c1000000-0000-0000-0000-00006d949bbe', 'b1000000-0000-0000-0000-0000363ab7a7', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-0000527f9dc2', 'b1000000-0000-0000-0000-000070dcf862', 'Introduction to Field Signals', 'markdown', '{}'::jsonb, 1, '# Introduction to Field Signals

## Overview
This chapter covers the basic fundamentals of **Field Signals**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-0000527f9dc3', 'b1000000-0000-0000-0000-000070dcf862', 'Theoretical Principles of Field Signals', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Field Signals

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Field Signals**.'),
('c1000000-0000-0000-0000-0000527fa183', 'b1000000-0000-0000-0000-000070dcf861', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Field Signals**.'),
('c1000000-0000-0000-0000-0000527fa184', 'b1000000-0000-0000-0000-000070dcf861', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000023ac73f3', 'b1000000-0000-0000-0000-00006adbf357', 'Introduction to Patrolling', 'markdown', '{}'::jsonb, 1, '# Introduction to Patrolling

## Overview
This chapter covers the basic fundamentals of **Patrolling**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-000023ac73f2', 'b1000000-0000-0000-0000-00006adbf357', 'Theoretical Principles of Patrolling', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Patrolling

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Patrolling**.'),
('c1000000-0000-0000-0000-000023ac7032', 'b1000000-0000-0000-0000-00006adbf356', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Patrolling**.'),
('c1000000-0000-0000-0000-000023ac7031', 'b1000000-0000-0000-0000-00006adbf356', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00000a56d3e9', 'b1000000-0000-0000-0000-00004030647b', 'Introduction to Camouflage & Concealment', 'markdown', '{}'::jsonb, 1, '# Introduction to Camouflage & Concealment

## Overview
This chapter covers the basic fundamentals of **Camouflage & Concealment**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-00000a56d3ea', 'b1000000-0000-0000-0000-00004030647b', 'Theoretical Principles of Camouflage & Concealment', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Camouflage & Concealment

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Camouflage & Concealment**.'),
('c1000000-0000-0000-0000-00000a56d7aa', 'b1000000-0000-0000-0000-00004030647a', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Camouflage & Concealment**.'),
('c1000000-0000-0000-0000-00000a56d7ab', 'b1000000-0000-0000-0000-00004030647a', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000028b4561d', 'b1000000-0000-0000-0000-00000615a7ff', 'Introduction to Section Battle Drill', 'markdown', '{}'::jsonb, 1, '# Introduction to Section Battle Drill

## Overview
This chapter covers the basic fundamentals of **Section Battle Drill**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-000028b4561c', 'b1000000-0000-0000-0000-00000615a7ff', 'Theoretical Principles of Section Battle Drill', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Section Battle Drill

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Section Battle Drill**.'),
('c1000000-0000-0000-0000-000028b4525c', 'b1000000-0000-0000-0000-00000615a800', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Section Battle Drill**.'),
('c1000000-0000-0000-0000-000028b4525b', 'b1000000-0000-0000-0000-00000615a800', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000079d241a4', 'b1000000-0000-0000-0000-0000013486b8', 'Introduction to Ambush & Defence', 'markdown', '{}'::jsonb, 1, '# Introduction to Ambush & Defence

## Overview
This chapter covers the basic fundamentals of **Ambush & Defence**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-000079d241a3', 'b1000000-0000-0000-0000-0000013486b8', 'Theoretical Principles of Ambush & Defence', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Ambush & Defence

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Ambush & Defence**.'),
('c1000000-0000-0000-0000-000079d23de3', 'b1000000-0000-0000-0000-0000013486b9', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Ambush & Defence**.'),
('c1000000-0000-0000-0000-000079d23de2', 'b1000000-0000-0000-0000-0000013486b9', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00006b411fe8', 'b1000000-0000-0000-0000-00001fdae774', 'Introduction to Tactical Exercises', 'markdown', '{}'::jsonb, 1, '# Introduction to Tactical Exercises

## Overview
This chapter covers the basic fundamentals of **Tactical Exercises**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-00006b411fe7', 'b1000000-0000-0000-0000-00001fdae774', 'Theoretical Principles of Tactical Exercises', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Tactical Exercises

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Tactical Exercises**.'),
('c1000000-0000-0000-0000-00006b411c27', 'b1000000-0000-0000-0000-00001fdae775', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Tactical Exercises**.'),
('c1000000-0000-0000-0000-00006b411c26', 'b1000000-0000-0000-0000-00001fdae775', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000066565e3b', 'b1000000-0000-0000-0000-000045f43061', 'Introduction to Platoon Formation', 'markdown', '{}'::jsonb, 1, '# Introduction to Platoon Formation

## Overview
This chapter covers the basic fundamentals of **Platoon Formation**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-000066565e3a', 'b1000000-0000-0000-0000-000045f43061', 'Theoretical Principles of Platoon Formation', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Platoon Formation

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Platoon Formation**.'),
('c1000000-0000-0000-0000-000066565a7a', 'b1000000-0000-0000-0000-000045f43062', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Platoon Formation**.'),
('c1000000-0000-0000-0000-000066565a79', 'b1000000-0000-0000-0000-000045f43062', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00005ab83223', 'b1000000-0000-0000-0000-00001f87403f', 'Introduction to Advanced Battle Craft', 'markdown', '{}'::jsonb, 1, '# Introduction to Advanced Battle Craft

## Overview
This chapter covers the basic fundamentals of **Advanced Battle Craft**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-00005ab83224', 'b1000000-0000-0000-0000-00001f87403f', 'Theoretical Principles of Advanced Battle Craft', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Advanced Battle Craft

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Advanced Battle Craft**.'),
('c1000000-0000-0000-0000-00005ab835e4', 'b1000000-0000-0000-0000-00001f874040', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Advanced Battle Craft**.'),
('c1000000-0000-0000-0000-00005ab835e5', 'b1000000-0000-0000-0000-00001f874040', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000010207cf3', 'b1000000-0000-0000-0000-00003941c3a9', 'Introduction to Internal Security Duties', 'markdown', '{}'::jsonb, 1, '# Introduction to Internal Security Duties

## Overview
This chapter covers the basic fundamentals of **Internal Security Duties**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-000010207cf2', 'b1000000-0000-0000-0000-00003941c3a9', 'Theoretical Principles of Internal Security Duties', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Internal Security Duties

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Internal Security Duties**.'),
('c1000000-0000-0000-0000-000010207932', 'b1000000-0000-0000-0000-00003941c3aa', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Internal Security Duties**.'),
('c1000000-0000-0000-0000-000010207931', 'b1000000-0000-0000-0000-00003941c3aa', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00003d10dec4', 'b1000000-0000-0000-0000-000057b4a120', 'Introduction to Field Engineering', 'markdown', '{}'::jsonb, 1, '# Introduction to Field Engineering

## Overview
This chapter covers the basic fundamentals of **Field Engineering**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-00003d10dec5', 'b1000000-0000-0000-0000-000057b4a120', 'Theoretical Principles of Field Engineering', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Field Engineering

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Field Engineering**.'),
('c1000000-0000-0000-0000-00003d10e285', 'b1000000-0000-0000-0000-000057b4a121', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Field Engineering**.'),
('c1000000-0000-0000-0000-00003d10e286', 'b1000000-0000-0000-0000-000057b4a121', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00001f95a7f7', 'b1000000-0000-0000-0000-00002b301b13', 'Introduction to Communication Procedures', 'markdown', '{}'::jsonb, 1, '# Introduction to Communication Procedures

## Overview
This chapter covers the basic fundamentals of **Communication Procedures**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-00001f95a7f8', 'b1000000-0000-0000-0000-00002b301b13', 'Theoretical Principles of Communication Procedures', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Communication Procedures

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Communication Procedures**.'),
('c1000000-0000-0000-0000-00001f95abb8', 'b1000000-0000-0000-0000-00002b301b14', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Communication Procedures**.'),
('c1000000-0000-0000-0000-00001f95abb9', 'b1000000-0000-0000-0000-00002b301b14', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000017b73a41', 'b1000000-0000-0000-0000-00006dba4823', 'Introduction to Map Reading Advanced', 'markdown', '{}'::jsonb, 1, '# Introduction to Map Reading Advanced

## Overview
This chapter covers the basic fundamentals of **Map Reading Advanced**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Army** wing.'),
('c1000000-0000-0000-0000-000017b73a42', 'b1000000-0000-0000-0000-00006dba4823', 'Theoretical Principles of Map Reading Advanced', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Map Reading Advanced

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Map Reading Advanced**.'),
('c1000000-0000-0000-0000-000017b73e02', 'b1000000-0000-0000-0000-00006dba4822', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Map Reading Advanced**.'),
('c1000000-0000-0000-0000-000017b73e03', 'b1000000-0000-0000-0000-00006dba4822', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000043eb9b00', 'b1000000-0000-0000-0000-000071493c5c', 'Introduction to Naval Orientation', 'markdown', '{}'::jsonb, 1, '# Introduction to Naval Orientation

## Overview
This chapter covers the basic fundamentals of **Naval Orientation**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-000043eb9b01', 'b1000000-0000-0000-0000-000071493c5c', 'Theoretical Principles of Naval Orientation', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Naval Orientation

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Naval Orientation**.'),
('c1000000-0000-0000-0000-000043eb9ec1', 'b1000000-0000-0000-0000-000071493c5d', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Naval Orientation**.'),
('c1000000-0000-0000-0000-000043eb9ec2', 'b1000000-0000-0000-0000-000071493c5d', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000069ed6743', 'b1000000-0000-0000-0000-00000138c2a1', 'Introduction to Parts of Ship', 'markdown', '{}'::jsonb, 1, '# Introduction to Parts of Ship

## Overview
This chapter covers the basic fundamentals of **Parts of Ship**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-000069ed6744', 'b1000000-0000-0000-0000-00000138c2a1', 'Theoretical Principles of Parts of Ship', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Parts of Ship

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Parts of Ship**.'),
('c1000000-0000-0000-0000-000069ed6b04', 'b1000000-0000-0000-0000-00000138c2a0', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Parts of Ship**.'),
('c1000000-0000-0000-0000-000069ed6b05', 'b1000000-0000-0000-0000-00000138c2a0', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00001eb9805d', 'b1000000-0000-0000-0000-00003a1ad4f9', 'Introduction to Seamanship', 'markdown', '{}'::jsonb, 1, '# Introduction to Seamanship

## Overview
This chapter covers the basic fundamentals of **Seamanship**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-00001eb9805e', 'b1000000-0000-0000-0000-00003a1ad4f9', 'Theoretical Principles of Seamanship', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Seamanship

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Seamanship**.'),
('c1000000-0000-0000-0000-00001eb9841e', 'b1000000-0000-0000-0000-00003a1ad4fa', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Seamanship**.'),
('c1000000-0000-0000-0000-00001eb9841f', 'b1000000-0000-0000-0000-00003a1ad4fa', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00004cec69b5', 'b1000000-0000-0000-0000-000036283451', 'Introduction to Boat Pulling', 'markdown', '{}'::jsonb, 1, '# Introduction to Boat Pulling

## Overview
This chapter covers the basic fundamentals of **Boat Pulling**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-00004cec69b6', 'b1000000-0000-0000-0000-000036283451', 'Theoretical Principles of Boat Pulling', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Boat Pulling

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Boat Pulling**.'),
('c1000000-0000-0000-0000-00004cec6d76', 'b1000000-0000-0000-0000-000036283452', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Boat Pulling**.'),
('c1000000-0000-0000-0000-00004cec6d77', 'b1000000-0000-0000-0000-000036283452', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00003f24d6da', 'b1000000-0000-0000-0000-0000328c594a', 'Introduction to Rigging', 'markdown', '{}'::jsonb, 1, '# Introduction to Rigging

## Overview
This chapter covers the basic fundamentals of **Rigging**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-00003f24d6db', 'b1000000-0000-0000-0000-0000328c594a', 'Theoretical Principles of Rigging', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Rigging

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Rigging**.'),
('c1000000-0000-0000-0000-00003f24da9b', 'b1000000-0000-0000-0000-0000328c5949', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Rigging**.'),
('c1000000-0000-0000-0000-00003f24da9c', 'b1000000-0000-0000-0000-0000328c5949', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-0000191c1185', 'b1000000-0000-0000-0000-000035406fdf', 'Introduction to Naval Communication Basics', 'markdown', '{}'::jsonb, 1, '# Introduction to Naval Communication Basics

## Overview
This chapter covers the basic fundamentals of **Naval Communication Basics**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-0000191c1186', 'b1000000-0000-0000-0000-000035406fdf', 'Theoretical Principles of Naval Communication Basics', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Naval Communication Basics

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Naval Communication Basics**.'),
('c1000000-0000-0000-0000-0000191c1546', 'b1000000-0000-0000-0000-000035406fde', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Naval Communication Basics**.'),
('c1000000-0000-0000-0000-0000191c1547', 'b1000000-0000-0000-0000-000035406fde', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000002fc2e7d', 'b1000000-0000-0000-0000-00006a8d74e7', 'Introduction to Navigation', 'markdown', '{}'::jsonb, 1, '# Introduction to Navigation

## Overview
This chapter covers the basic fundamentals of **Navigation**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-000002fc2e7e', 'b1000000-0000-0000-0000-00006a8d74e7', 'Theoretical Principles of Navigation', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Navigation

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Navigation**.'),
('c1000000-0000-0000-0000-000002fc323e', 'b1000000-0000-0000-0000-00006a8d74e6', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Navigation**.'),
('c1000000-0000-0000-0000-000002fc323f', 'b1000000-0000-0000-0000-00006a8d74e6', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000029339381', 'b1000000-0000-0000-0000-00006d87611d', 'Introduction to Anchoring', 'markdown', '{}'::jsonb, 1, '# Introduction to Anchoring

## Overview
This chapter covers the basic fundamentals of **Anchoring**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-000029339382', 'b1000000-0000-0000-0000-00006d87611d', 'Theoretical Principles of Anchoring', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Anchoring

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Anchoring**.'),
('c1000000-0000-0000-0000-000029339742', 'b1000000-0000-0000-0000-00006d87611e', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Anchoring**.'),
('c1000000-0000-0000-0000-000029339743', 'b1000000-0000-0000-0000-00006d87611e', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00002cae100d', 'b1000000-0000-0000-0000-00007fe9cdf1', 'Introduction to Ship Modelling', 'markdown', '{}'::jsonb, 1, '# Introduction to Ship Modelling

## Overview
This chapter covers the basic fundamentals of **Ship Modelling**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-00002cae100c', 'b1000000-0000-0000-0000-00007fe9cdf1', 'Theoretical Principles of Ship Modelling', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Ship Modelling

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Ship Modelling**.'),
('c1000000-0000-0000-0000-00002cae0c4c', 'b1000000-0000-0000-0000-00007fe9cdf0', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Ship Modelling**.'),
('c1000000-0000-0000-0000-00002cae0c4b', 'b1000000-0000-0000-0000-00007fe9cdf0', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000023cd0b0a', 'b1000000-0000-0000-0000-00004a04d91a', 'Introduction to Naval Signals', 'markdown', '{}'::jsonb, 1, '# Introduction to Naval Signals

## Overview
This chapter covers the basic fundamentals of **Naval Signals**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-000023cd0b0b', 'b1000000-0000-0000-0000-00004a04d91a', 'Theoretical Principles of Naval Signals', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Naval Signals

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Naval Signals**.'),
('c1000000-0000-0000-0000-000023cd0ecb', 'b1000000-0000-0000-0000-00004a04d919', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Naval Signals**.'),
('c1000000-0000-0000-0000-000023cd0ecc', 'b1000000-0000-0000-0000-00004a04d919', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00003b85b41d', 'b1000000-0000-0000-0000-0000501f0747', 'Introduction to Boat Sailing', 'markdown', '{}'::jsonb, 1, '# Introduction to Boat Sailing

## Overview
This chapter covers the basic fundamentals of **Boat Sailing**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-00003b85b41e', 'b1000000-0000-0000-0000-0000501f0747', 'Theoretical Principles of Boat Sailing', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Boat Sailing

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Boat Sailing**.'),
('c1000000-0000-0000-0000-00003b85b7de', 'b1000000-0000-0000-0000-0000501f0746', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Boat Sailing**.'),
('c1000000-0000-0000-0000-00003b85b7df', 'b1000000-0000-0000-0000-0000501f0746', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000022624a12', 'b1000000-0000-0000-0000-0000169b7812', 'Introduction to Tides & Compass', 'markdown', '{}'::jsonb, 1, '# Introduction to Tides & Compass

## Overview
This chapter covers the basic fundamentals of **Tides & Compass**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-000022624a13', 'b1000000-0000-0000-0000-0000169b7812', 'Theoretical Principles of Tides & Compass', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Tides & Compass

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Tides & Compass**.'),
('c1000000-0000-0000-0000-000022624dd3', 'b1000000-0000-0000-0000-0000169b7811', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Tides & Compass**.'),
('c1000000-0000-0000-0000-000022624dd4', 'b1000000-0000-0000-0000-0000169b7811', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000074eba54c', 'b1000000-0000-0000-0000-000040e09658', 'Introduction to Advanced Navigation', 'markdown', '{}'::jsonb, 1, '# Introduction to Advanced Navigation

## Overview
This chapter covers the basic fundamentals of **Advanced Navigation**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-000074eba54d', 'b1000000-0000-0000-0000-000040e09658', 'Theoretical Principles of Advanced Navigation', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Advanced Navigation

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Advanced Navigation**.'),
('c1000000-0000-0000-0000-000074eba90d', 'b1000000-0000-0000-0000-000040e09657', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Advanced Navigation**.'),
('c1000000-0000-0000-0000-000074eba90e', 'b1000000-0000-0000-0000-000040e09657', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000019f60841', 'b1000000-0000-0000-0000-000011e005dd', 'Introduction to Naval Warfare Basics', 'markdown', '{}'::jsonb, 1, '# Introduction to Naval Warfare Basics

## Overview
This chapter covers the basic fundamentals of **Naval Warfare Basics**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-000019f60842', 'b1000000-0000-0000-0000-000011e005dd', 'Theoretical Principles of Naval Warfare Basics', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Naval Warfare Basics

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Naval Warfare Basics**.'),
('c1000000-0000-0000-0000-000019f60c02', 'b1000000-0000-0000-0000-000011e005de', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Naval Warfare Basics**.'),
('c1000000-0000-0000-0000-000019f60c03', 'b1000000-0000-0000-0000-000011e005de', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00000c394e9c', 'b1000000-0000-0000-0000-00003698d908', 'Introduction to Ship Organisation', 'markdown', '{}'::jsonb, 1, '# Introduction to Ship Organisation

## Overview
This chapter covers the basic fundamentals of **Ship Organisation**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-00000c394e9d', 'b1000000-0000-0000-0000-00003698d908', 'Theoretical Principles of Ship Organisation', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Ship Organisation

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Ship Organisation**.'),
('c1000000-0000-0000-0000-00000c39525d', 'b1000000-0000-0000-0000-00003698d907', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Ship Organisation**.'),
('c1000000-0000-0000-0000-00000c39525e', 'b1000000-0000-0000-0000-00003698d907', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00000929b2a0', 'b1000000-0000-0000-0000-00007f974404', 'Introduction to Communication Systems', 'markdown', '{}'::jsonb, 1, '# Introduction to Communication Systems

## Overview
This chapter covers the basic fundamentals of **Communication Systems**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-00000929b2a1', 'b1000000-0000-0000-0000-00007f974404', 'Theoretical Principles of Communication Systems', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Communication Systems

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Communication Systems**.'),
('c1000000-0000-0000-0000-00000929b661', 'b1000000-0000-0000-0000-00007f974403', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Communication Systems**.'),
('c1000000-0000-0000-0000-00000929b662', 'b1000000-0000-0000-0000-00007f974403', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00002203684d', 'b1000000-0000-0000-0000-00000f383631', 'Introduction to Sailing Expeditions', 'markdown', '{}'::jsonb, 1, '# Introduction to Sailing Expeditions

## Overview
This chapter covers the basic fundamentals of **Sailing Expeditions**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-00002203684c', 'b1000000-0000-0000-0000-00000f383631', 'Theoretical Principles of Sailing Expeditions', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Sailing Expeditions

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Sailing Expeditions**.'),
('c1000000-0000-0000-0000-00002203648c', 'b1000000-0000-0000-0000-00000f383630', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Sailing Expeditions**.'),
('c1000000-0000-0000-0000-00002203648b', 'b1000000-0000-0000-0000-00000f383630', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000075243141', 'b1000000-0000-0000-0000-00007b7b9123', 'Introduction to Naval Weapons Basics', 'markdown', '{}'::jsonb, 1, '# Introduction to Naval Weapons Basics

## Overview
This chapter covers the basic fundamentals of **Naval Weapons Basics**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-000075243142', 'b1000000-0000-0000-0000-00007b7b9123', 'Theoretical Principles of Naval Weapons Basics', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Naval Weapons Basics

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Naval Weapons Basics**.'),
('c1000000-0000-0000-0000-000075243502', 'b1000000-0000-0000-0000-00007b7b9122', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Naval Weapons Basics**.'),
('c1000000-0000-0000-0000-000075243503', 'b1000000-0000-0000-0000-00007b7b9122', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000076e4251f', 'b1000000-0000-0000-0000-0000079a007d', 'Introduction to Leadership at Sea', 'markdown', '{}'::jsonb, 1, '# Introduction to Leadership at Sea

## Overview
This chapter covers the basic fundamentals of **Leadership at Sea**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Navy** wing.'),
('c1000000-0000-0000-0000-000076e4251e', 'b1000000-0000-0000-0000-0000079a007d', 'Theoretical Principles of Leadership at Sea', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Leadership at Sea

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Leadership at Sea**.'),
('c1000000-0000-0000-0000-000076e4215e', 'b1000000-0000-0000-0000-0000079a007e', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Leadership at Sea**.'),
('c1000000-0000-0000-0000-000076e4215d', 'b1000000-0000-0000-0000-0000079a007e', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-0000763ce794', 'b1000000-0000-0000-0000-00007c86db38', 'Introduction to Principles of Flight', 'markdown', '{}'::jsonb, 1, '# Introduction to Principles of Flight

## Overview
This chapter covers the basic fundamentals of **Principles of Flight**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-0000763ce793', 'b1000000-0000-0000-0000-00007c86db38', 'Theoretical Principles of Principles of Flight', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Principles of Flight

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Principles of Flight**.'),
('c1000000-0000-0000-0000-0000763ce3d3', 'b1000000-0000-0000-0000-00007c86db37', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Principles of Flight**.'),
('c1000000-0000-0000-0000-0000763ce3d2', 'b1000000-0000-0000-0000-00007c86db37', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-0000360e5cbd', 'b1000000-0000-0000-0000-000037bb4959', 'Introduction to Airframe & Aircraft Parts', 'markdown', '{}'::jsonb, 1, '# Introduction to Airframe & Aircraft Parts

## Overview
This chapter covers the basic fundamentals of **Airframe & Aircraft Parts**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-0000360e5cbe', 'b1000000-0000-0000-0000-000037bb4959', 'Theoretical Principles of Airframe & Aircraft Parts', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Airframe & Aircraft Parts

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Airframe & Aircraft Parts**.'),
('c1000000-0000-0000-0000-0000360e607e', 'b1000000-0000-0000-0000-000037bb495a', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Airframe & Aircraft Parts**.'),
('c1000000-0000-0000-0000-0000360e607f', 'b1000000-0000-0000-0000-000037bb495a', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000058d2d71f', 'b1000000-0000-0000-0000-000075a6ce7d', 'Introduction to Flying Basics', 'markdown', '{}'::jsonb, 1, '# Introduction to Flying Basics

## Overview
This chapter covers the basic fundamentals of **Flying Basics**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-000058d2d71e', 'b1000000-0000-0000-0000-000075a6ce7d', 'Theoretical Principles of Flying Basics', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Flying Basics

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Flying Basics**.'),
('c1000000-0000-0000-0000-000058d2d35e', 'b1000000-0000-0000-0000-000075a6ce7e', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Flying Basics**.'),
('c1000000-0000-0000-0000-000058d2d35d', 'b1000000-0000-0000-0000-000075a6ce7e', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000047cb2b2d', 'b1000000-0000-0000-0000-0000102cceef', 'Introduction to Aviation History', 'markdown', '{}'::jsonb, 1, '# Introduction to Aviation History

## Overview
This chapter covers the basic fundamentals of **Aviation History**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-000047cb2b2c', 'b1000000-0000-0000-0000-0000102cceef', 'Theoretical Principles of Aviation History', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Aviation History

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Aviation History**.'),
('c1000000-0000-0000-0000-000047cb276c', 'b1000000-0000-0000-0000-0000102ccef0', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Aviation History**.'),
('c1000000-0000-0000-0000-000047cb276b', 'b1000000-0000-0000-0000-0000102ccef0', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00007ed85c1f', 'b1000000-0000-0000-0000-00001061b93b', 'Introduction to Aero Modelling', 'markdown', '{}'::jsonb, 1, '# Introduction to Aero Modelling

## Overview
This chapter covers the basic fundamentals of **Aero Modelling**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-00007ed85c20', 'b1000000-0000-0000-0000-00001061b93b', 'Theoretical Principles of Aero Modelling', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Aero Modelling

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Aero Modelling**.'),
('c1000000-0000-0000-0000-00007ed85fe0', 'b1000000-0000-0000-0000-00001061b93c', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Aero Modelling**.'),
('c1000000-0000-0000-0000-00007ed85fe1', 'b1000000-0000-0000-0000-00001061b93c', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00002a756c3b', 'b1000000-0000-0000-0000-000076965d9f', 'Introduction to Air Navigation Basics', 'markdown', '{}'::jsonb, 1, '# Introduction to Air Navigation Basics

## Overview
This chapter covers the basic fundamentals of **Air Navigation Basics**, required for National Cadet Corps (NCC) Certificate **A** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-00002a756c3a', 'b1000000-0000-0000-0000-000076965d9f', 'Theoretical Principles of Air Navigation Basics', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Air Navigation Basics

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Air Navigation Basics**.'),
('c1000000-0000-0000-0000-00002a75687a', 'b1000000-0000-0000-0000-000076965d9e', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Air Navigation Basics**.'),
('c1000000-0000-0000-0000-00002a756879', 'b1000000-0000-0000-0000-000076965d9e', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00002a666630', 'b1000000-0000-0000-0000-00000d5d138c', 'Introduction to Aircraft Instruments', 'markdown', '{}'::jsonb, 1, '# Introduction to Aircraft Instruments

## Overview
This chapter covers the basic fundamentals of **Aircraft Instruments**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-00002a666631', 'b1000000-0000-0000-0000-00000d5d138c', 'Theoretical Principles of Aircraft Instruments', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Aircraft Instruments

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Aircraft Instruments**.'),
('c1000000-0000-0000-0000-00002a6669f1', 'b1000000-0000-0000-0000-00000d5d138d', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Aircraft Instruments**.'),
('c1000000-0000-0000-0000-00002a6669f2', 'b1000000-0000-0000-0000-00000d5d138d', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00005dea500e', 'b1000000-0000-0000-0000-00001f881a32', 'Introduction to Meteorology', 'markdown', '{}'::jsonb, 1, '# Introduction to Meteorology

## Overview
This chapter covers the basic fundamentals of **Meteorology**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-00005dea500d', 'b1000000-0000-0000-0000-00001f881a32', 'Theoretical Principles of Meteorology', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Meteorology

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Meteorology**.'),
('c1000000-0000-0000-0000-00005dea4c4d', 'b1000000-0000-0000-0000-00001f881a31', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Meteorology**.'),
('c1000000-0000-0000-0000-00005dea4c4c', 'b1000000-0000-0000-0000-00001f881a31', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-000016f61ffa', 'b1000000-0000-0000-0000-000052def51e', 'Introduction to Air Traffic Control Basics', 'markdown', '{}'::jsonb, 1, '# Introduction to Air Traffic Control Basics

## Overview
This chapter covers the basic fundamentals of **Air Traffic Control Basics**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-000016f61ff9', 'b1000000-0000-0000-0000-000052def51e', 'Theoretical Principles of Air Traffic Control Basics', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Air Traffic Control Basics

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Air Traffic Control Basics**.'),
('c1000000-0000-0000-0000-000016f61c39', 'b1000000-0000-0000-0000-000052def51d', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Air Traffic Control Basics**.'),
('c1000000-0000-0000-0000-000016f61c38', 'b1000000-0000-0000-0000-000052def51d', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-0000556b8489', 'b1000000-0000-0000-0000-000024680bdb', 'Introduction to Navigation Advanced', 'markdown', '{}'::jsonb, 1, '# Introduction to Navigation Advanced

## Overview
This chapter covers the basic fundamentals of **Navigation Advanced**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-0000556b848a', 'b1000000-0000-0000-0000-000024680bdb', 'Theoretical Principles of Navigation Advanced', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Navigation Advanced

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Navigation Advanced**.'),
('c1000000-0000-0000-0000-0000556b884a', 'b1000000-0000-0000-0000-000024680bda', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Navigation Advanced**.'),
('c1000000-0000-0000-0000-0000556b884b', 'b1000000-0000-0000-0000-000024680bda', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00007137a37b', 'b1000000-0000-0000-0000-00003d632797', 'Introduction to Aero Engines', 'markdown', '{}'::jsonb, 1, '# Introduction to Aero Engines

## Overview
This chapter covers the basic fundamentals of **Aero Engines**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-00007137a37c', 'b1000000-0000-0000-0000-00003d632797', 'Theoretical Principles of Aero Engines', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Aero Engines

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Aero Engines**.'),
('c1000000-0000-0000-0000-00007137a73c', 'b1000000-0000-0000-0000-00003d632798', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Aero Engines**.'),
('c1000000-0000-0000-0000-00007137a73d', 'b1000000-0000-0000-0000-00003d632798', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00001afeecbc', 'b1000000-0000-0000-0000-00000cc232e8', 'Introduction to Map Reading for Aviation', 'markdown', '{}'::jsonb, 1, '# Introduction to Map Reading for Aviation

## Overview
This chapter covers the basic fundamentals of **Map Reading for Aviation**, required for National Cadet Corps (NCC) Certificate **B** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-00001afeecbd', 'b1000000-0000-0000-0000-00000cc232e8', 'Theoretical Principles of Map Reading for Aviation', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Map Reading for Aviation

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Map Reading for Aviation**.'),
('c1000000-0000-0000-0000-00001afef07d', 'b1000000-0000-0000-0000-00000cc232e7', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Map Reading for Aviation**.'),
('c1000000-0000-0000-0000-00001afef07e', 'b1000000-0000-0000-0000-00000cc232e7', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00005d23a4e9', 'b1000000-0000-0000-0000-0000519cac85', 'Introduction to Advanced Aviation Subjects', 'markdown', '{}'::jsonb, 1, '# Introduction to Advanced Aviation Subjects

## Overview
This chapter covers the basic fundamentals of **Advanced Aviation Subjects**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-00005d23a4ea', 'b1000000-0000-0000-0000-0000519cac85', 'Theoretical Principles of Advanced Aviation Subjects', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Advanced Aviation Subjects

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Advanced Aviation Subjects**.'),
('c1000000-0000-0000-0000-00005d23a8aa', 'b1000000-0000-0000-0000-0000519cac86', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Advanced Aviation Subjects**.'),
('c1000000-0000-0000-0000-00005d23a8ab', 'b1000000-0000-0000-0000-0000519cac86', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00006a6c40ad', 'b1000000-0000-0000-0000-00002abba691', 'Introduction to Flight Navigation', 'markdown', '{}'::jsonb, 1, '# Introduction to Flight Navigation

## Overview
This chapter covers the basic fundamentals of **Flight Navigation**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-00006a6c40ac', 'b1000000-0000-0000-0000-00002abba691', 'Theoretical Principles of Flight Navigation', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Flight Navigation

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Flight Navigation**.'),
('c1000000-0000-0000-0000-00006a6c3cec', 'b1000000-0000-0000-0000-00002abba690', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Flight Navigation**.'),
('c1000000-0000-0000-0000-00006a6c3ceb', 'b1000000-0000-0000-0000-00002abba690', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00001aff7215', 'b1000000-0000-0000-0000-00006643ee07', 'Introduction to Aircraft Recognition', 'markdown', '{}'::jsonb, 1, '# Introduction to Aircraft Recognition

## Overview
This chapter covers the basic fundamentals of **Aircraft Recognition**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-00001aff7214', 'b1000000-0000-0000-0000-00006643ee07', 'Theoretical Principles of Aircraft Recognition', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Aircraft Recognition

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Aircraft Recognition**.'),
('c1000000-0000-0000-0000-00001aff6e54', 'b1000000-0000-0000-0000-00006643ee08', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Aircraft Recognition**.'),
('c1000000-0000-0000-0000-00001aff6e53', 'b1000000-0000-0000-0000-00006643ee08', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-0000323bbaf8', 'b1000000-0000-0000-0000-00006d6f05ac', 'Introduction to Air Power & Warfare', 'markdown', '{}'::jsonb, 1, '# Introduction to Air Power & Warfare

## Overview
This chapter covers the basic fundamentals of **Air Power & Warfare**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-0000323bbaf9', 'b1000000-0000-0000-0000-00006d6f05ac', 'Theoretical Principles of Air Power & Warfare', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Air Power & Warfare

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Air Power & Warfare**.'),
('c1000000-0000-0000-0000-0000323bbeb9', 'b1000000-0000-0000-0000-00006d6f05ab', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Air Power & Warfare**.'),
('c1000000-0000-0000-0000-0000323bbeba', 'b1000000-0000-0000-0000-00006d6f05ab', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00001cf11792', 'b1000000-0000-0000-0000-000009e2f2b6', 'Introduction to Aero Engine Systems', 'markdown', '{}'::jsonb, 1, '# Introduction to Aero Engine Systems

## Overview
This chapter covers the basic fundamentals of **Aero Engine Systems**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-00001cf11791', 'b1000000-0000-0000-0000-000009e2f2b6', 'Theoretical Principles of Aero Engine Systems', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Aero Engine Systems

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Aero Engine Systems**.'),
('c1000000-0000-0000-0000-00001cf113d1', 'b1000000-0000-0000-0000-000009e2f2b5', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Aero Engine Systems**.'),
('c1000000-0000-0000-0000-00001cf113d0', 'b1000000-0000-0000-0000-000009e2f2b5', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00000498f42b', 'b1000000-0000-0000-0000-00004edb218f', 'Introduction to Aviation Safety', 'markdown', '{}'::jsonb, 1, '# Introduction to Aviation Safety

## Overview
This chapter covers the basic fundamentals of **Aviation Safety**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-00000498f42a', 'b1000000-0000-0000-0000-00004edb218f', 'Theoretical Principles of Aviation Safety', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Aviation Safety

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Aviation Safety**.'),
('c1000000-0000-0000-0000-00000498f06a', 'b1000000-0000-0000-0000-00004edb218e', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Aviation Safety**.'),
('c1000000-0000-0000-0000-00000498f069', 'b1000000-0000-0000-0000-00004edb218e', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.'),
('c1000000-0000-0000-0000-00004bfd561f', 'b1000000-0000-0000-0000-00000982ccc5', 'Introduction to Air Force Leadership & Communication', 'markdown', '{}'::jsonb, 1, '# Introduction to Air Force Leadership & Communication

## Overview
This chapter covers the basic fundamentals of **Air Force Leadership & Communication**, required for National Cadet Corps (NCC) Certificate **C** cadets of the **Air Force** wing.'),
('c1000000-0000-0000-0000-00004bfd5620', 'b1000000-0000-0000-0000-00000982ccc5', 'Theoretical Principles of Air Force Leadership & Communication', 'markdown', '{}'::jsonb, 2, '# Theoretical Principles of Air Force Leadership & Communication

## Study Material
Here we explore the detailed guidelines and regulations surrounding **Air Force Leadership & Communication**.'),
('c1000000-0000-0000-0000-00004bfd59e0', 'b1000000-0000-0000-0000-00000982ccc4', 'Practical Training & Operations', 'markdown', '{}'::jsonb, 1, '# Practical Training & Operations

## Field Training
This section outlines the practical activities and camp drills associated with **Air Force Leadership & Communication**.'),
('c1000000-0000-0000-0000-00004bfd59e1', 'b1000000-0000-0000-0000-00000982ccc4', 'Mock Evaluation & Exercises', 'markdown', '{}'::jsonb, 2, '# Mock Evaluation & Exercises

## Self-Assessment
To prepare for your Certificate examination, answer the following questions.');

-- ============================================
-- QUESTION BANKS
-- ============================================
INSERT INTO public.question_banks (id, course_id, title, description) VALUES
('d1000000-0000-0000-0000-000003e125cf', 'a1000000-0000-0000-0000-000000000001', 'NCC At a Glance Bank', 'Questions on NCC At a Glance'),
('d1000000-0000-0000-0000-000003e125ce', 'a1000000-0000-0000-0000-000000000002', 'Drill & Commands Bank', 'Questions on Drill & Commands'),
('d1000000-0000-0000-0000-000068284012', 'a1000000-0000-0000-0000-00002d6df6d2', 'Weapon Training & Infantry Weapons Bank', 'Questions on Weapon Training & Infantry Weapons'),
('d1000000-0000-0000-0000-000003e125cd', 'a1000000-0000-0000-0000-000000000003', 'National Integration Bank', 'Questions on National Integration'),
('d1000000-0000-0000-0000-0000202c5758', 'a1000000-0000-0000-0000-0000174a3d1e', 'Leadership & Personality Development Bank', 'Questions on Leadership & Personality Development'),
('d1000000-0000-0000-0000-00006333b7d7', 'a1000000-0000-0000-0000-000071e9b09d', 'Civil Defence & Disaster Management Bank', 'Questions on Civil Defence & Disaster Management'),
('d1000000-0000-0000-0000-000032b61268', 'a1000000-0000-0000-0000-000057c82e75', 'Social Service & Awareness Bank', 'Questions on Social Service & Awareness'),
('d1000000-0000-0000-0000-000003e125cc', 'a1000000-0000-0000-0000-000000000004', 'Health, Hygiene & Sanitation Bank', 'Questions on Health, Hygiene & Sanitation'),
('d1000000-0000-0000-0000-0000284aed79', 'a1000000-0000-0000-0000-00005409f313', 'Yoga & Asanas Bank', 'Questions on Yoga & Asanas'),
('d1000000-0000-0000-0000-00001e6e1810', 'a1000000-0000-0000-0000-00001aefb067', 'Home Nursing Bank', 'Questions on Home Nursing'),
('d1000000-0000-0000-0000-000003712f35', 'a1000000-0000-0000-0000-000000490880', 'Posture Training Bank', 'Questions on Posture Training'),
('d1000000-0000-0000-0000-00005d98433c', 'a1000000-0000-0000-0000-0000240e6113', 'Obstacles Training & Adventure Activities Bank', 'Questions on Obstacles Training & Adventure Activities'),
('d1000000-0000-0000-0000-00000722b589', 'a1000000-0000-0000-0000-000008b4468c', 'Career in Defence Services Bank', 'Questions on Career in Defence Services'),
('d1000000-0000-0000-0000-000015abc0ec', 'a1000000-0000-0000-0000-000038908d40', 'Services Tests & Interviews Bank', 'Questions on Services Tests & Interviews'),
('d1000000-0000-0000-0000-00006d49238f', 'a1000000-0000-0000-0000-000039ef9e7c', 'Self-Defence Bank', 'Questions on Self-Defence'),
('d1000000-0000-0000-0000-00003b6196ee', 'a1000000-0000-0000-0000-00003c4316e3', 'Environment and Ecology Bank', 'Questions on Environment and Ecology'),
('d1000000-0000-0000-0000-00004fbcf79f', 'a1000000-0000-0000-0000-0000199562e4', 'Famous Leaders of India Bank', 'Questions on Famous Leaders of India'),
('d1000000-0000-0000-0000-00006742b1fa', 'a1000000-0000-0000-0000-000071fe9b19', 'History of India Bank', 'Questions on History of India'),
('d1000000-0000-0000-0000-00005ad1b986', 'a1000000-0000-0000-0000-00000ba7d77f', 'Armed Forces & Military History Bank', 'Questions on Armed Forces & Military History'),
('d1000000-0000-0000-0000-000003e125cb', 'a1000000-0000-0000-0000-000000000005', 'Map Reading Bank', 'Questions on Map Reading'),
('d1000000-0000-0000-0000-0000219ecc97', 'a1000000-0000-0000-0000-0000382075a9', 'Communication Bank', 'Questions on Communication'),
('d1000000-0000-0000-0000-00001661349b', 'a1000000-0000-0000-0000-0000266d0d05', 'Field Craft & Battle Craft Bank', 'Questions on Field Craft & Battle Craft'),
('d1000000-0000-0000-0000-00000add794e', 'a1000000-0000-0000-0000-000016a26b66', 'Personality Development & Officer Like Qualities (OLQs) Bank', 'Questions on Personality Development & Officer Like Qualities (OLQs)'),
('d1000000-0000-0000-0000-000036a22df0', 'a1000000-0000-0000-0000-00004a803f19', 'Disaster Management & Social Awareness Bank', 'Questions on Disaster Management & Social Awareness'),
('d1000000-0000-0000-0000-000074af31c0', 'a1000000-0000-0000-0000-00002ba41949', 'Advanced Leadership Bank', 'Questions on Advanced Leadership'),
('d1000000-0000-0000-0000-000061a47fa3', 'a1000000-0000-0000-0000-00000b8cf529', 'Advanced Drill Bank', 'Questions on Advanced Drill'),
('d1000000-0000-0000-0000-000066ea2018', 'a1000000-0000-0000-0000-000019d3bbde', 'National Security Bank', 'Questions on National Security'),
('d1000000-0000-0000-0000-0000227e3f69', 'a1000000-0000-0000-0000-000017470581', 'Armed Forces Organisation Bank', 'Questions on Armed Forces Organisation'),
('d1000000-0000-0000-0000-0000170d063d', 'a1000000-0000-0000-0000-0000636a9bea', 'Disaster Management Bank', 'Questions on Disaster Management'),
('d1000000-0000-0000-0000-0000390c33f0', 'a1000000-0000-0000-0000-000015e087f8', 'Social Service & Community Development Bank', 'Questions on Social Service & Community Development'),
('d1000000-0000-0000-0000-000030227a9c', 'a1000000-0000-0000-0000-00000f5e0237', 'Personality Development & Communication Skills Bank', 'Questions on Personality Development & Communication Skills'),
('d1000000-0000-0000-0000-00000105660b', 'a1000000-0000-0000-0000-00007f311b52', 'Map Reading & Navigation Bank', 'Questions on Map Reading & Navigation'),
('d1000000-0000-0000-0000-000021aa6e77', 'a1000000-0000-0000-0000-0000173e1464', 'Field Craft & Battle Craft Bank', 'Questions on Field Craft & Battle Craft'),
('d1000000-0000-0000-0000-00006a880255', 'a1000000-0000-0000-0000-00002d69b84d', 'Military History & War Heroes Bank', 'Questions on Military History & War Heroes'),
('d1000000-0000-0000-0000-0000796a5dde', 'a1000000-0000-0000-0000-0000282e60fa', 'General Awareness & Current Affairs Bank', 'Questions on General Awareness & Current Affairs'),
('d1000000-0000-0000-0000-0000645b68cf', 'a1000000-0000-0000-0000-0000400027dd', 'Officer Like Qualities (OLQs) & Interview Skills Bank', 'Questions on Officer Like Qualities (OLQs) & Interview Skills'),
('d1000000-0000-0000-0000-000027ad7d53', 'a1000000-0000-0000-0000-000004518ce7', 'Field Craft Basics Bank', 'Questions on Field Craft Basics'),
('d1000000-0000-0000-0000-00005c67dc2a', 'a1000000-0000-0000-0000-00005b295d90', 'Drill with Arms Bank', 'Questions on Drill with Arms'),
('d1000000-0000-0000-0000-000003e125ca', 'a1000000-0000-0000-0000-000000000006', 'Weapon Training Bank', 'Questions on Weapon Training'),
('d1000000-0000-0000-0000-000045b31c91', 'a1000000-0000-0000-0000-00007250c9a6', 'Section Formation Bank', 'Questions on Section Formation'),
('d1000000-0000-0000-0000-0000498e560e', 'a1000000-0000-0000-0000-00001cddd660', 'Guard Mounting Bank', 'Questions on Guard Mounting'),
('d1000000-0000-0000-0000-0000666f90f2', 'a1000000-0000-0000-0000-000076b802f1', 'Battle Craft Basics Bank', 'Questions on Battle Craft Basics'),
('d1000000-0000-0000-0000-00004c126907', 'a1000000-0000-0000-0000-00005bda6445', 'Advanced Weapon Training Bank', 'Questions on Advanced Weapon Training'),
('d1000000-0000-0000-0000-00001428290d', 'a1000000-0000-0000-0000-00004ef72cf6', 'Field Signals Bank', 'Questions on Field Signals'),
('d1000000-0000-0000-0000-0000786c8488', 'a1000000-0000-0000-0000-00000fa26f23', 'Patrolling Bank', 'Questions on Patrolling'),
('d1000000-0000-0000-0000-0000231a55d4', 'a1000000-0000-0000-0000-0000091f2132', 'Camouflage & Concealment Bank', 'Questions on Camouflage & Concealment'),
('d1000000-0000-0000-0000-000073cf2672', 'a1000000-0000-0000-0000-000010986329', 'Section Battle Drill Bank', 'Questions on Section Battle Drill'),
('d1000000-0000-0000-0000-00007392f367', 'a1000000-0000-0000-0000-00002d119e7b', 'Ambush & Defence Bank', 'Questions on Ambush & Defence'),
('d1000000-0000-0000-0000-00004b59a45d', 'a1000000-0000-0000-0000-000069281cf8', 'Tactical Exercises Bank', 'Questions on Tactical Exercises'),
('d1000000-0000-0000-0000-00005052f630', 'a1000000-0000-0000-0000-0000455ec376', 'Platoon Formation Bank', 'Questions on Platoon Formation'),
('d1000000-0000-0000-0000-00006a5679ce', 'a1000000-0000-0000-0000-000027c89a44', 'Advanced Battle Craft Bank', 'Questions on Advanced Battle Craft'),
('d1000000-0000-0000-0000-000071c41278', 'a1000000-0000-0000-0000-00006a0b9015', 'Internal Security Duties Bank', 'Questions on Internal Security Duties'),
('d1000000-0000-0000-0000-00001e33facf', 'a1000000-0000-0000-0000-00006aaa9a6d', 'Field Engineering Bank', 'Questions on Field Engineering'),
('d1000000-0000-0000-0000-0000512fff22', 'a1000000-0000-0000-0000-00005baa8724', 'Communication Procedures Bank', 'Questions on Communication Procedures'),
('d1000000-0000-0000-0000-00005f8ea2d4', 'a1000000-0000-0000-0000-00002c4f7734', 'Map Reading Advanced Bank', 'Questions on Map Reading Advanced'),
('d1000000-0000-0000-0000-00003626ed8b', 'a1000000-0000-0000-0000-000007da05fb', 'Naval Orientation Bank', 'Questions on Naval Orientation'),
('d1000000-0000-0000-0000-0000421a9aee', 'a1000000-0000-0000-0000-000010cd3522', 'Parts of Ship Bank', 'Questions on Parts of Ship'),
('d1000000-0000-0000-0000-00002fac8dc8', 'a1000000-0000-0000-0000-000078b8bad6', 'Seamanship Bank', 'Questions on Seamanship'),
('d1000000-0000-0000-0000-0000380f3820', 'a1000000-0000-0000-0000-000060f74a80', 'Boat Pulling Bank', 'Questions on Boat Pulling'),
('d1000000-0000-0000-0000-00002feaf4db', 'a1000000-0000-0000-0000-00005f26bbb8', 'Rigging Bank', 'Questions on Rigging'),
('d1000000-0000-0000-0000-00003816b210', 'a1000000-0000-0000-0000-00005f71361c', 'Naval Communication Basics Bank', 'Questions on Naval Communication Basics'),
('d1000000-0000-0000-0000-00002e1c7818', 'a1000000-0000-0000-0000-000033de1536', 'Navigation Bank', 'Questions on Navigation'),
('d1000000-0000-0000-0000-00002cd2d194', 'a1000000-0000-0000-0000-00003e351a55', 'Anchoring Bank', 'Questions on Anchoring'),
('d1000000-0000-0000-0000-00004e72e59e', 'a1000000-0000-0000-0000-000066541bbd', 'Ship Modelling Bank', 'Questions on Ship Modelling'),
('d1000000-0000-0000-0000-00000aa55155', 'a1000000-0000-0000-0000-00000e385149', 'Naval Signals Bank', 'Questions on Naval Signals'),
('d1000000-0000-0000-0000-000044a62988', 'a1000000-0000-0000-0000-000002b2020d', 'Boat Sailing Bank', 'Questions on Boat Sailing'),
('d1000000-0000-0000-0000-000021c2f35d', 'a1000000-0000-0000-0000-0000173c9633', 'Tides & Compass Bank', 'Questions on Tides & Compass'),
('d1000000-0000-0000-0000-00001addf457', 'a1000000-0000-0000-0000-00003bf3e26f', 'Advanced Navigation Bank', 'Questions on Advanced Navigation'),
('d1000000-0000-0000-0000-00007c7294d4', 'a1000000-0000-0000-0000-0000446f03a2', 'Naval Warfare Basics Bank', 'Questions on Naval Warfare Basics'),
('d1000000-0000-0000-0000-00001f456459', 'a1000000-0000-0000-0000-00007ebeb8bd', 'Ship Organisation Bank', 'Questions on Ship Organisation'),
('d1000000-0000-0000-0000-00005efb1ed5', 'a1000000-0000-0000-0000-00004d1d4699', 'Communication Systems Bank', 'Questions on Communication Systems'),
('d1000000-0000-0000-0000-00006396755e', 'a1000000-0000-0000-0000-000056db673e', 'Sailing Expeditions Bank', 'Questions on Sailing Expeditions'),
('d1000000-0000-0000-0000-00005f1d0bd4', 'a1000000-0000-0000-0000-000005e105c1', 'Naval Weapons Basics Bank', 'Questions on Naval Weapons Basics'),
('d1000000-0000-0000-0000-0000003ec634', 'a1000000-0000-0000-0000-00005e58b4dc', 'Leadership at Sea Bank', 'Questions on Leadership at Sea'),
('d1000000-0000-0000-0000-00005f146c89', 'a1000000-0000-0000-0000-00001e49cb34', 'Principles of Flight Bank', 'Questions on Principles of Flight'),
('d1000000-0000-0000-0000-00005ca2f1d8', 'a1000000-0000-0000-0000-00003f04d489', 'Airframe & Aircraft Parts Bank', 'Questions on Airframe & Aircraft Parts'),
('d1000000-0000-0000-0000-000056603834', 'a1000000-0000-0000-0000-000021b5014e', 'Flying Basics Bank', 'Questions on Flying Basics'),
('d1000000-0000-0000-0000-000018409e7e', 'a1000000-0000-0000-0000-000009934b67', 'Aviation History Bank', 'Questions on Aviation History'),
('d1000000-0000-0000-0000-00005b5dfdb6', 'a1000000-0000-0000-0000-00001e256fdc', 'Aero Modelling Bank', 'Questions on Aero Modelling'),
('d1000000-0000-0000-0000-00004ec157d0', 'a1000000-0000-0000-0000-0000197a9a17', 'Air Navigation Basics Bank', 'Questions on Air Navigation Basics'),
('d1000000-0000-0000-0000-000062aa6abb', 'a1000000-0000-0000-0000-00007d5b2b7b', 'Aircraft Instruments Bank', 'Questions on Aircraft Instruments'),
('d1000000-0000-0000-0000-00006a5672c3', 'a1000000-0000-0000-0000-00003f85a3d5', 'Meteorology Bank', 'Questions on Meteorology'),
('d1000000-0000-0000-0000-0000582a5b2f', 'a1000000-0000-0000-0000-00001e091e5c', 'Air Traffic Control Basics Bank', 'Questions on Air Traffic Control Basics'),
('d1000000-0000-0000-0000-0000305fbd8c', 'a1000000-0000-0000-0000-00007b3ed32b', 'Navigation Advanced Bank', 'Questions on Navigation Advanced'),
('d1000000-0000-0000-0000-0000338753da', 'a1000000-0000-0000-0000-000025fea92b', 'Aero Engines Bank', 'Questions on Aero Engines'),
('d1000000-0000-0000-0000-00006af17a39', 'a1000000-0000-0000-0000-00001042448d', 'Map Reading for Aviation Bank', 'Questions on Map Reading for Aviation'),
('d1000000-0000-0000-0000-000044b2792c', 'a1000000-0000-0000-0000-0000191cb74a', 'Advanced Aviation Subjects Bank', 'Questions on Advanced Aviation Subjects'),
('d1000000-0000-0000-0000-00004bb378fe', 'a1000000-0000-0000-0000-0000665f0342', 'Flight Navigation Bank', 'Questions on Flight Navigation'),
('d1000000-0000-0000-0000-00003ec40096', 'a1000000-0000-0000-0000-000010eaf56f', 'Aircraft Recognition Bank', 'Questions on Aircraft Recognition'),
('d1000000-0000-0000-0000-00004dda4a83', 'a1000000-0000-0000-0000-00002cf3b089', 'Air Power & Warfare Bank', 'Questions on Air Power & Warfare'),
('d1000000-0000-0000-0000-000007f06bc7', 'a1000000-0000-0000-0000-00007f71eb3d', 'Aero Engine Systems Bank', 'Questions on Aero Engine Systems'),
('d1000000-0000-0000-0000-00003c59a640', 'a1000000-0000-0000-0000-000060be762f', 'Aviation Safety Bank', 'Questions on Aviation Safety'),
('d1000000-0000-0000-0000-00001914bc4a', 'a1000000-0000-0000-0000-00004684706e', 'Air Force Leadership & Communication Bank', 'Questions on Air Force Leadership & Communication');

-- ============================================
-- QUESTIONS
-- ============================================
INSERT INTO public.questions (id, bank_id, question_text, question_type, options, correct_answer, difficulty, topic_tag, explanation, points) VALUES
('f0000001-0000-0000-0000-000003e125cf', 'd1000000-0000-0000-0000-000003e125cf', 'When was the NCC established in India?', 'mcq', '["1946","1947","1948","1950"]'::jsonb, '1948', 'easy', 'History', 'NCC was established on 15 July 1948 under the NCC Act XXXI of 1948.', 1),
('f0000002-0000-0000-0000-000003e125cf', 'd1000000-0000-0000-0000-000003e125cf', 'What is the motto of the NCC?', 'mcq', '["Service Before Self","Unity and Discipline","Duty Honor Country","Jai Hind"]'::jsonb, 'Unity and Discipline', 'easy', 'Basics', 'The NCC motto is "Unity and Discipline".', 1),
('f0000003-0000-0000-0000-000003e125cf', 'd1000000-0000-0000-0000-000003e125cf', 'Who was the first Director General of NCC?', 'mcq', '["Lt Gen Grubb","Gen Cariappa","Maj Gen Sinha","Gen Thimayya"]'::jsonb, 'Lt Gen Grubb', 'medium', 'History', 'Lt Gen Grubb was the first DG of NCC appointed in 1948.', 1),
('f0000004-0000-0000-0000-000003e125cf', 'd1000000-0000-0000-0000-000003e125cf', 'The NCC was raised on the recommendation of which committee?', 'mcq', '["Kunzru Committee","Nehru Committee","Patel Committee","Kothari Committee"]'::jsonb, 'Kunzru Committee', 'medium', 'History', 'Raised on recommendation of Pandit H.N. Kunzru Committee in 1946.', 1),
('f0000001-0000-0000-0000-000003e125ce', 'd1000000-0000-0000-0000-000003e125ce', 'What is the angle formed between feet in Attention position?', 'mcq', '["15 degrees","30 degrees","45 degrees","60 degrees"]'::jsonb, '30 degrees', 'easy', 'Foot Drill', 'In Savdhan, feet are turned out equally forming an angle of 30 degrees.', 1),
('f0000002-0000-0000-0000-000003e125ce', 'd1000000-0000-0000-0000-000003e125ce', 'What is the distance between feet in Stand at Ease position?', 'mcq', '["8 inches","10 inches","12 inches","15 inches"]'::jsonb, '12 inches', 'easy', 'Foot Drill', 'In Vishram, the left foot moves 12 inches (or 30 cm) to the left.', 1),
('f0000003-0000-0000-0000-000003e125ce', 'd1000000-0000-0000-0000-000003e125ce', 'About Turn involves rotation of how many degrees?', 'mcq', '["90 degrees","120 degrees","180 degrees","360 degrees"]'::jsonb, '180 degrees', 'easy', 'Turnings', 'About Turn (Peeche Mud) involves a 180-degree turn to the right.', 1),
('f0000004-0000-0000-0000-000003e125ce', 'd1000000-0000-0000-0000-000003e125ce', 'The word of command has how many parts?', 'mcq', '["1","2","3","4"]'::jsonb, '2', 'easy', 'Commands', 'Word of command has Cautionary (alert) and Executive (action) parts.', 1),
('f0000001-0000-0000-0000-000068284012', 'd1000000-0000-0000-0000-000068284012', 'What is the primary objective of Weapon Training & Infantry Weapons?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000068284012', 'd1000000-0000-0000-0000-000068284012', 'Which wing is Weapon Training & Infantry Weapons targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000003e125cd', 'd1000000-0000-0000-0000-000003e125cd', 'What is the primary objective of National Integration?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000003e125cd', 'd1000000-0000-0000-0000-000003e125cd', 'Which wing is National Integration targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000202c5758', 'd1000000-0000-0000-0000-0000202c5758', 'What is the primary objective of Leadership & Personality Development?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000202c5758', 'd1000000-0000-0000-0000-0000202c5758', 'Which wing is Leadership & Personality Development targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00006333b7d7', 'd1000000-0000-0000-0000-00006333b7d7', 'What is the primary objective of Civil Defence & Disaster Management?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00006333b7d7', 'd1000000-0000-0000-0000-00006333b7d7', 'Which wing is Civil Defence & Disaster Management targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000032b61268', 'd1000000-0000-0000-0000-000032b61268', 'What is the primary objective of Social Service & Awareness?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000032b61268', 'd1000000-0000-0000-0000-000032b61268', 'Which wing is Social Service & Awareness targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000003e125cc', 'd1000000-0000-0000-0000-000003e125cc', 'What is the primary objective of Health, Hygiene & Sanitation?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000003e125cc', 'd1000000-0000-0000-0000-000003e125cc', 'Which wing is Health, Hygiene & Sanitation targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000284aed79', 'd1000000-0000-0000-0000-0000284aed79', 'What is the primary objective of Yoga & Asanas?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000284aed79', 'd1000000-0000-0000-0000-0000284aed79', 'Which wing is Yoga & Asanas targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00001e6e1810', 'd1000000-0000-0000-0000-00001e6e1810', 'What is the primary objective of Home Nursing?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00001e6e1810', 'd1000000-0000-0000-0000-00001e6e1810', 'Which wing is Home Nursing targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000003712f35', 'd1000000-0000-0000-0000-000003712f35', 'What is the primary objective of Posture Training?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000003712f35', 'd1000000-0000-0000-0000-000003712f35', 'Which wing is Posture Training targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00005d98433c', 'd1000000-0000-0000-0000-00005d98433c', 'What is the primary objective of Obstacles Training & Adventure Activities?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00005d98433c', 'd1000000-0000-0000-0000-00005d98433c', 'Which wing is Obstacles Training & Adventure Activities targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00000722b589', 'd1000000-0000-0000-0000-00000722b589', 'What is the primary objective of Career in Defence Services?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00000722b589', 'd1000000-0000-0000-0000-00000722b589', 'Which wing is Career in Defence Services targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000015abc0ec', 'd1000000-0000-0000-0000-000015abc0ec', 'What is the primary objective of Services Tests & Interviews?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000015abc0ec', 'd1000000-0000-0000-0000-000015abc0ec', 'Which wing is Services Tests & Interviews targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00006d49238f', 'd1000000-0000-0000-0000-00006d49238f', 'What is the primary objective of Self-Defence?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00006d49238f', 'd1000000-0000-0000-0000-00006d49238f', 'Which wing is Self-Defence targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00003b6196ee', 'd1000000-0000-0000-0000-00003b6196ee', 'What is the primary objective of Environment and Ecology?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00003b6196ee', 'd1000000-0000-0000-0000-00003b6196ee', 'Which wing is Environment and Ecology targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00004fbcf79f', 'd1000000-0000-0000-0000-00004fbcf79f', 'What is the primary objective of Famous Leaders of India?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00004fbcf79f', 'd1000000-0000-0000-0000-00004fbcf79f', 'Which wing is Famous Leaders of India targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00006742b1fa', 'd1000000-0000-0000-0000-00006742b1fa', 'What is the primary objective of History of India?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00006742b1fa', 'd1000000-0000-0000-0000-00006742b1fa', 'Which wing is History of India targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00005ad1b986', 'd1000000-0000-0000-0000-00005ad1b986', 'What is the primary objective of Armed Forces & Military History?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00005ad1b986', 'd1000000-0000-0000-0000-00005ad1b986', 'Which wing is Armed Forces & Military History targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000003e125cb', 'd1000000-0000-0000-0000-000003e125cb', 'On a topographic map, blue color represents?', 'mcq', '["Roads","Vegetation","Water features","Contour lines"]'::jsonb, 'Water features', 'easy', 'Conventional Signs', 'Blue is used for water features like rivers, lakes, and wells.', 1),
('f0000002-0000-0000-0000-000003e125cb', 'd1000000-0000-0000-0000-000003e125cb', 'Contour lines that are close together indicate?', 'mcq', '["Flat ground","Gentle slope","Steep slope","Valley"]'::jsonb, 'Steep slope', 'easy', 'Contours', 'Close contour lines indicate steep slopes.', 1),
('f0000001-0000-0000-0000-0000219ecc97', 'd1000000-0000-0000-0000-0000219ecc97', 'What is the primary objective of Communication?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000219ecc97', 'd1000000-0000-0000-0000-0000219ecc97', 'Which wing is Communication targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00001661349b', 'd1000000-0000-0000-0000-00001661349b', 'What is the primary objective of Field Craft & Battle Craft?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00001661349b', 'd1000000-0000-0000-0000-00001661349b', 'Which wing is Field Craft & Battle Craft targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00000add794e', 'd1000000-0000-0000-0000-00000add794e', 'What is the primary objective of Personality Development & Officer Like Qualities (OLQs)?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00000add794e', 'd1000000-0000-0000-0000-00000add794e', 'Which wing is Personality Development & Officer Like Qualities (OLQs) targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000036a22df0', 'd1000000-0000-0000-0000-000036a22df0', 'What is the primary objective of Disaster Management & Social Awareness?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000036a22df0', 'd1000000-0000-0000-0000-000036a22df0', 'Which wing is Disaster Management & Social Awareness targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000074af31c0', 'd1000000-0000-0000-0000-000074af31c0', 'What is the primary objective of Advanced Leadership?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000074af31c0', 'd1000000-0000-0000-0000-000074af31c0', 'Which wing is Advanced Leadership targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000061a47fa3', 'd1000000-0000-0000-0000-000061a47fa3', 'What is the primary objective of Advanced Drill?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000061a47fa3', 'd1000000-0000-0000-0000-000061a47fa3', 'Which wing is Advanced Drill targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000066ea2018', 'd1000000-0000-0000-0000-000066ea2018', 'What is the primary objective of National Security?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000066ea2018', 'd1000000-0000-0000-0000-000066ea2018', 'Which wing is National Security targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000227e3f69', 'd1000000-0000-0000-0000-0000227e3f69', 'What is the primary objective of Armed Forces Organisation?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000227e3f69', 'd1000000-0000-0000-0000-0000227e3f69', 'Which wing is Armed Forces Organisation targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000170d063d', 'd1000000-0000-0000-0000-0000170d063d', 'What is the primary objective of Disaster Management?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000170d063d', 'd1000000-0000-0000-0000-0000170d063d', 'Which wing is Disaster Management targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000390c33f0', 'd1000000-0000-0000-0000-0000390c33f0', 'What is the primary objective of Social Service & Community Development?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000390c33f0', 'd1000000-0000-0000-0000-0000390c33f0', 'Which wing is Social Service & Community Development targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000030227a9c', 'd1000000-0000-0000-0000-000030227a9c', 'What is the primary objective of Personality Development & Communication Skills?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000030227a9c', 'd1000000-0000-0000-0000-000030227a9c', 'Which wing is Personality Development & Communication Skills targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00000105660b', 'd1000000-0000-0000-0000-00000105660b', 'What is the primary objective of Map Reading & Navigation?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00000105660b', 'd1000000-0000-0000-0000-00000105660b', 'Which wing is Map Reading & Navigation targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000021aa6e77', 'd1000000-0000-0000-0000-000021aa6e77', 'What is the primary objective of Field Craft & Battle Craft?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000021aa6e77', 'd1000000-0000-0000-0000-000021aa6e77', 'Which wing is Field Craft & Battle Craft targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00006a880255', 'd1000000-0000-0000-0000-00006a880255', 'What is the primary objective of Military History & War Heroes?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00006a880255', 'd1000000-0000-0000-0000-00006a880255', 'Which wing is Military History & War Heroes targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000796a5dde', 'd1000000-0000-0000-0000-0000796a5dde', 'What is the primary objective of General Awareness & Current Affairs?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000796a5dde', 'd1000000-0000-0000-0000-0000796a5dde', 'Which wing is General Awareness & Current Affairs targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000645b68cf', 'd1000000-0000-0000-0000-0000645b68cf', 'What is the primary objective of Officer Like Qualities (OLQs) & Interview Skills?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000645b68cf', 'd1000000-0000-0000-0000-0000645b68cf', 'Which wing is Officer Like Qualities (OLQs) & Interview Skills targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'All Wings', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000027ad7d53', 'd1000000-0000-0000-0000-000027ad7d53', 'What is the primary objective of Field Craft Basics?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000027ad7d53', 'd1000000-0000-0000-0000-000027ad7d53', 'Which wing is Field Craft Basics targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00005c67dc2a', 'd1000000-0000-0000-0000-00005c67dc2a', 'What is the primary objective of Drill with Arms?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00005c67dc2a', 'd1000000-0000-0000-0000-00005c67dc2a', 'Which wing is Drill with Arms targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000003e125ca', 'd1000000-0000-0000-0000-000003e125ca', 'What is the primary objective of Weapon Training?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000003e125ca', 'd1000000-0000-0000-0000-000003e125ca', 'Which wing is Weapon Training targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000045b31c91', 'd1000000-0000-0000-0000-000045b31c91', 'What is the primary objective of Section Formation?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000045b31c91', 'd1000000-0000-0000-0000-000045b31c91', 'Which wing is Section Formation targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000498e560e', 'd1000000-0000-0000-0000-0000498e560e', 'What is the primary objective of Guard Mounting?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000498e560e', 'd1000000-0000-0000-0000-0000498e560e', 'Which wing is Guard Mounting targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000666f90f2', 'd1000000-0000-0000-0000-0000666f90f2', 'What is the primary objective of Battle Craft Basics?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000666f90f2', 'd1000000-0000-0000-0000-0000666f90f2', 'Which wing is Battle Craft Basics targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00004c126907', 'd1000000-0000-0000-0000-00004c126907', 'What is the primary objective of Advanced Weapon Training?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00004c126907', 'd1000000-0000-0000-0000-00004c126907', 'Which wing is Advanced Weapon Training targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00001428290d', 'd1000000-0000-0000-0000-00001428290d', 'What is the primary objective of Field Signals?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00001428290d', 'd1000000-0000-0000-0000-00001428290d', 'Which wing is Field Signals targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000786c8488', 'd1000000-0000-0000-0000-0000786c8488', 'What is the primary objective of Patrolling?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000786c8488', 'd1000000-0000-0000-0000-0000786c8488', 'Which wing is Patrolling targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000231a55d4', 'd1000000-0000-0000-0000-0000231a55d4', 'What is the primary objective of Camouflage & Concealment?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000231a55d4', 'd1000000-0000-0000-0000-0000231a55d4', 'Which wing is Camouflage & Concealment targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000073cf2672', 'd1000000-0000-0000-0000-000073cf2672', 'What is the primary objective of Section Battle Drill?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000073cf2672', 'd1000000-0000-0000-0000-000073cf2672', 'Which wing is Section Battle Drill targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00007392f367', 'd1000000-0000-0000-0000-00007392f367', 'What is the primary objective of Ambush & Defence?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00007392f367', 'd1000000-0000-0000-0000-00007392f367', 'Which wing is Ambush & Defence targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00004b59a45d', 'd1000000-0000-0000-0000-00004b59a45d', 'What is the primary objective of Tactical Exercises?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00004b59a45d', 'd1000000-0000-0000-0000-00004b59a45d', 'Which wing is Tactical Exercises targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00005052f630', 'd1000000-0000-0000-0000-00005052f630', 'What is the primary objective of Platoon Formation?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00005052f630', 'd1000000-0000-0000-0000-00005052f630', 'Which wing is Platoon Formation targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00006a5679ce', 'd1000000-0000-0000-0000-00006a5679ce', 'What is the primary objective of Advanced Battle Craft?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00006a5679ce', 'd1000000-0000-0000-0000-00006a5679ce', 'Which wing is Advanced Battle Craft targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000071c41278', 'd1000000-0000-0000-0000-000071c41278', 'What is the primary objective of Internal Security Duties?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000071c41278', 'd1000000-0000-0000-0000-000071c41278', 'Which wing is Internal Security Duties targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00001e33facf', 'd1000000-0000-0000-0000-00001e33facf', 'What is the primary objective of Field Engineering?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00001e33facf', 'd1000000-0000-0000-0000-00001e33facf', 'Which wing is Field Engineering targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000512fff22', 'd1000000-0000-0000-0000-0000512fff22', 'What is the primary objective of Communication Procedures?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000512fff22', 'd1000000-0000-0000-0000-0000512fff22', 'Which wing is Communication Procedures targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00005f8ea2d4', 'd1000000-0000-0000-0000-00005f8ea2d4', 'What is the primary objective of Map Reading Advanced?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00005f8ea2d4', 'd1000000-0000-0000-0000-00005f8ea2d4', 'Which wing is Map Reading Advanced targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Army', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00003626ed8b', 'd1000000-0000-0000-0000-00003626ed8b', 'What is the primary objective of Naval Orientation?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00003626ed8b', 'd1000000-0000-0000-0000-00003626ed8b', 'Which wing is Naval Orientation targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000421a9aee', 'd1000000-0000-0000-0000-0000421a9aee', 'What is the primary objective of Parts of Ship?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000421a9aee', 'd1000000-0000-0000-0000-0000421a9aee', 'Which wing is Parts of Ship targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00002fac8dc8', 'd1000000-0000-0000-0000-00002fac8dc8', 'What is the primary objective of Seamanship?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00002fac8dc8', 'd1000000-0000-0000-0000-00002fac8dc8', 'Which wing is Seamanship targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000380f3820', 'd1000000-0000-0000-0000-0000380f3820', 'What is the primary objective of Boat Pulling?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000380f3820', 'd1000000-0000-0000-0000-0000380f3820', 'Which wing is Boat Pulling targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00002feaf4db', 'd1000000-0000-0000-0000-00002feaf4db', 'What is the primary objective of Rigging?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00002feaf4db', 'd1000000-0000-0000-0000-00002feaf4db', 'Which wing is Rigging targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00003816b210', 'd1000000-0000-0000-0000-00003816b210', 'What is the primary objective of Naval Communication Basics?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00003816b210', 'd1000000-0000-0000-0000-00003816b210', 'Which wing is Naval Communication Basics targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00002e1c7818', 'd1000000-0000-0000-0000-00002e1c7818', 'What is the primary objective of Navigation?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00002e1c7818', 'd1000000-0000-0000-0000-00002e1c7818', 'Which wing is Navigation targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00002cd2d194', 'd1000000-0000-0000-0000-00002cd2d194', 'What is the primary objective of Anchoring?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00002cd2d194', 'd1000000-0000-0000-0000-00002cd2d194', 'Which wing is Anchoring targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00004e72e59e', 'd1000000-0000-0000-0000-00004e72e59e', 'What is the primary objective of Ship Modelling?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00004e72e59e', 'd1000000-0000-0000-0000-00004e72e59e', 'Which wing is Ship Modelling targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00000aa55155', 'd1000000-0000-0000-0000-00000aa55155', 'What is the primary objective of Naval Signals?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00000aa55155', 'd1000000-0000-0000-0000-00000aa55155', 'Which wing is Naval Signals targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000044a62988', 'd1000000-0000-0000-0000-000044a62988', 'What is the primary objective of Boat Sailing?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000044a62988', 'd1000000-0000-0000-0000-000044a62988', 'Which wing is Boat Sailing targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000021c2f35d', 'd1000000-0000-0000-0000-000021c2f35d', 'What is the primary objective of Tides & Compass?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000021c2f35d', 'd1000000-0000-0000-0000-000021c2f35d', 'Which wing is Tides & Compass targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00001addf457', 'd1000000-0000-0000-0000-00001addf457', 'What is the primary objective of Advanced Navigation?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00001addf457', 'd1000000-0000-0000-0000-00001addf457', 'Which wing is Advanced Navigation targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00007c7294d4', 'd1000000-0000-0000-0000-00007c7294d4', 'What is the primary objective of Naval Warfare Basics?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00007c7294d4', 'd1000000-0000-0000-0000-00007c7294d4', 'Which wing is Naval Warfare Basics targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00001f456459', 'd1000000-0000-0000-0000-00001f456459', 'What is the primary objective of Ship Organisation?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00001f456459', 'd1000000-0000-0000-0000-00001f456459', 'Which wing is Ship Organisation targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00005efb1ed5', 'd1000000-0000-0000-0000-00005efb1ed5', 'What is the primary objective of Communication Systems?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00005efb1ed5', 'd1000000-0000-0000-0000-00005efb1ed5', 'Which wing is Communication Systems targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00006396755e', 'd1000000-0000-0000-0000-00006396755e', 'What is the primary objective of Sailing Expeditions?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00006396755e', 'd1000000-0000-0000-0000-00006396755e', 'Which wing is Sailing Expeditions targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00005f1d0bd4', 'd1000000-0000-0000-0000-00005f1d0bd4', 'What is the primary objective of Naval Weapons Basics?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00005f1d0bd4', 'd1000000-0000-0000-0000-00005f1d0bd4', 'Which wing is Naval Weapons Basics targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000003ec634', 'd1000000-0000-0000-0000-0000003ec634', 'What is the primary objective of Leadership at Sea?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000003ec634', 'd1000000-0000-0000-0000-0000003ec634', 'Which wing is Leadership at Sea targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Navy', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00005f146c89', 'd1000000-0000-0000-0000-00005f146c89', 'What is the primary objective of Principles of Flight?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00005f146c89', 'd1000000-0000-0000-0000-00005f146c89', 'Which wing is Principles of Flight targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00005ca2f1d8', 'd1000000-0000-0000-0000-00005ca2f1d8', 'What is the primary objective of Airframe & Aircraft Parts?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00005ca2f1d8', 'd1000000-0000-0000-0000-00005ca2f1d8', 'Which wing is Airframe & Aircraft Parts targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000056603834', 'd1000000-0000-0000-0000-000056603834', 'What is the primary objective of Flying Basics?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000056603834', 'd1000000-0000-0000-0000-000056603834', 'Which wing is Flying Basics targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000018409e7e', 'd1000000-0000-0000-0000-000018409e7e', 'What is the primary objective of Aviation History?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000018409e7e', 'd1000000-0000-0000-0000-000018409e7e', 'Which wing is Aviation History targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00005b5dfdb6', 'd1000000-0000-0000-0000-00005b5dfdb6', 'What is the primary objective of Aero Modelling?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00005b5dfdb6', 'd1000000-0000-0000-0000-00005b5dfdb6', 'Which wing is Aero Modelling targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00004ec157d0', 'd1000000-0000-0000-0000-00004ec157d0', 'What is the primary objective of Air Navigation Basics?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00004ec157d0', 'd1000000-0000-0000-0000-00004ec157d0', 'Which wing is Air Navigation Basics targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000062aa6abb', 'd1000000-0000-0000-0000-000062aa6abb', 'What is the primary objective of Aircraft Instruments?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000062aa6abb', 'd1000000-0000-0000-0000-000062aa6abb', 'Which wing is Aircraft Instruments targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00006a5672c3', 'd1000000-0000-0000-0000-00006a5672c3', 'What is the primary objective of Meteorology?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00006a5672c3', 'd1000000-0000-0000-0000-00006a5672c3', 'Which wing is Meteorology targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000582a5b2f', 'd1000000-0000-0000-0000-0000582a5b2f', 'What is the primary objective of Air Traffic Control Basics?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000582a5b2f', 'd1000000-0000-0000-0000-0000582a5b2f', 'Which wing is Air Traffic Control Basics targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000305fbd8c', 'd1000000-0000-0000-0000-0000305fbd8c', 'What is the primary objective of Navigation Advanced?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000305fbd8c', 'd1000000-0000-0000-0000-0000305fbd8c', 'Which wing is Navigation Advanced targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-0000338753da', 'd1000000-0000-0000-0000-0000338753da', 'What is the primary objective of Aero Engines?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-0000338753da', 'd1000000-0000-0000-0000-0000338753da', 'Which wing is Aero Engines targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00006af17a39', 'd1000000-0000-0000-0000-00006af17a39', 'What is the primary objective of Map Reading for Aviation?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00006af17a39', 'd1000000-0000-0000-0000-00006af17a39', 'Which wing is Map Reading for Aviation targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000044b2792c', 'd1000000-0000-0000-0000-000044b2792c', 'What is the primary objective of Advanced Aviation Subjects?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000044b2792c', 'd1000000-0000-0000-0000-000044b2792c', 'Which wing is Advanced Aviation Subjects targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00004bb378fe', 'd1000000-0000-0000-0000-00004bb378fe', 'What is the primary objective of Flight Navigation?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00004bb378fe', 'd1000000-0000-0000-0000-00004bb378fe', 'Which wing is Flight Navigation targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00003ec40096', 'd1000000-0000-0000-0000-00003ec40096', 'What is the primary objective of Aircraft Recognition?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00003ec40096', 'd1000000-0000-0000-0000-00003ec40096', 'Which wing is Aircraft Recognition targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00004dda4a83', 'd1000000-0000-0000-0000-00004dda4a83', 'What is the primary objective of Air Power & Warfare?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00004dda4a83', 'd1000000-0000-0000-0000-00004dda4a83', 'Which wing is Air Power & Warfare targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-000007f06bc7', 'd1000000-0000-0000-0000-000007f06bc7', 'What is the primary objective of Aero Engine Systems?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-000007f06bc7', 'd1000000-0000-0000-0000-000007f06bc7', 'Which wing is Aero Engine Systems targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00003c59a640', 'd1000000-0000-0000-0000-00003c59a640', 'What is the primary objective of Aviation Safety?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00003c59a640', 'd1000000-0000-0000-0000-00003c59a640', 'Which wing is Aviation Safety targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1),
('f0000001-0000-0000-0000-00001914bc4a', 'd1000000-0000-0000-0000-00001914bc4a', 'What is the primary objective of Air Force Leadership & Communication?', 'mcq', '["Option A","Option B","Option C","Option D"]'::jsonb, 'Option A', 'easy', 'Introduction', 'Basic concept check.', 1),
('f0000002-0000-0000-0000-00001914bc4a', 'd1000000-0000-0000-0000-00001914bc4a', 'Which wing is Air Force Leadership & Communication targeted for?', 'mcq', '["Army","Navy","Air Force","All Wings"]'::jsonb, 'Air Force', 'medium', 'Targeting', 'Syllabus alignment check.', 1);

-- ============================================
-- TESTS
-- ============================================
INSERT INTO public.tests (id, course_id, title, description, test_type, duration_minutes, question_count, passing_score, randomize_questions, target_wing, is_active) VALUES
('e1000000-0000-0000-0000-000003e125cf', 'a1000000-0000-0000-0000-000000000001', 'NCC At a Glance Assessment', 'Practice assessment covering NCC At a Glance for Certificate A cadets.', 'practice', 15, 4, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000003e125ce', 'a1000000-0000-0000-0000-000000000002', 'Drill & Commands Assessment', 'Practice assessment covering Drill & Commands for Certificate A cadets.', 'practice', 15, 4, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000068284012', 'a1000000-0000-0000-0000-00002d6df6d2', 'Weapon Training & Infantry Weapons Assessment', 'Practice assessment covering Weapon Training & Infantry Weapons for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000003e125cd', 'a1000000-0000-0000-0000-000000000003', 'National Integration Assessment', 'Practice assessment covering National Integration for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-0000202c5758', 'a1000000-0000-0000-0000-0000174a3d1e', 'Leadership & Personality Development Assessment', 'Practice assessment covering Leadership & Personality Development for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-00006333b7d7', 'a1000000-0000-0000-0000-000071e9b09d', 'Civil Defence & Disaster Management Assessment', 'Practice assessment covering Civil Defence & Disaster Management for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000032b61268', 'a1000000-0000-0000-0000-000057c82e75', 'Social Service & Awareness Assessment', 'Practice assessment covering Social Service & Awareness for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000003e125cc', 'a1000000-0000-0000-0000-000000000004', 'Health, Hygiene & Sanitation Assessment', 'Practice assessment covering Health, Hygiene & Sanitation for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-0000284aed79', 'a1000000-0000-0000-0000-00005409f313', 'Yoga & Asanas Assessment', 'Practice assessment covering Yoga & Asanas for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-00001e6e1810', 'a1000000-0000-0000-0000-00001aefb067', 'Home Nursing Assessment', 'Practice assessment covering Home Nursing for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000003712f35', 'a1000000-0000-0000-0000-000000490880', 'Posture Training Assessment', 'Practice assessment covering Posture Training for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-00005d98433c', 'a1000000-0000-0000-0000-0000240e6113', 'Obstacles Training & Adventure Activities Assessment', 'Practice assessment covering Obstacles Training & Adventure Activities for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-00000722b589', 'a1000000-0000-0000-0000-000008b4468c', 'Career in Defence Services Assessment', 'Practice assessment covering Career in Defence Services for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000015abc0ec', 'a1000000-0000-0000-0000-000038908d40', 'Services Tests & Interviews Assessment', 'Practice assessment covering Services Tests & Interviews for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-00006d49238f', 'a1000000-0000-0000-0000-000039ef9e7c', 'Self-Defence Assessment', 'Practice assessment covering Self-Defence for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-00003b6196ee', 'a1000000-0000-0000-0000-00003c4316e3', 'Environment and Ecology Assessment', 'Practice assessment covering Environment and Ecology for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-00004fbcf79f', 'a1000000-0000-0000-0000-0000199562e4', 'Famous Leaders of India Assessment', 'Practice assessment covering Famous Leaders of India for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-00006742b1fa', 'a1000000-0000-0000-0000-000071fe9b19', 'History of India Assessment', 'Practice assessment covering History of India for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-00005ad1b986', 'a1000000-0000-0000-0000-00000ba7d77f', 'Armed Forces & Military History Assessment', 'Practice assessment covering Armed Forces & Military History for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000003e125cb', 'a1000000-0000-0000-0000-000000000005', 'Map Reading Assessment', 'Practice assessment covering Map Reading for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-0000219ecc97', 'a1000000-0000-0000-0000-0000382075a9', 'Communication Assessment', 'Practice assessment covering Communication for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-00001661349b', 'a1000000-0000-0000-0000-0000266d0d05', 'Field Craft & Battle Craft Assessment', 'Practice assessment covering Field Craft & Battle Craft for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-00000add794e', 'a1000000-0000-0000-0000-000016a26b66', 'Personality Development & Officer Like Qualities (OLQs) Assessment', 'Practice assessment covering Personality Development & Officer Like Qualities (OLQs) for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000036a22df0', 'a1000000-0000-0000-0000-00004a803f19', 'Disaster Management & Social Awareness Assessment', 'Practice assessment covering Disaster Management & Social Awareness for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000074af31c0', 'a1000000-0000-0000-0000-00002ba41949', 'Advanced Leadership Assessment', 'Practice assessment covering Advanced Leadership for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000061a47fa3', 'a1000000-0000-0000-0000-00000b8cf529', 'Advanced Drill Assessment', 'Practice assessment covering Advanced Drill for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000066ea2018', 'a1000000-0000-0000-0000-000019d3bbde', 'National Security Assessment', 'Practice assessment covering National Security for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-0000227e3f69', 'a1000000-0000-0000-0000-000017470581', 'Armed Forces Organisation Assessment', 'Practice assessment covering Armed Forces Organisation for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-0000170d063d', 'a1000000-0000-0000-0000-0000636a9bea', 'Disaster Management Assessment', 'Practice assessment covering Disaster Management for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-0000390c33f0', 'a1000000-0000-0000-0000-000015e087f8', 'Social Service & Community Development Assessment', 'Practice assessment covering Social Service & Community Development for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000030227a9c', 'a1000000-0000-0000-0000-00000f5e0237', 'Personality Development & Communication Skills Assessment', 'Practice assessment covering Personality Development & Communication Skills for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-00000105660b', 'a1000000-0000-0000-0000-00007f311b52', 'Map Reading & Navigation Assessment', 'Practice assessment covering Map Reading & Navigation for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000021aa6e77', 'a1000000-0000-0000-0000-0000173e1464', 'Field Craft & Battle Craft Assessment', 'Practice assessment covering Field Craft & Battle Craft for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-00006a880255', 'a1000000-0000-0000-0000-00002d69b84d', 'Military History & War Heroes Assessment', 'Practice assessment covering Military History & War Heroes for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-0000796a5dde', 'a1000000-0000-0000-0000-0000282e60fa', 'General Awareness & Current Affairs Assessment', 'Practice assessment covering General Awareness & Current Affairs for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-0000645b68cf', 'a1000000-0000-0000-0000-0000400027dd', 'Officer Like Qualities (OLQs) & Interview Skills Assessment', 'Practice assessment covering Officer Like Qualities (OLQs) & Interview Skills for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Common', true),
('e1000000-0000-0000-0000-000027ad7d53', 'a1000000-0000-0000-0000-000004518ce7', 'Field Craft Basics Assessment', 'Practice assessment covering Field Craft Basics for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-00005c67dc2a', 'a1000000-0000-0000-0000-00005b295d90', 'Drill with Arms Assessment', 'Practice assessment covering Drill with Arms for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-000003e125ca', 'a1000000-0000-0000-0000-000000000006', 'Weapon Training Assessment', 'Practice assessment covering Weapon Training for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-000045b31c91', 'a1000000-0000-0000-0000-00007250c9a6', 'Section Formation Assessment', 'Practice assessment covering Section Formation for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-0000498e560e', 'a1000000-0000-0000-0000-00001cddd660', 'Guard Mounting Assessment', 'Practice assessment covering Guard Mounting for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-0000666f90f2', 'a1000000-0000-0000-0000-000076b802f1', 'Battle Craft Basics Assessment', 'Practice assessment covering Battle Craft Basics for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-00004c126907', 'a1000000-0000-0000-0000-00005bda6445', 'Advanced Weapon Training Assessment', 'Practice assessment covering Advanced Weapon Training for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-00001428290d', 'a1000000-0000-0000-0000-00004ef72cf6', 'Field Signals Assessment', 'Practice assessment covering Field Signals for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-0000786c8488', 'a1000000-0000-0000-0000-00000fa26f23', 'Patrolling Assessment', 'Practice assessment covering Patrolling for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-0000231a55d4', 'a1000000-0000-0000-0000-0000091f2132', 'Camouflage & Concealment Assessment', 'Practice assessment covering Camouflage & Concealment for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-000073cf2672', 'a1000000-0000-0000-0000-000010986329', 'Section Battle Drill Assessment', 'Practice assessment covering Section Battle Drill for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-00007392f367', 'a1000000-0000-0000-0000-00002d119e7b', 'Ambush & Defence Assessment', 'Practice assessment covering Ambush & Defence for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-00004b59a45d', 'a1000000-0000-0000-0000-000069281cf8', 'Tactical Exercises Assessment', 'Practice assessment covering Tactical Exercises for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-00005052f630', 'a1000000-0000-0000-0000-0000455ec376', 'Platoon Formation Assessment', 'Practice assessment covering Platoon Formation for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-00006a5679ce', 'a1000000-0000-0000-0000-000027c89a44', 'Advanced Battle Craft Assessment', 'Practice assessment covering Advanced Battle Craft for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-000071c41278', 'a1000000-0000-0000-0000-00006a0b9015', 'Internal Security Duties Assessment', 'Practice assessment covering Internal Security Duties for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-00001e33facf', 'a1000000-0000-0000-0000-00006aaa9a6d', 'Field Engineering Assessment', 'Practice assessment covering Field Engineering for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-0000512fff22', 'a1000000-0000-0000-0000-00005baa8724', 'Communication Procedures Assessment', 'Practice assessment covering Communication Procedures for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-00005f8ea2d4', 'a1000000-0000-0000-0000-00002c4f7734', 'Map Reading Advanced Assessment', 'Practice assessment covering Map Reading Advanced for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Army', true),
('e1000000-0000-0000-0000-00003626ed8b', 'a1000000-0000-0000-0000-000007da05fb', 'Naval Orientation Assessment', 'Practice assessment covering Naval Orientation for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-0000421a9aee', 'a1000000-0000-0000-0000-000010cd3522', 'Parts of Ship Assessment', 'Practice assessment covering Parts of Ship for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-00002fac8dc8', 'a1000000-0000-0000-0000-000078b8bad6', 'Seamanship Assessment', 'Practice assessment covering Seamanship for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-0000380f3820', 'a1000000-0000-0000-0000-000060f74a80', 'Boat Pulling Assessment', 'Practice assessment covering Boat Pulling for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-00002feaf4db', 'a1000000-0000-0000-0000-00005f26bbb8', 'Rigging Assessment', 'Practice assessment covering Rigging for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-00003816b210', 'a1000000-0000-0000-0000-00005f71361c', 'Naval Communication Basics Assessment', 'Practice assessment covering Naval Communication Basics for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-00002e1c7818', 'a1000000-0000-0000-0000-000033de1536', 'Navigation Assessment', 'Practice assessment covering Navigation for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-00002cd2d194', 'a1000000-0000-0000-0000-00003e351a55', 'Anchoring Assessment', 'Practice assessment covering Anchoring for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-00004e72e59e', 'a1000000-0000-0000-0000-000066541bbd', 'Ship Modelling Assessment', 'Practice assessment covering Ship Modelling for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-00000aa55155', 'a1000000-0000-0000-0000-00000e385149', 'Naval Signals Assessment', 'Practice assessment covering Naval Signals for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-000044a62988', 'a1000000-0000-0000-0000-000002b2020d', 'Boat Sailing Assessment', 'Practice assessment covering Boat Sailing for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-000021c2f35d', 'a1000000-0000-0000-0000-0000173c9633', 'Tides & Compass Assessment', 'Practice assessment covering Tides & Compass for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-00001addf457', 'a1000000-0000-0000-0000-00003bf3e26f', 'Advanced Navigation Assessment', 'Practice assessment covering Advanced Navigation for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-00007c7294d4', 'a1000000-0000-0000-0000-0000446f03a2', 'Naval Warfare Basics Assessment', 'Practice assessment covering Naval Warfare Basics for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-00001f456459', 'a1000000-0000-0000-0000-00007ebeb8bd', 'Ship Organisation Assessment', 'Practice assessment covering Ship Organisation for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-00005efb1ed5', 'a1000000-0000-0000-0000-00004d1d4699', 'Communication Systems Assessment', 'Practice assessment covering Communication Systems for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-00006396755e', 'a1000000-0000-0000-0000-000056db673e', 'Sailing Expeditions Assessment', 'Practice assessment covering Sailing Expeditions for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-00005f1d0bd4', 'a1000000-0000-0000-0000-000005e105c1', 'Naval Weapons Basics Assessment', 'Practice assessment covering Naval Weapons Basics for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-0000003ec634', 'a1000000-0000-0000-0000-00005e58b4dc', 'Leadership at Sea Assessment', 'Practice assessment covering Leadership at Sea for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Navy', true),
('e1000000-0000-0000-0000-00005f146c89', 'a1000000-0000-0000-0000-00001e49cb34', 'Principles of Flight Assessment', 'Practice assessment covering Principles of Flight for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-00005ca2f1d8', 'a1000000-0000-0000-0000-00003f04d489', 'Airframe & Aircraft Parts Assessment', 'Practice assessment covering Airframe & Aircraft Parts for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-000056603834', 'a1000000-0000-0000-0000-000021b5014e', 'Flying Basics Assessment', 'Practice assessment covering Flying Basics for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-000018409e7e', 'a1000000-0000-0000-0000-000009934b67', 'Aviation History Assessment', 'Practice assessment covering Aviation History for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-00005b5dfdb6', 'a1000000-0000-0000-0000-00001e256fdc', 'Aero Modelling Assessment', 'Practice assessment covering Aero Modelling for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-00004ec157d0', 'a1000000-0000-0000-0000-0000197a9a17', 'Air Navigation Basics Assessment', 'Practice assessment covering Air Navigation Basics for Certificate A cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-000062aa6abb', 'a1000000-0000-0000-0000-00007d5b2b7b', 'Aircraft Instruments Assessment', 'Practice assessment covering Aircraft Instruments for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-00006a5672c3', 'a1000000-0000-0000-0000-00003f85a3d5', 'Meteorology Assessment', 'Practice assessment covering Meteorology for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-0000582a5b2f', 'a1000000-0000-0000-0000-00001e091e5c', 'Air Traffic Control Basics Assessment', 'Practice assessment covering Air Traffic Control Basics for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-0000305fbd8c', 'a1000000-0000-0000-0000-00007b3ed32b', 'Navigation Advanced Assessment', 'Practice assessment covering Navigation Advanced for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-0000338753da', 'a1000000-0000-0000-0000-000025fea92b', 'Aero Engines Assessment', 'Practice assessment covering Aero Engines for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-00006af17a39', 'a1000000-0000-0000-0000-00001042448d', 'Map Reading for Aviation Assessment', 'Practice assessment covering Map Reading for Aviation for Certificate B cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-000044b2792c', 'a1000000-0000-0000-0000-0000191cb74a', 'Advanced Aviation Subjects Assessment', 'Practice assessment covering Advanced Aviation Subjects for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-00004bb378fe', 'a1000000-0000-0000-0000-0000665f0342', 'Flight Navigation Assessment', 'Practice assessment covering Flight Navigation for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-00003ec40096', 'a1000000-0000-0000-0000-000010eaf56f', 'Aircraft Recognition Assessment', 'Practice assessment covering Aircraft Recognition for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-00004dda4a83', 'a1000000-0000-0000-0000-00002cf3b089', 'Air Power & Warfare Assessment', 'Practice assessment covering Air Power & Warfare for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-000007f06bc7', 'a1000000-0000-0000-0000-00007f71eb3d', 'Aero Engine Systems Assessment', 'Practice assessment covering Aero Engine Systems for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-00003c59a640', 'a1000000-0000-0000-0000-000060be762f', 'Aviation Safety Assessment', 'Practice assessment covering Aviation Safety for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Air Force', true),
('e1000000-0000-0000-0000-00001914bc4a', 'a1000000-0000-0000-0000-00004684706e', 'Air Force Leadership & Communication Assessment', 'Practice assessment covering Air Force Leadership & Communication for Certificate C cadets.', 'practice', 15, 2, 50, true, 'Air Force', true);

COMMIT;
