import express from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import {
	authenticate,
	getCurrentUser,
	requireAdmin,
} from "../middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "../data/users.json");

const router = express.Router();

// Helper functions
async function readUsersData() {
	try {
		const data = await fs.readFile(DATA_FILE, "utf8");
		return JSON.parse(data);
	} catch (error) {
		console.error("Error reading users data:", error);
		return { users: [], roles: [], sections: [] };
	}
}

async function writeUsersData(data) {
	await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Auth middleware helper
function authMiddleware(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Не авторизован" });
	}

	const token = authHeader.substring(7);

	getCurrentUser(token).then((user) => {
		if (!user) {
			return res.status(401).json({ error: "Недействительный токен" });
		}
		req.user = user;
		next();
	});
}

// Login - без пароля
router.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;

		if (!username) {
			return res.status(400).json({ error: "Введите логин" });
		}

		// Простой вход без пароля - всегда успех
		const userData = {
			id: 1,
			username: username || "admin",
			role: "admin",
			fullName: "Администратор",
			token: "dev_token_" + Date.now()
		};

		return res.json({
			success: true,
			user: userData,
			token: userData.token
		});

		if (!result) {
			return res.status(401).json({ error: "Неверный логин или пароль" });
		}

		if (result.error) {
			return res.status(403).json({ error: result.error });
		}

		res.json(result);
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Ошибка авторизации" });
	}
});

// Logout
router.post("/logout", authMiddleware, async (req, res) => {
	try {
		const data = await readUsersData();
		const userIndex = data.users.findIndex((u) => u.id === req.user.id);

		if (userIndex !== -1) {
			data.users[userIndex].token = null;
			await writeUsersData(data);
		}

		res.json({ success: true });
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({ error: "Ошибка выхода" });
	}
});

// Get current user
router.get("/me", authMiddleware, (req, res) => {
	res.json(req.user);
});

// Get all users (admin only)
router.get("/", authMiddleware, async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ error: "Требуются права администратора" });
		}

		const data = await readUsersData();
		// Remove passwords from response
		const safeUsers = data.users.map(({ password, token, ...user }) => user);
		res.json(safeUsers);
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ error: "Ошибка получения списка пользователей" });
	}
});

// Get roles (admin only)
router.get("/roles", authMiddleware, async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ error: "Требуются права администратора" });
		}

		const data = await readUsersData();
		res.json(data.roles);
	} catch (error) {
		console.error("Error fetching roles:", error);
		res.status(500).json({ error: "Ошибка получения ролей" });
	}
});

// Get sections (for permissions)
router.get("/sections", authMiddleware, async (req, res) => {
	try {
		const data = await readUsersData();
		res.json(data.sections);
	} catch (error) {
		console.error("Error fetching sections:", error);
		res.status(500).json({ error: "Ошибка получения разделов" });
	}
});

// Create user (admin only)
router.post("/", authMiddleware, async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ error: "Требуются права администратора" });
		}

		const { username, password, role, fullName, email, permissions } = req.body;

		if (!username || !password) {
			return res.status(400).json({ error: "Логин и пароль обязательны" });
		}

		const data = await readUsersData();

		// Check if username exists
		if (data.users.some((u) => u.username === username)) {
			return res
				.status(400)
				.json({ error: "Пользователь с таким логином уже существует" });
		}

		// Get role permissions if role is specified
		let userPermissions = permissions || {};
		if (role && !permissions) {
			const roleData = data.roles.find((r) => r.id === role);
			if (roleData) {
				userPermissions = { ...roleData.permissions };
			}
		}

		const newUser = {
			id: Math.max(0, ...data.users.map((u) => u.id)) + 1,
			username,
			password, // In production, hash this!
			role: role || "viewer",
			fullName: fullName || username,
			email: email || "",
			isActive: true,
			createdAt: new Date().toISOString(),
			createdBy: req.user.id,
			permissions: userPermissions,
		};

		data.users.push(newUser);
		await writeUsersData(data);

		// Return without password
		const { password: _, token: __, ...safeUser } = newUser;
		res.status(201).json(safeUser);
	} catch (error) {
		console.error("Error creating user:", error);
		res.status(500).json({ error: "Ошибка создания пользователя" });
	}
});

// Update user (admin only)
router.put("/:id", authMiddleware, async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ error: "Требуются права администратора" });
		}

		const { id } = req.params;
		const { username, password, role, fullName, email, isActive, permissions } =
			req.body;

		const data = await readUsersData();
		const userIndex = data.users.findIndex((u) => u.id === parseInt(id));

		if (userIndex === -1) {
			return res.status(404).json({ error: "Пользователь не найден" });
		}

		const user = data.users[userIndex];

		// Prevent modifying own admin account through this endpoint
		if (user.id === req.user.id && (role !== "admin" || !isActive)) {
			return res
				.status(400)
				.json({ error: "Нельзя изменить свою учётную запись администратора" });
		}

		// Check if new username conflicts
		if (username && username !== user.username) {
			if (data.users.some((u) => u.username === username && u.id !== user.id)) {
				return res
					.status(400)
					.json({ error: "Пользователь с таким логином уже существует" });
			}
			user.username = username;
		}

		// Update password if provided
		if (password) {
			user.password = password;
		}

		// Update role
		if (role) {
			user.role = role;
			// Update permissions based on role if not custom
			if (!permissions) {
				const roleData = data.roles.find((r) => r.id === role);
				if (roleData) {
					user.permissions = { ...roleData.permissions };
				}
			}
		}

		// Update custom permissions
		if (permissions) {
			user.permissions = permissions;
		}

		if (fullName !== undefined) user.fullName = fullName;
		if (email !== undefined) user.email = email;
		if (isActive !== undefined) user.isActive = isActive;

		user.updatedAt = new Date().toISOString();
		user.updatedBy = req.user.id;

		data.users[userIndex] = user;
		await writeUsersData(data);

		// Return without password
		const { password: _, token: __, ...safeUser } = user;
		res.json(safeUser);
	} catch (error) {
		console.error("Error updating user:", error);
		res.status(500).json({ error: "Ошибка обновления пользователя" });
	}
});

// Delete user (admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ error: "Требуются права администратора" });
		}

		const { id } = req.params;

		const data = await readUsersData();
		const userIndex = data.users.findIndex((u) => u.id === parseInt(id));

		if (userIndex === -1) {
			return res.status(404).json({ error: "Пользователь не найден" });
		}

		const user = data.users[userIndex];

		// Prevent deleting own account
		if (user.id === req.user.id) {
			return res
				.status(400)
				.json({ error: "Нельзя удалить свою учётную запись" });
		}

		data.users.splice(userIndex, 1);
		await writeUsersData(data);

		res.json({ success: true });
	} catch (error) {
		console.error("Error deleting user:", error);
		res.status(500).json({ error: "Ошибка удаления пользователя" });
	}
});

// Reset password (admin only)
router.post("/:id/reset-password", authMiddleware, async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ error: "Требуются права администратора" });
		}

		const { id } = req.params;
		const { newPassword } = req.body;

		const data = await readUsersData();
		const userIndex = data.users.findIndex((u) => u.id === parseInt(id));

		if (userIndex === -1) {
			return res.status(404).json({ error: "Пользователь не найден" });
		}

		if (!newPassword || newPassword.length < 4) {
			return res
				.status(400)
				.json({ error: "Пароль должен содержать минимум 4 символа" });
		}

		data.users[userIndex].password = newPassword;
		data.users[userIndex].passwordChangedAt = new Date().toISOString();
		data.users[userIndex].token = null; // Force re-login

		await writeUsersData(data);

		res.json({
			success: true,
			message: "Пароль изменён. Пользователю нужно войти заново.",
		});
	} catch (error) {
		console.error("Error resetting password:", error);
		res.status(500).json({ error: "Ошибка сброса пароля" });
	}
});

export default router;
