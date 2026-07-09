const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(cors());
app.use(express.json());

// Load or init data
let data;
if (fs.existsSync(DATA_FILE)) {
	data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
} else {
	data = {
		objects: [],
		tools: [],
		requests: [],
		calls: [],
		staff: [],
		transport: [],
		folders: [],
	};
}

const save = () => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// ============== OBJECTS ==============
app.get("/api/objects", (req, res) => res.json(data.objects || []));
app.post("/api/objects", (req, res) => {
	const obj = {
		id: Date.now(),
		...req.body,
		created_at: new Date().toISOString(),
	};
	data.objects = data.objects || [];
	data.objects.push(obj);
	save();
	res.json(obj);
});
app.put("/api/objects/:id", (req, res) => {
	const idx = data.objects.findIndex((o) => o.id == req.params.id);
	if (idx !== -1) {
		data.objects[idx] = { ...data.objects[idx], ...req.body };
		save();
		res.json(data.objects[idx]);
	} else res.status(404).json({ error: "Not found" });
});
app.delete("/api/objects/:id", (req, res) => {
	data.objects = data.objects.filter((o) => o.id != req.params.id);
	save();
	res.json({ success: true });
});

// ============== TOOLS ==============
app.get("/api/tools", (req, res) => res.json(data.tools || []));
app.post("/api/tools", (req, res) => {
	const tool = { id: Date.now(), ...req.body };
	data.tools = data.tools || [];
	data.tools.push(tool);
	save();
	res.json(tool);
});
app.put("/api/tools/:id", (req, res) => {
	const idx = data.tools.findIndex((t) => t.id == req.params.id);
	if (idx !== -1) {
		data.tools[idx] = { ...data.tools[idx], ...req.body };
		save();
		res.json(data.tools[idx]);
	} else res.status(404).json({ error: "Not found" });
});
app.delete("/api/tools/:id", (req, res) => {
	data.tools = data.tools.filter((t) => t.id != req.params.id);
	save();
	res.json({ success: true });
});

// ============== REQUESTS ==============
app.get("/api/requests", (req, res) => res.json(data.requests || []));
app.post("/api/requests", (req, res) => {
	const req_ = {
		id: Date.now(),
		...req.body,
		created_at: new Date().toISOString(),
	};
	data.requests = data.requests || [];
	data.requests.push(req_);
	save();
	res.json(req_);
});
app.put("/api/requests/:id", (req, res) => {
	const idx = data.requests.findIndex((r) => r.id == req.params.id);
	if (idx !== -1) {
		data.requests[idx] = { ...data.requests[idx], ...req.body };
		save();
		res.json(data.requests[idx]);
	} else res.status(404).json({ error: "Not found" });
});
app.delete("/api/requests/:id", (req, res) => {
	data.requests = data.requests.filter((r) => r.id != req.params.id);
	save();
	res.json({ success: true });
});

// ============== CALLS ==============
app.get("/api/calls", (req, res) => res.json(data.calls || []));
app.post("/api/calls", (req, res) => {
	const call = {
		id: Date.now(),
		...req.body,
		created_at: new Date().toISOString(),
	};
	data.calls = data.calls || [];
	data.calls.push(call);
	save();
	res.json(call);
});
app.put("/api/calls/:id", (req, res) => {
	const idx = data.calls.findIndex((c) => c.id == req.params.id);
	if (idx !== -1) {
		data.calls[idx] = { ...data.calls[idx], ...req.body };
		save();
		res.json(data.calls[idx]);
	} else res.status(404).json({ error: "Not found" });
});

// ============== RD FOLDERS ==============
app.get("/api/rd/folders", (req, res) => res.json(data.folders || []));
app.post("/api/rd/folders", (req, res) => {
	const folder = { id: Date.now(), ...req.body };
	data.folders = data.folders || [];
	data.folders.push(folder);
	save();
	res.json(folder);
});

// ============== STAFF ==============
app.get("/api/staff", (req, res) => res.json(data.staff || []));

// ============== TRANSPORT ==============
app.get("/api/transport", (req, res) => res.json(data.transport || []));

// Static + SPA fallback
const DIST_DIR = path.join(__dirname, "..", "dist");
app.use(express.static(DIST_DIR));
app.use((req, res, next) => {
	if (req.path.startsWith("/api/") || req.path.startsWith("/excel"))
		return next();
	res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
	console.log(`✅ CRM API: http://0.0.0.0:${PORT}`);
	console.log(`   Data: ${DATA_FILE}`);
});
