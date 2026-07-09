import express from "express";
import { query } from "../db/db.js";

const router = express.Router();

// Get all tools
router.get("/", async (req, res) => {
	try {
		const { object_id } = req.query;
		let sql = "SELECT * FROM tools";
		const params = [];

		if (object_id) {
			params.push(object_id);
			sql += ` WHERE object_id = $${params.length}`;
		}
		sql += " ORDER BY id";

		const result = await query(sql, params);
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching tools:", error);
		res.status(500).json({ error: "Failed to fetch tools" });
	}
});

// Get single tool
router.get("/:id", async (req, res) => {
	try {
		const result = await query("SELECT * FROM tools WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Tool not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error fetching tool:", error);
		res.status(500).json({ error: "Failed to fetch tool" });
	}
});

// Create tool
router.post("/", async (req, res) => {
	try {
		const {
			object_id,
			tool,
			inventory_number,
			brand,
			object_name,
			short_address,
			arrival_date,
			call_status,
			transport_request,
			target_address,
		} = req.body;

		const result = await query(
			`INSERT INTO tools (object_id, tool, inventory_number, brand, object_name,
        short_address, arrival_date, call_status, transport_request, target_address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
			[
				object_id,
				tool,
				inventory_number,
				brand,
				object_name,
				short_address,
				arrival_date,
				call_status,
				transport_request,
				target_address,
			],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error creating tool:", error);
		res.status(500).json({ error: "Failed to create tool" });
	}
});

// Update tool
router.put("/:id", async (req, res) => {
	try {
		const {
			object_id,
			tool,
			inventory_number,
			brand,
			object_name,
			short_address,
			arrival_date,
			call_status,
			transport_request,
			target_address,
		} = req.body;

		const result = await query(
			`UPDATE tools SET 
        object_id = $1, tool = $2, inventory_number = $3, brand = $4,
        object_name = $5, short_address = $6, arrival_date = $7, call_status = $8,
        transport_request = $9, target_address = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
			[
				object_id,
				tool,
				inventory_number,
				brand,
				object_name,
				short_address,
				arrival_date,
				call_status,
				transport_request,
				target_address,
				req.params.id,
			],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Tool not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error updating tool:", error);
		res.status(500).json({ error: "Failed to update tool" });
	}
});

// Delete tool
router.delete("/:id", async (req, res) => {
	try {
		const result = await query("DELETE FROM tools WHERE id = $1 RETURNING id", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Tool not found" });
		}
		res.json({ message: "Tool deleted successfully" });
	} catch (error) {
		console.error("Error deleting tool:", error);
		res.status(500).json({ error: "Failed to delete tool" });
	}
});

export default router;
