const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require('slugify');

const router = express.Router();

// General routes (those without specific path parameters):

router.post('/', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const code = slugify(name, { lower: true, strict: true });
        const result = await db.query(
            "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
            [code, name, description]
        );
        return res.status(201).json({ company: result.rows[0] });
    } catch (e) {
        console.error(e);
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
        console.error(e);
        return next(e);
    }
});

// Specific routes with path parameters:

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query("SELECT code, name FROM companies");
        return res.json({ companies: result.rows });
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        
        // Check if the company exists
        const companyRes = await db.query('SELECT code, name, description FROM companies WHERE code = $1', [code]);
        
        // If no company is found, send a 404 response
        if (companyRes.rowCount === 0) {
            return next(new ExpressError('Company not found', 404));
        }

        // Fetch the associated invoices for the company
        const invoiceRes = await db.query(
            `SELECT id, amt, paid, add_date, paid_date 
            FROM invoices
            WHERE comp_code = $1`,
            [code]
        );

        // Fetch the associated industries for the company
        const industryRes = await db.query(
            `SELECT industry 
            FROM industries 
            JOIN company_industries ON industries.code = company_industries.industry_code 
            WHERE company_code = $1`,
            [code]
        );

        const company = companyRes.rows[0];
        company.invoices = invoiceRes.rows;
        company.industries = industryRes.rows.map(r => r.industry);
        
        return res.json({ company });

    } catch (e) {
        return next(e);
    }
});


router.put('/:code', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const result = await db.query(
            "UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description",
            [name, description, req.params.code]
        );
        if (result.rows.length === 0) {
            throw new ExpressError("Company not found", 404);
        }
        return res.json({ company: result.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        const result = await db.query(
            "DELETE FROM companies WHERE code=$1 RETURNING code",
            [req.params.code]
        );
        if (result.rows.length === 0) {
            throw new ExpressError("Company not found", 404);
        }
        return res.json({ status: 'deleted' });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
