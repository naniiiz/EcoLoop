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

## Avance actual

### Backend
- [x] `POST /residuos` registra residuos con cálculo automático de CO2 y XP
- [x] `GET /usuarios/me` devuelve perfil autenticado desde JWT
- [x] `GET /tipos-residuo` lista tipos para formularios
- [x] `GET /impacto/resumen` entrega CO2 total, kg reciclados y equivalencias
- [x] `GET /impacto/mensual` agrupa impacto por mes
- [x] `GET /impacto/por-tipo` agrupa impacto por tipo de residuo
- [x] `GET /gamificacion/insignias` lista insignias y estado desbloqueado
- [x] `GamificacionService` actualiza XP, racha, niveles e insignias
- [x] Chat de Kiru usa usuario autenticado por JWT, sin `usuarioId` enviado desde frontend

### Frontend
- [x] Dashboard con datos reales, barra de nivel, equivalencias y gráficos Recharts
- [x] Gráfico mensual aclarado: cada barra suma todos los tipos del mes
- [x] Gráfico por tipo de residuo: cada barra representa un tipo registrado
- [x] Página de registro de residuos en `/registro` con Kiru CONFIRM
- [x] Pantalla de gamificación en `/logros` con insignias y barra XP
- [x] Perfil de hábitos en `/perfil` con Kiru ANALYZE
- [x] Chat Kiru sin `usuarioId` hardcodeado
- [x] Rutas con `errorElement` para evitar pantalla cruda ante errores
- [x] Proxy Vite actualizado para `/usuarios` y `/tipos-residuo`

---

## Lo que está hecho (Día 2 — Miguel)

### Backend
- [x] Autenticación JWT completa (`POST /auth/register`, `POST /auth/login`)
- [x] Esquema de BD con Flyway (`V1__init_schema.sql`): usuarios, tipos_residuo, registros_reciclaje, insignias, niveles, conversaciones
- [x] 6 tipos de residuo con factores CO2 del MINAM Perú (plástico, papel, vidrio, metal, orgánico, electrónico)
- [x] 5 niveles de gamificación con XP requerido
- [x] 8 insignias desbloqueables
- [x] Agente Kiru con Gemini 2.5 Flash (`POST /agente/chat`)
- [x] Sistema de contexto del usuario (`HabitContextBuilder`)
- [x] Fallback del agente si Gemini falla
- [x] System prompt de Kiru con personalidad, nombre quechua, sin emojis

### Frontend
- [x] Login y registro (toggle en una pantalla)
- [x] Rutas protegidas con PrivateRoute
- [x] Tema dark/light con cambio automático de colores (verde en light, celeste en dark)
- [x] Navbar con iconos Lucide (sin emojis)
- [x] Dashboard con stats (XP, Racha, CO2)
- [x] Chat con Kiru: estados THINKING y RECOMMEND con imágenes reales
- [x] Componente `KiruState.tsx` con 7 estados
- [x] 7 imágenes de Kiru convertidas a WebP (reducción 20x de peso)

### Kiru — 7 estados implementados

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

## Pendiente

### Backend (Cristina / Miguel)
- [x] `POST /residuos` — registrar residuo con CO2 automático y XP
- [x] `GET /usuarios/me` — perfil del usuario autenticado
- [x] `GET /tipos-residuo` — listar tipos para el formulario
- [x] `GET /impacto/resumen` — CO2 total, equivalencias visuales
- [x] `GET /impacto/mensual` — datos para gráfico de barras mensual
- [x] `GET /impacto/por-tipo` — datos para gráfico por tipo de residuo
- [x] `GET /gamificacion/insignias` — insignias y estado desbloqueado
- [x] `GamificacionService` — lógica de nivel up, racha, insignias

### Frontend (Franck / Miguel)
- [x] Página de registro de residuos (formulario + Kiru CONFIRM)
- [x] Dashboard con datos reales (CO2, equivalencias y gráficos Recharts)
- [x] Pantalla de gamificación (insignias, barra XP, Kiru CELEBRATE)
- [x] Perfil de hábitos con Kiru ANALYZE
- [x] Fix `usuarioId` hardcodeado en ChatPage (usa JWT)

### Infraestructura (Miguel)
- [ ] Deploy en Railway (backend + PostgreSQL) — Día 5
- [ ] Deploy en Vercel (frontend) — Día 5
- [ ] Cuenta demo pre-cargada con 15 registros

### Diseño (Franck)
- [ ] Diseño high-fidelity en Figma: formulario de registro, dashboard completo
- [ ] QA visual de Kiru en todas las pantallas (tamaños, sin pixelación)
- [ ] Video demo 60 segundos con Kiru en todos los estados

---

## Setup local — cada integrante

### Requisitos
- Java 17
- Maven 3.9+
- Node 20+
- Docker Desktop

### 1. Clonar el repositorio

```bash
git clone https://github.com/naniiiz/EcoLoop.git
cd EcoLoop
```

### 2. Crear tu archivo `.env`

Copia el archivo de ejemplo y edita con tus credenciales:

```bash
cp .env.example .env
```

Edita `.env`:

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

> **Obtener tu GEMINI_API_KEY:** ve a https://aistudio.google.com/apikey → "Create API key" → selecciona "Default Gemini Project" → copia la key (`AIzaSy...` o similar).

**Importante:** cada integrante usa su propia key. El `.env` nunca se sube al repo (ya está en `.gitignore`).

### 3. Levantar PostgreSQL

```bash
docker compose up -d
```

Verifica que el contenedor `ecoloop-postgres` corra en el puerto `5434`.

### 4. Levantar el backend

**Windows (PowerShell):**
```powershell
# Cargar variables de entorno
$envFile = Get-Content ".env" | Where-Object { $_ -match '=' -and $_ -notmatch '^#' }
foreach ($line in $envFile) {
    $key, $val = $line -split '=', 2
    [System.Environment]::SetEnvironmentVariable($key.Trim(), $val.Trim(), 'Process')
}
cd backend
mvn spring-boot:run
```

**Mac/Linux:**
```bash
export $(cat .env | grep -v '^#' | xargs)
cd backend
mvn spring-boot:run
```

Backend disponible en: `http://localhost:8082`
Swagger UI: `http://localhost:8082/swagger-ui.html`

### 5. Levantar el frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en: `http://localhost:5173`

### 6. Cuenta de prueba

```bash
curl -X POST http://localhost:8082/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Tu Nombre","email":"tu@email.com","password":"TU_PASSWORD"}'
```

---

## Estructura del proyecto

```
EcoLoop/
├── backend/
│   ├── src/main/java/com/ecoloop/
│   │   ├── agent/          # AgentService, HabitContextBuilder
│   │   ├── config/         # GeminiConfig, SecurityConfig
│   │   ├── controller/     # AuthController, AgentController
│   │   ├── domain/
│   │   │   ├── dto/        # ChatRequest, ChatResponse, AuthResponse...
│   │   │   ├── model/      # Usuario, RegistroReciclaje, TipoResiduo...
│   │   │   └── repository/ # JPA Repositories
│   │   ├── exception/      # GlobalExceptionHandler
│   │   └── security/       # JwtService, JwtAuthFilter
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/   # V1__init_schema.sql
├── frontend/
│   ├── public/kiru/        # 7 imágenes WebP de Kiru
│   └── src/
│       ├── components/
│       │   ├── kiru/       # KiruState.tsx
│       │   └── layout/     # Navbar.tsx
│       ├── pages/          # DashboardPage, ChatPage, LoginPage
│       ├── services/       # api.ts (Axios)
│       ├── store/          # authStore, userStore (Zustand)
│       └── types/          # index.ts
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Convenciones

- **Commits:** `feat:`, `fix:`, `chore:`, `docs:` seguidos de descripción en español
- **Backend:** Controller → Service → Repository → Entity
- **Frontend:** componentes funcionales + hooks, Tailwind, sin emojis en UI
- **Kiru:** sin emojis en respuestas del agente, siempre menciona datos reales del usuario

---

## Próximo turno — Franck

Franck: tu prioridad es el diseño y los assets de Kiru.

1. Exportar los 7 estados de Kiru desde Figma con fondos transparentes
2. Confirmar tamaños: 80px en chat header, 100px en dashboard, 120px en celebraciones
3. High-fidelity del formulario de registro de residuos
4. High-fidelity del dashboard completo con gráficos y Kiru IMPACT
5. QA visual: verificar que las imágenes WebP actuales se ven bien en móvil

Los assets van en `frontend/public/kiru/` como `.webp`.
