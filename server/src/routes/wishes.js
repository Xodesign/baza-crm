import express from "express";
import { query } from "../db/db.js";

const router = express.Router();

// Get all wishes
router.get("/", async (req, res) => {
	try {
		const result = await query("SELECT * FROM wishes ORDER BY id");
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching wishes:", error);
		res.status(500).json({ error: "Failed to fetch wishes" });
	}
});

// Create wish
router.post("/", async (req, res) => {
	try {
		const { wish, description } = req.body;

		const result = await query(
			`INSERT INTO wishes (wish, description) VALUES ($1, $2) RETURNING *`,
			[wish, description],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error creating wish:", error);
		res.status(500).json({ error: "Failed to create wish" });
	}
});

// Update wish
router.put("/:id", async (req, res) => {
	try {
		const { wish, description } = req.body;

		const result = await query(
			`UPDATE wishes SET wish = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
			[wish, description, req.params.id],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Wish not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error updating wish:", error);
		res.status(500).json({ error: "Failed to update wish" });
	}
});

// Delete wish
router.delete("/:id", async (req, res) => {
	try {
		const result = await query(
			"DELETE FROM wishes WHERE id = $1 RETURNING id",
			[req.params.id],
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Wish not found" });
		}
		res.json({ message: "Wish deleted successfully" });
	} catch (error) {
		console.error("Error deleting wish:", error);
		res.status(500).json({ error: "Failed to delete wish" });
	}
});

export default router;
