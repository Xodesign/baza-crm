// API client for CRM Backend
const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:3001/api";

class ApiClient {
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
	}

	async request(endpoint, options = {}) {
		const url = `${this.baseUrl}${endpoint}`;
		const config = {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		};

		try {
			const response = await fetch(url, config);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Request failed");
			}

			return data;
		} catch (error) {
			console.error(`API Error [${endpoint}]:`, error);
			throw error;
		}
	}

	// Objects
	async getObjects() {
		return this.request("/objects");
	}

	async getObject(id) {
		return this.request(`/objects/${id}`);
	}

	async createObject(data) {
		return this.request("/objects", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateObject(id, data) {
		return this.request(`/objects/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteObject(id) {
		return this.request(`/objects/${id}`, { method: "DELETE" });
	}

	// Calls
	async getCalls(params = {}) {
		const query = new URLSearchParams(params).toString();
		return this.request(`/calls${query ? `?${query}` : ""}`);
	}

	async getCall(id) {
		return this.request(`/calls/${id}`);
	}

	async createCall(data) {
		return this.request("/calls", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateCall(id, data) {
		return this.request(`/calls/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteCall(id) {
		return this.request(`/calls/${id}`, { method: "DELETE" });
	}

	// Staff
	async getStaff() {
		return this.request("/staff");
	}

	async getStaffMember(id) {
		return this.request(`/staff/${id}`);
	}

	async createStaff(data) {
		return this.request("/staff", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateStaff(id, data) {
		return this.request(`/staff/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteStaff(id) {
		return this.request(`/staff/${id}`, { method: "DELETE" });
	}

	// Costs
	async getCosts(params = {}) {
		const query = new URLSearchParams(params).toString();
		return this.request(`/costs${query ? `?${query}` : ""}`);
	}

	async createCost(data) {
		return this.request("/costs", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateCost(id, data) {
		return this.request(`/costs/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteCost(id) {
		return this.request(`/costs/${id}`, { method: "DELETE" });
	}

	// Systems
	async getSystems(params = {}) {
		const query = new URLSearchParams(params).toString();
		return this.request(`/systems${query ? `?${query}` : ""}`);
	}

	async createSystem(data) {
		return this.request("/systems", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateSystem(id, data) {
		return this.request(`/systems/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteSystem(id) {
		return this.request(`/systems/${id}`, { method: "DELETE" });
	}

	// Tools
	async getTools(params = {}) {
		const query = new URLSearchParams(params).toString();
		return this.request(`/tools${query ? `?${query}` : ""}`);
	}

	async createTool(data) {
		return this.request("/tools", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateTool(id, data) {
		return this.request(`/tools/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteTool(id) {
		return this.request(`/tools/${id}`, { method: "DELETE" });
	}

	// Transport
	async getTransport() {
		return this.request("/transport");
	}

	async createTransport(data) {
		return this.request("/transport", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateTransport(id, data) {
		return this.request(`/transport/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteTransport(id) {
		return this.request(`/transport/${id}`, { method: "DELETE" });
	}

	// Buy
	async getBuy(params = {}) {
		const query = new URLSearchParams(params).toString();
		return this.request(`/buy${query ? `?${query}` : ""}`);
	}

	async createBuy(data) {
		return this.request("/buy", { method: "POST", body: JSON.stringify(data) });
	}

	async updateBuy(id, data) {
		return this.request(`/buy/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteBuy(id) {
		return this.request(`/buy/${id}`, { method: "DELETE" });
	}

	// Invoices
	async getInvoices() {
		return this.request("/invoices");
	}

	async createInvoice(data) {
		return this.request("/invoices", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateInvoice(id, data) {
		return this.request(`/invoices/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteInvoice(id) {
		return this.request(`/invoices/${id}`, { method: "DELETE" });
	}

	// Contacts
	async getContacts(params = {}) {
		const query = new URLSearchParams(params).toString();
		return this.request(`/contacts${query ? `?${query}` : ""}`);
	}

	async createContact(data) {
		return this.request("/contacts", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateContact(id, data) {
		return this.request(`/contacts/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteContact(id) {
		return this.request(`/contacts/${id}`, { method: "DELETE" });
	}

	// Activations
	async getActivations(params = {}) {
		const query = new URLSearchParams(params).toString();
		return this.request(`/activations${query ? `?${query}` : ""}`);
	}

	async createActivation(data) {
		return this.request("/activations", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateActivation(id, data) {
		return this.request(`/activations/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteActivation(id) {
		return this.request(`/activations/${id}`, { method: "DELETE" });
	}

	// Time
	async getTime() {
		return this.request("/time");
	}

	async createTime(data) {
		return this.request("/time", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateTime(id, data) {
		return this.request(`/time/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteTime(id) {
		return this.request(`/time/${id}`, { method: "DELETE" });
	}

	// Wishes
	async getWishes() {
		return this.request("/wishes");
	}

	async createWish(data) {
		return this.request("/wishes", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateWish(id, data) {
		return this.request(`/wishes/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteWish(id) {
		return this.request(`/wishes/${id}`, { method: "DELETE" });
	}

	// Health check
	async healthCheck() {
		return this.request("/health");
	}

	// Mobile Objects (uses /api/mobile/objects)
	async getMobileObjects() {
		return this.request("/mobile/objects");
	}

	async createMobileObject(data) {
		return this.request("/mobile/objects", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateMobileObject(id, data) {
		return this.request(`/mobile/objects/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteMobileObject(id) {
		return this.request(`/mobile/objects/${id}`, {
			method: "DELETE",
		});
	}

	// RD — Рабочая документация
	async getRDFolders() {
		return this.request("/mobile/rd/folders");
	}
	async createRDFolder(name, parentId) {
		return this.request("/mobile/rd/folders", {
			method: "POST",
			body: JSON.stringify({ name, parentId }),
		});
	}
	async deleteRDFolder(id) {
		return this.request(`/mobile/rd/folders/${id}`, {
			method: "DELETE",
		});
	}
	async getRDFiles(folderId) {
		return this.request(`/mobile/rd/files${folderId ? `?folderId=${folderId}` : ""}`);
	}
	async uploadRDFile(file, folderId) {
		const formData = new FormData();
		formData.append("file", file);
		if (folderId) formData.append("folderId", folderId);
		return fetch(`${this.baseUrl}/mobile/rd/files`, {
			method: "POST",
			body: formData,
		}).then((r) => r.json());
	}
	async deleteRDFile(id) {
		return this.request(`/mobile/rd/files/${id}`, {
			method: "DELETE",
		});
	}
	getRDFilesUrl(id) {
		return `${this.baseUrl}/mobile/rd/files/${id}/download`;
	}
}

export const api = new ApiClient(API_BASE_URL);
export default api;
