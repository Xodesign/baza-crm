import { useState, useEffect } from "react";
import {
	FileSpreadsheet,
	FileText,
	Download,
	Calendar,
	BarChart3,
	PieChart,
	TrendingUp,
} from "lucide-react";

export default function Reports() {
	const [reportType, setReportType] = useState("summary");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [loading, setLoading] = useState(false);
	const [stats, setStats] = useState(null);

	useEffect(() => {
		loadStats();
	}, []);

	async function loadStats() {
		setLoading(true);
		try {
			const [objects, calls, transport, costs] = await Promise.all([
				fetch("http://firebaze.ru/api/objects").then((r) => r.json()),
				fetch("http://firebaze.ru/api/calls").then((r) => r.json()),
				fetch("http://firebaze.ru/api/transport").then((r) => r.json()),
				fetch("http://firebaze.ru/api/costs").then((r) => r.json()),
			]);

			setStats({
				objects: objects.length || 0,
				objectsByType: groupBy(objects, "Тип договора"),
				calls: calls.length || 0,
				callsByStatus: groupBy(calls, "status"),
				transport: transport.length || 0,
				transportByStatus: groupBy(transport, "status"),
				costs: costs.length || 0,
				totalCosts: (costs || []).reduce(
					(sum, c) => sum + (parseFloat(c.amount) || 0),
					0,
				),
			});
		} catch (err) {
			console.error("Failed to load stats:", err);
		}
		setLoading(false);
	}

	function groupBy(items, key) {
		const grouped = {};
		(items || []).forEach((item) => {
			const value = item[key] || "Неизвестно";
			grouped[value] = (grouped[value] || 0) + 1;
		});
		return grouped;
	}

	function exportExcel() {
		const data = [];

		// Summary sheet
		data.push(["ОТЧЁТ ПО СИСТЕМЕ CRM"]);
		data.push(["Дата формирования", new Date().toLocaleString("ru-RU")]);
		data.push(["Период", `${dateFrom || "начало"} — ${dateTo || "конец"}`]);
		data.push([]);

		if (stats) {
			data.push(["ОБЩАЯ СТАТИСТИКА"]);
			data.push(["Объектов", stats.objects]);
			data.push(["Заявок", stats.calls]);
			data.push(["Транспорта", stats.transport]);
			data.push(["Расходов", stats.costs]);
			data.push([
				"Всего расходов",
				stats.totalCosts.toLocaleString("ru-RU") + " ₽",
			]);
			data.push([]);

			data.push(["ОБЪЕКТЫ ПО ТИПУ"]);
			data.push(["Тип договора", "Количество"]);
			Object.entries(stats.objectsByType || {}).forEach(([type, count]) => {
				data.push([type, count]);
			});
			data.push([]);

			data.push(["ЗАЯВКИ ПО СТАТУСУ"]);
			data.push(["Статус", "Количество"]);
			Object.entries(stats.callsByStatus || {}).forEach(([status, count]) => {
				data.push([status, count]);
			});
			data.push([]);

			data.push(["ТРАНСПОРТ ПО СТАТУСУ"]);
			data.push(["Статус", "Количество"]);
			Object.entries(stats.transportByStatus || {}).forEach(
				([status, count]) => {
					data.push([status, count]);
				},
			);
		}

		const csv = data.map((row) => row.join(";")).join("\n");
		const blob = new Blob(["\ufeff" + csv], {
			type: "text/csv;charset=utf-8;",
		});
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `crm_report_${new Date().toISOString().split("T")[0]}.csv`;
		link.click();
	}

	function getStatusLabel(status) {
		const labels = {
			0: "Новая",
			1: "В работе",
			2: "Ожидает",
			3: "Выполнена",
			4: "Отменена",
			5: "Завершена",
		};
		return labels[status] || status;
	}

	function getStatusColor(status) {
		const colors = {
			0: "#3b82f6",
			1: "#f59e0b",
			2: "#8b5cf6",
			3: "#10b981",
			4: "#6b7280",
			5: "#059669",
		};
		return colors[status] || "#6b7280";
	}

	if (loading) {
		return <div className="loading">Загрузка отчётов...</div>;
	}

	return (
		<div className="section">
			<div className="section-header">
				<div className="section-title">
					<BarChart3 size={24} />
					<h2>Отчётность</h2>
				</div>
				<button className="btn btn-primary" onClick={exportExcel}>
					<Download size={18} />
					Экспорт в Excel
				</button>
			</div>

			<div className="report-filters">
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

			{stats && (
				<>
					{/* Summary Cards */}
					<div className="stats-grid">
						<div className="stat-card">
							<div className="stat-icon" style={{ background: "#dbeafe" }}>
								<FileSpreadsheet size={24} style={{ color: "#2563eb" }} />
							</div>
							<div className="stat-content">
								<div className="stat-value">{stats.objects}</div>
								<div className="stat-label">Объектов</div>
							</div>
						</div>

						<div className="stat-card">
							<div className="stat-icon" style={{ background: "#fef3c7" }}>
								<FileText size={24} style={{ color: "#d97706" }} />
							</div>
							<div className="stat-content">
								<div className="stat-value">{stats.calls}</div>
								<div className="stat-label">Заявок</div>
							</div>
						</div>

						<div className="stat-card">
							<div className="stat-icon" style={{ background: "#d1fae5" }}>
								<TrendingUp size={24} style={{ color: "#059669" }} />
							</div>
							<div className="stat-content">
								<div className="stat-value">{stats.transport}</div>
								<div className="stat-label">Транспорт</div>
							</div>
						</div>

						<div className="stat-card">
							<div className="stat-icon" style={{ background: "#fee2e2" }}>
								<BarChart3 size={24} style={{ color: "#dc2626" }} />
							</div>
							<div className="stat-content">
								<div className="stat-value">
									{stats.totalCosts.toLocaleString("ru-RU")}
								</div>
								<div className="stat-label">₽ Всего расходов</div>
							</div>
						</div>
					</div>

					{/* Charts Section */}
					<div className="charts-grid">
						{/* Objects by Type */}
						<div className="chart-card">
							<h3>
								<PieChart size={18} /> Объекты по типу договора
							</h3>
							<div className="chart-content">
								{Object.entries(stats.objectsByType || {}).map(
									([type, count]) => (
										<div key={type} className="chart-item">
											<span className="chart-label">{type}</span>
											<div className="chart-bar-container">
												<div
													className="chart-bar"
													style={{
														width: `${(count / stats.objects) * 100}%`,
														background: getStatusColor(
															Object.keys(stats.objectsByType).indexOf(type),
														),
													}}
												/>
											</div>
											<span className="chart-value">{count}</span>
										</div>
									),
								)}
							</div>
						</div>

						{/* Calls by Status */}
						<div className="chart-card">
							<h3>
								<TrendingUp size={18} /> Заявки по статусу
							</h3>
							<div className="chart-content">
								{Object.entries(stats.callsByStatus || {}).map(
									([status, count]) => (
										<div key={status} className="chart-item">
											<span className="chart-label">
												{getStatusLabel(status)}
											</span>
											<div className="chart-bar-container">
												<div
													className="chart-bar"
													style={{
														width: `${(count / stats.calls) * 100}%`,
														background: getStatusColor(status),
													}}
												/>
											</div>
											<span className="chart-value">{count}</span>
										</div>
									),
								)}
							</div>
						</div>

						{/* Transport by Status */}
						<div className="chart-card">
							<h3>
								<BarChart3 size={18} /> Транспорт по статусу
							</h3>
							<div className="chart-content">
								{Object.entries(stats.transportByStatus || {}).map(
									([status, count]) => (
										<div key={status} className="chart-item">
											<span className="chart-label">
												{getStatusLabel(status)}
											</span>
											<div className="chart-bar-container">
												<div
													className="chart-bar"
													style={{
														width: `${(count / stats.transport) * 100}%`,
														background: getStatusColor(status),
													}}
												/>
											</div>
											<span className="chart-value">{count}</span>
										</div>
									),
								)}
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
