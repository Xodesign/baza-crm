import express from "express";

const router = express.Router();

// In-memory log storage (in production, use a database)
let activityLog = [];

// Get all logs
router.get("/", (_req, res) => {
	res.json(activityLog);
});

// Add a log entry
router.post("/", (req, res) => {
	const { user, action, target, description, details } = req.body;

	const logEntry = {
		id: activityLog.length + 1,
		timestamp: new Date().toISOString(),
		user: user || "anonymous",
		action: action || "unknown",
		target: target || "unknown",
		description: description || "",
		details: details || "",
	};

	activityLog.unshift(logEntry);

	// Keep only last 1000 entries
	if (activityLog.length > 1000) {
		activityLog = activityLog.slice(0, 1000);
	}

	res.json(logEntry);
});

// Clear logs
router.delete("/", (_req, res) => {
	activityLog = [];
	res.json({ message: "Logs cleared" });
});

export default router;
