// src/api/documentService.ts - VERSÃO CORRIGIDA DOS ANEXOS
import { api } from './axiosInstance';

// 📝 Interfaces para Purchase Request (SC)
export interface PurchaseRequestItem {
    requestNumber: string;
    requestItem: string;
    itemProduct: string;
    unitMeasurement: string;
    quantity: number;
    costCenter: string;
    itemTotal: number;
    unitValue: number;
    currency: string;
    sc1Id: number;
    groupAprov: string;
    itemGroup: string;
    itemSkuDescription: string;
}

// 📝 Interfaces para Purchase Order (PC, IP, AE)
export interface PurchaseOrderItem {
    purchaseOrderNumber: string;
    purchaseOrderItem: string;
    costCenter: string;
    quantity: number;
    itemTotal: number;
    unitValue: number;
    itemSku: string;
    unitMeasurement: string;
    itemSkuDescription: string;
    currency: string;
    groupAprov: string;
    itemGroup: string;
}

// 📝 Interface genérica (deprecated - use as específicas acima)
export interface DocumentItem {
    requestItem?: string;
    itemSkuDescription?: string;
    itemProduct?: string;
    unitMeasurement?: string;
    costCenter?: string;
    quantity?: number;
    currency?: string;
    itemTotal?: number;
}

// 📝 Resposta da API para Purchase Request
export interface PurchaseRequestItemsResponse {
    records: PurchaseRequestItem[];
    hasNext: boolean;
}

// 📝 Resposta da API para Purchase Order
export interface PurchaseOrderItemsResponse {
    purchaseOrderItems: PurchaseOrderItem[];
    hasNext: boolean;
}

// 📝 União de todas as respostas possíveis
export type DocumentItemsResponse =
    | PurchaseRequestItemsResponse
    | PurchaseOrderItemsResponse;

export interface ApprovalAction {
    branch: string;
    documents: Array<{
        documentId: string;
        itemGroup: string;
        justification: string;
        toApprove: boolean;
        scrId: number;
    }>;
}

export const documentService = {
    /**
     * Busca itens de um documento
     * @param documentType - Tipo do endpoint: 'purchaserequest', 'purchaseorder', etc
     * @param scrId - ID do documento (scrId, NÃO o documentNumber!)
     * @param page - Página (padrão: 1)
     * @param pageSize - Tamanho da página (padrão: 10)
     * @param itemGroup - Grupo do item (opcional, padrão: '')
     */
    async getDocumentItems(
        documentType: string,
        scrId: string | number,
        page = 1,
        pageSize = 10,
        itemGroup = ''
    ): Promise<any> {
        const url = `backofficeapprovals/api/com/approvals/v1/${documentType}/${scrId}/items`;

        try {
            const res = await api.get(url, {
                params: {
                    page,
                    pageSize,
                    itemGroup
                }
            });
            return res.data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Busca informações adicionais de um item
     */
    async getItemAdditionalInfo(
        recordNumber: string,
        itemNumber: string,
        itemRecno: number
    ) {

        try {
            const res = await api.get(
                'backofficeapprovals/api/com/approvals/v1/itemAdditionalInformation',
                {
                    params: {
                        recordNumber,
                        itemNumber,
                        itemRecno,
                    },
                }
            );

            return res.data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Busca histórico de um item
     */
    async getItemHistory(productCode: string, page = 1, pageSize = 30) {

        try {
            const res = await api.get(
                'backofficeapprovals/api/com/approvals/v1/historybyitem',
                { params: { productCode, page, pageSize } }
            );

            return res.data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Busca histórico de aprovações do documento
     */
    async getApprovalHistory(documentNumber: string) {

        try {
            const res = await api.get(
                `/backofficeapprovals/api/com/approvals/v1/getHistByDoc/${documentNumber}`
            );

            return res.data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * 📎 LISTA os anexos do documento
     * Endpoint: /backofficeapprovals/api/com/approvals/v1/listAttachments/{scrId}
     * Usa: scrId (RECNO do documento) - ex: 769
     */
    async getAttachments(scrId: number, page = 1, pageSize = 10) {
        // ✅ ENDPOINT CORRETO: /listAttachments/{scrId}
        const url = `/backofficeapprovals/api/com/approvals/v1/listAttachments/${scrId}`;

        try {
            const res = await api.get(url, {
                params: { page, pageSize }
            });

            return res.data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * 💾 BAIXA o arquivo do anexo (retorna base64)
     * Endpoint: /backofficeapprovals/api/com/approvals/v1/attachments/{objectCode}
     * Usa: objectCode (código do anexo) - ex: "0000000173"
     */
    async getAttachmentFile(objectCode: string | number) {
        // ✅ ENDPOINT CORRETO: /attachments/{objectCode}
        // Adiciona barra no final conforme log: .../0000000173/
        const url = `/backofficeapprovals/api/com/approvals/v1/attachments/${objectCode}/`;

        try {
            const res = await api.get(url, {
                params: {
                    page: 1,
                    pageSize: 10,
                }
            });

            return res.data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Busca rateio de SC
     */
    async getApportionmentPurchaseRequest(documentNumber: string, page = 1, pageSize = 10) {

        try {
            const tables = 'SCX,CTT,SC1';
            const fields = [
                'cx_solicit', 'cx_itemsol', 'cx_item', 'cx_perc',
                'cx_cc', 'cx_conta', 'cx_itemcta', 'cx_clvl',
                'cx_ec05db', 'cx_ec05cr', 'cx_ec06db', 'cx_ec06cr',
                'cx_ec07db', 'cx_ec07cr', 'cx_ec08db', 'cx_ec08cr',
                'cx_ec09db', 'cx_ec09cr',
                'ctt_desc01', 'c1_descri',
            ].join(',');

            const where =
                `SCX.D_E_L_E_T_=' ' AND CTT.D_E_L_E_T_=' ' AND SC1.D_E_L_E_T_=' ' ` +
                `AND CTT.CTT_CUSTO = SCX.CX_CC ` +
                `AND CTT.CTT_FILIAL = SCX.CX_FILIAL ` +
                `AND SC1.C1_NUM = SCX.CX_SOLICIT ` +
                `AND SC1.C1_ITEM = SCX.CX_ITEMSOL ` +
                `AND SC1.C1_FILIAL = SCX.CX_FILIAL ` +
                `AND SCX.CX_SOLICIT LIKE '%${documentNumber}%'`;

            const res = await api.get('/api/framework/v1/genericQuery', {
                params: {
                    tables,
                    fields,
                    where,
                    page,
                    pagesize: pageSize,
                    filialFilter: true,
                    deletedFilter: true,
                },
            });

            return res.data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Busca rateio de PC
     */
    async getApportionmentPurchaseOrder(documentNumber: string, page = 1, pageSize = 10) {

        try {
            const tables = 'SCH,CTT,SC7';
            const fields = [
                'ch_pedido', 'ch_itempd', 'ch_item', 'ch_perc',
                'ch_cc', 'ch_conta', 'ch_itemcta', 'ch_clvl',
                'ch_ec05db', 'ch_ec05cr', 'ch_ec06db', 'ch_ec06cr',
                'ch_ec07db', 'ch_ec07cr', 'ch_ec08db', 'ch_ec08cr',
                'ch_ec09db', 'ch_ec09cr',
                'ctt_desc01', 'c7_descri',
            ].join(',');

            const where =
                `SCH.D_E_L_E_T_=' ' AND CTT.D_E_L_E_T_=' ' AND SC7.D_E_L_E_T_=' ' ` +
                `AND CTT.CTT_CUSTO = SCH.CH_CC ` +
                `AND CTT.CTT_FILIAL = SCH.CH_FILIAL ` +
                `AND SC7.C7_NUM = SCH.CH_PEDIDO ` +
                `AND SC7.C7_ITEM = SCH.CH_ITEMPD ` +
                `AND SC7.C7_FILIAL = SCH.CH_FILIAL ` +
                `AND SCH.CH_PEDIDO LIKE '%${documentNumber}%'`;

            const res = await api.get('/api/framework/v1/genericQuery', {
                params: {
                    tables,
                    fields,
                    where,
                    page,
                    pagesize: pageSize,
                    filialFilter: true,
                    deletedFilter: true,
                },
            });

            return res.data;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Aprova ou reprova um documento
     */
    async confirmApproval(
        documentType: string,
        approvals: ApprovalAction[]
    ) {

        try {
            const body = { approvals };

            const res = await api.put(
                `/backofficeapprovals/api/com/approvals/v1/batchApprovals/${documentType}`,
                body
            );


            return res.data;
        } catch (error: any) {
            throw error;
        }
    },
};