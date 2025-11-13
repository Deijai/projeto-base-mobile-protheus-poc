// src/utils/debugStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Mostra o conteúdo do AsyncStorage.
 * Se for passado um key, mostra apenas ela.
 */
export async function debugStorage(key?: string) {
    if (key) {
        const value = await AsyncStorage.getItem(key);
        console.log(`🔎 ${key}:`, JSON.parse(value ?? 'null'));
    } else {
        const keys = await AsyncStorage.getAllKeys();
        const entries = await AsyncStorage.multiGet(keys);
        //console.log('📦 STORAGE:');
        entries.forEach(([k, v]) => console.log(k, JSON.parse(v ?? 'null')));
    }
}

/**
 * Limpa completamente o AsyncStorage.
 * (use com cuidado!)W
 */
export async function clearStorage() {
    try {
        await AsyncStorage.clear();
        console.log('🧹 AsyncStorage limpo com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao limpar AsyncStorage:', error);
    }
}
