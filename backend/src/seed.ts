import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';

async function main() {
  console.log('Seeding Terraskills LMS official 6-course catalog...');

  // 1. Clean existing course records
  await prisma.review.deleteMany();
  await prisma.note.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();

  // 2. Ensure faculty account exists
  const salt = await bcrypt.genSalt(10);
  const instructorPassword = await bcrypt.hash('Terraskills123!', salt);

  const faculty = await prisma.user.upsert({
    where: { email: 'instructor@terraskills.com' },
    update: {},
    create: {
      email: 'instructor@terraskills.com',
      password: instructorPassword,
      name: 'Dr. Sarah Ibrahim',
      role: 'instructor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      headline: 'Principal Faculty Fellow & Workforce Development Director, Terraskills',
      bio: 'Leading human capital development and digital competency frameworks across Nigeria. 15+ years experience in technical skills transition.',
    },
  });

  // 3. The 6 Official Terraskills Courses:
  // 1) Digital Marketing
  // 2) Frontend Development
  // 3) Backend Development
  // 4) Data Analytics
  // 5) AI Automation
  // 6) Cybersecurity

  // ==========================================
  // Course 1: Digital Marketing
  // ==========================================
  await prisma.course.create({
    data: {
      title: 'Digital Marketing',
      slug: 'digital-marketing',
      subtitle: 'Master SEO, Content Marketing, Social Media Strategy, Paid Ads (Google & Meta), and Analytics.',
      description: 'Terraskills accredited Digital Marketing program equips students and professionals to build and scale high-ROI customer acquisition engines. Master technical SEO, paid advertising funnels, marketing automation, Google Analytics 4, and multi-channel campaign strategy.',
      category: 'Digital Marketing',
      level: 'All Levels',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80',
      instructorId: faculty.id,
      instructorName: 'Amina Bello',
      instructorTitle: 'Terraskills Senior Growth Fellow & Digital Marketing Strategist',
      instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      duration: '8h 45m',
      rating: 4.95,
      reviewsCount: 128,
      price: 0,
      badge: 'High Demand',
      featured: true,
      modules: {
        create: [
          {
            title: 'Module 1: Foundations of Digital Marketing & Funnel Architecture',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'The Modern Digital Marketing Engine: Full-Funnel Architecture',
                  order: 1,
                  duration: '24m 10s',
                  durationSeconds: 1450,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=bixR-KIJKYM',
                  description: 'Structuring customer acquisition pipelines from awareness to retention using the modern digital marketing framework.',
                  summary: 'Understand the multi-stage conversion funnel, customer journey mapping, and acquisition economics.',
                  resourcesJson: JSON.stringify([
                    { name: 'Terraskills Digital Growth Framework (PDF)', url: 'https://terraskills.com' },
                    { name: 'Acquisition Funnel Planning Sheet', url: 'https://terraskills.com' },
                  ]),
                },
                {
                  title: 'Target Audience Segmentation, ICPs & Resonant Value Propositions',
                  order: 2,
                  duration: '21m 45s',
                  durationSeconds: 1305,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=bixR-KIJKYM',
                  description: 'Creating high-fidelity ideal customer profiles, empathy maps, and market positioning that drives conversions.',
                  summary: 'Discover qualitative research techniques and segmentation methodologies for modern campaigns.',
                },
              ],
            },
          },
          {
            title: 'Module 2: Technical SEO & Organic Search Authority',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'Search Intent, Keyword Intelligence & Semantic Topic Clusters',
                  order: 1,
                  duration: '28m 30s',
                  durationSeconds: 1710,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=xsVTqzratPs',
                  description: 'Building keyword maps and semantic topic clusters that dominate search engine result pages (SERPs).',
                  summary: 'Hands-on keyword research using modern search console data and competitor gap analysis.',
                },
                {
                  title: 'On-Page Optimization, Schema Markup & Content Architecture',
                  order: 2,
                  duration: '26m 15s',
                  durationSeconds: 1575,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=xsVTqzratPs',
                  description: 'Best practices for title tags, structured data, JSON-LD schema, and internal linking hierarchy.',
                  summary: 'Step-by-step checklist to audit and optimize web pages for top search engine ranking.',
                },
              ],
            },
          },
        ],
      },
      reviews: {
        create: [
          {
            userId: faculty.id,
            rating: 5,
            comment: 'This course transformed our digital marketing campaigns from guesswork into a predictable revenue system.',
          },
        ],
      },
    },
  });

  // ==========================================
  // Course 2: Frontend Development
  // ==========================================
  await prisma.course.create({
    data: {
      title: 'Frontend Development',
      slug: 'frontend-development',
      subtitle: 'Master HTML5, CSS3, Modern JavaScript, React.js, Tailwind CSS, Responsive Design, and State Management.',
      description: 'Terraskills Frontend Development curriculum provides hands-on mastery in building interactive, high-performance web applications. Learn modern ES6+ JavaScript, component-driven UI with React, styling with Tailwind CSS, REST API integration, and responsive layout architectures.',
      category: 'Frontend Development',
      level: 'All Levels',
      thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1000&auto=format&fit=crop&q=80',
      instructorId: faculty.id,
      instructorName: 'Engr. Emeka Nwosu',
      instructorTitle: 'Terraskills Principal Software Fellow & Senior Frontend Engineer',
      instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      duration: '10h 30m',
      rating: 4.97,
      reviewsCount: 164,
      price: 0,
      badge: 'Popular',
      featured: true,
      modules: {
        create: [
          {
            title: 'Module 1: Modern HTML5, Responsive CSS3 & JavaScript Essentials',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Semantic HTML5, Accessibility (a11y) & Modern Web Standards',
                  order: 1,
                  duration: '32m 10s',
                  durationSeconds: 1930,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=kUMe1FH4CHE',
                  description: 'Laying rock-solid semantic web foundations with accessible markup, modern layout techniques, and DOM structures.',
                  summary: 'Master semantic tag architecture, accessibility guidelines, and cross-browser rendering standards.',
                },
                {
                  title: 'Modern CSS3 Layouts: Flexbox, CSS Grid & Tailwind CSS Architecture',
                  order: 2,
                  duration: '35m 45s',
                  durationSeconds: 2145,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=kUMe1FH4CHE',
                  description: 'Deep dive into responsive layout mechanics, flexbox alignment, 2D CSS grid systems, and utility-first Tailwind design.',
                  summary: 'Build real-world responsive layouts that fluidly adapt across mobile, tablet, and widescreen viewports.',
                },
              ],
            },
          },
          {
            title: 'Module 2: React.js Component Architecture & State Management',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'React Components, JSX, Props & State Lifecycle Hooks',
                  order: 1,
                  duration: '38m 20s',
                  durationSeconds: 2300,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=zJSY8tbf_ys',
                  description: 'Component-driven engineering using functional components, useState, useEffect, and custom hooks.',
                  summary: 'Understand unidirectional data flow, immutability, virtual DOM diffing, and component re-render optimization.',
                },
                {
                  title: 'Global State Management, API Fetching & Single-Page Routing',
                  order: 2,
                  duration: '42m 15s',
                  durationSeconds: 2535,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=zJSY8tbf_ys',
                  description: 'Building multi-page SPA navigation with React Router, async data caching, and global state patterns.',
                  summary: 'Architect production-grade frontends connected to backend REST and GraphQL endpoints.',
                },
              ],
            },
          },
        ],
      },
      reviews: {
        create: [
          {
            userId: faculty.id,
            rating: 5,
            comment: 'Clear, modern, and practical. Building real React applications helped me secure my first web engineering role.',
          },
        ],
      },
    },
  });

  // ==========================================
  // Course 3: Backend Development
  // ==========================================
  await prisma.course.create({
    data: {
      title: 'Backend Development',
      slug: 'backend-development',
      subtitle: 'Build scalable REST APIs, databases (PostgreSQL & SQLite), authentication, Python, Django, and cloud deployment.',
      description: 'Master server-side engineering with Python, Django, and Django REST Framework. Learn ORM data modeling, secure JWT & session authentication, relational database management, caching, API development, and deploying production-ready backend applications to the cloud.',
      category: 'Backend Development',
      level: 'All Levels',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80',
      instructorId: faculty.id,
      instructorName: 'Babajide Adeleke',
      instructorTitle: 'Terraskills Principal Systems Architect & Lead Cloud Engineer',
      instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      duration: '11h 15m',
      rating: 4.98,
      reviewsCount: 152,
      price: 0,
      badge: 'Core Engineering',
      featured: true,
      modules: {
        create: [
          {
            title: 'Module 1: Python Essentials & Django Web Framework Architecture',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Python Language Fundamentals, Virtual Environments & Django Project Setup',
                  order: 1,
                  duration: '36m 40s',
                  durationSeconds: 2200,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
                  description: 'Understanding Python syntax, package management with pip, virtual environments, and Django project/app architecture.',
                  summary: 'Master the Model-View-Template (MVT) pattern, URL routing, views, settings configuration, and admin panel.',
                },
                {
                  title: 'Django REST Framework (DRF), Serializers & JWT Authentication',
                  order: 2,
                  duration: '40m 10s',
                  durationSeconds: 2410,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
                  description: 'Implementing token-based stateless authentication with JWT in Django, model serializers, permissions, and CORS security.',
                  summary: 'Build bulletproof REST API endpoints with DRF ViewSets, query optimization, and permission classes.',
                },
              ],
            },
          },
          {
            title: 'Module 2: Django ORM, Relational Databases (PostgreSQL) & Migrations',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'Django ORM Data Modeling, ForeignKeys & PostgreSQL Integration',
                  order: 1,
                  duration: '38m 50s',
                  durationSeconds: 2330,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=RebA5J-rlhU',
                  description: 'Entity relationships, QuerySets, migrations, PostgreSQL database connectivity, and database indexes.',
                  summary: 'Design normalized relational models in Django engineered for high query efficiency and transactional integrity.',
                },
                {
                  title: 'Production Deployment: Gunicorn, Nginx & Cloud Hosting',
                  order: 2,
                  duration: '34m 20s',
                  durationSeconds: 2060,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=RebA5J-rlhU',
                  description: 'WSGI server configuration with Gunicorn, static files management with WhiteNoise, environment secrets, and cloud deployment.',
                  summary: 'Deploy production-grade Python and Django applications to cloud servers with SSL and process supervision.',
                },
              ],
            },
          },
        ],
      },
      reviews: {
        create: [
          {
            userId: faculty.id,
            rating: 5,
            comment: 'The database modeling and REST API security sections were world-class. Exactly what backend teams look for.',
          },
        ],
      },
    },
  });

  // ==========================================
  // Course 4: Data Analytics
  // ==========================================
  await prisma.course.create({
    data: {
      title: 'Data Analytics',
      slug: 'data-analytics',
      subtitle: 'Transform raw data into strategic insights with Excel, SQL, Power BI, Python, and statistical business intelligence.',
      description: 'The Terraskills Data Analytics track transforms beginners into skilled analysts. Master SQL query optimization, automated data cleaning with Python & Pandas, dynamic interactive dashboards in Power BI, and statistical storytelling for decision-makers.',
      category: 'Data Analytics',
      level: 'All Levels',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
      instructorId: faculty.id,
      instructorName: 'Dr. Fatima Umar',
      instructorTitle: 'Terraskills Lead Data Scientist & Quantitative Analytics Fellow',
      instructorAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
      duration: '9h 20m',
      rating: 4.96,
      reviewsCount: 140,
      price: 0,
      badge: 'High Demand',
      featured: true,
      modules: {
        create: [
          {
            title: 'Module 1: Advanced SQL for Data Extraction & Wrangling',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Complex Joins, Aggregations & Grouping Strategies',
                  order: 1,
                  duration: '31m 20s',
                  durationSeconds: 1880,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=r-uolxXTWrc',
                  description: 'Extracting data from multi-table schemas using inner, outer, left, and cross joins alongside grouping and filtering.',
                  summary: 'Master aggregate functions (SUM, AVG, COUNT, HAVING) to answer executive business queries.',
                },
                {
                  title: 'SQL Window Functions, CTEs & Performance Query Optimization',
                  order: 2,
                  duration: '34m 15s',
                  durationSeconds: 2055,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=r-uolxXTWrc',
                  description: 'Ranking functions (ROW_NUMBER, RANK, DENSE_RANK), moving averages, Common Table Expressions (CTEs), and subqueries.',
                  summary: 'Solve complex analytical challenges and write clean, maintainable SQL scripts.',
                },
              ],
            },
          },
          {
            title: 'Module 2: Business Intelligence Dashboards with Power BI',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'Data Modeling, Star Schemas & DAX Formulas in Power BI',
                  order: 1,
                  duration: '38m 40s',
                  durationSeconds: 2320,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=Xh0xtYvWZwk',
                  description: 'Connecting to varied datasources, building star-schema data models, and authoring calculated DAX measures.',
                  summary: 'Understand dimensional modeling, relationships, filters, and time-intelligence DAX functions.',
                },
                {
                  title: 'Interactive Executive Storytelling: KPIs & Drill-Through Dashboards',
                  order: 2,
                  duration: '30m 50s',
                  durationSeconds: 1850,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=Xh0xtYvWZwk',
                  description: 'Designing intuitive, high-impact business visual dashboards with cross-filtering, drill-throughs, and bookmarks.',
                  summary: 'Turn technical figures into clear recommendations for senior corporate leadership.',
                },
              ],
            },
          },
        ],
      },
      reviews: {
        create: [
          {
            userId: faculty.id,
            rating: 5,
            comment: 'Hands-down the best practical SQL and Power BI training. The real-world datasets mirrored actual corporate analytics.',
          },
        ],
      },
    },
  });

  // ==========================================
  // Course 5: AI Automation
  // ==========================================
  await prisma.course.create({
    data: {
      title: 'AI Automation',
      slug: 'ai-automation',
      subtitle: 'Harness generative AI, LLM prompting, Zapier, Make, n8n, autonomous agents, and workflow automation pipelines.',
      description: 'Build next-generation automated workflows using Large Language Models, generative AI APIs, and visual workflow builders (n8n, Make, Zapier). Learn prompt engineering, vector search, AI agent architectures, and integrating AI into real business operations.',
      category: 'AI Automation',
      level: 'All Levels',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1000&auto=format&fit=crop&q=80',
      instructorId: faculty.id,
      instructorName: 'Engr. David Oladipo',
      instructorTitle: 'Terraskills AI Research Lead & Automation Architect',
      instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      duration: '7h 40m',
      rating: 4.99,
      reviewsCount: 110,
      price: 0,
      badge: 'Emerging Tech',
      featured: true,
      modules: {
        create: [
          {
            title: 'Module 1: Foundations of Generative AI & Prompt Engineering',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'LLM Mechanics, Tokenization & Structured Prompt Engineering',
                  order: 1,
                  duration: '28m 30s',
                  durationSeconds: 1710,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=2bbINuP8q2M',
                  description: 'How modern transformer models operate, controlling hallucinations, few-shot prompting, and JSON output parsing.',
                  summary: 'Design robust system prompts and structured input/output pipelines for consistent business automation.',
                },
                {
                  title: 'AI Agents, Function Calling & Tools Integration',
                  order: 2,
                  duration: '32m 45s',
                  durationSeconds: 1965,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=2bbINuP8q2M',
                  description: 'Connecting LLMs to real APIs, database lookups, code execution, and autonomous decision loops.',
                  summary: 'Build intelligent agents capable of multi-step task execution and self-correcting logic.',
                },
              ],
            },
          },
          {
            title: 'Module 2: Visual Workflow Builders & Enterprise Automation (n8n & Make)',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'Building End-to-End Automated Pipelines with n8n & Webhooks',
                  order: 1,
                  duration: '35m 10s',
                  durationSeconds: 2110,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=63I03Q1fEbc',
                  description: 'Triggering automations via webhooks, transforming JSON data payloads, and error-handling pipelines.',
                  summary: 'Create production automations that eliminate manual repetitive tasks across CRM, email, and databases.',
                },
                {
                  title: 'Integrating AI Models into Live Customer & Operations Workflows',
                  order: 2,
                  duration: '31m 15s',
                  durationSeconds: 1875,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=63I03Q1fEbc',
                  description: 'Embedding automated AI summarization, customer triage, sentiment scoring, and automated document generation.',
                  summary: 'Deploy real-world AI automation pipelines that scale operations with zero manual intervention.',
                },
              ],
            },
          },
        ],
      },
      reviews: {
        create: [
          {
            userId: faculty.id,
            rating: 5,
            comment: 'AI Automation is the future. Building live n8n and LLM agents in this course immediately saved our team 20 hours a week.',
          },
        ],
      },
    },
  });

  // ==========================================
  // Course 6: Cybersecurity
  // ==========================================
  await prisma.course.create({
    data: {
      title: 'Cybersecurity',
      slug: 'cybersecurity',
      subtitle: 'Defend digital enterprise systems, master ethical hacking, network defense, threat intelligence, and security compliance.',
      description: 'Terraskills Cybersecurity masterclass provides comprehensive defensive security engineering. Master network vulnerability scanning, SIEM monitoring, threat hunting, Linux security hardening, incident response, and ISO/NIST compliance.',
      category: 'Cybersecurity',
      level: 'All Levels',
      thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80',
      instructorId: faculty.id,
      instructorName: 'Capt. Usman Mohammed',
      instructorTitle: 'Terraskills Cyber Defense Fellow & Certified Information Systems Auditor',
      instructorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      duration: '10h 10m',
      rating: 4.97,
      reviewsCount: 135,
      price: 0,
      badge: 'Defensive Systems',
      featured: true,
      modules: {
        create: [
          {
            title: 'Module 1: Network Architecture, Packet Analysis & Defense',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'TCP/IP Protocol Suite, OSI Model & Wireshark Packet Inspection',
                  order: 1,
                  duration: '33m 40s',
                  durationSeconds: 2020,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=inWWhr5tnEA',
                  description: 'Deep packet inspection with Wireshark, TCP 3-way handshakes, ARP spoofing detection, and firewall rules.',
                  summary: 'Understand enterprise network perimeter security and identify malicious network signatures.',
                },
                {
                  title: 'Vulnerability Assessment with Nmap, OpenVAS & Port Scanning',
                  order: 2,
                  duration: '29m 30s',
                  durationSeconds: 1770,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=inWWhr5tnEA',
                  description: 'Network mapping with Nmap, script scanning (NSE), service fingerprinting, and risk prioritization.',
                  summary: 'Perform systematic vulnerability scans to discover exposures before adversaries can exploit them.',
                },
              ],
            },
          },
          {
            title: 'Module 2: Ethical Hacking, Web Defense & Incident Response',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'OWASP Top 10 Web Vulnerabilities: SQLi, XSS & CSRF Defense',
                  order: 1,
                  duration: '37m 15s',
                  durationSeconds: 2235,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=3kJ3V8rF5q8',
                  description: 'Simulating and neutralizing SQL injections, Cross-Site Scripting (XSS), and Cross-Site Request Forgery (CSRF).',
                  summary: 'Harden web applications and implement Defense-in-Depth architectures against cyber intrusions.',
                },
                {
                  title: 'SOC Operations, Incident Response & Digital Forensic Evidence',
                  order: 2,
                  duration: '32m 50s',
                  durationSeconds: 1970,
                  videoType: 'youtube',
                  videoUrl: 'https://www.youtube.com/watch?v=3kJ3V8rF5q8',
                  description: 'Security Operations Center (SOC) triage, chain of custody, log analysis, and incident containment strategies.',
                  summary: 'Execute structured incident containment according to NIST and ISO 27001 guidelines.',
                },
              ],
            },
          },
        ],
      },
      reviews: {
        create: [
          {
            userId: faculty.id,
            rating: 5,
            comment: 'The network packet analysis and OWASP defense labs gave me the exact hands-on skills needed for security engineering.',
          },
        ],
      },
    },
  });

  console.log('✓ Successfully seeded the 6 official Terraskills courses:');
  console.log('  1. Digital Marketing');
  console.log('  2. Frontend Development');
  console.log('  3. Backend Development');
  console.log('  4. Data Analytics');
  console.log('  5. AI Automation');
  console.log('  6. Cybersecurity');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
