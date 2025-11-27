// src/store/branchStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BranchDto, branchService } from '../api/branchService';

type BranchState = {
    branches: BranchDto[];
    selectedBranch: BranchDto | null;
    loading: boolean;
    error: string | null;
    hasNext: boolean;
    page: number;
    fetchBranches: (reset?: boolean) => Promise<void>;
    selectBranch: (branch: BranchDto) => void;
    clear: () => void;
};

export const useBranchStore = create<BranchState>()(
    persist(
        (set, get) => ({
            branches: [],
            selectedBranch: null,
            loading: false,
            error: null,
            hasNext: false,
            page: 1,

            async fetchBranches(reset = false) {
                const { loading, hasNext, page, branches } = get();

                console.log('[BRANCH STORE] fetchBranches chamado. reset =', reset);
                console.log('[BRANCH STORE] estado atual:', {
                    loading,
                    hasNext,
                    page,
                    branchesCount: branches.length,
                });

                // evita requisição duplicada
                if (loading) {
                    console.log('[BRANCH STORE] abortando: já está loading');
                    return;
                }

                // se não for reset e já sabemos que não tem próxima página
                if (!reset && !hasNext && branches.length > 0) {
                    console.log('[BRANCH STORE] abortando: !reset, !hasNext e já tem branches');
                    return;
                }

                try {
                    set({ loading: true, error: null });
                    console.log('[BRANCH STORE] loading = true');

                    const nextPage = reset ? 1 : page + 1;
                    console.log('[BRANCH STORE] buscando página', nextPage);

                    const res = await branchService.list(nextPage);

                    console.log('[BRANCH STORE] resposta branchService.list:', {
                        items: res.items?.length,
                        hasNext: res.hasNext,
                    });

                    if (reset) {
                        set({
                            branches: res.items,
                            hasNext: res.hasNext ?? false,
                            page: 1,
                        });
                    } else {
                        set({
                            branches: [...branches, ...res.items],
                            hasNext: res.hasNext ?? false,
                            page: nextPage,
                        });
                    }
                } catch (err: any) {
                    console.log('[BRANCH STORE] ERRO em fetchBranches:', err);
                    set({
                        error: err?.message ?? 'Erro ao carregar filiais',
                    });
                } finally {
                    console.log('[BRANCH STORE] finalizando, loading = false');
                    set({ loading: false });
                }
            },

            selectBranch(branch) {
                console.log('[BRANCH STORE] selecionando filial', {
                    code: branch.Code,
                    description: branch.Description,
                });
                set({ selectedBranch: branch });
            },

            clear() {
                console.log('[BRANCH STORE] clear chamado');
                set({
                    branches: [],
                    selectedBranch: null,
                    hasNext: false,
                    page: 1,
                    error: null,
                    loading: false,
                });
            },
        }),
        {
            name: 'branch-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
