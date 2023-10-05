const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require('slugify');

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT code, name FROM companies");
    return res.json({ companies: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const result = await db.query("SELECT code, name, description FROM companies WHERE code = $1", [req.params.code]);
    if (result.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }
    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post('/', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        // Use slugify to generate a code based on the company name
        let code = slugify(name, {
            lower: true,
            strict: true
        });
        
        const result = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);

        return res.status(201).json({ company: result.rows[0] });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
