# AGR Platform - Integración AUREA Beauty

Cambios incluidos en este paquete:

1. El botón **Abrir** del módulo AUREA ahora entra directo a:

   `/apps/aurea/dashboard`

   cuando el módulo tenga `slug = aurea` y `ruta_frontend = /apps/aurea`.

2. La ruta `/apps/aurea` ahora redirige automáticamente al dashboard real de AUREA.

3. Se mantiene soporte para rutas externas. Si un módulo tiene una URL tipo `https://...`, AGR Platform la abre en una nueva pestaña.

4. No se reemplazó el login central ni los permisos. AGR Platform sigue controlando:
   - login
   - roles
   - módulos permitidos
   - acceso denegado
   - dashboard SaaS

## Prueba rápida

- Inicia sesión como super_admin.
- Verifica que AUREA Beauty tenga:

  `slug: aurea`
  `ruta_frontend: /apps/aurea`
  `activo: Sí`

- Pulsa **Abrir** en AUREA.
- Debe abrir `/apps/aurea/dashboard`.
