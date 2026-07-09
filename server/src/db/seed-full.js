import pg from "pg";
const { Client } = pg;

const dbUrl = new URL(
	process.env.DATABASE_URL ||
		"postgresql://crm_user:crm_password@127.0.0.1:5432/crm_db",
);

async function seedFullData() {
	const client = new Client({
		user: dbUrl.username,
		password: dbUrl.password,
		host: dbUrl.hostname,
		port: parseInt(dbUrl.port) || 5432,
		database: dbUrl.pathname.slice(1) || "crm_db",
	});

	try {
		await client.connect();
		console.log("Connected to PostgreSQL");

		// Clear existing data
		console.log("Clearing existing data...");
		await client.query(
			"TRUNCATE objects, staff, calls, costs, systems, tools, contacts, transport, buy, invoices, activations, time_entries, summary, calendar_object, wishes, extra CASCADE",
		);

		// Import Objects
		console.log("Importing Objects...");
		const objectsData = [
			{
				object_number: 1,
				customer: "ООО Торговый Центр",
				contractor: "СБ",
				contract_number: "ТЦ-001/2024",
				contract_start_date: "01.01.2024",
				contract_end_date: "31.12.2024",
				contract_type: "ТО",
				renewability: "Продлеваемый автоматически",
				full_address: "г. Москва, ул. Тверская, д. 15",
				short_address: "Тверская, 15",
				object_name: "ТЦ Мега",
				systems: "АПС, СОУЭ",
				contacts: "Иванов +79991234567",
				has_tool: "есть",
				notes: "VIP клиент",
			},
			{
				object_number: 2,
				customer: "ЗАО СтройИнвест",
				contractor: "СБ+",
				contract_number: "СИ-002/2024",
				contract_start_date: "15.02.2024",
				contract_end_date: "14.02.2025",
				contract_type: "СМР",
				renewability: "Конкурсный",
				full_address: "г. СПб, Невский пр., д. 100",
				short_address: "Невский, 100",
				object_name: "БЦ Невский",
				systems: "ВИДЕОНАБЛЮДЕНИЕ",
				contacts: "Петров +79992345678",
				has_tool: "нет",
				notes: "",
			},
			{
				object_number: 3,
				customer: "ИП Сидоров",
				contractor: "ВСТ",
				contract_number: "ИП-003/2024",
				contract_start_date: "01.03.2024",
				contract_end_date: "28.02.2025",
				contract_type: "ПИР",
				renewability: "Не продлеваемый",
				full_address: "г. Екатеринбург, ул. Ленина, д. 50",
				short_address: "Ленина, 50",
				object_name: "ТРЦ Галерея",
				systems: "АПС, СОУЭ, ВПВ",
				contacts: "Сидоров +79993456789",
				has_tool: "есть",
				notes: "Срочные заявки",
			},
			{
				object_number: 4,
				customer: "ООО Ромашка",
				contractor: "ИП",
				contract_number: "РМ-004/2024",
				contract_start_date: "20.04.2024",
				contract_end_date: "19.04.2025",
				contract_type: "ТО",
				renewability: "Продлеваемый доп соглашением",
				full_address: "г. Новосибирск, ул. Красная, д. 25",
				short_address: "Красная, 25",
				object_name: "Супермаркет Ромашка",
				systems: "ОПС",
				contacts: "Козлов +79994567890",
				has_tool: "нет",
				notes: "",
			},
			{
				object_number: 5,
				customer: "ПАО Газпром",
				contractor: "СБ",
				contract_number: "ГЗ-005/2024",
				contract_start_date: "01.05.2024",
				contract_end_date: "31.12.2025",
				contract_type: "ТО",
				renewability: "Продлеваемый автоматически",
				full_address: "г. Москва, Пресненская наб., д. 12",
				short_address: "Пресненская, 12",
				object_name: "Штаб-квартира Газпром",
				systems: "АПС, СОУЭ, ВПВ, ВИДЕОНАБЛЮДЕНИЕ",
				contacts: "Смирнов +79995678901",
				has_tool: "есть",
				notes: "Высший приоритет",
			},
		];

		for (const obj of objectsData) {
			await client.query(
				`INSERT INTO objects (object_number, customer, contractor, contract_number, contract_start_date, contract_end_date, contract_type, renewability, full_address, short_address, object_name, systems, contacts, has_tool, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
				[
					obj.object_number,
					obj.customer,
					obj.contractor,
					obj.contract_number,
					obj.contract_start_date,
					obj.contract_end_date,
					obj.contract_type,
					obj.renewability,
					obj.full_address,
					obj.short_address,
					obj.object_name,
					obj.systems,
					obj.contacts,
					obj.has_tool,
					obj.notes,
				],
			);
		}
		console.log(`  Imported ${objectsData.length} objects`);

		// Import Staff
		console.log("Importing Staff...");
		const staffData = [
			{
				full_name: "Иванов Иван Иванович",
				position: "Главный инженер",
				location: "Офис Москва",
				phone: "+7 (999) 123-45-67",
				email: "ivanov@company.ru",
				description: "Опыт работы 10 лет",
			},
			{
				full_name: "Петров Пётр Петрович",
				position: "Инженер",
				location: "Офис СПб",
				phone: "+7 (999) 234-56-78",
				email: "petrov@company.ru",
				description: "Специалист по видеонаблюдению",
			},
			{
				full_name: "Сидоров Алексей Сергеевич",
				position: "Старший инженер",
				location: "Офис Екатеринбург",
				phone: "+7 (999) 345-67-89",
				email: "sidorov@company.ru",
				description: "Монтаж и наладка систем безопасности",
			},
			{
				full_name: "Козлова Мария Олеговна",
				position: "Инженер",
				location: "Офис Новосибирск",
				phone: "+7 (999) 456-78-90",
				email: "kozlova@company.ru",
				description: "Обслуживание СКУД",
			},
			{
				full_name: "Смирнов Дмитрий Андреевич",
				position: "Техник",
				location: "Офис Москва",
				phone: "+7 (999) 567-89-01",
				email: "smirnov@company.ru",
				description: "Выездной специалист",
			},
			{
				full_name: "Новикова Елена Викторовна",
				position: "Менеджер проектов",
				location: "Офис Москва",
				phone: "+7 (999) 678-90-12",
				email: "novikova@company.ru",
				description: "Координация работ",
			},
		];

		for (const staff of staffData) {
			await client.query(
				`INSERT INTO staff (full_name, position, location, phone, email, description) VALUES ($1,$2,$3,$4,$5,$6)`,
				[
					staff.full_name,
					staff.position,
					staff.location,
					staff.phone,
					staff.email,
					staff.description,
				],
			);
		}
		console.log(`  Imported ${staffData.length} staff members`);

		// Import Calls
		console.log("Importing Calls...");
		const callsData = [
			{
				status: "new",
				type: "Аварийная",
				object_name: "ТЦ Мега",
				short_address: "Тверская, 15",
				system: "АПС",
				request: "Сработка датчика на 3 этаже",
				engineer: "Иванов Иван Иванович",
				deadline: "18.06.2026",
			},
			{
				status: "in_progress",
				type: "Плановая",
				object_name: "БЦ Невский",
				short_address: "Невский, 100",
				system: "ВИДЕОНАБЛЮДЕНИЕ",
				request: "Замена камеры в холле",
				engineer: "Петров Пётр Петрович",
				deadline: "20.06.2026",
			},
			{
				status: "completed",
				type: "ТО",
				object_name: "ТРЦ Галерея",
				short_address: "Ленина, 50",
				system: "СОУЭ",
				request: "Ежемесячное ТО системы оповещения",
				engineer: "Сидоров Алексей Сергеевич",
				deadline: "15.06.2026",
			},
			{
				status: "new",
				type: "Заявка",
				object_name: "Супермаркет Ромашка",
				short_address: "Красная, 25",
				system: "ОПС",
				request: "Ложное срабатывание сигнализации",
				engineer: "Козлова Мария Олеговна",
				deadline: "19.06.2026",
			},
			{
				status: "new",
				type: "Аварийная",
				object_name: "Штаб-квартира Газпром",
				short_address: "Пресненская, 12",
				system: "ВИДЕОНАБЛЮДЕНИЕ",
				request: "Неисправность записи архива",
				engineer: "Петров Пётр Петрович",
				deadline: "17.06.2026",
			},
		];

		for (const call of callsData) {
			await client.query(
				`INSERT INTO calls (status, type, object_name, short_address, system, request, engineer, deadline) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
				[
					call.status,
					call.type,
					call.object_name,
					call.short_address,
					call.system,
					call.request,
					call.engineer,
					call.deadline,
				],
			);
		}
		console.log(`  Imported ${callsData.length} calls`);

		// Import Costs
		console.log("Importing Costs...");
		const costsData = [
			{
				object_name: "ТЦ Мега",
				short_address: "Тверская, 15",
				system: "АПС",
				employee: "Иванов Иван Иванович",
				amount: "15 000",
				reason: "Замена датчика",
				description: "Вышел из строя дымовой датчик",
			},
			{
				object_name: "БЦ Невский",
				short_address: "Невский, 100",
				system: "ВИДЕОНАБЛЮДЕНИЕ",
				employee: "Петров Пётр Петрович",
				amount: "8 500",
				reason: "Ремонт камеры",
				description: "Замена блока питания",
			},
			{
				object_name: "ТРЦ Галерея",
				short_address: "Ленина, 50",
				system: "СОУЭ",
				employee: "Сидоров Алексей Сергеевич",
				amount: "25 000",
				reason: "Модернизация",
				description: "Установка доп. оповещателей",
			},
			{
				object_name: "Штаб-квартира Газпром",
				short_address: "Пресненская, 12",
				system: "СКУД",
				employee: "Смирнов Дмитрий Андреевич",
				amount: "45 000",
				reason: "Замена замка",
				description: "Замена магнитного замка",
			},
		];

		for (const cost of costsData) {
			await client.query(
				`INSERT INTO costs (object_name, short_address, system, employee, amount, reason, description) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
				[
					cost.object_name,
					cost.short_address,
					cost.system,
					cost.employee,
					cost.amount,
					cost.reason,
					cost.description,
				],
			);
		}
		console.log(`  Imported ${costsData.length} costs`);

		// Import Systems
		console.log("Importing Systems...");
		const systemsData = [
			{
				parent_object: "ТЦ Мега",
				system_type: "АПС",
				brand: "Болид",
				system_kind: "Пожарная сигнализация",
				quantity: "25",
			},
			{
				parent_object: "ТЦ Мега",
				system_type: "СОУЭ",
				brand: "Болид",
				system_kind: "Оповещение",
				quantity: "12",
			},
			{
				parent_object: "БЦ Невский",
				system_type: "ВИДЕОНАБЛЮДЕНИЕ",
				brand: "Hikvision",
				system_kind: "Видеонаблюдение",
				quantity: "32",
			},
			{
				parent_object: "ТРЦ Галерея",
				system_type: "ВПВ",
				brand: "Grinn",
				system_kind: "Пожаротушение",
				quantity: "18",
			},
		];

		for (const system of systemsData) {
			await client.query(
				`INSERT INTO systems (parent_object, system_type, brand, system_kind, quantity) VALUES ($1,$2,$3,$4,$5)`,
				[
					system.parent_object,
					system.system_type,
					system.brand,
					system.system_kind,
					system.quantity,
				],
			);
		}
		console.log(`  Imported ${systemsData.length} systems`);

		// Import Contacts
		console.log("Importing Contacts...");
		const contactsData = [
			{
				name: "Иванов Иван Иванович",
				phone: "+7 (999) 123-45-67",
				object_name: "ТЦ Мега",
				source: "object",
			},
			{
				name: "Петров Пётр Петрович",
				phone: "+7 (999) 234-56-78",
				object_name: "БЦ Невский",
				source: "object",
			},
			{
				name: "Сидоров Алексей Сергеевич",
				phone: "+7 (999) 345-67-89",
				object_name: "ТРЦ Галерея",
				source: "object",
			},
			{
				name: "Козлов Николай Николаевич",
				phone: "+7 (999) 456-78-90",
				object_name: "Супермаркет Ромашка",
				source: "object",
			},
			{
				name: "Смирнов Дмитрий Андреевич",
				phone: "+7 (999) 567-89-01",
				object_name: "Штаб-квартира Газпром",
				source: "object",
			},
		];

		for (const contact of contactsData) {
			await client.query(
				`INSERT INTO contacts (name, phone, object_name, source) VALUES ($1,$2,$3,$4)`,
				[contact.name, contact.phone, contact.object_name, contact.source],
			);
		}
		console.log(`  Imported ${contactsData.length} contacts`);

		console.log("\n✅ Full data import complete!");

		// Show summary
		const counts = await client.query(`
      SELECT 'objects' as table_name, COUNT(*) as cnt FROM objects
      UNION ALL SELECT 'staff', COUNT(*) FROM staff
      UNION ALL SELECT 'calls', COUNT(*) FROM calls
      UNION ALL SELECT 'costs', COUNT(*) FROM costs
      UNION ALL SELECT 'systems', COUNT(*) FROM systems
      UNION ALL SELECT 'contacts', COUNT(*) FROM contacts
    `);

		console.log("\n📊 Database summary:");
		counts.rows.forEach((row) =>
			console.log(`  ${row.table_name}: ${row.cnt}`),
		);

		await client.end();
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

seedFullData();
