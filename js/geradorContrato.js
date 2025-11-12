// js/geradorContrato.js

// Pega os dados do formulário HTML
function getFormData() {
    const data = {};
    const fields = [
        'contractType', 'eventDate', 'eventTime', 'eventDuration', 'eventLocal', 'package', 'value', 'paymentMethod', 'rules',
        'clientName', 'clientCPF', 'clientRG',
        'clientAddress', 'clientEmail', 'clientPhone', 'imageRights', 
        'studentName', 'studentClass'
    ];
    fields.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
           data[id] = element.type === 'checkbox' ? element.checked : element.value;
        }
    });

    // LÓGICA NOVA: Pega o pacote do SELECT ÚNICO
    const packageSelect = document.getElementById('contractPackage');
    if (packageSelect && packageSelect.value) {
        // Mapeia para as chaves antigas para manter a compatibilidade
        const contractType = document.getElementById('contractType').value;
        if (contractType === '1') data.infantilPackage = packageSelect.value;
        if (contractType === '2') data.weddingPackage = packageSelect.value;
        if (contractType === '3') data.civilPackage = packageSelect.value;
        if (contractType === '6') data.formaturaPackage = packageSelect.value;
        if (contractType === '7') data.ensaioPackage = packageSelect.value; 
    }

    return data;
}

// (Função auxiliar parseByLine omitida por brevidade, mas necessária se usar o QuickText)
function parseByLine(lines, keys) { /* ... código igual ao anterior ... */ }
function parseQuickTextData() { /* ... código igual ao anterior ... */ }

// Gera o texto final substituindo os placeholders
function generateContractText(formData, dbState) {
    const contractType = formData.contractType;
    let selectedPackage = "";

    // Define qual pacote foi selecionado com base no tipo
    switch (contractType) {
        case '1': selectedPackage = formData.infantilPackage; break;
        case '2': selectedPackage = formData.weddingPackage; break;
        case '3': selectedPackage = formData.civilPackage; break;
        case '6': selectedPackage = formData.formaturaPackage; break;
        case '7': selectedPackage = formData.ensaioPackage; break;
    }
    
    // Busca o template no banco de dados (dbState.templates)
    // Procura um template que tenha o mesmo TIPO e o mesmo NOME DE PACOTE
    const template = dbState.templates.find(t => 
        t.link_tipo === contractType && 
        t.link_pacote === selectedPackage
    );

    if (!template) {
        const select = document.getElementById('contractType');
        const typeText = select.options[select.selectedIndex].text;
        let errorMsg = `<h1>Erro: Template não encontrado</h1>
                        <p style="text-align: center; color: red;">
                            Nenhum template foi encontrado para:<br>
                            <strong>Tipo:</strong> ${typeText}<br>
                            <strong>Pacote:</strong> ${selectedPackage || '(Nenhum)'}
                        </p>
                        <p style="text-align: center;">Verifique em "Templates de Contrato" se você criou um template vinculado a este pacote.</p>`;
        return errorMsg;
    }

    let contractHTML = template.corpo;

    const placeholders = {
        '{{clientName}}': formData.clientName || '[Nome do Cliente]',
        '{{clientCPF}}': formData.clientCPF || '[CPF do Cliente]',
        '{{clientRG}}': formData.clientRG || '[RG]',
        '{{clientAddress}}': formData.clientAddress || '[Endereço]',
        '{{clientEmail}}': formData.clientEmail || '[Email]',
        '{{clientPhone}}': formData.clientPhone || '[Telefone]',
        '{{eventDate}}': formData.eventDate ? new Date(formData.eventDate + 'T00:00:00').toLocaleDateString('pt-BR') : '[Data]',
        '{{eventTime}}': formData.eventTime || '[Hora]',
        '{{eventDuration}}': formData.eventDuration || '[Duração]',
        '{{eventLocal}}': formData.eventLocal || '[Local]',
        '{{value}}': parseFloat(formData.value || 0).toFixed(2).replace('.', ','),
        '{{paymentMethod}}': formData.paymentMethod || '[Pagamento]',
        '{{package}}': formData.package || '[Obs Pacote]',
        '{{rules}}': formData.rules || '',
        '{{studentName}}': formData.studentName || '[Aluno]',
        '{{studentClass}}': formData.studentClass || '[Turma]',
        '{{contratadoName}}': "Wilkson Albuquerque Carvalho",
        '{{contratadoCPF}}': "646.660.003-30",
        '{{contratadoAddress}}': "Rua das Araras, 11, Imperatriz - MA",
        '{{currentDate}}': new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    };

    for (const key in placeholders) {
        contractHTML = contractHTML.replace(new RegExp(key.replace(/\{\{/g, '{{').replace(/\}\}/g, '}}'), 'g'), placeholders[key]);
    }
    
    if (formData.imageRights) {
        contractHTML = contractHTML.replace(/<NAO_AUTORIZA>[\s\S]*?<\/NAO_AUTORIZA>/g, '');
        contractHTML = contractHTML.replace(/<AUTORIZA>/g, '').replace(/<\/AUTORIZA>/g, '');
    } else {
        contractHTML = contractHTML.replace(/<AUTORIZA>[\s\S]*?<\/AUTORIZA>/g, '');
        contractHTML = contractHTML.replace(/<NAO_AUTORIZA>/g, '').replace(/<\/NAO_AUTORIZA>/g, '');
    }
    
    return contractHTML;
}

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

    // Listeners de abas
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
    
    generateButton.addEventListener('click', () => {
        // (Lógica de validação...)
        const formData = getFormData(); 
        const contractHTML = generateContractText(formData, window.app.getDbState());
        
        contractOutput.innerHTML = contractHTML;
        outputSection.classList.remove('hidden');
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.getElementById('copyButton').addEventListener('click', () => {
        const textToCopy = contractOutput.innerText || contractOutput.textContent;
        navigator.clipboard.writeText(textToCopy);
    });

    document.getElementById('printButton').addEventListener('click', () => window.print());

    // --- LISTENER DINÂMICO DO TIPO DE CONTRATO ---
    document.getElementById('contractType').addEventListener('change', (e) => {
        const eventDetails = document.getElementById('eventDetails');
        const packageSection = document.getElementById('dynamicPackageSection'); 
        const clientNameLabel = document.getElementById('clientNameLabel');
        
        packageSection.classList.add('hidden');
        eventDetails.classList.remove('hidden');
        clientNameLabel.textContent = 'Nome Completo';
        
        const type = e.target.value;
        const dbState = window.app.getDbState();
        
        if (type === '5') eventDetails.classList.add('hidden');
        
        if (type === '6') {
            clientNameLabel.textContent = 'Nome do Pai ou Mãe (Responsável)';
            document.getElementById('formaturaStudentDetails').classList.remove('hidden');
        } else {
            document.getElementById('formaturaStudentDetails').classList.add('hidden');
        }

        // Carrega pacotes se não for "Geral" (4) ou "Entrada de Dados" (5)
        if (type !== '4' && type !== '5') {
            packageSection.classList.remove('hidden');
            // AQUI ESTÁ A MÁGICA: Chama a função global que preenche o select
            if (window.app.updatePackageSelect) {
                window.app.updatePackageSelect('contractPackage', type, dbState);
            }
        }
    });

    // --- Listener para PREENCHER O VALOR automaticamente ao selecionar o pacote ---
    const packageSelect = document.getElementById('contractPackage');
    if(packageSelect) {
        packageSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            // Pega o valor que salvamos no dataset e coloca no input de valor
            if (selectedOption && selectedOption.dataset.valor) {
                document.getElementById('value').value = selectedOption.dataset.valor;
            }
        });
    }

    // Inicialização
    document.getElementById('contractType').dispatchEvent(new Event('change'));
}
