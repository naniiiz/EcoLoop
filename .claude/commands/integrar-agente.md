Tarea relacionada con el agente conversacional IA: $ARGUMENTS

Contexto:
- El agente usa la API de Claude (claude-sonnet-4-6)
- El system prompt incluye el perfil de hábitos del usuario desde HabitContextBuilder
- La conversación se persiste en tabla conversaciones con FK a usuario
- Endpoint: POST /agente/chat — recibe {mensaje, usuarioId}, devuelve {respuesta, xpGanado}

Al modificar la lógica del agente, siempre actualizar el test de integración AgentServiceTest.
