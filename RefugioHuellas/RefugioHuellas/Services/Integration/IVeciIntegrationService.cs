namespace RefugioHuellas.Services.Integration
{
    public interface IVeciIntegrationService
    {
        Task<bool> SendAdoptionAsync(
            string dogId,
            string dogName,
            string adopterEmail,
            string adopterName);
    }
}
