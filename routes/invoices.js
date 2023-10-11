const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

  // PUT /invoices/[id]
  router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;

        // Fetch the current invoice details
        const currentInvoiceRes = await db.query('SELECT paid, paid_date FROM invoices WHERE id=$1', [id]);

        if (currentInvoiceRes.rowCount === 0) {
            throw new ExpressError('Invoice not found', 404);
        }

        const currentInvoice = currentInvoiceRes.rows[0];
        let paidDate = currentInvoice.paid_date;

        if (paid && !currentInvoice.paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null;
        }

        const result = await db.query(
            'UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date',
            [amt, paid, paidDate, id]
        );

        res.json({ invoice: result.rows[0] });
    } catch (e) {
        return next(e);
    }
});


router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT id, comp_code FROM invoices");
    return res.json({ invoices: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get('/:id', async (req, res, next) => {
    try {
      const invResult = await db.query('SELECT id, amt, paid, add_date, paid_date, comp_code FROM invoices WHERE id = $1', [req.params.id]);
      const compResult = await db.query('SELECT code, name, description FROM companies WHERE code = $1', [invResult.rows[0].comp_code]);
  
      if (invResult.rows.length === 0) {
        throw new ExpressError('Invoice not found', 404);
      }
  
      const invoice = invResult.rows[0];
      invoice.company = compResult.rows[0];
  
      return res.json({ invoice });
    } catch (e) {
      return next(e);
    }
  });
  
  // POST /invoices
  router.post('/', async (req, res, next) => {
    try {
      const { comp_code, amt } = req.body;
      const result = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);
      return res.status(201).json({ invoice: result.rows[0] });
    } catch (e) {
      return next(e);
    }
  });
  
  // DELETE /invoices/[id]
  router.delete('/:id', async (req, res, next) => {
    try {
      const result = await db.query('DELETE FROM invoices WHERE id=$1 RETURNING id', [req.params.id]);
      if (result.rows.length === 0) {
        throw new ExpressError('Invoice not found', 404);
      }
      return res.json({ status: 'deleted' });
    } catch (e) {
      return next(e);
    }
  });
  
  module.exports = router;