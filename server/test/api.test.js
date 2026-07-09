/**
 * CRM Backend API Tests
 * Run with: node test/api.test.js
 */

const API_BASE = process.env.API_URL || "http://localhost:3001/api";

const tests = [];
let passed = 0;
let failed = 0;

async function request(endpoint, options = {}) {
	const url = `${API_BASE}${endpoint}`;
	try {
		const response = await fetch(url, {
			headers: { "Content-Type": "application/json" },
			...options,
		});
		const data = await response.json();
		return { status: response.status, data, ok: response.ok };
	} catch (error) {
		return { status: 0, data: { error: error.message }, ok: false };
	}
}

function test(name, fn) {
	tests.push({ name, fn });
}

function assertEqual(actual, expected, message = "") {
	if (actual !== expected) {
		throw new Error(`${message} Expected ${expected}, got ${actual}`);
	}
}

function assertOk(data, message = "") {
	if (!data || (Array.isArray(data) && data.length === 0)) {
		throw new Error(`${message} No data received`);
	}
}

// === HEALTH CHECK ===
test("Health check returns OK", async () => {
	const res = await request("/health");
	assertEqual(res.status, 200, "Status");
	assertEqual(res.data.status, "ok", "Status field");
});

// === OBJECTS ===
test("Get all objects", async () => {
	const res = await request("/objects");
	assertEqual(res.status, 200, "Status");
	assertOk(res.data, "Objects");
	assertEqual(res.data.length >= 5, true, "Should have at least 5 objects");
});

test("Get single object", async () => {
	const res = await request("/objects/1");
	assertEqual(res.status, 200, "Status");
	assertEqual(res.data.id, 1, "Object ID");
	assertOk(res.data.object_name, "Object name");
});

test("Create new object", async () => {
	const newObj = {
		object_number: 999,
		customer: "Тестовый клиент",
		contractor: "Тест",
		contract_number: "TEST-001",
		contract_type: "ТО",
		object_name: "Тестовый объект",
		short_address: "Тестовая, 1",
	};
	const res = await request("/objects", {
		method: "POST",
		body: JSON.stringify(newObj),
	});
	assertEqual(res.status, 201, "Status");
	assertOk(res.data.id, "Created object ID");
});

test("Update object", async () => {
	const update = { notes: "Обновлено тестом" };
	const res = await request("/objects/1", {
		method: "PUT",
		body: JSON.stringify(update),
	});
	assertEqual(res.status, 200, "Status");
	assertEqual(res.data.notes, "Обновлено тестом", "Notes updated");
});

test("Delete test object", async () => {
	// Get max ID first
	const list = await request("/objects");
	const maxId = Math.max(...list.data.map((o) => o.id));

	const res = await request(`/objects/${maxId}`, { method: "DELETE" });
	assertEqual(res.status, 200, "Status");
});

// === STAFF ===
test("Get all staff", async () => {
	const res = await request("/staff");
	assertEqual(res.status, 200, "Status");
	assertOk(res.data, "Staff");
	assertEqual(
		res.data.length >= 6,
		true,
		"Should have at least 6 staff members",
	);
});

test("Create new staff", async () => {
	const newStaff = {
		full_name: "Тестов Тест Тестович",
		position: "Тестировщик",
		phone: "+7 (999) 999-99-99",
	};
	const res = await request("/staff", {
		method: "POST",
		body: JSON.stringify(newStaff),
	});
	assertEqual(res.status, 201, "Status");
});

// === CALLS ===
test("Get all calls", async () => {
	const res = await request("/calls");
	assertEqual(res.status, 200, "Status");
	assertOk(res.data, "Calls");
});

test("Filter calls by status", async () => {
	const res = await request("/calls?status=new");
	assertEqual(res.status, 200, "Status");
	res.data.forEach((call) => {
		assertEqual(call.status, "new", "Call status");
	});
});

// === COSTS ===
test("Get all costs", async () => {
	const res = await request("/costs");
	assertEqual(res.status, 200, "Status");
	assertOk(res.data, "Costs");
});

test("Create new cost", async () => {
	const newCost = {
		object_name: "Тестовый объект",
		system: "АПС",
		amount: "10 000",
		reason: "Тестовая затрата",
	};
	const res = await request("/costs", {
		method: "POST",
		body: JSON.stringify(newCost),
	});
	assertEqual(res.status, 201, "Status");
});

// === SYSTEMS ===
test("Get all systems", async () => {
	const res = await request("/systems");
	assertEqual(res.status, 200, "Status");
});

test("Create new system", async () => {
	const newSystem = {
		parent_object: "ТЦ Мега",
		system_type: "АПС",
		brand: "Болид",
	};
	const res = await request("/systems", {
		method: "POST",
		body: JSON.stringify(newSystem),
	});
	assertEqual(res.status, 201, "Status");
});

// === TOOLS ===
test("Get all tools", async () => {
	const res = await request("/tools");
	assertEqual(res.status, 200, "Status");
});

// === TRANSPORT ===
test("Get all transport", async () => {
	const res = await request("/transport");
	assertEqual(res.status, 200, "Status");
});

test("Create transport request", async () => {
	const newTransport = {
		object_name: "ТЦ Мега",
		what_to_transport: "Тестовый инструмент",
	};
	const res = await request("/transport", {
		method: "POST",
		body: JSON.stringify(newTransport),
	});
	assertEqual(res.status, 201, "Status");
});

// === BUY ===
test("Get all buy requests", async () => {
	const res = await request("/buy");
	assertEqual(res.status, 200, "Status");
});

// === INVOICES ===
test("Get all invoices", async () => {
	const res = await request("/invoices");
	assertEqual(res.status, 200, "Status");
});

// === CONTACTS ===
test("Get all contacts", async () => {
	const res = await request("/contacts");
	assertEqual(res.status, 200, "Status");
});

test("Create new contact", async () => {
	const newContact = {
		name: "Тест Контакт",
		phone: "+7 999 123-45-67",
		object_name: "ТЦ Мега",
	};
	const res = await request("/contacts", {
		method: "POST",
		body: JSON.stringify(newContact),
	});
	assertEqual(res.status, 201, "Status");
});

// === 404 HANDLING ===
test("Returns 404 for non-existent resource", async () => {
	const res = await request("/objects/999999");
	assertEqual(res.status, 404, "Status");
});

// === ERROR HANDLING ===
test("Returns 404 for invalid endpoint", async () => {
	const res = await request("/invalid-endpoint");
	assertEqual(res.status, 404, "Status");
});

// Run all tests
async function runTests() {
	console.log("🧪 CRM Backend API Tests\n");
	console.log(`API: ${API_BASE}\n`);

	for (const { name, fn } of tests) {
		try {
			await fn();
			console.log(`✅ ${name}`);
			passed++;
		} catch (error) {
			console.log(`❌ ${name}`);
			console.log(`   Error: ${error.message}`);
			failed++;
		}
	}

	console.log(
		`\n📊 Results: ${passed} passed, ${failed} failed, ${tests.length} total`,
	);

	if (failed > 0) {
		process.exit(1);
	}
}

runTests();
