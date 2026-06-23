import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || 'https://keycloak-production-51d6.up.railway.app',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'proyecto-dss',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'refugiohuellas-react',
});

export default keycloak;
