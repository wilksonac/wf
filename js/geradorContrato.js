// js/geradorContrato.js

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

    // Pega o pacote do novo select único
    const packageSelect = document.getElementById('contractPackage');
    if (packageSelect && packageSelect.value) {
        // Mapeia para as chaves antigas para manter a compatibilidade com a lógica de switch
        const contractType = document.getElementById('contractType').value;
        if (contractType === '1') data.infantilPackage = packageSelect.value;
        if (contractType === '2') data.weddingPackage = packageSelect.value;
        if (contractType === '3') data.civilPackage = packageSelect.value;
        if (contractType === '6') data.formaturaPackage = packageSelect.value;
        if (contractType === '7') data.ensaioPackage = packageSelect.value; 
    }

    return data;
}

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
                        if (year.length === 2) year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
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
    else if (typeValue.includes('ensaio')) contractTypeValue = '7';
    
    if (contractTypeValue) {
        contractTypeElement.value = contractTypeValue;
        contractTypeElement.dispatchEvent(new Event('change'));
    }
    // Lógica simplificada para preencher o resto, focando em campos comuns
    const commonKeys = [null, 'clientName', 'clientCPF', 'clientEmail', 'clientPhone', 'eventDate', 'eventTime', 'eventLocal', 'value', 'paymentMethod'];
    // (A lógica detalhada de parsing pode ser expandida conforme necessidade)
    // Por enquanto mantemos o básico para não complicar o exemplo
}

function generateContractText(formData, dbState) {
    const contractType = formData.contractType;
    let selectedPackage = "";

    switch (contractType) {
        case '1': selectedPackage = formData.infantilPackage; break;
        case '2': selectedPackage = formData.weddingPackage; break;
        case '3': selectedPackage = formData.civilPackage; break;
        case '6': selectedPackage = formData.formaturaPackage; break;
        case '7': selectedPackage = formData.ensaioPackage; break;
    }
    
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
                        <p style="text-align: center;">Verifique em "Templates de Contrato" se você criou um template para este pacote exato.</p>`;
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
        if (activeTab === 'text') { parseQuickTextData(); }
        
        if (!contractForm.checkValidity()) {
            contractForm.reportValidity();
            outputSection.classList.remove('hidden');
            contractOutput.innerHTML = `<p style="color: red; text-align:center">Preencha os campos obrigatórios.</p>`;
            return;
        }
        
        const formData = getFormData(); 
        const contractHTML = generateContractText(formData, window.app.getDbState());
        
        contractOutput.innerHTML = contractHTML;
        outputSection.classList.remove('hidden');
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.getElementById('copyButton').addEventListener('click', () => {
        const textToCopy = contractOutput.innerText || contractOutput.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const msg = document.getElementById('copySuccess');
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
        });
    });

    document.getElementById('printButton').addEventListener('click', () => window.print());

    // --- LISTENER DINÂMICO DO TIPO DE CONTRATO ---
    document.getElementById('contractType').addEventListener('change', (e) => {
        const eventDetails = document.getElementById('eventDetails');
        const packageSection = document.getElementById('dynamicPackageSection'); 
        const clientNameLabel = document.getElementById('clientNameLabel');
        const quickText = document.getElementById('quickText');
        
        packageSection.classList.add('hidden');
        eventDetails.classList.remove('hidden');
        clientNameLabel.textContent = 'Nome Completo';
        
        const type = e.target.value;
        const dbState = window.app.getDbState();
        
        if (type === '5') eventDetails.classList.add('hidden');
        
        if (type === '6') {
            clientNameLabel.textContent = 'Nome do Pai ou Mãe (Responsável)';
            document.querySelector('label[for="eventDate"]').textContent = 'Data do Evento Principal (Baile)';
            document.getElementById('formaturaStudentDetails').classList.remove('hidden');
        } else {
            document.querySelector('label[for="eventDate"]').textContent = 'Data do Evento';
            document.getElementById('formaturaStudentDetails').classList.add('hidden');
        }

        // Carrega pacotes se não for "Geral" ou "Entrada de Dados"
        if (type !== '4' && type !== '5') {
            packageSection.classList.remove('hidden');
            if (window.app.updatePackageSelect) {
                window.app.updatePackageSelect('contractPackage', type, dbState);
            }
        }
        
        quickText.value = `Selecione um tipo para ver o modelo.`;
    });

    // Listener para preencher o valor ao selecionar um pacote
    document.getElementById('contractPackage').addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        if (selectedOption && selectedOption.dataset.valor) {
            document.getElementById('value').value = selectedOption.dataset.valor;
        }
    });

    // Inicialização
    document.getElementById('contractType').dispatchEvent(new Event('change'));
}
