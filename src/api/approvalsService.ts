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
        const params: any = {
            page,
            documentType,
            documentStatus,
        };

        if (initDate) params.initDate = initDate;
        if (endDate) params.endDate = endDate;
        if (searchkey) params.searchkey = searchkey;
        if (documentBranch) params.documentBranch = documentBranch;

        const res = await api.get('backofficeapprovals/api/com/approvals/v1/approvalsList', {
            params,
        });

        return res.data as ApprovalsListResponse;
    },

    // src/api/approvalsService.ts
    async batchApprove(documentType: string, payload: any) {
        const docTypePath = (documentType || '').trim().toUpperCase();
        const url = `backofficeapprovals/api/com/approvals/v1/batchApprovals/${docTypePath}`;
        const res = await api.put(url, payload);
        return res.data;
    },

};
