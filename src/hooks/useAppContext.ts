// src/hooks/useAppContext.ts
import { useAuthStore } from '../store/authStore';
import { useBranchStore } from '../store/branchStore';
import { useModuleStore } from '../store/moduleStore';

export function useAppContext() {
    const { user, isAuthenticated } = useAuthStore();
    const { selectedBranch } = useBranchStore();
    const { selectedModule } = useModuleStore();

    return {
        user,
        isAuthenticated,
        selectedBranch,
        selectedModule,
    };
}
