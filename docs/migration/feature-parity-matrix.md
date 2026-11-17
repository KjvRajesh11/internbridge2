# InternBridge: Feature Parity & Route Migration Matrix

## 1. Route Parity Map

| # | Current Route Path | Current Component Location | Target React Component | Target API Endpoints | Target Status |
|---|---|---|---|---|:---:|
| 1 | `/` | `src/app/page.tsx` | `client/src/pages/public/LandingPage.tsx` | `GET /api/v1/internships?limit=4` | In Progress |
| 2 | `/internships` | `src/app/internships/page.tsx` | `client/src/pages/public/InternshipsPage.tsx` | `GET /api/v1/internships` | In Progress |
| 3 | `/internships/:id` | `src/app/internships/[id]/page.tsx` | `client/src/pages/public/InternshipDetailPage.tsx` | `GET /api/v1/internships/:id` | In Progress |
| 4 | `/features` | `src/app/features/page.tsx` | `client/src/pages/public/FeaturesPage.tsx` | `GET /api/v1/agents/status` | In Progress |
| 5 | `/how-it-works` | `src/app/how-it-works/page.tsx` | `client/src/pages/public/HowItWorksPage.tsx` | Static / Informational | In Progress |
| 6 | `/login` | `src/app/login/page.tsx` | `client/src/pages/public/LoginPage.tsx` | `POST /api/v1/auth/login`, `POST /api/v1/auth/switch-user` | In Progress |
| 7 | `/register/student` | `src/app/register/student/page.tsx` | `client/src/pages/public/StudentRegisterPage.tsx` | `POST /api/v1/auth/register/student` | In Progress |
| 8 | `/register/recruiter` | `src/app/register/recruiter/page.tsx` | `client/src/pages/public/RecruiterRegisterPage.tsx` | `POST /api/v1/auth/register/recruiter` | In Progress |
| 9 | `/privacy` | `src/app/privacy/page.tsx` | `client/src/pages/public/PrivacyPage.tsx` | Static Policy | In Progress |
| 10 | `/terms` | `src/app/terms/page.tsx` | `client/src/pages/public/TermsPage.tsx` | Static Terms | In Progress |
| 11 | `/student/dashboard` | `src/app/student/dashboard/page.tsx` | `client/src/pages/student/StudentDashboardPage.tsx` | `GET /api/v1/students/dashboard`, `POST /api/v1/agents/hunter/recommendations` | In Progress |
| 12 | `/student/applications` | `src/app/student/applications/page.tsx` | `client/src/pages/student/StudentApplicationsPage.tsx` | `GET /api/v1/applications` | In Progress |
| 13 | `/student/applications/:id` | `src/app/student/applications/[id]/page.tsx` | `client/src/pages/student/StudentApplicationDetailPage.tsx` | `GET /api/v1/applications/:id`, `POST /api/v1/agents/career-ops/follow-up` | In Progress |
| 14 | `/student/agents` | `src/app/student/agents/page.tsx` | `client/src/pages/student/StudentAgentsPage.tsx` | `GET /api/v1/agents/status`, `GET /api/v1/agents/runs`, `POST /api/v1/agents/hunter/scan`, `POST /api/v1/agents/execution/auto-apply` | In Progress |
| 15 | `/student/interviews` | `src/app/student/interviews/page.tsx` | `client/src/pages/student/StudentInterviewsPage.tsx` | `GET /api/v1/interviews` | In Progress |
| 16 | `/student/interviews/:id/prep` | `src/app/student/interviews/[id]/prep/page.tsx` | `client/src/pages/student/StudentInterviewPrepPage.tsx` | `GET /api/v1/interviews/:id/prep`, `POST /api/v1/agents/career-ops/evaluate-mock` | In Progress |
| 17 | `/student/profile` | `src/app/student/profile/page.tsx` | `client/src/pages/student/StudentProfilePage.tsx` | `GET /api/v1/students/profile`, `PATCH /api/v1/students/profile` | In Progress |
| 18 | `/student/portfolio` | `src/app/student/portfolio/page.tsx` | `client/src/pages/student/StudentPortfolioPage.tsx` | `GET /api/v1/students/portfolio`, `POST /api/v1/students/skills`, `POST /api/v1/students/projects` | In Progress |
| 19 | `/student/notifications` | `src/app/student/notifications/page.tsx` | `client/src/pages/student/StudentNotificationsPage.tsx` | `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:id/read` | In Progress |
| 20 | `/student/settings` | `src/app/student/settings/page.tsx` | `client/src/pages/student/StudentSettingsPage.tsx` | `GET /api/v1/students/settings`, `PATCH /api/v1/students/settings` | In Progress |
| 21 | `/recruiter/dashboard` | `src/app/recruiter/dashboard/page.tsx` | `client/src/pages/recruiter/RecruiterDashboardPage.tsx` | `GET /api/v1/recruiters/dashboard` | In Progress |
| 22 | `/recruiter/internships` | `src/app/recruiter/internships/page.tsx` | `client/src/pages/recruiter/RecruiterInternshipsPage.tsx` | `GET /api/v1/recruiters/internships` | In Progress |
| 23 | `/recruiter/internships/new` | `src/app/recruiter/internships/new/page.tsx` | `client/src/pages/recruiter/RecruiterNewInternshipPage.tsx` | `POST /api/v1/internships` | In Progress |
| 24 | `/recruiter/internships/:id/edit` | `src/app/recruiter/internships/[id]/edit/page.tsx` | `client/src/pages/recruiter/RecruiterEditInternshipPage.tsx` | `GET /api/v1/internships/:id`, `PATCH /api/v1/internships/:id` | In Progress |
| 25 | `/recruiter/applicants` | `src/app/recruiter/applicants/page.tsx` | `client/src/pages/recruiter/RecruiterApplicantsPage.tsx` | `GET /api/v1/recruiters/applicants` | In Progress |
| 26 | `/recruiter/applicants/:id` | `src/app/recruiter/applicants/[id]/page.tsx` | `client/src/pages/recruiter/RecruiterApplicantDetailPage.tsx` | `GET /api/v1/applications/:id`, `PATCH /api/v1/applications/:id/status` | In Progress |
| 27 | `/recruiter/applicants/:id/evaluate` | `src/app/recruiter/applicants/[id]/evaluate/page.tsx` | `client/src/pages/recruiter/RecruiterEvaluateApplicantPage.tsx` | `POST /api/v1/interviews/feedback` | In Progress |
| 28 | `/recruiter/pipeline` | `src/app/recruiter/pipeline/page.tsx` | `client/src/pages/recruiter/RecruiterPipelinePage.tsx` | `GET /api/v1/recruiters/pipeline` | In Progress |
| 29 | `/recruiter/interviews` | `src/app/recruiter/interviews/page.tsx` | `client/src/pages/recruiter/RecruiterInterviewsPage.tsx` | `GET /api/v1/interviews`, `POST /api/v1/interviews/schedule`, `GET/POST /api/v1/interviews/slots` | In Progress |
| 30 | `/recruiter/analytics` | `src/app/recruiter/analytics/page.tsx` | `client/src/pages/recruiter/RecruiterAnalyticsPage.tsx` | `GET /api/v1/recruiters/analytics` | In Progress |
| 31 | `/recruiter/company` | `src/app/recruiter/company/page.tsx` | `client/src/pages/recruiter/RecruiterCompanyPage.tsx` | `GET /api/v1/recruiters/company`, `PATCH /api/v1/recruiters/company` | In Progress |
| 32 | `/recruiter/notifications` | `src/app/recruiter/notifications/page.tsx` | `client/src/pages/recruiter/RecruiterNotificationsPage.tsx` | `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:id/read` | In Progress |
| 33 | `/recruiter/settings` | `src/app/recruiter/settings/page.tsx` | `client/src/pages/recruiter/RecruiterSettingsPage.tsx` | `GET /api/v1/recruiters/settings`, `PATCH /api/v1/recruiters/settings` | In Progress |

---

## 2. MongoDB Mongoose Models Inventory

| # | Model Name | Collection | Key Fields | Required Indexes |
|---|---|---|---|---|
| 1 | `User` / `Profile` | `users` | `email`, `role`, `full_name`, `passwordHash`, `education`, `degree`, `department`, `graduation_year`, `gpa` | `{ email: 1 }` (unique) |
| 2 | `Company` | `companies` | `name`, `description`, `website`, `industry`, `location`, `status` | `{ name: 1 }` |
| 3 | `CompanyMember` | `company_members` | `company_id`, `user_id`, `role`, `membership_status` | `{ company_id: 1, user_id: 1 }` (unique) |
| 4 | `Internship` | `internships` | `company_id`, `created_by`, `title`, `description`, `responsibilities`, `required_skills`, `preferred_skills`, `eligibility_rules`, `minimum_gpa`, `accepted_graduation_years`, `location`, `work_mode`, `duration`, `stipend`, `application_deadline`, `status`, `openings_count` | `{ status: 1, application_deadline: 1 }`, `{ company_id: 1 }` |
| 5 | `StudentSkill` | `student_skills` | `student_id`, `skill_name`, `proficiency_level`, `verified` | `{ student_id: 1, skill_name: 1 }` (unique) |
| 6 | `StudentProject` | `student_projects` | `student_id`, `title`, `description`, `technologies`, `repo_url`, `live_url`, `featured` | `{ student_id: 1 }` |
| 7 | `StudentCertification` | `student_certifications` | `student_id`, `name`, `issuing_org`, `issue_date`, `credential_url` | `{ student_id: 1 }` |
| 8 | `StudentPreferences` | `student_preferences` | `student_id`, `target_roles`, `preferred_skills`, `preferred_locations`, `work_mode_preference`, `min_stipend`, `max_duration_months`, `auto_apply_enabled`, `auto_apply_settings`, `notification_preferences` | `{ student_id: 1 }` (unique) |
| 9 | `StudentDocument` | `student_documents` | `student_id`, `document_type`, `file_name`, `file_url`, `file_size`, `parsed_content`, `is_primary` | `{ student_id: 1 }` |
| 10 | `Application` | `applications` | `student_id`, `internship_id`, `status`, `resume_url`, `answers`, `cover_letter`, `match_score`, `match_analysis`, `submission_timestamp`, `final_decision_timestamp` | **`{ student_id: 1, internship_id: 1 }` (unique)**, `{ status: 1 }` |
| 11 | `ApplicationStatusHistory` | `application_status_history` | `application_id`, `previous_status`, `new_status`, `changed_by`, `change_timestamp`, `reason` | `{ application_id: 1 }` |
| 12 | `Interview` | `interviews` | `application_id`, `interviewer_id`, `start_time`, `end_time`, `timezone`, `interview_mode`, `meeting_url`, `interview_status`, `candidate_instructions` | `{ application_id: 1 }`, `{ interviewer_id: 1, start_time: 1 }` |
| 13 | `InterviewSlot` | `interview_slots` | `recruiter_id`, `company_id`, `start_time`, `end_time`, `timezone`, `is_booked`, `booked_by_application_id` | `{ recruiter_id: 1, start_time: 1 }` |
| 14 | `InterviewFeedback` | `interview_feedback` | `interview_id`, `application_id`, `evaluator_id`, `technical_rating`, `communication_rating`, `problem_solving_rating`, `overall_rating`, `notes`, `recommendation` | `{ interview_id: 1 }`, `{ application_id: 1 }` |
| 15 | `Notification` | `notifications` | `recipient_id`, `type`, `title`, `message`, `link`, `read` | `{ recipient_id: 1, read: 1 }` |
| 16 | `AgentRun` | `agent_runs` | `user_id`, `agent_type`, `status`, `trigger_type`, `input_summary`, `output_summary`, `error_message`, `started_at`, `completed_at` | `{ user_id: 1, started_at: -1 }` |
| 17 | `GeneratedDocument` | `generated_documents` | `student_id`, `application_id`, `doc_type`, `title`, `content`, `approved` | `{ student_id: 1 }` |
