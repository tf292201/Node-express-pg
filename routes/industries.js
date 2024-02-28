const express = require('express');
const slugify = require('slugify');
const ExpressError = require('../expressError');
const db = require('../db');

let router = express.Router();

// Get all industries
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT * FROM industries');
        return res.json({ industries: results.rows });
    } catch (e) {
        return next(e);
    }
});

// Get details of a specific industry
router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query('SELECT * FROM industries WHERE code = $1', [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`No such industry: ${code}`, 404);
        }
        const industry = results.rows[0];
        return res.json({ industry: industry });
    } catch (e) {
        return next(e);
    }
});

// Add a new industry
router.post('/', async (req, res, next) => {
    try {
        const { code, industry } = req.body;
        const results = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *', [code, industry]);
        return res.status(201).json({ industry: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

// Associate an industry with a company
router.post('/associate', async (req, res, next) => {
    try {
        const { companyCode, industryCode } = req.body;
        
        // Check if the industry and company exist
        const industryResult = await db.query('SELECT * FROM industries WHERE code = $1', [industryCode]);
        if (industryResult.rows.length === 0) {
            throw new ExpressError(`Industry not found: ${industryCode}`, 404);
        }

        const companyResult = await db.query('SELECT * FROM companies WHERE code = $1', [companyCode]);
        if (companyResult.rows.length === 0) {
            throw new ExpressError(`Company not found: ${companyCode}`, 404);
        }

        // Check if the association already exists
        const associationResult = await db.query('SELECT * FROM company_industries WHERE company_code = $1 AND industry_code = $2', [companyCode, industryCode]);
        if (associationResult.rows.length > 0) {
            throw new ExpressError(`Industry ${industryCode} is already associated with company ${companyCode}`, 400);
        }

        // Insert the association into the company_industries table
        await db.query('INSERT INTO company_industries (company_code, industry_code) VALUES ($1, $2)', [companyCode, industryCode]);

        return res.status(201).json({ message: `Industry ${industryCode} associated with company ${companyCode} successfully` });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
