import express from "express";
import { query } from "../db/db.js";
import XLSX from "xlsx";

const router = express.Router();

// Get all calls
router.get("/", async (req, res) => {
	try {
		const { status, object_id } = req.query;
		let sql = "SELECT * FROM calls";
		const params = [];
		const conditions = [];

		if (status) {
			params.push(status);
			conditions.push(`status = $${params.length}`);
		}
		if (object_id) {
			params.push(object_id);
			conditions.push(`object_id = $${params.length}`);
		}

		if (conditions.length > 0) {
			sql += " WHERE " + conditions.join(" AND ");
		}
		sql += " ORDER BY created_at DESC";

		const result = await query(sql, params);
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching calls:", error);
		res.status(500).json({ error: "Failed to fetch calls" });
	}
});

// Get single call
router.get("/:id", async (req, res) => {
	try {
		const result = await query("SELECT * FROM calls WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Call not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error fetching call:", error);
		res.status(500).json({ error: "Failed to fetch call" });
	}
});

// Create call
router.post("/", async (req, res) => {
	try {
		const {
			deadline,
			execution_date,
			engineer,
			assistant,
			status,
			type,
			object_id,
			object_name,
			short_address,
			tenant,
			system,
			request,
			our_tool,
			to_purchase,
			to_repair,
			activation,
			data_owner,
			customer_contact,
			creator,
		} = req.body;

		const result = await query(
			`INSERT INTO calls (deadline, execution_date, engineer, assistant, status, type,
        object_id, object_name, short_address, tenant, system, request, our_tool,
        to_purchase, to_repair, activation, data_owner, customer_contact, creator)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
			[
				deadline,
				execution_date,
				engineer,
				assistant,
				status || "new",
				type,
				object_id,
				object_name,
				short_address,
				tenant,
				system,
				request,
				our_tool,
				to_purchase,
				to_repair,
				activation,
				data_owner,
				customer_contact,
				creator,
			],
		);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Error creating call:", error);
		res.status(500).json({ error: "Failed to create call" });
	}
});

// Update call
router.put("/:id", async (req, res) => {
	try {
		const {
			deadline,
			execution_date,
			engineer,
			assistant,
			status,
			type,
			object_id,
			object_name,
			short_address,
			tenant,
			system,
			request,
			our_tool,
			to_purchase,
			to_repair,
			activation,
			data_owner,
			customer_contact,
			creator,
		} = req.body;

		const result = await query(
			`UPDATE calls SET 
        deadline = $1, execution_date = $2, engineer = $3, assistant = $4,
        status = $5, type = $6, object_id = $7, object_name = $8, short_address = $9,
        tenant = $10, system = $11, request = $12, our_tool = $13, to_purchase = $14,
        to_repair = $15, activation = $16, data_owner = $17, customer_contact = $18,
        creator = $19, updated_at = CURRENT_TIMESTAMP
       WHERE id = $20 RETURNING *`,
			[
				deadline,
				execution_date,
				engineer,
				assistant,
				status,
				type,
				object_id,
				object_name,
				short_address,
				tenant,
				system,
				request,
				our_tool,
				to_purchase,
				to_repair,
				activation,
				data_owner,
				customer_contact,
				creator,
				req.params.id,
			],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Call not found" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Error updating call:", error);
		res.status(500).json({ error: "Failed to update call" });
	}
});

// Delete call
router.delete("/:id", async (req, res) => {
	try {
		const result = await query("DELETE FROM calls WHERE id = $1 RETURNING id", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Call not found" });
		}
		res.json({ message: "Call deleted successfully" });
	} catch (error) {
		console.error("Error deleting call:", error);
		res.status(500).json({ error: "Failed to delete call" });
	}
});

// Export calls to Excel
router.get("/export/excel", async (req, res) => {
	try {
		const { status } = req.query;
		let sql = "SELECT * FROM calls";
		const params = [];

		if (status) {
			sql += " WHERE status = $1";
			params.push(status);
		}
		sql += " ORDER BY created_at DESC";

		const result = await query(sql, params);
		const calls = result.rows;

		const exportData = calls.map((c) => ({
			ID: c.id,
			"Дата создания": c.created_at
				? new Date(c.created_at).toLocaleString("ru-RU")
				: "",
			Дедлайн: c.deadline || "",
			"Дата выполнения": c.execution_date || "",
			Инженер: c.engineer || "",
			Помощник: c.assistant || "",
			Статус:
				c.status === "new"
					? "Новый"
					: c.status === "in_progress"
						? "В работе"
						: c.status === "waiting"
							? "Ожидает"
							: c.status === "completed"
								? "Выполнен"
								: c.status || "",
			Тип: c.type || "",
			Объект: c.object_name || "",
			Адрес: c.short_address || "",
			Арендатор: c.tenant || "",
			Система: c.system || "",
			Заявка: c.request || "",
			Инструменты: c.our_tool || "",
			Приобрести: c.to_purchase || "",
			"В ремонт": c.to_repair || "",
			Актирование: c.activation || "",
			"Данные у": c.data_owner || "",
			Контакт: c.customer_contact || "",
			Создатель: c.creator || "",
		}));

		const worksheet = XLSX.utils.json_to_sheet(exportData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Calls");

		worksheet["!cols"] = [
			{ wch: 5 },
			{ wch: 20 },
			{ wch: 12 },
			{ wch: 12 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 12 },
			{ wch: 10 },
			{ wch: 25 },
			{ wch: 25 },
			{ wch: 15 },
			{ wch: 12 },
			{ wch: 30 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
		];

		const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

		res.setHeader(
			"Content-Type",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		);
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="calls_${Date.now()}.xlsx"`,
		);
		res.send(buffer);
	} catch (error) {
		console.error("Error exporting calls:", error);
		res.status(500).json({ error: "Failed to export calls" });
	}
});

// Import calls from Excel
router.post("/import/excel", async (req, res) => {
	try {
		const { file } = req.body;

		if (!file) {
			return res.status(400).json({ error: "No file provided" });
		}

		const buffer = Buffer.from(file, "base64");
		const workbook = XLSX.read(buffer, { type: "buffer" });
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];
		const data = XLSX.utils.sheet_to_json(worksheet);

		const results = {
			success: 0,
			updated: 0,
			created: 0,
			errors: [],
		};

		const fieldMap = {
			ID: "id",
			Дедлайн: "deadline",
			"Дата выполнения": "execution_date",
			Инженер: "engineer",
			Помощник: "assistant",
			Статус: "status",
			Тип: "type",
			Объект: "object_name",
			Адрес: "short_address",
			Арендатор: "tenant",
			Система: "system",
			Заявка: "request",
			Инструменты: "our_tool",
			Приобрести: "to_purchase",
			"В ремонт": "to_repair",
			Актирование: "activation",
			"Данные у": "data_owner",
			Контакт: "customer_contact",
			Создатель: "creator",
		};

		const statusMap = {
			новый: "new",
			"в работе": "in_progress",
			ожидает: "waiting",
			выполнен: "completed",
			new: "new",
			in_progress: "in_progress",
			waiting: "waiting",
			completed: "completed",
		};

		for (let i = 0; i < data.length; i++) {
			const row = data[i];
			const rowIndex = i + 2;

			try {
				const dbData = {};
				for (const [excelField, dbField] of Object.entries(fieldMap)) {
					if (row[excelField] !== undefined) {
						let value = row[excelField];

						if (dbField === "status") {
							value = statusMap[value?.toLowerCase()] || value;
						}

						if (
							(dbField === "deadline" || dbField === "execution_date") &&
							value
						) {
							if (typeof value === "number") {
								const parsed = XLSX.SSF.parse_date_code(value);
								value = `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
							} else if (typeof value === "string") {
								const parsed = new Date(value);
								if (!isNaN(parsed)) {
									value = parsed.toISOString().split("T")[0];
								}
							}
						}

						dbData[dbField] = value;
					}
				}

				if (dbData.id) {
					const existing = await query("SELECT id FROM calls WHERE id = $1", [
						dbData.id,
					]);
					if (existing.rows.length > 0) {
						const fields = Object.keys(dbData).filter((k) => k !== "id");
						const setClause = fields
							.map((f, idx) => `${f} = $${idx + 2}`)
							.join(", ");
						const values = fields.map((f) => dbData[f]);
						await query(
							`UPDATE calls SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
							[dbData.id, ...values],
						);
						results.updated++;
					} else {
						dbData.status = dbData.status || "new";
						dbData.created_at = new Date();
						const fields = Object.keys(dbData);
						const values = fields.map((f) => dbData[f]);
						const placeholders = fields
							.map((_, idx) => `$${idx + 1}`)
							.join(", ");
						await query(
							`INSERT INTO calls (${fields.join(", ")}) VALUES (${placeholders}) RETURNING id`,
							values,
						);
						results.created++;
					}
				} else {
					dbData.status = dbData.status || "new";
					dbData.created_at = new Date();
					const fields = Object.keys(dbData);
					const values = fields.map((f) => dbData[f]);
					const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(", ");
					await query(
						`INSERT INTO calls (${fields.join(", ")}) VALUES (${placeholders}) RETURNING id`,
						values,
					);
					results.created++;
				}
				results.success++;
			} catch (rowError) {
				results.errors.push({
					row: rowIndex,
					message: rowError.message,
					data: row,
				});
			}
		}

		res.json({
			message: `Import complete: ${results.success} success, ${results.updated} updated, ${results.created} created`,
			...results,
		});
	} catch (error) {
		console.error("Error importing calls:", error);
		res.status(500).json({ error: "Failed to import calls" });
	}
});

// Bulk update calls
router.put("/bulk", async (req, res) => {
	try {
		const { ids, data } = req.body;

		if (!ids || !Array.isArray(ids) || ids.length === 0) {
			return res.status(400).json({ error: "No IDs provided" });
		}

		if (!data || Object.keys(data).length === 0) {
			return res.status(400).json({ error: "No data to update" });
		}

		const allowedFields = [
			"status",
			"deadline",
			"execution_date",
			"engineer",
			"assistant",
			"object_name",
			"short_address",
			"tenant",
			"system",
			"request",
			"our_tool",
			"to_purchase",
			"to_repair",
			"activation",
			"data_owner",
		];

		const updateData = {};
		for (const [key, value] of Object.entries(data)) {
			if (allowedFields.includes(key)) {
				updateData[key] = value;
			}
		}

		if (Object.keys(updateData).length === 0) {
			return res.status(400).json({ error: "No valid fields to update" });
		}

		const setClause = Object.keys(updateData)
			.map((f, idx) => `${f} = $${idx + 2}`)
			.join(", ");
		const values = Object.values(updateData);
		const placeholders = ids
			.map((_, idx) => `$${idx + values.length + 1}`)
			.join(", ");

		const result = await query(
			`UPDATE calls SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders}) RETURNING id`,
			[...values, ...ids],
		);

		res.json({
			message: `Updated ${result.rowCount} calls`,
			updated: result.rowCount,
			ids: result.rows.map((r) => r.id),
		});
	} catch (error) {
		console.error("Error bulk updating calls:", error);
		res.status(500).json({ error: "Failed to bulk update calls" });
	}
});

export default router;
