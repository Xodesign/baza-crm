import express from "express";
import { query } from "../db/db.js";

const router = express.Router();

// Get all costs
router.get("/", async (req, res) => {
	try {
		const { object_id } = req.query;
		let sql = "SELECT * FROM costs";
		const params = [];

		if (object_id) {
			params.push(object_id);
			sql += ` WHERE object_id = $${params.length}`;
		}
		sql += " ORDER BY created_at DESC";

		const result = await query(sql, params);
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching costs:", error);
		res.status(500).json({ error: "Failed to fetch costs" });
	}
});

// Get single cost
router.get("/:id", async (req, res) => {
	try {
		const result = await query("SELECT * FROM costs WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Cost not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error fetching cost:", error);
		res.status(500).json({ error: "Failed to fetch cost" });
	}
});

// Create cost
router.post("/", async (req, res) => {
	try {
		const {
			object_id,
			object_name,
			short_address,
			system,
			employee,
			amount,
			reason,
			description,
			receipt_photo,
			comment,
		} = req.body;

		const result = await query(
			`INSERT INTO costs (object_id, object_name, short_address, system, employee,
        amount, reason, description, receipt_photo, comment)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
			[
				object_id,
				object_name,
				short_address,
				system,
				employee,
				amount,
				reason,
				description,
				receipt_photo,
				comment,
			],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error creating cost:", error);
		res.status(500).json({ error: "Failed to create cost" });
	}
});

// Update cost
router.put("/:id", async (req, res) => {
	try {
		const {
			object_id,
			object_name,
			short_address,
			system,
			employee,
			amount,
			reason,
			description,
			receipt_photo,
			comment,
		} = req.body;

		const result = await query(
			`UPDATE costs SET 
        object_id = $1, object_name = $2, short_address = $3, system = $4,
        employee = $5, amount = $6, reason = $7, description = $8,
        receipt_photo = $9, comment = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
			[
				object_id,
				object_name,
				short_address,
				system,
				employee,
				amount,
				reason,
				description,
				receipt_photo,
				comment,
				req.params.id,
			],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Cost not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error updating cost:", error);
		res.status(500).json({ error: "Failed to update cost" });
	}
});

// Delete cost
router.delete("/:id", async (req, res) => {
	try {
		const result = await query("DELETE FROM costs WHERE id = $1 RETURNING id", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Cost not found" });
		}
		res.json({ message: "Cost deleted successfully" });
	} catch (error) {
		console.error("Error deleting cost:", error);
		res.status(500).json({ error: "Failed to delete cost" });
	}
});

export default router;
