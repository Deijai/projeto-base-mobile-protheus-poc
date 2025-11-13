// src/api/moduleService.ts
export interface ModuleItem {
    id: string;
    name: string;
    description: string;
    icon: string;
    route: string;
}

export const moduleService = {
    async getModules(): Promise<ModuleItem[]> {
        // Se no futuro vier de um endpoint do Protheus, troque aqui pelo api.get(...)
        return [
            {
                id: 'purchasing',
                name: 'Compras',
                description: 'Gestão de solicitações e pedidos de compra.',
                icon: 'cart-outline',
                route: '/(tabs)/purchasing',
            },
            {
                id: 'finance',
                name: 'Financeiro',
                description: 'Contas a pagar, receber e fluxo de caixa.',
                icon: 'cash-outline',
                route: '/(tabs)/finance',
            },
            {
                id: 'stock',
                name: 'Estoque',
                description: 'Controle e movimentação de produtos e materiais.',
                icon: 'cube-outline',
                route: '/(tabs)/stock',
            },
            {
                id: 'hr',
                name: 'RH',
                description: 'Gestão de colaboradores e folha de pagamento.',
                icon: 'people-outline',
                route: '/(tabs)/hr',
            },
            {
                id: 'controladoria',
                name: 'Controladoria',
                description: 'Custos, centros de resultado e análises.',
                icon: 'analytics-outline',
                route: '/(tabs)/controladoria',
            },
        ];
    },
};
