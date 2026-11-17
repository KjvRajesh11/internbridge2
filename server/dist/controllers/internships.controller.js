import { Internship, Company, Application, CompanyMember } from '../models/index.js';
export async function getInternships(req, res) {
    try {
        const { status, search, workMode, companyId, limit } = req.query;
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }
        else if (!status) {
            filter.status = 'published';
        }
        if (workMode && workMode !== 'all') {
            filter.work_mode = workMode;
        }
        if (companyId) {
            filter.company_id = companyId;
        }
        if (search && typeof search === 'string' && search.trim().length > 0) {
            const q = search.trim();
            filter.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { required_skills: { $in: [new RegExp(q, 'i')] } },
            ];
        }
        let query = Internship.find(filter).sort({ created_at: -1 });
        if (limit) {
            query = query.limit(parseInt(limit, 10));
        }
        const internships = await query.exec();
        const companies = await Company.find({ _id: { $in: internships.map((i) => i.company_id) } });
        const companyMap = new Map(companies.map((c) => [c.id, c.toJSON()]));
        const result = internships.map((i) => {
            const json = i.toJSON();
            return {
                ...json,
                company: companyMap.get(i.company_id),
            };
        });
        return res.json({
            success: true,
            internships: result,
            count: result.length,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
export async function getInternshipById(req, res) {
    try {
        const { id } = req.params;
        const internship = await Internship.findById(id);
        if (!internship) {
            return res.status(404).json({ success: false, error: 'Internship listing not found' });
        }
        const company = await Company.findById(internship.company_id);
        let hasApplied = false;
        if (req.user && req.user.role === 'student') {
            const existing = await Application.findOne({
                student_id: req.user.id,
                internship_id: id,
            });
            hasApplied = Boolean(existing);
        }
        return res.json({
            success: true,
            internship: {
                ...internship.toJSON(),
                company: company ? company.toJSON() : null,
            },
            hasApplied,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
export async function createInternship(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        let companyId = req.body.company_id;
        if (!companyId) {
            const membership = await CompanyMember.findOne({ user_id: user.id });
            companyId = membership?.company_id;
        }
        if (!companyId) {
            return res.status(400).json({
                success: false,
                error: 'Recruiter is not associated with any verified company workspace.',
            });
        }
        const { title, description, responsibilities, required_skills, preferred_skills, minimum_gpa, accepted_graduation_years, location, work_mode, duration, stipend, application_deadline, status, openings_count, } = req.body;
        if (!title || !description || !location || !stipend) {
            return res.status(400).json({
                success: false,
                error: 'Title, description, location, and stipend are required.',
            });
        }
        const id = 'i-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        const internship = await Internship.create({
            _id: id,
            company_id: companyId,
            created_by: user.id,
            title: title.trim(),
            description: description.trim(),
            responsibilities: responsibilities || '',
            required_skills: Array.isArray(required_skills)
                ? required_skills
                : typeof required_skills === 'string'
                    ? required_skills.split(',').map((s) => s.trim())
                    : [],
            preferred_skills: Array.isArray(preferred_skills)
                ? preferred_skills
                : typeof preferred_skills === 'string'
                    ? preferred_skills.split(',').map((s) => s.trim())
                    : [],
            eligibility_rules: req.body.eligibility_rules || {},
            minimum_gpa: minimum_gpa ? Number(minimum_gpa) : 0,
            accepted_graduation_years: accepted_graduation_years || [],
            location: location.trim(),
            work_mode: work_mode || 'hybrid',
            duration: duration || '3 Months',
            stipend: stipend.trim(),
            application_deadline: application_deadline ? new Date(application_deadline) : new Date(Date.now() + 30 * 86400000),
            status: status || 'published',
            openings_count: openings_count ? Number(openings_count) : 1,
        });
        return res.status(201).json({
            success: true,
            internship: internship.toJSON(),
            message: 'Internship posting published successfully.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
export async function updateInternship(req, res) {
    try {
        const { id } = req.params;
        const internship = await Internship.findById(id);
        if (!internship) {
            return res.status(404).json({ success: false, error: 'Internship not found' });
        }
        Object.assign(internship, req.body);
        await internship.save();
        return res.json({
            success: true,
            internship: internship.toJSON(),
            message: 'Internship listing updated.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
export async function deleteInternship(req, res) {
    try {
        const { id } = req.params;
        const internship = await Internship.findById(id);
        if (!internship) {
            return res.status(404).json({ success: false, error: 'Internship not found' });
        }
        internship.status = 'archived';
        await internship.save();
        return res.json({ success: true, message: 'Internship archived successfully.' });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
