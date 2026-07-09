import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.EXPLORER_PORT || 3002;

const pool = new pg.Pool({
	user: process.env.DB_USER || "crm_user",
	password: process.env.DB_PASSWORD || "crm_password",
	host: process.env.DB_HOST || "127.0.0.1",
	port: parseInt(process.env.DB_PORT) || 5432,
	database: process.env.DB_NAME || "crm_db",
});

app.use(express.json());

const HTML_HEADER = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM Система — Панель управления</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; color: #333; }
        .header { background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 20px 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header h1 { font-size: 24px; font-weight: 600; }
        .header p { opacity: 0.9; margin-top: 5px; font-size: 14px; }
        .container { max-width: 1400px; margin: 0 auto; padding: 30px 40px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 4px 15px rgba(0,0,0,0.12); }
        .stat-card h3 { color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .stat-card .value { font-size: 36px; font-weight: 700; color: #1a73e8; }
        .tables-section { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .tables-section h2 { margin-bottom: 20px; font-size: 20px; color: #333; display: flex; align-items: center; gap: 10px; }
        .tables-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; }
        .table-card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; cursor: pointer; transition: all 0.2s; }
        .table-card:hover { border-color: #1a73e8; background: #f8f9ff; }
        .table-card h4 { color: #1a73e8; font-size: 15px; margin-bottom: 8px; }
        .table-card p { color: #666; font-size: 13px; }
        .table-card .count { display: inline-block; background: #e8f0fe; color: #1a73e8; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
        .footer { text-align: center; padding: 30px; color: #999; font-size: 13px; }
        @media (max-width: 768px) { .container { padding: 20px; } .header { padding: 15px 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>CRM Система управления</h1>
        <p>Панель администратора базы данных</p>
    </div>
    <div class="container">
        <div class="stats" id="stats"></div>
        <div class="tables-section">
            <h2>Таблицы базы данных</h2>
            <div class="tables-grid" id="tables"></div>
        </div>
    </div>
    <div class="footer">CRM Система управления базами данных</div>
    <script>
        async function loadData() {
            try {
                const response = await fetch('/api/stats');
                const data = await response.json();
                
                document.getElementById('stats').innerHTML = data.tables.map(function(t) { 
                    return '<div class="stat-card"><h3>' + t.table_name + '</h3><div class="value">' + t.count + '</div></div>';
                }).join('');
                
                document.getElementById('tables').innerHTML = data.tables.map(function(t) { 
                    return '<div class="table-card" onclick="window.location.href='/table/' + t.table_name + ''">' +
                    '<h4>' + t.table_name + '</h4>' +
                    '<p>Просмотр и редактирование данных</p>' +
                    '<span class="count">' + t.count + ' записей</span></div>';
                }).join('');
            } catch (e) { console.error(e); }
        }
        loadData();
    </script>
</body>
</html>`;

const TABLE_HEADER = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TABLE_NAME — CRM Система</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; color: #333; }
        .header { background: white; padding: 15px 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); display: flex; justify-content: space-between; align-items: center; }
        .header h1 { font-size: 20px; color: #1a73e8; }
        .header a { color: #666; text-decoration: none; display: flex; align-items: center; gap: 5px; }
        .header a:hover { color: #1a73e8; }
        .container { max-width: 1600px; margin: 0 auto; padding: 30px 40px; }
        .info { background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); display: flex; justify-content: space-between; align-items: center; }
        .info h2 { font-size: 18px; }
        .info span { color: #666; }
        .table-wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        table { width: 100%; border-collapse: collapse; overflow-x: auto; display: block; }
        th { background: #f8f9fa; padding: 12px 15px; text-align: left; font-weight: 600; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e0e0e0; white-space: nowrap; }
        td { padding: 12px 15px; border-bottom: 1px solid #f0f0f0; font-size: 14px; white-space: nowrap; max-width: 300px; overflow: hidden; text-overflow: ellipsis; }
        tr:hover td { background: #f8f9ff; }
        tr:last-child td { border-bottom: none; }
        .loading { text-align: center; padding: 40px; color: #666; }
        .footer { text-align: center; padding: 30px; color: #999; font-size: 13px; }
        @media (max-width: 768px) { .container { padding: 20px; } .header { padding: 15px 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>TABLE_NAME</h1>
        <a href="/">Назад к панели</a>
    </div>
    <div class="container">
        <div class="info">
            <h2>Данные таблицы</h2>
            <span id="count">Загрузка...</span>
        </div>
        <div class="table-wrapper">
            <table id="data-table">
                <thead id="thead"></thead>
                <tbody id="tbody"><tr><td colspan="10" class="loading">Загрузка данных...</td></tr></tbody>
            </table>
        </div>
    </div>
    <div class="footer">CRM Система</div>
    <script>
        var tableName = 'TABLE_NAME';
        async function loadTable() {
            try {
                var response = await fetch('/api/table/' + tableName);
                var data = await response.json();
                
                document.getElementById('count').textContent = 'Всего записей: ' + data.total;
                
                var theadHtml = '<tr>';
                for (var i = 0; i < data.columns.length; i++) {
                    theadHtml += '<th>' + data.columns[i].column_name + '<br><small style="text-transform:none;color:#999">' + data.columns[i].data_type + '</small></th>';
                }
                theadHtml += '</tr>';
                document.getElementById('thead').innerHTML = theadHtml;
                
                var tbodyHtml = '';
                for (var j = 0; j < data.rows.length; j++) {
                    tbodyHtml += '<tr>';
                    for (var k = 0; k < data.columns.length; k++) {
                        var val = data.rows[j][data.columns[k].column_name];
                        tbodyHtml += '<td>' + (val !== null ? val : '') + '</td>';
                    }
                    tbodyHtml += '</tr>';
                }
                document.getElementById('tbody').innerHTML = tbodyHtml;
            } catch (e) { document.getElementById('tbody').innerHTML = '<tr><td colspan="10" style="text-align:center;color:red">Ошибка загрузки</td></tr>'; }
        }
        loadTable();
    </script>
</body>
</html>`;

// Главная страница
app.get("/", (req, res) => {
	res.send(HTML_HEADER);
});

// API: статистика по таблицам
app.get("/api/stats", async (req, res) => {
	try {
		const tables = [
			"objects",
			"staff",
			"calls",
			"costs",
			"systems",
			"contacts",
			"sections",
			"section_fields",
			"tools",
			"transport",
			"buy",
			"invoices",
			"activations",
			"time_entries",
			"wishes",
		];
		const counts = [];

		for (const t of tables) {
			try {
				const r = await pool.query("SELECT COUNT(*) as count FROM " + t);
				counts.push({ table_name: t, count: parseInt(r.rows[0].count) });
			} catch {
				counts.push({ table_name: t, count: 0 });
			}
		}
		res.json({ tables: counts });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// API: список всех таблиц
app.get("/api/tables", async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
		);
		res.json(result.rows.map((r) => r.table_name));
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// API: данные таблицы
app.get("/api/table/:name", async (req, res) => {
	try {
		const name = req.params.name;
		// Проверка имени таблицы (защита от SQL injection)
		const safeName = name.replace(/[^a-zA-Z0-9_]/g, "");

		const dataResult = await pool.query(
			"SELECT * FROM " + safeName + " LIMIT 100",
		);
		const columnsResult = await pool.query(
			"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
			[safeName],
		);

		res.json({
			columns: columnsResult.rows,
			rows: dataResult.rows,
			total: dataResult.rows.length,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// HTML страница таблицы
app.get("/table/:name", (req, res) => {
	const name = req.params.name;
	const safeName = name.replace(/[^a-zA-Z0-9_]/g, "");
	const html = TABLE_HEADER.replace(/TABLE_NAME/g, safeName);
	res.send(html);
});

app.listen(PORT, "0.0.0.0", () => {
	console.log("Database Explorer запущен: http://0.0.0.0:" + PORT);
});
