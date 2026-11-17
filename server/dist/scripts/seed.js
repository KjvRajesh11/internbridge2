import bcrypt from 'bcryptjs';
import { User, Company, CompanyMember, Internship, StudentSkill, StudentProject, StudentCertification, StudentPreferences, StudentDocument, Application, ApplicationStatusHistory, Interview, InterviewSlot, Notification, AgentRun, } from '../models/index.js';
export async function seedDatabase(force = false) {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0 && !force) {
        console.log('[Seed] Database already contains records. Skipping seed.');
        return;
    }
    console.log('[Seed] Seeding MongoDB with InternBridge initial data...');
    if (force) {
        await Promise.all([
            User.deleteMany({}),
            Company.deleteMany({}),
            CompanyMember.deleteMany({}),
            Internship.deleteMany({}),
            StudentSkill.deleteMany({}),
            StudentProject.deleteMany({}),
            StudentCertification.deleteMany({}),
            StudentPreferences.deleteMany({}),
            StudentDocument.deleteMany({}),
            Application.deleteMany({}),
            ApplicationStatusHistory.deleteMany({}),
            Interview.deleteMany({}),
            InterviewSlot.deleteMany({}),
            Notification.deleteMany({}),
            AgentRun.deleteMany({}),
        ]);
    }
    const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
    // 1. Companies
    await Company.create([
        {
            _id: 'c1000000-0000-0000-0000-000000000001',
            name: 'CloudScale Technologies',
            description: 'Enterprise cloud infrastructure and distributed systems engineering.',
            website: 'https://cloudscale.example.com',
            industry: 'Cloud Computing & DevOps',
            location: 'Bengaluru, India',
            status: 'active',
        },
        {
            _id: 'c2000000-0000-0000-0000-000000000002',
            name: 'Nova Health AI',
            description: 'Next-generation clinical intelligence and biomedical machine learning platform.',
            website: 'https://novahealth.example.com',
            industry: 'Healthcare AI & Biotech',
            location: 'Hyderabad, India (Remote-friendly)',
            status: 'active',
        },
        {
            _id: 'c3000000-0000-0000-0000-000000000003',
            name: 'FinEdge Global',
            description: 'High-frequency algorithmic trading and resilient financial ledger systems.',
            website: 'https://finedge.example.com',
            industry: 'FinTech & Quantitative Finance',
            location: 'Mumbai, India',
            status: 'active',
        },
    ]);
    // 2. Users (Students & Recruiters)
    await User.create([
        {
            _id: 's1000000-0000-0000-0000-000000000001',
            role: 'student',
            full_name: 'Priya Sharma',
            email: 'priya.sharma@example.edu',
            passwordHash: defaultPasswordHash,
            education: 'National Institute of Technology',
            degree: 'B.Tech',
            department: 'Computer Science and Engineering',
            graduation_year: 2026,
            gpa: 8.85,
            location: 'Bengaluru, India',
            professional_summary: 'Full-stack software engineering student specializing in distributed systems, TypeScript, React, and Python. Passionate about cloud performance.',
            preferences: {
                target_roles: ['Full Stack Engineer', 'Cloud Software Engineer', 'Backend Developer'],
                work_modes: ['remote', 'hybrid'],
            },
        },
        {
            _id: 's2000000-0000-0000-0000-000000000002',
            role: 'student',
            full_name: 'Rohan Mehta',
            email: 'rohan.mehta@example.edu',
            passwordHash: defaultPasswordHash,
            education: 'Indian Institute of Technology',
            degree: 'B.Tech',
            department: 'Data Science & AI',
            graduation_year: 2026,
            gpa: 9.1,
            location: 'Hyderabad, India',
            professional_summary: 'ML practitioner experienced with PyTorch, NLP, and model serving. Built end-to-end inference pipelines on Kubernetes.',
            preferences: {
                target_roles: ['Machine Learning Engineer', 'AI Research Intern'],
                work_modes: ['remote'],
            },
        },
        {
            _id: 's3000000-0000-0000-0000-000000000003',
            role: 'student',
            full_name: 'Ananya Iyer',
            email: 'ananya.iyer@example.edu',
            passwordHash: defaultPasswordHash,
            education: 'Birla Institute of Technology and Science',
            degree: 'B.E.',
            department: 'Electronics & Computer Science',
            graduation_year: 2027,
            gpa: 8.4,
            location: 'Pune, India',
            professional_summary: 'Frontend engineer focused on accessible, high-performance web applications and UI design systems.',
            preferences: {
                target_roles: ['Frontend Engineer', 'Product Designer'],
                work_modes: ['in-office', 'hybrid'],
            },
        },
        {
            _id: 'r1000000-0000-0000-0000-000000000001',
            role: 'recruiter',
            full_name: 'Alex Rivera',
            email: 'alex.rivera@cloudscale.example.com',
            passwordHash: defaultPasswordHash,
            education: 'University of Washington',
            degree: 'M.S.',
            department: 'Information Management',
            graduation_year: 2018,
            location: 'Bengaluru, India',
            professional_summary: 'Lead Technical Recruiter at CloudScale. Hiring future cloud builders.',
        },
        {
            _id: 'r2000000-0000-0000-0000-000000000002',
            role: 'recruiter',
            full_name: 'Marcus Vance',
            email: 'marcus.vance@novahealth.example.com',
            passwordHash: defaultPasswordHash,
            education: 'Georgia Tech',
            degree: 'M.S.',
            department: 'Human-Computer Interaction',
            graduation_year: 2017,
            location: 'Hyderabad, India',
            professional_summary: 'Talent Partner at Nova Health AI. Building world-class biomedical AI engineering teams.',
        },
    ]);
    // 3. Company Members
    await CompanyMember.create([
        {
            _id: 'cm100000-0000-0000-0000-000000000001',
            company_id: 'c1000000-0000-0000-0000-000000000001',
            user_id: 'r1000000-0000-0000-0000-000000000001',
            role: 'admin',
            membership_status: 'active',
        },
        {
            _id: 'cm200000-0000-0000-0000-000000000002',
            company_id: 'c2000000-0000-0000-0000-000000000002',
            user_id: 'r2000000-0000-0000-0000-000000000002',
            role: 'admin',
            membership_status: 'active',
        },
    ]);
    // 4. Internships
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + 30);
    await Internship.create([
        {
            _id: 'i1000000-0000-0000-0000-000000000001',
            company_id: 'c1000000-0000-0000-0000-000000000001',
            created_by: 'r1000000-0000-0000-0000-000000000001',
            title: 'Cloud Infrastructure & Backend Engineering Intern',
            description: 'Join CloudScale Technologies to design, build, and optimize high-throughput distributed microservices on modern cloud infrastructure. You will collaborate with staff engineers on latency reduction and automated failover pipelines.',
            responsibilities: '1. Implement and benchmark REST/gRPC microservices in Go or Node.js.\n2. Write automated integration test suites and Terraform modules.\n3. Optimize PostgreSQL query execution plans and caching policies.',
            required_skills: ['Go', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
            preferred_skills: ['Kubernetes', 'Redis', 'AWS', 'GraphQL'],
            eligibility_rules: {
                min_gpa: 7.5,
                allowed_degrees: ['B.Tech', 'B.E.', 'M.Tech'],
                allowed_years: [2026, 2027],
            },
            minimum_gpa: 7.5,
            accepted_graduation_years: [2026, 2027],
            location: 'Bengaluru, India',
            work_mode: 'hybrid',
            duration: '6 Months',
            stipend: '₹55,000 / month',
            application_deadline: deadlineDate,
            status: 'published',
            openings_count: 3,
        },
        {
            _id: 'i2000000-0000-0000-0000-000000000002',
            company_id: 'c2000000-0000-0000-0000-000000000002',
            created_by: 'r2000000-0000-0000-0000-000000000002',
            title: 'Applied AI & Machine Learning Research Intern',
            description: 'Nova Health AI is seeking passionate ML interns to develop clinical diagnostic assistance models and biomedical NLP processing pipelines. You will work on privacy-preserving model tuning and clinical validation.',
            responsibilities: '1. Fine-tune open-source foundation models on structured clinical datasets.\n2. Design evaluation benchmarks for retrieval-augmented generation.\n3. Implement model quantizations and low-latency API serving.',
            required_skills: ['Python', 'PyTorch', 'Transformers', 'FastAPI'],
            preferred_skills: ['CUDA', 'LangChain', 'Docker', 'MLflow'],
            eligibility_rules: {
                min_gpa: 8.0,
                allowed_degrees: ['B.Tech', 'M.Tech', 'M.S.'],
                allowed_years: [2025, 2026],
            },
            minimum_gpa: 8.0,
            accepted_graduation_years: [2025, 2026],
            location: 'Hyderabad, India (Remote-friendly)',
            work_mode: 'remote',
            duration: '6 Months',
            stipend: '₹65,000 / month',
            application_deadline: deadlineDate,
            status: 'published',
            openings_count: 2,
        },
        {
            _id: 'i3000000-0000-0000-0000-000000000003',
            company_id: 'c3000000-0000-0000-0000-000000000003',
            created_by: 'r1000000-0000-0000-0000-000000000001',
            title: 'High-Frequency Quantitative Systems Intern',
            description: 'Build low-latency execution algorithms and real-time market risk monitors. Work directly with quantitative researchers on market simulation backtesting.',
            responsibilities: '1. Develop low-latency order routing in modern C++ and Rust.\n2. Implement memory-mapped IPC queues for market ticks.\n3. Build backtesting dashboards with React and WebSocket feeds.',
            required_skills: ['C++', 'Rust', 'Linux Internals', 'Algorithms'],
            preferred_skills: ['Python', 'ZeroMQ', 'Kafka'],
            eligibility_rules: {
                min_gpa: 8.5,
                allowed_degrees: ['B.Tech', 'B.E.'],
                allowed_years: [2026],
            },
            minimum_gpa: 8.5,
            accepted_graduation_years: [2026],
            location: 'Mumbai, India',
            work_mode: 'in-office',
            duration: '3 Months',
            stipend: '₹1,00,000 / month',
            application_deadline: deadlineDate,
            status: 'published',
            openings_count: 1,
        },
    ]);
    // 5. Student Skills
    await StudentSkill.create([
        {
            _id: 'sk100000-0000-0000-0000-000000000001',
            student_id: 's1000000-0000-0000-0000-000000000001',
            skill_name: 'TypeScript',
            proficiency_level: 'expert',
            verified: true,
        },
        {
            _id: 'sk200000-0000-0000-0000-000000000002',
            student_id: 's1000000-0000-0000-0000-000000000001',
            skill_name: 'Node.js',
            proficiency_level: 'advanced',
            verified: true,
        },
        {
            _id: 'sk300000-0000-0000-0000-000000000003',
            student_id: 's1000000-0000-0000-0000-000000000001',
            skill_name: 'PostgreSQL',
            proficiency_level: 'advanced',
            verified: true,
        },
        {
            _id: 'sk400000-0000-0000-0000-000000000004',
            student_id: 's1000000-0000-0000-0000-000000000001',
            skill_name: 'Docker',
            proficiency_level: 'intermediate',
            verified: true,
        },
        {
            _id: 'sk500000-0000-0000-0000-000000000005',
            student_id: 's1000000-0000-0000-0000-000000000001',
            skill_name: 'React',
            proficiency_level: 'expert',
            verified: true,
        },
    ]);
    // 6. Student Projects
    await StudentProject.create([
        {
            _id: 'pr100000-0000-0000-0000-000000000001',
            student_id: 's1000000-0000-0000-0000-000000000001',
            title: 'DistriKV: Distributed Key-Value Store with Raft Consensus',
            description: 'Engineered an atomic in-memory distributed key-value store with leader election, log replication, and snapshotting in Go and TypeScript.',
            technologies: ['Go', 'TypeScript', 'Raft', 'gRPC', 'Docker'],
            repo_url: 'https://github.com/priyasharma/distrikv',
            live_url: 'https://distrikv.demo.internal',
            featured: true,
        },
        {
            _id: 'pr200000-0000-0000-0000-000000000002',
            student_id: 's1000000-0000-0000-0000-000000000001',
            title: 'CloudTelemetry: Real-Time Stream Monitoring Engine',
            description: 'High-throughput metric collection pipeline handling 10,000 events/sec with sub-second dashboard visualization and automated threshold alerting.',
            technologies: ['Node.js', 'PostgreSQL', 'Redis', 'WebSockets', 'React'],
            repo_url: 'https://github.com/priyasharma/cloud-telemetry',
            live_url: 'https://telemetry.demo.internal',
            featured: true,
        },
    ]);
    // 7. Student Preferences
    await StudentPreferences.create({
        _id: 'pref1000-0000-0000-0000-000000000001',
        student_id: 's1000000-0000-0000-0000-000000000001',
        target_roles: ['Full Stack Engineer', 'Cloud Software Engineer', 'Backend Developer'],
        preferred_skills: ['TypeScript', 'Go', 'Docker', 'Kubernetes'],
        preferred_locations: ['Bengaluru', 'Remote'],
        work_mode_preference: ['remote', 'hybrid'],
        min_stipend: '₹40,000',
        max_duration_months: 6,
        auto_apply_enabled: false,
        auto_apply_settings: {
            match_threshold: 80,
            max_weekly_apps: 5,
            require_approval: true,
            allowed_modes: ['remote', 'hybrid'],
        },
        notification_preferences: { email: true, in_app: true },
    });
    // 8. Student Document (Resume)
    await StudentDocument.create({
        _id: 'doc10000-0000-0000-0000-000000000001',
        student_id: 's1000000-0000-0000-0000-000000000001',
        document_type: 'resume',
        file_name: 'Priya_Sharma_Resume_2026.pdf',
        file_url: 'https://storage.internbridge.internal/resumes/priya-sharma-2026.pdf',
        file_size: 245760,
        parsed_content: 'Priya Sharma - Computer Science Student at NIT. GPA: 8.85. Skills: TypeScript, Go, PostgreSQL, Docker, React. Projects: DistriKV, CloudTelemetry.',
        is_primary: true,
    });
    // 9. Applications
    await Application.create([
        {
            _id: 'a1000000-0000-0000-0000-000000000001',
            student_id: 's1000000-0000-0000-0000-000000000001',
            internship_id: 'i1000000-0000-0000-0000-000000000001',
            status: 'under_review',
            resume_url: 'https://storage.internbridge.internal/resumes/priya-sharma-2026.pdf',
            answers: {
                'Tell us about a technical challenge you overcame': 'While building DistriKV, I solved a Raft leader election split-vote scenario by tuning randomized election timeouts between 150ms and 300ms.',
            },
            cover_letter: 'I am excited to apply for the Cloud Infrastructure Internship at CloudScale Technologies. Having built DistriKV with Raft consensus, I look forward to contributing to your microservices.',
            match_score: 92,
            match_analysis: {
                compatibility_score: 92,
                matching_skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
                missing_skills: ['Go'],
                eligibility_passed: true,
                reasons: ['Strong alignment with core backend stack', 'Exceeds GPA requirement (8.85 >= 7.50)'],
                breakdown: {
                    required_skills_pct: 32,
                    preferred_skills_pct: 15,
                    role_alignment_pct: 15,
                    education_alignment_pct: 10,
                    location_alignment_pct: 10,
                },
            },
            submission_timestamp: new Date(Date.now() - 3 * 86400000),
        },
        {
            _id: 'a2000000-0000-0000-0000-000000000002',
            student_id: 's1000000-0000-0000-0000-000000000001',
            internship_id: 'i2000000-0000-0000-0000-000000000002',
            status: 'shortlisted',
            resume_url: 'https://storage.internbridge.internal/resumes/priya-sharma-2026.pdf',
            answers: {},
            cover_letter: 'Applying to Nova Health AI to bring high-performance web tooling to clinical diagnostic pipelines.',
            match_score: 85,
            submission_timestamp: new Date(Date.now() - 5 * 86400000),
        },
    ]);
    // 10. Application Status History
    await ApplicationStatusHistory.create([
        {
            _id: 'h1000000-0000-0000-0000-000000000001',
            application_id: 'a1000000-0000-0000-0000-000000000001',
            previous_status: 'applied',
            new_status: 'under_review',
            changed_by: 'r1000000-0000-0000-0000-000000000001',
            change_timestamp: new Date(Date.now() - 2 * 86400000),
            reason: 'Candidate profile exceeded qualification threshold; advancing to technical evaluation.',
        },
    ]);
    // 11. Interview Slots & Scheduled Interviews
    const slotStart = new Date(Date.now() + 2 * 86400000);
    const slotEnd = new Date(slotStart.getTime() + 45 * 60000);
    await InterviewSlot.create([
        {
            _id: 'slot1000-0000-0000-0000-000000000001',
            recruiter_id: 'r1000000-0000-0000-0000-000000000001',
            company_id: 'c1000000-0000-0000-0000-000000000001',
            start_time: slotStart,
            end_time: slotEnd,
            timezone: 'Asia/Kolkata',
            is_booked: true,
            booked_by_application_id: 'a2000000-0000-0000-0000-000000000002',
        },
        {
            _id: 'slot2000-0000-0000-0000-000000000002',
            recruiter_id: 'r1000000-0000-0000-0000-000000000001',
            company_id: 'c1000000-0000-0000-0000-000000000001',
            start_time: new Date(Date.now() + 3 * 86400000),
            end_time: new Date(Date.now() + 3 * 86400000 + 45 * 60000),
            timezone: 'Asia/Kolkata',
            is_booked: false,
        },
    ]);
    await Interview.create({
        _id: 'int10000-0000-0000-0000-000000000001',
        application_id: 'a2000000-0000-0000-0000-000000000002',
        interviewer_id: 'r2000000-0000-0000-0000-000000000002',
        start_time: slotStart,
        end_time: slotEnd,
        timezone: 'Asia/Kolkata',
        interview_mode: 'video',
        meeting_url: 'https://meet.internbridge.internal/nova-clinical-prep-room',
        interview_status: 'scheduled',
        candidate_instructions: 'Technical discussion regarding clinical NLP retrieval pipelines and transformer inference benchmarks.',
    });
    // 12. Notifications
    await Notification.create([
        {
            _id: 'notif100-0000-0000-0000-000000000001',
            recipient_id: 's1000000-0000-0000-0000-000000000001',
            type: 'interview_scheduled',
            title: 'Interview Confirmed: Nova Health AI',
            message: 'Your technical interview round has been scheduled for Applied AI & Machine Learning Research Intern.',
            link: '/student/interviews',
            read: false,
        },
        {
            _id: 'notif200-0000-0000-0000-000000000002',
            recipient_id: 'r1000000-0000-0000-0000-000000000001',
            type: 'new_application',
            title: 'New Candidate Submission',
            message: 'Priya Sharma submitted an application for Cloud Infrastructure & Backend Engineering Intern.',
            link: '/recruiter/applicants/a1000000-0000-0000-0000-000000000001',
            read: true,
        },
    ]);
    // 13. Agent Run History
    await AgentRun.create({
        _id: 'run10000-0000-0000-0000-000000000001',
        user_id: 's1000000-0000-0000-0000-000000000001',
        agent_type: 'hunter_agent',
        status: 'completed',
        trigger_type: 'manual',
        input_summary: { student_id: 's1000000-0000-0000-0000-000000000001' },
        output_summary: {
            opportunities_scanned: 3,
            matches_found: 3,
            top_match: 'CloudScale Technologies (92%)',
        },
        started_at: new Date(Date.now() - 3600000),
        completed_at: new Date(Date.now() - 3598000),
    });
    console.log('[Seed] Database successfully seeded with 17 entity records.');
}
// Standalone execution if run directly via tsx
if (process.argv[1]?.endsWith('seed.ts')) {
    import('../config/database.js').then(async ({ connectDatabase }) => {
        await connectDatabase();
        await seedDatabase(true);
        process.exit(0);
    });
}
