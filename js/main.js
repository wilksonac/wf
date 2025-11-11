// js/main.js

// ######################################################
// ARQUIVO 7: O CÉREBRO MESTRE (main.js) - VERSÃO CORRIGIDA
// ######################################################
// Este arquivo conecta todos os módulos.

// --- 1. IMPORTA OS "ESPECIALISTAS" ---
import { setupAuthListeners } from './auth.js';
import * as store from './store.js'; // Importa *tudo* do store.js como um objeto
import * as ui from './ui.js';       // Importa *tudo* do ui.js como um objeto
import { initGeradorListeners } from './geradorContrato.js';
import { initDragAndDrop } from './kanban.js'; 

// --- 2. DEFINE O ESTADO GLOBAL DA APLICAÇÃO ---
let userId = null;
let dbState = { 
    eventos: [], clientes: [], contratos: [], fotografos: [], 
    financeiro: [], custos: [], colunas: [], templates: [], pacotes: [] // Adicionado 'templates'
};
let unsubscribeListeners = []; // Array para guardar as funções 'unsubscribe' do Firestore
let calendarioData = new Date(); // Controla o mês/ano do calendário
let selectedEventIdForEntrega = null; // Controla qual evento está selecionado na tela de Entregas


// --- 3. DEFINE AS FUNÇÕES DE CALLBACK PRINCIPAIS ---

/**
 * Chamada pelo store.js (via onSnapshot) sempre que os dados no Firebase mudam.
 * @param {object} newState - O objeto dbState completo vindo do store.js
 */
function onDataChange(newState) {
    console.log("Dados recebidos do Firestore:", newState);
    dbState = newState; // Atualiza o estado global
    
    // Chama todas as funções de renderização do ui.js para redesenhar a tela
    ui.updateDashboard(dbState);
    ui.renderKanban(dbState);
    ui.renderClientes(dbState);
    ui.renderContratos(dbState);
    ui.renderFotografos(dbState);
    ui.renderFinanceiro(dbState);
    ui.renderCustos(dbState);
    ui.renderCalendario(calendarioData, dbState);
    
    // Atualiza os selects
    ui.populateEventoClienteSelect(dbState);
    ui.populateEventoSelect(dbState);
    ui.populateCustoFotografoSelect(dbState);
    ui.populateContratoClienteSelect(dbState);
    ui.populateEntregaEventoSelect(dbState, selectedEventIdForEntrega);
    
    // Atualiza a visão de Entregas (atrasos ou evento específico)
    if (selectedEventIdForEntrega) {
        const evento = dbState.eventos.find(e => e.id === selectedEventIdForEntrega);
        ui.renderEntregaCards(evento, dbState);
    } else {
        ui.renderEntregasAtrasadas(dbState);
    }
    
    // Atualiza a visão de Contas a Receber e Gráfico (Fase 2 e 3)
    if (!document.getElementById('section-financeiro').classList.contains('hidden')) {
        ui.renderContasAReceber(dbState);
        ui.renderFluxoDeCaixaChart(dbState);
    }

    // Atualiza a lista de Templates
    ui.renderTemplates(dbState);

    // Reativa os ícones do Lucide (essencial após re-renderizar)
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/**
 * Chamada pelo auth.js quando o usuário faz login.
 * @param {object} user - O objeto do usuário vindo do Firebase Auth
 */
function onLogin(user) {
    userId = user.uid;
    document.getElementById('login-overlay').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('flex');
    document.getElementById('auth-status').innerText = user.email;

    // Dispara os listeners do banco de dados (store.js)
    unsubscribeListeners = store.setupRealtimeListeners(userId, onDataChange);
}

/**
 * Chamada pelo auth.js quando o usuário faz logout.
 */
function onLogout() {
    userId = null;
    document.getElementById('login-overlay').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('flex');
    document.getElementById('auth-status').innerText = "Desconectado";
    
    // Para todos os listeners do Firestore para economizar recursos
    unsubscribeListeners.forEach(unsub => unsub());
    unsubscribeListeners = [];
    
    // Limpa o estado e re-renderiza a tela (vazia)
    dbState = { eventos: [], clientes: [], contratos: [], fotografos: [], financeiro: [], custos: [], colunas: [], templates: [], pacotes: [] }; // Adicionado 'templates'
    onDataChange(dbState); 
}


// --- 4. PONTO DE ENTRADA (Quando a página carrega) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Inicia os "especialistas"
    setupAuthListeners(onLogin, onLogout);
    initGeradorListeners(); // Esta função agora SÓ ativa os listeners
    initDragAndDrop(); 
    
    // --- IMPORTANTE: recria o objeto 'window.app' ---
    // O seu HTML usa onclick="window.app.funcao()".
    // Este objeto faz a "ponte" entre o HTML e nossos módulos JS.
    window.app = {
        // Funções de Navegação e Modais (chamam a UI)
        showSection: (sectionId) => ui.showSection(sectionId, dbState, calendarioData),
        openDossieModal: (contratoId) => ui.openDossieModal(contratoId, dbState),
        openDossieModalFromEvento: (eventoId) => {
            const contrato = dbState.contratos.find(c => c.eventoId === eventoId);
            if (contrato) {
                ui.openDossieModal(contrato.id, dbState);
            } else {
                alert('Nenhum contrato encontrado para este evento. Crie um contrato na seção "Contratos".');
            }
        },
        closeDossieModal: ui.closeDossieModal,
        openAddPaymentModal: ui.openAddPaymentModal,
        openEditContratoModal: (contratoId) => ui.openEditContratoModal(contratoId, dbState),
        abrirGerador: (contratoId) => ui.abrirGerador(contratoId, dbState),
        abrirNovoEventoDoCalendario: ui.abrirNovoEventoDoCalendario,
        viewEntregaFromAtraso: (eventId) => {
            selectedEventIdForEntrega = eventId;
            ui.viewEntregaFromAtraso(eventId, dbState);
        },

        // Funções do Editor de Template
        editTemplate: (templateId) => {
            if (!templateId) return;
            const template = dbState.templates.find(t => t.id === templateId);
            if (template) {
                ui.populateTemplateForm(template);
            }
        },
        clearTemplateForm: () => {
            ui.clearTemplateForm();
        },

        // ######################
        // AQUI ESTAVA O ERRO (vírgula adicionada em clearTemplateForm)
        // ######################
        
        // "Função-Ponte" para o Gerador
        getDbState: () => {
            return dbState; // Expõe o estado atual para o gerador
        },

        // Funções de Ação (chamam o Store)
        deleteItem: (collectionName, id) => {
            if (!userId) return;
            
            let message = `Tem certeza que deseja excluir este item?`;
            
            if (collectionName === 'clientes' || collectionName === 'eventos') {
                message += `\nNenhum contrato, evento ou pagamento associado será excluído.`;
            } else if (collectionName === 'contratos') {
                message += `\n\nATENÇÃO: Isso NÃO excluirá os pagamentos já feitos (no Histórico de Pagamentos).`;
            } else if (collectionName === 'financeiro') {
                message = `Tem certeza que deseja excluir este PAGAMENTO? Esta ação não pode ser desfeita.`;
            }
            
            if (confirm(message)) {
                // CORREÇÃO: Chama 'deleteSingleItem' para exclusões simples
                store.deleteSingleItem(userId, collectionName, id)
                    .catch(e => alert(e.message)); // Mostra erro se falhar
            }
        },
        
        updateEventoColuna: (eventoId, novaColunaId) => {
            if (!userId) return;
            store.updateEventoColuna(userId, eventoId, novaColunaId)
                .catch(e => alert(e.message));
        },
        
        marcarEntregue: (eventId, tipo) => {
            if (!userId) return;
            store.marcarEntregue(userId, eventId, tipo)
                .catch(e => alert(e.message));
        }
    };

    // --- 5. LISTENERS DE FORMULÁRIOS E CONTROLES DA UI ---
    
    // -- Formulários Principais --
    document.getElementById('form-cliente').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            nome: e.target.elements['cliente-nome'].value, 
            telefone: e.target.elements['cliente-telefone'].value, 
            email: e.target.elements['cliente-email'].value,
            documento: e.target.elements['cliente-documento'].value,
            endereco: e.target.elements['cliente-endereco'].value 
        };
        store.handleFormSubmit(userId, 'clientes', data)
            .then(() => e.target.reset()) // Limpa o form em caso de sucesso
            .catch(e => alert(e.message));
    });

    document.getElementById('form-evento').addEventListener('submit', (e) => {
        e.preventDefault();
        const colunasOrdenadas = [...dbState.colunas].sort((a, b) => a.ordem - b.ordem);
        if (colunasOrdenadas.length === 0) {
            alert("Erro: Crie pelo menos uma coluna Kanban antes de adicionar um evento.");
            return;
        }
        const data = {
            clienteId: e.target.elements['evento-cliente'].value,
            nome: e.target.elements['evento-nome'].value, 
            data: e.target.elements['evento-data'].value, 
            local: e.target.elements['evento-local'].value,
            tipo: e.target.elements['evento-tipo'].value,
            descricao: e.target.elements['evento-descricao'].value,
            entrega_previa_status: "Pendente",
            entrega_midia_status: "Pendente",
            entrega_album_status: "Pendente",
            entrega_previa_data: null,
            entrega_midia_data: null,
            entrega_album_data: null,
            colunaId: colunasOrdenadas[0].id // Adiciona na primeira coluna
        };
        store.handleFormSubmit(userId, 'eventos', data)
            .then(() => e.target.reset())
            .catch(e => alert(e.message));
    });

    document.getElementById('form-contrato').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            clienteId: e.target.elements['contrato-cliente'].value,
            eventoId: e.target.elements['contrato-evento'].value,
            valorTotal: parseFloat(e.target.elements['contrato-valor-total'].value),
            dataContrato: e.target.elements['contrato-data'].value, 
            status: e.target.elements['contrato-status'].value,
            link: e.target.elements['contrato-link'].value,
            formaPagamento: e.target.elements['contrato-forma-pagamento'].value
        };
        store.handleFormSubmit(userId, 'contratos', data)
            .then(() => {
                e.target.reset();
                document.getElementById('contrato-data').valueAsDate = new Date(); // Reseta data
                ui.updateContratoEventoSelect(null, dbState); // Limpa select de evento
            })
            .catch(e => alert(e.message));
    });
    
    document.getElementById('form-fotografo').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = { 
            nome: e.target.elements['fotografo-nome'].value, 
            contato: e.target.elements['fotografo-contato'].value 
        };
        store.handleFormSubmit(userId, 'fotografos', data)
            .then(() => e.target.reset())
            .catch(e => alert(e.message));
    });
    
    document.getElementById('form-custo').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            data: e.target.elements['custo-data'].value,
            descricao: e.target.elements['custo-descricao'].value, 
            valor: parseFloat(e.target.elements['custo-valor'].value), 
            eventoId: e.target.elements['custo-evento'].value,
            fotografoId: e.target.elements['custo-fotografo'].value
        };
        store.handleFormSubmit(userId, 'custos', data)
            .then(() => {
                e.target.reset();
                document.getElementById('custo-data').valueAsDate = new Date();
            })
            .catch(e => alert(e.message));
    });
    
    document.getElementById('form-nova-coluna').addEventListener('submit', (e) => {
        e.preventDefault();
        const nomeColuna = e.target.elements['coluna-nome'].value;
        if (!nomeColuna) return;
        
        const proximaOrdem = (dbState.colunas.length > 0) 
            ? Math.max(...dbState.colunas.map(c => c.ordem)) + 1 
            : 0;
        
        const data = {
            nome: nomeColuna,
            ordem: proximaOrdem
        };
        store.handleFormSubmit(userId, 'colunas', data)
            .then(() => e.target.reset())
            .catch(e => alert(e.message));
    });
    
    // Novo Formulário de Template
    document.getElementById('form-template').addEventListener('submit', (e) => {
        e.preventDefault();
        const templateId = e.target.elements['template-id'].value; // Pega o ID (se estiver editando)
        const data = {
            titulo: e.target.elements['template-titulo'].value,
            corpo: e.target.elements['template-corpo'].value,
            link_tipo: e.target.elements['template-link-tipo'].value,
            link_pacote: e.target.elements['template-link-pacote'].value
        };

        store.saveTemplate(userId, data, templateId || null)
            .then(() => {
                ui.clearTemplateForm(); // Limpa o formulário
            })
            .catch(e => {
                alert("Falha ao salvar template: " + e.message);
            });
    });

    // -- Formulários de Modais --
    document.getElementById('add-payment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            contratoId: e.target.elements['payment-contrato-id'].value,
            valor: parseFloat(e.target.elements['payment-amount'].value),
            data: e.target.elements['payment-date'].value,
            metodo: e.target.elements['payment-method'].value
        };
        store.handleFormSubmit(userId, 'financeiro', data)
            .then(() => ui.closeAddPaymentModal()) // Fecha o modal em caso de sucesso
            .catch(e => alert(e.message));
    });
    
    document.getElementById('edit-contract-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const contratoId = e.target.elements['edit-contrato-id'].value;
        const dataToUpdate = {
            status: e.target.elements['edit-contrato-status'].value,
            link: e.target.elements['edit-contrato-link'].value,
            formaPagamento: e.target.elements['edit-contrato-forma-pagamento'].value
        };
        store.updateContrato(userId, contratoId, dataToUpdate)
            .then(() => ui.closeEditContratoModal())
            .catch(e => alert(e.message));
    });
    
    // -- Botões dos Modais (Cancelar) --
    document.getElementById('cancel-payment-button').addEventListener('click', ui.closeAddPaymentModal);
    document.getElementById('cancel-edit-contract-button').addEventListener('click', ui.closeEditContratoModal);
    
    // -- Outros Controles da UI --
    document.getElementById('contrato-cliente').addEventListener('change', (e) => {
        ui.updateContratoEventoSelect(e.target.value, dbState);
    });
    
    document.getElementById('entrega-evento-select').addEventListener('change', (e) => {
        selectedEventIdForEntrega = e.target.value; // Atualiza o estado global
        if (selectedEventIdForEntrega) {
            const evento = dbState.eventos.find(ev => ev.id === selectedEventIdForEntrega);
            document.getElementById('entrega-default-view').classList.add('hidden');
            document.getElementById('entrega-management-area').classList.remove('hidden');
            ui.renderEntregaCards(evento, dbState);
        } else {
            document.getElementById('entrega-default-view').classList.remove('hidden');
            document.getElementById('entrega-management-area').classList.add('hidden');
            ui.renderEntregasAtrasadas(dbState);
        }
    });
    
    document.getElementById('calendario-prev').addEventListener('click', () => {
        ui.mudarMes(-1, calendarioData, dbState);
    });
    document.getElementById('calendario-next').addEventListener('click', () => {
        ui.mudarMes(1, calendarioData, dbState);
    });
    
    document.getElementById('mobile-menu-button').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('-translate-x-full');
    });

    // Seta a data padrão nos forms
    document.getElementById('contrato-data').valueAsDate = new Date();
    document.getElementById('payment-date').valueAsDate = new Date();
    document.getElementById('custo-data').valueAsDate = new Date();
});


