const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require('slugify');

router.get('/:code', async (req, res, next) => {
    try {
        const companyRes = await db.query(
            'SELECT code, name, description FROM companies WHERE code = $1', 
            [req.params.code]
        );

        if (companyRes.rows.length === 0) {
            throw new ExpressError('Company not found', 404);
        }

        const industryRes = await db.query(
            `SELECT industry 
            FROM industries 
            JOIN company_industries 
            ON industries.code = company_industries.industry_code 
            WHERE company_code = $1`,
            [req.params.code]
        );

        const company = companyRes.rows[0];
        const industries = industryRes.rows.map(r => r.industry);
        company.industries = industries;

        return res.json({ company });
    } catch (e) {
        console.error(e);  // This will print the error to the console
        return next(e);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query("SELECT code, name FROM companies");
        return res.json({ companies: result.rows });
    } catch (e) {
        console.error(e);  // This will print the error to the console
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        
        // Slugify the name to generate the code
        const code = slugify(name, { lower: true, strict: true });

        const result = await db.query(
            "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
            [code, name, description]
        );

        return res.status(201).json({ company: result.rows[0] });
    } catch (e) {
        console.error(e); // Print the error to the console
        return next(new ExpressError(e.message, 500));
    }
});



router.post('/company_industries', async (req, res, next) => {
    try {
        const { company_code, industry_code } = req.body;
        
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


router.get('/industries', async (req, res, next) => {
    try {
        const result = await db.query("SELECT code, industry FROM industries");
        return res.json({ industries: result.rows });
    } catch (e) {
        console.error(e);  // This will print the error to the console
        return next(e);
    }
});  // <--- This was missing

module.exports = router;