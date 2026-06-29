# Historias de Usuario — Proyecto DSS (Software Seguro)
**Sistema**: RefugioHuellas + ProyectoWeb (Veci-Herramientas)  
**Equipo**: Desarrollo de Software Seguro — ISWZ3206  
**Fecha**: 2026-06-29

---

## Épica 1: Autenticación Centralizada con SSO (Keycloak)

### US-01 — Login con SSO
**Como** usuario registrado en el sistema,  
**quiero** iniciar sesión una sola vez en Keycloak  
**para que** pueda acceder tanto a RefugioHuellas como a Veci-Herramientas sin volver a ingresar mis credenciales.

**Criterios de aceptación:**
- [ ] El usuario puede iniciar sesión desde cualquiera de las dos aplicaciones
- [ ] Tras iniciar sesión en una aplicación, al abrir la segunda ya está autenticado (SSO)
- [ ] El token JWT de Keycloak es aceptado por ambos backends
- [ ] El cierre de sesión en una aplicación cierra la sesión en Keycloak

**Story Points:** 8  
**Prioridad:** Must Have

---

### US-02 — Roles y Permisos via Keycloak
**Como** administrador del sistema,  
**quiero** asignar roles (Admin / User) a los usuarios en Keycloak  
**para que** cada aplicación aplique los permisos correctos sin gestión duplicada.

**Criterios de aceptación:**
- [ ] El rol `admin` en Keycloak otorga permisos de administrador en RefugioHuellas
- [ ] El rol `user` restringe el acceso a funciones administrativas
- [ ] Los roles se propagan automáticamente via JWT claims
- [ ] Los roles están definidos en `realm-export.json` (reproducible)

**Story Points:** 5  
**Prioridad:** Must Have

---

### US-03 — SPA React con Autenticación PKCE
**Como** usuario de la SPA React de RefugioHuellas,  
**quiero** que la aplicación me autentique de forma segura sin exponer secrets  
**para que** mis credenciales estén protegidas incluso en el navegador.

**Criterios de aceptación:**
- [ ] El cliente React usa PKCE S256 (sin client_secret)
- [ ] El token se almacena en memoria (no en localStorage)
- [ ] La SPA renueva el token silenciosamente via silent-check-sso
- [ ] No se realizan peticiones con `checkLoginIframe: true` (sin errores 403)

**Story Points:** 8  
**Prioridad:** Must Have

---

## Épica 2: Autenticación de Dos Factores (2FA)

### US-04 — Configuración de Autenticador TOTP
**Como** usuario que accede por primera vez con SSO,  
**quiero** que el sistema me pida configurar un autenticador (Google Authenticator)  
**para que** mi cuenta esté protegida con un segundo factor.

**Criterios de aceptación:**
- [ ] En el primer login, Keycloak muestra la pantalla de configuración TOTP
- [ ] Se genera un QR code compatible con Google Authenticator y Microsoft Authenticator
- [ ] El código TOTP de 6 dígitos se rota cada 30 segundos (RFC 6238)
- [ ] El usuario no puede omitir la configuración del segundo factor

**Story Points:** 5  
**Prioridad:** Must Have

---

### US-05 — Verificación 2FA en Login
**Como** usuario con 2FA configurado,  
**quiero** ingresar mi código TOTP en cada inicio de sesión  
**para que** nadie pueda acceder a mi cuenta aunque conozca mi contraseña.

**Criterios de aceptación:**
- [ ] Después de ingresar usuario/contraseña, se solicita el código TOTP
- [ ] Un código incorrecto muestra error y no autentica
- [ ] Un código correcto completa el flujo y emite el token JWT
- [ ] El sistema acepta el código del período actual y el anterior (look-ahead window: 1)

**Story Points:** 3  
**Prioridad:** Must Have

---

## Épica 3: Gestión de Claves (KMS con HashiCorp Vault)

### US-06 — Cifrado de Notificaciones con Vault Transit
**Como** sistema RefugioHuellas,  
**quiero** cifrar los datos de adopción antes de enviarlos a Veci-Herramientas  
**para que** información sensible (email, nombre) no viaje en texto plano entre servicios.

**Criterios de aceptación:**
- [ ] El payload de adopción se cifra con AES-256-GCM via Vault Transit
- [ ] La clave de cifrado es gestionada por Vault (nunca expuesta a la aplicación)
- [ ] El ciphertext comienza con `vault:v1:` (formato Transit de Vault)
- [ ] Sin acceso a Vault, el ciphertext no puede ser descifrado

**Story Points:** 8  
**Prioridad:** Should Have

---

### US-07 — Descifrado Seguro en Veci-Herramientas
**Como** sistema Veci-Herramientas,  
**quiero** recibir y descifrar notificaciones de adopción de RefugioHuellas  
**para que** pueda procesar los datos de forma segura sin exponer las claves.

**Criterios de aceptación:**
- [ ] El endpoint `POST /api/secure/adoption` acepta solo payloads cifrados
- [ ] El descifrado se realiza en el servidor via Vault Transit
- [ ] Los datos descifrados se procesan y se registra la adopción
- [ ] Si el ciphertext es inválido, se retorna un error 400

**Story Points:** 5  
**Prioridad:** Should Have

---

## Épica 4: Seguridad del Código

### US-08 — Análisis Estático de Seguridad (SAST)
**Como** equipo de desarrollo,  
**quiero** ejecutar análisis estático con Semgrep sobre el código fuente  
**para que** podamos identificar y mitigar vulnerabilidades antes del despliegue.

**Criterios de aceptación:**
- [ ] Se ejecuta Semgrep con reglas de seguridad estándar
- [ ] Se clasifican los hallazgos por severidad (HIGH / MEDIUM / LOW)
- [ ] Se documentan mitigaciones para cada hallazgo crítico
- [ ] Las secrets hardcodeadas se identifican y se propone migración a variables de entorno

**Story Points:** 5  
**Prioridad:** Should Have

---

### US-09 — Protección de Contraseñas con PBKDF2
**Como** usuario de RefugioHuellas,  
**quiero** que mi contraseña sea almacenada de forma segura  
**para que** aunque la base de datos sea comprometida, mis credenciales estén protegidas.

**Criterios de aceptación:**
- [ ] Las contraseñas se almacenan con hash PBKDF2 + HMAC-SHA256 (ASP.NET Identity)
- [ ] No existe ningún campo de contraseña en texto plano en la base de datos
- [ ] El proceso de registro usa `UserManager.CreateAsync()` (auto-hash)
- [ ] El proceso de login usa `CheckPasswordAsync()` (sin comparación directa)

**Story Points:** 3  
**Prioridad:** Must Have

---

### US-10 — Cifrado de Cookies de Sesión (Data Protection)
**Como** usuario autenticado via OIDC (Keycloak MVC),  
**quiero** que mi cookie de sesión esté cifrada  
**para que** no pueda ser leída ni manipulada si es interceptada.

**Criterios de aceptación:**
- [ ] Las cookies de sesión usan ASP.NET Data Protection (AES-CBC + HMAC-SHA256)
- [ ] Las claves de Data Protection persisten en el filesystem (no en memoria)
- [ ] Las cookies tienen `SameSite=None; Secure` para compatibilidad con OIDC
- [ ] Un atacante con la cookie no puede descifrar su contenido sin la clave

**Story Points:** 3  
**Prioridad:** Must Have

---

## Resumen de Story Points

| Historia | Épica | Puntos | Prioridad |
|----------|-------|--------|-----------|
| US-01 — Login SSO | Autenticación | 8 | Must Have |
| US-02 — Roles via Keycloak | Autenticación | 5 | Must Have |
| US-03 — SPA React PKCE | Autenticación | 8 | Must Have |
| US-04 — Config TOTP | 2FA | 5 | Must Have |
| US-05 — Verificación 2FA | 2FA | 3 | Must Have |
| US-06 — Cifrado con Vault | KMS | 8 | Should Have |
| US-07 — Descifrado en Veci | KMS | 5 | Should Have |
| US-08 — Análisis SAST | Seguridad código | 5 | Should Have |
| US-09 — Hash PBKDF2 | Seguridad código | 3 | Must Have |
| US-10 — Cookies cifradas | Seguridad código | 3 | Must Have |
| **Total** | | **53** | |
