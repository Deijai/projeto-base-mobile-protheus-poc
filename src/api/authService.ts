import { api } from './axiosInstance';

export const authService = {
    async login(username: string, password: string) {
        const res = await api.post(
            `/api/oauth2/v1/token?grant_type=password`,
            {},
            { headers: { username, password } }
        );
        console.log('res', res);

        return res.data;
    },

    async refresh(refreshToken: string) {
        const res = await api.post(
            `/api/oauth2/v1/token?grant_type=refresh_token&refresh_token=${refreshToken}`
        );
        return res.data;
    },
};
