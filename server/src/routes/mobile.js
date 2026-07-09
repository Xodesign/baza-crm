import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { query } from "../db/db.js";

const router = express.Router();

const UPLOAD_DIR = "/var/www/uploads";
if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
	destination: UPLOAD_DIR,
	filename: (_req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Map baza call row to mobile format
function mapCall(row) {
	return {
		id: row.id,
		phone: row.customer_contact || "",
		client_name: row.object_name || "",
		address: row.short_address || "",
		note: row.request || "",
		status: row.status || "new",
		call_type: row.type || "incoming",
		created_at: row.created_at,
		updated_at: row.updated_at,
		engineer: row.engineer || "",
		latitude: row.latitude || null,
		longitude: row.longitude || null,
	};
}

function mapRequest(row) {
	return {
		id: row.id,
		request_type: "procurement",
		title: row.what_to_buy || "Заявка",
		description: row.what_to_buy || "",
		priority: "normal",
		status: row.status === "new" ? "pending" : row.status || "pending",
		created_by: row.creator || null,
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

// ============ CALLS ============
router.get("/calls", async (_req, res) => {
	try {
		const result = await query("SELECT * FROM calls ORDER BY created_at DESC");
		res.json(result.rows.map(mapCall));
	} catch (error) {
		console.error("Error fetching mobile calls:", error);
		res.status(500).json({ error: "Failed to fetch calls" });
	}
});

router.get("/calls/:id", async (req, res) => {
	try {
		const result = await query("SELECT * FROM calls WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0)
			return res.status(404).json({ error: "Call not found" });
		res.json(mapCall(result.rows[0]));
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch call" });
	}
});

router.post("/calls", async (req, res) => {
	try {
		const { phone, client_name, address, note, call_type, status } = req.body;
		const result = await query(
			`INSERT INTO calls (customer_contact, object_name, short_address, request, type, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
			[
				phone,
				client_name,
				address,
				note,
				call_type || "incoming",
				status || "new",
			],
		);
		res.status(201).json(mapCall(result.rows[0]));
	} catch (error) {
		console.error("Error creating mobile call:", error);
		res.status(500).json({ error: "Failed to create call" });
	}
});

router.put("/calls/:id", async (req, res) => {
	try {
		const { status, note, address, latitude, longitude } = req.body;
		const fields = ["updated_at = NOW()"];
		const vals = [];
		let i = 1;
		if (status !== undefined) {
			fields.push(`status = $${i++}`);
			vals.push(status);
		}
		if (note !== undefined) {
			fields.push(`request = $${i++}`);
			vals.push(note);
		}
		if (address !== undefined) {
			fields.push(`short_address = $${i++}`);
			vals.push(address);
		}
		if (latitude !== undefined) {
			fields.push(`latitude = $${i++}`);
			vals.push(latitude);
		}
		if (longitude !== undefined) {
			fields.push(`longitude = $${i++}`);
			vals.push(longitude);
		}
		vals.push(req.params.id);
		const result = await query(
			`UPDATE calls SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
			vals,
		);
		if (result.rows.length === 0)
			return res.status(404).json({ error: "Call not found" });
		res.json(mapCall(result.rows[0]));
	} catch (error) {
		console.error("Error updating mobile call:", error);
		res.status(500).json({ error: "Failed to update call" });
	}
});

// ============ CALL PHOTOS ============
router.get("/calls/:id/photos", async (req, res) => {
	try {
		const result = await query(
			"SELECT * FROM call_photos WHERE call_id = $1 ORDER BY created_at DESC",
			[req.params.id],
		);
		res.json(
			result.rows.map((p) => ({
				id: p.id,
				call_id: p.call_id,
				photo_url: p.photo_url,
				created_at: p.created_at,
			})),
		);
	} catch (error) {
		res.json([]);
	}
});

router.post(
	"/calls/:id/photos",
	upload.array("photos", 10),
	async (req, res) => {
		try {
			const files = req.files || [];
			const results = [];
			for (const file of files) {
				const photo_url = `/uploads/${file.filename}`;
				const result = await query(
					`INSERT INTO call_photos (call_id, photo_url, created_at)
         VALUES ($1, $2, NOW()) RETURNING *`,
					[req.params.id, photo_url],
				);
				results.push({
					id: result.rows[0].id,
					call_id: parseInt(req.params.id),
					photo_url,
					created_at: result.rows[0].created_at,
				});
			}
			res.status(201).json(results);
		} catch (error) {
			console.error("Error uploading photos:", error);
			res.status(500).json({ error: "Failed to upload photos" });
		}
	},
);

// ============ REQUESTS ============
router.get("/requests", async (_req, res) => {
	try {
		const result = await query("SELECT * FROM buy ORDER BY created_at DESC");
		res.json(result.rows.map(mapRequest));
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch requests" });
	}
});

router.post("/requests", async (req, res) => {
	try {
		const { title, description, created_by } = req.body;
		const result = await query(
			`INSERT INTO buy (what_to_buy, status, creator, created_at, updated_at)
       VALUES ($1, 'new', $2, NOW(), NOW()) RETURNING *`,
			[title || description, created_by],
		);
		res.status(201).json(mapRequest(result.rows[0]));
	} catch (error) {
		console.error("Error creating request:", error);
		res.status(500).json({ error: "Failed to create request" });
	}
});

// ============ TOOLS ============
router.get("/tools", async (_req, res) => {
	try {
		const result = await query("SELECT * FROM tools ORDER BY tool");
		res.json(
			result.rows.map((t) => ({
				id: t.id,
				name: t.tool || "",
				inventory_number: t.inventory_number || "",
				condition: t.call_status === "completed" ? "good" : "repair",
			})),
		);
	} catch (error) {
		console.error("Tools error:", error.message);
		res.json([]);
	}
});

// ============ TRANSPORT ============
router.get("/transport", async (_req, res) => {
	try {
		const result = await query("SELECT * FROM vehicles ORDER BY brand");
		res.json(
			result.rows.map((v) => ({
				id: v.id,
				brand: v.brand || "",
				model: v.model || "",
				plate_number: v.plate_number || "",
				status: v.status || "available",
			})),
		);
	} catch (error) {
		res.json([]);
	}
});

// ============ STAFF ============
router.get("/staff", async (_req, res) => {
	try {
		const result = await query("SELECT * FROM staff ORDER BY full_name");
		res.json(
			result.rows.map((u) => ({
				id: u.id,
				full_name: u.full_name || "",
				username: "",
				position: u.position || "",
				phone: u.phone || "",
				email: u.email || "",
			})),
		);
	} catch (error) {
		res.json([]);
	}
});

// ============ WORK SCHEDULE (work_days table) ============
router.get("/work-schedule", async (req, res) => {
	try {
		const { user_id } = req.query;
		let sql = "SELECT * FROM work_days";
		const params = [];
		if (user_id) {
			sql += " WHERE user_id = $1";
			params.push(user_id);
		}
		sql += " ORDER BY work_date DESC";
		const result = await query(sql, params);
		res.json(
			result.rows.map((w) => ({
				id: w.id,
				user_id: w.user_id,
				work_date: w.work_date,
				working: w.is_working !== false,
				start_time: w.start_time || "09:00",
				end_time: w.end_time || "18:00",
			})),
		);
	} catch (error) {
		console.error("Error fetching work schedule:", error);
		res.json([]);
	}
});

router.post("/work-schedule", async (req, res) => {
	try {
		const { user_id, work_date, working, start_time, end_time } = req.body;
		const result = await query(
			`INSERT INTO work_days (user_id, work_date, is_working, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, work_date)
       DO UPDATE SET is_working = $3, start_time = $4, end_time = $5
       RETURNING *`,
			[
				user_id || 1,
				work_date,
				working !== false,
				start_time || "09:00",
				end_time || "18:00",
			],
		);
		res.status(201).json({
			id: result.rows[0].id,
			user_id: result.rows[0].user_id,
			work_date: result.rows[0].work_date,
			working: result.rows[0].is_working !== false,
			start_time: result.rows[0].start_time,
			end_time: result.rows[0].end_time,
		});
	} catch (error) {
		console.error("Error saving work schedule:", error);
		res.status(500).json({ error: "Failed to save work schedule" });
	}
});

// ============ LOCATIONS ============
router.get("/locations", async (_req, res) => {
	try {
		const result = await query(
			"SELECT * FROM locations ORDER BY created_at DESC LIMIT 100",
		);
		res.json(
			result.rows.map((l) => ({
				id: l.id,
				user_id: l.user_id,
				latitude: l.latitude,
				longitude: l.longitude,
				accuracy: l.accuracy || null,
				created_at: l.created_at,
			})),
		);
	} catch (error) {
		res.json([]);
	}
});

router.post("/locations", async (req, res) => {
	try {
		const { user_id, latitude, longitude, accuracy } = req.body;
		const result = await query(
			`INSERT INTO locations (user_id, latitude, longitude, accuracy, created_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
			[user_id || 1, latitude, longitude, accuracy],
		);
		res.status(201).json({
			id: result.rows[0].id,
			user_id: result.rows[0].user_id,
			latitude: result.rows[0].latitude,
			longitude: result.rows[0].longitude,
			accuracy: result.rows[0].accuracy,
			created_at: result.rows[0].created_at,
		});
	} catch (error) {
		console.error("Error saving location:", error);
		res.status(500).json({ error: "Failed to save location" });
	}
});

export default router;

// ============ OBJECTS ============
const OBJECT_COLUMNS = {
	Заказчик: "customer",
	Подрядчик: "contractor",
	"№ контр/дог": "contract_number",
	"Начало действия договора": "contract_start_date",
	"Окончание действия договора": "contract_end_date",
	"Тип договора": "contract_type",
	Продлеваемость: "renewability",
	"Письмо о повышении стоимости ТО": "price_increase_letter_date",
	"Свершившееся повышение цены ТО": "price_increase_percent",
	"Доп соглашение": "additional_agreement",
	Письма: "letters",
	"Кто оплачивает ремонт": "repair_payer",
	"Как оплачиваются доп.работы": "additional_works_payment",
	"К доп работам есть ли аванс": "advance_payment",
	"Адрес полный объекта": "full_address",
	"Адрес сокращенный": "short_address",
	"Наименование объекта": "object_name",
	"РД ИД ПД": "rd_id_pd",
	Арендатор: "tenant",
	Системы: "systems",
	"Расчетное время на обслуживание": "estimated_time",
	Контакты: "contacts",
	"Инструмент на объекте": "has_tool",
	Заметки: "notes",
	objectNumber: "object_number",
	object_number: "object_number",
	id: "id",
	created_at: "created_at",
	updated_at: "updated_at",
};

function mapObject(row) {
	if (!row) return null;
	return {
		id: row.id,
		objectNumber: row.object_number,
		Заказчик: row.customer || "",
		Подрядчик: row.contractor || "",
		"№ контр/дог": row.contract_number || "",
		"Начало действия договора": row.contract_start_date || "",
		"Окончание действия договора": row.contract_end_date || "",
		"Тип договора": row.contract_type || "",
		Продлеваемость: row.renewability || "",
		"Письмо о повышении стоимости ТО": row.price_increase_letter_date || "",
		"Свершившееся повышение цены ТО": row.price_increase_percent || "",
		"Доп соглашение": row.additional_agreement || "",
		Письма: row.letters || "",
		"Кто оплачивает ремонт": row.repair_payer || "",
		"Как оплачиваются доп.работы": row.additional_works_payment || "",
		"К доп работам есть ли аванс": row.advance_payment || "",
		"Адрес полный объекта": row.full_address || "",
		"Адрес сокращенный": row.short_address || "",
		"Наименование объекта": row.object_name || "",
		"РД ИД ПД": row.rd_id_pd || "",
		Арендатор: row.tenant || "",
		Системы: row.systems || "",
		"Расчетное время на обслуживание": row.estimated_time || "",
		Контакты: row.contacts || "",
		"Инструмент на объекте": row.has_tool || "",
		Заметки: row.notes || "",
	};
}

function toDbFields(obj) {
	const db = {};
	for (const [rus, col] of Object.entries(OBJECT_COLUMNS)) {
		if (rus in obj) {
			db[col] = obj[rus];
		}
	}
	return db;
}

router.get("/objects", async (_req, res) => {
	try {
		const result = await query(
			"SELECT * FROM objects ORDER BY object_number DESC NULLS LAST, id DESC",
		);
		res.json(result.rows.map(mapObject));
	} catch (error) {
		console.error("Objects error:", error.message);
		res.json([]);
	}
});

router.post("/objects", async (req, res) => {
	try {
		const db = toDbFields(req.body);
		const cols = Object.keys(db);
		const vals = Object.values(db);
		const maxNum = await query("SELECT MAX(object_number) as m FROM objects");
		db.object_number = db.object_number || (maxNum.rows[0].m || 0) + 1;
		const insertCols = [...cols];
		const insertVals = [...vals];
		if (!insertCols.includes("object_number")) {
			insertCols.push("object_number");
			insertVals.push(db.object_number);
		}
		const placeholders = insertVals.map((_, i) => `$${i + 1}`).join(", ");
		const result = await query(
			`INSERT INTO objects (${insertCols.join(", ")}) VALUES (${placeholders}) RETURNING *`,
			insertVals,
		);
		res.status(201).json(mapObject(result.rows[0]));
	} catch (error) {
		console.error("Create object error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

router.put("/objects/:id", async (req, res) => {
	try {
		const db = toDbFields(req.body);
		delete db.id;
		delete db.created_at;
		const entries = Object.entries(db).filter(
			([k]) => k !== "id" && k !== "created_at",
		);
		if (entries.length === 0) {
			return res.status(400).json({ error: "No fields to update" });
		}
		const sets = entries.map(([k], i) => `${k} = $${i + 1}`).join(", ");
		const vals = entries.map(([, v]) => v);
		vals.push(req.params.id);
		const result = await query(
			`UPDATE objects SET ${sets}, updated_at = NOW() WHERE id = $${vals.length} RETURNING *`,
			vals,
		);
		if (result.rows.length === 0)
			return res.status(404).json({ error: "Not found" });
		res.json(mapObject(result.rows[0]));
	} catch (error) {
		console.error("Update object error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

router.delete("/objects/:id", async (req, res) => {
	try {
		const result = await query(
			"DELETE FROM objects WHERE id = $1 RETURNING id",
			[req.params.id],
		);
		if (result.rows.length === 0)
			return res.status(404).json({ error: "Not found" });
		res.json({ success: true });
	} catch (error) {
		console.error("Delete object error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

// === RD — РАБОЧАЯ ДОКУМЕНТАЦИЯ ===

// Создаём таблицы при первом запросе
let rdTablesInitialized = false;
async function initRDtables() {
	if (rdTablesInitialized) return;
	try {
		await query(`
			CREATE TABLE IF NOT EXISTS rd_folders (
				id SERIAL PRIMARY KEY,
				name TEXT NOT NULL,
				parent_id INTEGER REFERENCES rd_folders(id) ON DELETE CASCADE,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`);
		await query(`
			CREATE TABLE IF NOT EXISTS rd_files (
				id SERIAL PRIMARY KEY,
				name TEXT NOT NULL,
				folder_id INTEGER REFERENCES rd_folders(id) ON DELETE CASCADE,
				file_path TEXT NOT NULL,
				size BIGINT DEFAULT 0,
				mime_type TEXT DEFAULT 'application/octet-stream',
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`);
		// Создаём директорию для файлов
		const uploadDir = path.join(process.cwd(), "uploads", "rd");
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		rdTablesInitialized = true;
	} catch (err) {
		console.error("initRDtables error:", err.message);
	}
}

// Multer storage для RD файлов
const rdStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = path.join(process.cwd(), "uploads", "rd");
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, uniqueSuffix + ext);
	},
});
const rdUpload = multer({
	storage: rdStorage,
	limits: { fileSize: 100 * 1024 * 1024 },
});

// GET /api/mobile/rd/folders — список папок
router.get("/rd/folders", async (req, res) => {
	try {
		await initRDtables();
		const result = await query("SELECT * FROM rd_folders ORDER BY id");
		res.json(result.rows);
	} catch (error) {
		console.error("Get folders error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

// POST /api/mobile/rd/folders — создать папку
router.post("/rd/folders", async (req, res) => {
	try {
		await initRDtables();
		const { name, parentId } = req.body;
		if (!name || !name.trim()) {
			return res.status(400).json({ error: "Название папки обязательно" });
		}
		const result = await query(
			"INSERT INTO rd_folders (name, parent_id) VALUES ($1, $2) RETURNING *",
			[name.trim(), parentId || null],
		);
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Create folder error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

// DELETE /api/mobile/rd/folders/:id — удалить папку (каскадно)
router.delete("/rd/folders/:id", async (req, res) => {
	try {
		await initRDtables();
		const folderId = parseInt(req.params.id);
		// Рекурсивно собираем id всех вложенных папок
		const collectChildIds = async (parentId) => {
			const children = await query(
				"SELECT id FROM rd_folders WHERE parent_id = $1",
				[parentId],
			);
			const ids = [];
			for (const child of children.rows) {
				ids.push(child.id);
				const grandChildren = await collectChildIds(child.id);
				ids.push(...grandChildren);
			}
			return ids;
		};
		const childIds = await collectChildIds(folderId);
		const allIds = [folderId, ...childIds];
		// Удаляем файлы из всех папок
		for (const id of allIds) {
			const files = await query(
				"SELECT file_path FROM rd_files WHERE folder_id = $1",
				[id],
			);
			for (const f of files.rows) {
				const fullPath = path.join(process.cwd(), "uploads", "rd", f.file_path);
				if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
			}
			await query("DELETE FROM rd_files WHERE folder_id = $1", [id]);
		}
		// Удаляем папки
		for (const id of allIds.reverse()) {
			await query("DELETE FROM rd_folders WHERE id = $1", [id]);
		}
		res.json({ success: true, deletedFolders: allIds.length });
	} catch (error) {
		console.error("Delete folder error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

// GET /api/mobile/rd/files — список файлов (опционально фильтр по folderId)
router.get("/rd/files", async (req, res) => {
	try {
		await initRDtables();
		const { folderId } = req.query;
		let result;
		if (folderId === "null" || folderId === "" || folderId === undefined) {
			result = await query(
				"SELECT id, name, folder_id, size, mime_type, created_at FROM rd_files ORDER BY id DESC",
			);
		} else {
			result = await query(
				"SELECT id, name, folder_id, size, mime_type, created_at FROM rd_files WHERE folder_id = $1 ORDER BY id DESC",
				[folderId],
			);
		}
		res.json(result.rows);
	} catch (error) {
		console.error("Get files error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

// POST /api/mobile/rd/files — загрузить файл
router.post("/rd/files", rdUpload.single("file"), async (req, res) => {
	try {
		await initRDtables();
		if (!req.file) {
			return res.status(400).json({ error: "Файл не загружен" });
		}
		const { folderId } = req.body;
		const result = await query(
			"INSERT INTO rd_files (name, folder_id, file_path, size, mime_type) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, folder_id, size, mime_type, created_at",
			[
				req.file.originalname,
				folderId && folderId !== "null" && folderId !== "" ? folderId : null,
				req.file.filename,
				req.file.size,
				req.file.mimetype,
			],
		);
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Upload file error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

// GET /api/mobile/rd/files/:id/download — скачать файл
router.get("/rd/files/:id/download", async (req, res) => {
	try {
		await initRDtables();
		const result = await query("SELECT * FROM rd_files WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Файл не найден" });
		}
		const file = result.rows[0];
		const filePath = path.join(process.cwd(), "uploads", "rd", file.file_path);
		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ error: "Файл не найден на диске" });
		}
		res.download(filePath, file.name);
	} catch (error) {
		console.error("Download file error:", error.message);
		res.status(500).json({ error: error.message });
	}
});

// DELETE /api/mobile/rd/files/:id — удалить файл
router.delete("/rd/files/:id", async (req, res) => {
	try {
		await initRDtables();
		const result = await query("SELECT file_path FROM rd_files WHERE id = $1", [
			req.params.id,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Файл не найден" });
		}
		const filePath = path.join(
			process.cwd(),
			"uploads",
			"rd",
			result.rows[0].file_path,
		);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
		await query("DELETE FROM rd_files WHERE id = $1", [req.params.id]);
		res.json({ success: true });
	} catch (error) {
		console.error("Delete file error:", error.message);
		res.status(500).json({ error: error.message });
	}
});
