-- =================================================================
-- CAMPUS PULSE - OPTIONAL DEMO SEED DATA
-- =================================================================
-- Run this seed script in your Supabase SQL editor or CLI to populate
-- initial realistic campus data for testing and demonstration.

-- 1. SEED ANNOUNCEMENTS
INSERT INTO public.announcements (id, title, content, category, is_published, publish_date)
VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'Fall Semester Course Registration Timeline & Guidelines',
    'Registration for the upcoming academic semester opens on Monday, November 10th at 8:00 AM. Please ensure you have cleared all advising holds and checked prerequisite requirements through your student portal prior to registration opening. Departmental counselors will be hosting drop-in hours all week.',
    'Academic',
    true,
    NOW() - INTERVAL '1 day'
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'Annual Engineering & Tech Career Fair 2026',
    'Over 85 tech employers including leading robotics, software, and bioengineering firms will be visiting campus at the Student Union Grand Ballroom. Dress code is business formal. Bring at least 15 printed copies of your resume.',
    'Career',
    true,
    NOW() - INTERVAL '2 days'
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'Campus Library Extended Hours for Midterm Week',
    'The Central Library will remain open 24 hours daily starting this Friday through the conclusion of midterm examinations. Study pods and private collaboration rooms can be reserved up to 48 hours in advance.',
    'Campus Life',
    true,
    NOW() - INTERVAL '3 days'
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'Campus Shuttle Route Modifications Due to Main Gate Repairs',
    'Please take note that North Campus Shuttle routes will be detoured via Westgate Avenue starting Thursday morning. Add an estimated 5-10 minutes to your travel time between science complexes.',
    'Urgent',
    true,
    NOW() - INTERVAL '4 days'
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    'Inter-Collegiate Athletics Championship Tryouts',
    'Varsity and club tryouts for soccer, basketball, and track & field are scheduled for next weekend. All enrolled undergraduate and graduate students with valid sports physical clearance are welcome.',
    'Sports',
    true,
    NOW() - INTERVAL '5 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. SEED EVENTS
INSERT INTO public.events (id, title, description, category, start_time, end_time, venue, organizer, is_published)
VALUES
  (
    'e1000000-0000-0000-0000-000000000001',
    'Campus Hackathon: Build the Future 2026',
    'A 36-hour weekend sprint where student designers, developers, and makers collaborate on real-world projects. Mentors from top companies will be on site. Food, swag, and hardware kits provided!',
    'Workshop',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '4 days' + INTERVAL '12 hours',
    'Innovation Center & Maker Lab',
    'Computer Science Society',
    true
  ),
  (
    'e1000000-0000-0000-0000-000000000002',
    'Keynote Address: Artificial Intelligence in Modern Healthcare',
    'Join Dr. Elena Vance, Pioneer in Bio-Medical AI, as she discusses breakthroughs in machine learning diagnostics and ethical healthcare applications. Q&A session and networking reception to follow.',
    'Academic',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '5 days' + INTERVAL '2 hours',
    'Auditorium Hall B',
    'Faculty of Health Sciences & AI Lab',
    true
  ),
  (
    'e1000000-0000-0000-0000-000000000003',
    'Autumn Acoustic Lawn Festival & Open Mic',
    'Relax with live acoustic performances by student musicians, artisanal food trucks, and craft booths on the University Central Green. Bring your blankets and friends!',
    'Cultural',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '5 hours',
    'Central Quad Green',
    'Student Arts Council',
    true
  ),
  (
    'e1000000-0000-0000-0000-000000000004',
    'Campus Founders Pitch Night',
    'Watch top student startup finalists pitch to angel investors and venture capital judges for a $25,000 non-dilutive grant prize pool. Audience vote counts for the Innovation Choice Award!',
    'Career',
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '10 days' + INTERVAL '3 hours',
    'Business School Amphitheater',
    'Entrepreneurship Hub',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 3. SEED ACADEMIC CALENDAR
INSERT INTO public.academic_calendar (id, title, description, event_type, start_date, end_date, is_published)
VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    'Fall Midterm Examination Period',
    'Comprehensive mid-term exams across all undergraduate departments. Review departmental schedules.',
    'Exam',
    (CURRENT_DATE + INTERVAL '12 days')::date,
    (CURRENT_DATE + INTERVAL '18 days')::date,
    true
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    'Spring Term Course Registration Window',
    'Priority enrollment window based on completed credit hours.',
    'Registration',
    (CURRENT_DATE + INTERVAL '22 days')::date,
    (CURRENT_DATE + INTERVAL '28 days')::date,
    true
  ),
  (
    'c1000000-0000-0000-0000-000000000003',
    'Thanksgiving & Fall Break Recess',
    'Campus academic operations suspended; residence halls open.',
    'Holiday',
    (CURRENT_DATE + INTERVAL '30 days')::date,
    (CURRENT_DATE + INTERVAL '34 days')::date,
    true
  ),
  (
    'c1000000-0000-0000-0000-000000000004',
    'Final Course Withdrawal Deadline',
    'Last day to withdraw from full-term courses with a grade of W on official transcript.',
    'Deadline',
    (CURRENT_DATE + INTERVAL '40 days')::date,
    (CURRENT_DATE + INTERVAL '40 days')::date,
    true
  ),
  (
    'c1000000-0000-0000-0000-000000000005',
    'Final Term Examinations',
    'Official end-of-semester examination period.',
    'Exam',
    (CURRENT_DATE + INTERVAL '50 days')::date,
    (CURRENT_DATE + INTERVAL '57 days')::date,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 4. SEED RESOURCES
INSERT INTO public.resources (id, title, description, category, resource_type, link_url, is_published)
VALUES
  (
    'r1000000-0000-0000-0000-000000000001',
    'Student Course Portal & SIS',
    'Official university portal for class registration, grade transcripts, tuition payments, and degree audits.',
    'Academic',
    'link',
    'https://sis.campus.edu',
    true
  ),
  (
    'r1000000-0000-0000-0000-000000000002',
    'Campus Digital Library & Research Databases',
    'Access over 500,000 academic journals, IEEE Xplore, JSTOR, and interlibrary loan services remotely.',
    'Library',
    'link',
    'https://library.campus.edu',
    true
  ),
  (
    'r1000000-0000-0000-0000-000000000003',
    'Campus Health & Counseling Center',
    'Confidential 24/7 mental wellness support, appointment booking, and emergency medical triage resources.',
    'Campus Support',
    'link',
    'https://health.campus.edu',
    true
  ),
  (
    'r1000000-0000-0000-0000-000000000004',
    'Career Center Resume & Interview Playbook',
    'Official guide for crafting industry resumes, technical portfolio preparation, and behavioral mock interviews.',
    'Career & Tech',
    'link',
    'https://career.campus.edu/resources',
    true
  ),
  (
    'r1000000-0000-0000-0000-000000000005',
    'Student Financial Services & Scholarship Desk',
    'FAFSA guidance, institutional scholarships, emergency student grants, and work-study applications.',
    'Administrative',
    'link',
    'https://financialaid.campus.edu',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 5. SEED CLUBS
INSERT INTO public.clubs (id, name, description, category, contact_email, website_url, meeting_info, is_published)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'Computer Science & AI Society',
    'Dedicated to advancing student knowledge in software engineering, open-source projects, algorithms, and artificial intelligence through workshops and hackathons.',
    'Tech & Innovation',
    'cs-society@campus.edu',
    'https://csclub.campus.edu',
    'Tuesdays 6:00 PM - CS Building Rm 204',
    true
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'Solar Racing & Formula SAE Team',
    'Multidisciplinary engineering team designing and fabricating high-efficiency electric vehicles for national collegiate endurance races.',
    'Tech & Innovation',
    'racing@campus.edu',
    'https://racing.campus.edu',
    'Thursdays 5:30 PM - Engineering Garage Bay 3',
    true
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    'Debate & Forensics Union',
    'Fostering critical discourse, public speaking excellence, and policy advocacy in parliamentary and British parliamentary debate tournaments.',
    'Academic & Career',
    'debate@campus.edu',
    'https://debate.campus.edu',
    'Mondays & Wednesdays 7:00 PM - Humanities Hall 112',
    true
  ),
  (
    'b1000000-0000-0000-0000-000000000004',
    'Campus Environmental Action & Sustainability',
    'Student-led environmental advocacy working on campus zero-waste initiatives, community gardens, and sustainable policy recommendations.',
    'Social & Community',
    'sustainability@campus.edu',
    'https://green.campus.edu',
    'Bi-weekly Wednesdays 6:30 PM - EcoHub Annex',
    true
  ),
  (
    'b1000000-0000-0000-0000-000000000005',
    'Photography & Film Guild',
    'Creative collective exploring digital and analog photography, film cinematography, equipment workshops, and campus documentary storytelling.',
    'Arts & Culture',
    'photoguild@campus.edu',
    'https://photo.campus.edu',
    'Fridays 4:00 PM - Fine Arts Studio 4',
    true
  )
ON CONFLICT (id) DO NOTHING;
