import express from "express";
import pool from "../db/db.js";

const router = express.Router();

// Get all sections
router.get("/", async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT * FROM sections WHERE is_active = true ORDER BY sort_order",
		);
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching sections:", error);
		res.status(500).json({ error: "Failed to fetch sections" });
	}
});

// Get single section with fields
router.get("/:code", async (req, res) => {
	try {
		const { code } = req.params;

		const sectionResult = await pool.query(
			"SELECT * FROM sections WHERE code = $1",
			[code],
		);

		if (sectionResult.rows.length === 0) {
			return res.status(404).json({ error: "Section not found" });
		}

		const fieldsResult = await pool.query(
			"SELECT * FROM section_fields WHERE section_id = $1 ORDER BY sort_order",
			[sectionResult.rows[0].id],
		);

		res.json({
			...sectionResult.rows[0],
			fields: fieldsResult.rows,
		});
	} catch (error) {
		console.error("Error fetching section:", error);
		res.status(500).json({ error: "Failed to fetch section" });
	}
});

// Get all sections with their fields
router.get("/all/fields", async (req, res) => {
	try {
		const sectionsResult = await pool.query(
			"SELECT * FROM sections WHERE is_active = true ORDER BY sort_order",
		);

		const sections = [];
		for (const section of sectionsResult.rows) {
			const fieldsResult = await pool.query(
				"SELECT * FROM section_fields WHERE section_id = $1 ORDER BY sort_order",
				[section.id],
			);
			sections.push({
				...section,
				fields: fieldsResult.rows,
			});
		}

		res.json(sections);
	} catch (error) {
		console.error("Error fetching sections with fields:", error);
		res.status(500).json({ error: "Failed to fetch sections" });
	}
});

// Get reference values for a field
router.get("/field/:fieldId/values", async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT DISTINCT value FROM reference_values WHERE field_id = $1 ORDER BY value",
			[req.params.fieldId],
		);
		res.json(result.rows.map((r) => r.value));
	} catch (error) {
		console.error("Error fetching reference values:", error);
		res.status(500).json({ error: "Failed to fetch values" });
	}
});

// Add reference value
router.post("/field/:fieldId/values", async (req, res) => {
	try {
		const { value } = req.body;
		const result = await pool.query(
			"INSERT INTO reference_values (field_id, value) VALUES ($1, $2) RETURNING *",
			[req.params.fieldId, value],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error adding reference value:", error);
		res.status(500).json({ error: "Failed to add value" });
	}
});

export default router;
