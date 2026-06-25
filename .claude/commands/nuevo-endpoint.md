Crea un nuevo endpoint REST para el recurso: $ARGUMENTS

Pasos:
1. Entity en /domain/model/ con anotaciones JPA
2. Repository interface extendiendo JpaRepository
3. DTOs de request y response en /domain/dto/
4. Service con lógica de negocio y manejo de excepciones
5. Controller con @RestController, mapeo de rutas y @Valid
6. Test unitario del Service con Mockito
7. Migración Flyway si hay tabla nueva

Seguir la arquitectura por capas definida en CLAUDE.md.
