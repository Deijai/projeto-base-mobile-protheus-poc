// src/store/documentDetailStore.ts
import { create } from 'zustand';
import {
    documentService,
    PurchaseOrderItem,
    PurchaseRequestItem
} from '../api/documentService';

// 📦 União de todos os tipos de item
export type DocumentItem = PurchaseOrderItem | PurchaseRequestItem;

// 🎯 State do Store
type DocumentDetailState = {
    // Dados do documento atual
    currentDocument: {
        scrId: number | null;
        documentType: string | null;
        documentNumber: string | null;
    };

    // Itens carregados
    items: DocumentItem[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;

    // Paginação
    page: number;
    hasNext: boolean;

    // 📥 Ações
    setCurrentDocument: (scrId: number, documentType: string, documentNumber: string) => void;
    fetchItems: (
        documentType: string,
        scrId: number | string, // ✅ MUDADO: agora recebe scrId
        reset?: boolean
    ) => Promise<void>;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
    clear: () => void;
};

export const useDocumentDetailStore = create<DocumentDetailState>((set, get) => ({
    // 🔹 Estado inicial
    currentDocument: {
        scrId: null,
        documentType: null,
        documentNumber: null,
    },
    items: [],
    loading: false,
    refreshing: false,
    error: null,
    page: 1,
    hasNext: false,

    // 📌 Setar documento atual
    setCurrentDocument: (scrId, documentType, documentNumber) => {
        console.log('📌 [DocumentDetailStore] Setando documento:', {
            scrId,
            documentType,
            documentNumber,
        });
        set({
            currentDocument: { scrId, documentType, documentNumber },
        });
    },

    // 📥 Buscar itens
    fetchItems: async (documentType, scrId, reset = false) => {
        const { loading, page, items, currentDocument } = get();

        // Evita chamadas duplicadas
        if (loading) {
            console.log('⚠️ [DocumentDetailStore] Já está carregando, ignorando...');
            return;
        }

        const nextPage = reset ? 1 : page;

        console.log('📥 [DocumentDetailStore] Buscando itens:', {
            documentType,
            scrId, // ✅ MUDADO: agora loga scrId
            page: nextPage,
            reset,
        });

        try {
            set({ loading: true, error: null });

            // 🎯 Determina o endpoint correto baseado no tipo
            let apiType = '';
            switch (documentType.toUpperCase()) {
                case 'SC':
                    apiType = 'purchaserequest';
                    break;
                case 'PC':
                case 'IP':
                case 'AE':
                    apiType = 'purchaseorder';
                    break;
                case 'SA':
                    apiType = 'warehouserequest';
                    break;
                case 'CT':
                    apiType = 'contracts';
                    break;
                case 'MD':
                    apiType = 'contractmeasurement';
                    break;
                default:
                    throw new Error(`Tipo de documento não suportado: ${documentType}`);
            }

            console.log('🔍 [DocumentDetailStore] Usando endpoint:', apiType);
            console.log('🔍 [DocumentDetailStore] URL será:', `backofficeapprovals/api/com/approvals/v1/${apiType}/${scrId}/items`);
            console.log('scrId value:', scrId);

            // 📡 Chamada da API (com itemGroup vazio e scrId)
            const response = await documentService.getDocumentItems(
                apiType,
                scrId, // ✅ MUDADO: passa scrId ao invés de documentNumber
                nextPage,
                10,
                '' // itemGroup vazio
            );

            console.log('✅ [DocumentDetailStore] Resposta da API:', response);

            // 🔹 Normaliza a resposta baseado no tipo
            let newItems: DocumentItem[] = [];

            // PC, IP, AE → purchaseOrderItems
            if (response.purchaseOrderItems) {
                newItems = response.purchaseOrderItems;
            }
            // SC e outros → records
            else if (response.records) {
                newItems = response.records;
            }

            console.log('📦 [DocumentDetailStore] Itens processados:', newItems.length);

            if (reset) {
                set({
                    items: newItems,
                    page: 1,
                    hasNext: response.hasNext ?? false,
                });
            } else {
                set({
                    items: [...items, ...newItems],
                    page: nextPage,
                    hasNext: response.hasNext ?? false,
                });
            }
        } catch (err: any) {
            console.error('❌ [DocumentDetailStore] Erro ao buscar itens:', err);
            set({
                error: err?.message ?? 'Erro ao carregar itens',
            });
        } finally {
            set({ loading: false });
        }
    },

    // ⬇️ Carregar mais itens (infinite scroll)
    loadMore: async () => {
        const { hasNext, loading, currentDocument, page } = get();

        if (!hasNext || loading) {
            console.log('⚠️ [DocumentDetailStore] Não pode carregar mais:', {
                hasNext,
                loading,
            });
            return;
        }

        if (!currentDocument.documentNumber || !currentDocument.documentType) {
            console.error('❌ [DocumentDetailStore] Documento não definido');
            return;
        }

        console.log('⬇️ [DocumentDetailStore] Carregando mais itens (página', page + 1, ')');

        set({ page: page + 1 });
        await get().fetchItems(
            currentDocument.documentType,
            currentDocument.documentNumber,
            false
        );
    },

    // 🔄 Refresh (pull to refresh)
    refresh: async () => {
        const { currentDocument } = get();

        if (!currentDocument.scrId || !currentDocument.scrId) {
            console.error('❌ [DocumentDetailStore] Documento não definido');
            return;
        }

        console.log('🔄 [DocumentDetailStore] Refresh - resetando lista');

        set({ refreshing: true });
        await get().fetchItems(
            currentDocument.scrId.toString(),
            currentDocument.scrId!,
            true
        );
        set({ refreshing: false });
    },

    // 🧹 Limpar estado
    clear: () => {
        console.log('🧹 [DocumentDetailStore] Limpando estado');
        set({
            currentDocument: {
                scrId: null,
                documentType: null,
                documentNumber: null,
            },
            items: [],
            loading: false,
            refreshing: false,
            error: null,
            page: 1,
            hasNext: false,
        });
    },
}));