#!/usr/bin/env python3
"""
Genera backend/seed/datos_demo.sql: datos de demostración realistas para el marketplace.

Uso:  python3 backend/seed/generar_datos_demo.py
Luego importa, sobre la base creada con sistema_ventass.sql:
      mysql -u root sistema_ventas < backend/seed/datos_demo.sql

- Conserva las 7 cuentas originales (mismas contraseñas) y agrega compradores y vendedores.
- Reemplaza productos, pedidos, pagos, comisiones, reseñas, chats y reportes de prueba.
- Las fotos de los productos están en backend/uploads/productos/demo_*.jpg (Wikimedia Commons, ver CREDITOS.md).
- Semilla fija: siempre genera los mismos datos.
"""
import random
from datetime import datetime, timedelta
from pathlib import Path

random.seed(2026)
OUT = Path(__file__).with_name('datos_demo.sql')
HOY = datetime(2026, 11, 21, 18, 0)


def q(v):
    if v is None:
        return 'NULL'
    if isinstance(v, (int, float)):
        return repr(round(v, 2)) if isinstance(v, float) else str(v)
    if isinstance(v, datetime):
        return f"'{v:%Y-%m-%d %H:%M:%S}'"
    return "'" + str(v).replace('\\', '\\\\').replace("'", "''") + "'"


def insert(table, cols, rows):
    if not rows:
        return ''
    vals = ',\n'.join('(' + ', '.join(q(v) for v in r) + ')' for r in rows)
    return f"INSERT INTO {table} ({', '.join(cols)}) VALUES\n{vals};\n\n"


sql = []
sql.append("""-- ============================================================
-- Datos de demostración — MarketPlace Paceño
-- Generado por backend/seed/generar_datos_demo.py (no editar a mano)
-- ============================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- El frontend usa los estados Enviado / Entregado / Cancelado: se agregan al ENUM.
ALTER TABLE compra MODIFY estado ENUM('Pendiente','Pagada','Enviado','Entregado','Cancelada','Cancelado') DEFAULT NULL;
ALTER TABLE tienda MODIFY estado ENUM('Activa','Desactivada','Pendiente','Rechazada') DEFAULT NULL;

TRUNCATE TABLE dispersion; TRUNCATE TABLE comision; TRUNCATE TABLE pago;
TRUNCATE TABLE detalle_compra; TRUNCATE TABLE compra; TRUNCATE TABLE resena;
TRUNCATE TABLE reporte_producto; TRUNCATE TABLE inventario; TRUNCATE TABLE producto;
TRUNCATE TABLE documento; TRUNCATE TABLE perfil_vendedor; TRUNCATE TABLE tienda;
TRUNCATE TABLE vendedor; TRUNCATE TABLE comprador; TRUNCATE TABLE categoria; TRUNCATE TABLE ubicacion;
DELETE FROM cuenta_usuario WHERE id_usuario > 7;

""")

# ---------------------------------------------------------------- Usuarios
sql.append("""UPDATE cuenta_usuario SET rol = 'Comprador' WHERE id_usuario = 5;
UPDATE cuenta_usuario SET fecha_creacion = '2025-12-02 09:15:00' WHERE id_usuario = 1;
UPDATE cuenta_usuario SET fecha_creacion = '2026-01-10 10:20:00' WHERE id_usuario = 2;
UPDATE cuenta_usuario SET fecha_creacion = '2026-01-12 16:05:00' WHERE id_usuario = 3;
UPDATE cuenta_usuario SET fecha_creacion = '2026-01-18 11:40:00' WHERE id_usuario = 4;
UPDATE cuenta_usuario SET fecha_creacion = '2026-02-03 19:12:00' WHERE id_usuario = 5;
UPDATE cuenta_usuario SET fecha_creacion = '2026-01-20 08:30:00' WHERE id_usuario = 6;
UPDATE cuenta_usuario SET fecha_creacion = '2026-03-14 21:02:00' WHERE id_usuario = 7;

""")

nuevos_usuarios = [
    # id, email, rol, estado, fecha
    (8, 'gabriela.rojas@ejemplo.com', 'Vendedor', 'Activo', datetime(2026, 2, 1, 9, 0)),
    (9, 'diego.mamani@ejemplo.com', 'Vendedor', 'Activo', datetime(2026, 2, 8, 14, 30)),
    (10, 'rosa.choque@ejemplo.com', 'Vendedor', 'Activo', datetime(2026, 11, 15, 10, 5)),
    (11, 'marco.villca@ejemplo.com', 'Vendedor', 'Activo', datetime(2026, 11, 19, 17, 45)),
]
compradores_nuevos = [
    ('Valeria', 'Gutiérrez Flores'), ('Jorge', 'Condori Ramos'), ('Camila', 'Vargas Mendoza'),
    ('Luis Fernando', 'Ticona Apaza'), ('Daniela', 'Rocha Salinas'), ('Andrés', 'Mamani Quispe'),
    ('Paola', 'Céspedes Arce'), ('Rodrigo', 'Aliaga Paz'), ('Natalia', 'Huanca Limachi'),
    ('Sebastián', 'Ortiz Calle'), ('Mariana', 'Pinto Loza'), ('Fernando', 'Chura Nina'),
]


def slug(s):
    import unicodedata
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return s.split()[0]


uid = 12
for i, (n, a) in enumerate(compradores_nuevos):
    email = f"{slug(n)}.{slug(a)}@ejemplo.com"
    fecha = datetime(2026, 1, 20) + timedelta(days=i * 17 + random.randint(0, 9), hours=random.randint(8, 21))
    nuevos_usuarios.append((uid, email, 'Comprador', 'Activo', fecha))
    uid += 1

sql.append(insert('cuenta_usuario', ['id_usuario', 'email', 'password_hash', 'rol', 'estado', 'fecha_creacion'],
                  [(u[0], u[1], '123456', u[2], u[3], u[4]) for u in nuevos_usuarios]))

# ---------------------------------------------------------------- Vendedores y tiendas
vendedores = [
    # id, id_usuario, nombres, apellidos, email, tel, fecha, estado
    (1, 2, 'Juan Carlos', 'Pérez Aguilar', 'vendedor1@gmail.com', '71234567', '2026-01-10', 'Activo'),
    (2, 3, 'María José', 'García Soliz', 'vendedor2@gmail.com', '72345678', '2026-01-12', 'Activo'),
    (3, 6, 'Héctor', 'Cáceres Luna', 'coster@gmail.com', '73456789', '2026-01-20', 'Activo'),
    (4, 8, 'Gabriela', 'Rojas Torrez', 'gabriela.rojas@ejemplo.com', '74567890', '2026-02-01', 'Activo'),
    (5, 9, 'Diego', 'Mamani Copa', 'diego.mamani@ejemplo.com', '75678901', '2026-02-08', 'Activo'),
    (6, 10, 'Rosa', 'Choque Vela', 'rosa.choque@ejemplo.com', '76789012', '2026-11-15', 'Pendiente'),
    (7, 11, 'Marco Antonio', 'Villca Rivas', 'marco.villca@ejemplo.com', '77890123', '2026-11-19', 'Pendiente'),
]
sql.append(insert('vendedor', ['id_vendedor', 'id_usuario', 'nombres', 'apellidos', 'email', 'telefono', 'fecha_registro', 'estado'],
                  [v for v in vendedores]))

tiendas = [
    (1, 1, 'TecnoMundo', 'Celulares, computadoras y accesorios con garantía. Entregas en todo La Paz y El Alto.', 'Activa', '2026-01-10'),
    (2, 2, 'ModaExpress', 'Ropa urbana y prendas de lana de alpaca hechas en Bolivia.', 'Activa', '2026-01-12'),
    (3, 3, 'Artesanías Illimani', 'Textiles, cerámica e instrumentos hechos por artesanos del altiplano.', 'Activa', '2026-01-20'),
    (4, 4, 'Verde Andino', 'Plantas de interior, suculentas y todo para tu huerto urbano.', 'Activa', '2026-02-01'),
    (5, 5, 'Café de los Yungas', 'Café de altura, quinua, miel y cacao de productores bolivianos.', 'Activa', '2026-02-08'),
    (6, 6, 'Dulces Rosita', 'Repostería artesanal para cumpleaños y eventos.', 'Pendiente', '2026-11-15'),
    (7, 7, 'BiciTaller Sopocachi', 'Repuestos y accesorios para bicicletas urbanas y de montaña.', 'Pendiente', '2026-11-19'),
]
sql.append(insert('tienda', ['id_tienda', 'id_vendedor', 'id_usuario_admin', 'nombre_tienda', 'descripcion', 'estado', 'fecha_creacion'],
                  [(t[0], t[1], 1, t[2], t[3], t[4], t[5]) for t in tiendas]))

perfiles = [
    (1, 1, 'Juridica', '4587123015', 'Av. 16 de Julio (El Prado)', 'La Paz', 'Aprobado'),
    (2, 2, 'Natural', '6234871 LP', 'Calle Sagárnaga', 'La Paz', 'Aprobado'),
    (3, 3, 'Natural', '5123987 LP', 'Calle Linares', 'La Paz', 'Aprobado'),
    (4, 4, 'Natural', '7345123 LP', 'Av. Ballivián, Calacoto', 'La Paz', 'Aprobado'),
    (5, 5, 'Juridica', '3987456012', 'Av. 6 de Marzo', 'El Alto', 'Aprobado'),
    (6, 6, 'Natural', '8123456 LP', 'Villa Fátima', 'La Paz', 'Pendiente'),
    (7, 7, 'Natural', '9234567 LP', 'Sopocachi', 'La Paz', 'Pendiente'),
]
sql.append(insert('perfil_vendedor', ['id_perfil', 'id_vendedor', 'tipo_persona', 'documento_identidad', 'direccion', 'ciudad', 'pais', 'estado_validacion', 'fecha_validacion'],
                  [(p[0], p[1], p[2], p[3], p[4], p[5], 'Bolivia', p[6], datetime(2026, 2, 10) if p[6] == 'Aprobado' else None) for p in perfiles]))

# ---------------------------------------------------------------- Compradores
compradores = [
    (1, 4, 'Carlos', 'López Rivero', 'comprador1@hotmail.com', '70011223'),
    (2, 5, 'Ana', 'Torres Mercado', 'comprador2@gmail.com', '70122334'),
    (3, 6, 'Héctor', 'Cáceres Luna', 'coster@gmail.com', '73456789'),
    (4, 7, 'Lucía', 'Quispe Mamani', 'bien@gmail.com', '70233445'),
]
cid = 5
for u in nuevos_usuarios:
    if u[2] == 'Comprador':
        n, a = compradores_nuevos[cid - 5]
        compradores.append((cid, u[0], n, a, u[1], f"7{random.randint(1000000, 9999999)}"))
        cid += 1
sql.append(insert('comprador', ['id_comprador', 'id_usuario', 'nombres', 'apellidos', 'email', 'telefono'], compradores))

# ---------------------------------------------------------------- Catálogo
sql.append(insert('categoria', ['id_categoria', 'nombre', 'detalle', 'estado'], [
    (1, 'Electrónica', 'Celulares, computadoras, audio y accesorios', 'Activo'),
    (2, 'Ropa', 'Prendas y calzado para hombre y mujer', 'Activo'),
    (3, 'Accesorios', 'Bolsos, billeteras y joyería', 'Activo'),
    (4, 'Plantas', 'Plantas de interior, exterior y jardinería', 'Activo'),
    (5, 'Artesanía', 'Textiles, cerámica e instrumentos hechos a mano', 'Activo'),
    (6, 'Alimentos', 'Café, granos y productos de origen boliviano', 'Activo'),
    (7, 'Hogar', 'Cocina y decoración', 'Activo'),
]))
sql.append(insert('ubicacion', ['id_confirmacion', 'nombre', 'detalle', 'estado'], [
    (1, 'Almacén Central', 'Zona Miraflores — Pasillo A', 'Disponible'),
    (2, 'Bodega Norte', 'El Alto — Sector textiles', 'Disponible'),
    (3, 'Depósito Sur', 'Calacoto — Plantas y alimentos', 'Disponible'),
]))

# id, tienda, categoria, nombre, descripcion, precio, stock, estado_admin, motivo_rechazo
productos = [
    (1, 1, 1, 'Smartphone Galaxy A35 128 GB', 'Pantalla AMOLED de 6,6", 8 GB de RAM, cámara triple de 50 MP y batería de 5000 mAh. Incluye cargador y funda.', 2450, 14, 'Aprobado', None),
    (2, 1, 1, 'Audífonos inalámbricos con cancelación de ruido', 'Hasta 30 horas de batería, carga rápida USB-C y micrófono para llamadas. Plegables, con estuche.', 389, 32, 'Aprobado', None),
    (3, 1, 1, 'Tablet 10" 64 GB con lápiz', 'Ideal para clases y dibujo. Pantalla Full HD, 4 GB de RAM, lápiz óptico incluido.', 1690, 6, 'Aprobado', None),
    (4, 1, 1, 'Laptop 14" Ryzen 5, 16 GB RAM, 512 GB SSD', 'Liviana (1,4 kg), teclado retroiluminado en español y Windows 11. Garantía de 1 año.', 5290, 4, 'Aprobado', None),
    (5, 1, 1, 'Teclado mecánico RGB', 'Switches rojos silenciosos, distribución en español y cable desmontable.', 420, 18, 'Aprobado', None),
    (6, 1, 1, 'Mouse inalámbrico ergonómico', 'Sensor de 4000 DPI, receptor USB y Bluetooth, batería recargable.', 145, 40, 'Aprobado', None),
    (7, 1, 1, 'Parlante Bluetooth resistente al agua', 'Certificación IPX7, 12 horas de música y sonido 360°. Perfecto para salidas al campo.', 260, 0, 'Aprobado', None),
    (8, 1, 1, 'Smartwatch deportivo con GPS', 'Mide ritmo cardíaco, oxígeno y pasos. GPS integrado para correr en la ciudad o el cerro.', 590, 11, 'Aprobado', None),
    (9, 1, 1, 'Cargador rápido USB-C 65 W', 'Carga laptop, tablet y celular. Dos puertos USB-C y uno USB-A.', 120, 55, 'Aprobado', None),
    (10, 1, 1, 'Monitor 24" Full HD IPS', 'Bordes delgados, 75 Hz, entradas HDMI y VGA. Ideal para oficina y estudio.', 1150, 3, 'Aprobado', None),
    (11, 2, 2, 'Chompa de alpaca tejida a mano', 'Lana 100% alpaca, suave y abrigadora para el frío paceño. Tallas S a XL.', 480, 22, 'Aprobado', None),
    (12, 2, 2, 'Camisa de lino manga larga', 'Fresca y elegante. Corte regular, botones de coco. Colores blanco, beige y celeste.', 210, 30, 'Aprobado', None),
    (13, 2, 2, 'Zapatillas para correr', 'Suela con amortiguación y malla transpirable. Tallas 36 a 44.', 520, 9, 'Aprobado', None),
    (14, 2, 2, 'Chamarra impermeable de montaña', 'Cortaviento con capucha, costuras selladas y bolsillos con cierre. Para el Huayna Potosí o la ciudad.', 690, 12, 'Aprobado', None),
    (15, 2, 2, 'Jeans corte recto', 'Mezclilla de algodón con elastano, tiro medio. Tallas 28 a 38.', 260, 45, 'Aprobado', None),
    (16, 2, 2, 'Gorro de lana tejido', 'Tejido a mano con lana de oveja. Unitalla, varios colores.', 75, 60, 'Aprobado', None),
    (17, 2, 2, 'Poncho andino', 'Poncho de lana con diseños tradicionales, abrigador y liviano.', 350, 2, 'Aprobado', None),
    (18, 2, 2, 'Botas de cuero', 'Cuero legítimo y suela antideslizante. Hechas en Cochabamba.', 640, 7, 'Aprobado', None),
    (19, 3, 5, 'Aguayo tradicional 1,2 m', 'Tejido en telar con colores vivos. Úsalo como manta, mantel o decoración.', 180, 25, 'Aprobado', None),
    (20, 3, 3, 'Mochila tejida', 'Mochila de tela tejida con forro interior y bolsillo para laptop de 14".', 150, 16, 'Aprobado', None),
    (21, 3, 5, 'Jarrón de cerámica pintado a mano', 'Cerámica cocida en horno de leña, 25 cm de alto. Cada pieza es única.', 130, 8, 'Aprobado', None),
    (22, 3, 5, 'Charango artesanal de madera', 'Caja de naranjillo, cuerdas de nylon y estuche acolchado. Afinado y listo para tocar.', 950, 3, 'Aprobado', None),
    (23, 3, 3, 'Billetera de cuero repujado', 'Repujado a mano, seis compartimentos para tarjetas y monedero.', 95, 34, 'Aprobado', None),
    (24, 3, 3, 'Aretes de plata 925', 'Diseño inspirado en la chakana, con baño antialérgico. Incluye caja de regalo.', 160, 20, 'Aprobado', None),
    (25, 3, 5, 'Tapiz de lana de llama', 'Tejido en telar de pedal, 80 × 120 cm. Tintes naturales.', 420, 5, 'Aprobado', None),
    (26, 4, 4, 'Monstera deliciosa en maceta', 'Planta de 60 cm en maceta de 20 cm. Luz indirecta y riego semanal.', 140, 13, 'Aprobado', None),
    (27, 4, 4, 'Suculentas surtidas (6 macetas)', 'Seis variedades en macetas de 8 cm. Necesitan poco riego.', 90, 28, 'Aprobado', None),
    (28, 4, 4, 'Cactus en maceta de cerámica', 'Cactus de 25 cm con maceta esmaltada. Ideal para oficina.', 70, 19, 'Aprobado', None),
    (29, 4, 4, 'Orquídea Phalaenopsis', 'Dos varas con flores. Incluye guía de cuidado.', 160, 4, 'Aprobado', None),
    (30, 4, 4, 'Kit de huerto urbano', 'Tres macetas, sustrato y semillas de albahaca, perejil y cilantro.', 210, 15, 'Aprobado', None),
    (31, 4, 7, 'Maceta de terracota 30 cm', 'Barro cocido con plato. Hecha por alfareros de Achacachi.', 55, 50, 'Aprobado', None),
    (32, 5, 6, 'Café de altura de los Yungas 500 g', 'Grano entero, tostado medio. Notas de cacao y frutos rojos. Cosecha 2026.', 75, 70, 'Aprobado', None),
    (33, 5, 6, 'Quinua real orgánica 1 kg', 'Quinua blanca del salar de Uyuni, lavada y lista para cocinar.', 38, 120, 'Aprobado', None),
    (34, 5, 6, 'Miel de abeja pura 500 g', 'Miel multifloral de los valles, sin aditivos.', 55, 36, 'Aprobado', None),
    (35, 5, 6, 'Chocolate amargo 70% cacao', 'Tableta de 100 g con cacao silvestre del Beni.', 28, 80, 'Aprobado', None),
    (36, 5, 7, 'Prensa francesa 1 L', 'Vidrio de borosilicato y filtro de acero inoxidable.', 160, 10, 'Aprobado', None),
    (37, 5, 6, 'Infusión de hierbas andinas (25 sobres)', 'Mezcla de muña, manzanilla y cedrón.', 22, 95, 'Aprobado', None),
    (38, 5, 7, 'Cafetera moka italiana 6 tazas', 'Aluminio, apta para cocina a gas. Café intenso en 5 minutos.', 190, 1, 'Aprobado', None),
    (39, 1, 1, 'Audífonos gamer 7.1 con micrófono', 'Sonido envolvente, luces RGB y micrófono desmontable.', 310, 20, 'Pendiente', None),
    (40, 2, 2, 'Polera de algodón estampada', 'Algodón peinado con estampado del Illimani. Tallas S a XL.', 95, 40, 'Pendiente', None),
    (41, 4, 7, 'Lámpara de sal del Himalaya', 'Lámpara decorativa de 2 kg con base de madera.', 180, 12, 'Rechazado', 'Las fotos y la descripción no coinciden con el producto real. Sube fotos propias del artículo.'),
    (42, 2, 2, 'Bufanda de lana de alpaca', 'Bufanda tejida de 180 cm, suave y liviana.', 140, 25, 'Pendiente', None),
]
img = lambda pid: f'uploads/productos/demo_p{pid:02d}.jpg'

prod_rows, inv_rows = [], []
for p in productos:
    pid, tienda, cat, nombre, desc, precio, stock, est_admin, motivo = p
    creado = datetime(2026, 1, 12) + timedelta(days=(pid * 7) % 280, hours=random.randint(9, 20))
    if est_admin == 'Pendiente':
        creado = HOY - timedelta(days=random.randint(1, 4))
    prod_rows.append((pid, tienda, cat, 1 if cat == 1 else (2 if cat in (2, 3, 5) else 3), nombre, desc, float(precio), 'Activo', creado,
                      img(pid), None, 0.0, est_admin, motivo, creado + timedelta(days=1) if est_admin != 'Pendiente' else None))
    inv_rows.append((pid, pid, stock, 5))
sql.append(insert('producto', ['id_producto', 'id_tienda', 'id_categoria', 'id_ubicacion', 'nombre', 'descripcion', 'precio_unitario', 'estado',
                               'fecha_creacion', 'imagen_principal', 'imagenes_extra', 'calificacion_promedio', 'estado_admin', 'rechazo_motivo', 'fecha_aprobacion'], prod_rows))
sql.append(insert('inventario', ['id_inventario', 'id_producto', 'stock_actual', 'stock_minimo'], inv_rows))

# ---------------------------------------------------------------- Pedidos
aprobados = [p for p in productos if p[7] == 'Aprobado']
por_tienda = {}
for p in aprobados:
    por_tienda.setdefault(p[1], []).append(p)
peso_tienda = {1: 34, 2: 26, 3: 16, 4: 12, 5: 22}
comprador_ids = [c[0] for c in compradores if c[0] != 3]  # Héctor es vendedor
user_de = {c[0]: c[1] for c in compradores}
id_vendedor_de = {t[0]: t[1] for t in tiendas}

compras, detalles, pagos, comisiones, dispersiones = [], [], [], [], []
compra_id = pago_id = 1
entregados = []
fechas = sorted(datetime(2026, 1, 15) + timedelta(minutes=random.randint(0, int((HOY - datetime(2026, 1, 15)).total_seconds() // 60)))
                for _ in range(118))
# Los meses recientes venden más
fechas += sorted(HOY - timedelta(days=random.uniform(0, 18), hours=random.randint(0, 10)) for _ in range(12))
fechas.sort()

for f in fechas:
    if not 8 <= f.hour <= 22:
        f = f.replace(hour=random.randint(9, 22))
    tienda = random.choices(list(peso_tienda), weights=list(peso_tienda.values()))[0]
    comp = random.choices(comprador_ids, weights=[6 if c in (1, 2, 4) else 2 for c in comprador_ids])[0]
    items = random.sample(por_tienda[tienda], k=min(len(por_tienda[tienda]), random.choices([1, 2, 3], weights=[60, 30, 10])[0]))
    lineas = []
    for p in items:
        cant = random.choices([1, 2, 3], weights=[75, 20, 5])[0] if p[5] < 300 else 1
        lineas.append((p[0], cant, float(p[5]), round(cant * p[5], 2)))
    total = round(sum(l[3] for l in lineas), 2)
    edad = (HOY - f).days
    if edad > 12:
        estado = random.choices(['Entregado', 'Cancelada'], weights=[92, 8])[0]
    elif edad > 5:
        estado = random.choices(['Entregado', 'Enviado', 'Pagada', 'Cancelada'], weights=[35, 35, 25, 5])[0]
    else:
        estado = random.choices(['Pendiente', 'Pagada', 'Enviado'], weights=[40, 40, 20])[0]
    compras.append([compra_id, comp, tienda, f, estado, total, None, None, None, None, None, 1 if estado == 'Cancelada' else 0])
    for l in lineas:
        detalles.append((compra_id, l[0], l[1], l[2], l[3]))
    if estado not in ('Pendiente', 'Cancelada'):
        metodo = random.choices(['QR', 'Tarjeta', 'Transferencia'], weights=[50, 35, 15])[0]
        fpago = f + timedelta(minutes=random.randint(2, 40))
        pagos.append((pago_id, compra_id, metodo, 'Exitoso', total, fpago, f"{metodo[:3].upper()}-{fpago:%y%m%d}-{random.randint(10000, 99999)}"))
        com = round(total * 0.03, 2)
        comisiones.append((pago_id, pago_id, 3.00, com))
        dispersiones.append((pago_id, pago_id, id_vendedor_de[tienda], 97.00, round(total - com, 2),
                             fpago + timedelta(days=2) if estado == 'Entregado' else None, 'Enviada' if estado == 'Entregado' else 'Pendiente'))
        pago_id += 1
    if estado == 'Entregado':
        entregados.append((compra_id, comp, f, lineas))
    compra_id += 1

# Asegura que Carlos (comprador1) tenga un pedido pendiente y otro enviado recientes para la demo
for c in reversed(compras):
    if c[1] == 1 and (HOY - c[3]).days <= 5:
        c[4] = 'Pendiente'
        break

# Devoluciones: dos pendientes y una aprobada
for cid_, motivo, estado_dev in [
    (entregados[-3][0], 'La talla no corresponde a la tabla de medidas publicada.', 'Pendiente'),
    (entregados[-6][0], 'El producto llegó con la caja dañada y no enciende.', 'Pendiente'),
    (entregados[10][0], 'Recibí un color distinto al que pedí.', 'Aprobado'),
]:
    c = compras[cid_ - 1]
    c[6], c[7] = estado_dev, motivo
    c[8] = c[3] + timedelta(days=4)
    if estado_dev == 'Aprobado':
        c[9] = c[8] + timedelta(days=2)
        c[10] = c[5]

sql.append(insert('compra', ['id_compra', 'id_comprador', 'id_tienda', 'fecha_compra', 'estado', 'total_bruto', 'solicita_devolucion', 'devolucion_motivo',
                             'devolucion_fecha_solicitud', 'devolucion_fecha_respuesta', 'devolucion_monto_reembolso', 'cancelada'], compras))
sql.append(insert('detalle_compra', ['id_compra', 'id_producto', 'cantidad', 'precio_unitario', 'subtotal'], detalles))
sql.append(insert('pago', ['id_pago', 'id_compra', 'metodo_pago', 'estado', 'monto_total', 'fecha_pago', 'referencia_transaccion'], pagos))
sql.append(insert('comision', ['id_comision', 'id_pago', 'porcentaje', 'monto'], comisiones))
sql.append(insert('dispersion', ['id_dispersion', 'id_comision', 'id_vendedor', 'porcentaje', 'monto', 'fecha_dispersion', 'estado'], dispersiones))

# ---------------------------------------------------------------- Reseñas
comentarios = {
    5: ['Excelente, tal cual la descripción. Llegó en dos días.', 'Muy buena calidad, lo recomiendo.', 'Superó mis expectativas, volveré a comprar.',
        'Atención muy amable y entrega puntual.', 'Perfecto, bien embalado y original.', 'Me encantó, es un regalo ideal.'],
    4: ['Buen producto, aunque tardó un poco en llegar.', 'Muy bien, el color es un poco más claro que en la foto.', 'Cumple lo prometido. Buen precio.',
        'Buena calidad, la entrega fue rápida.'],
    3: ['Está bien por el precio, pero esperaba algo mejor.', 'Correcto, aunque el empaque llegó golpeado.'],
    2: ['La talla vino más pequeña de lo indicado.', 'Tardó más de una semana en llegar.'],
}
resenas = []
reseniado = set()
for compra_, comp, f, lineas in entregados:
    for l in lineas:
        key = (user_de[comp], l[0])
        if key in reseniado or random.random() > 0.55:
            continue
        reseniado.add(key)
        cal = random.choices([5, 4, 3, 2], weights=[55, 30, 10, 5])[0]
        resenas.append((l[0], user_de[comp], cal, random.choice(comentarios[cal]), f + timedelta(days=random.randint(3, 9), hours=random.randint(0, 8)), 'reseña', None, None, 1))

# Chats (se guardan en la misma tabla, tipo 'chat')
chats = [
    (1, 4, [('comprador', '¡Hola! ¿El Galaxy A35 viene liberado para cualquier operador?'), ('vendedor', 'Hola Carlos, sí, viene liberado y funciona con Entel, Tigo y Viva.'),
            ('comprador', 'Perfecto, ¿tienen en color azul?'), ('vendedor', 'Sí, nos quedan dos en azul. Si lo pides hoy, te llega mañana.')]),
    (11, 7, [('comprador', 'Buenas tardes, ¿la chompa talla M es para contextura mediana?'), ('vendedor', 'Hola Lucía, sí. Mide 62 cm de largo y 52 cm de ancho.'),
             ('comprador', 'Gracias, la voy a pedir en color gris.')]),
    (22, 13, [('comprador', 'Hola, ¿el charango incluye cuerdas de repuesto?'), ('vendedor', 'Hola Jorge, sí, incluye un juego extra y una púa.')]),
    (32, 5, [('comprador', '¿El café se puede pedir molido para prensa francesa?'), ('vendedor', '¡Claro! Indícalo en el pedido y lo molemos grueso.')]),
]
for pid, usuario, msgs in chats:
    t0 = HOY - timedelta(days=random.randint(2, 20), hours=random.randint(1, 8))
    for i, (emisor, msg) in enumerate(msgs):
        leido = 0 if (i == len(msgs) - 1 and emisor == 'comprador') else 1
        resenas.append((pid, usuario, 0, None, t0 + timedelta(minutes=12 * i + random.randint(0, 8)), 'chat', msg, emisor, leido))

sql.append(insert('resena', ['id_producto', 'id_usuario', 'calificacion', 'comentario', 'fecha', 'tipo', 'mensaje', 'emisor', 'leido'], resenas))

# Promedios de productos y vendedores
sql.append("""UPDATE producto p SET calificacion_promedio = COALESCE((
  SELECT ROUND(AVG(r.calificacion), 1) FROM resena r WHERE r.id_producto = p.id_producto AND r.tipo = 'reseña'), 0);
UPDATE vendedor v SET
  calificacion_promedio = COALESCE((SELECT ROUND(AVG(r.calificacion), 1) FROM resena r
    JOIN producto p ON p.id_producto = r.id_producto JOIN tienda t ON t.id_tienda = p.id_tienda
    WHERE t.id_vendedor = v.id_vendedor AND r.tipo = 'reseña'), 0),
  total_resenas = (SELECT COUNT(*) FROM resena r
    JOIN producto p ON p.id_producto = r.id_producto JOIN tienda t ON t.id_tienda = p.id_tienda
    WHERE t.id_vendedor = v.id_vendedor AND r.tipo = 'reseña');

""")

# ---------------------------------------------------------------- Reportes y documentos
sql.append(insert('reporte_producto', ['id_producto', 'motivo', 'descripcion', 'estado', 'fecha_reporte'], [
    (13, 'Producto no coincide con la descripción', 'La suela es distinta a la de las fotos.', 'Pendiente', HOY - timedelta(days=3)),
    (7, 'Producto dañado o defectuoso', 'Dejó de cargar a la semana de uso.', 'Pendiente', HOY - timedelta(days=6)),
    (41, 'Publicidad engañosa', 'Las fotos parecen de otro sitio web.', 'Revisado', HOY - timedelta(days=9)),
]))
sql.append(insert('documento', ['id_perfil', 'tipo_documento', 'archivo_url', 'estado'], [
    (6, 'Cédula de identidad', 'uploads/documentos/ci_rosa_choque.pdf', 'Pendiente'),
    (7, 'Cédula de identidad', 'uploads/documentos/ci_marco_villca.pdf', 'Pendiente'),
]))

sql.append('SET FOREIGN_KEY_CHECKS = 1;\n')
OUT.write_text(''.join(sql), encoding='utf-8')
print(f'{OUT} — {len(productos)} productos, {len(compras)} pedidos, {len(pagos)} pagos, '
      f'{sum(1 for r in resenas if r[5] == "reseña")} reseñas, {len(compradores)} compradores')
