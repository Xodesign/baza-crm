import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "../data/users.json");

// Read users data
async function readUsersData() {
	try {
		const data = await fs.readFile(DATA_FILE, "utf8");
		return JSON.parse(data);
	} catch (error) {
		console.error("Error reading users data:", error);
		return { users: [], roles: [], sections: [] };
	}
}

// Check if user has permission to access a section
export function checkPermission(section) {
	return async (req, res, next) => {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ error: "Не авторизован" });
		}

		const token = authHeader.substring(7);
		const data = await readUsersData();

		// Find user by token (simple token = user id)
		const user = data.users.find((u) => u.token === token);

		if (!user) {
			return res.status(401).json({ error: "Недействительный токен" });
		}

		if (!user.isActive) {
			return res.status(403).json({ error: "Пользователь заблокирован" });
		}

		// Admin has access to everything
		if (user.role === "admin" || user.permissions.all) {
			req.user = user;
			return next();
		}

		// Check specific permission
		const permissions = user.permissions || {};
		if (permissions[section] || permissions.all) {
			req.user = user;
			return next();
		}

		return res.status(403).json({
			error: "Нет доступа к разделу",
			section,
			required: section,
		});
	};
}

// Check if user is admin
export function requireAdmin(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Не авторизован" });
	}

	const token = authHeader.substring(7);

	readUsersData().then((data) => {
		const user = data.users.find((u) => u.token === token);

		if (!user) {
			return res.status(401).json({ error: "Недействительный токен" });
		}

		if (user.role !== "admin") {
			return res.status(403).json({ error: "Требуются права администратора" });
		}

		req.user = user;
		next();
	});
}

// Authenticate user and return token
export async function authenticate(username, password) {
	const data = await readUsersData();
	const user = data.users.find(
		(u) => u.username === username && u.password === password,
	);

	if (!user) {
		return null;
	}

	if (!user.isActive) {
		return { error: "Пользователь заблокирован" };
	}

	// Generate simple token (in production use JWT)
	const token = `token_${user.id}_${Date.now()}`;

	// Save token to user
	user.token = token;
	user.lastLogin = new Date().toISOString();

	// Write back to file
	const userIndex = data.users.findIndex((u) => u.id === user.id);
	if (userIndex !== -1) {
		data.users[userIndex] = user;
		await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
	}

	// Return user without password
	const { password: _, token: __, ...safeUser } = user;
	return { user: safeUser, token };
}

// Get current user from token
export async function getCurrentUser(token) {
	if (!token) return null;

	const data = await readUsersData();
	const user = data.users.find((u) => u.token === token);

	if (!user || !user.isActive) return null;

	const { password: _, token: __, ...safeUser } = user;
	return safeUser;
}
