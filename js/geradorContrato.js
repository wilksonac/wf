// js/geradorContrato.js

// ######################################################
// ARQUIVO 3: LÓGICA DO GERADOR DE CONTRATO
// ######################################################

// --- FUNÇÕES AUXILIARES DE GERAÇÃO (INTERNAS) ---
// Estas funções são usadas apenas por este arquivo e não precisam ser exportadas.

function createSignature(name, doc) {
    return `<div class="signature-section">
                <div class="signature-line"></div>
                <p class="signature-name">${name}</p>
                <p class="signature-doc">${doc}</p>
            </div>`;
}

function generateGenericContract(data) {
    const today = new Date();
    const city = "Imperatriz";
    const contractor = {
        name: "Wilkson Albuquerque Carvalho",
        cpf: "646.660.003-30",
        address: "Rua das Araras, 11, Imperatriz - MA",
        email: "wilkson@gmail.com",
        phone: "(99) 99111-1456"
    };
    const clientName = data.clientName || '[Nome do Cliente]';
    const clientCPF = data.clientCPF || '[CPF]';

    let title = 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS';
    if (data.contractType === '4') title = 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS PARA EVENTOS EM GERAL';
    if (data.contractType === '5') title = 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ENTRADA DE DADOS';

    let objectClause = `<p>O objeto do presente contrato é a prestação de serviços de ${data.package || '[Descrição do Serviço]'}.</p>`;

    return `
        <h1>${title}</h1>
        <h2>PARTES</h2>
        <p><strong>CONTRATANTE:</strong> ${clientName}, portador(a) do CPF nº ${clientCPF}, residente e domiciliado(a) em ${data.clientAddress || '[Endereço]'}.</p>
        <p><strong>CONTRATADO:</strong> ${contractor.name}, fotógrafo, portador do CPF nº ${contractor.cpf}, com endereço profissional em ${contractor.address}.</p>
        
        <h2>CLÁUSULA 1ª – DO OBJETO</h2>
        ${objectClause}
        
        <h2>CLÁUSULA 2ª – DO VALOR E PAGAMENTO</h2>
        <p>O valor total deste contrato é de R$ ${parseFloat(data.value || 0).toFixed(2)}, a ser pago da seguinte forma: ${data.paymentMethod || '[Forma de Pagamento]'}.</p>
        
        ${data.rules ? `<h2>CLÁUSULA 3ª - REGRAS ADICIONAIS</h2><p>${data.rules}</p>` : ''}
        
        <p class="date-location">${city}/MA, ${today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
        
        ${createSignature(clientName, `CPF: ${clientCPF}`)}
        ${createSignature(contractor.name, `CPF: ${contractor.cpf}`)}
    `;
}

function generateFormaturaContract(data) {
    const today = new Date();
    const city = "Imperatriz";
    const contractor = {
        name: "Wilkson Albuquerque Carvalho",
        cpf: "646.660.003-30",
        address: "Rua das Araras, 11, Imperatriz - MA",
        email: "wilkson@gmail.com",
        phone: "(99) 99111-1456"
    };
    const clientName = data.clientName || '[Nome do Pai ou Mãe]';
    const clientCPF = data.clientCPF || '[CPF]';

    const imageRightsClause = data.imageRights ? 
        '<p><strong>6.1.</strong> O(A) CONTRATANTE autoriza o CONTRATADO a utilizar as fotografias oriundas deste contrato em seu portfólio (físico e online), redes sociais, site, concursos fotográficos e exposições, com o objetivo de divulgar seu trabalho, sem que isso acarrete qualquer ônus.</p>' :
        '<p><strong>6.1.</strong> O(A) CONTRATANTE NÃO AUTORIZA o CONTRATADO a utilizar as fotografias em seu portfólio, redes sociais ou qualquer meio de divulgação.</p>';

    const packageSelection = data.formaturaPackage ? `<p><strong>Pacote Selecionado:</strong> ${data.formaturaPackage}</p>` : '';
    const observations = data.package ? `<p><strong>Observações Adicionais:</strong> ${data.package}</p>` : '';
    
    let deliverables = '';
    switch (data.formaturaPackage) {
        case 'Dei Bambini (4x de R$ 649,00)':
            deliverables = `<p>a) Álbum 20x30 com 28 páginas e estojo em madeira personalizado.<br>b) 80 (oitenta) fotos editadas.<br>c) Pen drive personalizado.<br>d) Vídeo geral do baile (brinde).</p>`;
            break;
        case 'Nana Coc (4x de R$ 599,00)':
            deliverables = `<p>a) Álbum 20x30 com 24 páginas e estojo tradicional.<br>b) 70 (setenta) fotos editadas.<br>c) Pen drive.<br>d) Vídeo geral do baile (brinde).</p>`;
            break;
        case 'Lepetit (4x de R$ 499,00)':
             deliverables = `<p>a) Álbum 20x30 com 20 páginas e estojo tradicional.<br>b) 60 (sessenta) fotos editadas.<br>c) Pen drive.<br>d) Vídeo geral do baile (brinde).</p>`;
            break;
        case 'ABC (4x de R$ 299,00)':
            deliverables = `<p>a) 50 (cinquenta) fotos editadas.<br>b) Vídeo geral do baile (brinde).<br>c) Fotos entregues via galeria online.</p>`;
            break;
        default:
            deliverables = `<p>a) [Itens a serem entregues não especificados - selecione um pacote].</p>`;
    }

     return `
        <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS – FORMATURA INFANTIL</h1>
        <h2>PARTES</h2>
        <p><strong>CONTRATANTE:</strong> ${clientName}, portador(a) do CPF nº ${clientCPF} e RG nº ${data.clientRG || '[RG]'}, residente e domiciliado(a) em ${data.clientAddress || '[Endereço]'}, responsável legal pelo(a) formando(a) <strong>${data.studentName || '[Nome do Formando(a)]'}</strong>, doravante denominado(a) CONTRATANTE.</p>
        <p><strong>CONTRATADO:</strong> ${contractor.name}, fotógrafo, portador do CPF nº ${contractor.cpf}, com endereço profissional em ${contractor.address}, e-mail: ${contractor.email}, telefone: ${contractor.phone}, doravante denominado CONTRATADO.</p>
        
        <h2>CLÁUSULA 1ª – DO OBJETO</h2>
        <p><strong>1.1.</strong> O presente contrato tem por objeto a prestação de serviços de cobertura fotográfica dos eventos relacionados à formatura infantil do(a) aluno(a) <strong>${data.studentName || '[Nome do Formando(a)]'}</strong>, da turma ${data.studentClass || '[Turma]'}.</p>
        <p><strong>1.2.</strong> O serviço contratado compreende a cobertura dos seguintes eventos: Aula da Saudade, Noite do Pijama, Fotos para Convite e o Baile de Formatura.</p>
        
        <h2>CLÁUSULA 2ª – DO PACOTE E ENTREGA DO MATERIAL</h2>
        <p><strong>2.1.</strong> O material a ser entregue pelo CONTRATADO ao(à) CONTRATANTE consiste em:</p>
        ${packageSelection}
        ${deliverables}
        ${observations}
        <p><strong>2.2.</strong> O prazo para entrega do material digital é de até 60 (sessenta) dias úteis, contados a partir da data do último evento (Baile de Formatura).</p>
        <p><strong>2.3.</strong> Fica expressamente acordado que os arquivos brutos (formato RAW) não serão entregues em nenhuma hipótese.</p>
        
        <h2>CLÁUSULA 3ª – DAS OBRIGAÇÕES</h2>
        <p><strong>3.1.</strong> Compete ao CONTRATADO: prestar o serviço com zelo, respeitar os horários e locais definidos pela comissão de formatura/escola e realizar o backup seguro dos arquivos por um período de 12 (doze) meses.</p>
        <p><strong>3.2.</strong> Compete ao CONTRATANTE: realizar os pagamentos nas datas e valores acordados e zelar para que o(a) formando(a) compareça aos eventos programados para a cobertura fotográfica.</p>
        
        <h2>CLÁUSULA 4ª – DO VALOR E FORMA DE PAGAMENTO</h2>
        <p><strong>4.1.</strong> O valor total deste contrato é de R$ ${parseFloat(data.value || 0).toFixed(2)}.</p>
        <p><strong>4.2.</strong> O pagamento será realizado da seguinte forma: ${data.paymentMethod || '[Forma de Pagamento]'}.</p>
        
        <h2>CLÁUSULA 5ª – DO CANCELAMENTO</h2>
        <p><strong>5.1.</strong> Em caso de rescisão por parte do(a) CONTRATANTE, será retido o valor equivalente a 30% do total do contrato a título de multa e despesas administrativas. Valores já pagos que excedam a multa serão devolvidos.</p>

        <h2>CLÁUSULA 6ª – DO DIREITO DE USO DE IMAGEM</h2>
        ${imageRightsClause}

        <h2>CLÁUSULA 7ª – DO FORO</h2>
        <p><strong>7.1.</strong> Fica eleito o foro da Comarca de Imperatriz, Estado do Maranhão, para dirimir quaisquer dúvidas oriundas do presente contrato.</p>
        
        <p class="date-location">${city}/MA, ${today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
        
        ${createSignature(clientName, `CPF: ${clientCPF}`)}
        ${createSignature(contractor.name, `CPF: ${contractor.cpf}`)}
    `;
}

function generateCivilContract(data) {
    const today = new Date();
    const city = "Imperatriz";
    const contractor = {
        name: "Wilkson Albuquerque Carvalho",
        cpf: "646.660.003-30",
        address: "Rua das Araras, 11, Imperatriz - MA",
        email: "wilkson@gmail.com",
        phone: "(99) 99111-1456"
    };
    const clientName = data.clientName || '[Nome do Cliente]';
    const clientCPF = data.clientCPF || '[CPF]';

    const eventDateFormatted = data.eventDate ? new Date(data.eventDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '[Data do Evento]';
    const startTime = data.eventTime || '[Hora de Início]';
    
    const imageRightsClause = data.imageRights ? 
        '<p><strong>6.1.</strong> O(A) CONTRATANTE autoriza o CONTRATADO a utilizar as fotografias oriundas deste contrato em seu portfólio (físico e online), redes sociais, site, concursos fotográficos e exposições, com o objetivo de divulgar seu trabalho, sem que isso acarrete qualquer ônus.</p>' :
        '<p><strong>6.1.</strong> O(A) CONTRATANTE NÃO AUTORIZA o CONTRATADO a utilizar as fotografias em seu portfólio, redes sociais ou qualquer meio de divulgação.</p>';

    const packageSelection = data.civilPackage ? `<p><strong>Pacote Selecionado:</strong> ${data.civilPackage}</p>` : '';
    const observations = data.package ? `<p><strong>Observações Adicionais:</strong> ${data.package}</p>` : '';
    
    let deliverables = '';
    switch (data.civilPackage) {
        case 'Tradicional (2x de R$ 600,00)':
            deliverables = `<p>a) 50 (cinquenta) fotos editadas.<br>b) Entrega via galeria online.</p>`;
            break;
        case 'Premium (2x de R$ 750,00)':
            deliverables = `<p>a) Todas as fotos do evento editadas em alta resolução.<br>b) Pen drive personalizado.<br>c) Caixa personalizada.</p>`;
            break;
        case 'Super Premium (3x de R$ 800,00)':
            deliverables = `<p>a) Todas as fotos do evento em alta resolução.<br>b) Pen drive personalizado.<br>c) Caixa personalizada.<br>d) Álbum 20x30 com 20 páginas.</p>`;
            break;
        default:
            deliverables = `<p>a) [Itens a serem entregues não especificados - selecione um pacote].</p>`;
    }

    return `
        <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS – CASAMENTO CIVIL</h1>
        <h2>PARTES</h2>
        <p><strong>CONTRATANTE:</strong> ${clientName}, portador(a) do CPF nº ${clientCPF} e RG nº ${data.clientRG || '[RG]'}, residente e domiciliado(a) em ${data.clientAddress || '[Endereço]'}, doravante denominado(a) CONTRATANTE.</p>
        <p><strong>CONTRATADO:</strong> ${contractor.name}, fotógrafo, portador do CPF nº ${contractor.cpf}, com endereço profissional em ${contractor.address}, e-mail: ${contractor.email}, telefone: ${contractor.phone}, doravante denominado CONTRATADO.</p>
        
        <h2>CLÁUSULA 1ª – DO OBJETO</h2>
        <p><strong>1.1.</strong> O presente contrato tem por objeto a prestação de serviços de cobertura fotográfica da cerimônia de casamento civil e/ou recepção do(a) CONTRATANTE, a ser realizado(a) em ${eventDateFormatted}.</p>
        <p><strong>1.2.</strong> O serviço contratado compreende a cobertura fotográfica por ${data.eventDuration || '[Nº]'} horas consecutivas, a partir das ${startTime}, incluindo os principais momentos do evento, como a cerimônia no cartório/local, fotos protocolares com familiares e padrinhos, e a recepção (se houver).</p>
        
        <h2>CLÁUSULA 2ª – DO PACOTE E ENTREGA DO MATERIAL</h2>
        ${packageSelection}
        ${deliverables}
        ${observations}
        <p><strong>2.2.</strong> O prazo para entrega da galeria online para seleção (se aplicável) e/ou entrega final do material digital é de até 30 (trinta) dias úteis, contados a partir do primeiro dia útil após a data do evento.</p>
        <p><strong>2.3.</strong> Fica expressamente acordado que os arquivos brutos (formato RAW) não serão entregues em nenhuma hipótese.</p>
        
        <h2>CLÁUSULA 3ª – DAS OBRIGAÇÕES</h2>
        <p><strong>3.1.</strong> Compete ao CONTRATADO: prestar o serviço com zelo, respeitar os horários acordados e realizar o backup seguro dos arquivos por um período de 12 (doze) meses.</p>
        <p><strong>3.2.</strong> Compete ao CONTRATANTE: realizar os pagamentos, fornecer as condições necessárias para a execução do trabalho e informar sobre momentos específicos que deseje registrar.</p>

        <h2>CLÁUSULA 4ª – DO VALOR E FORMA DE PAGAMENTO</h2>
        <p><strong>4.1.</strong> O valor total deste contrato é de R$ ${parseFloat(data.value || 0).toFixed(2)}.</p>
        <p><strong>4.2.</strong> O pagamento será realizado da seguinte forma: ${data.paymentMethod || '[Forma de Pagamento]'}.</p>
        
        <h2>CLÁUSULA 5ª – DA REMARCAÇÃO E CANCELAMENTO</h2>
        <p><strong>5.1.</strong> Remarcação pelo CONTRATANTE: Deve ser solicitada por escrito com no mínimo 30 dias de antecedência e a nova data estará sujeita à disponibilidade na agenda do CONTRATADO.</p>
        <p><strong>5.2.</strong> Cancelamento pelo CONTRATANTE (Rescisão): Em caso de rescisão, o valor do sinal será retido a título de multa. Se o cancelamento ocorrer com menos de 30 dias de antecedência, a multa será de 50% do valor total do contrato.</p>
        <p><strong>5.3.</strong> Impossibilidade do CONTRATADO: Em caso de força maior, o CONTRATADO enviará um substituto qualificado ou, se não for possível, devolverá integralmente os valores pagos.</p>

        <h2>CLÁUSULA 6ª – DO DIREITO DE USO DE IMAGEM</h2>
        ${imageRightsClause}

        <h2>CLÁUSULA 7ª – DO FORO</h2>
        <p><strong>7.1.</strong> Fica eleito o foro da Comarca de Imperatriz, Estado do Maranhão, para dirimir quaisquer dúvidas oriundas do presente contrato.</p>
        
        <p class="date-location">${city}/MA, ${today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
        
        ${createSignature(clientName, `CPF: ${clientCPF}`)}
        ${createSignature(contractor.name, `CPF: ${contractor.cpf}`)}
    `;
}

function generateInfantilContract(data) {
    const today = new Date();
    const city = "Imperatriz";
    const contractor = {
        name: "Wilkson Albuquerque Carvalho",
        cpf: "646.660.003-30",
        address: "Rua das Araras, 11, Imperatriz - MA",
        email: "wilkson@gmail.com",
        phone: "(99) 99111-1456"
    };
    const clientName = data.clientName || '[Nome do Cliente]';
    const clientCPF = data.clientCPF || '[CPF]';

    const eventDateFormatted = data.eventDate ? new Date(data.eventDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '[Data do Evento]';
    const startTime = data.eventTime || '[Hora de Início]';
    let endTime = '[Hora de Término]';
    if(data.eventTime && data.eventDuration) {
        const [hours, minutes] = data.eventTime.split(':').map(Number);
        const startDateTime = new Date();
        startDateTime.setHours(hours, minutes, 0, 0);
        startDateTime.setHours(startDateTime.getHours() + Number(data.eventDuration));
        endTime = startDateTime.toTimeString().substring(0,5);
    }

    const imageRightsClause = data.imageRights ? 
        '<p><strong>6.1.</strong> O(A) CONTRATANTE autoriza o CONTRATADO a utilizar as fotografias oriundas deste contrato em seu portfólio (físico e online), redes sociais, site, concursos fotográficos e exposições, com o objetivo de divulgar seu trabalho, sem que isso acarrete qualquer ônus.</p>' :
        '<p><strong>6.1.</strong> O(A) CONTRATANTE NÃO AUTORIZA o CONTRATADO a utilizar as fotografias em seu portfólio, redes sociais ou qualquer meio de divulgação.</p>';

    const packageSelection = data.infantilPackage ? `<p><strong>Pacote Selecionado:</strong> ${data.infantilPackage}</p>` : '';
    const observations = data.package ? `<p><strong>Observações Adicionais:</strong> ${data.package}</p>` : '';
    
    let deliverables = '';
    switch (data.infantilPackage) {
        case 'Diamante (4x de R$ 650,00)':
            deliverables = `<p>a) 20 (vinte) fotos do ensaio.<br>b) Todas as fotos do evento em alta resolução.<br>c) Pequeno vídeo para Reels (captado por celular).<br>d) Álbum 20x30 com 28 páginas e estojo.<br>e) Pen drive personalizado.</p>`;
            break;
        case 'Ouro (3x de R$ 600,00)':
            deliverables = `<p>a) Todas as fotos do evento em alta resolução.<br>b) Álbum 20x30 com 20 páginas e estojo.<br>c) Pen drive personalizado.</p>`;
            break;
        case 'Prata (2x de R$ 600,00)':
            deliverables = `<p>a) Todas as fotos do evento em alta resolução.<br>b) Pen drive personalizado.</p>`;
            break;
        case 'Bronze (2x de R$ 550,00)':
            deliverables = `<p>a) 100 (cem) fotos da festa.<br>b) Fotos entregues via galeria online.</p>`;
            break;
        default:
            deliverables = `<p>a) [Itens a serem entregues não especificados - selecione um pacote].</p>`;
    }

    return `
        <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS – EVENTO INFANTIL</h1>
        <h2>PARTES</h2>
        <p><strong>CONTRATANTE:</strong> ${clientName}, portador(a) do CPF nº ${clientCPF} e RG nº ${data.clientRG || '[RG]'}, residente e domiciliado(a) em ${data.clientAddress || '[Endereço]'}, doravante denominado(a) CONTRATANTE.</p>
        <p><strong>CONTRATADO:</strong> ${contractor.name}, fotógrafo, portador do CPF nº ${contractor.cpf}, com endereço profissional em ${contractor.address}, e-mail: ${contractor.email}, telefone: ${contractor.phone}, doravante denominado CONTRATADO.</p>
        
        <h2>CLÁUSULA 1ª – DO OBJETO</h2>
        <p><strong>1.1.</strong> O presente contrato tem por objeto a prestação de serviços de cobertura fotográfica da festa infantil a ser realizada em ${eventDateFormatted}.</p>
        <p><strong>1.2.</strong> O serviço contratado compreende a cobertura fotográfica por ${data.eventDuration || '[Nº]'} horas consecutivas, com início às ${startTime} e término às ${endTime}, incluindo os principais momentos do evento, como a recepção dos convidados, decoração, brincadeiras, o momento do "Parabéns" e fotos com familiares.</p>

        <h2>CLÁUSULA 2ª – DO PACOTE E ENTREGA DO MATERIAL</h2>
        ${packageSelection}
        ${deliverables}
        ${observations}
        <p><strong>2.2.</strong> O prazo para entrega do material digital é de até 60 (sessenta) dias úteis, contados a partir do primeiro dia útil após a data do evento.</p>
        <p><strong>2.3.</strong> Fica expressamente acordado que os arquivos brutos (formato RAW) não serão entregues em nenhuma hipótese.</p>
        
        <h2>CLÁUSULA 3ª – DAS OBRIGAÇÕES</h2>
        <p><strong>3.1.</strong> Compete ao CONTRATADO: prestar o serviço com zelo, utilizar equipamento profissional adequado, respeitar os horários acordados e realizar o backup seguro dos arquivos por um período de 12 (doze) meses.</p>
        <p><strong>3.2.</strong> Compete ao CONTRATANTE: realizar os pagamentos nas datas acordadas, fornecer as condições necessárias para a execução do trabalho e informar sobre momentos específicos de interesse.</p>
        
        <h2>CLÁUSULA 4ª – DO VALOR E FORMA DE PAGAMENTO</h2>
        <p><strong>4.1.</strong> O valor total deste contrato é de R$ ${parseFloat(data.value || 0).toFixed(2)}.</p>
        <p><strong>4.2.</strong> O pagamento será realizado da seguinte forma: ${data.paymentMethod || '[Forma de Pagamento]'}.</p>
        
        <h2>CLÁUSULA 5ª – DA REMARCAÇÃO E CANCELAMENTO</h2>
        <p><strong>5.1.</strong> A solicitação de remarcação deve ser feita por escrito com no mínimo 30 dias de antecedência e a nova data estará sujeita à disponibilidade na agenda do CONTRATADO.</p>
        <p><strong>5.2.</strong> Em caso de rescisão por parte do(a) CONTRATANTE, será retido o valor do sinal a título de multa. Se o cancelamento ocorrer com menos de 30 dias de antecedência, a multa será de 50% do valor total do contrato.</p>
        <p><strong>5.3.</strong> Na eventualidade de o CONTRATADO não poder comparecer por motivo de força maior, ele se compromete a enviar outro fotógrafo qualificado. Caso não seja possível, o contrato será rescindido e todos os valores pagos serão devolvidos integralmente.</p>

        <h2>CLÁUSULA 6ª – DO DIREITO DE USO DE IMAGEM</h2>
        ${imageRightsClause}

        <h2>CLÁUSULA 7ª – DO FORO</h2>
        <p><strong>7.1.</strong> Fica eleito o foro da Comarca de Imperatriz, Estado do Maranhão, para dirimir quaisquer dúvidas oriundas do presente contrato.</p>

        <p class="date-location">${city}/MA, ${today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
        
        ${createSignature(clientName, `CPF: ${clientCPF}`)}
        ${createSignature(contractor.name, `CPF: ${contractor.cpf}`)}
        `;
}

function generateWeddingContract(data) {
    const today = new Date();
    const city = "Imperatriz";
    const contractor = {
        name: "Wilkson Albuquerque Carvalho",
        cpf: "646.660.003-30",
        address: "Rua das Araras, 11, Imperatriz - MA",
        email: "wilkson@gmail.com",
        phone: "(99) 99111-1456"
    };
    const clientName = data.clientName || '[Nome do Cliente]';
    const clientCPF = data.clientCPF || '[CPF]';

    const eventDateFormatted = data.eventDate ? new Date(data.eventDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '[Data do Evento]';
    const startTime = data.eventTime || '[Hora de Início]';
    let endTime = '[Hora de Término]';
    if(data.eventTime && data.eventDuration) {
        const [hours, minutes] = data.eventTime.split(':').map(Number);
        const startDateTime = new Date();
        startDateTime.setHours(hours, minutes, 0, 0);
        startDateTime.setHours(startDateTime.getHours() + Number(data.eventDuration));
        endTime = startDateTime.toTimeString().substring(0,5);
    }

    const imageRightsClause = data.imageRights ? 
        '<p><strong>6.1.</strong> O(A) CONTRATANTE autoriza o CONTRATADO a utilizar as fotografias oriundas deste contrato em seu portfólio (físico e online), redes sociais, site, concursos fotográficos e exposições, com o objetivo de divulgar seu trabalho, sem que isso acarrete qualquer ônus.</p>' :
        '<p><strong>6.1.</strong> O(A) CONTRATANTE NÃO AUTORIZA o CONTRATADO a utilizar as fotografias em seu portfólio, redes sociais ou qualquer meio de divulgação.</p>';

    const packageSelection = data.weddingPackage ? `<p><strong>Pacote Selecionado:</strong> ${data.weddingPackage}</p>` : '';
    const observations = data.package ? `<p><strong>Observações Adicionais:</strong> ${data.package}</p>` : '';
    
    let deliverables = '';
    switch (data.weddingPackage) {
        case 'AMOR ETERNO (4x de R$ 1.050,00)':
            deliverables = `<p>a) Cobertura especial para Reels por um Story Maker Profissional.<br>b) Álbum 30x30 com estojo em madeira personalizado.<br>c) Pôster 30x45.<br>d) 30 (trinta) fotos do ensaio pré-casamento.<br>e) Todas as fotos do evento em alta resolução.<br>f) Cobertura do making of da noiva.<br>g) Cobertura completa da cerimônia e recepção.<br>h) Pen drive personalizado.</p>`;
            break;
        case 'ALIANÇAS DOURADAS (4x de R$ 925,00)':
            deliverables = `<p>a) Cobertura especial para Reels por um Story Maker Profissional.<br>b) Álbum 20x30 com estojo tradicional.<br>c) 25 (vinte e cinco) fotos do ensaio pré-casamento.<br>d) Todas as fotos do evento em alta resolução.<br>e) Cobertura do making of da noiva.<br>f) Cobertura completa da cerimônia e recepção.<br>g) Pen drive.</p>`;
            break;
        case 'LUA DE MEL (3x de R$ 950,00)':
            deliverables = `<p>a) Cobertura com dois fotógrafos.<br>b) 20 (vinte) fotos do ensaio pré-casamento.<br>c) Todas as fotos do evento em alta resolução.<br>d) Cobertura do making of da noiva.<br>e) Cobertura completa da cerimônia e recepção.<br>f) Pen drive.</p>`;
            break;
        case 'MEMÓRIAS (3x de R$ 800,00)':
            deliverables = `<p>a) Cobertura com dois fotógrafos.<br>b) Todas as fotos do evento em alta resolução.<br>c) Cobertura do making of da noiva.<br>d) Cobertura completa da cerimônia e recepção.</p>`;
            break;
        default:
            deliverables = `<p>a) [Itens a serem entregues não especificados - selecione um pacote].</p>`;
    }

    return `
        <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS</h1>
        <h2>PARTES</h2>
        <p><strong>CONTRATANTE:</strong> ${clientName}, portador(a) do CPF nº ${clientCPF} e RG nº ${data.clientRG || '[RG]'}, residente e domiciliado(a) em ${data.clientAddress || '[Endereço]'}, doravante denominado(a) CONTRATANTE.</p>
        <p><strong>CONTRATADO:</strong> ${contractor.name}, fotógrafo, portador do CPF nº ${contractor.cpf}, com endereço profissional em ${contractor.address}, e-mail: ${contractor.email}, telefone: ${contractor.phone}, doravante denominado CONTRATADO.</p>
        
        <h2>CLÁUSULA 1ª – DO OBJETO</h2>
        <p><strong>1.1.</strong> O presente contrato tem por objeto a prestação de serviços de cobertura fotográfica do casamento do(a) CONTRATANTE, a ser realizado em ${eventDateFormatted}.</p>
        <p><strong>1.2.</strong> O serviço contratado compreende a cobertura fotográfica por ${data.eventDuration || '[Nº]'} horas consecutivas, com início às ${startTime} e término às ${endTime}, e incluirá os seguintes momentos: making of, cerimônia, recepção, fotos oficiais do casal, fotos com os convidados na mesa do bolo e o lançamento do buquê.</p>
        <p><strong>1.3.</strong> O serviço será realizado por 2 (dois) fotógrafos.</p>
        
        <h2>CLÁUSULA 2ª – DO PACOTE E ENTREGA DO MATERIAL</h2>
        ${packageSelection}
        ${deliverables}
        ${observations}
        <p><strong>2.2.</strong> O prazo para entrega da galeria online com as fotos do casamento é de até 90 (noventa) dias úteis, contados a partir do primeiro dia útil após a data do evento.</p>
        <p><strong>2.3.</strong> Fica expressamente acordado que os arquivos brutos (formato RAW) não serão entregues em nenhuma hipótese.</p>
        
        <h2>CLÁUSULA 3ª – DAS OBRIGAÇÕES</h2>
        <p><strong>3.1.</strong> Compete ao CONTRATADO: prestar o serviço com zelo, respeitar os horários acordados, e realizar o backup seguro dos arquivos por um período de 12 (doze) meses.</p>
        <p><strong>3.2.</strong> Compete ao CONTRATANTE: realizar os pagamentos, fornecer alimentação e um local seguro para os equipamentos da equipe, e informar sobre momentos específicos que deseje registrar.</p>
        
        <h2>CLÁUSULA 4ª – DO VALOR E FORMA DE PAGAMENTO</h2>
        <p><strong>4.1.</strong> O valor total deste contrato é de R$ ${parseFloat(data.value || 0).toFixed(2)}.</p>
        <p><strong>4.2.</strong> O pagamento será realizado da seguinte forma: ${data.paymentMethod || '[Forma de Pagamento]'}.</p>
        
        <h2>CLÁUSULA 5ª – DA REMARCAÇÃO E CANCELAMENTO</h2>
        <p><strong>5.1. Remarcação:</strong> A solicitação deve ser feita com no mínimo 60 dias de antecedência, e a nova data está sujeita à disponibilidade. Reajustes podem ser aplicados para datas em anos seguintes.</p>
        <p><strong>5.2. Cancelamento:</strong> Serão aplicadas multas progressivas sobre o valor total do contrato, conforme a antecedência: 20% (mais de 180 dias), 35% (entre 179 e 90 dias), ou 50% (menos de 89 dias).</p>
        <p><strong>5.3. Impossibilidade do CONTRATADO:</strong> Na rara eventualidade de o CONTRATADO não poder comparecer, ele enviará um substituto qualificado com aprovação do CONTRATANTE, ou devolverá integralmente os valores pagos com multa de 20% do valor do contrato.</p>
        
        <h2>CLÁUSULA 6ª – DO DIREITO DE USO DE IMAGEM</h2>
        ${imageRightsClause}

        <h2>CLÁUSULA 7ª – DO CASO FORTUITO OU FORÇA MAIOR</h2>
        <p><strong>7.1.</strong> Nenhuma das partes será responsabilizada pelo não cumprimento de suas obrigações por eventos de força maior (desastres naturais, pandemias, etc.), devendo a data ser remarcada em comum acordo.</p>

        <h2>CLÁUSULA 8ª – DO FORO</h2>
        <p><strong>8.1.</strong> Fica eleito o foro da Comarca de Imperatriz, Estado do Maranhão, para dirimir quaisquer dúvidas oriundas do presente contrato.</p>
        
        <p class="date-location">${city}/MA, ${today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
        
        ${createSignature(clientName, `CPF: ${clientCPF}`)}
        ${createSignature(contractor.name, `CPF: ${contractor.cpf}`)}
        `;
}

function generateContractText(data) {
    if (data.contractType === '1') return generateInfantilContract(data);
    if (data.contractType === '2') return generateWeddingContract(data);
    if (data.contractType === '3') return generateCivilContract(data);
    if (data.contractType === '6') return generateFormaturaContract(data);
    
    // Padrão: Genérico (inclui tipo 4 e 5)
    return generateGenericContract(data);
}

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


// --- FUNÇÃO DE INICIALIZAÇÃO (EXPORTADA) ---
// Esta é a única função que o main.js precisa chamar.
// Ela ativa todos os listeners da seção "Gerador de Contrato".

export function initGeradorListeners() {
    
    // --- Referências aos Elementos ---
    const tabForm = document.getElementById('tab-form');
    const tabText = document.getElementById('tab-text');
    const contentForm = document.getElementById('content-form');
    const contentText = document.getElementById('content-text');
    const contractForm = document.getElementById('contractForm');
    const generateButton = document.getElementById('generateButton');
    const outputSection = document.getElementById('outputSection');
    const contractOutput = document.getElementById('contractOutput');
    const quickText = document.getElementById('quickText');

    let activeTab = 'form'; // Estado local para as abas

    // --- Listeners das Abas ---
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

    // --- Listener de Tipo de Contrato (para mostrar/ocultar campos) ---
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
        
        // Reseta tudo
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
        packageTextarea.required = true;
        
        let template = 'Selecione um tipo de contrato para ver o modelo de entrada rápida.';

        // Mostra o específico
        switch(e.target.value) {
            case '1': 
                infantilPackageSection.classList.remove('hidden');
                packageTextarea.required = false;
                template = `Tipo de Contrato: Festa Infantil\nNome Completo: \nCPF: \nEndereço: \nEmail: \nTelefone: \nData do Evento: \nHora de Início: \nLocal do Evento: \nPacote Festa Infantil:`;
                break;
            case '2': 
                weddingPackageSection.classList.remove('hidden');
                packageTextarea.required = false;
                 template = `Tipo de Contrato: Casamento\nNome Completo: \nCPF: \nEndereço: \nEmail: \nTelefone: \nData do Evento: \nHora de Início: \nLocal do Evento: \nPacote de Casamento:`;
                break;
            case '3': 
                civilPackageSection.classList.remove('hidden');
                packageTextarea.required = false;
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
                packageTextarea.required = false;
                document.querySelector('label[for="eventDate"]').textContent = 'Data do Evento Principal (Baile)';
                template = `Tipo de Contrato: Formatura Infantil\nNome do Pai ou Mãe: \nCPF: \nEmail: \nTelefone: \nNome do Formando(a): \nTurma: \nEndereço: \nPacote Formatura Infantil: \nForma de Pagamento: \nAutoriza uso de imagem: Sim`;
                break;
        }
        quickText.value = template;
    });

    // --- Listeners dos Pacotes (para preencher valor) ---
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

    // --- Listeners dos Botões Principais ---
    generateButton.addEventListener('click', () => {
        if (activeTab === 'text') {
            parseQuickTextData(); // Preenche o formulário a partir do texto
        }
        
        // Valida o formulário
        if (activeTab === 'form' && !contractForm.checkValidity()) {
            contractForm.reportValidity();
            outputSection.classList.remove('hidden');
            contractOutput.innerHTML = `<h1>Erro na Validação</h1><p style="text-align: center; color: red;">Por favor, preencha todos os campos obrigatórios no formulário detalhado.</p>`;
            return;
        }
        
        const data = getFormData(); // Pega os dados do formulário
        
        if (!data.contractType) {
             outputSection.classList.remove('hidden');
            contractOutput.innerHTML = `<h1>Erro na Geração</h1><p style="text-align: center; color: red;">O "Tipo de Contrato" é um campo obrigatório. Por favor, selecione uma opção para continuar.</p>`;
            return;
        }
        
        const contractHTML = generateContractText(data); // Gera o HTML
        contractOutput.innerHTML = contractHTML;
        outputSection.classList.remove('hidden');
        
        // Scroll suave para a saída
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

    document.getElementById('printButton').addEventListener('click', () => {
        window.print();
    });

    // --- Inicialização ---
    // Dispara o evento 'change' no início para garantir que o template de texto
    // correto seja carregado ao abrir a página.
    document.getElementById('contractType').dispatchEvent(new Event('change'));
}