import express from "express";
import { query } from "../db/db.js";

const router = express.Router();

// Get all buy requests
router.get("/", async (req, res) => {
	try {
		const { object_id, status } = req.query;
		let sql = "SELECT * FROM buy";
		const params = [];
		const conditions = [];

		if (object_id) {
			params.push(object_id);
			conditions.push(`object_id = $${params.length}`);
		}
		if (status) {
			params.push(status);
			conditions.push(`status = $${params.length}`);
		}

		if (conditions.length > 0) {
			sql += " WHERE " + conditions.join(" AND ");
		}
		sql += " ORDER BY created_at DESC";

		const result = await query(sql, params);
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching buy:", error);
		res.status(500).json({ error: "Failed to fetch buy" });
	}
});

// Get single buy request
router.get("/:id", async (req, res) => {
	try {
		const result = await query("SELECT * FROM buy WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Buy request not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error fetching buy:", error);
		res.status(500).json({ error: "Failed to fetch buy" });
	}
});

// Create buy request
router.post("/", async (req, res) => {
	try {
		const {
			object_id,
			request_date,
			deadline,
			status,
			contract_number,
			object_name,
			short_address,
			payer,
			what_to_buy,
			creator,
		} = req.body;

		const result = await query(
			`INSERT INTO buy (object_id, request_date, deadline, status, contract_number,
        object_name, short_address, payer, what_to_buy, creator)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
			[
				object_id,
				request_date,
				deadline,
				status,
				contract_number,
				object_name,
				short_address,
				payer,
				what_to_buy,
				creator,
			],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error creating buy:", error);
		res.status(500).json({ error: "Failed to create buy" });
	}
});

// Update buy request
router.put("/:id", async (req, res) => {
	try {
		const {
			object_id,
			request_date,
			deadline,
			status,
			contract_number,
			object_name,
			short_address,
			payer,
			what_to_buy,
			creator,
		} = req.body;

		const result = await query(
			`UPDATE buy SET 
        object_id = $1, request_date = $2, deadline = $3, status = $4,
        contract_number = $5, object_name = $6, short_address = $7, payer = $8,
        what_to_buy = $9, creator = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
			[
				object_id,
				request_date,
				deadline,
				status,
				contract_number,
				object_name,
				short_address,
				payer,
				what_to_buy,
				creator,
				req.params.id,
			],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Buy request not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error updating buy:", error);
		res.status(500).json({ error: "Failed to update buy" });
	}
});

// Delete buy request
router.delete("/:id", async (req, res) => {
	try {
		const result = await query("DELETE FROM buy WHERE id = $1 RETURNING id", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Buy request not found" });
		}
		res.json({ message: "Buy request deleted successfully" });
	} catch (error) {
		console.error("Error deleting buy:", error);
		res.status(500).json({ error: "Failed to delete buy" });
	}
});

export default router;
