# EcoLoop — QuipuSoft 2026

Plataforma web de gamificación del reciclaje doméstico con agente de IA conversacional **Kiru**.

**Hackathon TECSUP · Entrega: 30 junio 2026**

| Criterio | Objetivo |
|----------|----------|
| Innovación y IA | 4/4 |
| Impacto | 4/4 |
| Factibilidad | 4/4 |
| Funcionalidad | 4/4 |
| Usabilidad | 4/4 |

---

## Equipo

| Integrante | Rol |
|-----------|-----|
| Miguel Salas | Tech Lead · Backend & Frontend |
| Cristina Sihuas | IA, Datos & Integración |
| Franck Panduro | UX/UI Designer & Prototipado |
| Carlos Zegarra | PM & Estrategia de Presentación |

---

## Stack

- **Backend:** Spring Boot 3.3 · Java 17 · PostgreSQL 16 · Flyway · JWT
- **Frontend:** React 19 · Vite · Tailwind CSS · Zustand · React Query
- **IA:** Google Gemini 2.5 Flash (agente Kiru)
- **Infra local:** Docker Compose

---

## Estado MVP — Día 3

### Backend — funcional al 100%

| Endpoint | Estado |
|----------|--------|
| `POST /auth/register` / `POST /auth/login` | ✅ |
| `GET /usuarios/me` | ✅ |
| `PUT /usuarios/me` | ✅ nuevo |
| `GET /tipos-residuo` | ✅ |
| `POST /residuos` | ✅ |
| `GET /residuos` | ✅ nuevo |
| `DELETE /residuos/{id}` | ✅ nuevo |
| `GET /impacto/resumen` | ✅ |
| `GET /impacto/mensual` | ✅ |
| `GET /impacto/por-tipo` | ✅ |
| `GET /gamificacion/insignias` | ✅ |
| `POST /agente/chat` | ✅ |

### Frontend — páginas funcionales

| Página | Estado |
|--------|--------|
| Login / Registro | ✅ |
| Dashboard | ✅ |
| Registrar residuo + historial | ✅ |
| Gamificación / Insignias | ✅ |
| Perfil de hábitos + editar perfil | ✅ |
| Chat Kiru | ✅ |

---

## Avance por persona

### Miguel Salas — Día 3 (hoy)

- [x] `GET /residuos` — historial de registros del usuario autenticado
- [x] `DELETE /residuos/{id}` — eliminar registro con verificación de ownership
- [x] `PUT /usuarios/me` — editar nombre y meta semanal
- [x] Historial de registros en `ResiduoPage` con icono por tipo, fecha y botón eliminar
- [x] Editar perfil en `PerfilHabitosPage` con form inline (nombre + meta semanal kg)
- [x] CORS configurado via `CorsConfigurationSource` bean, origen configurable por env var `FRONTEND_URL`
- [x] Jackson configurado: fechas como ISO string, no array
- [x] Al borrar registro invalida automáticamente dashboard (impacto-resumen, mensual, por-tipo, perfil)

### Miguel Salas — Día 2

- [x] Autenticación JWT completa (`POST /auth/register`, `POST /auth/login`)
- [x] Esquema BD con Flyway: usuarios, tipos_residuo, registros_reciclaje, insignias, niveles, conversaciones
- [x] 6 tipos de residuo con factores CO2 del MINAM Perú
- [x] 5 niveles de gamificación con XP requerido
- [x] 8 insignias desbloqueables
- [x] Tema dark/light (verde en light, celeste en dark)
- [x] Navbar, rutas protegidas, componente `KiruState` con 7 estados
- [x] Dashboard con stats, barra de nivel, equivalencias y gráficos Recharts

### Cristina Sihuas — Día 3

- [x] Backend completo de gamificación: `GamificacionService` (XP, racha, nivel up, insignias)
- [x] `ImpactoService` — resumen CO2, mensual, por tipo con ventana 6 meses
- [x] `RegistroReciclajeService` — cálculo automático CO2 y XP al registrar
- [x] `UsuarioService` — perfil con nivel, XP, racha y CO2 total
- [x] Controllers: Gamificacion, Impacto, RegistroReciclaje, TipoResiduo, Usuario
- [x] Agente Kiru integrado con Gemini 2.5 Flash, contexto del usuario por JWT
- [x] `HabitContextBuilder` — sistema prompt con hábitos + últimos 7 registros
- [x] Frontend: `DashboardPage`, `GamificacionPage`, `PerfilHabitosPage`, `ResiduoPage`, `RouteErrorPage`
- [x] Servicios API (`ecoloop.ts`), tipos (`index.ts`), utilidades (`format.ts`)
- [x] Router con lazy loading y `errorElement`

---

## Pendiente

### Infraestructura — Miguel (Días 4-5)

- [x] Dockerfiles para backend y frontend listos
- [x] `railway.toml` configurado en `backend/` y `frontend/`
- [x] `VITE_API_URL` soportado en `api.ts` para apuntar al backend en prod
- [x] `nginx.conf` para servir SPA con React Router
- [ ] **Deploy Railway — pasos pendientes:**
  1. Crear proyecto en Railway > Deploy from GitHub (`naniiiz/EcoLoop`)
  2. New Service > Database > PostgreSQL — guardar Host/Port/DB/User/Pass
  3. New Service > GitHub > root dir `backend` — agregar vars:
     `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, `GEMINI_API_KEY`, `FRONTEND_URL`
  4. New Service > GitHub > root dir `frontend` — agregar var:
     `VITE_API_URL=https://<backend>.railway.app`
  5. Copiar URL frontend → actualizar `FRONTEND_URL` en backend
- [ ] Cuenta demo pre-cargada con 15+ registros variados
- [ ] Smoke test de todos los endpoints en producción

### Diseño — Franck (Días 3-4)

- [ ] QA visual completo: verificar que Kiru se ve bien en todas las pantallas y tamaños
- [ ] Revisión mobile: formulario de registro, historial, perfil en pantallas pequeñas
- [ ] Video demo 60 segundos mostrando el flujo completo (registro → XP → insignia → chat Kiru)
- [ ] Assets adicionales de Kiru si se necesitan nuevos estados
- [ ] Verificar que el tema dark/light se ve correcto en la demo

### Presentación — Carlos (Días 3-5)

- [ ] Pitch deck final (problema, solución, demo, impacto, escalabilidad)
- [ ] Guion de demo en vivo: flujo registro → gamificación → Kiru
- [ ] Slide de impacto: equivalencias CO2 con datos reales del MINAM Perú
- [ ] Preparar respuestas a preguntas del jurado (modelo de negocio, escalabilidad, datos)
- [ ] Coordinación de tiempo: 10 min presentación + 5 min demo + 5 min preguntas

---

## Kiru — 7 estados

| Constante | Imagen | Cuándo aparece |
|-----------|--------|----------------|
| `WELCOME` | castor-botella | Onboarding / greeting |
| `CONFIRM` | castor-botella | Registro exitoso de residuo |
| `THINKING` | castor-escribiendo | Mientras Gemini procesa |
| `RECOMMEND` | castor-idea | Respuesta del agente |
| `IMPACT` | castor-ecology | Dashboard de impacto |
| `ANALYZE` | castor-leyendo | Perfil de hábitos |
| `CELEBRATE` | castor-malabares | Subida de nivel / insignia |
| `DOWN` | castor-down | Slide de problema en el pitch |

---

## Setup local

### Requisitos
- Java 17
- Maven 3.9+
- Node 20+
- Docker Desktop

### 1. Clonar

```bash
git clone https://github.com/naniiiz/EcoLoop.git
cd EcoLoop
```

### 2. Crear `.env`

```env
SERVER_PORT=8082
DB_HOST=localhost
DB_PORT=5434
DB_NAME=ecoloop_db
DB_USER=ecoloop_user
DB_PASS=TU_PASSWORD_LOCAL
JWT_SECRET=CAMBIA_ESTE_SECRETO_256_BITS
GEMINI_API_KEY=TU_KEY_AQUI
```

> **Obtener GEMINI_API_KEY:** https://aistudio.google.com/apikey → "Create API key". Cada integrante usa su propia key. El `.env` nunca se sube al repo.

### 3. Levantar PostgreSQL

```bash
docker compose up -d
```

### 4. Levantar backend

**Windows (PowerShell):**
```powershell
$env:SERVER_PORT='8082'; $env:DB_HOST='localhost'; $env:DB_PORT='5434'
$env:DB_NAME='ecoloop_db'; $env:DB_USER='ecoloop_user'; $env:DB_PASS='TU_PASS'
$env:JWT_SECRET='TU_SECRET'; $env:GEMINI_API_KEY='TU_KEY'
cd backend
mvn spring-boot:run
```

**Mac/Linux:**
```bash
export $(cat .env | grep -v '^#' | xargs)
cd backend
mvn spring-boot:run
```

Backend: `http://localhost:8082` · Swagger: `http://localhost:8082/swagger-ui.html`

### 5. Levantar frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

### 6. Crear cuenta de prueba

```bash
curl -X POST http://localhost:8082/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Tu Nombre","email":"tu@email.com","password":"TU_PASSWORD"}'
```

---

## Estructura del proyecto

```
EcoLoop/
├── backend/src/main/java/com/ecoloop/
│   ├── agent/          # AgentService, HabitContextBuilder
│   ├── config/         # SecurityConfig (CORS + JWT), GeminiConfig
│   ├── controller/     # Auth, Agente, Gamificacion, Impacto, Residuo, TipoResiduo, Usuario
│   ├── domain/
│   │   ├── dto/        # request/response por módulo
│   │   ├── model/      # Usuario, RegistroReciclaje, Insignia, Nivel, Conversacion...
│   │   └── repository/ # JPA Repositories
│   ├── exception/      # GlobalExceptionHandler, ResourceNotFoundException
│   ├── security/       # JwtService, JwtAuthFilter
│   └── service/        # Gamificacion, Impacto, RegistroReciclaje, Usuario
├── frontend/src/
│   ├── components/kiru/    # KiruState.tsx
│   ├── components/layout/  # Navbar.tsx
│   ├── pages/              # todas las páginas
│   ├── services/           # api.ts (Axios), ecoloop.ts
│   ├── store/              # authStore (Zustand)
│   ├── types/              # index.ts
│   └── utils/              # format.ts
├── docker-compose.yml
└── .env.example
```

---

## Convenciones

- **Commits:** `feat:`, `fix:`, `chore:`, `docs:` en español
- **Backend:** Controller → Service → Repository → Entity
- **Frontend:** componentes funcionales + hooks, Tailwind, sin emojis en UI
- **Kiru:** sin emojis en respuestas del agente, siempre menciona datos reales del usuario
