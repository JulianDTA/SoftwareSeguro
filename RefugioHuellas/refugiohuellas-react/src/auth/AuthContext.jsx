import { createContext, useContext, useEffect, useMemo, useState } from "react";
import keycloak from "./keycloak";
import { authApi } from "../api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function syncUser() {
            if (!keycloak.authenticated || !keycloak.token) {
                setLoading(false);
                return;
            }
            try {
                // El backend valida el token Keycloak y devuelve los datos del usuario local
                const me = await authApi.me(keycloak.token);
                setUser(me);
            } catch {
                // Fallback: usar los claims del token directamente
                const p = keycloak.tokenParsed;
                if (p) {
                    setUser({
                        email: p.email,
                        userId: p.sub,
                        roles: p.resource_access?.refugiohuellas?.roles ?? p.realm_access?.roles ?? [],
                    });
                }
            } finally {
                setLoading(false);
            }
        }

        syncUser();

        keycloak.onTokenExpired = () => {
            keycloak.updateToken(30).catch(() => setUser(null));
        };

        return () => {
            keycloak.onTokenExpired = undefined;
        };
    }, []);

    function login() {
        keycloak.login({ redirectUri: window.location.origin + import.meta.env.BASE_URL });
    }

    function logout() {
        setUser(null);
        keycloak.logout({ redirectUri: window.location.origin + import.meta.env.BASE_URL });
    }

    const value = useMemo(
        () => ({
            token: keycloak.token || null,
            user,
            loading,
            login,
            logout,
            isAuth: keycloak.authenticated ?? false,
        }),
        [user, loading]
    );

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
    return useContext(AuthCtx);
}
