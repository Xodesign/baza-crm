import express from "express";
import { query } from "../db/db.js";

const router = express.Router();

// Get all invoices
router.get("/", async (req, res) => {
	try {
		const result = await query(
			"SELECT * FROM invoices ORDER BY created_at DESC",
		);
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching invoices:", error);
		res.status(500).json({ error: "Failed to fetch invoices" });
	}
});

// Get single invoice
router.get("/:id", async (req, res) => {
	try {
		const result = await query("SELECT * FROM invoices WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Invoice not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error fetching invoice:", error);
		res.status(500).json({ error: "Failed to fetch invoice" });
	}
});

// Create invoice
router.post("/", async (req, res) => {
	try {
		const {
			request_date,
			contract_number,
			object_name,
			short_address,
			payer,
			what_to_buy,
			creator,
			confirmed,
		} = req.body;

		const result = await query(
			`INSERT INTO invoices (request_date, contract_number, object_name, short_address,
        payer, what_to_buy, creator, confirmed)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
			[
				request_date,
				contract_number,
				object_name,
				short_address,
				payer,
				what_to_buy,
				creator,
				confirmed,
			],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error creating invoice:", error);
		res.status(500).json({ error: "Failed to create invoice" });
	}
});

// Update invoice
router.put("/:id", async (req, res) => {
	try {
		const {
			request_date,
			contract_number,
			object_name,
			short_address,
			payer,
			what_to_buy,
			creator,
			confirmed,
		} = req.body;

		const result = await query(
			`UPDATE invoices SET 
        request_date = $1, contract_number = $2, object_name = $3, short_address = $4,
        payer = $5, what_to_buy = $6, creator = $7, confirmed = $8,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
			[
				request_date,
				contract_number,
				object_name,
				short_address,
				payer,
				what_to_buy,
				creator,
				confirmed,
				req.params.id,
			],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Invoice not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error updating invoice:", error);
		res.status(500).json({ error: "Failed to update invoice" });
	}
});

// Delete invoice
router.delete("/:id", async (req, res) => {
	try {
		const result = await query(
			"DELETE FROM invoices WHERE id = $1 RETURNING id",
			[req.params.id],
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Invoice not found" });
		}
		res.json({ message: "Invoice deleted successfully" });
	} catch (error) {
		console.error("Error deleting invoice:", error);
		res.status(500).json({ error: "Failed to delete invoice" });
	}
});

export default router;
