// src/api/authService.ts - CORRETO (Doc Totvs LIB 20190705+)
import { api } from './axiosInstance';

/**
 * Auth Service seguindo documentação oficial Totvs
 * Disponível a partir da LIB versão 20190705
 * 
 * Endpoint: /api/oauth2/v1/token
 * - Token de acesso expira em 1 hora (3600s)
 * - Refresh token expira em 24 horas
 */
export const authService = {
    /**
     * Login com usuário e senha
     * 
     * POST /api/oauth2/v1/token?grant_type=password
     * Headers:
     *   - username: usuário
     *   - password: senha
     * 
     * Retorna:
     * {
     *   access_token: string,
     *   refresh_token: string,
     *   scope: "default",
     *   token_type: "Bearer",
     *   expires_in: 3600,
     *   hasMFA: boolean
     * }
     */
    async login(username: string, password: string) {
        try {
            const res = await api.post(
                '/api/oauth2/v1/token?grant_type=password',
                {}, // body vazio
                {
                    headers: {
                        username,
                        password,
                    },
                }
            );

            return res.data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Refresh Token
     * 
     * POST /api/oauth2/v1/token?grant_type=refresh_token&refresh_token=X
     * 
     * Retorna o mesmo formato do login
     */
    async refresh(refreshToken: string) {

        try {
            const res = await api.post(
                `/api/oauth2/v1/token?grant_type=refresh_token&refresh_token=${refreshToken}`
            );

            return res.data;
        } catch (error: any) {
            throw error;
        }
    },
};