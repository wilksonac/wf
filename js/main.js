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
    financeiro: [], custos: [], colunas: []
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
    ui.renderCustos(dbState); // Atualizado na Fase 1
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
    
    // Atualiza a visão de Contas a Receber (Fase 2)
    // Verifica se a seção financeira está ativa para renderizar
    if (!document.getElementById('section-financeiro').classList.contains('hidden')) {
        ui.renderContasAReceber(dbState);
        ui.renderFluxoDeCaixaChart(dbState);
        // Na Fase 3, chamaremos o gráfico aqui
    }

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
    dbState = { eventos: [], clientes: [], contratos: [], fotografos: [], financeiro: [], custos: [], colunas: [] };
    onDataChange(dbState); 
}


// --- 4. PONTO DE ENTRADA (Quando a página carrega) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Inicia os "especialistas"
    setupAuthListeners(onLogin, onLogout);
    initGeradorListeners();
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

        // Funções de Ação (chamam o Store)
        deleteItem: (collectionName, id) => {
            if (!userId) return;
            
            let message = `Tem certeza que deseja excluir este item?`;
            
            // ######################
            // AQUI ESTAVA O ERRO (Corrigido de \N para \n)
            // ######################
            if (collectionName === 'clientes' || collectionName === 'eventos') {
                message += `\nNenhum contrato, evento ou pagamento associado será excluído.`;
            } else if (collectionName === 'contratos') {
                message += `\n\nATENÇÃO: Isso NÃO excluirá os pagamentos já feitos (no Histórico de Pagamentos).`;
            } else if (collectionName === 'financeiro') {
                message = `Tem certeza que deseja excluir este PAGAMENTO? Esta ação não pode ser desfeita.`;
            }
            
            if (confirm(message)) {
                store.deleteItem(userId, collectionName, id)
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
    
    // ######################
    // ATUALIZAÇÃO DA FASE 1 (Form de Custo)
    // ######################
    document.getElementById('form-custo').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            data: e.target.elements['custo-data'].value, // <-- CAMPO ADICIONADO
            descricao: e.target.elements['custo-descricao'].value, 
            valor: parseFloat(e.target.elements['custo-valor'].value), 
            eventoId: e.target.elements['custo-evento'].value,
            fotografoId: e.target.elements['custo-fotografo'].value
        };
        store.handleFormSubmit(userId, 'custos', data)
            .then(() => {
                e.target.reset();
                // Reseta a data para hoje
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
        document.getElementById('sidebar').classList.toggle('-translatex-full');
    });

    // Seta a data padrão nos forms
    document.getElementById('contrato-data').valueAsDate = new Date();
    document.getElementById('payment-date').valueAsDate = new Date();
    // Adicionado na Fase 1
    document.getElementById('custo-data').valueAsDate = new Date();
});
<div id="section-templates" class="content-section hidden">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Editor de Templates de Contrato</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <form id="form-template">
                <input type="hidden" id="template-id"> <div class="mb-4">
                    <label for="template-titulo" class="block text-sm font-medium text-gray-700 mb-1">Título do Template</label>
                    <input type="text" id="template-titulo" placeholder="Ex: Contrato Festa Infantil (Pacote Ouro)" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>

                <div class="mb-4">
                    <label for="template-corpo" class="block text-sm font-medium text-gray-700 mb-1">Corpo do Contrato</label>
                    <textarea id="template-corpo" rows="25" class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder="Cole aqui o texto do seu contrato..."></textarea>
                </div>
                
                <div class="flex items-center gap-4">
                    <button type="submit" class="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 transition">Salvar Template</button>
                    <button type="button" onclick="window.app.clearTemplateForm()" class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition">Cancelar / Novo</button>
                </div>
            </form>
        </div>

        <div class="space-y-6">
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-lg font-bold text-gray-800 mb-3">Templates Salvos</h3>
                <div id="lista-templates" class="max-h-60 overflow-y-auto space-y-2">
                    </div>
            </div>
            
            <div class="bg-blue-50 p-5 rounded-lg shadow-inner">
                <h3 class="text-lg font-bold text-blue-800 mb-3">Placeholders Disponíveis</h3>
                <p class="text-sm text-blue-700 mb-3">
                    Use os placeholders abaixo no corpo do seu contrato. Eles serão substituídos pelos dados do formulário.
                </p>
                <div class="space-y-1 text-sm font-mono text-blue-900">
                    <p><strong>{{clientName}}</strong> - Nome do Cliente</p>
                    <p><strong>{{clientCPF}}</strong> - CPF do Cliente</p>
                    <p><strong>{{clientRG}}</strong> - RG do Cliente</p>
                    <p><strong>{{clientAddress}}</strong> - Endereço do Cliente</p>
                    <p><strong>{{clientEmail}}</strong> - Email do Cliente</p>
                    <p><strong>{{clientPhone}}</strong> - Telefone do Cliente</p>
                    <p><strong>{{eventDate}}</strong> - Data do Evento</p>
                    <p><strong>{{eventTime}}</strong> - Hora do Evento</p>
                    <p><strong>{{eventDuration}}</strong> - Duração (Horas)</p>
                    <p><strong>{{eventLocal}}</strong> - Local do Evento</p>
                    <p><strong>{{value}}</strong> - Valor Total (R$)</p>
                    <p><strong>{{paymentMethod}}</strong> - Forma de Pagamento</p>
                    <p><strong>{{package}}</strong> - Descrição do Pacote</p>
                    <p><strong>{{rules}}</strong> - Cláusulas Adicionais</p>
                    <p><strong>{{studentName}}</strong> - Nome do Formando</p>
                    <p><strong>{{studentClass}}</strong> - Turma do Formando</p>
                    <p><strong>{{imageRights}}</strong> - (Lógica na Fase 2)</p>
                    <p><strong>{{contratadoName}}</strong> - (Seu Nome)</p>
                    <p><strong>{{contratadoCPF}}</strong> - (Seu CPF)</p>
                    <p><strong>{{contratadoAddress}}</strong> - (Seu Endereço)</p>
                    <p><strong>{{currentDate}}</strong> - (Data de Hoje)</p>
                </div>
            </div>
        </div>
        
    </div>
</div>


