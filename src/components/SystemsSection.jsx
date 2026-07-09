import { useState, useEffect, useCallback, useRef } from "react";
import { Save, Plus, Trash2 } from "lucide-react";

export default function SystemsSection({
	objects,
	setObjects,
	syncObjectToServer,
}) {
	const [editingCell, setEditingCell] = useState(null);
	const [editValue, setEditValue] = useState("");
	const [hasChanges, setHasChanges] = useState(false);
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
	const [newSystemName, setNewSystemName] = useState("");
	const [showAddForm, setShowAddForm] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const saveTimeoutRef = useRef(null);

	// Загрузить типы систем с VPS
	useEffect(() => {
		fetch("https://firebaze.ru/api/systems")
			.then((res) => res.json())
			.then((data) => {
				if (Array.isArray(data) && data.length > 0) {
					setSystemTypes(data.map((s) => s.name));
				}
			})
			.catch((err) => console.warn("Не удалось загрузить типы систем:", err));
	}, []);

	const systemFields = [
		{ key: "brand", label: "Бренд" },
		{ key: "type", label: "Тип" },
		{ key: "qty", label: "Кол-во" },
		{ key: "link", label: "Ссылка" },
		{ key: "alarm", label: "Аларм" },
	];

	const getSystemData = (object, systemName) => {
		const systemsData = object.systemsData || {};
		return (
			systemsData[systemName] || {
				brand: "",
				type: "",
				qty: "",
				link: "",
				alarm: "",
			}
		);
	};

	const updateSystemData = useCallback(
		(objectId, systemName, field, value) => {
			setObjects((prev) => {
				const updated = prev.map((obj) => {
					if (obj.id !== objectId) return obj;
					const systemsData = obj.systemsData || {};
					const sysData = systemsData[systemName] || {
						brand: "",
						type: "",
						qty: "",
						link: "",
						alarm: "",
					};
					return {
						...obj,
						systemsData: {
							...systemsData,
							[systemName]: { ...sysData, [field]: value },
						},
					};
				});
				return updated;
			});
			setHasChanges(true);

			// Сохранить на VPS через 1 секунду после последнего изменения
			if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
			saveTimeoutRef.current = setTimeout(() => {
				const obj = objects.find((o) => o.id === objectId);
				if (obj) {
					const { id, _serverId, ...data } = {
						...obj,
						systemsData: {
							...obj.systemsData,
							[systemName]: {
								...getSystemData(obj, systemName),
								[field]: value,
							},
						},
					};
					fetch(`https://firebaze.ru/api/objects/${_serverId || obj.id}`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(data),
					})
						.then((res) => {
							if (res.ok) {
								console.log("Сохранено на VPS:", systemName, field, value);
							}
						})
						.catch((err) => console.error("Ошибка сохранения:", err));
				}
			}, 1000);
		},
		[objects, setObjects],
	);

	const handleSaveAll = async () => {
		for (const obj of objects) {
			await syncObjectToServer(obj, "update");
		}
		setHasChanges(false);
		alert("Данные сохранены!");
	};

	const handleAddSystem = async (e) => {
		e.preventDefault();
		if (!newSystemName.trim()) return;

		setIsAdding(true);
		try {
			const res = await fetch("https://firebaze.ru/api/systems", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: newSystemName.trim() }),
			});

			if (res.ok) {
				setSystemTypes([...systemTypes, newSystemName.trim()]);
				setNewSystemName("");
				setShowAddForm(false);
			}
		} catch (err) {
			alert("Ошибка: " + err.message);
		}
		setIsAdding(false);
	};

	const handleDeleteSystem = async (systemName) => {
		if (!confirm(`Удалить тип системы "${systemName}"?`)) return;

		try {
			const res = await fetch(
				`https://firebaze.ru/api/systems/${encodeURIComponent(systemName)}`,
				{
					method: "DELETE",
				},
			);

			if (res.ok) {
				setSystemTypes(systemTypes.filter((s) => s !== systemName));
			}
		} catch (err) {
			alert("Ошибка: " + err.message);
		}
	};

	const startEdit = (objectId, systemName, field, currentValue) => {
		setEditingCell({ objectId, systemName, field });
		setEditValue(currentValue);
	};

	const finishEdit = () => {
		if (editingCell) {
			updateSystemData(
				editingCell.objectId,
				editingCell.systemName,
				editingCell.field,
				editValue,
			);
		}
		setEditingCell(null);
		setEditValue("");
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") finishEdit();
		if (e.key === "Escape") setEditingCell(null);
	};

	// Очистка таймера при размонтировании
	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
		};
	}, []);

	const sortedObjects = [...objects].sort(
		(a, b) => (b.objectNumber || 0) - (a.objectNumber || 0),
	);

	return (
		<div>
			<div className="content-header">
				<h2>Системы</h2>
				<div className="header-actions">
					{hasChanges && (
						<button className="btn btn-primary" onClick={handleSaveAll}>
							<Save size={18} /> Сохранить изменения
						</button>
					)}
					<button
						className="btn btn-secondary"
						onClick={() => setShowAddForm(!showAddForm)}
					>
						<Plus size={18} /> Добавить тип системы
					</button>
				</div>
			</div>

			{showAddForm && (
				<div
					className="add-form-section"
					style={{
						marginBottom: 20,
						padding: 16,
						background: "#f5f5f5",
						borderRadius: 8,
					}}
				>
					<form
						onSubmit={handleAddSystem}
						style={{ display: "flex", gap: 10, alignItems: "center" }}
					>
						<input
							type="text"
							value={newSystemName}
							onChange={(e) => setNewSystemName(e.target.value)}
							placeholder="Название новой системы (например: АПС, СОУЭ)"
							style={{
								flex: 1,
								padding: "8px 12px",
								borderRadius: 6,
								border: "1px solid #ddd",
							}}
							required
						/>
						<button
							type="submit"
							className="btn btn-primary"
							disabled={isAdding}
						>
							{isAdding ? "Добавляем..." : "Добавить"}
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

			<div className="systems-excel-container">
				<table className="systems-excel-table">
					<thead>
						<tr>
							<th className="excel-sticky-col excel-system-col">Тип системы</th>
							{sortedObjects.map((obj) => (
								<th key={obj.id} className="excel-object-header">
									{obj["Наименование объекта"] || `Объект ${obj.id}`}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{systemTypes.map((sys) => (
							<tr key={sys}>
								<td className="excel-sticky-col excel-system-cell">
									<span className="system-name">{sys}</span>
									<button
										className="btn-icon btn-delete btn-sm"
										onClick={() => handleDeleteSystem(sys)}
										title="Удалить тип системы"
									>
										<Trash2 size={14} />
									</button>
								</td>
								{sortedObjects.map((obj) =>
									systemFields.map((field) => {
										const cellKey = `${obj.id}-${sys}-${field.key}`;
										const isEditing =
											editingCell &&
											editingCell.objectId === obj.id &&
											editingCell.systemName === sys &&
											editingCell.field === field.key;
										const value = getSystemData(obj, sys)[field.key] || "";
										return (
											<td
												key={cellKey}
												className={`excel-cell ${isEditing ? "editing" : ""} ${!value ? "empty-cell" : ""}`}
												onDoubleClick={() =>
													startEdit(obj.id, sys, field.key, value)
												}
											>
												{isEditing ? (
													<input
														type="text"
														value={editValue}
														onChange={(e) => setEditValue(e.target.value)}
														onBlur={finishEdit}
														onKeyDown={handleKeyDown}
														className="excel-input"
													/>
												) : (
													value
												)}
											</td>
										);
									}),
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="systems-help">
				<p>
					Дважды кликните на ячейку для редактирования. Enter - сохранить,
					Escape - отмена. Изменения сохраняются автоматически.
				</p>
			</div>
		</div>
	);
}
