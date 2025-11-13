// src/utils/docLabels.ts
export function getDocumentTypeLabel(docType?: string) {
    const t = (docType || '').trim().toUpperCase();

    switch (t) {
        case 'SC':
            return 'Solicitação de Compra';
        case 'PC':
            return 'Pedido de Compra';
        case 'IP':
            return 'Pedido (Item)';
        case 'AE':
            return 'Autorização de Entrega';
        default:
            return docType || 'Documento';
    }
}
