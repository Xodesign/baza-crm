import { useState, useEffect } from "react";
import {
	Plus,
	Edit2,
	Trash2,
	Shield,
	ShieldCheck,
	Eye,
	EyeOff,
	Save,
	X,
	Check,
	AlertCircle,
	UserCog,
	Ban,
	Unlock,
} from "lucide-react";
import { authApi } from "../api/auth";

const ROLE_LABELS = {
	admin: { label: "Администратор", color: "#dc2626" },
	manager: { label: "Менеджер", color: "#2563eb" },
	engineer: { label: "Инженер", color: "#059669" },
	accountant: { label: "Бухгалтер", color: "#7c3aed" },
	viewer: { label: "Наблюдатель", color: "#64748b" },
};

const ALL_SECTIONS = [
	{ id: "objects", name: "Объекты" },
	{ id: "calls", name: "Звонки" },
	{ id: "contacts", name: "Контакты" },
	{ id: "staff", name: "Персонал" },
	{ id: "systems", name: "Системы" },
	{ id: "tools", name: "Инструменты" },
	{ id: "activation", name: "Актирование" },
	{ id: "costs", name: "Расходы" },
	{ id: "buy", name: "Закупки" },
	{ id: "invoices", name: "Счета" },
	{ id: "transport", name: "Транспорт" },
	{ id: "time", name: "Время" },
	{ id: "wishes", name: "Пожелания" },
];

const ROLES_INFO = {
	admin: {
		description: "Полный доступ ко всем разделам системы",
		functions: [
			"Создание и редактирование объектов",
			"Управление пользователями",
			"Просмотр и редактирование заявок",
			"Управление инструментами",
			"Просмотр отчётов и статистики",
			"Импорт/экспорт данных Excel",
			"Настройка системы",
		],
	},
	manager: {
		description: "Работа с клиентами и заявками",
		functions: [
			"Просмотр и создание объектов",
			"Приём и обработка заявок",
			"Работа с контактами",
			"Закупки материалов",
			"Заказ транспорта",
			"Просмотр сводных данных",
		],
	},
	engineer: {
		description: "Выезд на объекты и работа с оборудованием",
		functions: [
			"Просмотр назначенных заявок",
			"Изменение статуса заявки",
			"Работа с инструментами (получение/возврат)",
			"Создание активаций",
			"Отметка о выполненных работах",
		],
	},
	accountant: {
		description: "Финансовый учёт и документооборот",
		functions: [
			"Просмотр и управление счетами",
			"Учёт расходов",
			"Закупки и их статусы",
			"Просмотр финансовой статистики",
		],
	},
	viewer: {
		description: "Только просмотр без редактирования",
		functions: [
			"Просмотр объектов",
			"Просмотр заявок",
			"Просмотр контактов",
			"Нельзя создавать/редактировать данные",
		],
	},
};

export default function UsersPanel() {
	const [users, setUsers] = useState([]);
	const [roles, setRoles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Modal states
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState(null);

	// Form states
	const [formData, setFormData] = useState({
		username: "",
		password: "",
		fullName: "",
		email: "",
		role: "viewer",
		isActive: true,
	});
	const [customPermissions, setCustomPermissions] = useState({});

	useEffect(() => {
		loadData();
	}, []);

	async function loadData() {
		setLoading(true);
		setError("");
		try {
			const [usersData, rolesData] = await Promise.all([
				authApi.getUsers(),
				authApi.getRoles(),
			]);
			setUsers(usersData);
			setRoles(rolesData);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}

	function openCreateModal() {
		setFormData({
			username: "",
			password: "",
			fullName: "",
			email: "",
			role: "viewer",
			isActive: true,
		});
		setCustomPermissions({});
		setIsCreateModalOpen(true);
	}

	function openEditModal(user) {
		setEditingUser(user);
		setFormData({
			username: user.username,
			password: "",
			fullName: user.full_name || "",
			email: user.email || "",
			role: user.role,
			isActive: user.is_active !== false,
		});
		setCustomPermissions(user.permissions || {});
		setIsEditModalOpen(true);
	}

	function openPermissionsModal(user) {
		setEditingUser(user);
		setCustomPermissions(user.permissions || {});
		setIsPermissionsModalOpen(true);
	}

	function togglePermission(section) {
		setCustomPermissions((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	}

	async function handleCreate(e) {
		e.preventDefault();
		setError("");
		try {
			await authApi.createUser(formData);
			setSuccess("Пользователь создан!");
			setIsCreateModalOpen(false);
			loadData();
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError(err.message);
		}
	}

	async function handleUpdate(e) {
		e.preventDefault();
		setError("");
		try {
			const updateData = {
				role: formData.role,
				full_name: formData.fullName,
				email: formData.email,
				is_active: formData.isActive,
				permissions: customPermissions,
			};
			if (formData.password) updateData.password = formData.password;
			await authApi.updateUser(editingUser.id, updateData);
			setSuccess("Пользователь обновлён!");
			setIsEditModalOpen(false);
			loadData();
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError(err.message);
		}
	}

	async function handleSavePermissions() {
		setError("");
		try {
			await authApi.updateUser(editingUser.id, {
				permissions: customPermissions,
			});
			setSuccess("Права обновлены!");
			setIsPermissionsModalOpen(false);
			loadData();
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError(err.message);
		}
	}

	async function handleDelete(user) {
		if (!confirm(`Удалить пользователя "${user.username}"?`)) return;
		setError("");
		try {
			await authApi.deleteUser(user.id);
			setSuccess("Пользователь удалён!");
			loadData();
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError(err.message);
		}
	}

	async function handleResetPassword(user) {
		const newPassword = prompt(`Введите новый пароль для "${user.username}":`);
		if (!newPassword || newPassword.length < 4) {
			alert("Пароль должен содержать минимум 4 символа");
			return;
		}
		setError("");
		try {
			await authApi.resetPassword(user.id, newPassword);
			setSuccess("Пароль изменён! Пользователю нужно войти заново.");
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError(err.message);
		}
	}

	async function handleToggleActive(user) {
		setError("");
		try {
			await authApi.toggleUserActive(user.id);
			setSuccess(
				user.is_active
					? "Пользователь заблокирован!"
					: "Пользователь разблокирован!",
			);
			loadData();
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			setError(err.message);
		}
	}

	function selectRole(role) {
		const roleData = roles.find((r) => r.id === role);
		setFormData((prev) => ({ ...prev, role }));
		if (roleData) {
			setCustomPermissions({ ...roleData.permissions });
		}
	}

	if (loading) {
		return (
			<div className="section">
				<div className="loading">Загрузка пользователей...</div>
			</div>
		);
	}

	return (
		<div className="section">
			<div className="section-header">
				<div className="section-title">
					<UserCog size={24} />
					<h2>Управление пользователями</h2>
				</div>
				<button className="btn btn-primary" onClick={openCreateModal}>
					<Plus size={18} />
					Создать пользователя
				</button>
			</div>

			{error && (
				<div className="alert alert-error">
					<AlertCircle size={18} />
					{error}
				</div>
			)}

			{success && (
				<div className="alert alert-success">
					<Check size={18} />
					{success}
				</div>
			)}

			<div className="users-table-container">
				<table className="users-table">
					<thead>
						<tr>
							<th>Пользователь</th>
							<th>Роль</th>
							<th>Статус</th>
							<th>Действия</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => (
							<tr key={user.id} className={!user.isActive ? "inactive" : ""}>
								<td>
									<div className="user-info">
										<div className="user-avatar">
											{user.username.charAt(0).toUpperCase()}
										</div>
										<div>
											<div className="user-name">
												{user.fullName || user.username}
											</div>
											<div className="user-email">@{user.username}</div>
										</div>
									</div>
								</td>
								<td>
									<span
										className="role-badge"
										style={{
											backgroundColor:
												ROLE_LABELS[user.role]?.color || "#64748b",
										}}
									>
										{ROLE_LABELS[user.role]?.label || user.role}
									</span>
								</td>
								<td>
									{user.is_active !== false ? (
										<span className="status-badge status-active">
											<Check size={14} /> Активен
										</span>
									) : (
										<span className="status-badge status-inactive">
											<X size={14} /> Заблокирован
										</span>
									)}
								</td>
								<td>
									<div className="action-buttons">
										<button
											className="btn btn-icon"
											title="Редактировать"
											onClick={() => openEditModal(user)}
										>
											<Edit2 size={16} />
										</button>
										<button
											className="btn btn-icon"
											title="Права доступа"
											onClick={() => openPermissionsModal(user)}
										>
											<Shield size={16} />
										</button>
										<button
											className={
												user.is_active
													? "btn btn-icon btn-warning"
													: "btn btn-icon btn-success"
											}
											title={
												user.is_active ? "Заблокировать" : "Разблокировать"
											}
											onClick={() => handleToggleActive(user)}
										>
											{user.is_active ? (
												<Ban size={16} />
											) : (
												<Unlock size={16} />
											)}
										</button>
										<button
											className="btn btn-icon"
											title="Сбросить пароль"
											onClick={() => handleResetPassword(user)}
										>
											<EyeOff size={16} />
										</button>
										<button
											className="btn btn-icon btn-danger"
											title="Удалить"
											onClick={() => handleDelete(user)}
										>
											<Trash2 size={16} />
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Create Modal */}
			{isCreateModalOpen && (
				<div
					className="modal-overlay"
					onClick={() => setIsCreateModalOpen(false)}
				>
					<div className="modal" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h3>Создать пользователя</h3>
							<button
								className="btn btn-icon"
								onClick={() => setIsCreateModalOpen(false)}
							>
								<X size={20} />
							</button>
						</div>
						<form onSubmit={handleCreate}>
							<div className="modal-body">
								<div className="form-group">
									<label>Логин *</label>
									<input
										type="text"
										value={formData.username}
										onChange={(e) =>
											setFormData({ ...formData, username: e.target.value })
										}
										required
									/>
								</div>
								<div className="form-group">
									<label>Пароль *</label>
									<input
										type="password"
										value={formData.password}
										onChange={(e) =>
											setFormData({ ...formData, password: e.target.value })
										}
										required
									/>
								</div>
								<div className="form-group">
									<label>Полное имя</label>
									<input
										type="text"
										value={formData.fullName}
										onChange={(e) =>
											setFormData({ ...formData, fullName: e.target.value })
										}
									/>
								</div>
								<div className="form-group">
									<label>Email</label>
									<input
										type="email"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
									/>
								</div>
								<div className="form-group">
									<label>Роль</label>
									<select
										value={formData.role}
										onChange={(e) => selectRole(e.target.value)}
									>
										{roles.map((role) => (
											<option key={role.id} value={role.id}>
												{role.name}
											</option>
										))}
									</select>
									{ROLES_INFO[formData.role] && (
										<div className="role-info-box">
											<div className="role-info-title">
												📋 {ROLES_INFO[formData.role].description}
											</div>
											<div className="role-functions">
												{ROLES_INFO[formData.role].functions.map((fn, i) => (
													<div key={i} className="role-function-item">
														<span className="role-check">✓</span> {fn}
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
							<div className="modal-footer">
								<button
									type="button"
									className="btn btn-secondary"
									onClick={() => setIsCreateModalOpen(false)}
								>
									Отмена
								</button>
								<button type="submit" className="btn btn-primary">
									<Save size={16} /> Создать
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit Modal */}
			{isEditModalOpen && (
				<div
					className="modal-overlay"
					onClick={() => setIsEditModalOpen(false)}
				>
					<div className="modal" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h3>Редактировать: {editingUser?.username}</h3>
							<button
								className="btn btn-icon"
								onClick={() => setIsEditModalOpen(false)}
							>
								<X size={20} />
							</button>
						</div>
						<form onSubmit={handleUpdate}>
							<div className="modal-body">
								<div className="form-group">
									<label>Логин</label>
									<input type="text" value={formData.username} disabled />
								</div>
								<div className="form-group">
									<label>Новый пароль (оставьте пустым)</label>
									<input
										type="password"
										value={formData.password}
										onChange={(e) =>
											setFormData({ ...formData, password: e.target.value })
										}
										placeholder="Введите для изменения"
									/>
								</div>
								<div className="form-group">
									<label>Полное имя</label>
									<input
										type="text"
										value={formData.fullName}
										onChange={(e) =>
											setFormData({ ...formData, fullName: e.target.value })
										}
									/>
								</div>
								<div className="form-group">
									<label>Email</label>
									<input
										type="email"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
									/>
								</div>
								<div className="form-group">
									<label>Роль</label>
									<select
										value={formData.role}
										onChange={(e) => selectRole(e.target.value)}
									>
										{roles.map((role) => (
											<option key={role.id} value={role.id}>
												{role.name}
											</option>
										))}
									</select>
									{ROLES_INFO[formData.role] && (
										<div className="role-info-box">
											<div className="role-info-title">
												📋 {ROLES_INFO[formData.role].description}
											</div>
											<div className="role-functions">
												{ROLES_INFO[formData.role].functions.map((fn, i) => (
													<div key={i} className="role-function-item">
														<span className="role-check">✓</span> {fn}
													</div>
												))}
											</div>
										</div>
									)}
								</div>
								<div className="form-group">
									<label className="checkbox-label">
										<input
											type="checkbox"
											checked={formData.isActive}
											onChange={(e) =>
												setFormData({ ...formData, isActive: e.target.checked })
											}
										/>
										Активен
									</label>
								</div>
							</div>
							<div className="modal-footer">
								<button
									type="button"
									className="btn btn-secondary"
									onClick={() => setIsEditModalOpen(false)}
								>
									Отмена
								</button>
								<button type="submit" className="btn btn-primary">
									<Save size={16} /> Сохранить
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Permissions Modal */}
			{isPermissionsModalOpen && (
				<div
					className="modal-overlay"
					onClick={() => setIsPermissionsModalOpen(false)}
				>
					<div
						className="modal modal-wide"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="modal-header">
							<h3>
								<ShieldCheck size={20} /> Права доступа: {editingUser?.username}
							</h3>
							<button
								className="btn btn-icon"
								onClick={() => setIsPermissionsModalOpen(false)}
							>
								<X size={20} />
							</button>
						</div>
						<div className="modal-body">
							<p className="permissions-info">
								Выберите разделы, к которым пользователь получит доступ:
							</p>
							<div className="permissions-grid">
								{ALL_SECTIONS.map((section) => (
									<label
										key={section.id}
										className={`permission-item ${
											customPermissions[section.id] ? "active" : ""
										}`}
									>
										<input
											type="checkbox"
											checked={customPermissions[section.id] === true}
											onChange={() => togglePermission(section.id)}
										/>
										<span>{section.name}</span>
										{customPermissions[section.id] ? (
											<Eye size={16} className="permission-check" />
										) : (
											<EyeOff size={16} className="permission-cross" />
										)}
									</label>
								))}
							</div>
						</div>
						<div className="modal-footer">
							<button
								type="button"
								className="btn btn-secondary"
								onClick={() => setIsPermissionsModalOpen(false)}
							>
								Отмена
							</button>
							<button
								type="button"
								className="btn btn-primary"
								onClick={handleSavePermissions}
							>
								<Save size={16} /> Сохранить права
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
