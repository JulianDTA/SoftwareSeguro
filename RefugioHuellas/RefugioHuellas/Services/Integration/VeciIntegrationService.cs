using System.Text;
using System.Text.Json;
using RefugioHuellas.Services.Kms;

namespace RefugioHuellas.Services.Integration
{
    public class VeciIntegrationService : IVeciIntegrationService
    {
        private readonly IVaultService _vault;
        private readonly IHttpClientFactory _httpFactory;
        private readonly string _veciApiUrl;
        private readonly ILogger<VeciIntegrationService> _logger;

        public VeciIntegrationService(
            IVaultService vault,
            IHttpClientFactory httpFactory,
            IConfiguration config,
            ILogger<VeciIntegrationService> logger)
        {
            _vault = vault;
            _httpFactory = httpFactory;
            _veciApiUrl = config["Veci:ApiUrl"] ?? "http://localhost:3001/api";
            _logger = logger;
        }

        public async Task<bool> SendAdoptionAsync(
            string dogId, string dogName, string adopterEmail, string adopterName)
        {
            var payload = new
            {
                dogId,
                dogName,
                adopterEmail,
                adopterName,
                adoptionDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                refugioSource = "RefugioHuellas"
            };

            var plaintext = JsonSerializer.Serialize(payload);

            string encrypted;
            try
            {
                encrypted = await _vault.EncryptAsync(plaintext);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cifrar payload de adopción con Vault");
                return false;
            }

            _logger.LogInformation(
                "Enviando adopción cifrada a Veci: {DogName} → {Email}", dogName, adopterEmail);

            var http = _httpFactory.CreateClient("veci");
            var body = JsonSerializer.Serialize(new { encryptedPayload = encrypted });
            using var req = new HttpRequestMessage(
                HttpMethod.Post, $"{_veciApiUrl}/secure/adoption");
            req.Content = new StringContent(body, Encoding.UTF8, "application/json");

            try
            {
                var response = await http.SendAsync(req);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al contactar Veci-Herramientas API");
                return false;
            }
        }
    }
}
