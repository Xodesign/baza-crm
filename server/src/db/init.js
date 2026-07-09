import pg from "pg";
const { Client } = pg;

const dbUrl = new URL(
	process.env.DATABASE_URL ||
		"postgresql://crm_user:crm_password@127.0.0.1:5432/crm_db",
);

const initSchema = `
-- Objects (Объекты)
CREATE TABLE IF NOT EXISTS objects (
  id SERIAL PRIMARY KEY,
  object_number INTEGER,
  customer VARCHAR(500),
  contractor VARCHAR(200),
  contract_number VARCHAR(200),
  contract_start_date VARCHAR(50),
  contract_end_date VARCHAR(50),
  contract_type VARCHAR(50),
  renewability VARCHAR(200),
  price_increase_letter_date VARCHAR(50),
  price_increase_percent VARCHAR(50),
  additional_agreement VARCHAR(100),
  letters VARCHAR(200),
  repair_payer VARCHAR(200),
  additional_works_payment VARCHAR(200),
  advance_payment VARCHAR(100),
  full_address TEXT,
  short_address VARCHAR(300),
  object_name VARCHAR(300),
  rd_id_pd VARCHAR(100),
  tenant VARCHAR(300),
  systems VARCHAR(500),
  estimated_time VARCHAR(100),
  contacts VARCHAR(300),
  has_tool VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(300),
  position VARCHAR(200),
  location VARCHAR(200),
  phone VARCHAR(100),
  email VARCHAR(200),
  description TEXT,
  photo VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calls (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deadline VARCHAR(50),
  execution_date VARCHAR(50),
  engineer VARCHAR(200),
  assistant VARCHAR(200),
  status VARCHAR(50) DEFAULT 'new',
  type VARCHAR(100),
  object_id INTEGER REFERENCES objects(id),
  object_name VARCHAR(300),
  short_address VARCHAR(300),
  tenant VARCHAR(300),
  system VARCHAR(200),
  request TEXT,
  our_tool VARCHAR(500),
  to_purchase VARCHAR(500),
  to_repair VARCHAR(500),
  activation VARCHAR(500),
  data_owner VARCHAR(200),
  customer_contact VARCHAR(300),
  creator VARCHAR(200),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS systems (
  id SERIAL PRIMARY KEY,
  object_id INTEGER REFERENCES objects(id),
  parent_object VARCHAR(300),
  system_type VARCHAR(200),
  brand VARCHAR(200),
  system_kind VARCHAR(200),
  quantity VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS costs (
  id SERIAL PRIMARY KEY,
  object_id INTEGER REFERENCES objects(id),
  object_name VARCHAR(300),
  short_address VARCHAR(300),
  system VARCHAR(200),
  employee VARCHAR(300),
  amount VARCHAR(100),
  reason VARCHAR(300),
  description TEXT,
  receipt_photo VARCHAR(500),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tools (
  id SERIAL PRIMARY KEY,
  object_id INTEGER REFERENCES objects(id),
  tool VARCHAR(300),
  inventory_number VARCHAR(100),
  brand VARCHAR(200),
  object_name VARCHAR(300),
  short_address VARCHAR(300),
  arrival_date VARCHAR(50),
  call_status VARCHAR(100),
  transport_request VARCHAR(300),
  target_address VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transport (
  id SERIAL PRIMARY KEY,
  request_date VARCHAR(50),
  deadline VARCHAR(50),
  assigned_date VARCHAR(50),
  assigned_to VARCHAR(200),
  purchase_status VARCHAR(100),
  call_status VARCHAR(100),
  status VARCHAR(50) DEFAULT 'new',
  object_name VARCHAR(300),
  short_address VARCHAR(300),
  what_to_transport TEXT,
  tools_list TEXT,
  creator VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS buy (
  id SERIAL PRIMARY KEY,
  object_id INTEGER REFERENCES objects(id),
  request_date VARCHAR(50),
  deadline VARCHAR(50),
  status VARCHAR(100),
  contract_number VARCHAR(200),
  object_name VARCHAR(300),
  short_address VARCHAR(300),
  payer VARCHAR(200),
  what_to_buy TEXT,
  creator VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  request_date VARCHAR(50),
  contract_number VARCHAR(200),
  object_name VARCHAR(300),
  short_address VARCHAR(300),
  payer VARCHAR(200),
  what_to_buy TEXT,
  creator VARCHAR(200),
  confirmed VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(300),
  phone VARCHAR(100),
  object_name VARCHAR(300),
  short_address VARCHAR(300),
  source VARCHAR(50) DEFAULT 'object',
  object_id INTEGER REFERENCES objects(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activations (
  id SERIAL PRIMARY KEY,
  object_id INTEGER REFERENCES objects(id),
  request_date VARCHAR(50),
  execution_date VARCHAR(50),
  engineer VARCHAR(200),
  request_type VARCHAR(100),
  object_name VARCHAR(300),
  short_address VARCHAR(300),
  system VARCHAR(200),
  request TEXT,
  to_purchase TEXT,
  customer_contact VARCHAR(300),
  creator VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS time_entries (
  id SERIAL PRIMARY KEY,
  customer VARCHAR(500),
  contractor VARCHAR(200),
  contract_number VARCHAR(200),
  full_address TEXT,
  short_address VARCHAR(300),
  object_name VARCHAR(300),
  tenant VARCHAR(300),
  systems VARCHAR(500),
  calculated_yearly_time VARCHAR(100),
  actual_yearly_time VARCHAR(100),
  time_difference VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS summary (
  id SERIAL PRIMARY KEY,
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calendar_object (
  id SERIAL PRIMARY KEY,
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wishes (
  id SERIAL PRIMARY KEY,
  wish TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS extra (
  id SERIAL PRIMARY KEY,
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_objects_name ON objects(object_name);
CREATE INDEX IF NOT EXISTS idx_calls_object_id ON calls(object_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_costs_object_id ON costs(object_id);
CREATE INDEX IF NOT EXISTS idx_contacts_object_id ON contacts(object_id);
`;

async function initDatabase() {
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

		await client.query(initSchema);
		console.log("Database schema created successfully");

		await client.end();
		console.log("Database initialization complete");
	} catch (error) {
		console.error("Error initializing database:", error);
		process.exit(1);
	}
}

initDatabase();
