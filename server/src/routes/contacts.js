import express from "express";
import { query } from "../db/db.js";

const router = express.Router();

// Get all contacts
router.get("/", async (req, res) => {
	try {
		const { object_id } = req.query;
		let sql = "SELECT * FROM contacts";
		const params = [];

		if (object_id) {
			params.push(object_id);
			sql += ` WHERE object_id = $${params.length}`;
		}
		sql += " ORDER BY name";

		const result = await query(sql, params);
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching contacts:", error);
		res.status(500).json({ error: "Failed to fetch contacts" });
	}
});

// Get single contact
router.get("/:id", async (req, res) => {
	try {
		const result = await query("SELECT * FROM contacts WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Contact not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error fetching contact:", error);
		res.status(500).json({ error: "Failed to fetch contact" });
	}
});

// Create contact
router.post("/", async (req, res) => {
	try {
		const { name, phone, object_name, short_address, source, object_id } =
			req.body;

		const result = await query(
			`INSERT INTO contacts (name, phone, object_name, short_address, source, object_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
			[name, phone, object_name, short_address, source || "manual", object_id],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error creating contact:", error);
		res.status(500).json({ error: "Failed to create contact" });
	}
});

// Update contact
router.put("/:id", async (req, res) => {
	try {
		const { name, phone, object_name, short_address, source, object_id } =
			req.body;

		const result = await query(
			`UPDATE contacts SET 
        name = $1, phone = $2, object_name = $3, short_address = $4,
        source = $5, object_id = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
			[
				name,
				phone,
				object_name,
				short_address,
				source,
				object_id,
				req.params.id,
			],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Contact not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error updating contact:", error);
		res.status(500).json({ error: "Failed to update contact" });
	}
});

// Delete contact
router.delete("/:id", async (req, res) => {
	try {
		const result = await query(
			"DELETE FROM contacts WHERE id = $1 RETURNING id",
			[req.params.id],
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Contact not found" });
		}
		res.json({ message: "Contact deleted successfully" });
	} catch (error) {
		console.error("Error deleting contact:", error);
		res.status(500).json({ error: "Failed to delete contact" });
	}
});

export default router;
