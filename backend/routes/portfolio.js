const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create portfolio
router.post('/', authenticateToken, [
  body('title').notEmpty().trim().escape(),
  body('tagline').optional().trim().escape(),
  body('summary').optional().trim().escape(),
  body('phone').optional().trim().escape(),
  body('email').optional().isEmail(),
  body('location').optional().trim().escape(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const portfolioId = uuidv4();
    const slug = `${req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
    const { title, tagline, summary, phone, email, location, linkedin, github, website } = req.body;

    db.prepare(`INSERT INTO portfolios (id, user_id, slug, title, tagline, summary, phone, email, location, linkedin, github, website)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      portfolioId, req.user.id, slug, title, tagline || '', summary || '', phone || '', email || '', location || '', linkedin || '', github || '', website || ''
    );

    // Create QR verification
    const verificationId = uuidv4();
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3020'}/verify/${portfolioId}`;
    const qrCode = await_sync_qr(verifyUrl);

    db.prepare('INSERT INTO verifications (id, portfolio_id, qr_code) VALUES (?, ?, ?)').run(verificationId, portfolioId, qrCode);

    res.status(201).json({ message: 'Portfolio created', portfolio: { id: portfolioId, slug }, qr_code: qrCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create portfolio' });
  }
});

function await_sync_qr(url) {
  let result = '';
  const qr = require('qrcode');
  // Use sync approach with callback wrapper
  return url; // Will be generated async in the actual endpoint
}

// Create portfolio (async version)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const portfolioId = uuidv4();
    const { title, tagline, summary, phone, email, location, linkedin, github, website, skills, education, experience } = req.body;
    const slug = `${(title || 'portfolio').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;

    db.prepare(`INSERT INTO portfolios (id, user_id, slug, title, tagline, summary, phone, email, location, linkedin, github, website)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      portfolioId, req.user.id, slug, title || '', tagline || '', summary || '', phone || '', email || '', location || '', linkedin || '', github || '', website || ''
    );

    // Insert skills
    if (skills && Array.isArray(skills)) {
      const insertSkill = db.prepare('INSERT INTO skills (id, portfolio_id, name, level, category) VALUES (?, ?, ?, ?, ?)');
      for (const skill of skills) {
        insertSkill.run(uuidv4(), portfolioId, skill.name, skill.level || 50, skill.category || 'General');
      }
    }

    // Insert education
    if (education && Array.isArray(education)) {
      const insertEdu = db.prepare('INSERT INTO education (id, portfolio_id, institution, degree, field_of_study, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      for (const edu of education) {
        insertEdu.run(uuidv4(), portfolioId, edu.institution, edu.degree, edu.field_of_study || '', edu.start_date || '', edu.end_date || '', edu.description || '');
      }
    }

    // Insert experience
    if (experience && Array.isArray(experience)) {
      const insertExp = db.prepare('INSERT INTO experience (id, portfolio_id, company, position, start_date, end_date, is_current, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      for (const exp of experience) {
        insertExp.run(uuidv4(), portfolioId, exp.company, exp.position, exp.start_date || '', exp.end_date || '', exp.is_current ? 1 : 0, exp.description || '');
      }
    }

    // Generate QR code
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3020'}/verify/${portfolioId}`;
    const qrCode = await QRCode.toDataURL(verifyUrl, { width: 300, margin: 2 });

    db.prepare('INSERT INTO verifications (id, portfolio_id, qr_code) VALUES (?, ?, ?)').run(uuidv4(), portfolioId, qrCode);

    res.status(201).json({ message: 'Portfolio created', portfolio: { id: portfolioId, slug }, qr_code: qrCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create portfolio' });
  }
});

// Get user's portfolios
router.get('/my', authenticateToken, (req, res) => {
  try {
    const portfolios = db.prepare('SELECT * FROM portfolios WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json({ portfolios });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
});

// Get full portfolio by ID (public)
router.get('/:id', (req, res) => {
  try {
    const portfolio = db.prepare('SELECT * FROM portfolios WHERE id = ? OR slug = ?').get(req.params.id, req.params.id);
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    const skills = db.prepare('SELECT * FROM skills WHERE portfolio_id = ?').all(portfolio.id);
    const education = db.prepare('SELECT * FROM education WHERE portfolio_id = ? ORDER BY start_date DESC').all(portfolio.id);
    const experience = db.prepare('SELECT * FROM experience WHERE portfolio_id = ? ORDER BY start_date DESC').all(portfolio.id);
    const verification = db.prepare('SELECT * FROM verifications WHERE portfolio_id = ?').get(portfolio.id);
    const user = db.prepare('SELECT full_name, email FROM users WHERE id = ?').get(portfolio.user_id);

    res.json({ portfolio: { ...portfolio, owner_name: user?.full_name }, skills, education, experience, verification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Verify portfolio via QR
router.get('/verify/:id', (req, res) => {
  try {
    const portfolio = db.prepare('SELECT * FROM portfolios WHERE id = ?').get(req.params.id);
    if (!portfolio) return res.status(404).json({ verified: false, error: 'Portfolio not found' });

    const user = db.prepare('SELECT full_name, email FROM users WHERE id = ?').get(portfolio.user_id);
    const verification = db.prepare('SELECT * FROM verifications WHERE portfolio_id = ?').get(portfolio.id);

    // Increment verification count
    db.prepare('UPDATE verifications SET verification_count = verification_count + 1, verified_at = CURRENT_TIMESTAMP WHERE portfolio_id = ?').run(portfolio.id);

    res.json({
      verified: true,
      portfolio: {
        title: portfolio.title,
        owner: user?.full_name,
        created_at: portfolio.created_at,
        verification_count: (verification?.verification_count || 0) + 1
      }
    });
  } catch (err) {
    res.status(500).json({ verified: false, error: 'Verification failed' });
  }
});

// Update portfolio
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const portfolio = db.prepare('SELECT * FROM portfolios WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    const { title, tagline, summary, phone, email, location, linkedin, github, website, skills, education, experience } = req.body;

    db.prepare(`UPDATE portfolios SET title=?, tagline=?, summary=?, phone=?, email=?, location=?, linkedin=?, github=?, website=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(
      title || portfolio.title, tagline || '', summary || '', phone || '', email || '', location || '', linkedin || '', github || '', website || '', req.params.id
    );

    // Replace skills
    if (skills) {
      db.prepare('DELETE FROM skills WHERE portfolio_id = ?').run(req.params.id);
      const insertSkill = db.prepare('INSERT INTO skills (id, portfolio_id, name, level, category) VALUES (?, ?, ?, ?, ?)');
      for (const s of skills) insertSkill.run(uuidv4(), req.params.id, s.name, s.level || 50, s.category || 'General');
    }

    // Replace education
    if (education) {
      db.prepare('DELETE FROM education WHERE portfolio_id = ?').run(req.params.id);
      const insertEdu = db.prepare('INSERT INTO education (id, portfolio_id, institution, degree, field_of_study, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      for (const e of education) insertEdu.run(uuidv4(), req.params.id, e.institution, e.degree, e.field_of_study || '', e.start_date || '', e.end_date || '', e.description || '');
    }

    // Replace experience
    if (experience) {
      db.prepare('DELETE FROM experience WHERE portfolio_id = ?').run(req.params.id);
      const insertExp = db.prepare('INSERT INTO experience (id, portfolio_id, company, position, start_date, end_date, is_current, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      for (const e of experience) insertExp.run(uuidv4(), req.params.id, e.company, e.position, e.start_date || '', e.end_date || '', e.is_current ? 1 : 0, e.description || '');
    }

    res.json({ message: 'Portfolio updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update portfolio' });
  }
});

// Delete portfolio
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM portfolios WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Portfolio not found' });
    res.json({ message: 'Portfolio deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete portfolio' });
  }
});

module.exports = router;
