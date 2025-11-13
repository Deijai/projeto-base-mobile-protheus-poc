// src/services/restValidator.ts
export interface RestValidationResult {
    success: boolean;
    url?: string;
    error?: string;
    statusCode?: number;
    data?: any;
}

export interface RestConfig {
    protocol: 'HTTP' | 'HTTPS';
    address: string;
    port?: string;
    endpoint: string; // geralmente "rest" ou "rest/api/oauth2/v1/token..."
}

export class RestValidatorService {
    private static instance: RestValidatorService;

    private constructor() { }

    static getInstance(): RestValidatorService {
        if (!RestValidatorService.instance) {
            RestValidatorService.instance = new RestValidatorService();
        }
        return RestValidatorService.instance;
    }

    /**
     * Constrói a URL completa do REST
     * Ex.: http://192.168.0.10:8080/rest/api/oauth2/v1/token?grant_type=password
     */
    buildRestUrl(config: RestConfig, path?: string): string {
        const { protocol, address, port, endpoint } = config;
        const portPart = port && port.trim() !== '' ? `:${port}` : '';
        const proto = protocol.toLowerCase(); // HTTP -> http

        // garante que endpoint não tenha barra duplicada
        const endpointClean = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        const base = `${proto}://${address}${portPart}/${endpointClean}`;

        if (path) {
            const pathClean = path.startsWith('/') ? path.slice(1) : path;
            return `${base}/${pathClean}`;
        }

        return base;
    }

    /**
     * Valida se a configuração REST está correta
     */
    validateConfig(config: RestConfig): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // endereço obrigatório
        if (!config.address || config.address.trim() === '') {
            errors.push('Endereço é obrigatório');
        } else {
            // IP v4
            const ipRegex =
                /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            // domínio
            const domainRegex =
                /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

            if (
                !ipRegex.test(config.address) &&
                !domainRegex.test(config.address) &&
                config.address !== 'localhost'
            ) {
                errors.push('Formato de endereço inválido');
            }
        }

        // porta opcional
        if (config.port && config.port.trim() !== '') {
            const port = parseInt(config.port, 10);
            if (isNaN(port) || port < 1 || port > 65535) {
                errors.push('Porta deve estar entre 1 e 65535');
            }
        }

        // endpoint obrigatório
        if (!config.endpoint || config.endpoint.trim() === '') {
            errors.push('Endpoint é obrigatório');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Testa a conexão com o servidor REST
     * Espera status 401 para considerar como sucesso (servidor funcionando mas sem auth)
     */
    async testConnection(
        config: RestConfig,
        timeout = 10000
    ): Promise<RestValidationResult> {
        const validation = this.validateConfig(config);

        if (!validation.valid) {
            return {
                success: false,
                error: validation.errors.join(', '),
            };
        }

        // vamos bater direto no endpoint de token do Protheus
        // /api/oauth2/v1/token?grant_type=password
        const url = this.buildRestUrl(config, 'api/oauth2/v1/token?grant_type=password');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            // pode ser GET ou POST – a doc usa POST, vamos manter POST
            const response = await fetch(url, {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            clearTimeout(timeoutId);

            // 401 -> ok
            if (response.status === 401 || (response.status >= 200 && response.status < 500)) {
                return {
                    success: true,
                    url,
                    statusCode: response.status,
                };
            } else {
                return {
                    success: false,
                    url,
                    statusCode: response.status,
                    error: `Servidor retornou status ${response.status}`,
                };
            }
        } catch (error: any) {
            let errorMessage = 'Erro na conexão';

            if (error?.name === 'AbortError') {
                errorMessage = 'Timeout na conexão (mais de 10 segundos)';
            } else if (error?.message) {
                errorMessage = error.message;
            }

            return {
                success: false,
                url,
                error: errorMessage,
            };
        }
    }

    /**
     * Testa múltiplas URLs (com e sem porta padrão) para aumentar chance de sucesso
     */
    async testConnectionWithFallback(
        config: RestConfig
    ): Promise<RestValidationResult> {
        // 1) primeiro: exatamente o que o usuário informou
        let result = await this.testConnection(config);

        if (result.success) {
            return result;
        }

        // 2) se não informou porta, tenta portas comuns
        if (!config.port || config.port.trim() === '') {
            const commonPorts = ['8080', '8081', '8090', '9090', '3000'];
            for (const port of commonPorts) {
                const cfg = { ...config, port };
                result = await this.testConnection(cfg);
                if (result.success) {
                    return result;
                }
            }
        }

        // 3) se informou porta e falhou, tenta sem porta
        if (config.port && config.port.trim() !== '') {
            const cfg = { ...config, port: '' };
            result = await this.testConnection(cfg);
            if (result.success) {
                return result;
            }
        }

        return result;
    }
}

export const restValidator = RestValidatorService.getInstance();
