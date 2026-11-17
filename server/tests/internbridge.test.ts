import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { seedDatabase } from '../src/scripts/seed.js';
import { Application, InterviewSlot } from '../src/models/index.js';
import { HunterAgent } from '../src/services/agents/hunter-agent.js';
import { GuardAgent } from '../src/services/agents/guard-agent.js';

describe('InternBridge MERN Platform & AI Agent Verification', () => {
  const studentPriyaId = 's1000000-0000-0000-0000-000000000001';
  const studentRohanId = 's2000000-0000-0000-0000-000000000002';
  const studentAnanyaId = 's3000000-0000-0000-0000-000000000003';
  const recruiterAlexId = 'r1000000-0000-0000-0000-000000000001';
  const companyAetherId = 'c1000000-0000-0000-0000-000000000001';

  const internshipIdA = 'i2000000-0000-0000-0000-000000000002'; // Cloud Infrastructure
  const internshipIdB = 'i3000000-0000-0000-0000-000000000003'; // Product Design
  const aiResearchInternshipId = 'i1000000-0000-0000-0000-000000000001'; // Minimum GPA 8.5

  beforeAll(async () => {
    await connectDatabase();
    await seedDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('1. Non-Negotiable Business Rule: One Application Per Internship', () => {
    it('allows a student to submit their first application to an internship', async () => {
      // Clean up any existing app for Priya & internshipIdA
      await Application.deleteMany({ student_id: studentPriyaId, internship_id: internshipIdA });

      const res = await request(app)
        .post('/api/v1/applications/apply')
        .set('x-demo-user-id', studentPriyaId)
        .send({
          internship_id: internshipIdA,
          cover_letter: 'I have deep expertise in Docker and Kubernetes clusters.',
          screening_answers: { reason: 'Passionate about cloud infrastructure' },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.application).toBeDefined();
      expect(res.body.application.student_id).toBe(studentPriyaId);
      expect(res.body.application.internship_id).toBe(internshipIdA);
    });

    it('strictly REJECTS a duplicate application for the same student-internship pair with HTTP 409', async () => {
      const res = await request(app)
        .post('/api/v1/applications/apply')
        .set('x-demo-user-id', studentPriyaId)
        .send({
          internship_id: internshipIdA,
          cover_letter: 'Attempting duplicate application submission.',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('DUPLICATE_APPLICATION');
      expect(res.body.error).toContain('cannot apply to the same internship more than once');
    });

    it('allows the same student to apply to a DIFFERENT internship', async () => {
      await Application.deleteMany({ student_id: studentPriyaId, internship_id: internshipIdB });

      const res = await request(app)
        .post('/api/v1/applications/apply')
        .set('x-demo-user-id', studentPriyaId)
        .send({
          internship_id: internshipIdB,
          cover_letter: 'Applying to a distinct opportunity.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.application.internship_id).toBe(internshipIdB);
    });

    it('allows two DIFFERENT students to apply to the SAME internship', async () => {
      const studentBobId = 's-test-bob-' + Date.now();
      const { User, StudentDocument } = await import('../src/models/index.js');
      await User.create({
        _id: studentBobId,
        email: `bob-${Date.now()}@example.com`,
        full_name: 'Bob Test Candidate',
        role: 'student',
        graduation_year: 2026,
        degree: 'B.Tech',
        gpa: 8.8,
      });
      await StudentDocument.create({
        _id: 'doc-bob-' + Date.now(),
        student_id: studentBobId,
        doc_type: 'resume',
        title: 'Bob Resume',
        file_name: 'bob-resume.pdf',
        file_url: 'https://example.com/bob.pdf',
        file_path: '/uploads/bob.pdf',
        is_primary: true,
      });

      const res = await request(app)
        .post('/api/v1/applications/apply')
        .set('x-demo-user-id', studentBobId)
        .send({
          internship_id: internshipIdA,
          cover_letter: 'Bob applying to Cloud Infrastructure.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.application.student_id).toBe(studentBobId);
    });
  });

  describe('2. Agent 1: Autonomous Internship Hunter & Deterministic Matching', () => {
    it('calculates weighted compatibility score and surfaces matching vs missing skills', async () => {
      const recommendations = await HunterAgent.findMatchesForStudent(studentPriyaId, 3);

      expect(recommendations.length).toBeGreaterThan(0);
      const topMatch = recommendations[0];
      expect(topMatch.matchAnalysis).toBeDefined();
      expect(topMatch.matchAnalysis.compatibility_score).toBeGreaterThan(0);
      expect(topMatch.matchAnalysis.matching_skills).toBeInstanceOf(Array);
      expect(topMatch.matchAnalysis.missing_skills).toBeInstanceOf(Array);
      expect(topMatch.matchAnalysis.breakdown).toBeDefined();
      expect(topMatch.matchAnalysis.breakdown.required_skills_pct).toBeGreaterThan(0);
    });
  });

  describe('3. Agent 4: Eligibility & Integrity Guard', () => {
    it('blocks applications that fail the minimum GPA requirement', async () => {
      const guardCheck = await GuardAgent.evaluateEligibility({
        studentId: studentRohanId, // Rohan GPA is 7.8
        internshipId: aiResearchInternshipId, // Minimum GPA is 8.5
      });

      expect(guardCheck.passed).toBe(false);
      expect(guardCheck.failureReasons.length).toBeGreaterThan(0);
    });

    it('blocks applications when the deadline has expired', async () => {
      const expiredInternshipId = 'expired-test-internship';

      const check = await GuardAgent.evaluateEligibility({
        studentId: studentPriyaId,
        internshipId: expiredInternshipId,
      });

      expect(check.passed).toBe(false);
      expect(check.failureReasons.length).toBeGreaterThan(0);
    });
  });

  describe('4. Application Status Lifecycle & History Audit', () => {
    it('updates application status and appends immutable history audit event', async () => {
      const appDoc = await Application.findOne({ student_id: studentPriyaId, internship_id: internshipIdA });
      expect(appDoc).toBeDefined();

      const res = await request(app)
        .patch(`/api/v1/applications/${appDoc!._id}/status`)
        .set('x-demo-user-id', recruiterAlexId)
        .send({
          status: 'shortlisted',
          note: 'Impressive systems architecture portfolio. Shortlisted for technical round.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.application.status).toBe('shortlisted');

      // Verify detailed fetch contains history
      const detailRes = await request(app)
        .get(`/api/v1/applications/${appDoc!._id}`)
        .set('x-demo-user-id', recruiterAlexId);

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.application.history.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('5. Interview Scheduling & Conflict Prevention', () => {
    it('schedules an interview and atomically locks the slot', async () => {
      const appDoc = await Application.findOne({ student_id: studentPriyaId, internship_id: internshipIdA });
      expect(appDoc).toBeDefined();

      // Create an open slot
      const slotId = 'slot-test-' + Date.now();
      await InterviewSlot.create({
        _id: slotId,
        recruiter_id: recruiterAlexId,
        company_id: companyAetherId,
        start_time: new Date(Date.now() + 48 * 3600 * 1000),
        end_time: new Date(Date.now() + 49 * 3600 * 1000),
        is_booked: false,
      });

      const res = await request(app)
        .post('/api/v1/interviews/schedule')
        .set('x-demo-user-id', recruiterAlexId)
        .send({
          application_id: appDoc!._id,
          slot_id: slotId,
          interview_type: 'technical',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.interview).toBeDefined();

      // Check slot is now atomically locked
      const updatedSlot = await InterviewSlot.findById(slotId);
      expect(updatedSlot?.is_booked).toBe(true);

      // Attempting to book the same slot again should fail with 409
      const conflictRes = await request(app)
        .post('/api/v1/interviews/schedule')
        .set('x-demo-user-id', recruiterAlexId)
        .send({
          application_id: appDoc!._id,
          slot_id: slotId,
        });

      expect(conflictRes.status).toBe(409);
      expect(conflictRes.body.error).toContain('already booked');
    });
  });
});
