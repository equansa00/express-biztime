const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

// GET route to retrieve all industries
router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(`SELECT * FROM industries`);
        return res.json({ industries: result.rows });
    } catch (e) {
        console.error(e);  // This will print the error to the console
        return next(e);
    }
});

// POST route to create a new industry
router.post('/company_industries', async (req, res, next) => {
    try {
        const { company_code, industry_code } = req.body;

        // Check if the company exists
        const existingCompany = await db.query(`SELECT * FROM companies WHERE code=$1`, [company_code]);
        if(existingCompany.rows.length === 0) {
            throw new ExpressError('Company not found', 404);
        }

        // Check if the industry exists
        const existingIndustry = await db.query(`SELECT * FROM industries WHERE code=$1`, [industry_code]);
        if(existingIndustry.rows.length === 0) {
            throw new ExpressError('Industry not found', 404);
        }

        // Proceed with the association
        await db.query(
            "INSERT INTO company_industries (company_code, industry_code) VALUES ($1, $2)",
            [company_code, industry_code]
        );

        return res.json({ message: "Associated!" });
    } catch (e) {
        console.error(e);  // This will print the error to the console
        return next(e);
    }
});

// POST route to create a new industry
router.post('/', async (req, res, next) => {
    try {
        const { code, industry } = req.body;

        // Check if industry with the given code already exists
        const existingIndustry = await db.query(`SELECT * FROM industries WHERE code=$1`, [code]);
        if (existingIndustry.rows.length > 0) {
            throw new ExpressError('Industry code already exists', 400);
        }

        const result = await db.query(
            "INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry",
            [code, industry]
        );

        return res.status(201).json({ industry: result.rows[0] });
    } catch (e) {
        console.error(e);  // This will print the error to the console
        return next(e);
    }
});


module.exports = router;
