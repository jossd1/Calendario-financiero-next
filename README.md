# 📅 Calendario Financiero (S/)    
Aplicación web para gestionar finanzas personales en Soles peruanos (`S/`), con interfaz oscura, múltiples vistas temporales y registro rápido de transacciones mediante atajos de teclado.

![Vista Principal del Calendario Financiero](./docs/preview-calendario.png)

## Características Principales

* **Vistas Temporales:** Navegación entre vista Diaria, Mensual, Anual y General.
* **Registro Rápido por Atajos:** Ingreso ágil de montos y categorías desde un único campo (ej. `15al` para registrar `S/ 15.00` en *Alimentación*).
* **Multi-perfil y Privacidad:** Espacios independientes, ocultación de montos y bloqueo por PIN.
* **Papelera y Exportación:** Borrado lógico recuperable y exportación de movimientos a `.CSV`.

## 🛠️ Stack Tecnológico

* **Frontend:** Next.js, React, TypeScript, Tailwind CSS
* **Backend:** Next.js API Routes / Server Actions
* **Base de Datos:** PostgreSQL
  
## REQUISITOS
* Instalar Node.js
* PostreSQL
## 🚀 Inicialización del Proyecto Mediante Terminal

### 1. Clonar el repositorio
En la terminal con cd ubicate en donde deseas que se descargue el proyecto y ejecuta:
```bash
git clone --depth=1 https://github.com/jossd1/Calendario-financiero-next.git
cd Calendario-financiero-next
```

### 2. Instalar dependencias
Peso de las dependencias aproximadamente: 400MB a más.
```bash
npm install
```

### 3. copiar plantilla `.env.example`

Comando para copiar la plantilla `.env.example`:

En windows(cmd):
```bash
copy .env.example .env
```

En Linux, macOS o Git Bash (Windows):
```bash
cp .env.example .env
```



### 4. Abrir `.env` creado:
 Comando para abrir el `.env`:

En Windows:
```bash
notepad .env
```

En Linux:
```bash
xdg-open .env
```

En macOS:
```bash
open -t .env
```


### 5. Congigurar las credenciales:
Reemplaza "tu_contraseña" por la contraseña postgres en el `.venv` :

```env
DATABASE_URL="postgresql://postgres:tu_contraseña@localhost:5432/calendario_financiero"
```
Guarda los cambios.
### 6. Crear la base de datos

En Windows y macOS(pedira contraseña postgres):
```bash
psql -U postgres -c "CREATE DATABASE calendario_financiero;"
```

En Linux(contraseña sudo):
```bash
sudo -u postgres createdb calendario_financiero
```

### 7. Ejecutar `schema.sql`
Ejecutar `schema.sql` para tener la base de datos completo:  

En Windows y en macOS
```bash
psql -U postgres -d calendario_financiero -f schema.sql
```
En Linux
```bash
sudo -u postgres psql -d calendario_financiero -f schema.sql
```
### 8. Ejecutar la aplicación

```bash
npm run dev
```

Abre `http://localhost:3000` en tu navegador escribiendo esto en la barra de direcciones:
```bash
http://localhost:3000
```
### 9. Disfruta.
## Guía de funcionalidades (de más útil a menos cotidiana)

1. **Atajos literales en el campo rápido:**
   - En "Registrar Movimiento" puedes escribir monto + código exacto de categoría (ej. `15al`) y pulsa `Enter` en el   mismo apartado.
   - Detecta automáticamente monto, categoría y tipo (Ingreso o Egreso).
   - Si el atajo no existe, limpia el campo sin registrar nada y muestra un aviso sutil.

2. **Mover fecha con las flechas desde el campo de Monto:**
   - Con el foco en Monto y el campo vacío puedes moverte en el calendario para cambiar la fecha con las flechas:
     - `←` / `→`: retrocede o avanza 1 día.
     - `↑` / `↓`: retrocede o avanza 1 semana (7 días).
   - Si al moverte cruzas de mes, el calendario cambia automáticamente de mes.

3. **Modo Simple en Registrar Movimiento:**
   - Arriba a la Derecha de "Registrar Movimiento" hay un boton que oculta Fecha, Categoría y Descripción para registrar en 1 solo campo usando tus atajos y solo la fecha seleccionado en el canlendario.

4. **Modos de clic del calendario:**
   - **Fecha:** fija la fecha en el formulario sin quitar el foco del campo en el que estés escribiendo.
   - **Ver día:** abre el apartado "Dia" con todos los registros de ese mismo día en donde puedes eliminar y editar.
   - **Analizar:** analiza cualquier rango en 2 toques (desde → hasta), incluso combinando vista Mensual y Anual (si tocas al revés, invierte el rango automáticamente).

5. **Lupa Mágica (salto rápido de fecha):**
   - Tecla `Enter` para avanzar entre pasos, `Backspace` en campo vacío para volver atrás, `Espacio` o `Esc` para cancelar.
   - Checkbox **Día**: si lo marcas, pide primero el día y salta a la Vista Día.
   - Checkbox **Año** (activo por defecto): si lo desmarcas, omite escribir el año y usa automáticamente el año actual que se esta viendo.

6. **Pagos Pendientes y Programados:**
   - El *badge* rojizo indica cuántos pendientes tienes.
   - Al abrir el modal puedes crear nuevos movimientos Pendiente / Programado, editarlos o confirmarlos como `✓ Pagado` en 1 clic (sin afectar tu saldo real salvo que actives "Incluir Pendientes en KPIs").

7. **Movimientos Recientes + Tabla con Scroll Infinito:**
   - La tarjeta bajo el formulario muestra los últimos 4 registros del periodo para editar en 1 clic.
   - La tabla inferior filtra por texto, tipo y categoría y carga más al hacer scroll.

8. **Análisis y Gráficos + Modos:**
   - En el modo automatico, toma la vista vista actual y lo pone automaticamente enel  desde y el hasta.
   - En el modo Manual puedes fijar el Desde / Hasta exactos.

9. **Vista General:**
   - **Panorama:** gráfico mixto interactivo donde las píldoras superiores muestran/ocultan series sin tachar + Top 5 Movimientos + Récords.
   - **Todos los Años:** vista anual con opción multi-perfil.
   - **Ajustes:** Algunos campos se puedes desactivar en Ajustes

10. **Seguridad y Privacidad:**
    - `👁️` enmascara todos los montos con `S/ •••` (incluyendo Papelera y Programados).
    - `🔒` Requiere activar, bloquea la app con PIN cuando solo cuando lo presionas, el ingreso al perfil es libre por comdidad (`scrypt`).
    - Para eliminar se exige doble clic por seguridad(`⚠️ ¿Seguro?`).
    - En la papelera, puedes restaurar lo eliminado si fue por error.

11. **Presupuestos y Alerta de Tope Diario:**
    - Barras de progreso por categoría (base mensual o por mes).
    - Alertas ámbar + *toast* cuando un día supera tu tope de gasto diario.

12. **Personalización y Respaldo:**
    - Límite de años `2000–3000` desactivable en Ajustes.
    - Densidad Cómoda/Compacta.
    - Edición de Textos en Pantalla (`Ctrl+Z` / `Ctrl+Y`, puedes dejar campos vacios).
    - Importación/exportación `.CSV` y `.JSON`.



## 📁 Estructura del Proyecto

```text
calendario-financiero-next.v2/
├── docs/
│   └── preview-calendario.png
├── public/
│   ├── icons/
│   │   ├── ajustes.svg
│   │   ├── categorias.svg
│   │   ├── papelera.svg
│   │   └── perfiles.svg
│   └── img/
│       └── logo.png
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ajustes/route.ts
│   │   │   ├── auth/pin/route.ts
│   │   │   ├── categorias/route.ts
│   │   │   ├── dashboard/route.ts
│   │   │   ├── exportar/
│   │   │   │   ├── csv/route.ts
│   │   │   │   └── json/route.ts
│   │   │   ├── importar/
│   │   │   │   ├── csv/route.ts
│   │   │   │   └── json/route.ts
│   │   │   ├── perfiles/
│   │   │   │   ├── route.ts
│   │   │   │   ├── seleccionar/route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── presupuestos/route.ts
│   │   │   └── transacciones/
│   │   │       ├── route.ts
│   │   │       ├── papelera/route.ts
│   │   │       └── [id]/
│   │   │           ├── route.ts
│   │   │           ├── permanente/route.ts
│   │   │           └── restaurar/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── AppIcon.tsx
│   │   ├── EditableText.tsx
│   │   ├── FormularioRegistro.tsx
│   │   ├── KpiResumen.tsx
│   │   ├── MovimientosRecientes.tsx
│   │   ├── PanelProgramados.tsx
│   │   ├── PinLockScreen.tsx
│   │   ├── TablaTransacciones.tsx
│   │   ├── Topbar.tsx
│   │   ├── WorkspaceToolbar.tsx
│   │   ├── analisis/
│   │   │   ├── GraficosFinancieros.tsx
│   │   │   ├── PanelAnalisis.tsx
│   │   │   ├── PanelPresupuestos.tsx
│   │   │   └── ResumenCategoriasTabla.tsx
│   │   ├── calendario/
│   │   │   ├── CalendarioPanel.tsx
│   │   │   ├── GeneralGraficoEvolucion.tsx
│   │   │   ├── GeneralVistaAnuales.tsx
│   │   │   ├── VistaAnual.tsx
│   │   │   ├── VistaDia.tsx
│   │   │   ├── VistaGeneral.tsx
│   │   │   ├── VistaMensual.tsx
│   │   │   └── VistaSemanal.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardClient.tsx
│   │   │   ├── DashboardModales.tsx
│   │   │   ├── EditModeFloatingBar.tsx
│   │   │   └── ToastContainer.tsx
│   │   ├── modales/
│   │   │   ├── AjustesControles.tsx
│   │   │   ├── CategoriaListaBox.tsx
│   │   │   ├── ModalAjustes.tsx
│   │   │   ├── ModalBuscadorMagico.tsx
│   │   │   ├── ModalCategorias.tsx
│   │   │   ├── ModalEditarTx.tsx
│   │   │   ├── ModalPapelera.tsx
│   │   │   ├── ModalPerfiles.tsx
│   │   │   ├── ModalProgramados.tsx
│   │   │   ├── PerfilEdicionForm.tsx
│   │   │   └── ajustes/
│   │   │       ├── SeccionApariencia.tsx
│   │   │       ├── SeccionDatos.tsx
│   │   │       ├── SeccionGeneral.tsx
│   │   │       ├── SeccionModulos.tsx
│   │   │       └── SeccionPrivacidad.tsx
│   │   └── registro/
│   │       └── CamposCompletosRegistro.tsx
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── hooks/
│   │   ├── useAnalisisRango.ts
│   │   ├── useDashboardState.ts
│   │   └── useEditModeTextos.ts
│   ├── lib/
│   │   ├── ajustes.ts
│   │   ├── atajos.ts
│   │   ├── format.ts
│   │   ├── icons.ts
│   │   ├── perfil.ts
│   │   ├── pin.ts
│   │   └── dashboard/
│   │       ├── analisis.ts
│   │       ├── calendario.ts
│   │       ├── general.ts
│   │       ├── historial.ts
│   │       ├── index.ts
│   │       ├── periodos.ts
│   │       ├── presupuestos.ts
│   │       └── queries.ts
│   ├── styles/
│   │   ├── calendar.css
│   │   ├── features.css
│   │   ├── layout.css
│   │   ├── modals.css
│   │   ├── settings.css
│   │   └── tokens.css
│   └── types/
│       ├── general.ts
│       └── index.ts
├── .env
├── .env.example
├── .gitignore
├── drizzle.config.ts
├── next-env.d.ts
├── package.json
├── README.md
├── schema.sql
└── tsconfig.json
```
