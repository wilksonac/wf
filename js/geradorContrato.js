// js/geradorContrato.js

// ######################################################
// ARQUIVO 3: LÓGICA DO GERADOR DE CONTRATO (VERSÃO 2.0)
// ######################################################
// Este arquivo não contém mais os textos dos contratos.
// Ele busca os templates do 'dbState' e substitui os placeholders.

// --- 1. FUNÇÕES DE COLETA DE DADOS (Quase Inalteradas) ---

// Pega os dados do formulário do Gerador
function getFormData() {
    const data = {};
    const fields = [
        'contractType', 'eventDate', 'eventTime', 'eventDuration', 'eventLocal', 'package', 'value', 'paymentMethod', 'rules',
        'clientName', 'clientCPF', 'clientRG',
        'clientAddress', 'clientEmail', 'clientPhone', 'imageRights', 
        'weddingPackage', 'infantilPackage', 'civilPackage', 'formaturaPackage',
        'studentName', 'studentClass'
    ];
    fields.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
           data[id] = element.type === 'checkbox' ? element.checked : element.value;
        }
    });
    return data;
}

// Preenche o formulário a partir do Texto Rápido
function parseByLine(lines, keys) {
    lines.forEach((line, index) => {
        if (keys[index]) {
            const value = line.split(':').slice(1).join(':').trim();
            const element = document.getElementById(keys[index]);
            if (element) {
                if (keys[index] === 'eventDate' && value) {
                    const parts = value.split('/');
                    if (parts.length === 3) {
                        let [day, month, year] = parts;
                        if (year.length === 2) {
                            year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
                        }
                        day = day.padStart(2, '0');
                        month = month.padStart(2, '0');
                        element.value = `${year}-${month}-${day}`;
                    } else {
                       element.value = value;
                    }
                } else if (element.type === 'checkbox') {
                    element.checked = value.toLowerCase() === 'sim';
                } else if (element.tagName === 'SELECT') {
                    const optionToSelect = [...element.options].find(opt => opt.text.toLowerCase().startsWith(value.toLowerCase()));
                    if (optionToSelect) {
                        element.value = optionToSelect.value;
                        element.dispatchEvent(new Event('change'));
                    }
                } else {
                    element.value = value;
                }
            }
        }
    });
}

// Interpreta o Texto Rápido
function parseQuickTextData() {
    const text = document.getElementById('quickText').value;
    const lines = text.split('\n');
    const typeLine = lines[0] || '';
    if (!typeLine.includes(':')) return;
    const typeValue = typeLine.split(':').slice(1).join(':').trim().toLowerCase();
    const contractTypeElement = document.getElementById('contractType');
    
    let contractTypeValue = '';
    if (typeValue.includes('festa infantil')) contractTypeValue = '1';
    else if (typeValue.includes('formatura infantil')) contractTypeValue = '6';
    else if (typeValue.includes('casamento civil')) contractTypeValue = '3';
    else if (typeValue.includes('casamento')) contractTypeValue = '2';
    else if (typeValue.includes('geral')) contractTypeValue = '4';
    else if (typeValue.includes('dados')) contractTypeValue = '5';
    // Adicione aqui futuros tipos (ex: else if (typeValue.includes('ensaio')) contractTypeValue = '7';)
    
    if (contractTypeValue) {
        contractTypeElement.value = contractTypeValue;
        contractTypeElement.dispatchEvent(new Event('change'));
    }

    if (typeValue.includes('formatura infantil')) {
        const formaturaKeys = [null, 'clientName', 'clientCPF', 'clientEmail', 'clientPhone', 'studentName', 'studentClass', 'clientAddress', 'formaturaPackage', 'paymentMethod', 'imageRights'];
        parseByLine(lines, formaturaKeys);
    } else if (typeValue.includes('casamento') && !typeValue.includes('civil')) {
        const casamentoKeys = [null, 'clientName', 'clientCPF', 'clientAddress', 'clientEmail', 'clientPhone', 'eventDate', 'eventTime', 'eventLocal', 'weddingPackage'];
        parseByLine(lines, casamentoKeys);
        document.getElementById('eventDuration').value = '08';
        document.getElementById('paymentMethod').value = 'Entrada e o restante dividido.';
        document.getElementById('imageRights').checked = true;
    } else if (typeValue.includes('festa infantil')) {
        const infantilKeys = [null, 'clientName', 'clientCPF', 'clientAddress', 'clientEmail', 'clientPhone', 'eventDate', 'eventTime', 'eventLocal', 'infantilPackage'];
         parseByLine(lines, infantilKeys);
    }
    else {
        // Lógica genérica de parsing
        const keyMap = {'data do evento': 'eventDate','hora de início': 'eventTime','duração (horas)': 'eventDuration','local do evento': 'eventLocal','descrição do serviço': 'package','observações / itens adicionais': 'package','pacote de casamento': 'weddingPackage','pacote festa infantil': 'infantilPackage','pacote casamento civil': 'civilPackage','valor do contrato': 'value','forma de pagamento': 'paymentMethod','regras adicionais': 'rules','nome completo': 'clientName','cpf': 'clientCPF','rg': 'clientRG','endereço': 'clientAddress','email': 'clientEmail','e-mail': 'clientEmail','telefone': 'clientPhone','autoriza uso de imagem': 'imageRights'};
         lines.forEach(line => {
            const parts = line.split(':');
            if (parts.length > 1) {
                const key = parts[0].trim().toLowerCase();
                const value = parts.slice(1).join(':').trim();
                if (keyMap[key]) {
                    const fieldId = keyMap[key];
                    const element = document.getElementById(fieldId);
                    if (!element) return;
                    if (key === 'autoriza uso de imagem') {
                        element.checked = value.toLowerCase() === 'sim';
                    } else {
                        element.value = value;
                        if (fieldId.includes('Package')) {
                            element.dispatchEvent(new Event('change'));
                        }
                    }
                }
            }
        });
    }
}


// --- 2. NOVA LÓGICA DE GERAÇÃO (O "Motor") ---

/**
 * Esta é a nova função. Ela substitui TODOS os 'generate...Contract'
 * Ela encontra o template no dbState e substitui os placeholders.
 */
function generateContractText(formData, dbState) {
    const contractType = formData.contractType;
    let selectedPackage = "";

    // 1. Descobre qual pacote foi selecionado
    switch (contractType) {
        case '1': selectedPackage = formData.infantilPackage; break;
        case '2': selectedPackage = formData.weddingPackage; break;
        case '3': selectedPackage = formData.civilPackage; break;
        case '6': selectedPackage = formData.formaturaPackage; break;
        // Tipos 4, 5, 7 etc. não têm pacotes, selectedPackage continua ""
    }
    
    // 2. Encontra o template correspondente no banco de dados (dbState)
    const template = dbState.templates.find(t => 
        t.link_tipo === contractType && 
        t.link_pacote === selectedPackage
    );

    // 3. Verifica se encontrou um template
    if (!template) {
        const typeText = document.getElementById('contractType').options[document.getElementById('contractType').selectedIndex].text;
        let errorMsg = `<h1>Erro: Template não encontrado</h1>
                        <p style="text-align: center; color: red;">
                            Nenhum template foi encontrado no banco de dados para:<br>
                            <strong>Tipo:</strong> ${typeText}<br>
                            <strong>Pacote:</strong> ${selectedPackage || '(Nenhum)'}
                        </p>
                        <p style="text-align: center;">Verifique a seção "Templates de Contrato" e certifique-se de que os vínculos estão corretos.</p>`;
        return errorMsg;
    }

    // 4. Se encontrou, começa a substituir os placeholders
    let contractHTML = template.corpo;

    // Placeholders simples (dados do formulário)
    const placeholders = {
        '{{clientName}}': formData.clientName || '[Nome do Cliente]',
        '{{clientCPF}}': formData.clientCPF || '[CPF do Cliente]',
        '{{clientRG}}': formData.clientRG || '[RG não informado]',
        '{{clientAddress}}': formData.clientAddress || '[Endereço do Cliente]',
        '{{clientEmail}}': formData.clientEmail || '[Email do Cliente]',
        '{{clientPhone}}': formData.clientPhone || '[Telefone do Cliente]',
        '{{eventDate}}': formData.eventDate ? new Date(formData.eventDate + 'T00:00:00').toLocaleDateString('pt-BR') : '[Data do Evento]',
        '{{eventTime}}': formData.eventTime || '[Hora de Início]',
        '{{eventDuration}}': formData.eventDuration || '[Duração]',
        '{{eventLocal}}': formData.eventLocal || '[Local do Evento]',
        '{{value}}': parseFloat(formData.value || 0).toFixed(2).replace('.', ','),
        '{{paymentMethod}}': formData.paymentMethod || '[Forma de Pagamento]',
        '{{package}}': formData.package || '[Descrição do Pacote]',
        '{{rules}}': formData.rules || '[Sem Cláusulas Adicionais]',
        '{{studentName}}': formData.studentName || '[Nome do Aluno]',
        '{{studentClass}}': formData.studentClass || '[Turma]',
        
        // Dados do CONTRATADO (Você!) - (Você pode adicionar isso num "config" do DB no futuro)
        '{{contratadoName}}': "Wilkson Albuquerque Carvalho",
        '{{contratadoCPF}}': "646.660.003-30",
        '{{contratadoAddress}}': "Rua das Araras, 11, Imperatriz - MA",
        
        // Data Atual
        '{{currentDate}}': new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    };

    // Substitui todos os placeholders
    for (const key in placeholders) {
        // Usamos RegExp com 'g' (global) para substituir todas as ocorrências
        contractHTML = contractHTML.replace(new RegExp(key.replace(/\{\{/g, '{{').replace(/\}\}/g, '}}'), 'g'), placeholders[key]);
    }
    
    // Lógica Especial: Cláusula de Uso de Imagem
    // No seu template, use:
    // <AUTORIZA>Bloco de texto se ele autorizou</AUTORIZA>
    // <NAO_AUTORIZA>Bloco de texto se ele NÃO autorizou</NAO_AUTORIZA>
    if (formData.imageRights) {
        // Remove os blocos de "NÃO AUTORIZA"
        contractHTML = contractHTML.replace(/<NAO_AUTORIZA>[\s\S]*?<\/NAO_AUTORIZA>/g, '');
        // Remove as tags de "AUTORIZA"
        contractHTML = contractHTML.replace(/<AUTORIZA>/g, '').replace(/<\/AUTORIZA>/g, '');
    } else {
        // Remove os blocos de "AUTORIZA"
        contractHTML = contractHTML.replace(/<AUTORIZA>[\s\S]*?<\/AUTORIZA>/g, '');
        // Remove as tags de "NÃO AUTORIZA"
        contractHTML = contractHTML.replace(/<NAO_AUTORIZA>/g, '').replace(/<\/NAO_AUTORIZA>/g, '');
    }
    
    // 5. Retorna o HTML final
    return contractHTML;
}


// --- 3. INICIALIZAÇÃO DOS LISTENERS (O "HUB" principal) ---

export function initGeradorListeners() {
    
    const tabForm = document.getElementById('tab-form');
    const tabText = document.getElementById('tab-text');
    const contentForm = document.getElementById('content-form');
    const contentText = document.getElementById('content-text');
    const contractForm = document.getElementById('contractForm');
    const generateButton = document.getElementById('generateButton');
    const outputSection = document.getElementById('outputSection');
    const contractOutput = document.getElementById('contractOutput');
    const quickText = document.getElementById('quickText');

    let activeTab = 'form';

    // --- Listeners das Abas (Inalterado) ---
    tabForm.addEventListener('click', () => {
        activeTab = 'form';
        tabForm.classList.add('active');
        tabText.classList.remove('active');
        contentForm.classList.remove('hidden');
        contentText.classList.add('hidden');
    });

    tabText.addEventListener('click', () => {
        activeTab = 'text';
        tabText.classList.add('active');
        tabForm.classList.remove('active');
        contentText.classList.remove('hidden');
        contentForm.classList.add('hidden');
    });
    
    // --- Listener do Botão Gerar (MODIFICADO) ---
    generateButton.addEventListener('click', () => {
        if (activeTab === 'text') {
            parseQuickTextData(); // Preenche o formulário a partir do texto
        }
        
        if (!contractForm.checkValidity()) {
            contractForm.reportValidity();
            outputSection.classList.remove('hidden');
            contractOutput.innerHTML = `<h1>Erro na Validação</h1><p style="text-align: center; color: red;">Por favor, preencha todos os campos obrigatórios no formulário detalhado.</p>`;
            return;
        }
        
        const formData = getFormData(); // Pega os dados do formulário
        
        // CHAMA A NOVA FUNÇÃO DE GERAÇÃO
        // Usa o 'window.app.getDbState()' para buscar o dbState mais recente
        const contractHTML = generateContractText(formData, window.app.getDbState());
        
        contractOutput.innerHTML = contractHTML;
        outputSection.classList.remove('hidden');
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // --- Listeners de Copiar e Imprimir (Inalterado) ---
    document.getElementById('copyButton').addEventListener('click', () => {
        const textToCopy = contractOutput.innerText || contractOutput.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const msg = document.getElementById('copySuccess');
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
        });
    });

    document.getElementById('printButton').addEventListener('click', () => {
        window.print();
    });

    // --- Listeners dos Formulários (Tipo de Contrato e Pacotes) (Inalterado) ---
    // Eles continuam funcionando para mostrar/ocultar os selects de pacote
    
    document.getElementById('contractType').addEventListener('change', (e) => {
        const eventDetails = document.getElementById('eventDetails');
        const weddingPackageSection = document.getElementById('weddingPackageSection');
        const infantilPackageSection = document.getElementById('infantilPackageSection');
        const civilPackageSection = document.getElementById('civilPackageSection');
        const formaturaPackageSection = document.getElementById('formaturaPackageSection');
        const formaturaStudentDetails = document.getElementById('formaturaStudentDetails');
        const packageLabel = document.querySelector('label[for="package"]');
        const packageTextarea = document.getElementById('package');
        const clientNameLabel = document.getElementById('clientNameLabel');
        
        weddingPackageSection.classList.add('hidden');
        infantilPackageSection.classList.add('hidden');
        civilPackageSection.classList.add('hidden');
        formaturaPackageSection.classList.add('hidden');
        formaturaStudentDetails.classList.add('hidden');
        eventDetails.classList.remove('hidden');
        clientNameLabel.textContent = 'Nome Completo';
        document.getElementById('clientName').placeholder = 'Nome do Cliente';
        document.querySelector('label[for="eventDate"]').textContent = 'Data do Evento';

        packageLabel.textContent = 'Descrição do Serviço / Observações';
        packageTextarea.placeholder = 'Descreva o serviço ou adicione itens não inclusos no pacote.';
        packageTextarea.required = false; // Não é mais obrigatório
        
        let template = 'Selecione um tipo de contrato para ver o modelo de entrada rápida.';

        switch(e.target.value) {
            case '1': 
                infantilPackageSection.classList.remove('hidden');
                template = `Tipo de Contrato: Festa Infantil\nNome Completo: \nCPF: \nEndereço: \nEmail: \nTelefone: \nData do Evento: \nHora de Início: \nLocal do Evento: \nPacote Festa Infantil:`;
                break;
            case '2': 
                weddingPackageSection.classList.remove('hidden');
                 template = `Tipo de Contrato: Casamento\nNome Completo: \nCPF: \nEndereço: \nEmail: \nTelefone: \nData do Evento: \nHora de Início: \nLocal do Evento: \nPacote de Casamento:`;
                break;
            case '3': 
                civilPackageSection.classList.remove('hidden');
                template = `Tipo de Contrato: Casamento Civil\nNome Completo: \nCPF: \nEndereço: \nEmail: \nTelefone: \nData do Evento: \nHora de Início: \nLocal do Evento: \nPacote Casamento Civil: \nDuração (horas): \nForma de Pagamento: \nAutoriza uso de imagem: Sim`;
                break;
            case '4': 
                template = `Tipo de Contrato: Eventos em Geral\nNome Completo: \nCPF: \nEndereço: \nEmail: \nTelefone: \nData do Evento: \nHora de Início: \nLocal do Evento: \nDuração (horas): \nDescrição do Serviço: \nForma de Pagamento: \nAutoriza uso de imagem: Sim`;
                break;
            case '5': 
                eventDetails.classList.add('hidden');
                template = `Tipo de Contrato: Entrada de Dados\nNome Completo: \nCPF: \nEndereço: \nEmail: \nTelefone: \nDescrição do Serviço: `;
                break;
            case '6': 
                formaturaPackageSection.classList.remove('hidden');
                formaturaStudentDetails.classList.remove('hidden');
                clientNameLabel.textContent = 'Nome do Pai ou Mãe (Responsável)';
                document.getElementById('clientName').placeholder = 'Nome do Pai ou Mãe';
                document.querySelector('label[for="eventDate"]').textContent = 'Data do Evento Principal (Baile)';
                template = `Tipo de Contrato: Formatura Infantil\nNome do Pai ou Mãe: \nCPF: \nEmail: \nTelefone: \nNome do Formando(a): \nTurma: \nEndereço: \nPacote Formatura Infantil: \nForma de Pagamento: \nAutoriza uso de imagem: Sim`;
                break;
            // Adicione aqui o 'case 7' para 'Ensaio' se você o adicionou
        }
        quickText.value = template;
    });
    
    // -- Listeners de Pacotes (para preencher valor) (Inalterado) --
    document.getElementById('weddingPackage').addEventListener('change', (e) => {
        const packageValue = e.target.value;
        const valueInput = document.getElementById('value');
        let totalValue = '';
        switch (packageValue) {
            case 'AMOR ETERNO (4x de R$ 1.050,00)': totalValue = '4200.00'; break;
            case 'ALIANÇAS DOURADAS (4x de R$ 925,00)': totalValue = '3700.00'; break;
            case 'LUA DE MEL (3x de R$ 950,00)': totalValue = '2850.00'; break;
            case 'MEMÓRIAS (3x de R$ 800,00)': totalValue = '2400.00'; break;
        }
        valueInput.value = totalValue;
    });
    
    document.getElementById('infantilPackage').addEventListener('change', (e) => {
        const packageValue = e.target.value;
        const valueInput = document.getElementById('value');
        let totalValue = '';
        switch (packageValue) {
            case 'Diamante (4x de R$ 650,00)': totalValue = '2600.00'; break;
            case 'Ouro (3x de R$ 600,00)': totalValue = '1800.00'; break;
            case 'Prata (2x de R$ 600,00)': totalValue = '1200.00'; break;
            case 'Bronze (2x de R$ 550,00)': totalValue = '1100.00'; break;
        }
        valueInput.value = totalValue;
    });
    
    document.getElementById('civilPackage').addEventListener('change', (e) => {
        const packageValue = e.target.value;
        const valueInput = document.getElementById('value');
        let totalValue = '';
        switch (packageValue) {
            case 'Tradicional (2x de R$ 600,00)': totalValue = '1200.00'; break;
            case 'Premium (2x de R$ 750,00)': totalValue = '1500.00'; break;
            case 'Super Premium (3x de R$ 800,00)': totalValue = '2400.00'; break;
        }
        valueInput.value = totalValue;
    });
    
    document.getElementById('formaturaPackage').addEventListener('change', (e) => {
        const packageValue = e.target.value;
        const valueInput = document.getElementById('value');
        let totalValue = '';
        switch (packageValue) {
            case 'Dei Bambini (4x de R$ 649,00)': totalValue = '2596.00'; break;
            case 'Nana Coc (4x de R$ 599,00)': totalValue = '2396.00'; break;
            case 'Lepetit (4x de R$ 499,00)': totalValue = '1996.00'; break;
            case 'ABC (4x de R$ 299,00)': totalValue = '1196.00'; break;
        }
        valueInput.value = totalValue;
    });

    // --- Inicialização ---
    document.getElementById('contractType').dispatchEvent(new Event('change'));
}
