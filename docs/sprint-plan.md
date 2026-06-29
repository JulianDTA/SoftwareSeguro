# Plan de Sprints — Desarrollo de Software Seguro
**Proyecto**: SSO con Keycloak + KMS + Seguridad en RefugioHuellas y Veci-Herramientas  
**Equipo**: ISWZ3206  
**Metodología**: Scrum (sprints de 2 semanas)  
**Fecha inicio**: 2026-06-01  

---

## Sprint 1 — Infraestructura SSO con Keycloak
**Período**: Semanas 1–2 (2026-06-01 al 2026-06-14)  
**Objetivo**: Montar Keycloak en Docker e integrar autenticación centralizada en ambas apps.  
**Velocity planificado**: 21 pts

| US | Descripción | Puntos | Estado |
|----|-------------|--------|--------|
| US-01 | Login con SSO (Keycloak OIDC) | 8 | ✅ Completado |
| US-02 | Roles y permisos via JWT | 5 | ✅ Completado |
| US-03 | SPA React con PKCE S256 | 8 | ✅ Completado |

### Tareas técnicas realizadas:
- [x] Montar Keycloak 26.2 en Docker Compose
- [x] Configurar realm `proyecto-dss` con 3 clientes
- [x] Integrar `AddOpenIdConnect` en ASP.NET Core (RefugioHuellas)
- [x] Integrar `AddJwtBearer` con JWKS RS256 en ASP.NET Core
- [x] Integrar `jwks-rsa` en NestJS (JwtStrategy)
- [x] Integrar `keycloak-js` con PKCE en React SPAs
- [x] Implementar `silent-check-sso.html` para renovación silenciosa
- [x] Configurar `checkLoginIframe: false` (evita 403)

### Definition of Done Sprint 1:
- Login SSO funcional en RefugioHuellas (MVC + React)
- Login SSO funcional en Veci-Herramientas (Vue + React)
- Roles propagados correctamente desde Keycloak
- `realm-export.json` reproducible (import automático en Docker)

---

## Sprint 2 — Autenticación de Dos Factores (2FA TOTP)
**Período**: Semanas 3–4 (2026-06-15 al 2026-06-28)  
**Objetivo**: Añadir segundo factor TOTP obligatorio para todos los usuarios.  
**Velocity planificado**: 8 pts

| US | Descripción | Puntos | Estado |
|----|-------------|--------|--------|
| US-04 | Configuración autenticador TOTP | 5 | ✅ Completado |
| US-05 | Verificación 2FA en login | 3 | ✅ Completado |

### Tareas técnicas realizadas:
- [x] Añadir política OTP al realm (TOTP HmacSHA1, 6 dígitos, 30s)
- [x] Configurar `CONFIGURE_TOTP` como `defaultAction: true`
- [x] Asignar `requiredActions: ["CONFIGURE_TOTP"]` a usuarios de prueba
- [x] Verificar compatibilidad con Google Authenticator y Microsoft Authenticator
- [x] Actualizar `realm-export.json` con configuración 2FA completa

### Definition of Done Sprint 2:
- Al hacer login por primera vez, Keycloak pide escanear QR con autenticador
- En logins posteriores, se pide el código TOTP de 6 dígitos
- El login falla si el código TOTP es incorrecto
- Compatible con Google Authenticator / Microsoft Authenticator

---

## Sprint 3 — KMS con HashiCorp Vault (Transit Engine)
**Período**: Semanas 5–6 (2026-06-29 al 2026-07-12)  
**Objetivo**: Cifrar comunicaciones inter-servicio usando AES-256-GCM gestionado por Vault.  
**Velocity planificado**: 13 pts

| US | Descripción | Puntos | Estado |
|----|-------------|--------|--------|
| US-06 | Cifrado de notificaciones con Vault | 8 | ✅ Completado |
| US-07 | Descifrado seguro en Veci-Herramientas | 5 | ✅ Completado |

### Tareas técnicas realizadas:
- [x] Añadir HashiCorp Vault 1.17 a Docker Compose (modo dev)
- [x] Crear servicio `vault-init` para habilitar Transit Engine y crear clave `sso-comms`
- [x] Implementar `VaultService.cs` en ASP.NET (encrypt/decrypt via REST API)
- [x] Implementar `VeciIntegrationService.cs` en ASP.NET (orquesta encrypt + HTTP call)
- [x] Crear `IntegrationController.cs` en ASP.NET (`POST /api/integration/send-adoption`)
- [x] Implementar `VaultService` en NestJS (decrypt via REST API)
- [x] Implementar `SecureModule` en NestJS (`POST /api/secure/adoption`)
- [x] Registrar servicios KMS en DI de ASP.NET (Program.cs)
- [x] Añadir configuración Vault a `appsettings.Development.json` y `.env`

### Flujo de datos cifrados:
```
RefugioHuellas (ASP.NET)
  → VaultService.EncryptAsync(adoptionJson)
  → ciphertext "vault:v1:ABC..."
  → POST /api/secure/adoption { encryptedPayload: "vault:v1:ABC..." }
  
Veci-Herramientas (NestJS)
  → VaultService.decrypt(ciphertext)
  → adoptionJson (texto plano)
  → SecureService.processAdoptionRequest()
```

### Definition of Done Sprint 3:
- `POST /api/integration/send-adoption` en RefugioHuellas cifra y envía el payload
- `POST /api/secure/adoption` en Veci-Herramientas descifra y procesa
- Vault corre en Docker y la clave `sso-comms` es AES-256-GCM
- Sin Vault activo, el endpoint retorna un error controlado (no expone datos)

---

## Sprint 4 — Análisis Estático (SAST) y Documentación
**Período**: Semanas 7–8 (2026-07-13 al 2026-07-26)  
**Objetivo**: Identificar vulnerabilidades con Semgrep, documentar hallazgos y crear entregables académicos.  
**Velocity planificado**: 11 pts

| US | Descripción | Puntos | Estado |
|----|-------------|--------|--------|
| US-08 | Análisis SAST con Semgrep | 5 | 🔄 En progreso |
| US-09 | Hash PBKDF2 (validación) | 3 | ✅ Completado |
| US-10 | Cookies cifradas Data Protection | 3 | ✅ Completado |

### Tareas técnicas:
- [x] Ejecutar Semgrep con reglas `p/security-audit` y `p/csharp` y `p/typescript`
- [x] Clasificar hallazgos por severidad (HIGH / MEDIUM / LOW)
- [x] Documentar hallazgos en `docs/semgrep-report.md`
- [x] Proponer mitigaciones para hallazgos críticos
- [x] Verificar que contraseñas usan PBKDF2 (ASP.NET Identity)
- [x] Verificar que cookies usan Data Protection AES-CBC + HMAC-SHA256
- [ ] Actualizar presentación con slides de roadmap, 2FA, KMS y SAST

### Definition of Done Sprint 4:
- Reporte Semgrep documentado con al menos 5 hallazgos clasificados
- Mitigaciones documentadas para hallazgos HIGH
- Documentación ágil completa (user stories + sprint plan)
- Presentación actualizada con todos los sprints

---

## Resumen de Velocidad

| Sprint | Período | Puntos | Estado |
|--------|---------|--------|--------|
| Sprint 1 — SSO Keycloak | Jun 01–14 | 21 | ✅ Completado |
| Sprint 2 — 2FA TOTP | Jun 15–28 | 8 | ✅ Completado |
| Sprint 3 — KMS Vault | Jun 29–Jul 12 | 13 | ✅ Completado |
| Sprint 4 — SAST + Docs | Jul 13–26 | 11 | 🔄 En progreso |
| **Total** | | **53 pts** | |

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| WDAC bloquea .exe en Windows | Alto | Medio | Usar `dotnet <dll>` directamente |
| Vault no disponible en producción | Medio | Alto | Fallback controlado + logs de error |
| Token TOTP expirado (clock drift) | Bajo | Medio | `lookAheadWindow: 1` (acepta ±1 período) |
| Secrets en código (appsettings.json) | Alto | Alto | Migrar a variables de entorno (Sprint 4 mitigation) |
