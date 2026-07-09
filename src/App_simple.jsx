import { useState, useEffect } from "react";

const SECTIONS = [
	{ id: "objects", name: "Объекты", icon: "🏢" },
	{ id: "calls", name: "Вызовы", icon: "📞" },
	{ id: "tools", name: "Инструменты", icon: "🔧" },
	{ id: "requests", name: "Заявки", icon: "📋" },
	{ id: "calendar", name: "Календарь", icon: "📅" },
];

// Демо данные
const DEMO_OBJECTS = [
	{
		id: 1,
		name: "Кубинка АВАНГАРД",
		address: "территория Парк Патриот, дом 3",
		customer: "ООО Рога и Копыта",
	},
	{
		id: 2,
		name: "ЧОУ Ступени",
		address: "Марии Поливановой 12А",
		customer: "ИП Сидоров",
	},
	{
		id: 3,
		name: "ЗАО ПИОНЕР",
		address: "Симферопольский бульвар 25",
		customer: "ЗАО Вектор",
	},
];

const DEMO_CALLS = [
	{
		id: 1,
		object: "Кубинка АВАНГАРД",
		status: "new",
		date: "29.06.2026",
		description: "ТО АПС",
	},
	{
		id: 2,
		object: "ЧОУ Ступени",
		status: "in_progress",
		date: "29.06.2026",
		description: "Ремонт датчика",
	},
	{
		id: 3,
		object: "ЗАО ПИОНЕР",
		status: "completed",
		date: "28.06.2026",
		description: "Проверка СОУЭ",
	},
];

export default function App() {
	const [activeSection, setActiveSection] = useState("objects");
	const [data, setData] = useState({
		objects: [],
		calls: [],
		tools: [],
		requests: [],
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		// Загружаем данные
		const loadData = async () => {
			try {
				const [objects, calls] = await Promise.all([
					fetch("http://186.246.10.122:3000/api/objects")
						.then((r) => r.json())
						.catch(() => DEMO_OBJECTS),
					fetch("http://186.246.10.122:3000/api/calls")
						.then((r) => r.json())
						.catch(() => DEMO_CALLS),
				]);
				setData({ objects, calls, tools: [], requests: [] });
			} catch (e) {
				setError(e.message);
				setData({
					objects: DEMO_OBJECTS,
					calls: DEMO_CALLS,
					tools: [],
					requests: [],
				});
			}
			setLoading(false);
		};
		loadData();
	}, []);

	const renderObjects = () => (
		<div>
			<h2>Объекты ({data.objects.length})</h2>
			<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr style={{ background: "#3498db", color: "white" }}>
						<th style={{ padding: "10px", textAlign: "left" }}>Название</th>
						<th style={{ padding: "10px", textAlign: "left" }}>Адрес</th>
						<th style={{ padding: "10px", textAlign: "left" }}>Заказчик</th>
					</tr>
				</thead>
				<tbody>
					{data.objects.map((obj, i) => (
						<tr
							key={obj.id || i}
							style={{
								background: i % 2 === 0 ? "#f5f5f5" : "white",
								borderBottom: "1px solid #ddd",
							}}
						>
							<td style={{ padding: "10px" }}>
								{obj["Наименование объекта"] || obj.name || "-"}
							</td>
							<td style={{ padding: "10px" }}>
								{obj["Адрес сокращенный"] || obj.address || "-"}
							</td>
							<td style={{ padding: "10px" }}>
								{obj["Заказчик"] || obj.customer || "-"}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);

	const renderCalls = () => (
		<div>
			<h2>Вызовы ({data.calls.length})</h2>
			<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
				{data.calls.map((call, i) => (
					<div
						key={call.id || i}
						style={{
							padding: "15px",
							background: "white",
							borderRadius: "8px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							borderLeft: `4px solid ${call.status === "completed" ? "#27ae60" : call.status === "in_progress" ? "#f39c12" : "#3498db"}`,
						}}
					>
						<strong>
							{call.object ||
								call["Наименование объекта"] ||
								"Объект " + (i + 1)}
						</strong>
						<div style={{ color: "#666", marginTop: "5px" }}>
							{call.description || call.request || "-"}
						</div>
						<div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
							{call.date || "-"}
						</div>
					</div>
				))}
			</div>
		</div>
	);

	if (loading) return <div style={{ padding: "20px" }}>Загрузка...</div>;

	return (
		<div
			style={{
				fontFamily: "system-ui, sans-serif",
				minHeight: "100vh",
				background: "#f5f5f5",
			}}
		>
			{/* Header */}
			<header
				style={{
					background: "#3498db",
					color: "white",
					padding: "15px 20px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<h1 style={{ margin: 0, fontSize: "20px" }}>База — CRM</h1>
				<span style={{ fontSize: "14px", opacity: 0.8 }}>
					{new Date().toLocaleDateString()}
				</span>
			</header>

			{/* Navigation */}
			<nav
				style={{
					background: "white",
					display: "flex",
					overflowX: "auto",
					borderBottom: "1px solid #ddd",
				}}
			>
				{SECTIONS.map((s) => (
					<button
						key={s.id}
						onClick={() => setActiveSection(s.id)}
						style={{
							padding: "12px 20px",
							border: "none",
							background: activeSection === s.id ? "#3498db" : "transparent",
							color: activeSection === s.id ? "white" : "#333",
							cursor: "pointer",
							whiteSpace: "nowrap",
							fontSize: "14px",
						}}
					>
						{s.icon} {s.name}
					</button>
				))}
			</nav>

			{/* Content */}
			<main style={{ padding: "20px" }}>
				{error && (
					<div
						style={{
							padding: "10px",
							background: "#f8d7da",
							color: "#721c24",
							borderRadius: "5px",
							marginBottom: "20px",
						}}
					>
						⚠️ {error}
					</div>
				)}

				{activeSection === "objects" && renderObjects()}
				{activeSection === "calls" && renderCalls()}
				{activeSection === "tools" && <h2>Инструменты (в разработке)</h2>}
				{activeSection === "requests" && <h2>Заявки (в разработке)</h2>}
				{activeSection === "calendar" && <h2>Календарь (в разработке)</h2>}
			</main>
		</div>
	);
}
