import express from "express";
import { query } from "../db/db.js";

const router = express.Router();

// Get all objects
router.get("/", async (req, res) => {
	try {
		const result = await query("SELECT * FROM objects ORDER BY id");
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching objects:", error);
		res.status(500).json({ error: "Failed to fetch objects" });
	}
});

// Get single object
router.get("/:id", async (req, res) => {
	try {
		const result = await query("SELECT * FROM objects WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Object not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error fetching object:", error);
		res.status(500).json({ error: "Failed to fetch object" });
	}
});

// Create object
router.post("/", async (req, res) => {
	try {
		const {
			object_number,
			customer,
			contractor,
			contract_number,
			contract_start_date,
			contract_end_date,
			contract_type,
			renewability,
			price_increase_letter_date,
			price_increase_percent,
			additional_agreement,
			letters,
			repair_payer,
			additional_works_payment,
			advance_payment,
			full_address,
			short_address,
			object_name,
			rd_id_pd,
			tenant,
			systems,
			estimated_time,
			contacts,
			has_tool,
			notes,
		} = req.body;

		const result = await query(
			`INSERT INTO objects (object_number, customer, contractor, contract_number, 
        contract_start_date, contract_end_date, contract_type, renewability,
        price_increase_letter_date, price_increase_percent, additional_agreement,
        letters, repair_payer, additional_works_payment, advance_payment,
        full_address, short_address, object_name, rd_id_pd, tenant, systems,
        estimated_time, contacts, has_tool, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
       RETURNING *`,
			[
				object_number,
				customer,
				contractor,
				contract_number,
				contract_start_date,
				contract_end_date,
				contract_type,
				renewability,
				price_increase_letter_date,
				price_increase_percent,
				additional_agreement,
				letters,
				repair_payer,
				additional_works_payment,
				advance_payment,
				full_address,
				short_address,
				object_name,
				rd_id_pd,
				tenant,
				systems,
				estimated_time,
				contacts,
				has_tool,
				notes,
			],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error creating object:", error);
		res.status(500).json({ error: "Failed to create object" });
	}
});

// Update object
router.put("/:id", async (req, res) => {
	try {
		const {
			object_number,
			customer,
			contractor,
			contract_number,
			contract_start_date,
			contract_end_date,
			contract_type,
			renewability,
			price_increase_letter_date,
			price_increase_percent,
			additional_agreement,
			letters,
			repair_payer,
			additional_works_payment,
			advance_payment,
			full_address,
			short_address,
			object_name,
			rd_id_pd,
			tenant,
			systems,
			estimated_time,
			contacts,
			has_tool,
			notes,
		} = req.body;

		const result = await query(
			`UPDATE objects SET 
        object_number = $1, customer = $2, contractor = $3, contract_number = $4,
        contract_start_date = $5, contract_end_date = $6, contract_type = $7,
        renewability = $8, price_increase_letter_date = $9, price_increase_percent = $10,
        additional_agreement = $11, letters = $12, repair_payer = $13,
        additional_works_payment = $14, advance_payment = $15, full_address = $16,
        short_address = $17, object_name = $18, rd_id_pd = $19, tenant = $20,
        systems = $21, estimated_time = $22, contacts = $23, has_tool = $24,
        notes = $25, updated_at = CURRENT_TIMESTAMP
       WHERE id = $26 RETURNING *`,
			[
				object_number,
				customer,
				contractor,
				contract_number,
				contract_start_date,
				contract_end_date,
				contract_type,
				renewability,
				price_increase_letter_date,
				price_increase_percent,
				additional_agreement,
				letters,
				repair_payer,
				additional_works_payment,
				advance_payment,
				full_address,
				short_address,
				object_name,
				rd_id_pd,
				tenant,
				systems,
				estimated_time,
				contacts,
				has_tool,
				notes,
				req.params.id,
			],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Object not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error updating object:", error);
		res.status(500).json({ error: "Failed to update object" });
	}
});

// Delete object
router.delete("/:id", async (req, res) => {
	try {
		const result = await query(
			"DELETE FROM objects WHERE id = $1 RETURNING id",
			[req.params.id],
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Object not found" });
		}
		res.json({ message: "Object deleted successfully" });
	} catch (error) {
		console.error("Error deleting object:", error);
		res.status(500).json({ error: "Failed to delete object" });
	}
});

export default router;
