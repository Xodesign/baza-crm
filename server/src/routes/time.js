import express from "express";
import { query } from "../db/db.js";

const router = express.Router();

// Get all time entries
router.get("/", async (req, res) => {
	try {
		const result = await query("SELECT * FROM time_entries ORDER BY id");
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching time entries:", error);
		res.status(500).json({ error: "Failed to fetch time entries" });
	}
});

// Create time entry
router.post("/", async (req, res) => {
	try {
		const {
			customer,
			contractor,
			contract_number,
			full_address,
			short_address,
			object_name,
			tenant,
			systems,
			calculated_yearly_time,
			actual_yearly_time,
			time_difference,
		} = req.body;

		const result = await query(
			`INSERT INTO time_entries (customer, contractor, contract_number, full_address,
        short_address, object_name, tenant, systems, calculated_yearly_time,
        actual_yearly_time, time_difference)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
			[
				customer,
				contractor,
				contract_number,
				full_address,
				short_address,
				object_name,
				tenant,
				systems,
				calculated_yearly_time,
				actual_yearly_time,
				time_difference,
			],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error creating time entry:", error);
		res.status(500).json({ error: "Failed to create time entry" });
	}
});

// Update time entry
router.put("/:id", async (req, res) => {
	try {
		const {
			customer,
			contractor,
			contract_number,
			full_address,
			short_address,
			object_name,
			tenant,
			systems,
			calculated_yearly_time,
			actual_yearly_time,
			time_difference,
		} = req.body;

		const result = await query(
			`UPDATE time_entries SET 
        customer = $1, contractor = $2, contract_number = $3, full_address = $4,
        short_address = $5, object_name = $6, tenant = $7, systems = $8,
        calculated_yearly_time = $9, actual_yearly_time = $10, time_difference = $11,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $12 RETURNING *`,
			[
				customer,
				contractor,
				contract_number,
				full_address,
				short_address,
				object_name,
				tenant,
				systems,
				calculated_yearly_time,
				actual_yearly_time,
				time_difference,
				req.params.id,
			],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Time entry not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error updating time entry:", error);
		res.status(500).json({ error: "Failed to update time entry" });
	}
});

// Delete time entry
router.delete("/:id", async (req, res) => {
	try {
		const result = await query(
			"DELETE FROM time_entries WHERE id = $1 RETURNING id",
			[req.params.id],
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Time entry not found" });
		}
		res.json({ message: "Time entry deleted successfully" });
	} catch (error) {
		console.error("Error deleting time entry:", error);
		res.status(500).json({ error: "Failed to delete time entry" });
	}
});

export default router;
