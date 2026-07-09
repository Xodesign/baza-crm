import { useState, useEffect, useCallback, useRef } from "react";
import { Save, Plus, Trash2, X, Building2 } from "lucide-react";

export default function SystemsSection({
  objects,
  setObjects,
  syncObjectToServer,
}) {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [systemTypes, setSystemTypes] = useState([
    "АПС", "СОУЭ", "ВПВ", "ОПС", "ВИДЕОНАБЛЮДЕНИЕ", "СКУД", "АТС", "СТРАН",
  ]);
  const [newSystemName, setNewSystemName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showObjectPanel, setShowObjectPanel] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const saveTimeoutRef = useRef(null);

  // Загрузить типы систем с VPS
  useEffect(() => {
    fetch("https://firebaze.ru/api/systems")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSystemTypes(data.map(s => s.name));
        }
      })
      .catch(err => console.warn("Не удалось загрузить типы систем:", err));
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
    return systemsData[systemName] || { brand: "", type: "", qty: "", link: "", alarm: "" };
  };

  const updateSystemData = useCallback((objectId, systemName, field, value) => {
    const targetObj = objects.find(o => o.id === objectId);
    if (!targetObj) return;
    
    const serverId = targetObj._serverId || targetObj.id;
    const dataToSave = {
      ...targetObj,
      systemsData: {
        ...(targetObj.systemsData || {}),
        [systemName]: {
          ...(targetObj.systemsData?.[systemName] || {}),
          [field]: value,
        },
      },
    };

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const token = localStorage.getItem("authToken");
      const { id, ...data } = dataToSave;
      fetch(`https://firebaze.ru/api/objects/${serverId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(data),
      }).then(res => {
        if (res.ok) console.log("Сохранено:", systemName, field, value);
      }).catch(err => console.error("Ошибка:", err));
    }, 1000);
  }, [objects]);

  const handleAddSystem = async (e) => {
    e?.preventDefault();
    if (!newSystemName.trim()) return;
    
    setIsAdding(true);
    try {
      const res = await fetch("https://firebaze.ru/api/systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSystemName.trim() })
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
    if (!confirm(`Удалить "${systemName}"?`)) return;
    
    try {
      const res = await fetch(`https://firebaze.ru/api/systems/${encodeURIComponent(systemName)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSystemTypes(systemTypes.filter(s => s !== systemName));
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
      updateSystemData(editingCell.objectId, editingCell.systemName, editingCell.field, editValue);
    }
    setEditingCell(null);
    setEditValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") finishEdit();
    if (e.key === "Escape") setEditingCell(null);
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const sortedObjects = [...objects].sort((a, b) => (b.objectNumber || 0) - (a.objectNumber || 0));

  const handleOpenObject = (obj) => {
    setSelectedObject(obj);
    setShowObjectPanel(true);
  };

  return (
    <div>
      <div className="content-header">
        <h2>Системы</h2>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={18} /> Добавить систему
          </button>
        </div>
      </div>

      {/* Форма добавления новой системы */}
      {showAddForm && (
        <div className="add-form-section">
          <form onSubmit={handleAddSystem} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="text"
              value={newSystemName}
              onChange={(e) => setNewSystemName(e.target.value)}
              placeholder="Название новой системы"
              style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #ddd" }}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={isAdding}>
              {isAdding ? "..." : "Добавить"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
              Отмена
            </button>
          </form>
        </div>
      )}

      {/* Таблица систем */}
      <div className="systems-excel-container">
        <table className="systems-excel-table">
          <thead>
            <tr>
              <th className="excel-sticky-col excel-system-col">Тип системы</th>
              {sortedObjects.map((obj) => (
                <th key={obj.id} className="excel-object-header" onClick={() => handleOpenObject(obj)} style={{cursor:'pointer'}}>
                  <Building2 size={14} style={{marginRight:4}} />
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
                  <button className="btn-icon btn-delete btn-sm" onClick={() => handleDeleteSystem(sys)} title="Удалить">
                    <Trash2 size={14} />
                  </button>
                </td>
                {sortedObjects.map((obj) =>
                  systemFields.map((field) => {
                    const cellKey = `${obj.id}-${sys}-${field.key}`;
                    const isEditing = editingCell && editingCell.objectId === obj.id && 
                      editingCell.systemName === sys && editingCell.field === field.key;
                    const value = getSystemData(obj, sys)[field.key] || "";
                    return (
                      <td key={cellKey}
                        className={`excel-cell ${isEditing ? "editing" : ""} ${!value ? "empty-cell" : ""}`}
                        onDoubleClick={() => startEdit(obj.id, sys, field.key, value)}
                        onClick={() => handleOpenObject(obj)}
                      >
                        {isEditing ? (
                          <input type="text" value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={finishEdit} onKeyDown={handleKeyDown}
                            className="excel-input" autoFocus />
                        ) : value}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
            {/* Строка добавления новой системы */}
            <tr className="add-system-row">
              <td className="excel-sticky-col excel-system-cell">
                {showAddForm ? (
                  <input
                    type="text"
                    value={newSystemName}
                    onChange={(e) => setNewSystemName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddSystem(); if (e.key === "Escape") setShowAddForm(false); }}
                    placeholder="Название системы"
                    style={{ width: "100%", padding: "4px", borderRadius: 4, border: "1px solid #007bff" }}
                    autoFocus
                  />
                ) : (
                  <button className="btn btn-sm btn-link" onClick={() => setShowAddForm(true)}>
                    <Plus size={14} /> Добавить систему
                  </button>
                )}
              </td>
              {sortedObjects.map((obj) => (
                <td key={obj.id} className="excel-cell" style={{ background: "#f8f9fa" }}>
                  <span style={{ color: "#6c757d", fontSize: "12px" }}>—</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="systems-help">
        <p>Кликните на название объекта для детального просмотра. Двойной клик на ячейке для редактирования.</p>
      </div>

      {/* Панель объекта справа */}
      {showObjectPanel && selectedObject && (
        <div className="object-panel-overlay" onClick={() => setShowObjectPanel(false)}>
          <div className="object-panel" onClick={(e) => e.stopPropagation()}>
            <div className="object-panel-header">
              <h3>{selectedObject["Наименование объекта"] || `Объект ${selectedObject.id}`}</h3>
              <button className="btn-icon" onClick={() => setShowObjectPanel(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="object-panel-info">
              <p><strong>Адрес:</strong> {selectedObject["Адрес сокращенный"] || selectedObject["Адрес полный объекта"] || "—"}</p>
              <p><strong>Заказчик:</strong> {selectedObject["Заказчик"] || "—"}</p>
              <p><strong>Подрядчик:</strong> {selectedObject["Подрядчик"] || "—"}</p>
              <p><strong>Системы на объекте:</strong> {selectedObject["Системы"] || "Не выбраны"}</p>
            </div>

            <h4>Данные по системам:</h4>
            <div className="object-panel-systems">
              {systemTypes.map((sys) => (
                <div key={sys} className="system-card">
                  <div className="system-card-header">
                    <strong>{sys}</strong>
                    {(selectedObject["Системы"] || "").includes(sys) && (
                      <span className="badge badge-success">✓</span>
                    )}
                  </div>
                  <div className="system-card-fields">
                    {systemFields.map((field) => {
                      const data = getSystemData(selectedObject, sys);
                      const value = data[field.key] || "";
                      return (
                        <div key={field.key} className="field-row">
                          <label>{field.label}:</label>
                          {value ? (
                            <span>{value}</span>
                          ) : (
                            <em>Не заполнено</em>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
