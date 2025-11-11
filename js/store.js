// js/store.js

// ######################################################
// ARQUIVO 5: CAMADA DE DADOS (STORE)
// ######################################################
// Este arquivo é o único que fala com o Firebase Firestore.
// Ele não mexe no HTML. Apenas busca e envia dados.

import { db } from './firebase.js'; // Importa a conexão do arquivo 2
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    doc, 
    deleteDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/**
 * Configura os listeners em tempo real (onSnapshot) para todas as coleções.
 * @param {string} userId - O ID do usuário logado.
 * @param {function} onDataChangeCallback - A função no main.js a ser chamada sempre que os dados mudarem.
 * @returns {Array<function>} - Um array de funções 'unsubscribe' para parar os listeners.
 */
export function setupRealtimeListeners(userId, onDataChangeCallback) {
    if (!userId) return [];

    // Objeto de estado local que será enviado para o callback
    const dbState = { 
        eventos: [], clientes: [], contratos: [], fotografos: [], 
        financeiro: [], custos: [], colunas: []
    };
    
    const collections = ['eventos', 'clientes', 'contratos', 'fotografos', 'financeiro', 'custos', 'colunas', 'templates']; // <-- ADICIONE 'templates'
    let unsubscribeListeners = [];

    collections.forEach(col => {
        const collectionPath = `users/${userId}/${col}`;
        const unsub = onSnapshot(collection(db, collectionPath), (querySnapshot) => {
            
            // Atualiza a parte do estado correspondente a esta coleção
            dbState[col] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Aplica ordenação específica (lógica do seu código original)
            if (col === 'clientes') {
                dbState.clientes.sort((a, b) => a.nome.localeCompare(b.nome));
            }
            if (col === 'eventos') {
                 dbState.eventos.sort((a, b) => new Date(a.data) - new Date(b.data)); 
            }
            if (col === 'financeiro') {
                dbState.financeiro.sort((a, b) => new Date(b.data) - new Date(a.data));
            }
            if (col === 'colunas') {
                dbState.colunas.sort((a, b) => a.ordem - b.ordem);
            }
            
            // Envia o *estado completo* atualizado para o main.js
            onDataChangeCallback(dbState);
        });
        
        unsubscribeListeners.push(unsub);
    });

    return unsubscribeListeners;
}

/**
 * Adiciona um novo documento a uma coleção no Firestore.
 * @param {string} userId - O ID do usuário logado.
 * @param {string} collectionName - O nome da coleção (ex: 'clientes').
 * @param {object} data - O objeto de dados a ser salvo.
 */
export async function handleFormSubmit(userId, collectionName, data) {
    if (!userId) { 
        console.error("Usuário não autenticado."); 
        return; 
    }
    try {
        await addDoc(collection(db, `users/${userId}/${collectionName}`), data);
    } catch (error) { 
        console.error("Erro ao adicionar documento: ", error); 
        // Lança o erro para o main.js poder tratá-lo (ex: mostrar um alerta)
        throw new Error(`Falha ao salvar em ${collectionName}`);
    }
}

/**
 * Deleta um documento de uma coleção.
 * @param {string} userId - O ID do usuário logado.
 * @param {string} collectionName - O nome da coleção.
 * @param {string} id - O ID do documento a ser deletado.
 */
export async function deleteItem(userId, collectionName, id) {
    if (!userId) return;
    try {
        await deleteDoc(doc(db, `users/${userId}/${collectionName}/${id}`));
    } catch (error) { 
        console.error("Erro ao deletar documento: ", error); 
        throw new Error(`Falha ao deletar item de ${collectionName}`);
    }
}

/**
 * Atualiza o status (coluna) de um evento no Kanban.
 * @param {string} userId - O ID do usuário logado.
 * @param {string} eventoId - O ID do evento a ser movido.
 * @param {string} novaColunaId - O ID da nova coluna de destino.
 */
export async function updateEventoColuna(userId, eventoId, novaColunaId) {
    if (!userId || !eventoId || !novaColunaId) return;
    
    const docRef = doc(db, `users/${userId}/eventos/${eventoId}`);
    try {
        await updateDoc(docRef, {
            colunaId: novaColunaId
        });
    } catch (error) {
        console.error("Erro ao atualizar coluna do evento: ", error);
        throw new Error("Falha ao mover o card.");
    }
}

/**
 * Marca um item de entrega (previa, midia, album) como 'Entregue'.
 * @param {string} userId - O ID do usuário logado.
 * @param {string} eventId - O ID do evento.
 * @param {string} tipo - O tipo de entrega ('previa', 'midia', 'album').
 */
export async function marcarEntregue(userId, eventId, tipo) {
    if (!userId || !eventId || !tipo) return;
    
    const docRef = doc(db, `users/${userId}/eventos/${eventId}`);
    const statusField = `entrega_${tipo}_status`;
    const dataField = `entrega_${tipo}_data`;

    try {
        await updateDoc(docRef, {
            [statusField]: "Entregue",
            [dataField]: new Date().toISOString().split('T')[0] // Salva a data no formato YYYY-MM-DD
        });
    } catch (error) {
        console.error("Erro ao marcar como entregue: ", error);
        throw new Error("Falha ao atualizar status de entrega.");
    }
}

/**
 * Atualiza os dados de um contrato (usado pelo modal de edição).
 * @param {string} userId - O ID do usuário logado.
 * @param {string} contratoId - O ID do contrato a ser atualizado.
 * @param {object} dataToUpdate - Os campos a serem atualizados (status, link, formaPagamento).
 */
export async function updateContrato(userId, contratoId, dataToUpdate) {
    if (!userId || !contratoId) return;

    const docRef = doc(db, `users/${userId}/contratos/${contratoId}`);
    try {
        await updateDoc(docRef, dataToUpdate);
    } catch (error) {
        console.error("Erro ao atualizar contrato: ", error);
        throw new Error("Falha ao atualizar o contrato.");
    }

}
