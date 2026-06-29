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
- **IA (chat):** Groq API — `llama-3.3-70b-versatile` (agente Kiru)
- **IA (visión):** Groq API — `llama-4-scout-17b` / `llama-3.2-11b-vision` (scanner de residuos)
- **Infra local:** Docker Compose
- **Deploy:** Railway (backend + DB) · Vercel (frontend)

---

## Estado MVP — Final (Día 5)

### Backend — funcional al 100%

| Endpoint | Estado |
|----------|--------|
| `POST /auth/register` / `POST /auth/login` | ✅ |
| `GET /usuarios/me` | ✅ |
| `PUT /usuarios/me` | ✅ |
| `GET /tipos-residuo` | ✅ |
| `POST /residuos` | ✅ |
| `GET /residuos` | ✅ |
| `DELETE /residuos/{id}` | ✅ |
| `GET /impacto/resumen` | ✅ |
| `GET /impacto/mensual` | ✅ |
| `GET /impacto/por-tipo` | ✅ |
| `GET /gamificacion/insignias` | ✅ |
| `GET /leaderboard/semanal` | ✅ |
| `POST /agente/chat` | ✅ |
| `POST /vision/identificar` | ✅ |

### Frontend — páginas funcionales

| Página | Estado |
|--------|--------|
| Login / Registro | ✅ |
| Dashboard | ✅ |
| Registrar residuo + historial | ✅ |
| Scanner de residuos (Kiru Vision) | ✅ |
| Leaderboard (top 10 XP semanal) | ✅ |
| Gamificación / Insignias | ✅ |
| Perfil de hábitos + editar perfil | ✅ |
| Chat Kiru | ✅ |

---

## Pendiente

### Presentación — Carlos

- [ ] Pitch deck final (problema, solución, demo, impacto, escalabilidad)
- [ ] Guion de demo en vivo: flujo registro → gamificación → Kiru
- [ ] Slide de impacto: equivalencias CO2 con datos reales del MINAM Perú
- [ ] Preparar respuestas a preguntas del jurado (modelo de negocio, escalabilidad, datos)
- [ ] Coordinación de tiempo: 10 min presentación + 5 min demo + 5 min preguntas

---

## Kiru — imágenes y estados

| Constante | Imagen | Cuándo aparece |
|-----------|--------|----------------|
| `WELCOME` | castor-botella | Onboarding / greeting |
| `CONFIRM` | castor-botella | Registro exitoso de residuo |
| `THINKING` | castor-escribiendo | Mientras Groq procesa |
| `RECOMMEND` | castor-idea | Respuesta del agente |
| `IMPACT` | castor-ecology | Dashboard de impacto |
| `ANALYZE` | castor-leyendo | Perfil de hábitos |
| `CELEBRATE` | castor-malabares | Subida de nivel / insignia |
| `DOWN` | castor-down | Slide de problema en el pitch |

Imágenes adicionales (fuera del componente `KiruState`):

| Archivo | Dónde se usa |
|---------|-------------|
| `kiru-feliz.webp` | Login — estado normal |
| `kiru-ojos-tapados.webp` | Login — cuando el campo contraseña tiene foco |
| `kiru-ranking.webp` | LeaderboardPage — header |
| `kiru-scanner.webp` | ScannerPage — estado idle / resultado |

---

## Variables de entorno

### Backend (`.env` local / Railway)

```env
SERVER_PORT=8082
DB_HOST=localhost
DB_PORT=5434
DB_NAME=ecoloop_db
DB_USER=ecoloop_user
DB_PASS=TU_PASSWORD_LOCAL
JWT_SECRET=CAMBIA_ESTE_SECRETO_256_BITS
GROQ_API_KEY=TU_KEY_AQUI
FRONTEND_URL=http://localhost:5173
```

> **Obtener GROQ_API_KEY:** https://console.groq.com → API Keys → Create API Key. Cada integrante usa su propia key. El `.env` nunca se sube al repo.

### Frontend (`.env.local` / Vercel)

```env
VITE_API_URL=https://<backend>.railway.app
```

En desarrollo local no hace falta; el proxy de Vite ya apunta a `http://localhost:8082`.

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

Ver sección Variables de entorno arriba.

### 3. Levantar PostgreSQL

```bash
docker compose up -d
```

### 4. Levantar backend

**Windows (PowerShell):**
```powershell
$env:SERVER_PORT='8082'; $env:DB_HOST='localhost'; $env:DB_PORT='5434'
$env:DB_NAME='ecoloop_db'; $env:DB_USER='ecoloop_user'; $env:DB_PASS='TU_PASS'
$env:JWT_SECRET='TU_SECRET'; $env:GROQ_API_KEY='TU_KEY'; $env:FRONTEND_URL='http://localhost:5173'
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
│   ├── agent/          # AgentService, VisionService, HabitContextBuilder
│   ├── config/         # SecurityConfig (CORS + JWT), GeminiConfig (Groq WebClient)
│   ├── controller/     # Auth, Agente, Vision, Leaderboard, Gamificacion, Impacto, Residuo, TipoResiduo, Usuario
│   ├── domain/
│   │   ├── dto/        # request/response por módulo
│   │   ├── model/      # Usuario, RegistroReciclaje, Insignia, Nivel, Conversacion...
│   │   └── repository/ # JPA Repositories
│   ├── exception/      # GlobalExceptionHandler, ResourceNotFoundException
│   ├── security/       # JwtService, JwtAuthFilter, RateLimitFilter
│   └── service/        # Gamificacion, Impacto, RegistroReciclaje, Usuario
├── frontend/src/
│   ├── components/kiru/    # KiruState.tsx
│   ├── components/layout/  # Navbar.tsx
│   ├── components/ui/      # TransitionOverlay.tsx
│   ├── pages/              # Dashboard, Scanner, Leaderboard, Gamificacion, Perfil, Residuo, Login, Chat
│   ├── services/           # api.ts (Axios), ecoloop.ts
│   ├── store/              # authStore (Zustand)
│   ├── types/              # index.ts
│   └── utils/              # format.ts
├── docker-compose.yml
├── railway.toml
└── .env.example
```

---

## Convenciones

- **Commits:** `feat:`, `fix:`, `chore:`, `docs:` en español
- **Backend:** Controller → Service → Repository → Entity
- **Frontend:** componentes funcionales + hooks, Tailwind, sin emojis en UI
- **Kiru:** sin emojis en respuestas del agente, siempre menciona datos reales del usuario
