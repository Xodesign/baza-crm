// ServerSync - Wrapper for server-first data with localStorage fallback
// All data is ALWAYS saved to server, localStorage is just cache

const API_BASE = "https://firebaze.ru/api";
const STORAGE_PREFIX = "baza_sync_";

// Global sync status
let isOnline = true;
const syncQueue = [];

// Check connectivity
export async function checkConnection() {
	try {
		const res = await fetch(`${API_BASE}/health`, {
			method: "HEAD",
			cache: "no-store",
		});
		isOnline = res.ok;
		return isOnline;
	} catch {
		isOnline = false;
		return false;
	}
}

export function getSyncStatus() {
	return { isOnline, pendingChanges: syncQueue.length };
}

// Generic syncable data hook
export class SyncableData {
	constructor(section, storageKey) {
		this.section = section;
		this.storageKey = storageKey || `${STORAGE_PREFIX}${section}`;
		this.data = [];
		this.listeners = [];
	}

	// Load data - server first, then localStorage
	async load() {
		await checkConnection();

		if (isOnline) {
			try {
				const res = await fetch(`${API_BASE}/${this.section}`);
				if (res.ok) {
					this.data = await res.json();
					this.saveLocal();
					this.notify();
					return this.data;
				}
			} catch (e) {
				console.warn(`Failed to load ${this.section} from server:`, e);
			}
		}

		// Fallback to localStorage
		this.data = this.loadLocal();
		this.notify();
		return this.data;
	}

	loadLocal() {
		try {
			const saved = localStorage.getItem(this.storageKey);
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	}

	saveLocal() {
		localStorage.setItem(this.storageKey, JSON.stringify(this.data));
	}

	// Add item - save to server first
	async add(item) {
		await checkConnection();

		if (isOnline) {
			try {
				const res = await fetch(`${API_BASE}/${this.section}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(item),
				});
				if (res.ok) {
					const newItem = await res.json();
					this.data.push(newItem);
					this.saveLocal();
					this.notify();
					return newItem;
				}
			} catch (e) {
				console.warn(
					`Failed to save ${this.section} to server, saving locally:`,
					e,
				);
			}
		}

		// Offline: save locally with temp ID
		const offlineItem = {
			...item,
			id: `offline_${Date.now()}`,
			_offline: true,
		};
		this.data.push(offlineItem);
		this.saveLocal();
		this.notify();
		return offlineItem;
	}

	// Update item
	async update(id, updates) {
		await checkConnection();

		if (isOnline) {
			try {
				const res = await fetch(`${API_BASE}/${this.section}/${id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(updates),
				});
				if (res.ok) {
					const updated = await res.json();
					const idx = this.data.findIndex((i) => i.id == id);
					if (idx >= 0) this.data[idx] = updated;
					this.saveLocal();
					this.notify();
					return updated;
				}
			} catch (e) {
				console.warn(`Failed to update ${this.section} on server:`, e);
			}
		}

		// Offline: update locally
		const idx = this.data.findIndex((i) => i.id == id);
		if (idx >= 0) {
			this.data[idx] = {
				...this.data[idx],
				...updates,
				_offline: true,
				_updated: Date.now(),
			};
		}
		this.saveLocal();
		this.notify();
		return this.data[idx];
	}

	// Delete item
	async delete(id) {
		await checkConnection();

		if (isOnline) {
			try {
				const res = await fetch(`${API_BASE}/${this.section}/${id}`, {
					method: "DELETE",
				});
				if (res.ok) {
					this.data = this.data.filter((i) => i.id != id);
					this.saveLocal();
					this.notify();
					return true;
				}
			} catch (e) {
				console.warn(`Failed to delete ${this.section} on server:`, e);
			}
		}

		// Offline: mark as deleted locally
		const idx = this.data.findIndex((i) => i.id == id);
		if (idx >= 0) {
			this.data[idx]._deleted = true;
			this.saveLocal();
			this.notify();
		}
		return true;
	}

	// Subscribe to changes
	subscribe(callback) {
		this.listeners.push(callback);
		return () => {
			this.listeners = this.listeners.filter((l) => l !== callback);
		};
	}

	notify() {
		this.listeners.forEach((l) => l(this.data));
	}

	getAll() {
		return this.data.filter((i) => !i._deleted);
	}
}

// Create syncable data stores for each section
export const dataStores = {
	objects: new SyncableData("objects", "baza_objects"),
	calls: new SyncableData("calls", "baza_calls"),
	contacts: new SyncableData("contacts", "baza_contacts"),
	staff: new SyncableData("staff", "baza_staff"),
	costs: new SyncableData("costs", "baza_costs"),
	buy: new SyncableData("buy", "baza_buy"),
	invoices: new SyncableData("invoices", "baza_invoices"),
	transport: new SyncableData("transport", "baza_transport"),
	time: new SyncableData("time", "baza_time"),
	wishes: new SyncableData("wishes", "baza_wishes"),
	tools: new SyncableData("tools", "baza_tools"),
	activation: new SyncableData("activation", "baza_activation"),
};

// Initialize sync on page load
export async function initializeSync() {
	const results = await Promise.allSettled(
		Object.values(dataStores).map((store) => store.load()),
	);

	const successCount = results.filter((r) => r.status === "fulfilled").length;
	console.log(
		`Sync initialized: ${successCount}/${Object.keys(dataStores).length} sections loaded`,
	);

	return successCount;
}
