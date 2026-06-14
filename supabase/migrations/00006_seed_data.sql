-- 00006_seed_data.sql — Real NCC A/B/C Certificate Content

-- ============================================
-- COURSES
-- ============================================
INSERT INTO courses (id, title, description, target_wing, certificate_level, duration_hours) VALUES
('a1000000-0000-0000-0000-000000000001', 'NCC General Knowledge', 'History, aims, organization, motto, pledge and song of NCC. Foundation for all certificates.', 'Common', 'A', 6),
('a1000000-0000-0000-0000-000000000002', 'Drill Training', 'Foot drill, arms drill, parade formations and word-of-command procedures.', 'Common', 'A', 8),
('a1000000-0000-0000-0000-000000000003', 'National Integration & Awareness', 'Unity in diversity, national heroes, famous battles, and civic responsibilities.', 'Common', 'B', 5),
('a1000000-0000-0000-0000-000000000004', 'Health, Hygiene & First Aid', 'Personal hygiene, sanitation, nutrition, common diseases, and first aid techniques.', 'Common', 'B', 6),
('a1000000-0000-0000-0000-000000000005', 'Map Reading & Field Craft', 'Topographic maps, compass navigation, conventional signs, camouflage and concealment.', 'Army', 'B', 10),
('a1000000-0000-0000-0000-000000000006', 'Weapon Training', 'Nomenclature, characteristics, handling, firing positions of .22 Rifle and 7.62mm SLR.', 'Army', 'B', 8),
('a1000000-0000-0000-0000-000000000007', 'Naval Orientation & Seamanship', 'Naval history, seamanship basics, knots, boat handling, and naval communication.', 'Navy', 'B', 9),
('a1000000-0000-0000-0000-000000000008', 'Principles of Flight & Aero Modelling', 'Aerodynamics, aircraft recognition, aero-model building, and aviation basics.', 'Air Force', 'B', 7),
('a1000000-0000-0000-0000-000000000009', 'Leadership & Personality Development', 'Leadership qualities, communication skills, time management, and decision making for C certificate.', 'Common', 'C', 6),
('a1000000-0000-0000-0000-000000000010', 'Disaster Management & Civil Defence', 'Natural and man-made disasters, rescue operations, civil defence organization.', 'Common', 'C', 5);

-- ============================================
-- MODULES (3-4 per course)
-- ============================================
-- Course 1: NCC General Knowledge
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'History & Evolution of NCC', 1),
('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'NCC Organization & Structure', 2),
('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'NCC Activities & Camps', 3);

-- Course 2: Drill Training
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Basic Foot Drill', 1),
('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Parade Formations', 2),
('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Arms Drill', 3);

-- Course 3: National Integration
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 'Unity in Diversity', 1),
('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 'National Heroes & Freedom Fighters', 2),
('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000003', 'Famous Indian Battles', 3);

-- Course 4: Health & First Aid
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000004', 'Personal Hygiene & Sanitation', 1),
('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000004', 'First Aid Fundamentals', 2),
('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000004', 'Nutrition & Common Diseases', 3);

-- Course 5: Map Reading (Army)
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000005', 'Introduction to Maps', 1),
('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000005', 'Compass & Navigation', 2),
('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000005', 'Field Craft & Battle Craft', 3);

-- Course 6: Weapon Training (Army)
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000006', '.22 Rifle - Parts & Handling', 1),
('b1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000006', 'Firing Positions & Aiming', 2),
('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000006', 'Range Procedures & Safety', 3);

-- Course 7: Naval (Navy)
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000007', 'Naval History & Organization', 1),
('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000007', 'Seamanship & Knots', 2),
('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000007', 'Boat Handling & Signals', 3);

-- Course 8: Air Force
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000008', 'History of Aviation', 1),
('b1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000008', 'Principles of Flight', 2),
('b1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000008', 'Aero Modelling Basics', 3);

-- Course 9: Leadership (C cert)
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000009', 'Qualities of a Leader', 1),
('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000009', 'Communication & Decision Making', 2),
('b1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000009', 'Case Studies in Military Leadership', 3);

-- Course 10: Disaster Management (C cert)
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000028', 'a1000000-0000-0000-0000-000000000010', 'Types of Disasters', 1),
('b1000000-0000-0000-0000-000000000029', 'a1000000-0000-0000-0000-000000000010', 'Rescue & Relief Operations', 2),
('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000010', 'Civil Defence Organization', 3);
