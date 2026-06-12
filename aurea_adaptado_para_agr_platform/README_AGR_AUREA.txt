AUREA Beauty adaptado para AGR Platform

Contenido:
- src/pages/apps/aurea/: páginas originales de AUREA adaptadas para rutas /apps/aurea/...
- src/pages/apps/AureaPage.vue: entrada principal de AUREA dentro de AGR
- src/layouts/AureaLayout.vue: layout propio de AUREA con menú lateral
- src/assets/: qr.jpg y logo-glamur.png
- src/utils/: utilidades copiadas de AUREA
- src/boot/axios.js: api con token agr_token
- src/router/routes.aurea-ready.js: ejemplo de routes.js listo para reemplazar si lo necesitas

Instalar en agr-platform-frontend si faltan dependencias:
  npm install jspdf jspdf-autotable @capacitor/core @capacitor-community/contacts

En quasar.config.js verifica:
  boot: ['axios']
  framework: { plugins: ['Notify', 'Dialog'] }

IMPORTANTE:
- No copies MainLayout.vue, LoginPage.vue, RegisterPage.vue, App.vue ni router del AUREA original.
- Copia solo las carpetas/archivos incluidos aquí encima de tu agr-platform-frontend.
- El backend AGR todavía necesita las rutas /api/clientes, /api/citas, /api/pagos, /api/servicios, etc. Si sale 'route api/clientes could not be found', falta migrar backend.
