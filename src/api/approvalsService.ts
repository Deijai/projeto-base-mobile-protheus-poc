import { api } from './axiosInstance';

export interface ApprovalDocument {
    documentBranch: string;
    documentNumber: string;
    documentTotal: number;
    documentExchangeValue: number;
    documentType: string;
    documentUserName: string;
    documentGroupAprov: string;
    documentItemGroup: string;
    documentStatus: string;
    documentCurrency: number;
    documentExchangeRate: number;
    documentSymbol: string;
    documentStrongSymbol: string;
    documentCreated: string;
    scrId: number;
    purchaseRequest?: any[];
    purchaseOrder?: any[];
    contracts?: any[];
    measurements?: any[];
    warehouseRequest?: any[];
}

export interface ApprovalsListResponse {
    documents: ApprovalDocument[];
    hasNext: boolean;
}

export const approvalsService = {
    async list({
        page = 1,
        documentType,
        documentStatus,
        initDate,
        endDate,
        searchkey,
        documentBranch,
    }: {
        page?: number;
        documentType: string;
        documentStatus: string;
        initDate?: string;
        endDate?: string;
        searchkey?: string;
        documentBranch?: string;
    }): Promise<ApprovalsListResponse> {
        const res = await api.get('backofficeapprovals/api/com/approvals/v1/approvalsList', {
            params: {
                page,
                documentType,
                documentStatus,
                initDate,
                endDate,
                searchkey,
                documentBranch,
            },
        });

        console.log('Approvals list response:', res);

        return res.data as ApprovalsListResponse;
    },

    async batchApprove(documentType: string, payload: any) {
        const res = await api.post(`/api/com/approvals/v1/batchApprovals/${documentType}`, payload);
        return res.data;
    },
};
