// ══════════════════════════════════════════════════════
// 0. LIMPIEZA DE LA BD EN CASO DE SER NECESARIO
// ══════════════════════════════════════════════════════
// MATCH (n) DETACH DELETE n;

// ══════════════════════════════════════════════════════
// 1. CONSTRAINTS
// ══════════════════════════════════════════════════════
CREATE CONSTRAINT unique_usuario_id IF NOT EXISTS
    FOR (u:Usuario) REQUIRE u.id IS UNIQUE;

CREATE CONSTRAINT unique_usuario_alias IF NOT EXISTS
    FOR (u:Usuario) REQUIRE u.alias IS UNIQUE;

CREATE CONSTRAINT unique_bebida_id IF NOT EXISTS
    FOR (b:Bebida) REQUIRE b.id IS UNIQUE;

CREATE CONSTRAINT unique_sabor_nombre IF NOT EXISTS
    FOR (s:Sabor) REQUIRE s.nombre IS UNIQUE;

// ══════════════════════════════════════════════════════
// 2. ÍNDICES
// ══════════════════════════════════════════════════════
CREATE INDEX idx_usuario_id     IF NOT EXISTS FOR (u:Usuario) ON (u.id);
CREATE INDEX idx_usuario_alias  IF NOT EXISTS FOR (u:Usuario) ON (u.alias);
CREATE INDEX idx_bebida_id      IF NOT EXISTS FOR (b:Bebida)  ON (b.id);
CREATE INDEX idx_bebida_cat     IF NOT EXISTS FOR (b:Bebida)  ON (b.categoria);
CREATE INDEX idx_sabor_nombre   IF NOT EXISTS FOR (s:Sabor)   ON (s.nombre);

// ══════════════════════════════════════════════════════
// 3. SABORES
// ══════════════════════════════════════════════════════
MERGE (:Sabor {nombre: 'dulce'})
MERGE (:Sabor {nombre: 'amargo'})
MERGE (:Sabor {nombre: 'fuerte'})
MERGE (:Sabor {nombre: 'suave'})
MERGE (:Sabor {nombre: 'refrescante'})
MERGE (:Sabor {nombre: 'afrutado'})
MERGE (:Sabor {nombre: 'salado'})
MERGE (:Sabor {nombre: 'espumoso'})
MERGE (:Sabor {nombre: 'herbal'})

// ══════════════════════════════════════════════════════
// 4. BEBIDAS — Alcohólicas
// ══════════════════════════════════════════════════════
MERGE (:Bebida {id:'B001', nombre:'Ron Añejo',
        categoria:'ron',         alcohol_pct:40.0, precio:85.0})
MERGE (:Bebida {id:'B002', nombre:'Vodka Cítrico',
        categoria:'vodka',       alcohol_pct:38.0, precio:110.0})
MERGE (:Bebida {id:'B004', nombre:'Cerveza IPA',
        categoria:'cerveza',     alcohol_pct:6.5,  precio:35.0})
MERGE (:Bebida {id:'B005', nombre:'Mojito Maracuyá',
        categoria:'coctel',      alcohol_pct:12.0, precio:55.0})
MERGE (:Bebida {id:'B007', nombre:'Whisky Escocés',
        categoria:'whisky',      alcohol_pct:43.0, precio:195.0})
MERGE (:Bebida {id:'B008', nombre:'Vino Tinto Malbec',
        categoria:'vino',        alcohol_pct:14.0, precio:120.0})
MERGE (:Bebida {id:'B009', nombre:'Tequila Blanco',
        categoria:'tequila',     alcohol_pct:38.0, precio:90.0})
MERGE (:Bebida {id:'B010', nombre:'Aguardiente Quetzalteca',
        categoria:'aguardiente', alcohol_pct:29.0, precio:40.0})
MERGE (:Bebida {id:'B011', nombre:'Cerveza Gallo',
        categoria:'cerveza',     alcohol_pct:4.0,  precio:18.0})
MERGE (:Bebida {id:'B012', nombre:'Piña Colada',
        categoria:'coctel',      alcohol_pct:10.0, precio:65.0})

// Sin alcohol
MERGE (:Bebida {id:'B003', nombre:'Limonada de Jamaica',
        categoria:'sin_alcohol', alcohol_pct:0.0, precio:18.0})
MERGE (:Bebida {id:'B006', nombre:'Agua con Gas',
        categoria:'sin_alcohol', alcohol_pct:0.0, precio:12.0})
MERGE (:Bebida {id:'B013', nombre:'Jugo de Maracuyá',
        categoria:'sin_alcohol', alcohol_pct:0.0, precio:15.0})
MERGE (:Bebida {id:'B014', nombre:'Limonada Clásica',
        categoria:'sin_alcohol', alcohol_pct:0.0, precio:14.0})
MERGE (:Bebida {id:'B015', nombre:'Horchata',
        categoria:'sin_alcohol', alcohol_pct:0.0, precio:12.0})
MERGE (:Bebida {id:'B016', nombre:'Agua Tónica',
        categoria:'sin_alcohol', alcohol_pct:0.0, precio:16.0})

// ══════════════════════════════════════════════════════
// 5. BEBIDA → SABOR
// ══════════════════════════════════════════════════════
MATCH (b:Bebida {id:'B001'}), (s:Sabor {nombre:'fuerte'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.90}]->(s);
MATCH (b:Bebida {id:'B001'}), (s:Sabor {nombre:'amargo'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.50}]->(s);

MATCH (b:Bebida {id:'B002'}), (s:Sabor {nombre:'suave'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.80}]->(s);
MATCH (b:Bebida {id:'B002'}), (s:Sabor {nombre:'afrutado'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.70}]->(s);
MATCH (b:Bebida {id:'B002'}), (s:Sabor {nombre:'dulce'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.50}]->(s);

MATCH (b:Bebida {id:'B003'}), (s:Sabor {nombre:'refrescante'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.95}]->(s);
MATCH (b:Bebida {id:'B003'}), (s:Sabor {nombre:'dulce'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.80}]->(s);

MATCH (b:Bebida {id:'B004'}), (s:Sabor {nombre:'amargo'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.85}]->(s);
MATCH (b:Bebida {id:'B004'}), (s:Sabor {nombre:'fuerte'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.40}]->(s);
MATCH (b:Bebida {id:'B004'}), (s:Sabor {nombre:'espumoso'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.70}]->(s);

MATCH (b:Bebida {id:'B005'}), (s:Sabor {nombre:'afrutado'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.90}]->(s);
MATCH (b:Bebida {id:'B005'}), (s:Sabor {nombre:'refrescante'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.75}]->(s);
MATCH (b:Bebida {id:'B005'}), (s:Sabor {nombre:'dulce'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.60}]->(s);

MATCH (b:Bebida {id:'B006'}), (s:Sabor {nombre:'refrescante'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 1.00}]->(s);
MATCH (b:Bebida {id:'B006'}), (s:Sabor {nombre:'salado'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.30}]->(s);

MATCH (b:Bebida {id:'B007'}), (s:Sabor {nombre:'fuerte'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.95}]->(s);
MATCH (b:Bebida {id:'B007'}), (s:Sabor {nombre:'amargo'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.60}]->(s);
MATCH (b:Bebida {id:'B007'}), (s:Sabor {nombre:'herbal'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.50}]->(s);

MATCH (b:Bebida {id:'B008'}), (s:Sabor {nombre:'amargo'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.55}]->(s);
MATCH (b:Bebida {id:'B008'}), (s:Sabor {nombre:'afrutado'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.75}]->(s);
MATCH (b:Bebida {id:'B008'}), (s:Sabor {nombre:'suave'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.60}]->(s);

MATCH (b:Bebida {id:'B009'}), (s:Sabor {nombre:'fuerte'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.88}]->(s);
MATCH (b:Bebida {id:'B009'}), (s:Sabor {nombre:'salado'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.60}]->(s);
MATCH (b:Bebida {id:'B009'}), (s:Sabor {nombre:'herbal'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.45}]->(s);

MATCH (b:Bebida {id:'B010'}), (s:Sabor {nombre:'fuerte'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.80}]->(s);
MATCH (b:Bebida {id:'B010'}), (s:Sabor {nombre:'dulce'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.45}]->(s);

MATCH (b:Bebida {id:'B011'}), (s:Sabor {nombre:'suave'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.70}]->(s);
MATCH (b:Bebida {id:'B011'}), (s:Sabor {nombre:'amargo'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.45}]->(s);
MATCH (b:Bebida {id:'B011'}), (s:Sabor {nombre:'espumoso'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.75}]->(s);

MATCH (b:Bebida {id:'B012'}), (s:Sabor {nombre:'dulce'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.90}]->(s);
MATCH (b:Bebida {id:'B012'}), (s:Sabor {nombre:'afrutado'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.85}]->(s);
MATCH (b:Bebida {id:'B012'}), (s:Sabor {nombre:'suave'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.65}]->(s);

MATCH (b:Bebida {id:'B013'}), (s:Sabor {nombre:'afrutado'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.95}]->(s);
MATCH (b:Bebida {id:'B013'}), (s:Sabor {nombre:'dulce'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.70}]->(s);
MATCH (b:Bebida {id:'B013'}), (s:Sabor {nombre:'refrescante'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.80}]->(s);

MATCH (b:Bebida {id:'B014'}), (s:Sabor {nombre:'refrescante'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.90}]->(s);
MATCH (b:Bebida {id:'B014'}), (s:Sabor {nombre:'amargo'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.40}]->(s);
MATCH (b:Bebida {id:'B014'}), (s:Sabor {nombre:'dulce'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.65}]->(s);

MATCH (b:Bebida {id:'B015'}), (s:Sabor {nombre:'dulce'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.85}]->(s);
MATCH (b:Bebida {id:'B015'}), (s:Sabor {nombre:'suave'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.80}]->(s);

MATCH (b:Bebida {id:'B016'}), (s:Sabor {nombre:'refrescante'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.85}]->(s);
MATCH (b:Bebida {id:'B016'}), (s:Sabor {nombre:'amargo'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.60}]->(s);
MATCH (b:Bebida {id:'B016'}), (s:Sabor {nombre:'salado'})
  MERGE (b)-[:TIENE_SABOR {intensidad: 0.35}]->(s);

// ══════════════════════════════════════════════════════
// 6. USUARIOS — con password y rol
// password de todos en texto plano para referencia:
//   admin123  → $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
//   user123   → $2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk2wt/O
// ══════════════════════════════════════════════════════
MERGE (u:Usuario {id:'U001'})
SET u.alias           = 'CristiánX',
    u.edad            = 22,
    u.presupuesto_max = 80.0,
    u.prefiere_alcohol= true,
    u.rol             = 'USER',
    u.password        = '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk2wt/O';

MERGE (u:Usuario {id:'U002'})
SET u.alias           = 'AlvaroF',
    u.edad            = 25,
    u.presupuesto_max = 20.0,
    u.prefiere_alcohol= true,
    u.rol             = 'USER',
    u.password        = '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk2wt/O';

MERGE (u:Usuario {id:'U003'})
SET u.alias           = 'TonyA',
    u.edad            = 30,
    u.presupuesto_max = 25.0,
    u.prefiere_alcohol= false,
    u.rol             = 'USER',
    u.password        = '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk2wt/O';

MERGE (u:Usuario {id:'U004'})
SET u.alias           = 'MariaG',
    u.edad            = 28,
    u.presupuesto_max = 150.0,
    u.prefiere_alcohol= true,
    u.rol             = 'USER',
    u.password        = '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk2wt/O';

MERGE (u:Usuario {id:'U005'})
SET u.alias           = 'PedroR',
    u.edad            = 35,
    u.presupuesto_max = 50.0,
    u.prefiere_alcohol= true,
    u.rol             = 'USER',
    u.password        = '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk2wt/O';

MERGE (u:Usuario {id:'U006'})
SET u.alias           = 'SofiaM',
    u.edad            = 21,
    u.presupuesto_max = 30.0,
    u.prefiere_alcohol= false,
    u.rol             = 'USER',
    u.password        = '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk2wt/O';

// ADMIN — el único con rol ADMIN
MERGE (u:Usuario {id:'ADMIN001'})
SET u.alias           = 'admin',
    u.edad            = 30,
    u.presupuesto_max = 999.0,
    u.prefiere_alcohol= true,
    u.rol             = 'ADMIN',
    u.password        = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

// ══════════════════════════════════════════════════════
// 7. relaciones de usuario sabor
// ══════════════════════════════════════════════════════
MATCH (u:Usuario {id:'U001'}), (s:Sabor {nombre:'fuerte'})
  MERGE (u)-[:LE_GUSTA {peso: 0.90}]->(s);
MATCH (u:Usuario {id:'U001'}), (s:Sabor {nombre:'amargo'})
  MERGE (u)-[:LE_GUSTA {peso: 0.60}]->(s);

MATCH (u:Usuario {id:'U002'}), (s:Sabor {nombre:'dulce'})
  MERGE (u)-[:LE_GUSTA {peso: 0.85}]->(s);
MATCH (u:Usuario {id:'U002'}), (s:Sabor {nombre:'suave'})
  MERGE (u)-[:LE_GUSTA {peso: 0.70}]->(s);
MATCH (u:Usuario {id:'U002'}), (s:Sabor {nombre:'afrutado'})
  MERGE (u)-[:LE_GUSTA {peso: 0.65}]->(s);

MATCH (u:Usuario {id:'U003'}), (s:Sabor {nombre:'refrescante'})
  MERGE (u)-[:LE_GUSTA {peso: 1.00}]->(s);
MATCH (u:Usuario {id:'U003'}), (s:Sabor {nombre:'dulce'})
  MERGE (u)-[:LE_GUSTA {peso: 0.80}]->(s);

MATCH (u:Usuario {id:'U004'}), (s:Sabor {nombre:'afrutado'})
  MERGE (u)-[:LE_GUSTA {peso: 0.90}]->(s);
MATCH (u:Usuario {id:'U004'}), (s:Sabor {nombre:'suave'})
  MERGE (u)-[:LE_GUSTA {peso: 0.80}]->(s);
MATCH (u:Usuario {id:'U004'}), (s:Sabor {nombre:'herbal'})
  MERGE (u)-[:LE_GUSTA {peso: 0.70}]->(s);

MATCH (u:Usuario {id:'U005'}), (s:Sabor {nombre:'fuerte'})
  MERGE (u)-[:LE_GUSTA {peso: 0.85}]->(s);
MATCH (u:Usuario {id:'U005'}), (s:Sabor {nombre:'salado'})
  MERGE (u)-[:LE_GUSTA {peso: 0.75}]->(s);
MATCH (u:Usuario {id:'U005'}), (s:Sabor {nombre:'amargo'})
  MERGE (u)-[:LE_GUSTA {peso: 0.50}]->(s);

MATCH (u:Usuario {id:'U006'}), (s:Sabor {nombre:'dulce'})
  MERGE (u)-[:LE_GUSTA {peso: 0.95}]->(s);
MATCH (u:Usuario {id:'U006'}), (s:Sabor {nombre:'afrutado'})
  MERGE (u)-[:LE_GUSTA {peso: 0.90}]->(s);
MATCH (u:Usuario {id:'U006'}), (s:Sabor {nombre:'refrescante'})
  MERGE (u)-[:LE_GUSTA {peso: 0.70}]->(s);

// ══════════════════════════════════════════════════════
// 8. HISTORIAL DE CONSUMO
// ══════════════════════════════════════════════════════
MATCH (u:Usuario {id:'U001'}), (b:Bebida {id:'B001'})
  MERGE (u)-[:CONSUMIO {rating:5, fecha:date('2026-02-10')}]->(b);
MATCH (u:Usuario {id:'U001'}), (b:Bebida {id:'B010'})
  MERGE (u)-[:CONSUMIO {rating:4, fecha:date('2026-03-01')}]->(b);

MATCH (u:Usuario {id:'U002'}), (b:Bebida {id:'B002'})
  MERGE (u)-[:CONSUMIO {rating:4, fecha:date('2026-03-01')}]->(b);
MATCH (u:Usuario {id:'U002'}), (b:Bebida {id:'B012'})
  MERGE (u)-[:CONSUMIO {rating:5, fecha:date('2026-03-20')}]->(b);

MATCH (u:Usuario {id:'U003'}), (b:Bebida {id:'B003'})
  MERGE (u)-[:CONSUMIO {rating:5, fecha:date('2026-03-15')}]->(b);
MATCH (u:Usuario {id:'U003'}), (b:Bebida {id:'B006'})
  MERGE (u)-[:CONSUMIO {rating:3, fecha:date('2026-03-20')}]->(b);

MATCH (u:Usuario {id:'U004'}), (b:Bebida {id:'B008'})
  MERGE (u)-[:CONSUMIO {rating:5, fecha:date('2026-03-10')}]->(b);
MATCH (u:Usuario {id:'U004'}), (b:Bebida {id:'B005'})
  MERGE (u)-[:CONSUMIO {rating:4, fecha:date('2026-03-22')}]->(b);

MATCH (u:Usuario {id:'U005'}), (b:Bebida {id:'B009'})
  MERGE (u)-[:CONSUMIO {rating:5, fecha:date('2026-02-28')}]->(b);
MATCH (u:Usuario {id:'U005'}), (b:Bebida {id:'B007'})
  MERGE (u)-[:CONSUMIO {rating:4, fecha:date('2026-03-15')}]->(b);

MATCH (u:Usuario {id:'U006'}), (b:Bebida {id:'B013'})
  MERGE (u)-[:CONSUMIO {rating:5, fecha:date('2026-03-18')}]->(b);
MATCH (u:Usuario {id:'U006'}), (b:Bebida {id:'B015'})
  MERGE (u)-[:CONSUMIO {rating:4, fecha:date('2026-03-25')}]->(b);