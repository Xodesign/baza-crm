// Auth API client
const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://186.246.10.122:3000/api";

export const authApi = {
	async login(username, password) {
		const response = await fetch(`${API_BASE_URL}/users/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, password }),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || "Ошибка авторизации");
		}

		return data;
	},

	async logout() {
		const token = localStorage.getItem("authToken");
		if (!token) return;

		try {
			await fetch(`${API_BASE_URL}/users/logout`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});
		} catch (error) {
			console.error("Logout error:", error);
		}
	},

	async getCurrentUser() {
		const token = localStorage.getItem("authToken");
		if (!token) return null;

		try {
			const response = await fetch(`${API_BASE_URL}/users/me`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!response.ok) return null;
			return await response.json();
		} catch (error) {
			console.error("Get user error:", error);
			return null;
		}
	},

	async getUsers() {
		const token = localStorage.getItem("authToken");
		if (!token) throw new Error("Не авторизован");

		const response = await fetch(`${API_BASE_URL}/users`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		const data = await response.json();
		if (!response.ok)
			throw new Error(data.error || "Ошибка получения пользователей");
		return data;
	},

	async getRoles() {
		const token = localStorage.getItem("authToken");
		if (!token) throw new Error("Не авторизован");

		const response = await fetch(`${API_BASE_URL}/users/roles`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Ошибка получения ролей");
		return data;
	},

	async getSections() {
		const token = localStorage.getItem("authToken");
		if (!token) throw new Error("Не авторизован");

		const response = await fetch(`${API_BASE_URL}/users/sections`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		const data = await response.json();
		if (!response.ok)
			throw new Error(data.error || "Ошибка получения разделов");
		return data;
	},

	async createUser(userData) {
		const token = localStorage.getItem("authToken");
		if (!token) throw new Error("Не авторизован");

		const response = await fetch(`${API_BASE_URL}/users`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(userData),
		});

		const data = await response.json();
		if (!response.ok)
			throw new Error(data.error || "Ошибка создания пользователя");
		return data;
	},

	async updateUser(id, userData) {
		const token = localStorage.getItem("authToken");
		if (!token) throw new Error("Не авторизован");

		const response = await fetch(`${API_BASE_URL}/users/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(userData),
		});

		const data = await response.json();
		if (!response.ok)
			throw new Error(data.error || "Ошибка обновления пользователя");
		return data;
	},

	async deleteUser(id) {
		const token = localStorage.getItem("authToken");
		if (!token) throw new Error("Не авторизован");

		const response = await fetch(`${API_BASE_URL}/users/${id}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});

		const data = await response.json();
		if (!response.ok)
			throw new Error(data.error || "Ошибка удаления пользователя");
		return data;
	},

	async resetPassword(id, newPassword) {
		const token = localStorage.getItem("authToken");
		if (!token) throw new Error("Не авторизован");

		const response = await fetch(`${API_BASE_URL}/users/${id}/reset-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ newPassword }),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Ошибка сброса пароля");
		return data;
	},

	async toggleUserActive(id) {
		const token = localStorage.getItem("authToken");
		if (!token) throw new Error("Не авторизован");

		const response = await fetch(`${API_BASE_URL}/users/${id}/toggle`, {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Ошибка изменения статуса");
		return data;
	},
};

// Check if user has access to a section
export function hasAccess(user, section) {
	if (!user) return false;
	if (user.role === "admin" || user.permissions?.all) return true;
	return user.permissions?.[section] === true;
}

// Get sections user can access
export function getAccessibleSections(user) {
	if (!user) return [];

	const allSections = [
		{ id: "objects", name: "Объекты", icon: "Building2" },
		{ id: "calls", name: "Вызовы", icon: "Phone" },
		{ id: "contacts", name: "Контакты", icon: "Users" },
		{ id: "staff", name: "Персонал", icon: "UserCheck" },
		{ id: "systems", name: "Системы", icon: "Server" },
		{ id: "tools", name: "Инструменты", icon: "Wrench" },
		{ id: "activation", name: "Актирование", icon: "FileText" },
		{ id: "costs", name: "Расходы", icon: "DollarSign" },
		{ id: "buy", name: "Закупки", icon: "ShoppingCart" },
		{ id: "invoices", name: "Счета", icon: "CreditCard" },
		{ id: "transport", name: "Транспорт", icon: "Truck" },
		{ id: "time", name: "Время", icon: "Clock" },
		{ id: "wishes", name: "Пожелания", icon: "Heart" },
		{ id: "users", name: "Пользователи", icon: "UserCog" },
	];

	if (user.role === "admin" || user.permissions?.all) return allSections;

	return allSections.filter((section) => hasAccess(user, section.id));
}
