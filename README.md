# 📅 Calendario Financiero (S/)

Aplicación web full-stack para gestionar finanzas personales en Soles peruanos (`S/`), con interfaz oscura, múltiples vistas temporales y registro rápido de transacciones mediante atajos de teclado.

![Vista Principal del Calendario Financiero](./docs/preview-calendario.png)

## ✨ Características Principales

* **Vistas Temporales:** Navegación entre vista Diaria, Mensual, Anual y General.
* **Registro Rápido por Atajos:** Ingreso ágil de montos y categorías desde un único campo (ej. `15al` para registrar `S/ 15.00` en *Alimentación*).
* **Indicadores (KPIs) y Presupuestos:** Cálculo en tiempo real de ingresos, egresos, balance neto y límites por categoría.
* **Multi-perfil y Privacidad:** Espacios independientes, ocultación de montos y bloqueo por PIN.
* **Papelera y Exportación:** Borrado lógico recuperable y exportación de movimientos a `.CSV`.

## 🛠️ Stack Tecnológico

* **Frontend:** Next.js, React, TypeScript, Tailwind CSS
* **Backend:** Next.js API Routes / Server Actions
* **Base de Datos:** PostgreSQL

## 🚀 Inicialización del Proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/jossd1/Calendario-next.git
cd calendario-next-5
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar el entorno (`.env`)

Copia la plantilla `.env.example` en la raíz del proyecto para crear tu archivo `.env`:

```bash
cp .env.example .env
```

Abre `.env` y coloca tus credenciales locales de PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:tu_contraseña@localhost:5432/calendario_financiero"
```

### 4. Crear la base de datos y tablas (`schema.sql`)

Ejecuta el archivo `schema.sql` ubicado en la raíz para crear la base de datos `calendario_financiero`, sus tablas (`perfiles`, `categorias`, `transacciones`, `presupuestos`, `ajustes_app`) y los índices:

```bash
psql -U postgres -f schema.sql
```

### 5. Ejecutar la aplicación

```bash
npm run dev
```

Abre `http://localhost:3000` en tu navegador.

## 📁 Estructura del Proyecto

```text
├── docs/                # Capturas de pantalla
├── public/              # Recursos estáticos e iconos SVG
├── src/
│   ├── app/             # Páginas y endpoints de Next.js
│   ├── components/      # Componentes de interfaz
│   └── lib/             # Utilidades, moneda (S/) y lógica de atajos
├── .env.example         # Plantilla de variables de entorno
├── .gitignore           # Archivos ignorados por Git
├── package.json         # Dependencias y scripts
├── README.md            # Documentación
└── schema.sql           # Esquema de base de datos PostgreSQL
```