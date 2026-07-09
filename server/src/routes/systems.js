import express from "express";
import { query } from "../db/db.js";

const router = express.Router();

// Get all systems
router.get("/", async (req, res) => {
	try {
		const { object_id } = req.query;
		let sql = "SELECT * FROM systems";
		const params = [];

		if (object_id) {
			params.push(object_id);
			sql += ` WHERE object_id = $${params.length}`;
		}
		sql += " ORDER BY id";

		const result = await query(sql, params);
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching systems:", error);
		res.status(500).json({ error: "Failed to fetch systems" });
	}
});

// Get single system
router.get("/:id", async (req, res) => {
	try {
		const result = await query("SELECT * FROM systems WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "System not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error fetching system:", error);
		res.status(500).json({ error: "Failed to fetch system" });
	}
});

// Create system
router.post("/", async (req, res) => {
	try {
		const {
			object_id,
			parent_object,
			system_type,
			brand,
			system_kind,
			quantity,
		} = req.body;

		const result = await query(
			`INSERT INTO systems (object_id, parent_object, system_type, brand, system_kind, quantity)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
			[object_id, parent_object, system_type, brand, system_kind, quantity],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error creating system:", error);
		res.status(500).json({ error: "Failed to create system" });
	}
});

// Update system
router.put("/:id", async (req, res) => {
	try {
		const {
			object_id,
			parent_object,
			system_type,
			brand,
			system_kind,
			quantity,
		} = req.body;

		const result = await query(
			`UPDATE systems SET 
        object_id = $1, parent_object = $2, system_type = $3, brand = $4,
        system_kind = $5, quantity = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
			[
				object_id,
				parent_object,
				system_type,
				brand,
				system_kind,
				quantity,
				req.params.id,
			],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "System not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error updating system:", error);
		res.status(500).json({ error: "Failed to update system" });
	}
});

// Delete system
router.delete("/:id", async (req, res) => {
	try {
		const result = await query(
			"DELETE FROM systems WHERE id = $1 RETURNING id",
			[req.params.id],
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "System not found" });
		}
		res.json({ message: "System deleted successfully" });
	} catch (error) {
		console.error("Error deleting system:", error);
		res.status(500).json({ error: "Failed to delete system" });
	}
});

export default router;
