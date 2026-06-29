namespace RefugioHuellas.Services.Kms
{
    public interface IVaultService
    {
        Task<string> EncryptAsync(string plaintext);
        Task<string> DecryptAsync(string ciphertext);
    }
}
