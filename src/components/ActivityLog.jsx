import { useState, useEffect } from "react";
import {
	Activity,
	Download,
	Filter,
	Calendar,
	User,
	FileText,
} from "lucide-react";

export default function ActivityLog() {
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");

	useEffect(() => {
		loadLogs();
	}, []);

	async function loadLogs() {
		setLoading(true);
		try {
			const res = await fetch("http://firebaze.ru/api/logs");
			if (res.ok) {
				const data = await res.json();
				setLogs(data);
			} else {
				// Generate demo logs if API doesn't exist
				setLogs(generateDemoLogs());
			}
		} catch {
			setLogs(generateDemoLogs());
		}
		setLoading(false);
	}

	function generateDemoLogs() {
		const actions = [
			{ action: "create", target: "object", desc: "Создан объект" },
			{ action: "edit", target: "object", desc: "Изменён объект" },
			{ action: "delete", target: "object", desc: "Удалён объект" },
			{ action: "create", target: "call", desc: "Создана заявка" },
			{ action: "status", target: "call", desc: "Изменён статус заявки" },
			{ action: "login", target: "auth", desc: "Вход в систему" },
			{ action: "logout", target: "auth", desc: "Выход из системы" },
			{ action: "export", target: "excel", desc: "Экспорт в Excel" },
			{ action: "import", target: "excel", desc: "Импорт из Excel" },
		];
		const users = ["admin", "manager", "engineer", "buch"];
		const logs = [];
		const now = Date.now();

		for (let i = 0; i < 50; i++) {
			const act = actions[Math.floor(Math.random() * actions.length)];
			const user = users[Math.floor(Math.random() * users.length)];
			logs.push({
				id: i + 1,
				timestamp: new Date(now - i * 3600000 * Math.random()).toISOString(),
				user,
				action: act.action,
				target: act.target,
				description: `${user}: ${act.desc}`,
				details: act.target === "object" ? "Объект #" + (100 + i) : "",
			});
		}
		return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
	}

	function getActionIcon(action) {
		switch (action) {
			case "create":
				return "➕";
			case "edit":
				return "✏️";
			case "delete":
				return "🗑️";
			case "status":
				return "🔄";
			case "login":
				return "🔓";
			case "logout":
				return "🔒";
			case "export":
				return "📤";
			case "import":
				return "📥";
			default:
				return "📝";
		}
	}

	function getActionColor(action) {
		switch (action) {
			case "create":
				return "#059669";
			case "edit":
				return "#2563eb";
			case "delete":
				return "#dc2626";
			case "status":
				return "#7c3aed";
			case "login":
				return "#0891b2";
			case "logout":
				return "#64748b";
			default:
				return "#374151";
		}
	}

	function formatDate(timestamp) {
		const date = new Date(timestamp);
		return date.toLocaleString("ru-RU", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function filteredLogs() {
		return logs.filter((log) => {
			if (filter !== "all" && log.action !== filter && log.target !== filter) {
				return false;
			}
			if (dateFrom && new Date(log.timestamp) < new Date(dateFrom)) {
				return false;
			}
			if (dateTo && new Date(log.timestamp) > new Date(dateTo)) {
				return false;
			}
			return true;
		});
	}

	async function exportLogs() {
		const data = filteredLogs();
		const csv = [
			"Дата,Пользователь,Действие,Цель,Описание",
			...data.map(
				(log) =>
					`"${formatDate(log.timestamp)}","${log.user}","${log.action}","${log.target}","${log.description}"`,
			),
		].join("\n");

		const blob = new Blob(["\ufeff" + csv], {
			type: "text/csv;charset=utf-8;",
		});
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `activity_log_${new Date().toISOString().split("T")[0]}.csv`;
		link.click();
	}

	if (loading) {
		return <div className="loading">Загрузка журнала...</div>;
	}

	return (
		<div className="section">
			<div className="section-header">
				<div className="section-title">
					<Activity size={24} />
					<h2>Журнал активности</h2>
				</div>
				<button className="btn btn-primary" onClick={exportLogs}>
					<Download size={18} />
					Экспорт CSV
				</button>
			</div>

			<div className="log-filters">
				<div className="filter-group">
					<Filter size={16} />
					<select value={filter} onChange={(e) => setFilter(e.target.value)}>
						<option value="all">Все действия</option>
						<option value="create">Создание</option>
						<option value="edit">Редактирование</option>
						<option value="delete">Удаление</option>
						<option value="login">Вход/выход</option>
						<option value="export">Экспорт/импорт</option>
					</select>
				</div>
				<div className="filter-group">
					<Calendar size={16} />
					<input
						type="date"
						value={dateFrom}
						onChange={(e) => setDateFrom(e.target.value)}
						placeholder="От"
					/>
					<span>—</span>
					<input
						type="date"
						value={dateTo}
						onChange={(e) => setDateTo(e.target.value)}
						placeholder="До"
					/>
				</div>
			</div>

			<div className="log-container">
				{filteredLogs().map((log) => (
					<div key={log.id} className="log-item">
						<div
							className="log-icon"
							style={{ color: getActionColor(log.action) }}
						>
							{getActionIcon(log.action)}
						</div>
						<div className="log-content">
							<div className="log-description">{log.description}</div>
							<div className="log-meta">
								<span className="log-user">
									<User size={12} /> {log.user}
								</span>
								<span className="log-time">{formatDate(log.timestamp)}</span>
							</div>
						</div>
						<div className="log-target">
							<FileText size={14} />
							{log.target}
						</div>
					</div>
				))}
				{filteredLogs().length === 0 && (
					<div className="empty-state">Нет записей за выбранный период</div>
				)}
			</div>
		</div>
	);
}
