# EcoLoop — QuipuSoft 2026

Plataforma web de gamificación del reciclaje doméstico con agente de IA conversacional.
Stack: Spring Boot 3 (backend) + React 19 + Vite + Tailwind CSS (frontend) + PostgreSQL + Docker.

## Arquitectura por capas (Spring Boot)
Siempre respetar: Controller → Service → Repository → Entity
- Controllers solo reciben/devuelven DTOs, nunca Entities directamente
- Lógica de negocio exclusivamente en Services
- Validaciones con @Valid + Bean Validation en DTOs
- Manejo de errores centralizado con @ControllerAdvice + clases de excepción propias

## Convenciones de código
- Java: camelCase para métodos/variables, PascalCase para clases, UPPER_SNAKE para constantes
- React: componentes funcionales + hooks, archivos en PascalCase, hooks en camelCase con prefijo "use"
- CSS: clases Tailwind, sin CSS inline salvo animaciones puntuales
- Commits: feat/fix/chore/docs seguidos de descripción en español

## Base de datos
- Todas las migraciones vía Flyway en /resources/db/migration (V1__..., V2__...)
- Nunca usar spring.jpa.hibernate.ddl-auto=create o update en producción
- Nombres de tablas en snake_case plural: usuarios, residuos, habitos_usuario, insignias

## Agente IA (Cristina)
- Llamadas a Claude API en AgentService.java, nunca desde el Controller
- El contexto del usuario (hábitos, residuos recientes) se construye en HabitContextBuilder
- Siempre incluir system prompt con perfil del usuario antes del mensaje del chat

## Frontend
- Estado global: Zustand (no Redux)
- Fetching: React Query + axios
- Rutas: React Router v6 con lazy loading
- Tema dark/light via CSS variables en :root, toggle guardado en localStorage

## Comandos frecuentes
- `./mvnw spring-boot:run` — levantar backend
- `docker compose up -d` — levantar PostgreSQL + Redis local
- `cd frontend && npm run dev` — levantar frontend
- `./mvnw test` — correr tests unitarios

## Lo que NO debes hacer
- No generar código sin tests si se trata de Services o lógica de gamificación
- No modificar archivos de migración Flyway ya aplicados
- No hardcodear API keys; usar variables de entorno via application.yml + .env
- No instalar dependencias nuevas sin mencionarlo explícitamente

## Contexto de tiempo
Hackathon con entrega el 30 de junio 2026. Priorizar:
1. Funcionalidad sobre perfección
2. Demo funcional > cobertura de tests completa
3. Deployment en Railway operativo desde el día 3

Avisar cuando una solución "correcta" tomaría más de 2h; ofrecer alternativa más rápida.
