import express from "express";
import { query } from "../db/db.js";

const router = express.Router();

// Get all staff
router.get("/", async (req, res) => {
	try {
		const result = await query("SELECT * FROM staff ORDER BY id");
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching staff:", error);
		res.status(500).json({ error: "Failed to fetch staff" });
	}
});

// Get single staff member
router.get("/:id", async (req, res) => {
	try {
		const result = await query("SELECT * FROM staff WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Staff member not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error fetching staff member:", error);
		res.status(500).json({ error: "Failed to fetch staff member" });
	}
});

// Create staff member
router.post("/", async (req, res) => {
	try {
		const { full_name, position, location, phone, email, description, photo } =
			req.body;

		const result = await query(
			`INSERT INTO staff (full_name, position, location, phone, email, description, photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
			[full_name, position, location, phone, email, description, photo],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error creating staff member:", error);
		res.status(500).json({ error: "Failed to create staff member" });
	}
});

// Update staff member
router.put("/:id", async (req, res) => {
	try {
		const { full_name, position, location, phone, email, description, photo } =
			req.body;

		const result = await query(
			`UPDATE staff SET 
        full_name = $1, position = $2, location = $3, phone = $4, email = $5,
        description = $6, photo = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
			[
				full_name,
				position,
				location,
				phone,
				email,
				description,
				photo,
				req.params.id,
			],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Staff member not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error updating staff member:", error);
		res.status(500).json({ error: "Failed to update staff member" });
	}
});

// Delete staff member
router.delete("/:id", async (req, res) => {
	try {
		const result = await query("DELETE FROM staff WHERE id = $1 RETURNING id", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Staff member not found" });
		}
		res.json({ message: "Staff member deleted successfully" });
	} catch (error) {
		console.error("Error deleting staff member:", error);
		res.status(500).json({ error: "Failed to delete staff member" });
	}
});

export default router;
