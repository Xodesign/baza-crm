import express from "express";
import { query } from "../db/db.js";

const router = express.Router();

// Get all activations
router.get("/", async (req, res) => {
	try {
		const { object_id } = req.query;
		let sql = "SELECT * FROM activations";
		const params = [];

		if (object_id) {
			params.push(object_id);
			sql += ` WHERE object_id = $${params.length}`;
		}
		sql += " ORDER BY created_at DESC";

		const result = await query(sql, params);
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching activations:", error);
		res.status(500).json({ error: "Failed to fetch activations" });
	}
});

// Get single activation
router.get("/:id", async (req, res) => {
	try {
		const result = await query("SELECT * FROM activations WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Activation not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error fetching activation:", error);
		res.status(500).json({ error: "Failed to fetch activation" });
	}
});

// Create activation
router.post("/", async (req, res) => {
	try {
		const {
			object_id,
			request_date,
			execution_date,
			engineer,
			request_type,
			object_name,
			short_address,
			system,
			request,
			to_purchase,
			customer_contact,
			creator,
		} = req.body;

		const result = await query(
			`INSERT INTO activations (object_id, request_date, execution_date, engineer,
        request_type, object_name, short_address, system, request, to_purchase,
        customer_contact, creator)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
			[
				object_id,
				request_date,
				execution_date,
				engineer,
				request_type,
				object_name,
				short_address,
				system,
				request,
				to_purchase,
				customer_contact,
				creator,
			],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error creating activation:", error);
		res.status(500).json({ error: "Failed to create activation" });
	}
});

// Update activation
router.put("/:id", async (req, res) => {
	try {
		const {
			object_id,
			request_date,
			execution_date,
			engineer,
			request_type,
			object_name,
			short_address,
			system,
			request,
			to_purchase,
			customer_contact,
			creator,
		} = req.body;

		const result = await query(
			`UPDATE activations SET 
        object_id = $1, request_date = $2, execution_date = $3, engineer = $4,
        request_type = $5, object_name = $6, short_address = $7, system = $8,
        request = $9, to_purchase = $10, customer_contact = $11, creator = $12,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $13 RETURNING *`,
			[
				object_id,
				request_date,
				execution_date,
				engineer,
				request_type,
				object_name,
				short_address,
				system,
				request,
				to_purchase,
				customer_contact,
				creator,
				req.params.id,
			],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Activation not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error updating activation:", error);
		res.status(500).json({ error: "Failed to update activation" });
	}
});

// Delete activation
router.delete("/:id", async (req, res) => {
	try {
		const result = await query(
			"DELETE FROM activations WHERE id = $1 RETURNING id",
			[req.params.id],
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Activation not found" });
		}
		res.json({ message: "Activation deleted successfully" });
	} catch (error) {
		console.error("Error deleting activation:", error);
		res.status(500).json({ error: "Failed to delete activation" });
	}
});

export default router;
