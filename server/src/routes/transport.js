import express from "express";
import { query } from "../db/db.js";

const router = express.Router();

// Get all transport requests
router.get("/", async (req, res) => {
	try {
		const result = await query(
			"SELECT * FROM transport ORDER BY created_at DESC",
		);
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching transport:", error);
		res.status(500).json({ error: "Failed to fetch transport" });
	}
});

// Get single transport request
router.get("/:id", async (req, res) => {
	try {
		const result = await query("SELECT * FROM transport WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Transport not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error fetching transport:", error);
		res.status(500).json({ error: "Failed to fetch transport" });
	}
});

// Create transport request
router.post("/", async (req, res) => {
	try {
		const {
			request_date,
			deadline,
			assigned_date,
			assigned_to,
			purchase_status,
			call_status,
			status,
			object_name,
			short_address,
			what_to_transport,
			tools_list,
			creator,
		} = req.body;

		const result = await query(
			`INSERT INTO transport (request_date, deadline, assigned_date, assigned_to,
        purchase_status, call_status, status, object_name, short_address,
        what_to_transport, tools_list, creator)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
			[
				request_date,
				deadline,
				assigned_date,
				assigned_to,
				purchase_status,
				call_status,
				status || "new",
				object_name,
				short_address,
				what_to_transport,
				tools_list,
				creator,
			],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error creating transport:", error);
		res.status(500).json({ error: "Failed to create transport" });
	}
});

// Update transport request
router.put("/:id", async (req, res) => {
	try {
		const {
			request_date,
			deadline,
			assigned_date,
			assigned_to,
			purchase_status,
			call_status,
			status,
			object_name,
			short_address,
			what_to_transport,
			tools_list,
			creator,
		} = req.body;

		const result = await query(
			`UPDATE transport SET 
        request_date = $1, deadline = $2, assigned_date = $3, assigned_to = $4,
        purchase_status = $5, call_status = $6, status = $7, object_name = $8,
        short_address = $9, what_to_transport = $10, tools_list = $11, creator = $12,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $13 RETURNING *`,
			[
				request_date,
				deadline,
				assigned_date,
				assigned_to,
				purchase_status,
				call_status,
				status,
				object_name,
				short_address,
				what_to_transport,
				tools_list,
				creator,
				req.params.id,
			],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Transport not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error updating transport:", error);
		res.status(500).json({ error: "Failed to update transport" });
	}
});

// Delete transport request
router.delete("/:id", async (req, res) => {
	try {
		const result = await query(
			"DELETE FROM transport WHERE id = $1 RETURNING id",
			[req.params.id],
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Transport not found" });
		}
		res.json({ message: "Transport deleted successfully" });
	} catch (error) {
		console.error("Error deleting transport:", error);
		res.status(500).json({ error: "Failed to delete transport" });
	}
});

export default router;
