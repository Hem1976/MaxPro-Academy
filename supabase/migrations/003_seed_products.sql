-- Maxpro Academy: seed products, Rockey Fundamentals course, sample content
-- 003_seed_products.sql
-- Product descriptions derived from public Maxpro Infotech marketing pages.
-- Feature-level lesson copy is instructional scaffolding marked as editable CMS content.

insert into public.categories (name, slug, description) values
  ('Sales & Field Operations', 'sales-field-operations', 'Sales force automation and field productivity solutions'),
  ('Distribution & Logistics', 'distribution-logistics', 'Van selling, order and delivery workflows'),
  ('Analytics & Intelligence', 'analytics-intelligence', 'Business intelligence and reporting'),
  ('Workforce & Security', 'workforce-security', 'Guarding and workforce operations');

insert into public.tags (name, slug) values
  ('Fundamentals', 'fundamentals'),
  ('Field Sales', 'field-sales'),
  ('Orders', 'orders'),
  ('Reporting', 'reporting'),
  ('Administration', 'administration');

-- Products (from maxproinfotech.com public portfolio)
insert into public.products (id, name, slug, short_description, description, category, published, featured, sort_order) values
  (
    '11111111-1111-1111-1111-111111111101',
    'Rockey',
    'rockey',
    'All-in-one sales app for field teams and any sales model.',
    'Rockey is Maxpro Infotech''s comprehensive sales force automation solution for salesmen, merchandisers, distributors, and businesses with field teams. Training content covers core navigation and common workflows. Specific feature details should be confirmed and expanded by Maxpro content editors.',
    'Sales & Field Operations',
    true,
    true,
    1
  ),
  (
    '11111111-1111-1111-1111-111111111102',
    'RocketSales',
    'rocketsales',
    'Omni sales, productivity and reporting SFA app for field teams.',
    'RocketSales is an omni sales, productivity and reporting SFA application for salesmen, merchandisers, promoters, brand ambassadors, distributors, and other field entities.',
    'Sales & Field Operations',
    true,
    true,
    2
  ),
  (
    '11111111-1111-1111-1111-111111111103',
    'RocketSales Pharma',
    'rocketsales-pharma',
    'Productivity and reporting for pharmaceutical field teams.',
    'RocketSales Pharma supports pharmaceutical distributors, manufacturers, surgical suppliers, and agro-chemical medical reps with productivity and reporting workflows.',
    'Sales & Field Operations',
    true,
    true,
    3
  ),
  (
    '11111111-1111-1111-1111-111111111104',
    'RocketVan',
    'rocketvan',
    'Sales app for van sellers and motorcycle sellers.',
    'RocketVan covers the van-selling flow from stock request and receipt through selling and submission of stock and cash back to the main store. Course details are editable in Admin.',
    'Distribution & Logistics',
    true,
    false,
    4
  ),
  (
    '11111111-1111-1111-1111-111111111105',
    'RocketPulse',
    'rocketpulse',
    'Fiscal document notifications via email and SMS.',
    'RocketPulse sends fiscal documents via email and SMS notifications when fiscal documents such as invoices or credit/debit notes are printed. Expand product training via the CMS.',
    'Distribution & Logistics',
    true,
    false,
    5
  ),
  (
    '11111111-1111-1111-1111-111111111106',
    'RocketOrder',
    'rocketorder',
    'Fiscal document notifications connected to ERP print events.',
    'RocketOrder sends fiscal document notifications when invoices or credit/debit notes are printed via ERP systems. Product training content is maintained in Admin.',
    'Distribution & Logistics',
    true,
    false,
    6
  ),
  (
    '11111111-1111-1111-1111-111111111107',
    'Kingo',
    'kingo',
    'Mobility solution for manned guarding operations.',
    'Kingo is a mobility solution for managing manned guarding operations with apps for patrolling personnel, guarding supervisors, and guards. Training modules can be added in Admin.',
    'Workforce & Security',
    true,
    false,
    7
  ),
  (
    '11111111-1111-1111-1111-111111111108',
    'RocketBI',
    'rocketbi',
    'Business intelligence and reporting for Maxpro solutions.',
    'RocketBI supports business intelligence and reporting across Maxpro deployments.',
    'Analytics & Intelligence',
    true,
    true,
    8
  );

-- Rockey Fundamentals course
insert into public.courses (
  id, product_id, title, slug, description, short_description,
  level, estimated_minutes, published, featured, certificate_enabled,
  sort_order, learning_outcomes, status, version, review_status
) values (
  '22222222-2222-2222-2222-222222222201',
  '11111111-1111-1111-1111-111111111101',
  'Rockey Fundamentals',
  'rockey-fundamentals',
  'A structured introduction to Rockey for field teams and managers. Learn how to navigate the application, work with customers and products, create sales orders, and understand common operational workflows. Lesson detail beyond public product positioning is placeholder instructional content — replace with Maxpro-approved screenshots and procedures in Admin.',
  'Learn the core Rockey workflows for field sales operations.',
  'beginner',
  95,
  true,
  true,
  true,
  1,
  array[
    'Navigate the Rockey application confidently',
    'Find and manage customer records',
    'Work with products and pricing views',
    'Create and submit a sales order',
    'Understand field operations and basic reports',
    'Recognize common administration tasks'
  ],
  'published',
  '1.0',
  'current'
);

insert into public.course_tags (course_id, tag_id)
select '22222222-2222-2222-2222-222222222201', id from public.tags where slug in ('fundamentals', 'field-sales', 'orders');

-- Sample RocketSales course (lighter seed)
insert into public.courses (
  id, product_id, title, slug, description, short_description,
  level, estimated_minutes, published, featured, certificate_enabled,
  sort_order, learning_outcomes, status
) values (
  '22222222-2222-2222-2222-222222222202',
  '11111111-1111-1111-1111-111111111102',
  'RocketSales Essentials',
  'rocketsales-essentials',
  'An introductory path for RocketSales users. Expand modules and lessons through the Academy course builder.',
  'Get started with RocketSales field productivity workflows.',
  'beginner',
  45,
  true,
  true,
  true,
  2,
  array[
    'Understand the RocketSales workspace',
    'Complete a basic field visit workflow',
    'Review productivity and reporting entry points'
  ],
  'published'
);

-- Modules for Rockey Fundamentals
insert into public.modules (id, course_id, title, description, sort_order) values
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 'Getting Started', 'Orientation and first login.', 1),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', 'Customers', 'Working with customer records.', 2),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222201', 'Products', 'Browsing and managing product information.', 3),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222201', 'Sales Orders', 'Creating and submitting orders.', 4),
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222201', 'Field Operations', 'Day-to-day field activities.', 5),
  ('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222201', 'Reports', 'Reviewing sales and activity reports.', 6),
  ('33333333-3333-3333-3333-333333333307', '22222222-2222-2222-2222-222222222201', 'Administration', 'Common admin tasks for supervisors.', 7);

-- Lessons helper content note: written_content is CMS-editable scaffolding
insert into public.lessons (
  id, module_id, title, slug, description, learning_objective,
  video_provider, video_url, duration_seconds, transcript, written_content,
  processing_status, published, required, sort_order
) values
-- Getting Started
(
  '44444444-4444-4444-4444-444444444401',
  '33333333-3333-3333-3333-333333333301',
  'Introduction to Rockey',
  'introduction-to-rockey',
  'Overview of Rockey and how Maxpro Academy training is organized.',
  'Explain what Rockey is used for and how this course is structured.',
  'placeholder',
  null,
  240,
  'Welcome to Rockey Fundamentals. This course introduces the core workflows used by field teams.',
  E'## What you''ll learn\n\nRockey helps field teams manage sales activities from customer visits through order submission.\n\n## Step 1\n\nOpen Maxpro Academy and enroll in Rockey Fundamentals if you have not already.\n\n## Step 2\n\nReview the course modules so you know the learning path.\n\n> Tip: Use the course outline on the right to jump between lessons as you learn.',
  'ready', true, true, 1
),
(
  '44444444-4444-4444-4444-444444444402',
  '33333333-3333-3333-3333-333333333301',
  'Logging In',
  'logging-in',
  'Sign in and prepare your workspace.',
  'Successfully sign in and reach the main workspace.',
  'placeholder', null, 180,
  'Learn how to sign in to Rockey with credentials provided by your administrator.',
  E'## What you''ll learn\n\nHow to access Rockey securely.\n\n## Step 1\n\nOpen the Rockey application or web entry point provided by Maxpro.\n\n## Step 2\n\nEnter your username and password.\n\n## Step 3\n\nConfirm you land on the main workspace.\n\n> Warning: Never share credentials. Contact Maxpro Support if you cannot sign in.',
  'ready', true, true, 2
),
(
  '44444444-4444-4444-4444-444444444403',
  '33333333-3333-3333-3333-333333333301',
  'Understanding the Dashboard',
  'understanding-the-dashboard',
  'Orient yourself in the main Rockey interface.',
  'Identify the primary areas of the Rockey dashboard.',
  'placeholder', null, 300,
  'The dashboard surfaces key actions and summaries for your role.',
  E'## What you''ll learn\n\nThe purpose of the main navigation and summary areas.\n\n## Step 1\n\nLocate the primary navigation.\n\n## Step 2\n\nIdentify where customers, products, and orders are accessed.\n\n## Step 3\n\nNote any role-specific widgets your administrator has enabled.\n\n> Tip: Exact layout can vary by deployment — confirm with your Maxpro configuration.',
  'ready', true, true, 3
),
(
  '44444444-4444-4444-4444-444444444404',
  '33333333-3333-3333-3333-333333333301',
  'Navigating the Application',
  'navigating-the-application',
  'Move confidently between Rockey screens.',
  'Navigate between common Rockey screens without getting lost.',
  'placeholder', null, 240,
  'Practice moving between modules using the main menu.',
  E'## Step 1\n\nOpen the main menu.\n\n## Step 2\n\nMove to Customers, then return to the dashboard.\n\n## Step 3\n\nOpen Products and Orders to confirm you can reach each area.',
  'ready', true, true, 4
),
-- Customers
(
  '44444444-4444-4444-4444-444444444405',
  '33333333-3333-3333-3333-333333333302',
  'Managing Customers',
  'managing-customers',
  'Find and review customer records.',
  'Locate a customer and review key profile fields.',
  'placeholder', null, 360,
  'Customer records are central to field sales workflows.',
  E'## Step 1\n\nOpen Customers.\n\n## Step 2\n\nSearch for a customer by name or code.\n\n## Step 3\n\nOpen the record and review contact and visit-related fields available in your deployment.',
  'ready', true, true, 1
),
(
  '44444444-4444-4444-4444-444444444406',
  '33333333-3333-3333-3333-333333333302',
  'Creating a Customer',
  'creating-a-customer',
  'Add a new customer when your role permits it.',
  'Create a customer record using required fields.',
  'placeholder', null, 300,
  'Some roles can create customers; others may only update visits.',
  E'## Step 1\n\nOpen Customers and select New Customer if available.\n\n## Step 2\n\nEnter required fields provided by your administrator.\n\n## Step 3\n\nSave and confirm the customer appears in the list.\n\n> Warning: Required fields differ by tenant configuration.',
  'ready', true, true, 2
),
-- Products
(
  '44444444-4444-4444-4444-444444444407',
  '33333333-3333-3333-3333-333333333303',
  'Managing Products',
  'managing-products',
  'Browse the product catalog used during selling.',
  'Find a product and confirm pricing or availability views available to your role.',
  'placeholder', null, 300,
  'The product catalog supports accurate order capture.',
  E'## Step 1\n\nOpen Products.\n\n## Step 2\n\nSearch for a known SKU or product name.\n\n## Step 3\n\nReview the details available to field users.',
  'ready', true, true, 1
),
-- Sales Orders
(
  '44444444-4444-4444-4444-444444444408',
  '33333333-3333-3333-3333-333333333304',
  'Creating a Sales Order',
  'creating-a-sales-order',
  'Build an order for a customer.',
  'Create a draft sales order with at least one line item.',
  'placeholder', null, 420,
  'Order creation is one of the most common Rockey workflows.',
  E'## Step 1\n\nOpen Customers and select the customer.\n\n## Step 2\n\nSelect New Order.\n\n## Step 3\n\nAdd products and quantities.\n\n## Step 4\n\nReview totals before submission.',
  'ready', true, true, 1
),
(
  '44444444-4444-4444-4444-444444444409',
  '33333333-3333-3333-3333-333333333304',
  'Submitting an Order',
  'submitting-an-order',
  'Submit an order through the approval or sync path used by your organization.',
  'Submit an order and confirm its status updates.',
  'placeholder', null, 300,
  'Submission rules depend on your Maxpro configuration.',
  E'## Step 1\n\nOpen the draft order.\n\n## Step 2\n\nValidate required fields.\n\n## Step 3\n\nSubmit the order and note the resulting status.',
  'ready', true, true, 2
),
-- Field Operations
(
  '44444444-4444-4444-4444-444444444410',
  '33333333-3333-3333-3333-333333333305',
  'Field Day Workflow',
  'field-day-workflow',
  'A practical overview of a typical field day.',
  'Describe the sequence of a typical Rockey field day.',
  'placeholder', null, 360,
  'Field days usually combine visits, orders, and activity capture.',
  E'## Step 1\n\nReview planned visits or beats if enabled.\n\n## Step 2\n\nComplete customer interactions and capture required data.\n\n## Step 3\n\nSubmit orders and close the day according to your process.',
  'ready', true, true, 1
),
-- Reports
(
  '44444444-4444-4444-4444-444444444411',
  '33333333-3333-3333-3333-333333333306',
  'Viewing Sales Reports',
  'viewing-sales-reports',
  'Find and interpret common sales reports.',
  'Open a sales report and identify key metrics available to your role.',
  'placeholder', null, 300,
  'Reports help teams understand performance.',
  E'## Step 1\n\nOpen Reports.\n\n## Step 2\n\nSelect a sales or activity report available in your tenant.\n\n## Step 3\n\nApply a date range and review the result.',
  'ready', true, true, 1
),
-- Administration
(
  '44444444-4444-4444-4444-444444444412',
  '33333333-3333-3333-3333-333333333307',
  'Managing Users',
  'managing-users',
  'Overview of user administration for supervisors.',
  'Identify where user management is accessed when your role allows it.',
  'placeholder', null, 300,
  'User administration is typically restricted to supervisors and admins.',
  E'## Step 1\n\nConfirm you have an administrative role.\n\n## Step 2\n\nOpen the user management area if available.\n\n## Step 3\n\nReview how users are assigned to teams or territories in your deployment.\n\n> Tip: Exact admin screens vary — document your tenant''s process here.',
  'ready', true, true, 1
);

-- Minimal RocketSales Essentials lessons
insert into public.modules (id, course_id, title, description, sort_order) values
  ('33333333-3333-3333-3333-333333333311', '22222222-2222-2222-2222-222222222202', 'Getting Started', 'Orientation for RocketSales.', 1);

insert into public.lessons (
  id, module_id, title, slug, description, learning_objective,
  video_provider, duration_seconds, written_content, processing_status, published, required, sort_order
) values
(
  '44444444-4444-4444-4444-444444444421',
  '33333333-3333-3333-3333-333333333311',
  'Welcome to RocketSales',
  'welcome-to-rocketsales',
  'Orientation for RocketSales Essentials.',
  'Describe the purpose of RocketSales for field productivity.',
  'placeholder', 180,
  E'## What you''ll learn\n\nRocketSales supports field sales productivity and reporting.\n\nExpand this lesson with Maxpro-approved content in Admin.',
  'ready', true, true, 1
),
(
  '44444444-4444-4444-4444-444444444422',
  '33333333-3333-3333-3333-333333333311',
  'RocketSales Workspace Overview',
  'rocketsales-workspace-overview',
  'A first look at the RocketSales workspace.',
  'Identify the primary areas of the RocketSales workspace.',
  'placeholder', 240,
  E'## Step 1\n\nSign in to RocketSales.\n\n## Step 2\n\nLocate navigation for visits, orders, and reports as enabled for your role.',
  'ready', true, true, 2
);

-- Quiz for Creating a Sales Order
insert into public.quizzes (id, lesson_id, title, description, passing_score, required) values
(
  '55555555-5555-5555-5555-555555555501',
  '44444444-4444-4444-4444-444444444408',
  'Sales Order Quick Check',
  'Confirm you understand the basic order creation sequence.',
  70,
  true
);

insert into public.quiz_questions (id, quiz_id, question, explanation, sort_order) values
(
  '66666666-6666-6666-6666-666666666601',
  '55555555-5555-5555-5555-555555555501',
  'What is the recommended first step when creating a sales order in Rockey?',
  'Orders are typically created in the context of a customer.',
  1
),
(
  '66666666-6666-6666-6666-666666666602',
  '55555555-5555-5555-5555-555555555501',
  'Before submitting an order, what should you do?',
  'Always review line items and totals before submission.',
  2
);

insert into public.quiz_options (question_id, option_text, is_correct, sort_order) values
  ('66666666-6666-6666-6666-666666666601', 'Select the customer, then create a new order', true, 1),
  ('66666666-6666-6666-6666-666666666601', 'Delete all previous orders first', false, 2),
  ('66666666-6666-6666-6666-666666666601', 'Change your password', false, 3),
  ('66666666-6666-6666-6666-666666666601', 'Uninstall the application', false, 4),
  ('66666666-6666-6666-6666-666666666602', 'Review products, quantities, and totals', true, 1),
  ('66666666-6666-6666-6666-666666666602', 'Close the app immediately', false, 2),
  ('66666666-6666-6666-6666-666666666602', 'Create a second identical order', false, 3),
  ('66666666-6666-6666-6666-666666666602', 'Ignore validation messages', false, 4);

insert into public.lesson_resources (lesson_id, title, description, file_url, resource_type) values
(
  '44444444-4444-4444-4444-444444444408',
  'Order checklist',
  'A simple checklist for validating an order before submission. Replace with Maxpro-approved documentation.',
  'https://maxproinfotech.com',
  'link'
);

insert into public.announcements (title, content, type, published) values
(
  'Welcome to Maxpro Academy',
  'Maxpro Academy is ready for product training. Admins can publish additional courses from the CMS.',
  'info',
  true
);
