// src/store/approvalsStore.ts
import { ApprovalDocument, approvalsService } from '@/src/api/approvalsService';
import { create } from 'zustand';

type FetchParams = {
    documentType?: string;
    documentStatus?: string;
    branches?: string[]; // vou converter pra string na hora da chamada
    initDate?: string;
    endDate?: string;
    searchkey?: string;
};

type ApprovalsState = {
    documents: ApprovalDocument[];
    loading: boolean;
    error: string | null;
    page: number;
    hasNext: boolean;
    lastFilters: FetchParams | null;
    selectedDocs: ApprovalDocument[];

    fetchDocuments: (filters: FetchParams, reset?: boolean) => Promise<void>;
    toggleSelect: (doc: ApprovalDocument) => void;
    clearSelection: () => void;
    batchProcess: (params: {
        action: 'approve' | 'reject';
        justification?: string;
        documents: ApprovalDocument[];
    }) => Promise<void>;
};

export const useApprovalsStore = create<ApprovalsState>((set, get) => ({
    documents: [],
    loading: false,
    error: null,
    page: 1,
    hasNext: false,
    lastFilters: null,
    selectedDocs: [],

    async fetchDocuments(filters, reset = false) {
        const { loading, page, documents } = get();
        if (loading) return;

        set({ loading: true, error: null });

        try {
            const nextPage = reset ? 1 : page + 1;

            // 🔁 converte branches[] -> string pro backend
            const documentBranch = Array.isArray(filters.branches)
                ? filters.branches.join(',')
                : filters.branches as any;

            const res = await approvalsService.list({
                page: nextPage,
                documentType: filters.documentType as any,
                documentStatus: filters.documentStatus as any,
                initDate: filters.initDate,
                endDate: filters.endDate,
                searchkey: filters.searchkey,
                documentBranch,
            });


            const items = Array.isArray(res.documents) ? res.documents : [];
            const hasNext = !!res.hasNext;

            if (reset) {
                set({
                    documents: items,
                    page: 1,
                    hasNext,
                    lastFilters: filters,
                });
            } else {
                set({
                    documents: [...documents, ...items],
                    page: nextPage,
                    hasNext,
                    lastFilters: filters,
                });
            }
        } catch (err: any) {
            set({ error: err?.message ?? 'Erro ao carregar documentos' });
        } finally {
            set({ loading: false });
        }
    },

    toggleSelect(doc) {
        const { selectedDocs } = get();
        const exists = selectedDocs.some((d) => d.scrId === doc.scrId);
        if (exists) {
            set({
                selectedDocs: selectedDocs.filter((d) => d.scrId !== doc.scrId),
            });
        } else {
            set({
                selectedDocs: [...selectedDocs, doc],
            });
        }
    },

    batchProcess: async ({
        action,
        justification = '',
        documents,
    }: {
        action: 'approve' | 'reject';
        justification?: string;
        documents: ApprovalDocument[];
    }) => {
        const { lastFilters, toggleSelect, fetchDocuments } = get();

        const toApprove = action === 'approve';

        // Agrupa: tipo → branch → docs[]
        const grouped: Record<string, Record<string, any[]>> = {};

        documents.forEach((doc) => {
            const type = (doc.documentType || '').trim().toUpperCase(); // SC, PC, IP...
            const branch = doc.documentBranch;                          // mantém como veio ("D MG 01 ")

            if (!grouped[type]) grouped[type] = {};
            if (!grouped[type][branch]) grouped[type][branch] = [];

            grouped[type][branch].push({
                documentId: doc.documentNumber,
                itemGroup: doc.documentItemGroup || '',
                justification,
                toApprove,
                scrId: doc.scrId,
            });
        });

        try {
            // Chamada por tipo de documento
            for (const [type, branches] of Object.entries(grouped)) {
                // 👇 aqui vira exatamente o formato que o backend espera
                const payload = {
                    approvals: Object.entries(branches).map(([branch, docs]) => ({
                        branch,
                        documents: docs,
                    })),
                };

                console.log('Enviando batchApprove:', type, JSON.stringify(payload, null, 2));

                await approvalsService.batchApprove(type, payload);
            }

            // limpar docs selecionados
            documents.forEach((d) => toggleSelect(d));

            // recarregar usando os últimos filtros usados
            if (lastFilters) {
                await fetchDocuments(lastFilters, true);
            }
        } catch (err) {
            console.error('Erro no batchProcess:', err);
            throw err;
        }
    },



    clearSelection() {
        set({ selectedDocs: [] });
    },
}));
