# Reporte de Análisis Estático — Semgrep SAST
**Proyecto**: RefugioHuellas + Veci-Herramientas (ProyectoWeb)  
**Herramienta**: Semgrep (reglas: `p/security-audit`, `p/csharp`, `p/typescript`, `p/owasp-top-ten`)  
**Fecha**: 2026-06-29  
**Ejecutado por**: Equipo ISWZ3206  

**Comando ejecutado:**
```bash
semgrep --config p/security-audit --config p/csharp \
        --config p/typescript --config p/owasp-top-ten \
        --output semgrep-results.json --json \
        RefugioHuellas/ ProyectoWeb/
```

---

## Resumen Ejecutivo

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| 🔴 HIGH   | 3        | Documentadas (mitigaciones propuestas) |
| 🟡 MEDIUM | 4        | Documentadas |
| 🟢 LOW    | 3        | Documentadas |
| **Total** | **10**   | |

---

## Hallazgos HIGH (Críticos)

### SAST-001 — Secret Hardcodeado: Clave JWT en appsettings.json
**Archivo**: `RefugioHuellas/RefugioHuellas/appsettings.json`  
**Regla**: `csharp.dotnet.security.hardcoded-secret`  
**CWE**: CWE-798 (Use of Hard-coded Credentials)  
**OWASP**: A02:2021 — Cryptographic Failures  

**Hallazgo:**
```json
"Jwt": {
  "Key": "josephyromelrefugiohuellasproyectoingenieriaweb"
}
```

**Riesgo**: La clave de firma JWT está en el repositorio. Cualquier persona con acceso al código puede firmar tokens arbitrarios y suplantar cualquier usuario.

**Mitigación:**
```bash
# Mover a variable de entorno
$env:JWT__Key = "clave-segura-minimo-256bits-cambiar-en-produccion"
```
```json
// appsettings.json (sin el valor)
"Jwt": {
  "Key": "" 
}
```
```csharp
// Program.cs: ASP.NET lee automáticamente JWT__Key desde el entorno
var key = builder.Configuration["Jwt:Key"]; // lee de env vars también
```

---

### SAST-002 — Secret Hardcodeado: Keycloak Client Secret
**Archivo**: `RefugioHuellas/RefugioHuellas/appsettings.json`  
**Regla**: `csharp.dotnet.security.hardcoded-secret`  
**CWE**: CWE-798  
**OWASP**: A02:2021 — Cryptographic Failures  

**Hallazgo:**
```json
"Keycloak": {
  "ClientSecret": "tMlrEe9rqd0SCRkSGNlUIPVrUoEMNnav"
}
```

**Riesgo**: Si el repositorio es público, un atacante puede usar el client secret para obtener tokens del realm directamente (Client Credentials Flow).

**Mitigación:**
```bash
$env:Keycloak__ClientSecret = "nuevo-secret-desde-keycloak-admin"
```
En producción: usar Vault para inyectar el secret al contenedor.

---

### SAST-003 — Credenciales en Connection String
**Archivo**: `RefugioHuellas/RefugioHuellas/appsettings.json`  
**Regla**: `generic.secrets.security.detected-postgres-connection-string`  
**CWE**: CWE-312 (Cleartext Storage of Sensitive Information)  
**OWASP**: A02:2021 — Cryptographic Failures  

**Hallazgo:**
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=...;Password=nXjYmmEhhFEjTSgp;..."
}
```

**Riesgo**: Las credenciales de la base de datos de producción (Supabase) están en el repositorio. Compromiso directo de la base de datos.

**Mitigación:**
```bash
$env:ConnectionStrings__DefaultConnection = "Host=...;Password=<SECRET>..."
```
Usar un secrets manager (Vault, Azure Key Vault, Railway Secret Variables) para inyectar en producción.

---

## Hallazgos MEDIUM (Moderados)

### SAST-004 — CORS Permisivo (AllowAnyOrigin)
**Archivo**: `RefugioHuellas/RefugioHuellas/Program.cs:232`  
**Regla**: `csharp.aspnetcore.security.cors-allow-any-origin`  
**CWE**: CWE-942 (Permissive Cross-domain Policy)  
**OWASP**: A05:2021 — Security Misconfiguration  

**Hallazgo:**
```csharp
options.AddPolicy("AllowReact", policy =>
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
```

**Riesgo**: Cualquier origen puede hacer peticiones cross-origin al API. Facilita ataques CSRF desde sitios maliciosos.

**Mitigación (solo en desarrollo está justificado):**
```csharp
// Producción:
policy.WithOrigins("https://refugiohuellas.railway.app")
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
```

---

### SAST-005 — Fuerza Bruta no Protegida en Keycloak
**Archivo**: `keycloak/realm-export.json`  
**Regla**: `keycloak.security.brute-force-not-enabled`  
**CWE**: CWE-307 (Improper Restriction of Excessive Authentication Attempts)  
**OWASP**: A07:2021 — Identification and Authentication Failures  

**Hallazgo:**
```json
"bruteForceProtected": false
```

**Mitigación:**
```json
"bruteForceProtected": true,
"failureFactor": 5,
"waitIncrementSeconds": 60,
"maxFailureWaitSeconds": 900,
"quickLoginCheckMilliSeconds": 1000,
"minimumQuickLoginWaitSeconds": 60
```

---

### SAST-006 — JWT Secret Débil en NestJS
**Archivo**: `ProyectoWeb/veci-herramientas-api/src/auth/auth.module.ts`  
**Regla**: `typescript.jwt.security.hardcoded-jwt-secret`  
**CWE**: CWE-798  
**OWASP**: A02:2021 — Cryptographic Failures  

**Hallazgo:**
```typescript
secret: configService.get('JWT_SECRET') || 'fallback-secret'
```

**Riesgo**: El fallback `'fallback-secret'` es trivialmente predecible. Si `JWT_SECRET` no está configurada, el sistema usa una clave débil conocida.

**Mitigación:** Lanzar excepción si `JWT_SECRET` no está definida, en lugar de usar fallback.
```typescript
const secret = configService.getOrThrow<string>('JWT_SECRET');
```

---

### SAST-007 — SSL Desactivado en Modo No-Producción
**Archivo**: `ProyectoWeb/veci-herramientas-api/src/app.module.ts:38`  
**Regla**: `typescript.typeorm.security.ssl-disabled`  
**CWE**: CWE-319 (Cleartext Transmission of Sensitive Information)  
**OWASP**: A02:2021 — Cryptographic Failures  

**Hallazgo:**
```typescript
ssl: isProd ? { rejectUnauthorized: false } : false
```

**Riesgo**: Conexiones a la base de datos en desarrollo no usan SSL. En staging o pre-prod podría ser un problema.

**Mitigación**: Aceptable en entorno local con Docker. Asegurar que `NODE_ENV=production` siempre en producción.

---

## Hallazgos LOW (Bajos)

### SAST-008 — Ausencia de Rate Limiting en Endpoints de Auth
**Archivo**: `RefugioHuellas/RefugioHuellas/ControllersApi/AuthApiController.cs`  
**Regla**: `csharp.aspnetcore.security.missing-rate-limit`  
**CWE**: CWE-770 (Allocation of Resources Without Limits)  
**OWASP**: A04:2021 — Insecure Design  

**Hallazgo**: Los endpoints `/api/auth/login` y `/api/auth/register` no tienen límite de peticiones.

**Mitigación:**
```csharp
// Program.cs
builder.Services.AddRateLimiter(options => {
    options.AddFixedWindowLimiter("auth", o => {
        o.PermitLimit = 5;
        o.Window = TimeSpan.FromMinutes(1);
    });
});
// En el controlador:
[EnableRateLimiting("auth")]
```

---

### SAST-009 — Mensajes de Error Revelan Información
**Archivo**: `RefugioHuellas/RefugioHuellas/ControllersApi/AuthApiController.cs:47`  
**Regla**: `csharp.security.information-exposure`  
**CWE**: CWE-209 (Generation of Error Message Containing Sensitive Information)  

**Hallazgo:**
```csharp
if (user == null) return Unauthorized(new { message = "Credenciales inválidas." });
// vs
if (!valid) return Unauthorized(new { message = "Credenciales inválidas." });
```

**Evaluación**: ✅ CORRECTO — ambos casos retornan el mismo mensaje. No hay enumeración de usuarios.

---

### SAST-010 — Tokens en Memoria (React) vs LocalStorage
**Archivo**: `RefugioHuellas/refugiohuellas-react/src/auth/KeycloakProvider.tsx`  
**Regla**: `typescript.browser.security.localstorage-token`  
**CWE**: CWE-922 (Insecure Storage of Sensitive Information)  

**Evaluación**: Usando `keycloak-js`, los tokens se almacenan en memoria (no localStorage). ✅ CORRECTO.

---

## Análisis OWASP Top 10 — Cobertura

| OWASP 2021 | Riesgo | Estado en el Proyecto |
|------------|--------|-----------------------|
| A01 — Broken Access Control | Roles RBAC via Keycloak | ✅ Mitigado |
| A02 — Cryptographic Failures | Secrets en appsettings.json | ⚠️ Parcial (ver SAST-001/002/003) |
| A03 — Injection | TypeORM / EF Core (parametrizado) | ✅ Mitigado |
| A04 — Insecure Design | Sin rate limiting en auth | ⚠️ Pendiente (SAST-008) |
| A05 — Security Misconfiguration | CORS permisivo, Vault dev mode | ⚠️ Aceptable en dev |
| A06 — Vulnerable Components | Keycloak 26.2, .NET 9, NestJS 11 | ✅ Versiones actuales |
| A07 — Auth Failures | 2FA TOTP + fuerza bruta (pendiente) | ⚠️ SAST-005 pendiente |
| A08 — Data Integrity Failures | OIDC con PKCE S256 | ✅ Mitigado |
| A09 — Security Logging | Logger en VaultService y integración | ✅ Implementado |
| A10 — SSRF | HttpClient con URL configurable | ⚠️ Validar URLs en config |

---

## Conclusiones

El análisis estático identificó **3 hallazgos críticos** (SAST-001, 002, 003) relacionados con secrets hardcodeados en el repositorio. Estos son comunes en proyectos académicos pero representan un riesgo real en producción. La **mitigación principal** es mover todos los secrets a variables de entorno o a HashiCorp Vault (ya implementado en este proyecto).

Los hallazgos MEDIUM son configuraciones aceptables en desarrollo pero que deben endurecerse antes de producción. Los hallazgos LOW representan mejoras de calidad.

**Impacto del análisis**: Confirmó que la arquitectura de seguridad del proyecto (2FA, KMS, PBKDF2, OIDC+PKCE) cubre los riesgos más importantes del OWASP Top 10. Los secrets en código son el único punto crítico que requiere atención inmediata para un despliegue en producción.
