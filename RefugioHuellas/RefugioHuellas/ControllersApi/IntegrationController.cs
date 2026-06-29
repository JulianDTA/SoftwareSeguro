using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RefugioHuellas.Services.Integration;

namespace RefugioHuellas.ControllersApi
{
    [ApiController]
    [Route("api/integration")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class IntegrationController : ControllerBase
    {
        private readonly IVeciIntegrationService _veciService;

        public IntegrationController(IVeciIntegrationService veciService)
        {
            _veciService = veciService;
        }

        public class AdoptionNotificationRequest
        {
            public string DogId { get; set; } = "";
            public string DogName { get; set; } = "";
            public string AdopterEmail { get; set; } = "";
            public string AdopterName { get; set; } = "";
        }

        /// <summary>
        /// Cifra la notificación de adopción con Vault KMS y la envía a Veci-Herramientas.
        /// Requiere autenticación JWT (token Keycloak del usuario que aprueba la adopción).
        /// </summary>
        [HttpPost("send-adoption")]
        public async Task<IActionResult> SendAdoption([FromBody] AdoptionNotificationRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.DogId) || string.IsNullOrWhiteSpace(req.AdopterEmail))
                return BadRequest(new { message = "DogId y AdopterEmail son requeridos." });

            var success = await _veciService.SendAdoptionAsync(
                req.DogId, req.DogName, req.AdopterEmail, req.AdopterName);

            return success
                ? Ok(new { message = "Notificación de adopción enviada y cifrada correctamente." })
                : StatusCode(502, new { message = "No se pudo contactar con Veci-Herramientas." });
        }
    }
}
