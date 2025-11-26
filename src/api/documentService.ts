// src/api/documentService.ts
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
    // ❌ ENDPOINT NÃO EXISTE NO PROTHEUS
    // A API do Protheus não tem endpoint para buscar documento por scrId
    // Use os dados que vêm nos params da navegação (documentNumber, documentTotal, etc)
    /*
    async getDocument(scrId: number) {
        // ❌ Este endpoint não existe:
        // GET /backofficeapprovals/api/com/approvals/v1/document/${scrId}
        throw new Error('Endpoint não implementado no Protheus');
    },
    */

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
        // ✅ CORRETO: usa scrId ao invés de documentNumber
        const url = `backofficeapprovals/api/com/approvals/v1/${documentType}/${scrId}/items`;

        console.log('='.repeat(80));
        console.log('📋 [documentService] INICIANDO BUSCA DE ITENS');
        console.log('='.repeat(80));
        console.log('📍 URL:', url);
        console.log('📍 Params:', { page, pageSize, itemGroup });
        console.log('📍 documentType:', documentType);
        console.log('📍 scrId:', scrId);

        // Pega o baseURL do axios
        const baseURL = api.defaults.baseURL;
        console.log('📍 Base URL:', baseURL);
        console.log('📍 URL Completa:', `${baseURL}/${url}`);

        // Pega os headers que serão enviados
        const headers = api.defaults.headers;
        console.log('📍 Headers:', JSON.stringify(headers, null, 2));
        console.log('='.repeat(80));

        try {
            const res = await api.get(url, {
                params: {
                    page,
                    pageSize,
                    itemGroup
                }
            });

            console.log('='.repeat(80));
            console.log('✅ [documentService] SUCESSO!');
            console.log('='.repeat(80));
            console.log('📦 Response Status:', res.status);
            console.log('📦 Response Data:', JSON.stringify(res.data, null, 2));
            console.log('='.repeat(80));

            return res.data;
        } catch (error: any) {
            console.log('='.repeat(80));
            console.error('❌ [documentService] ERRO AO BUSCAR ITENS');
            console.log('='.repeat(80));
            console.error('❌ URL:', url);
            console.error('❌ Params:', { page, pageSize, itemGroup });
            console.error('❌ Status:', error?.response?.status);
            console.error('❌ Status Text:', error?.response?.statusText);
            console.error('❌ Response Data:', JSON.stringify(error?.response?.data, null, 2));
            console.error('❌ Response Headers:', JSON.stringify(error?.response?.headers, null, 2));
            console.error('❌ Error Message:', error?.message);
            console.log('='.repeat(80));

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
        console.log('='.repeat(80));
        console.log('ℹ️ [documentService] BUSCANDO INFO ADICIONAL');
        console.log('='.repeat(80));
        console.log('📍 recordNumber:', recordNumber);
        console.log('📍 itemNumber:', itemNumber);
        console.log('📍 itemRecno:', itemRecno);
        console.log('📍 URL:', 'backofficeapprovals/api/com/approvals/v1/itemAdditionalInformation');
        console.log('📍 Params:', { recordNumber, itemNumber, itemRecno });
        console.log('='.repeat(80));

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

            console.log('📦 Response ==:', res);
            console.log('='.repeat(80));
            console.log('✅ [documentService] INFO ADICIONAL SUCESSO');
            console.log('='.repeat(80));
            console.log('📦 Response Status:', res.status);
            console.log('📦 Response Data:', JSON.stringify(res.data, null, 2));
            console.log('='.repeat(80));

            return res.data;
        } catch (error: any) {
            console.log('='.repeat(80));
            console.error('❌ [documentService] ERRO AO BUSCAR INFO ADICIONAL');
            console.log('='.repeat(80));
            console.error('❌ recordNumber:', recordNumber);
            console.error('❌ itemNumber:', itemNumber);
            console.error('❌ itemRecno:', itemRecno);
            console.error('❌ Status:', error?.response?.status);
            console.error('❌ Status Text:', error?.response?.statusText);
            console.error('❌ Response Data:', JSON.stringify(error?.response?.data, null, 2));
            console.error('❌ Error Message:', error?.message);
            console.log('='.repeat(80));

            throw error;
        }
    },

    /**
     * Busca histórico de um item
     */
    async getItemHistory(productCode: string, page = 1, pageSize = 30) {
        console.log('📜 [documentService] Buscando histórico do item:', { productCode, page, pageSize });

        try {
            const res = await api.get(
                'backofficeapprovals/api/com/approvals/v1/historybyitem',
                { params: { productCode, page, pageSize } }
            );

            console.log('✅ [documentService] Histórico carregado:', res.data);
            return res.data;
        } catch (error: any) {
            console.error('❌ [documentService] Erro ao buscar histórico:', error);
            throw error;
        }
    },

    /**
     * Busca histórico de aprovações do documento
     */
    async getApprovalHistory(documentNumber: string) {
        console.log('📜 [documentService] Buscando histórico de aprovações:', documentNumber);

        try {
            const res = await api.get(
                `/backofficeapprovals/api/com/approvals/v1/getHistByDoc/${documentNumber}`
            );

            console.log('✅ [documentService] Histórico de aprovações carregado');
            return res.data;
        } catch (error: any) {
            console.error('❌ [documentService] Erro ao buscar histórico:', error);
            throw error;
        }
    },

    /**
     * Busca anexos do documento
     */
    async getAttachments(scrId: number, page = 1, pageSize = 10) {
        console.log('📎 [documentService] Buscando anexos:', scrId);

        try {
            const res = await api.get(
                `/backofficeapprovals/api/com/approvals/v1/listAttachments/${scrId}`,
                { params: { page, pageSize } }
            );

            console.log('✅ [documentService] Anexos carregados');
            return res.data;
        } catch (error: any) {
            console.error('❌ [documentService] Erro ao buscar anexos:', error);
            throw error;
        }
    },

    /**
     * Busca rateio de SC
     */
    async getApportionmentPurchaseRequest(documentNumber: string, page = 1, pageSize = 10) {
        console.log('💰 [documentService] Buscando rateio SC:', documentNumber);

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

            console.log('✅ [documentService] Rateio SC carregado');
            return res.data;
        } catch (error: any) {
            console.error('❌ [documentService] Erro ao buscar rateio SC:', error);
            throw error;
        }
    },

    /**
     * Busca rateio de PC
     */
    async getApportionmentPurchaseOrder(documentNumber: string, page = 1, pageSize = 10) {
        console.log('💰 [documentService] Buscando rateio PC:', documentNumber);

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

            console.log('✅ [documentService] Rateio PC carregado');
            return res.data;
        } catch (error: any) {
            console.error('❌ [documentService] Erro ao buscar rateio PC:', error);
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
        console.log('✅/❌ [documentService] Confirmando aprovação:', { documentType, approvals });

        try {
            const body = { approvals };

            const res = await api.put(
                `/backofficeapprovals/api/com/approvals/v1/batchApprovals/${documentType}`,
                body
            );

            console.log('✅ [documentService] Aprovação confirmada');
            return res.data;
        } catch (error: any) {
            console.error('❌ [documentService] Erro ao confirmar aprovação:', error);
            throw error;
        }
    },
};