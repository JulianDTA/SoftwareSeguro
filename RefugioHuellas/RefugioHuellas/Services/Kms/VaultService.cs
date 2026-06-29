using System.Text;
using System.Text.Json;

namespace RefugioHuellas.Services.Kms
{
    public class VaultService : IVaultService
    {
        private readonly IHttpClientFactory _httpFactory;
        private readonly string _vaultAddr;
        private readonly string _vaultToken;
        private readonly string _transitKey;
        private readonly ILogger<VaultService> _logger;

        public VaultService(
            IHttpClientFactory httpFactory,
            IConfiguration config,
            ILogger<VaultService> logger)
        {
            _httpFactory = httpFactory;
            _vaultAddr = config["Vault:Address"] ?? "http://localhost:8200";
            _vaultToken = config["Vault:Token"] ?? "dev-only-token";
            _transitKey = config["Vault:TransitKey"] ?? "sso-comms";
            _logger = logger;
        }

        public async Task<string> EncryptAsync(string plaintext)
        {
            var encoded = Convert.ToBase64String(Encoding.UTF8.GetBytes(plaintext));
            var body = JsonSerializer.Serialize(new { plaintext = encoded });

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                $"{_vaultAddr}/v1/transit/encrypt/{_transitKey}");
            request.Headers.Add("X-Vault-Token", _vaultToken);
            request.Content = new StringContent(body, Encoding.UTF8, "application/json");

            var http = _httpFactory.CreateClient("vault");
            var response = await http.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var ciphertext = doc.RootElement.GetProperty("data").GetProperty("ciphertext").GetString()!;
            _logger.LogDebug("Payload cifrado con Vault Transit AES-256-GCM");
            return ciphertext;
        }

        public async Task<string> DecryptAsync(string ciphertext)
        {
            var body = JsonSerializer.Serialize(new { ciphertext });

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                $"{_vaultAddr}/v1/transit/decrypt/{_transitKey}");
            request.Headers.Add("X-Vault-Token", _vaultToken);
            request.Content = new StringContent(body, Encoding.UTF8, "application/json");

            var http = _httpFactory.CreateClient("vault");
            var response = await http.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var base64 = doc.RootElement.GetProperty("data").GetProperty("plaintext").GetString()!;
            return Encoding.UTF8.GetString(Convert.FromBase64String(base64));
        }
    }
}
