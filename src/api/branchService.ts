// src/api/branchService.ts
import { api } from './axiosInstance';

export interface BranchDto {
    EnterpriseGroup: string;
    CompanyCode: string;
    UnitOfBusiness: string;
    ParentCode: string;
    Code: string;
    Description: string;
    Title: string;
    Cgc: string;
    City: string;
    State: string;
    Phone: string;
    // se quiser, adiciona o resto depois
}

export interface BranchListResponse {
    items: BranchDto[];
    hasNext?: boolean;
}

// troque aqui se o seu Protheus devolver em outro caminho
const BRANCH_ENDPOINT = '/api/framework/environment/v1/branches';

function normalizeBranch(b: BranchDto): BranchDto {

    return {
        ...b,
        Code: b.Code?.trim?.() ?? b.Code,
        Description: b.Description?.trim?.() ?? b.Description,
        City: b.City?.trim?.() ?? b.City,
        State: b.State?.trim?.() ?? b.State,
        EnterpriseGroup: b.EnterpriseGroup?.trim?.() ?? b.EnterpriseGroup,
        CompanyCode: b.CompanyCode?.trim?.() ?? b.CompanyCode,
    };
}

export const branchService = {
    /**
     * Lista filiais do Protheus.
     * Se o endpoint não tiver paginação, o Protheus simplesmente ignora o param.
     */
    async list(page = 1): Promise<BranchListResponse> {
        try {
            const res = await api.get(BRANCH_ENDPOINT, {
                params: { page },
            });

            const data = res.data as BranchListResponse;

            return {
                items: Array.isArray(data.items) ? data.items.map(normalizeBranch) : [],
                hasNext: data.hasNext ?? false,
            };
        } catch (error: any) {
            // mesmo comportamento do authService: deixa o erro subir
            console.error('Erro ao buscar filiais:', error?.message ?? error);
            throw error;
        }
    },

    /**
     * Buscar 1 filial específica (seu endpoint tiver suporte)
     * Ex.: /api/framework/v1/branches/{code}
     */
    async getByCode(code: string): Promise<BranchDto> {
        const res = await api.get(`${BRANCH_ENDPOINT}/${encodeURIComponent(code)}`);
        return normalizeBranch(res.data as BranchDto);
    },
};
