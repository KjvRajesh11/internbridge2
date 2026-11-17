import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), '..');
const SRC_APP = path.join(ROOT, 'src/app');
const CLIENT_PAGES = path.join(ROOT, 'client/src/pages');

const PAGE_MAPPINGS: Array<{ src: string; dest: string }> = [
  // Public
  { src: 'page.tsx', dest: 'public/LandingPage.tsx' },
  { src: 'internships/page.tsx', dest: 'public/InternshipsPage.tsx' },
  { src: 'internships/[id]/page.tsx', dest: 'public/InternshipDetailPage.tsx' },
  { src: 'features/page.tsx', dest: 'public/FeaturesPage.tsx' },
  { src: 'how-it-works/page.tsx', dest: 'public/HowItWorksPage.tsx' },
  { src: 'login/page.tsx', dest: 'public/LoginPage.tsx' },
  { src: 'register/student/page.tsx', dest: 'public/StudentRegisterPage.tsx' },
  { src: 'register/recruiter/page.tsx', dest: 'public/RecruiterRegisterPage.tsx' },
  { src: 'privacy/page.tsx', dest: 'public/PrivacyPage.tsx' },
  { src: 'terms/page.tsx', dest: 'public/TermsPage.tsx' },

  // Student
  { src: 'student/dashboard/page.tsx', dest: 'student/StudentDashboardPage.tsx' },
  { src: 'student/applications/page.tsx', dest: 'student/StudentApplicationsPage.tsx' },
  { src: 'student/applications/[id]/page.tsx', dest: 'student/StudentApplicationDetailPage.tsx' },
  { src: 'student/agents/page.tsx', dest: 'student/StudentAgentsPage.tsx' },
  { src: 'student/interviews/page.tsx', dest: 'student/StudentInterviewsPage.tsx' },
  { src: 'student/interviews/[id]/prep/page.tsx', dest: 'student/StudentInterviewPrepPage.tsx' },
  { src: 'student/profile/page.tsx', dest: 'student/StudentProfilePage.tsx' },
  { src: 'student/portfolio/page.tsx', dest: 'student/StudentPortfolioPage.tsx' },
  { src: 'student/notifications/page.tsx', dest: 'student/StudentNotificationsPage.tsx' },
  { src: 'student/settings/page.tsx', dest: 'student/StudentSettingsPage.tsx' },

  // Recruiter
  { src: 'recruiter/dashboard/page.tsx', dest: 'recruiter/RecruiterDashboardPage.tsx' },
  { src: 'recruiter/internships/page.tsx', dest: 'recruiter/RecruiterInternshipsPage.tsx' },
  { src: 'recruiter/internships/new/page.tsx', dest: 'recruiter/RecruiterNewInternshipPage.tsx' },
  { src: 'recruiter/internships/[id]/edit/page.tsx', dest: 'recruiter/RecruiterEditInternshipPage.tsx' },
  { src: 'recruiter/applicants/page.tsx', dest: 'recruiter/RecruiterApplicantsPage.tsx' },
  { src: 'recruiter/applicants/[id]/page.tsx', dest: 'recruiter/RecruiterApplicantDetailPage.tsx' },
  { src: 'recruiter/applicants/[id]/evaluate/page.tsx', dest: 'recruiter/RecruiterEvaluateApplicantPage.tsx' },
  { src: 'recruiter/pipeline/page.tsx', dest: 'recruiter/RecruiterPipelinePage.tsx' },
  { src: 'recruiter/interviews/page.tsx', dest: 'recruiter/RecruiterInterviewsPage.tsx' },
  { src: 'recruiter/analytics/page.tsx', dest: 'recruiter/RecruiterAnalyticsPage.tsx' },
  { src: 'recruiter/company/page.tsx', dest: 'recruiter/RecruiterCompanyPage.tsx' },
  { src: 'recruiter/notifications/page.tsx', dest: 'recruiter/RecruiterNotificationsPage.tsx' },
  { src: 'recruiter/settings/page.tsx', dest: 'recruiter/RecruiterSettingsPage.tsx' },
];

function transformPageContent(srcPath: string, content: string): string {
  // 1. Remove 'use client'
  let res = content.replace(/['"]use client['"];?\s*/g, '');

  // 2. Replace next/link with react-router-dom Link
  res = res.replace(/import Link from ['"]next\/link['"];?/g, "import { Link } from 'react-router-dom';");

  // 3. Replace next/navigation with react-router-dom
  res = res.replace(
    /import \{([^}]+)\} from ['"]next\/navigation['"];?/g,
    (match, imports) => {
      const parts = imports.split(',').map((s: string) => s.trim());
      const rrImports: string[] = [];
      parts.forEach((p: string) => {
        if (p === 'useRouter') rrImports.push('useNavigate');
        else if (p === 'usePathname') rrImports.push('useLocation');
        else if (p === 'useParams') rrImports.push('useParams');
        else if (p === 'useSearchParams') rrImports.push('useSearchParams');
      });
      if (rrImports.length === 0) return '';
      return `import { ${rrImports.join(', ')} } from 'react-router-dom';`;
    }
  );

  // 4. Replace useRouter with useNavigate
  res = res.replace(/const router = useRouter\(\);?/g, 'const navigate = useNavigate();');
  res = res.replace(/router\.push\(([^)]+)\)/g, 'navigate($1)');
  res = res.replace(/router\.refresh\(\);?/g, '/* refresh */');

  // 5. Replace href="..." with to="..." on Link components
  res = res.replace(/<Link\s+href=/g, '<Link to=');

  // 6. Fix imports from @/components and @/types
  res = res.replace(/@\/components\/StatusBadge/g, '../../components/StatusBadge.js');
  res = res.replace(/@\/components\/ApplyModal/g, '../../components/ApplyModal.js');
  res = res.replace(/@\/components\/Navbar/g, '../../components/Navbar.js');
  res = res.replace(/@\/components\/Footer/g, '../../components/Footer.js');
  res = res.replace(/@\/components\/DemoSwitcher/g, '../../components/DemoSwitcher.js');
  res = res.replace(/@\/components\//g, '../../components/');
  res = res.replace(/@\/types/g, '../../types/shared.js');

  // 7. Replace direct db imports if present
  res = res.replace(/import\s*\{\s*db\s*\}\s*from\s*['"]@\/lib\/storage\/db['"];?/g, "import api from '../../services/api.js';");

  return res;
}

console.log('Transforming pages...');
for (const item of PAGE_MAPPINGS) {
  const fullSrc = path.join(SRC_APP, item.src);
  const fullDest = path.join(CLIENT_PAGES, item.dest);
  if (!fs.existsSync(fullSrc)) {
    console.warn('Source file missing:', fullSrc);
    continue;
  }
  const raw = fs.readFileSync(fullSrc, 'utf8');
  const transformed = transformPageContent(fullSrc, raw);
  fs.mkdirSync(path.dirname(fullDest), { recursive: true });
  fs.writeFileSync(fullDest, transformed, 'utf8');
  console.log(`Ported ${item.src} -> ${item.dest}`);
}
