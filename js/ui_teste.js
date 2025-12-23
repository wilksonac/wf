// js/ui.js

// ######################################################
// ARQUIVO 4: RENDERIZADOR DA INTERFACE (UI)
// ######################################################
// Este arquivo controla TUDO que o usuário vê. 
// Ele lê o 'dbState' e desenha o HTML.

// --- 1. RENDERIZAÇÃO DO DASHBOARD ---

// js/ui.js

// 
// SUBSTITUA A FUNÇÃO 'updateDashboard' INTEIRA POR ESTA
//
export function updateDashboard(dbState) {
    // --- 1. Cards de Stats (Lógica existente) ---
    const totalPago = dbState.financeiro.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
    
    let totalContratado = 0;
    dbState.contratos.forEach(contrato => {
        if (contrato.status === 'Assinado' || contrato.status === 'Concluído') {
            totalContratado += (parseFloat(contrato.valorTotal) || 0);
        }
    });
    
    const totalPendente = totalContratado - totalPago;
    document.getElementById('total-pendente').innerText = `R$ ${totalPendente.toFixed(2).replace('.', ',')}`;

    const totalCustos = dbState.custos.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
    document.getElementById('total-custos').innerText = `R$ ${totalCustos.toFixed(2).replace('.', ',')}`;

    const lucroLiquido = totalPago - totalCustos;
    const lucroEl = document.getElementById('lucro-liquido');
    lucroEl.innerText = `R$ ${lucroLiquido.toFixed(2).replace('.', ',')}`;
    lucroEl.classList.toggle('text-red-600', lucroLiquido < 0);
    lucroEl.classList.toggle('text-gray-800', lucroLiquido >= 0);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Entregas Críticas (Lógica existente)
    let entregasCriticasCount = 0;
    dbState.eventos.forEach(evento => {
        const tipos = ['previa', 'midia', 'album'];
        tipos.forEach(tipo => {
            const info = getEntregaInfo(evento, tipo); // Esta função já existe no ui.js
            if (info.status === 'atrasado' || info.status === 'hoje') {
                entregasCriticasCount++;
            }
        });
    });
    document.getElementById('db-entregas-criticas').innerText = entregasCriticasCount;
    
    // Contratos Fechados (Mês) (Lógica existente)
    let valorContratosMes = 0;
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    dbState.contratos.forEach(contrato => {
        if ((contrato.status === 'Assinado' || contrato.status === 'Concluído') && contrato.dataContrato) {
            const dataContrato = new Date(contrato.dataContrato + 'T00:00:00');
            if (dataContrato.getMonth() === mesAtual && dataContrato.getFullYear() === anoAtual) {
                valorContratosMes += (parseFloat(contrato.valorTotal) || 0);
            }
        }
    });
    document.getElementById('db-contratos-mes').innerText = `R$ ${valorContratosMes.toFixed(2).replace('.', ',')}`;

    // Eventos (Próximos 30 dias) (Lógica existente)
    let eventos30DiasCount = 0;
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + 30);

    dbState.eventos.forEach(evento => {
        if (evento.data) {
            const dataEvento = new Date(evento.data + 'T00:00:00');
            if (dataEvento >= hoje && dataEvento <= dataLimite) {
                eventos30DiasCount++;
            }
        }
    });
    document.getElementById('db-eventos-30d').innerText = eventos30DiasCount;


    // --- 2. NOVAS LISTAS DE EVENTOS (Início da Lógica Nova) ---
    
    // --- Próximos 5 Eventos ---
    const proximosEventosContainer = document.getElementById('dashboard-proximos-eventos');
    
    // Filtra eventos a partir de hoje e pega os 5 primeiros
    // (dbState.eventos já vem ordenado por data do store.js)
    const eventosFuturos = dbState.eventos
        .filter(evento => evento.data && new Date(evento.data + 'T00:00:00') >= hoje)
        .slice(0, 5); 

    if (eventosFuturos.length === 0) {
        proximosEventosContainer.innerHTML = '<p class="text-gray-500">Nenhum evento futuro agendado.</p>';
    } else {
        proximosEventosContainer.innerHTML = eventosFuturos.map(evento => {
            const dataFormatada = new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR');
            const cliente = dbState.clientes.find(c => c.id === evento.clienteId);
            return `
                <div class="border-b border-gray-100 pb-2">
                    <p class="font-semibold text-gray-800">${evento.nome}</p>
                    <p class="text-sm text-gray-600">${cliente ? cliente.nome : 'Cliente'} - <strong>${dataFormatada}</strong></p>
                </div>
            `;
        }).join('');
    }

    // --- Últimos 5 Eventos (Entregas) ---
    const ultimosEventosContainer = document.getElementById('dashboard-ultimos-eventos');
    
    // Filtra eventos que já passaram, pega os 5 mais recentes e inverte
    const eventosPassados = dbState.eventos
        .filter(evento => evento.data && new Date(evento.data + 'T00:00:00') < hoje)
        .slice(-5) // Pega os 5 últimos da lista (mais recentes)
        .reverse(); // Inverte para mostrar o mais recente no topo

    if (eventosPassados.length === 0) {
        ultimosEventosContainer.innerHTML = '<p class="text-gray-500">Nenhum evento passado encontrado.</p>';
    } else {
        ultimosEventosContainer.innerHTML = eventosPassados.map(evento => {
            // Reusa a lógica de cálculo de entrega
            const infoMidia = getEntregaInfo(evento, 'midia');
            const infoAlbum = getEntregaInfo(evento, 'album');

            // Função auxiliar para cor do status
            const getStatusColor = (info) => {
                if (info.status === 'entregue') return 'text-green-600';
                if (info.status === 'atrasado') return 'text-red-600';
                if (info.status === 'hoje') return 'text-yellow-600';
                return 'text-blue-600'; // pendente
            };
            
            const midiaColor = getStatusColor(infoMidia);
            const albumColor = getStatusColor(infoAlbum);
            const dataFormatada = new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR');

            return `
                <div class="border-b border-gray-100 pb-3">
                    <p class_="font-semibold text-gray-800">${evento.nome} <span class="text-sm text-gray-500">(${dataFormatada})</span></p>
                    <div class="text-sm space-y-1 mt-1 pl-2">
                        <p><strong>Mídia:</strong> <span class="font-medium ${midiaColor}">${infoMidia.text}</span></p>
                        <p><strong>Álbum:</strong> <span class="font-medium ${albumColor}">${infoAlbum.text}</span></p>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // (Fim da Lógica Nova)
}

// --- 2. RENDERIZAÇÃO DAS SEÇÕES PRINCIPAIS (Kanban, Tabelas) ---

export function renderKanban(dbState) {
    const board = document.getElementById('kanban-board');
    if (!board) return;

    const colunasOrdenadas = [...dbState.colunas].sort((a, b) => a.ordem - b.ordem);
    
    board.innerHTML = ''; // Limpa o quadro

    if (colunasOrdenadas.length === 0) {
        board.innerHTML = `<p class="text-gray-500 p-4">Nenhuma coluna Kanban foi criada. Adicione uma coluna acima para começar a organizar seus eventos.</p>`;
        return;
    }

    colunasOrdenadas.forEach(coluna => {
        const colunaEl = document.createElement('div');
        colunaEl.className = 'kanban-column';
        
        const eventosDaColuna = dbState.eventos
            .filter(evento => evento.colunaId === coluna.id)
            .sort((a, b) => new Date(a.data) - new Date(b.data)); // Ordena por data
        
        let cardsHtml = eventosDaColuna.map(evento => {
            const dataFormatada = evento.data ? new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data indefinida';
            const cliente = dbState.clientes.find(c => c.id === evento.clienteId);
            const nomeCliente = cliente ? cliente.nome : "Cliente não encontrado";

            let borderColor = 'border-blue-500';
            switch(evento.tipo) {
                case 'Casamento': borderColor = 'border-pink-500'; break;
                case 'Infantil': borderColor = 'border-yellow-500'; break;
                case 'Corporativo': borderColor = 'border-indigo-500'; break;
                case 'Ensaio': borderColor = 'border-teal-500'; break;
                case 'Evento Adulto': borderColor = 'border-purple-500'; break;
            }

            return `
            <div class="kanban-card bg-white p-5 rounded-lg shadow-md border-l-4 ${borderColor}" draggable="true" data-evento-id="${evento.id}">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${evento.nome}</h3>
                        <p class="text-sm font-medium text-gray-600">${nomeCliente}</p>
                    </div>
                    <span class="text-xs font-semibold ${borderColor.replace('border-', 'bg-').replace('-500', '-100')} ${borderColor.replace('border-', 'text-').replace('-500', '-800')} px-2 py-1 rounded-full">${evento.tipo}</span>
                </div>
                <p class="text-gray-600 mt-2"><i data-lucide="calendar" class="inline-block w-4 h-4 mr-1"></i> ${dataFormatada}</p>
                <p class="text-gray-600 mt-1"><i data-lucide="map-pin" class="inline-block w-4 h-4 mr-1"></i> ${evento.local || 'Local a definir'}</p>
                <p class="text-gray-500 mt-2 text-sm">${evento.descricao || 'Sem detalhes definidos.'}</p>
                <div class="mt-4 flex items-center gap-3">
                    <button onclick="window.app.openDossieModalFromEvento('${evento.id}')" class="text-blue-500 hover:text-blue-700" title="Ver Dossiê">
                        <i data-lucide="eye" class="w-5 h-5"></i>
                    </button>
                    <button onclick="window.app.deleteItem('eventos', '${evento.id}')" class="text-red-500 hover:text-red-700" title="Excluir Evento">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>`;
        }).join('');

        if (eventosDaColuna.length === 0) {
            cardsHtml = `<div class="text-center text-gray-400 text-sm p-4">Arraste eventos para cá</div>`;
        }

        colunaEl.innerHTML = `
            <h3 class="kanban-column-title">${coluna.nome} (${eventosDaColuna.length})</h3>
            <div class="kanban-cards space-y-3" data-coluna-id="${coluna.id}">
                ${cardsHtml}
            </div>
        `;
        
        board.appendChild(colunaEl);
    });
}

export function renderClientes(dbState) {
    const lista = document.getElementById('lista-clientes');
    lista.innerHTML = dbState.clientes.length === 0 
        ? '<tr><td colspan="5" class="p-4 text-center text-gray-500">Nenhum cliente cadastrado.</td></tr>'
        : dbState.clientes.map(cliente => {
            const numEventos = dbState.eventos.filter(e => e.clienteId === cliente.id).length;
            return `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-4 font-medium">${cliente.nome} <span class="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">${numEventos}</span></td>
                <td class="p-4">${cliente.telefone || '---'}</td>
                <td class="p-4">${cliente.email || '---'}</td>
                <td class="p-4 text-sm">${cliente.endereco || '---'}</td>
                <td class="p-4"><button onclick="window.app.deleteItem('clientes', '${cliente.id}')" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-5 h-5"></i></button></td>
            </tr>`;
        }).join('');
}

export function renderContratos(dbState) {
    const lista = document.getElementById('lista-contratos');
    lista.innerHTML = dbState.contratos.length === 0 
        ? '<tr><td colspan="5" class="p-4 text-center text-gray-500">Nenhum contrato cadastrado.</td></tr>'
        : dbState.contratos.map(contrato => {
            const cliente = dbState.clientes.find(c => c.id === contrato.clienteId) || { nome: 'Cliente não encontrado' };
            const evento = dbState.eventos.find(e => e.id === contrato.eventoId) || { nome: 'Evento não encontrado' };
            
            const valorTotal = parseFloat(contrato.valorTotal || 0);
            const totalPago = dbState.financeiro
                .filter(p => p.contratoId === contrato.id)
                .reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);
            const restante = valorTotal - totalPago;

            let statusClass = 'bg-gray-100 text-gray-800';
            switch (contrato.status) {
                case 'Proposta': statusClass = 'bg-blue-100 text-blue-800'; break;
                case 'Enviado': statusClass = 'bg-yellow-100 text-yellow-800'; break;
                case 'Assinado': statusClass = 'bg-green-100 text-green-800'; break;
                case 'Concluído': statusClass = 'bg-emerald-100 text-emerald-800'; break;
                case 'Cancelado': statusClass = 'bg-red-100 text-red-800'; break;
            }

            const linkButton = contrato.link 
                ? `<a href="${contrato.link}" target="_blank" class="text-blue-500 hover:text-blue-700" title="Ver Documento"><i data-lucide="external-link" class="w-5 h-5"></i></a>`
                : `<span class="text-gray-300" title="Sem documento"><i data-lucide="external-link" class="w-5 h-5"></i></span>`;
            
            let restanteClass = 'text-gray-500';
            if (restante > 0) restanteClass = 'text-red-600';
            if (restante <= 0 && valorTotal > 0) restanteClass = 'text-green-600';

            return `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-4">${cliente.nome}</td>
                <td class="p-4">${evento.nome}</td>
                <td class="p-4">
                    <div class="text-sm">Total: R$ ${valorTotal.toFixed(2).replace('.', ',')}</div>
                    <div class="text-sm text-green-600">Pago: R$ ${totalPago.toFixed(2).replace('.', ',')}</div>
                    <div class="text-sm font-medium ${restanteClass}">Restante: R$ ${restante.toFixed(2).replace('.', ',')}</div>
                </td>
                <td class="p-4"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">${contrato.status}</span></td>
                <td class="p-4 flex items-center gap-3">
                    <button onclick="window.app.openDossieModal('${contrato.id}')" class="text-blue-500 hover:text-blue-700" title="Ver Dossiê">
                        <i data-lucide="eye" class="w-5 h-5"></i>
                    </button>
                    <button onclick="window.app.openAddPaymentModal('${contrato.id}')" class="text-green-500 hover:text-green-700" title="Adicionar Pagamento">
                        <i data-lucide="plus-circle" class="w-5 h-5"></i>
                    </button>
                    <button onclick="window.app.abrirGerador('${contrato.id}')" class="text-indigo-500 hover:text-indigo-700" title="Gerar Texto do Contrato">
                        <i data-lucide="file-signature" class="w-5 h-5"></i>
                    </button>
                    <button onclick="window.app.openEditContratoModal('${contrato.id}')" class="text-gray-500 hover:text-gray-700" title="Editar Contrato (Link/Status)">
                        <i data-lucide="edit-2" class="w-5 h-5"></i>
                    </button>
                    ${linkButton}
                    <button onclick="window.app.deleteItem('contratos', '${contrato.id}')" class="text-red-500 hover:text-red-700" title="Excluir Contrato"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                </td>
            </tr>`;
        }).join('');
}

export function renderFotografos(dbState) {
    const lista = document.getElementById('lista-fotografos');
     lista.innerHTML = dbState.fotografos.length === 0 
        ? '<tr><td colspan="3" class="p-4 text-center text-gray-500">Nenhum fotógrafo cadastrado.</td></tr>'
        : dbState.fotografos.map(fotografo => `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-4">${fotografo.nome}</td><td class="p-4">${fotografo.contato}</td>
                <td class="p-4"><button onclick="window.app.deleteItem('fotografos', '${fotografo.id}')" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-5 h-5"></i></button></td>
            </tr>`).join('');
}

export function renderFinanceiro(dbState) {
    const lista = document.getElementById('lista-financeiro');
    
    lista.innerHTML = dbState.financeiro.length === 0 
        ? '<tr><td colspan="6" class="p-4 text-center text-gray-500">Nenhum pagamento registrado.</td></tr>'
        : dbState.financeiro.map(pagamento => {
            
            const contrato = dbState.contratos.find(c => c.id === pagamento.contratoId) || {};
            const cliente = dbState.clientes.find(c => c.id === contrato.clienteId) || { nome: 'Cliente não encontrado' };
            const evento = dbState.eventos.find(e => e.id === contrato.eventoId) || { nome: 'Contrato não encontrado' };
            
            const dataFormatada = pagamento.data ? new Date(pagamento.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem data';
            const valorFormatado = (parseFloat(pagamento.valor) || 0).toFixed(2).replace('.', ',');

            return `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-4">${dataFormatada}</td>
                <td class="p-4">${cliente.nome}</td>
                <td class="p-4">${evento.nome}</td>
                <td class="p-4"><span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">${pagamento.metodo || 'N/D'}</span></td>
                <td class="p-4 font-medium text-green-600">R$ ${valorFormatado}</td>
                <td class="p-4">
                    <button onclick="window.app.deleteItem('financeiro', '${pagamento.id}')" class="text-red-500 hover:text-red-700" title="Excluir Pagamento">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');
}

        // ATUALIZAÇÃO AQUI: Adicionada data e colspan="6"
        export function renderCustos(dbState) {
            const lista = document.getElementById('lista-custos');
            lista.innerHTML = dbState.custos.length === 0
                ? '<tr><td colspan="6" class="p-4 text-center text-gray-500">Nenhum custo cadastrado.</td></tr>'
                : dbState.custos.map(item => {
                    const evento = dbState.eventos.find(e => e.id === item.eventoId);
                    const fotografo = dbState.fotografos.find(f => f.id === item.fotografoId);
                    const valor = parseFloat(item.valor) || 0;
                    const dataFormatada = item.data 
                        ? new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR') 
                        : 'Sem data';
        
                    return `<tr class="border-b hover:bg-gray-50">
                        <td class="p-4">${dataFormatada}</td>
                        <td class="p-4">${item.descricao}</td>
                        <td class="p-4">${evento ? evento.nome : 'Evento não encontrado'}</td>
                        <td class="p-4">${fotografo ? fotografo.nome : 'N/A'}</td>
                        <td class="p-4">R$ ${valor.toFixed(2).replace('.', ',')}</td>
                        <td class="p-4"><button onclick="window.app.deleteItem('custos', '${item.id}')" class="text-red-500 hover:text-red-700" title="Excluir Custo"><i data-lucide="trash-2" class="w-5 h-5"></i></button></td>
                    </tr>`;
                }).join('');
        }


// --- 3. RENDERIZAÇÃO DO CALENDÁRIO ---

export function renderCalendario(calendarioData, dbState) {
    // Garante que estamos no primeiro dia do mês para cálculo
    const dataBase = new Date(calendarioData.getFullYear(), calendarioData.getMonth(), 1);
    
    const mesAnoEl = document.getElementById('calendario-mes-ano');
    const gridEl = document.getElementById('calendario-grid');
    
    const mes = dataBase.getMonth();
    const ano = dataBase.getFullYear();
    
    mesAnoEl.textContent = dataBase.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
    }).replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter

    const primeiroDiaSemana = dataBase.getDay();
    const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
    
    gridEl.innerHTML = '';
    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    // Dias vazios do início
    for (let i = 0; i < primeiroDiaSemana; i++) {
        gridEl.innerHTML += `<div class="calendar-day empty h-36"></div>`;
    }

    // Dias do mês
    for (let dia = 1; dia <= ultimoDiaMes; dia++) {
        const dataAtual = new Date(ano, mes, dia);
        let todayClass = dataAtual.getTime() === hoje.getTime() ? 'today' : '';
        
        const dataFormatada = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        
        const eventosDoDia = dbState.eventos.filter(evento => {
            if (!evento.data) return false;
            const dataEvento = new Date(evento.data + 'T00:00:00');
            return dataEvento.getTime() === dataAtual.getTime();
        });

        let eventosHtml = eventosDoDia.map(evento => {
            let eventColorClass = 'bg-blue-100 text-blue-800';
            switch(evento.tipo) {
                case 'Casamento': eventColorClass = 'bg-pink-100 text-pink-800'; break;
                case 'Infantil': eventColorClass = 'bg-yellow-100 text-yellow-800'; break;
                case 'Corporativo': eventColorClass = 'bg-indigo-100 text-indigo-800'; break;
                case 'Ensaio': eventColorClass = 'bg-teal-100 text-teal-800'; break;
                case 'Evento Adulto': eventColorClass = 'bg-purple-100 text-purple-800'; break;
            }
            return `<span class="calendar-event ${eventColorClass}" title="${evento.nome}">${evento.nome}</span>`;
        }).join('');

        gridEl.innerHTML += `
            <div class="calendar-day ${todayClass} h-36 cursor-pointer hover:bg-gray-50 overflow-y-auto" onclick="window.app.abrirNovoEventoDoCalendario('${dataFormatada}')">
                <div class="day-number">${dia}</div>
                <div class="mt-1 space-y-1">${eventosHtml}</div>
            </div>
        `;
    }

    // Dias vazios do fim
    const totalCelulas = primeiroDiaSemana + ultimoDiaMes;
    const celulasRestantes = (7 - (totalCelulas % 7)) % 7;
    for (let i = 0; i < celulasRestantes; i++) {
        gridEl.innerHTML += `<div class="calendar-day empty h-36"></div>`;
    }
}

// Esta função é chamada pelos botões, recebe o estado `calendarioData` do main.js
export function mudarMes(offset, calendarioData, dbState) {
    calendarioData.setMonth(calendarioData.getMonth() + offset);
    renderCalendario(calendarioData, dbState); // Re-renderiza o calendário
}


// --- 4. POPULAÇÃO DE SELECTS ---

// Função auxiliar interna
function populateSelectWithOptions(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const selectedValue = select.value; // Salva o valor que estava selecionado
    select.innerHTML = options.header; // Limpa e adiciona o header
    options.data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.nome;
        select.appendChild(option);
    });
    select.value = selectedValue; // Tenta restaurar o valor
}

export function populateEventoClienteSelect(dbState) {
    populateSelectWithOptions('evento-cliente', {
        header: '<option value="">Selecione o Cliente</option>', 
        data: dbState.clientes
    });
}

export function populateEventoSelect(dbState) {
    populateSelectWithOptions('custo-evento', { 
        header: '<option value="">Selecione o Evento</option>', 
        data: dbState.eventos 
    });
}

export function populateCustoFotografoSelect(dbState) {
    populateSelectWithOptions('custo-fotografo', { 
        header: '<option value="">Selecione o Fotógrafo (Opcional)</option>', 
        data: dbState.fotografos 
    });
}

export function populateContratoClienteSelect(dbState) {
    populateSelectWithOptions('contrato-cliente', {
        header: '<option value="">Selecione o Cliente</option>', 
        data: dbState.clientes
    });
}

export function updateContratoEventoSelect(clienteId, dbState) {
    let eventosFiltrados = [];
    let header = '<option value="">Selecione o Evento (escolha o cliente primeiro)</option>';

    if (clienteId) {
        eventosFiltrados = dbState.eventos.filter(e => e.clienteId === clienteId);
        if (eventosFiltrados.length === 0) {
            header = '<option value="">Nenhum evento encontrado para este cliente</option>';
        } else {
            header = '<option value="">Selecione o Evento</option>';
        }
    }
    
    populateSelectWithOptions('contrato-evento', {
        header: header,
        data: eventosFiltrados
    });
}

export function populateEntregaEventoSelect(dbState, selectedEventIdForEntrega) {
    const select = document.getElementById('entrega-evento-select');
    if (!select) return;
    select.innerHTML = '<option value="">Ver todos os atrasos (Padrão)</option>';
    dbState.eventos.forEach(evento => {
        const cliente = dbState.clientes.find(c => c.id === evento.clienteId);
        const nomeCliente = cliente ? `(${cliente.nome})` : '';
        const option = document.createElement('option');
        option.value = evento.id;
        option.textContent = `${evento.nome} ${nomeCliente}`;
        select.appendChild(option);
    });
    // Restaura a seleção se houver uma
    select.value = selectedEventIdForEntrega || "";
}


// --- 5. LÓGICA DE UI DA SEÇÃO "ENTREGA" ---

// Função auxiliar de cálculo
export function getEntregaInfo(evento, tipo) {
    const dataEventoStr = evento.data;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (!dataEventoStr) {
        return { status: 'nodate', text: 'Data do evento não definida', deadline: 'N/A', bgColor: 'bg-gray-100', textColor: 'text-gray-500', diffDays: 99999 };
    }

    const dataEvento = new Date(dataEventoStr + 'T00:00:00');
    let dataPrazo = new Date(dataEvento);
    let statusField, dataField, title;

    if (tipo === 'previa') {
        dataPrazo.setDate(dataEvento.getDate() + 3);
        statusField = 'entrega_previa_status';
        dataField = 'entrega_previa_data';
        title = 'PRÉVIA';
    } else if (tipo === 'midia') {
        dataPrazo.setDate(dataEvento.getDate() + 60);
        statusField = 'entrega_midia_status';
        dataField = 'entrega_midia_data';
        title = 'FOTOS EM MÍDIA';
    } else if (tipo === 'album') {
        dataPrazo.setMonth(dataEvento.getMonth() + 6);
        statusField = 'entrega_album_status';
        dataField = 'entrega_album_data';
        title = 'ALBUM IMPRESSO';
    }

    const prazoFormatado = dataPrazo.toLocaleDateString('pt-BR');
    const diffTime = dataPrazo.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (evento[statusField] === 'Entregue') {
        const dataEntrega = evento[dataField] ? new Date(evento[dataField]).toLocaleDateString('pt-BR') : '';
        return { 
            title, status: 'entregue', text: `Entregue em ${dataEntrega}`, 
            deadline: `Prazo: ${prazoFormatado}`, bgColor: 'bg-green-100', 
            textColor: 'text-green-800', diffDays: 99998,
            data: dataEntrega
        };
    }

    if (diffDays < 0) {
        return { 
            title, status: 'atrasado', text: `${Math.abs(diffDays)} dia(s) atrasado`, 
            deadline: `Prazo: ${prazoFormatado}`, bgColor: 'bg-red-100', 
            textColor: 'text-red-800', diffDays: diffDays,
            data: null
        };
    }
    if (diffDays === 0) {
        return { 
            title, status: 'hoje', text: 'Vence Hoje', 
            deadline: `Prazo: ${prazoFormatado}`, bgColor: 'bg-yellow-100', 
            textColor: 'text-yellow-800', diffDays: 0,
            data: null
        };
    }
    return { 
        title, status: 'pendente', text: `Vence em ${diffDays} dia(s)`, 
        deadline: `Prazo: ${prazoFormatado}`, bgColor: 'bg-blue-100', 
        textColor: 'text-blue-800', diffDays: diffDays,
        data: null
    };
}

export function renderEntregaCards(evento, dbState) {
    const container = document.getElementById('entrega-management-area');
    
    if (!evento) {
        container.innerHTML = '<p class="text-red-500">Erro: Evento não encontrado.</p>';
        return;
    }

    const tipos = ['previa', 'midia', 'album'];
    container.innerHTML = tipos.map(tipo => {
        const info = getEntregaInfo(evento, tipo);
        
        const buttonHtml = info.status === 'entregue'
            ? `<button class="w-full bg-green-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2" disabled>
                    <i data-lucide="check-circle" class="w-5 h-5"></i> Entregue
               </button>`
            : `<button onclick="window.app.marcarEntregue('${evento.id}', '${tipo}')" class="w-full bg-gray-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                    Marcar como Entregue
               </button>`;

        return `
            <div class="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between ${info.bgColor} ${info.textColor}">
                <div>
                    <h3 class="text-xl font-bold text-gray-900">${info.title}</h3>
                    <p class="text-2xl font-bold mt-2">${info.text}</p>
                    <p class="text-sm text-gray-600 mt-1">${info.deadline}</p>
                </div>
                <div class="mt-6">
                    ${buttonHtml}
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons(); // Precisa chamar aqui por ser uma renderização específica
}

export function renderEntregasAtrasadas(dbState) {
    const container = document.getElementById('entrega-atrasos-container');
    let atrasos = [];

    dbState.eventos.forEach(evento => {
        const tipos = ['previa', 'midia', 'album'];
        tipos.forEach(tipo => {
            const info = getEntregaInfo(evento, tipo);
            if (info.status === 'atrasado' || info.status === 'hoje') {
                atrasos.push({
                    evento: evento,
                    info: info
                });
            }
        });
    });

    atrasos.sort((a, b) => a.info.diffDays - b.info.diffDays);

    if (atrasos.length === 0) {
        container.innerHTML = `
            <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow">
                <h3 class="font-bold">Tudo em dia!</h3>
                <p>Nenhuma entrega está atrasada ou vencendo hoje.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = atrasos.map(item => {
        const cliente = dbState.clientes.find(c => c.id === item.evento.clienteId);
        const nomeCliente = cliente ? cliente.nome : 'Cliente não encontrado';
        const { bgColor, textColor, title, text, deadline } = item.info;

        return `
            <div class="bg-white p-4 rounded-lg shadow-md flex items-center justify-between gap-4 ${bgColor} ${textColor}">
                <div class="flex-shrink-0 w-16 h-16 ${bgColor} rounded-lg flex items-center justify-center">
                    <i data-lucide="${item.info.status === 'atrasado' ? 'alert-triangle' : 'alert-circle'}" class="w-8 h-8"></i>
                </div>
                <div class="flex-grow">
                    <span class="text-xs font-semibold ${bgColor.replace('-100', '-800')} ${bgColor.replace('bg-', 'bg-').replace('-100', '-200')} px-2 py-0.5 rounded-full">${title}</span>
                    <h4 class="text-lg font-bold text-gray-900">${item.evento.nome}</h4>
                    <p class="text-sm text-gray-700">${nomeCliente}</p>
                </div>
                <div class="flex-shrink-0 text-right">
                    <p class="text-lg font-bold">${text}</p>
                    <p class="text-sm text-gray-600">${deadline}</p>
                </div>
                <div class="flex-shrink-0">
                    <button onclick="window.app.viewEntregaFromAtraso('${item.evento.id}')" class="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700">
                        Ver Evento
                    </button>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons(); // Precisa chamar aqui também
}


// --- 6. FUNÇÕES DE NAVEGAÇÃO E MODAIS ---

export function showSection(sectionId, dbState, calendarioData) {
    // Fecha o menu mobile
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('-translate-x-full');
    }
    
    // Esconde todas as seções
    document.querySelectorAll('.content-section').forEach(section => section.classList.add('hidden'));
    
    // Mostra a seção clicada
    const sectionElement = document.getElementById(`section-${sectionId}`);
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
    }
    
    // Atualiza o link ativo
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('bg-gray-700'));
    const activeLink = document.querySelector(`a[onclick*="showSection('${sectionId}')"]`);
    if (activeLink) {
        activeLink.classList.add('bg-gray-700');
    }

    // --- Lógica Específica por Seção ---
    if (sectionId === 'entrega') {
        document.getElementById('entrega-evento-select').value = '';
        document.getElementById('entrega-default-view').classList.remove('hidden');
        document.getElementById('entrega-management-area').classList.add('hidden');
        renderEntregasAtrasadas(dbState);
    }
    if (sectionId === 'contratos') {
        updateContratoEventoSelect(null, dbState);
        document.getElementById('form-contrato').reset();
        document.getElementById('contrato-data').valueAsDate = new Date();
    }
    if (sectionId === 'calendario') {
        renderCalendario(calendarioData, dbState);
    }
    if (sectionId === 'gerador') {
        // Limpa o gerador ao clicar no menu
        document.getElementById('contractForm').reset();
        const contractTypeSelect = document.getElementById('contractType');
        contractTypeSelect.value = '';
        contractTypeSelect.dispatchEvent(new Event('change'));
        document.getElementById('outputSection').classList.add('hidden');
    }
}

export function abrirGerador(contratoId, dbState) {
    const contrato = dbState.contratos.find(c => c.id === contratoId);
    if (!contrato) {
        alert("Erro: Contrato não encontrado.");
        return;
    }
    const cliente = dbState.clientes.find(c => c.id === contrato.clienteId);
    const evento = dbState.eventos.find(e => e.id === contrato.eventoId);
    
    // Mudar para a seção do gerador
    showSection('gerador', dbState, new Date()); // Passa um new Date() p/ calendarioData, não é usado aqui
    
    // Preencher os dados
    if (cliente) {
        document.getElementById('clientName').value = cliente.nome || '';
        document.getElementById('clientCPF').value = cliente.documento || '';
        document.getElementById('clientAddress').value = cliente.endereco || '';
        document.getElementById('clientEmail').value = cliente.email || '';
        document.getElementById('clientPhone').value = cliente.telefone || '';
    }
    if (evento) {
        document.getElementById('eventDate').value = evento.data || '';
        document.getElementById('eventLocal').value = evento.local || '';
        document.getElementById('package').value = evento.descricao || '';
        
        let contractTypeValue = '4'; // Padrão "Eventos em Geral"
        if (evento.tipo === 'Infantil') contractTypeValue = '1';
        if (evento.tipo === 'Casamento') contractTypeValue = '2';
        
        const contractTypeSelect = document.getElementById('contractType');
        contractTypeSelect.value = contractTypeValue;
        contractTypeSelect.dispatchEvent(new Event('change'));
    }
    if (contrato) {
        document.getElementById('value').value = contrato.valorTotal || '';
        document.getElementById('paymentMethod').value = contrato.formaPagamento || '';
    }

    document.getElementById('clientName').focus();
    alert("Dados do contrato pré-preenchidos! Verifique e gere o contrato.");
}

export function abrirNovoEventoDoCalendario(data) {
    // Chama a função global (que será definida no main.js) para mudar de aba
    window.app.showSection('eventos'); 
    
    // Preenche a data e foca no nome
    document.getElementById('evento-data').value = data;
    document.getElementById('evento-nome').focus();
}

export function viewEntregaFromAtraso(eventId, dbState) {
    document.getElementById('entrega-evento-select').value = eventId;
    
    // Esta função é chamada pelo main.js, que vai atualizar o 'selectedEventIdForEntrega'
    // e chamar a renderização correta
    
    const evento = dbState.eventos.find(e => e.id === eventId);
    if(evento) {
        document.getElementById('entrega-default-view').classList.add('hidden');
        document.getElementById('entrega-management-area').classList.remove('hidden');
        renderEntregaCards(evento, dbState);
    }
}

// --- Funções de Controle de Modais ---

export function openDossieModal(contratoId, dbState) {
    const contrato = dbState.contratos.find(c => c.id === contratoId);
    if (!contrato) {
        console.error("Contrato não encontrado:", contratoId);
        return;
    }

    const cliente = dbState.clientes.find(c => c.id === contrato.clienteId) || {};
    const evento = dbState.eventos.find(e => e.id === contrato.eventoId) || {};
    const pagamentos = dbState.financeiro.filter(p => p.contratoId === contratoId);
    const custos = dbState.custos.filter(c => c.eventoId === contrato.eventoId);

    // Cálculos
    const valorTotal = parseFloat(contrato.valorTotal || 0);
    const totalPago = pagamentos.reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);
    const restante = valorTotal - totalPago;
    const totalCusto = custos.reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);
    const lucroLiquido = valorTotal - totalCusto;
    const dataEventoFormatada = evento.data ? new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A';

    // Preenche Informações
    document.getElementById('dossie-evento-nome').innerText = evento.nome || 'N/A';
    document.getElementById('dossie-cliente-nome').innerText = cliente.nome || 'N/A';
    document.getElementById('dossie-cliente-contato').innerText = `${cliente.telefone || 'Sem telefone'} | ${cliente.email || 'Sem email'}`;
    document.getElementById('dossie-evento-data').innerText = dataEventoFormatada;
    document.getElementById('dossie-evento-local').innerText = evento.local || 'N/A';
    
    const linkEl = document.getElementById('dossie-contrato-link');
    if (contrato.link) {
        linkEl.innerHTML = `<a href="${contrato.link}" target="_blank" class="hover:underline">${contrato.link}</a>`;
    } else {
        linkEl.innerText = 'Nenhum link salvo';
    }

    // Preenche Financeiro
    document.getElementById('dossie-valor-contrato').innerText = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('dossie-total-pago').innerText = `R$ ${totalPago.toFixed(2).replace('.', ',')}`;
    document.getElementById('dossie-valor-restante').innerText = `R$ ${restante.toFixed(2).replace('.', ',')}`;
    
    const pagamentosListaEl = document.getElementById('dossie-pagamentos-lista');
    if (pagamentos.length > 0) {
        pagamentosListaEl.innerHTML = pagamentos.map(p => {
            const dataPag = new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR');
            return `<div class="flex justify-between items-center text-gray-700">
                        <span>${dataPag} (${p.metodo})</span>
                        <span class="font-medium text-green-600">+ R$ ${parseFloat(p.valor).toFixed(2).replace('.', ',')}</span>
                    </div>`;
        }).join('');
    } else {
        pagamentosListaEl.innerHTML = `<p class="text-gray-500">Nenhum pagamento registrado.</p>`;
    }

    // Preenche Lucratividade
    document.getElementById('dossie-lucro-valor').innerText = `+ R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('dossie-lucro-custos').innerText = `- R$ ${totalCusto.toFixed(2).replace('.', ',')}`;
    document.getElementById('dossie-lucro-liquido').innerText = `R$ ${lucroLiquido.toFixed(2).replace('.', ',')}`;
    document.getElementById('dossie-lucro-liquido').className = `font-bold text-3xl ${lucroLiquido < 0 ? 'text-red-600' : 'text-gray-900'}`;
    
    const custosListaEl = document.getElementById('dossie-custos-lista');
    if (custos.length > 0) {
        custosListaEl.innerHTML = custos.map(c => {
            const fotografo = dbState.fotografos.find(f => f.id === c.fotografoId);
            const desc = fotografo ? `${c.descricao} (${fotografo.nome})` : c.descricao;
            return `<div class="flex justify-between items-center text-gray-700">
                        <span>${desc}</span>
                        <span class="font-medium text-red-600">- R$ ${parseFloat(c.valor).toFixed(2).replace('.', ',')}</span>
                    </div>`;
        }).join('');
    } else {
        custosListaEl.innerHTML = `<p class="text-gray-500">Nenhum custo registrado.</p>`;
    }

    // Preenche Entregas
    const entregasListaEl = document.getElementById('dossie-entregas-lista');
    const tiposEntrega = ['previa', 'midia', 'album'];
    entregasListaEl.innerHTML = tiposEntrega.map(tipo => {
        const info = getEntregaInfo(evento, tipo);
        const statusColor = info.status === 'entregue' ? 'text-green-600' : (info.status === 'atrasado' || info.status === 'hoje' ? 'text-red-600' : 'text-gray-700');
        const statusText = info.status === 'entregue' ? `Entregue em ${info.data}` : info.text;

        return `<div class="p-2 border-b">
                    <span class="font-semibold text-gray-900">${info.title}</span>
                    <p class="text-sm ${statusColor}">${statusText}</p>
                    <p class="text-xs text-gray-500">${info.deadline}</p>
                </div>`;
    }).join('');

    // Exibe o Modal
    document.getElementById('dossie-modal').classList.remove('hidden');
    document.getElementById('dossie-modal').classList.add('flex');
}

export function closeDossieModal() {
    document.getElementById('dossie-modal').classList.add('hidden');
    document.getElementById('dossie-modal').classList.remove('flex');
    document.getElementById('dossie-content').scrollTop = 0; // Reseta o scroll
}

export function openAddPaymentModal(contratoId) {
    document.getElementById('payment-contrato-id').value = contratoId;
    document.getElementById('payment-date').valueAsDate = new Date();
    document.getElementById('add-payment-modal').classList.remove('hidden');
    document.getElementById('add-payment-modal').classList.add('flex');
    document.getElementById('payment-amount').focus();
}

export function closeAddPaymentModal() {
    document.getElementById('add-payment-modal').classList.add('hidden');
    document.getElementById('add-payment-modal').classList.remove('flex');
    document.getElementById('add-payment-form').reset();
}

export function openEditContratoModal(contratoId, dbState) {
    const contrato = dbState.contratos.find(c => c.id === contratoId);
    if (!contrato) {
        alert("Erro: Contrato não encontrado.");
        return;
    }
    
    document.getElementById('edit-contrato-id').value = contratoId;
    document.getElementById('edit-contrato-status').value = contrato.status || 'Proposta';
    document.getElementById('edit-contrato-link').value = contrato.link || '';
    document.getElementById('edit-contrato-forma-pagamento').value = contrato.formaPagamento || '';
    
    document.getElementById('edit-contract-modal').classList.remove('hidden');
    document.getElementById('edit-contract-modal').classList.add('flex');
}

export function closeEditContratoModal() {
    document.getElementById('edit-contract-modal').classList.add('hidden');
    document.getElementById('edit-contract-modal').classList.remove('flex');
    document.getElementById('edit-contract-form').reset();
}

export function showLoginError(message) {
    const loginError = document.getElementById('login-error');
    loginError.textContent = message;
    loginError.classList.remove('hidden');
}

export function hideLoginError() {
    document.getElementById('login-error').classList.add('hidden');

}

