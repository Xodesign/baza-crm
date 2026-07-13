import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function SystemsSection({ objects, setObjects }) {
	const [systemTypes, setSystemTypes] = useState([
		"АПС",
		"СОУЭ",
		"ВПВ",
		"ОПС",
		"ВИДЕОНАБЛЮДЕНИЕ",
		"СКУД",
		"АТС",
		"СТРАН",
	]);
	const [selectedSystem, setSelectedSystem] = useState("");
	const [newSystemName, setNewSystemName] = useState("");
	const [showAddForm, setShowAddForm] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const [editCell, setEditCell] = useState(null);
	const [editValue, setEditValue] = useState("");

	// Загрузить типы систем с VPS
	useEffect(() => {
		fetch("https://firebaze.ru/api/systems")
			.then((res) => res.json())
			.then((data) => {
				if (Array.isArray(data) && data.length > 0) {
					const names = data.map((s) => s.name);
					setSystemTypes(names);
					if (names.length > 0 && !selectedSystem) {
						setSelectedSystem(names[0]);
					}
				}
			})
			.catch((err) => console.warn("Ошибка:", err));
	}, []);

	const systemFields = [
		{ key: "brand", label: "Бренд" },
		{ key: "type", label: "Тип" },
		{ key: "qty", label: "Кол-во" },
		{ key: "link", label: "Ссылка" },
		{ key: "alarm", label: "Аларм" },
	];

	const getSystemData = (obj, sysName) => {
		const sd = obj.systemsData || {};
		return sd[sysName] || { brand: "", type: "", qty: "", link: "", alarm: "" };
	};

	const handleCellChange = async (objId, field, value) => {
		const obj = objects.find((o) => o.id === objId);
		if (!obj || !selectedSystem) return;

		const newSystemsData = {
			...(obj.systemsData || {}),
			[selectedSystem]: {
				...getSystemData(obj, selectedSystem),
				[field]: value,
			},
		};

		// Обновить локально
		setObjects(
			objects.map((o) =>
				o.id === objId ? { ...o, systemsData: newSystemsData } : o,
			),
		);

		// Сохранить на VPS
		const token = localStorage.getItem("authToken");
		const serverId = obj._serverId || obj.id;

		try {
			await fetch(`https://firebaze.ru/api/objects/${serverId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: token ? `Bearer ${token}` : "",
				},
				body: JSON.stringify({ ...obj, systemsData: newSystemsData }),
			});
		} catch (err) {
			console.error("Ошибка:", err);
		}
	};

	const handleAddSystem = async (e) => {
		e?.preventDefault();
		if (!newSystemName.trim()) return;

		setIsAdding(true);
		try {
			const res = await fetch("https://firebaze.ru/api/systems", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: newSystemName.trim() }),
			});

			if (res.ok) {
				const newName = newSystemName.trim();
				setSystemTypes([...systemTypes, newName]);
				setSelectedSystem(newName);
				setNewSystemName("");
				setShowAddForm(false);
			}
		} catch (err) {
			alert("Ошибка: " + err.message);
		}
		setIsAdding(false);
	};

	const handleDeleteSystem = async (sysName) => {
		if (!confirm(`Удалить "${sysName}"?`)) return;

		try {
			const res = await fetch(
				`https://firebaze.ru/api/systems/${encodeURIComponent(sysName)}`,
				{
					method: "DELETE",
				},
			);
			if (res.ok) {
				setSystemTypes(systemTypes.filter((s) => s !== sysName));
				if (selectedSystem === sysName) {
					setSelectedSystem(systemTypes.find((s) => s !== sysName) || "");
				}
			}
		} catch (err) {
			alert("Ошибка: " + err.message);
		}
	};

	const startEdit = (objId, field, value) => {
		setEditCell({ objId, field });
		setEditValue(value);
	};

	const finishEdit = () => {
		if (editCell) {
			handleCellChange(editCell.objId, editCell.field, editValue);
		}
		setEditCell(null);
		setEditValue("");
	};

	const sortedObjects = [...objects].sort(
		(a, b) => (b.objectNumber || 0) - (a.objectNumber || 0),
	);

	return (
		<div className="section">
			<div className="content-header">
				<h2>Системы</h2>
				<button
					className="btn btn-secondary"
					onClick={() => setShowAddForm(!showAddForm)}
				>
					<Plus size={18} /> Добавить систему
				</button>
			</div>

			{/* Выбор системы */}
			<div className="card" style={{ marginBottom: 20, padding: 16 }}>
				<div
					style={{
						display: "flex",
						gap: 16,
						alignItems: "center",
						flexWrap: "wrap",
					}}
				>
					{selectedSystem && (
						<button
							className="btn btn-sm btn-danger"
							onClick={() => handleDeleteSystem(selectedSystem)}
							style={{ marginLeft: "auto" }}
						>
							<Trash2 size={14} /> Удалить
						</button>
					)}
				</div>

				{/* Форма добавления */}
				{showAddForm && (
					<div
						style={{
							marginTop: 16,
							padding: 16,
							background: "#f8f9fa",
							borderRadius: 8,
						}}
					>
						<form
							onSubmit={handleAddSystem}
							style={{ display: "flex", gap: 10 }}
						>
							<input
								type="text"
								value={newSystemName}
								onChange={(e) => setNewSystemName(e.target.value)}
								placeholder="Название новой системы"
								style={{ flex: 1, padding: "8px 12px" }}
								required
							/>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={isAdding}
							>
								{isAdding ? "..." : "Добавить"}
							</button>
							<button
								type="button"
								className="btn btn-secondary"
								onClick={() => setShowAddForm(false)}
							>
								Отмена
							</button>
						</form>
					</div>
				)}
			</div>

			{/* Таблица */}
			{selectedSystem && (
				<div style={{ overflowX: "auto" }}>
					<table style={{ width: "100%", borderCollapse: "collapse" }}>
						<thead>
							<tr style={{ background: "#f8f9fa" }}>
								<th
									style={{
										padding: 12,
										textAlign: "left",
										border: "1px solid #dee2e6",
										fontWeight: "bold",
									}}
								>
									Объект
								</th>
								{systemFields.map((field) => (
									<th
										key={field.key}
										style={{
											padding: 12,
											textAlign: "left",
											border: "1px solid #dee2e6",
											fontWeight: "bold",
											minWidth: 120,
										}}
									>
										{field.label}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{sortedObjects.map((obj) => {
								const data = getSystemData(obj, selectedSystem);
								return (
									<tr key={obj.id}>
										<td
											style={{
												padding: 8,
												border: "1px solid #dee2e6",
												fontWeight: 500,
												background: "#f8f9fa",
											}}
										>
											{obj["Наименование объекта"] || `Объект ${obj.id}`}
										</td>
										{systemFields.map((field) => {
											const isEditing =
												editCell &&
												editCell.objId === obj.id &&
												editCell.field === field.key;
											const value = data[field.key] || "";
											return (
												<td
													key={field.key}
													style={{ padding: 4, border: "1px solid #dee2e6" }}
												>
													{isEditing ? (
														<input
															type="text"
															value={editValue}
															onChange={(e) => setEditValue(e.target.value)}
															onBlur={finishEdit}
															onKeyDown={(e) => {
																if (e.key === "Enter") finishEdit();
																if (e.key === "Escape") setEditCell(null);
															}}
															style={{
																width: "100%",
																padding: "6px 8px",
																border: "1px solid #007bff",
																borderRadius: 4,
															}}
															autoFocus
														/>
													) : (
														<div
															onDoubleClick={() =>
																startEdit(obj.id, field.key, value)
															}
															style={{
																padding: "6px 8px",
																cursor: "pointer",
																color: value ? "#212529" : "#adb5bd",
																minHeight: 32,
															}}
														>
															{value || "-"}
														</div>
													)}
												</td>
											);
										})}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			<p style={{ marginTop: 10, color: "#6c757d", fontSize: 12 }}>
				Двойной клик для редактирования. Enter — сохранить, Escape — отмена.
			</p>
		</div>
	);
}
