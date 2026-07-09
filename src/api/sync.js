// Sync API - Centralized data sync with server
const API_BASE = "http://186.246.10.122:3000/api";

const syncApi = {
	// Generic CRUD operations
	async getAll(section) {
		const res = await fetch(`${API_BASE}/${section}`);
		if (!res.ok) throw new Error(`Failed to load ${section}`);
		return res.json();
	},

	async create(section, data) {
		const res = await fetch(`${API_BASE}/${section}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error(`Failed to create ${section}`);
		return res.json();
	},

	async update(section, id, data) {
		const res = await fetch(`${API_BASE}/${section}/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error(`Failed to update ${section}`);
		return res.json();
	},

	async delete(section, id) {
		const res = await fetch(`${API_BASE}/${section}/${id}`, {
			method: "DELETE",
		});
		if (!res.ok) throw new Error(`Failed to delete ${section}`);
		return res.json();
	},

	// Specific section methods
	async getObjects() {
		return this.getAll("objects");
	},
	async createObject(data) {
		return this.create("objects", data);
	},
	async updateObject(id, data) {
		return this.update("objects", id, data);
	},
	async deleteObject(id) {
		return this.delete("objects", id);
	},

	async getCalls() {
		return this.getAll("calls");
	},
	async createCall(data) {
		return this.create("calls", data);
	},
	async updateCall(id, data) {
		return this.update("calls", id, data);
	},
	async deleteCall(id) {
		return this.delete("calls", id);
	},

	async getContacts() {
		return this.getAll("contacts");
	},
	async createContact(data) {
		return this.create("contacts", data);
	},
	async updateContact(id, data) {
		return this.update("contacts", id, data);
	},
	async deleteContact(id) {
		return this.delete("contacts", id);
	},

	async getStaff() {
		return this.getAll("staff");
	},
	async createStaff(data) {
		return this.create("staff", data);
	},
	async updateStaff(id, data) {
		return this.update("staff", id, data);
	},
	async deleteStaff(id) {
		return this.delete("staff", id);
	},

	async getCosts() {
		return this.getAll("costs");
	},
	async createCost(data) {
		return this.create("costs", data);
	},
	async updateCost(id, data) {
		return this.update("costs", id, data);
	},
	async deleteCost(id) {
		return this.delete("costs", id);
	},

	async getBuy() {
		return this.getAll("buy");
	},
	async createBuyRequest(data) {
		return this.create("buy", data);
	},
	async updateBuyRequest(id, data) {
		return this.update("buy", id, data);
	},
	async deleteBuyRequest(id) {
		return this.delete("buy", id);
	},

	async getInvoices() {
		return this.getAll("invoices");
	},
	async createInvoice(data) {
		return this.create("invoices", data);
	},
	async updateInvoice(id, data) {
		return this.update("invoices", id, data);
	},
	async deleteInvoice(id) {
		return this.delete("invoices", id);
	},

	async getTransport() {
		return this.getAll("transport");
	},
	async createTransport(data) {
		return this.create("transport", data);
	},
	async updateTransport(id, data) {
		return this.update("transport", id, data);
	},
	async deleteTransport(id) {
		return this.delete("transport", id);
	},

	async getTime() {
		return this.getAll("time");
	},
	async createTimeEntry(data) {
		return this.create("time", data);
	},
	async updateTimeEntry(id, data) {
		return this.update("time", id, data);
	},
	async deleteTimeEntry(id) {
		return this.delete("time", id);
	},

	async getWishes() {
		return this.getAll("wishes");
	},
	async createWish(data) {
		return this.create("wishes", data);
	},
	async updateWish(id, data) {
		return this.update("wishes", id, data);
	},
	async deleteWish(id) {
		return this.delete("wishes", id);
	},

	async getTools() {
		return this.getAll("tools");
	},
	async createTool(data) {
		return this.create("tools", data);
	},
	async updateTool(id, data) {
		return this.update("tools", id, data);
	},
	async deleteTool(id) {
		return this.delete("tools", id);
	},

	async getActivations() {
		return this.getAll("activation");
	},
	async createActivation(data) {
		return this.create("activation", data);
	},
	async updateActivation(id, data) {
		return this.update("activation", id, data);
	},
	async deleteActivation(id) {
		return this.delete("activation", id);
	},
};

export default syncApi;
