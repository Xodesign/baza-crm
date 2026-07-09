import { useState, useEffect, useMemo } from "react";
import {
	Plus,
	AlertCircle,
	ChevronDown,
	Truck,
	ShoppingCart,
	X,
	Search,
	Filter,
} from "lucide-react";

// === ЦВЕТА ИНСТРУМЕНТА (для справки) ===
// const TOOL_COLORS = {
// 	"0": { label: "------------", color: "#dc3545", bg: "#f8d7da" },
// 	"1": { label: "не нужно", color: "#28a745", bg: "#d4edda" },
// 	"2": { label: "заявка на доставку", color: "#007bff", bg: "#cce5ff" },
// 	"3": { label: "нужно", color: "#dc3545", bg: "#f8d7da" },
// };

// === ЦВЕТА ПРИОБРЕТЕНИЯ (для справки) ===
// const PURCHASE_COLORS = {
// 	"0": { label: "------------", color: "#dc3545", bg: "#f8d7da" },
// 	"1": { label: "не нужно", color: "#28a745", bg: "#d4edda" },
// 	"2": { label: "сформировать заявку", color: "#007bff", bg: "#cce5ff" },
// 	"3": { label: "нужно", color: "#dc3545", bg: "#f8d7da" },
// };

// === КАЛЕНДАРНЫЙ КОМПОНЕНТ ДЛЯ ДЕДЛАЙНА ===
function DeadlineCalendar({ value, onChange }) {
	const [showCalendar, setShowCalendar] = useState(false);
	const [viewDate, setViewDate] = useState(() =>
		value ? new Date(value) : new Date(),
	);

	const days = useMemo(() => {
		const year = viewDate.getFullYear();
		const month = viewDate.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
		const daysArray = [];

		// Пустые дни до начала месяца
		for (let i = 0; i < startPadding; i++) {
			daysArray.push(null);
		}

		// Дни месяца
		for (let d = 1; d <= lastDay.getDate(); d++) {
			daysArray.push(new Date(year, month, d));
		}

		return daysArray;
	}, [viewDate]);

	const getDeadlineStatus = (dateStr) => {
		if (!dateStr) return "empty"; // пустой - голубой
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const deadline = new Date(dateStr);
		deadline.setHours(0, 0, 0, 0);
		const diff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
		if (diff <= 2) return "urgent"; // ≤2 дней - красный
		return "normal";
	};

	const formatDisplayDate = (dateStr) => {
		if (!dateStr) return "";
		const date = new Date(dateStr);
		return date.toLocaleDateString("ru-RU", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const handlePrevMonth = () => {
		setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
	};

	const handleNextMonth = () => {
		setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
	};

	const handleSelectDate = (date) => {
		if (date) {
			const isoDate = date.toISOString().split("T")[0];
			onChange(isoDate);
			setShowCalendar(false);
		}
	};

	const status = getDeadlineStatus(value);

	return (
		<div className="deadline-calendar-wrapper">
			<div
				className={`deadline-display ${status}`}
				onClick={() => setShowCalendar(!showCalendar)}
			>
				{value ? (
					formatDisplayDate(value)
				) : (
					<span className="deadline-placeholder">Выберите дату</span>
				)}
				<ChevronDown size={16} />
			</div>
			{showCalendar && (
				<div className="calendar-popup">
					<div className="calendar-header">
						<button type="button" onClick={handlePrevMonth}>
							&lt;
						</button>
						<span>
							{viewDate.toLocaleDateString("ru-RU", {
								month: "long",
								year: "numeric",
							})}
						</span>
						<button type="button" onClick={handleNextMonth}>
							&gt;
						</button>
					</div>
					<div className="calendar-weekdays">
						{["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
							<span key={d}>{d}</span>
						))}
					</div>
					<div className="calendar-days">
						{days.map((date, idx) => (
							<button
								key={idx}
								type="button"
								className={`calendar-day ${date ? "" : "empty"} ${date && value === date.toISOString().split("T")[0] ? "selected" : ""} ${date && getDeadlineStatus(date.toISOString().split("T")[0]) === "urgent" ? "urgent" : ""}`}
								onClick={() => handleSelectDate(date)}
								disabled={!date}
							>
								{date ? date.getDate() : ""}
							</button>
						))}
					</div>
					<div className="calendar-legend">
						<span className="legend-item urgent">≤2 дней</span>
						<span className="legend-item empty">не заполнено</span>
					</div>
				</div>
			)}
		</div>
	);
}

// === ВЫБОР АДРЕСА С АВТОЗАПОЛНЕНИЕМ ===
function AddressSelect({ value, onChange, objects, onSelectObject }) {
	const [inputValue, setInputValue] = useState(value || "");
	const [showDropdown, setShowDropdown] = useState(false);
	const [filteredObjects, setFilteredObjects] = useState([]);

	useEffect(() => {
		if (inputValue.length >= 1) {
			const filtered = objects.filter((obj) => {
				const addr = (obj["Адрес сокращенный"] || "").toLowerCase();
				const name = (obj["Наименование объекта"] || "").toLowerCase();
				const search = inputValue.toLowerCase();
				return addr.includes(search) || name.includes(search);
			});
			setFilteredObjects(filtered.slice(0, 10));
			setShowDropdown(filtered.length > 0);
		} else {
			setFilteredObjects(objects.slice(0, 5));
			setShowDropdown(false);
		}
	}, [inputValue, objects]);

	const handleSelect = (obj) => {
		setInputValue(obj["Адрес сокращенный"] || "");
		onChange(obj["Адрес сокращенный"] || "");
		onSelectObject(obj);
		setShowDropdown(false);
	};

	return (
		<div className="address-select-wrapper">
			<input
				type="text"
				value={inputValue}
				onChange={(e) => {
					setInputValue(e.target.value);
					onChange(e.target.value);
				}}
				onFocus={() => {
					if (inputValue.length >= 1 && filteredObjects.length > 0) {
						setShowDropdown(true);
					} else if (inputValue.length === 0) {
						setFilteredObjects(objects.slice(0, 5));
						setShowDropdown(true);
					}
				}}
				onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
				placeholder="Введите адрес..."
				list="address-suggestions"
			/>
			<datalist id="address-suggestions">
				{objects.map((obj) => (
					<option key={obj.id} value={obj["Адрес сокращенный"] || ""} />
				))}
			</datalist>
			{showDropdown && filteredObjects.length > 0 && (
				<div className="address-dropdown">
					{filteredObjects.map((obj) => (
						<div
							key={obj.id}
							className="address-dropdown-item"
							onClick={() => handleSelect(obj)}
						>
							<span className="addr">{obj["Адрес сокращенный"]}</span>
							<span className="name">{obj["Наименование объекта"]}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// === ВЫБОР СИСТЕМ С ГАЛОЧКАМИ ===
function SystemMultiSelect({
	value,
	onChange,
	availableSystems,
	disabled,
	objectId,
	onOpenSystem,
}) {
	const [isOpen, setIsOpen] = useState(false);
	const selected = value
		? value
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean)
		: [];

	const toggleSystem = (system) => {
		if (disabled) return;
		if (selected.includes(system)) {
			onChange(selected.filter((s) => s !== system).join(", "));
		} else {
			onChange([...selected, system].join(", "));
		}
	};

	const isRed = !disabled && selected.length === 0;

	return (
		<div
			className={`system-multiselect ${disabled ? "disabled" : ""} ${isRed ? "required" : ""}`}
		>
			<div
				className="system-selected"
				onClick={() => !disabled && setIsOpen(!isOpen)}
			>
				{selected.length > 0 ? (
					selected.map((s) => (
						<span key={s} className="system-tag">
							{s}
						</span>
					))
				) : (
					<span className="system-placeholder">Выберите системы</span>
				)}
				<ChevronDown size={14} />
			</div>
			{isOpen && (
				<div className="system-dropdown">
					{availableSystems.length === 0 ? (
						<div className="system-empty">Нет доступных систем</div>
					) : (
						<>
							{availableSystems.map((system) => (
								<label key={system} className="system-option">
									<input
										type="checkbox"
										checked={selected.includes(system)}
										onChange={() => toggleSystem(system)}
										disabled={disabled}
									/>
									<span>{system}</span>
								</label>
							))}
							<div className="system-dropdown-footer">
								<button
									className="system-open-link"
									onClick={() => onOpenSystem?.(objectId)}
									type="button"
								>
									→ Открыть системы объекта в разделе «Объекты»
								</button>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}

// === НАШ ИНСТРУМЕНТ ВЫБОР ===
// === ВЫБОР ИНСТРУМЕНТА — ВСПЛЫВАЮЩЕЕ ОКНО ===
function OurToolSelect({
	value,
	onChange,
	onCreateTransport,
	transportStatus,
	tools,
}) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all"); // all, available, busy

	// Базовые опции
	const baseOptions = [
		{ value: "0", label: "------------", color: "#dc3545", type: "base" },
		{ value: "1", label: "не нужно", color: "#28a745", type: "base" },
		{ value: "2", label: "заявка на доставку", color: "#007bff", type: "base" },
		{ value: "3", label: "нужно", color: "#dc3545", type: "base" },
	];

	// Получаем выбранные ID инструментов
	const selectedToolIds = value
		? value
				.split(",")
				.map((v) => v.trim())
				.filter((v) => v && !baseOptions.find((o) => o.value === v))
		: [];

	// Выбранный базовый вариант
	const selectedBase = baseOptions.find((o) => o.value === value);
	const isBaseSelected = value && baseOptions.find((o) => o.value === value);

	// Выбранные инструменты
	const selectedTools = selectedToolIds
		.map((id) => tools?.find((t) => String(t.id) === String(id)))
		.filter(Boolean);

	// Фильтрация инструментов
	const filteredTools = useMemo(() => {
		if (!tools) return [];
		return tools.filter((t) => {
			// Поиск по названию или инвентарному номеру
			const matchesSearch =
				!searchQuery ||
				t.tool.toLowerCase().includes(searchQuery.toLowerCase()) ||
				t.inventoryNumber?.toLowerCase().includes(searchQuery.toLowerCase());

			// Фильтр по статусу
			const matchesStatus =
				statusFilter === "all" ||
				(statusFilter === "available" && t.call_status === "available") ||
				(statusFilter === "busy" && t.call_status !== "available");

			return matchesSearch && matchesStatus;
		});
	}, [tools, searchQuery, statusFilter]);

	// Подсчёт статистики
	const stats = useMemo(() => {
		if (!tools) return { total: 0, available: 0, busy: 0 };
		return {
			total: tools.length,
			available: tools.filter((t) => t.call_status === "available").length,
			busy: tools.filter((t) => t.call_status !== "available").length,
		};
	}, [tools]);

	const handleToolToggle = (toolId) => {
		const strId = String(toolId);
		const current = selectedToolIds.map(String);
		let newIds;
		if (current.includes(strId)) {
			newIds = current.filter((id) => id !== strId);
		} else {
			newIds = [...current, strId];
		}
		onChange(newIds.join(","));
	};

	const handleBaseSelect = (opt) => {
		onChange(opt.value);
		if (opt.value === "2") {
			onCreateTransport?.();
		}
		setIsModalOpen(false);
	};

	const handleClear = () => {
		onChange("");
		setSearchQuery("");
		setStatusFilter("all");
	};

	// Цвет и текст поля
	const displayColor = isBaseSelected
		? selectedBase.color
		: selectedTools.length > 0
			? selectedTools.every((t) => t.call_status === "available")
				? "#28a745"
				: "#dc3545"
			: "#6c757d";

	const displayLabel = isBaseSelected
		? selectedBase.label
		: selectedTools.length === 0
			? "Выберите инструменты..."
			: selectedTools.length === 1
				? selectedTools[0].tool
				: `${selectedTools.length} инструмента`;

	return (
		<>
			{/* Кнопка открытия */}
			<div
				className="tool-modal-trigger"
				style={{
					borderColor: displayColor,
					backgroundColor: displayColor + "15",
				}}
				onClick={() => setIsModalOpen(true)}
			>
				<span style={{ color: displayColor }}>{displayLabel}</span>
				<ChevronDown size={16} />
			</div>

			{/* Модальное окно */}
			{isModalOpen && (
				<div
					className="tool-modal-overlay"
					onClick={() => setIsModalOpen(false)}
				>
					<div
						className="tool-modal-content"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Заголовок */}
						<div className="tool-modal-header">
							<h3>Выбор инструмента</h3>
							<button
								className="tool-modal-close"
								onClick={() => setIsModalOpen(false)}
							>
								<X size={20} />
							</button>
						</div>

						{/* Статистика */}
						<div className="tool-stats">
							<span className="stat-total">Всего: {stats.total}</span>
							<span className="stat-available">
								🟢 Свободен: {stats.available}
							</span>
							<span className="stat-busy">🔴 Занят: {stats.busy}</span>
						</div>

						{/* Поиск */}
						<div className="tool-search">
							<Search size={16} className="search-icon" />
							<input
								type="text"
								placeholder="Поиск по названию или инвентарному номеру..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="tool-search-input"
							/>
						</div>

						{/* Фильтры */}
						<div className="tool-filters">
							<button
								className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
								onClick={() => setStatusFilter("all")}
							>
								Все
							</button>
							<button
								className={`filter-btn filter-available ${statusFilter === "available" ? "active" : ""}`}
								onClick={() => setStatusFilter("available")}
							>
								🟢 Свободные
							</button>
							<button
								className={`filter-btn filter-busy ${statusFilter === "busy" ? "active" : ""}`}
								onClick={() => setStatusFilter("busy")}
							>
								🔴 Занятые
							</button>
						</div>

						{/* Базовые опции */}
						<div className="tool-base-options">
							{baseOptions.map((opt) => (
								<button
									key={opt.value}
									className={`base-option ${isBaseSelected && value === opt.value ? "selected" : ""}`}
									style={{ borderColor: opt.color, color: opt.color }}
									onClick={() => handleBaseSelect(opt)}
								>
									{opt.label}
								</button>
							))}
						</div>

						{/* Список инструментов */}
						<div className="tool-list">
							{filteredTools.length === 0 ? (
								<div className="tool-empty">Инструменты не найдены</div>
							) : (
								filteredTools.map((t) => {
									const isSelected = selectedToolIds
										.map(String)
										.includes(String(t.id));
									const isBusy = t.call_status !== "available";
									return (
										<div
											key={t.id}
											className={`tool-item ${isSelected ? "selected" : ""} ${isBusy ? "busy" : ""}`}
											onClick={() => handleToolToggle(t.id)}
										>
											<div className="tool-item-checkbox">
												<input
													type="checkbox"
													checked={isSelected}
													onChange={() => handleToolToggle(t.id)}
												/>
											</div>
											<div className="tool-item-info">
												<div className="tool-item-name">{t.tool}</div>
												<div className="tool-item-details">
													{t.inventoryNumber && (
														<span className="detail-inv">
															Инв. {t.inventoryNumber}
														</span>
													)}
													{t.short_address && (
														<span className="detail-addr">
															{t.short_address}
														</span>
													)}
												</div>
											</div>
											<div className="tool-item-status">
												<span
													className={`status-badge ${isBusy ? "busy" : "available"}`}
												>
													{isBusy ? "🔴 Занят" : "🟢 Свободен"}
												</span>
												{isBusy && t.object_name && (
													<div className="status-object">{t.object_name}</div>
												)}
											</div>
										</div>
									);
								})
							)}
						</div>
					</div>

					{/* Выбранные инструменты */}
					{selectedTools.length > 0 && (
						<div className="tool-selected-section">
							<div className="selected-header">
								<span>Выбрано: {selectedTools.length}</span>
								<button className="clear-btn" onClick={handleClear}>
									Очистить
								</button>
							</div>
							<div className="selected-chips">
								{selectedTools.map((t) => (
									<span
										key={t.id}
										className={`selected-chip ${t.call_status !== "available" ? "chip-busy" : "chip-available"}`}
									>
										{t.tool}
										<span
											className="chip-remove"
											onClick={(e) => {
												e.stopPropagation();
												handleToolToggle(t.id);
											}}
										>
											×
										</span>
									</span>
								))}
							</div>
						</div>
					)}

					{/* Кнопки действий */}
					<div className="tool-modal-actions">
						<button
							className="btn btn-secondary"
							onClick={() => setIsModalOpen(false)}
						>
							Отмена
						</button>
						<button
							className="btn btn-primary"
							onClick={() => setIsModalOpen(false)}
						>
							Готово {selectedTools.length > 0 && `(${selectedTools.length})`}
						</button>
					</div>
				</div>
			)}

			{transportStatus && (
				<div className="transport-status">
					<Truck size={12} />
					Заявка на транспорт создана
				</div>
			)}

			{/* Карточки выбранных инструментов */}
			{selectedTools.map((t) => (
				<div key={t.id} className="tool-info-card">
					<div className="tool-info-header">
						<span className="tool-info-name">{t.tool}</span>
						<span
							className={`tool-info-status ${t.call_status === "available" ? "available" : "busy"}`}
						>
							{t.call_status === "available" ? "✓ Свободен" : "⚠ Занят"}
						</span>
					</div>
					{t.inventoryNumber && (
						<div className="tool-info-row">
							<span className="tool-info-label">Инв.№:</span>
							<span className="tool-info-value">{t.inventoryNumber}</span>
						</div>
					)}
					{t.short_address && (
						<div className="tool-info-row">
							<span className="tool-info-label">Место:</span>
							<span className="tool-info-value">{t.short_address}</span>
						</div>
					)}
					{t.object_name && (
						<div className="tool-info-row">
							<span className="tool-info-label">Объект:</span>
							<span className="tool-info-value">{t.object_name}</span>
						</div>
					)}
					{t.note && (
						<div className="tool-info-row">
							<span className="tool-info-label">Примечание:</span>
							<span className="tool-info-value">{t.note}</span>
						</div>
					)}
					{t.call_status !== "available" && t.object_name && (
						<div className="tool-info-object">
							<span>На объекте: </span>
							<strong>{t.object_name}</strong>
						</div>
					)}
				</div>
			))}
		</>
	);
}

// === ПРИОБРЕСТИ ДЛЯ ВЫПОЛНЕНИЯ ===
function PurchaseSelect({ value, onChange, onCreateBuy, buyStatus }) {
	const [isOpen, setIsOpen] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [purchaseText, setPurchaseText] = useState("");
	const options = [
		{ value: "0", label: "------------", color: "#dc3545" },
		{ value: "1", label: "не нужно", color: "#28a745" },
		{ value: "2", label: "сформировать заявку", color: "#007bff" },
		{ value: "3", label: "нужно", color: "#dc3545" },
	];

	const selectedOption = options.find((o) => o.value === value) || options[0];

	return (
		<>
			<div className="purchase-select-wrapper">
				<div
					className="tool-selected"
					style={{
						borderColor: selectedOption.color,
						backgroundColor: selectedOption.color + "15",
					}}
					onClick={() => setIsOpen(!isOpen)}
				>
					<span style={{ color: selectedOption.color }}>
						{selectedOption.label}
					</span>
					<ChevronDown size={14} />
				</div>
				{isOpen && (
					<div className="tool-dropdown">
						{options.map((opt) => (
							<div
								key={opt.value}
								className="tool-option"
								style={{ borderLeftColor: opt.color }}
								onClick={() => {
									if (opt.value === "2") {
										// Открываем модальное окно для ввода списка закупок
										setShowModal(true);
										setPurchaseText(formData.toPurchase || "");
									} else if (opt.value === "3") {
										onChange("3");
									} else {
										onChange(opt.value);
									}
									setIsOpen(false);
								}}
							>
								<span style={{ color: opt.color }}>{opt.label}</span>
							</div>
						))}
					</div>
				)}
				{buyStatus && (
					<div className="transport-status">
						<ShoppingCart size={12} />
						Заявка на закупку создана
					</div>
				)}
			</div>

			{/* МОДАЛЬНОЕ ОКНО ДЛЯ ВВОДА СПИСКА ЗАКУПОК */}
			{showModal && (
				<div className="modal-overlay" onClick={() => setShowModal(false)}>
					<div className="modal" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h3>Заявка на закупку</h3>
							<button
								className="modal-close"
								onClick={() => setShowModal(false)}
							>
								<X size={20} />
							</button>
						</div>
						<div className="modal-body">
							<label>Что необходимо закупить:</label>
							<textarea
								autoFocus
								value={purchaseText}
								onChange={(e) => setPurchaseText(e.target.value)}
								placeholder="Введите список необходимых материалов/инструментов..."
								rows={6}
							/>
						</div>
						<div className="modal-footer">
							<button
								className="btn btn-secondary"
								onClick={() => setShowModal(false)}
							>
								Отмена
							</button>
							<button
								className="btn btn-primary"
								onClick={() => {
									if (purchaseText.trim()) {
										onChange(purchaseText.trim());
										// Создаём заявку на закупку с реальным текстом
										onCreateBuy?.({
											objectName: formData.objectName,
											shortAddress: formData.shortAddress,
											whatToBuy: purchaseText.trim(),
											creator: formData.creator,
										});
									} else {
										onChange("3");
									}
									setShowModal(false);
								}}
							>
								Сохранить
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

// === ВЫБОР СОТРУДНИКОВ ===
function StaffSelect({ value, onChange, staff, placeholder }) {
	const [isOpen, setIsOpen] = useState(false);
	const [inputValue, setInputValue] = useState(value || "");

	return (
		<div className="staff-select-wrapper">
			<input
				type="text"
				value={inputValue}
				onChange={(e) => {
					setInputValue(e.target.value);
					onChange(e.target.value);
				}}
				onFocus={() => setIsOpen(true)}
				onBlur={() => setTimeout(() => setIsOpen(false), 200)}
				placeholder={placeholder}
				list="staff-list"
			/>
			<datalist id="staff-list">
				{staff.map((s) => (
					<option key={s.id} value={s.fullName} />
				))}
			</datalist>
			{isOpen && (
				<div className="staff-dropdown">
					{staff.map((s) => (
						<div
							key={s.id}
							className={`staff-option ${s.fullName === value ? "selected" : ""}`}
							onClick={() => {
								setInputValue(s.fullName);
								onChange(s.fullName);
								setIsOpen(false);
							}}
						>
							<span className="staff-name">{s.fullName}</span>
							<span className="staff-position">{s.position}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// === ВЫБОР КОНТАКТА С ДОБАВЛЕНИЕМ ===
function ContactSelect({
	value,
	onChange,
	contacts,
	objectName,
	onAddContact,
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [inputValue, setInputValue] = useState(value || "");
	const [showAddForm, setShowAddForm] = useState(false);
	const [newContactName, setNewContactName] = useState("");
	const [newContactPhone, setNewContactPhone] = useState("");

	const objectContacts = contacts.filter(
		(c) => c.objectName === objectName || !objectName,
	);

	const handleAddNew = () => {
		if (newContactName.trim()) {
			onAddContact?.({
				name: newContactName,
				phone: newContactPhone,
				objectName: objectName,
			});
			setInputValue(newContactName);
			onChange(newContactName);
			setNewContactName("");
			setNewContactPhone("");
			setShowAddForm(false);
			setIsOpen(false);
		}
	};

	return (
		<div className="contact-select-wrapper">
			<input
				type="text"
				value={inputValue}
				onChange={(e) => {
					setInputValue(e.target.value);
					onChange(e.target.value);
				}}
				onFocus={() => setIsOpen(true)}
				onBlur={() => setTimeout(() => setIsOpen(false), 200)}
				placeholder="Выберите контакт или введите новый"
				list="contacts-list"
			/>
			<datalist id="contacts-list">
				{objectContacts.map((c) => (
					<option key={c.id} value={c.name} />
				))}
			</datalist>
			{isOpen && (
				<div className="contact-dropdown">
					{objectContacts.map((c) => (
						<div
							key={c.id}
							className={`contact-option ${c.name === value ? "selected" : ""}`}
							onClick={() => {
								setInputValue(c.name);
								onChange(c.name);
								setIsOpen(false);
							}}
						>
							<span className="contact-name">{c.name}</span>
							{c.phone && <span className="contact-phone">{c.phone}</span>}
						</div>
					))}
					<div className="contact-add-divider" />
					<div className="contact-add" onClick={() => setShowAddForm(true)}>
						<Plus size={14} />
						<span>Добавить новый контакт</span>
					</div>
				</div>
			)}
			{showAddForm && (
				<div className="contact-add-form">
					<input
						type="text"
						placeholder="Имя контакта"
						value={newContactName}
						onChange={(e) => setNewContactName(e.target.value)}
					/>
					<input
						type="text"
						placeholder="Телефон"
						value={newContactPhone}
						onChange={(e) => setNewContactPhone(e.target.value)}
					/>
					<div className="contact-add-actions">
						<button
							type="button"
							className="btn btn-sm btn-primary"
							onClick={handleAddNew}
						>
							Добавить
						</button>
						<button
							type="button"
							className="btn btn-sm"
							onClick={() => setShowAddForm(false)}
						>
							Отмена
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

// === ОСНОВНОЙ КОМПОНЕНТ ФОРМЫ ВЫЗОВА ===
export default function CallsForm({
	objects,
	staff,
	systems,
	contacts,
	tools,
	onAddCall,
	onCreateTransport,
	onCreateBuy,
	onOpenSystemDetail,
}) {
	const [formData, setFormData] = useState({
		createdAt: new Date().toISOString().split("T")[0],
		deadline: "",
		executionDate: "",
		engineer: "",
		assistant: "",
		status: "new",
		type: "",
		objectName: "",
		shortAddress: "",
		tenant: "",
		system: "",
		request: "",
		ourTool: "",
		toPurchase: "",
		toRepair: "",
		activation: "",
		dataOwner: "",
		customerContact: "",
		creator: "",
	});

	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});

	// Проверяем заполнен ли объект
	const isObjectSelected = formData.objectName?.trim()?.length > 0;

	// Получаем выбранный объект и его id
	const selectedObjId = useMemo(() => {
		const obj = objects.find(
			(o) =>
				o["Наименование объекта"] === formData.objectName ||
				o["Адрес сокращенный"] === formData.objectName,
		);
		return obj?.id || null;
	}, [formData.objectName, objects]);

	// Получаем системы для выбранного объекта
	const objectSystems = useMemo(() => {
		if (!formData.objectName) return [];
		const obj = objects.find(
			(o) =>
				o["Наименование объекта"] === formData.objectName ||
				o["Адрес сокращенный"] === formData.objectName,
		);
		if (!obj) return [];
		const objSystems = systems.filter(
			(s) =>
				s.objectId === obj.id || s.parentObject === obj["Наименование объекта"],
		);
		if (objSystems.length > 0) {
			return [...new Set(objSystems.map((s) => s.systemType).filter(Boolean))];
		}
		// fallback на системы из поля объекта
		const systemsStr = obj["Системы"] || "";
		return systemsStr
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
	}, [formData.objectName, objects, systems]);

	// Обновляем доступные системы при изменении объекта
	useEffect(() => {
		if (objectSystems.length > 0 && !formData.system) {
			// Не меняем system если уже заполнен
		}
	}, [objectSystems]);

	// Проверка дедлайна
	const getDeadlineStatus = (dateStr) => {
		if (!dateStr) return "empty"; // пустой - голубой
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const deadline = new Date(dateStr);
		deadline.setHours(0, 0, 0, 0);
		const diff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
		if (diff <= 2) return "urgent"; // ≤2 дней - красный
		return "normal";
	};

	// Обработка изменения поля
	const handleChange = (field, value) => {
		setFormData({ ...formData, [field]: value });
		setTouched({ ...touched, [field]: true });

		// Универсальная функция заполнения данных объекта
		const fillFromObject = (obj) => {
			if (!obj) return;
			const systemsStr = obj["Системы"] || "";
			setFormData((prev) => ({
				...prev,
				objectName: obj["Наименование объекта"] || prev.objectName,
				shortAddress: obj["Адрес сокращенный"] || prev.shortAddress,
				tenant: obj["Арендатор"] || prev.tenant,
				// Подтягиваем ВСЕ системы из объекта
				system: systemsStr.trim(),
			}));
		};

		// При вводе в поле адреса — ищем объект и заполняем всё
		if (field === "shortAddress") {
			const obj = objects.find((o) => o["Адрес сокращенный"] === value);
			if (obj) fillFromObject(obj);
		}

		// При вводе в поле объекта — ищем по названию ИЛИ по адресу
		if (field === "objectName") {
			const obj = objects.find(
				(o) =>
					o["Наименование объекта"] === value ||
					o["Адрес сокращенный"] === value ||
					`${o.objectNumber || o.id}. ${o["Наименование объекта"]}` === value,
			);
			if (obj) fillFromObject(obj);
		}
	};

	// Создание заявки на транспорт
	const handleCreateTransport = () => {
		onCreateTransport?.({
			objectName: formData.objectName,
			shortAddress: formData.shortAddress,
			whatToTransport: formData.toRepair || "Доставка инструмента",
		});
	};

	// Создание заявки на закупку
	const handleCreateBuy = () => {
		onCreateBuy?.({
			objectName: formData.objectName,
			shortAddress: formData.shortAddress,
			whatToBuy: formData.toPurchase,
		});
	};

	// Отправка формы
	const handleSubmit = (e) => {
		e.preventDefault();

		// Валидация заявки (минимум 10 символов)
		if (!formData.request?.trim() || formData.request.trim().length < 10) {
			setErrors({ ...errors, request: "Минимум 10 символов для сохранения" });
			return;
		}

		if (!formData.objectName?.trim()) {
			setErrors({ ...errors, objectName: "Выберите объект" });
			return;
		}

		onAddCall?.(formData, { skipBuyCreation: true });
		setFormData({
			createdAt: new Date().toISOString().split("T")[0],
			deadline: "",
			executionDate: "",
			engineer: "",
			assistant: "",
			status: "new",
			type: "",
			objectName: "",
			shortAddress: "",
			tenant: "",
			system: "",
			request: "",
			ourTool: "",
			toPurchase: "",
			toRepair: "",
			activation: "",
			dataOwner: "",
			customerContact: "",
			creator: "",
		});
		setErrors({});
		setTouched({});
	};

	const deadlineStatus = getDeadlineStatus(formData.deadline);
	const isEngineerRequired = !formData.engineer?.trim();
	const isSystemRequired = !formData.system?.trim();
	const isRequestRequired =
		!formData.request?.trim() || formData.request.trim().length < 10;
	const isDataOwnerRed =
		formData.ourTool === "3" || formData.toPurchase === "3";

	return (
		<div className="calls-form-container">
			<div className="form-header">
				<h3>
					<Plus size={20} />
					Новая заявка (вызов)
				</h3>
				<div className="form-hint">
					<span className="hint-item required">*</span> - обязательные поля
				</div>
			</div>

			<form onSubmit={handleSubmit} className="calls-form">
				<div className="form-grid">
					{/* Дата заявки */}
					<div className="form-group">
						<label>Дата заявки</label>
						<input
							type="date"
							value={formData.createdAt}
							onChange={(e) => handleChange("createdAt", e.target.value)}
						/>
					</div>

					{/* Дедлайн - с календарём и цветовой индикацией */}
					<div className="form-group">
						<label className={`deadline-label ${deadlineStatus}`}>
							Дедлайн
							{deadlineStatus === "empty" && (
								<span className="status-badge empty">(не заполнено)</span>
							)}
							{deadlineStatus === "urgent" && (
								<span className="status-badge urgent">≤2 дней!</span>
							)}
						</label>
						<DeadlineCalendar
							value={formData.deadline}
							onChange={(val) => handleChange("deadline", val)}
						/>
					</div>

					{/* Дата проведения */}
					<div className="form-group">
						<label>Дата проведения</label>
						<input
							type="date"
							value={formData.executionDate}
							onChange={(e) => handleChange("executionDate", e.target.value)}
							disabled={!isObjectSelected}
							className={isObjectSelected ? "" : "disabled-field"}
						/>
					</div>

					{/* Исполнитель - КРАСНЫЙ пока не выбран */}
					<div className="form-group">
						<label
							className={`required-label ${isEngineerRequired ? "error" : ""}`}
						>
							Исполнитель *
							{isEngineerRequired && (
								<span className="required-indicator">!</span>
							)}
						</label>
						<StaffSelect
							value={formData.engineer}
							onChange={(val) => handleChange("engineer", val)}
							staff={staff}
							placeholder="Выберите исполнителя"
						/>
					</div>

					{/* Помощник - ГОЛУБОЙ матовый до заполнения + "(не требуется)" / "(требуется)" */}
					<div className="form-group">
						<label
							className={!formData.assistant ? "helper-label-unfilled" : ""}
						>
							Помощник
							{!formData.assistant && (
								<span className="helper-options">
									<span
										className="helper-option"
										onClick={() => handleChange("assistant", "(не требуется)")}
									>
										(не требуется)
									</span>
									<span className="helper-separator"> / </span>
									<span
										className="helper-option required"
										onClick={() => handleChange("assistant", "(требуется)")}
									>
										(требуется)
									</span>
								</span>
							)}
						</label>
						<div
							className={`helper-input-wrapper ${!formData.assistant ? "unfilled" : ""}`}
						>
							<StaffSelect
								value={formData.assistant}
								onChange={(val) => handleChange("assistant", val)}
								staff={staff}
								placeholder="Выберите помощника"
							/>
							{!formData.assistant && (
								<div className="helper-hint">Выберите или введите ФИО</div>
							)}
						</div>
					</div>

					{/* Статус вызова */}
					<div className="form-group">
						<label>Статус</label>
						<select
							value={formData.status}
							onChange={(e) => handleChange("status", e.target.value)}
							disabled={!isObjectSelected}
							className={isObjectSelected ? "" : "disabled-field"}
						>
							<option value="new">Новый</option>
							<option value="in_progress">В работе</option>
							<option value="completed">Завершён</option>
						</select>
					</div>

					{/* Тип заявки */}
					<div className="form-group">
						<label>Тип заявки</label>
						<select
							value={formData.type}
							onChange={(e) => handleChange("type", e.target.value)}
							disabled={!isObjectSelected}
							className={isObjectSelected ? "" : "disabled-field"}
						>
							<option value="">-- Выберите --</option>
							<option value="ТО">ТО</option>
							<option value="СМР">СМР</option>
							<option value="Аварийная">Аварийная</option>
							<option value="Плановый">Плановый</option>
						</select>
					</div>

					{/* ОБЪЕКТ — поиск по названию или адресу */}
					<div className="form-group">
						<label className="required-label">
							Объект или адрес *
							<span className="field-hint">(поиск по названию или адресу)</span>
						</label>
						<input
							type="text"
							value={formData.objectName}
							onChange={(e) => handleChange("objectName", e.target.value)}
							list="objects-list"
							placeholder="Введите название или адрес"
							className={
								errors.objectName && touched.objectName ? "input-error" : ""
							}
							autoFocus
						/>
						<datalist id="objects-list">
							{objects.map((obj) => (
								<option key={obj.id} value={obj["Наименование объекта"]} />
							))}
							{objects.map((obj) => (
								<option
									key={`addr-${obj.id}`}
									value={obj["Адрес сокращенный"]}
								/>
							))}
						</datalist>
						{errors.objectName && touched.objectName && (
							<span className="error-message">{errors.objectName}</span>
						)}
					</div>

					{/* СОКРАЩЕННЫЙ АДРЕС */}
					<div className="form-group">
						<label>Сокращенный адрес</label>
						<AddressSelect
							value={formData.shortAddress}
							onChange={(val) => handleChange("shortAddress", val)}
							objects={objects}
							onSelectObject={(obj) =>
								handleChange("objectName", obj["Наименование объекта"])
							}
						/>
					</div>

					{/* Арендатор - заполняется автоматически */}
					<div className="form-group">
						<label>Арендатор</label>
						<input
							type="text"
							value={formData.tenant}
							onChange={(e) => handleChange("tenant", e.target.value)}
							disabled={!isObjectSelected}
							className={isObjectSelected ? "auto-filled" : "disabled-field"}
						/>
					</div>

					{/* СИСТЕМА - мультивыбор с галочками, КРАСНЫЙ если не заполнено */}
					<div className="form-group">
						<label
							className={`required-label ${isSystemRequired ? "error" : ""}`}
						>
							Система *
							{isSystemRequired && (
								<span className="required-indicator">!</span>
							)}
						</label>
						<SystemMultiSelect
							value={formData.system}
							onChange={(val) => handleChange("system", val)}
							availableSystems={
								objectSystems.length > 0
									? objectSystems
									: ["АПС", "СОУЭ", "ВПВ", "ОПС", "ВИДЕОНАБЛЮДЕНИЕ", "СКУД"]
							}
							disabled={!isObjectSelected}
							objectId={selectedObjId}
							onOpenSystem={() => onOpenSystemDetail?.(selectedObjId)}
						/>
						{!isObjectSelected && (
							<span className="field-hint">Сначала выберите объект</span>
						)}
					</div>

					{/* ЗАЯВКА - КРАСНЫЙ если не заполнено, сохраняется только если ≥10 символов */}
					<div className="form-group form-group-full">
						<label
							className={`required-label ${isRequestRequired ? "error" : ""}`}
						>
							Заявка * (минимум 10 символов)
							{isRequestRequired && (
								<span className="required-indicator">!</span>
							)}
						</label>
						<textarea
							value={formData.request}
							onChange={(e) => handleChange("request", e.target.value)}
							rows={4}
							placeholder="Опишите заявку подробно (минимум 10 символов)..."
							disabled={!isObjectSelected}
							className={`${isObjectSelected ? "" : "disabled-field"} ${isRequestRequired ? "input-error" : ""}`}
						/>
						{errors.request && (
							<span className="error-message">{errors.request}</span>
						)}
						{formData.request && (
							<span className="char-count">
								{formData.request.length} символов
							</span>
						)}
					</div>

					{/* НАШ ИНСТРУМЕНТ - выпадающее меню с цветами */}
					<div className="form-group">
						<label>Наш инструмент</label>
						<OurToolSelect
							value={formData.ourTool}
							onChange={(val) => handleChange("ourTool", val)}
							onCreateTransport={handleCreateTransport}
							transportStatus={formData.ourTool === "2"}
							disabled={!isObjectSelected}
							tools={tools}
							objects={objects}
						/>
					</div>

					{/* ПРИОБРЕСТИ ДЛЯ ВЫПОЛНЕНИЯ */}
					<div className="form-group">
						<label>Приобрести для выполнения</label>
						<PurchaseSelect
							value={formData.toPurchase}
							onChange={(val) => handleChange("toPurchase", val)}
							onCreateBuy={handleCreateBuy}
							buyStatus={formData.toPurchase === "2"}
							disabled={!isObjectSelected}
						/>
					</div>

					{/* ОТВЕЗТИ В РЕМОНТ */}
					<div className="form-group form-group-full">
						<label>Отвезти в ремонт</label>
						<textarea
							value={formData.toRepair}
							onChange={(e) => handleChange("toRepair", e.target.value)}
							rows={2}
							placeholder="Опишите, что требует ремонта..."
							disabled={!isObjectSelected}
							className={isObjectSelected ? "" : "disabled-field"}
						/>
					</div>

					{/* АКТИВИРОВАНИЕ РАБОТ */}
					<div className="form-group">
						<label>Активирование работы</label>
						<select
							value={formData.activation}
							onChange={(e) => handleChange("activation", e.target.value)}
							disabled={!isObjectSelected || formData.status !== "completed"}
							className={
								isObjectSelected && formData.status === "completed"
									? ""
									: "disabled-field"
							}
						>
							<option value="">-- Выберите --</option>
							<option value="требуется">Требуется</option>
							<option value="не требуется">Не требуется</option>
						</select>
						{formData.status !== "completed" && (
							<span className="field-hint">
								Доступно после статуса "Завершён"
							</span>
						)}
					</div>

					{/* У КОГО ДАННЫЕ - краснеет если ourTool=3 или toPurchase=3 */}
					<div className="form-group">
						<label className={isDataOwnerRed ? "error-label" : ""}>
							У кого данные
							{isDataOwnerRed && <span className="required-indicator">!</span>}
						</label>
						<StaffSelect
							value={formData.dataOwner}
							onChange={(val) => handleChange("dataOwner", val)}
							staff={staff}
							placeholder="Выберите сотрудника (необязательно)"
						/>
						{isDataOwnerRed && (
							<span className="field-hint error-hint">
								Укажите, у кого хранятся данные по заявке
							</span>
						)}
					</div>

					{/* КТО ОБРАТИЛСЯ - выпадающий список контактов + добавление нового */}
					<div className="form-group">
						<label>Кто обратился с заявкой от заказчика</label>
						<ContactSelect
							value={formData.customerContact}
							onChange={(val) => handleChange("customerContact", val)}
							contacts={contacts}
							objectName={formData.objectName}
							onAddContact={(newContact) => {
								// Callback для добавления контакта
								console.log("Add contact:", newContact);
							}}
							disabled={!isObjectSelected}
						/>
					</div>

					{/* СОЗДАТЕЛЬ ЗАЯВКИ */}
					<div className="form-group">
						<label>Создатель заявки</label>
						<StaffSelect
							value={formData.creator}
							onChange={(val) => handleChange("creator", val)}
							staff={staff}
							placeholder="Ваше имя"
						/>
					</div>
				</div>

				<div className="form-actions">
					<button
						type="submit"
						className="btn btn-primary btn-lg"
						disabled={!isObjectSelected || isRequestRequired}
					>
						<Plus size={18} />
						Создать заявку
					</button>
					{!isObjectSelected && (
						<span className="form-warning">
							<AlertCircle size={16} />
							Сначала заполните "Наименование объекта"
						</span>
					)}
					{isObjectSelected && isRequestRequired && (
						<span className="form-warning">
							<AlertCircle size={16} />
							Заполните "Заявку" (минимум 10 символов)
						</span>
					)}
				</div>
			</form>
		</div>
	);
}
