import fs from 'fs';
import path from 'path';
const CLIENT_PAGES = path.resolve(process.cwd(), '../client/src/pages');
function wireStudentProfile() {
    const file = path.join(CLIENT_PAGES, 'student/StudentProfilePage.tsx');
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/fetch\('\/api\/auth\/me'\)[\s\S]*?\.finally\(\(\) => setLoading\(false\)\);/m, `api.getStudentProfile().then(res => {
      if (res.profile) setProfile(res.profile);
    }).finally(() => setLoading(false));`);
    content = content.replace(/db\.updateProfile\(profile\.id,[\s\S]*?\}\);/m, `api.updateStudentProfile({ headline, bio, location, education, gpa: Number(gpa) }).then(res => {
      if (res.profile) setProfile(res.profile);
    });`);
    fs.writeFileSync(file, content, 'utf8');
}
function wireStudentPortfolio() {
    const file = path.join(CLIENT_PAGES, 'student/StudentPortfolioPage.tsx');
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/fetch\('\/api\/auth\/me'\)[\s\S]*?\.finally\(\(\) => setLoading\(false\)\);/m, `api.getStudentPortfolio().then(res => {
      if (res.portfolio) {
        setProjects(res.portfolio.projects || []);
        setSkills(res.portfolio.skills || []);
        setDocuments(res.portfolio.documents || []);
      }
    }).finally(() => setLoading(false));`);
    content = content.replace(/const added = db\.addStudentSkill\(\{[\s\S]*?\}\);[\s\S]*?setSkills\(\[\.\.\.skills, added\]\);/m, `api.addStudentSkill({ skill_name: newSkillName, proficiency: newSkillProficiency }).then(res => {
      if (res.skill) setSkills([...skills, res.skill]);
    });`);
    content = content.replace(/const added = db\.addStudentProject\(\{[\s\S]*?\}\);[\s\S]*?setProjects\(\[\.\.\.projects, added\]\);/m, `api.addStudentProject({ title: newProjectTitle, description: newProjectDesc, technologies: newProjectTech.split(',').map(s => s.trim()) }).then(res => {
      if (res.project) setProjects([...projects, res.project]);
    });`);
    fs.writeFileSync(file, content, 'utf8');
}
function wireStudentInterviews() {
    const file = path.join(CLIENT_PAGES, 'student/StudentInterviewsPage.tsx');
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/fetch\('\/api\/auth\/me'\)[\s\S]*?\.finally\(\(\) => setLoading\(false\)\);/m, `api.getInterviews().then(res => {
      if (res.interviews) setInterviews(res.interviews);
    }).finally(() => setLoading(false));`);
    fs.writeFileSync(file, content, 'utf8');
}
function wireNotifications(subPath) {
    const file = path.join(CLIENT_PAGES, subPath);
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/fetch\('\/api\/auth\/me'\)[\s\S]*?\.finally\(\(\) => setLoading\(false\)\);/m, `api.getNotifications().then(res => {
      if (res.notifications) setNotifications(res.notifications);
    }).finally(() => setLoading(false));`);
    content = content.replace(/db\.markNotificationAsRead\(id\);/g, `api.markNotificationAsRead(id);`);
    fs.writeFileSync(file, content, 'utf8');
}
function wireRecruiterDashboard() {
    const file = path.join(CLIENT_PAGES, 'recruiter/RecruiterDashboardPage.tsx');
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/fetch\('\/api\/auth\/me'\)[\s\S]*?\.finally\(\(\) => setLoading\(false\)\);/m, `Promise.all([api.getMe(), api.getInternships(), api.getApplications()]).then(([meRes, intRes, appRes]) => {
      if (meRes.user) {
        setUser(meRes.user);
        setCompany(meRes.company);
      }
      if (intRes.internships) setInternships(intRes.internships);
      if (appRes.applications) setApplications(appRes.applications);
    }).finally(() => setLoading(false));`);
    fs.writeFileSync(file, content, 'utf8');
}
function wireRecruiterPipeline() {
    const file = path.join(CLIENT_PAGES, 'recruiter/RecruiterPipelinePage.tsx');
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/fetch\('\/api\/auth\/me'\)[\s\S]*?\.finally\(\(\) => setLoading\(false\)\);/m, `api.getApplications().then(res => {
      if (res.applications) setApplications(res.applications);
    }).finally(() => setLoading(false));`);
    fs.writeFileSync(file, content, 'utf8');
}
function wireRecruiterApplicants() {
    const file = path.join(CLIENT_PAGES, 'recruiter/RecruiterApplicantsPage.tsx');
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/fetch\('\/api\/auth\/me'\)[\s\S]*?\.finally\(\(\) => setLoading\(false\)\);/m, `api.getApplications().then(res => {
      if (res.applications) setApplications(res.applications);
    }).finally(() => setLoading(false));`);
    fs.writeFileSync(file, content, 'utf8');
}
function wireRecruiterApplicantDetail() {
    const file = path.join(CLIENT_PAGES, 'recruiter/RecruiterApplicantDetailPage.tsx');
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/const app = db\.getApplication\(id\);[\s\S]*?setSkills\(db\.getStudentSkills\(app\.student_id\)\);/m, `api.getApplicationById(id).then(res => {
      if (res.application) {
        setApplication(res.application);
        setStudent(res.application.student);
        setInternship(res.application.internship);
        setSkills(res.application.student?.skills || []);
        setProjects(res.application.student?.projects || []);
      }
    });`);
    fs.writeFileSync(file, content, 'utf8');
}
function wireRecruiterEvaluate() {
    const file = path.join(CLIENT_PAGES, 'recruiter/RecruiterEvaluateApplicantPage.tsx');
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/const app = db\.getApplication\(id\);/g, `const app = null;
    api.getApplicationById(id).then(res => {
      if (res.application) {
        setApplication(res.application);
      }
    });`);
    fs.writeFileSync(file, content, 'utf8');
}
function wireRecruiterCompany() {
    const file = path.join(CLIENT_PAGES, 'recruiter/RecruiterCompanyPage.tsx');
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/db\.companies\.set\(company\.id, updated\);/g, `api.updateCompanyProfile(updated);`);
    fs.writeFileSync(file, content, 'utf8');
}
function wireRecruiterInternships() {
    const file = path.join(CLIENT_PAGES, 'recruiter/RecruiterInternshipsPage.tsx');
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/const list = db\.getInternships\(\{ companyId: data\.company\.id \}\);[\s\S]*?setInternships\(list\);/m, `api.getInternships().then(res => {
      if (res.internships) setInternships(res.internships);
    });`);
    content = content.replace(/db\.getApplications\(\{ internshipId: intern\.id \}\)/g, '[]');
    fs.writeFileSync(file, content, 'utf8');
}
function wireRecruiterEdit() {
    const file = path.join(CLIENT_PAGES, 'recruiter/RecruiterEditInternshipPage.tsx');
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/const intern = db\.getInternship\(id\);/g, `const intern = null;
    api.getInternshipById(id).then(res => {
      if (res.internship) {
        setTitle(res.internship.title);
        setDescription(res.internship.description);
        setLocation(res.internship.location);
        setStipend(res.internship.stipend);
        setWorkMode(res.internship.work_mode);
        setStatus(res.internship.status);
      }
    });`);
    content = content.replace(/db\.updateInternship\(id, \{[\s\S]*?\}\);/m, `api.updateInternship(id, { title, description, location, stipend, work_mode: workMode, status });`);
    fs.writeFileSync(file, content, 'utf8');
}
function wireRecruiterInterviews() {
    const file = path.join(CLIENT_PAGES, 'recruiter/RecruiterInterviewsPage.tsx');
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/const list = db\.getInterviews\(\{ recruiterId: data\.user\.id \}\);[\s\S]*?const apps = db\.getApplications\(\{ companyId: data\.company\.id \}\);[\s\S]*?setApplications\(apps\);/m, `api.getInterviews().then(res => { if (res.interviews) setInterviews(res.interviews); });
     api.getSlots().then(res => { if (res.slots) setSlots(res.slots); });
     api.getApplications().then(res => { if (res.applications) setApplications(res.applications); });`);
    content = content.replace(/const updated = db\.getInterviews\(\);/g, 'const updated = interviews;');
    fs.writeFileSync(file, content, 'utf8');
}
function wireRecruiterAnalytics() {
    const file = path.join(CLIENT_PAGES, 'recruiter/RecruiterAnalyticsPage.tsx');
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/const apps = db\.getApplications\(\{ companyId: data\.company\.id \}\);[\s\S]*?setApplications\(apps\);/m, `api.getApplications().then(res => { if (res.applications) setApplications(res.applications); });`);
    fs.writeFileSync(file, content, 'utf8');
}
wireStudentProfile();
wireStudentPortfolio();
wireStudentInterviews();
wireNotifications('student/StudentNotificationsPage.tsx');
wireNotifications('recruiter/RecruiterNotificationsPage.tsx');
wireRecruiterDashboard();
wireRecruiterPipeline();
wireRecruiterApplicants();
wireRecruiterApplicantDetail();
wireRecruiterEvaluate();
wireRecruiterCompany();
wireRecruiterInternships();
wireRecruiterEdit();
wireRecruiterInterviews();
wireRecruiterAnalytics();
console.log('All pages wired to API!');
