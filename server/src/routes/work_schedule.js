import express from "express";
import { query } from "../db/db.js";

const router = express.Router();

// Get all work schedule entries
router.get("/", async (req, res) => {
	try {
		const { user_id } = req.query;
		let sql = "SELECT * FROM work_schedule";
		const params = [];

		if (user_id) {
			params.push(user_id);
			sql += ` WHERE user_id = $${params.length}`;
		}
		sql += " ORDER BY work_date DESC";

		const result = await query(sql, params);
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching work schedule:", error);
		res.status(500).json({ error: "Failed to fetch work schedule" });
	}
});

// Get single work schedule entry
router.get("/:id", async (req, res) => {
	try {
		const result = await query("SELECT * FROM work_schedule WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Work schedule entry not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error fetching work schedule entry:", error);
		res.status(500).json({ error: "Failed to fetch work schedule entry" });
	}
});

// Create or update work schedule entry
router.post("/", async (req, res) => {
	try {
		const { user_id, work_date, working, start_time, end_time, note } =
			req.body;

		// Check if entry exists for this user and date
		const existing = await query(
			"SELECT id FROM work_schedule WHERE user_id = $1 AND work_date = $2",
			[user_id, work_date],
		);

		let result;
		if (existing.rows.length > 0) {
			// Update existing entry
			result = await query(
				`UPDATE work_schedule SET 
					working = $3, start_time = $4, end_time = $5, note = $6, updated_at = CURRENT_TIMESTAMP
				 WHERE user_id = $1 AND work_date = $2 RETURNING *`,
				[user_id, work_date, working, start_time, end_time, note],
			);
		} else {
			// Create new entry
			result = await query(
				`INSERT INTO work_schedule (user_id, work_date, working, start_time, end_time, note)
				 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
				[user_id, work_date, working, start_time, end_time, note],
			);
		}
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error creating/updating work schedule:", error);
		res.status(500).json({ error: "Failed to create/update work schedule" });
	}
});

// Delete work schedule entry
router.delete("/:id", async (req, res) => {
	try {
		const result = await query(
			"DELETE FROM work_schedule WHERE id = $1 RETURNING id",
			[req.params.id],
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Work schedule entry not found" });
		}
		res.json({ message: "Work schedule entry deleted successfully" });
	} catch (error) {
		console.error("Error deleting work schedule entry:", error);
		res.status(500).json({ error: "Failed to delete work schedule entry" });
	}
});

export default router;
