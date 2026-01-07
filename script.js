
/**
 * Função auxiliar para formatar um número como moeda*/
function formatCurrency(value) {
    const num = parseFloat(value) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Alterna a visibilidade do campo de detalhes do serviço.
 * É chamada quando um checkbox de serviço principal é marcado/desmarcado.
 * @param {HTMLInputElement} checkbox O checkbox do serviço que foi alterado.
 */
function toggleServiceDetails(checkbox) {
    // Navega até o pai mais próximo com a classe '.servico-group'
    const parentGroup = checkbox.closest('.servico-group');
    // Busca o bloco de detalhes dentro desse pai
    const detailDiv = parentGroup.querySelector('.servico-detalhe');

    if (detailDiv) {
        detailDiv.style.display = checkbox.checked ? 'block' : 'none';

        // Limpa o textarea quando o serviço é desmarcado
        if (!checkbox.checked) {
            const textarea = detailDiv.querySelector('textarea');
            if (textarea) textarea.value = '';
        }
    }
}


/**
 * Adiciona um novo item (material/peça) à tabela de itens adicionais.
 */
function addItem() {
    const descInput = document.getElementById('item_desc');
    const valorInput = document.getElementById('item_valor');
    const tbody = document.getElementById('itens_lista');

    const desc = descInput.value;
    const valor = parseFloat(valorInput.value);

    if (desc.trim() === '' || isNaN(valor) || valor <= 0) {
        alert('Por favor, preencha a descrição e um valor válido.');
        return;
    }

    const newRow = tbody.insertRow();
    // Célula de valor agora é editável
    newRow.innerHTML = `
        <td>${desc}</td>
        <td class="valor-item" contenteditable="true">${valor.toFixed(2)}</td>
        <td><button type="button" class="btn-remove" data-action="remove">🗑️</button></td>
    `;

    // Adiciona o listener de remoção e edição para a nova linha
    newRow.querySelector('.btn-remove').addEventListener('click', function () {
        removeItem(this);
    });
    newRow.querySelector('.valor-item').addEventListener('blur', function () {
        updateItemValue(this);
    });


    descInput.value = '';
    valorInput.value = '';

    calculateTotal();
}


/**
 * Atualiza o valor de um item adicional editado diretamente na tabela.
 * @param {HTMLElement} cell A célula <td> que perdeu o foco.
 */
function updateItemValue(cell) {
    let newValue = parseFloat(cell.textContent.replace(',', '.')); // Tenta converter o conteúdo

    if (isNaN(newValue) || newValue < 0) {
        alert('Valor inválido. Insira um número positivo.');
        cell.textContent = '0.00';
        newValue = 0;
    }

    cell.textContent = newValue.toFixed(2);
    calculateTotal();
}


/**
 * Remove um item da tabela de itens adicionais.
 * @param {HTMLElement} button O botão "🗑️" que foi clicado.
 */
function removeItem(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    calculateTotal();
}


/**
 * Função principal que calcula o valor total do orçamento.
 */
function calculateTotal() {
    let total = 0;

    // Somar Serviços Principais
    document.querySelectorAll('.servico-group').forEach(function (groupDiv) {
        const checkbox = groupDiv.querySelector('input[type="checkbox"]');
        const valorInput = groupDiv.querySelector('.valor-principal');

        if (checkbox && checkbox.checked && valorInput) {
            total += parseFloat(valorInput.value || 0);
        }
    });

    // Somar Itens Adicionais da tabela
    const itensAdicionais = document.querySelectorAll('#itens_lista .valor-item');
    itensAdicionais.forEach(function (item) {
        total += parseFloat(item.textContent || 0);
    });

    // Somar Outros Valores (Deslocamento/Taxas)
    const outrosCustos = document.getElementById('outros_valores');
    total += parseFloat(outrosCustos.value || 0);

    // Exibir Total Formatado
    document.getElementById('total_orcamento').textContent = formatCurrency(total);
}


/**
 * Gera uma nova página HTML formatada para impressão, com itens agrupados por categoria.
 */
function generatePrintableQuote() {
    // --- Coletar todos os dados do formulário ---

    const cliente = document.getElementById('cliente_nome').value;
    const endereco = document.getElementById('cliente_endereco').value;
    const telefone = document.getElementById('cliente_telefone').value;
    const data = document.getElementById('orcamento_data').value;
    const total = document.getElementById('total_orcamento').textContent;
    const observacoes = document.getElementById('observacoes').value;

    // Adicionada a propriedade "category"
    const serviceItems = [
        { id: 'cameras', label: 'Câmeras (Instalações/Manutenção)', category: 'Segurança Eletrônica' },
        { id: 'cerca', label: 'Cerca Elétrica', category: 'Segurança Eletrônica' },
        { id: 'instalacao', label: 'Instalação Elétrica (Nova/Reforma)', category: 'Serviços Elétricos' },
        { id: 'manutencao', label: 'Manutenção Elétrica Geral', category: 'Serviços Elétricos' }
    ];

    // MODIFICAÇÃO: Agrupar serviços selecionados por categoria
    const categorizedServices = {};
    let servicosCount = 0;

    serviceItems.forEach(item => {
        const checkbox = document.getElementById(`serv_${item.id}`);
        if (checkbox && checkbox.checked) {
            if (!categorizedServices[item.category]) {
                categorizedServices[item.category] = [];
            }

            const valorInput = document.getElementById(`val_${item.id}`);
            const descTextarea = document.getElementById(`desc_${item.id}`);
            let valor = parseFloat(valorInput.value || 0);
            let descricao = descTextarea ? descTextarea.value.trim() : '';

            categorizedServices[item.category].push({
                label: item.label,
                valor: valor,
                descricao: descricao
            });
            servicosCount++;
        }
    });

    //Construir HTML com base nas categorias
    let servicosHtml = '';
    if (servicosCount > 0) {
        for (const category in categorizedServices) {
            servicosHtml += `<div class="category-box">`;
            servicosHtml += `<h3 class="category-title">${category}</h3>`;
            servicosHtml += '<ul class="servicos-list">';
            
            categorizedServices[category].forEach(service => {
                servicosHtml += `<li class="servico-print-item">
                    <div class="servico-header">
                        <span class="servico-nome">${service.label}</span>
                        <span class="servico-valor">${formatCurrency(service.valor)}</span>
                    </div>`;

                if (service.descricao) {
                    servicosHtml += `<div class="servico-detalhes">
                        Detalhes: <span style="white-space: pre-wrap;">${service.descricao}</span>
                    </div>`;
                }
                servicosHtml += `</li>`;
            });

            servicosHtml += '</ul></div>';
        }
    } else {
        servicosHtml = "<p>Nenhum serviço principal selecionado para orçamento.</p>";
    }


    // Constrói o HTML para a tabela de itens adicionais
    let itensHtml = '<table class="itens-table"><thead><tr><th>Descrição</th><th class="valor-col">Valor</th></tr></thead><tbody>';
    const itensRows = document.querySelectorAll('#itens_lista tr');

    if (itensRows.length > 0) {
        itensRows.forEach(row => {
            const rawValue = parseFloat(row.cells[1].textContent || 0);
            itensHtml += `<tr><td>${row.cells[0].textContent}</td><td class="valor-col">${formatCurrency(rawValue)}</td></tr>`;
        });
    } else {
        itensHtml += '<tr><td colspan="2" class="no-items">Nenhum item adicional (peça, material) incluído.</td></tr>';
    }
    itensHtml += '</tbody></table>';

    // Pega os custos adicionais
    const outrosCustos = parseFloat(document.getElementById('outros_valores').value || 0);

    // Montar HTML das observações (se houver)
    let obsHtml = '';
    if (observacoes.trim() !== '') {
        obsHtml = `
            <div class="category-box">
                <h3 class="category-title">Observações Adicionais</h3>
                <div class="obs-box">
                    <p style="white-space: pre-wrap;">${observacoes}</p>
                </div>
            </div>
        `;
    }

    // Montar a nova página HTML (Com novo CSS) ---

    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
        <html>
        <head>
            <title>Orçamento - ${cliente}</title>
            <style>
                /* Variáveis e Reset Básico */
                :root {
                    --cor-primaria: #007bff; /* Azul moderno e profissional */
                    --cor-fundo-sec: #f8f9fa; /* Cinza mais claro ainda */
                    --cor-total: #28a745; /* Verde de sucesso */
                    --cor-texto: #343a40; /* Cinza escuro */
                    --cor-borda: #dee2e6;
                }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    margin: 0; 
                    padding: 0;
                    color: var(--cor-texto);
                    background-color: #fff;
                }
                .document-container {
                    width: 210mm; /* Tamanho A4 para impressão */
                    min-height: 297mm; /* Evitar quebra */
                    margin: 0 auto;
                    padding: 5mm;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                }

                /* Cabeçalho */
                header {
                    text-align: left;
                    margin-bottom: 5px;
                    border-bottom: 2px solid var(--cor-primaria);
                    padding-bottom: 5px;
                }
                header h1 {
                    color: var(--cor-primaria);
                    margin: 0 0 5px 0;
                    font-size: 2.2em;
                }
                header p { margin: 0; font-size: 0.9em; color: #6c757d; }

                main { flex: 1; } /* Empurra o rodapé para baixo */

                /* Seções e Caixas de Categoria (MODIFICADO) */
                .section-container, .category-box {
                    border: 1px solid var(--cor-borda);
                    border-radius: 8px;
                    margin-bottom: 5px;
                    background: #fff;
                    overflow: hidden; /* Garante que os filhos respeitem o border-radius */
                }
                .category-title, .section-title {
                    background-color: var(--cor-fundo-sec);
                    padding: 5px 5px;
                    margin: 0;
                    font-size: 1.2em;
                    color: var(--cor-primaria);
                    border-bottom: 1px solid var(--cor-borda);
                }
                .section-content, .info-grid {
                    padding: 5px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 10px;
                }
                .info-item p { margin: 0; line-height: 1.4; }

                /* Lista de Serviços (Dentro das caixas) */
                .servicos-list {
                    list-style: none;
                    padding: 0 5px 5px 5px;
                    margin: 0;
                }
                .servico-print-item {
                    padding: 10px 0;
                    border-bottom: 1px dashed var(--cor-borda);
                }
                .servico-print-item:last-child { border-bottom: none; }
                .servico-header {
                    display: flex;
                    justify-content: space-between;
                    font-weight: 600;
                    font-size: 1.05em;
                }
                .servico-valor { font-weight: 700; }
                .servico-detalhes {
                    margin-top: 5px;
                    font-size: 0.9em;
                    color: #6c757d;
                    padding-left: 15px;
                }
                .servico-detalhes span { font-style: italic; }

                /* Tabela de Itens */
                .itens-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: -1px; /* Compensa a borda da caixa */
                }
                .itens-table th, .itens-table td {
                    border: 1px solid var(--cor-borda);
                    padding: 10px;
                    text-align: left;
                }
                .itens-table th {
                    background-color: var(--cor-primaria);
                    color: white;
                    font-weight: 400;
                }
                .itens-table tr:nth-child(even) { background-color: var(--cor-fundo-sec); }
                .itens-table .valor-col { text-align: right; width: 120px; font-weight: 600; }
                .itens-table .no-items { font-style: italic; color: #999; text-align: center; }

                /* Total */
                .total-box {
                    text-align: right;
                    margin-top: 25px;
                    padding-top: 15px;
                    border-top: 2px solid var(--cor-primaria);
                }
                .total-display {
                    display: inline-block;
                    background-color: var(--cor-total);
                    color: white;
                    padding: 10px 20px;
                    font-size: 1.8em;
                    font-weight: bold;
                    border-radius: 6px;
                }

                /* Observações */
                .obs-box p { margin: 0; line-height: 1.6; font-size: 0.95em; padding: 0 15px 15px 15px;}

                /* Rodapé e Contato */
                footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 1px solid #ccc;
                    font-size: 0.85em;
                    color: #6c757d;
                    text-align: center;
                }
                .validade { margin-bottom: 10px; font-style: italic; }
                .contact-info { font-weight: bold; color: var(--cor-primaria); }
                .contact-info p { margin: 2px 0; }

                /* Media Print - Ajustes Finais para PÁGINA ÚNICA */
                @media print {
                    @page { size: A4; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .document-container {
                        padding: 15mm; /* Margem de impressão */
                        box-shadow: none;
                        border: none;
                        min-height: 270mm; /* Ajuste fino para altura */
                    }
                    /* Força o grid para não funcionar */
                    .info-grid { display: block; }
                    .info-item { margin-bottom: 10px; }
                    
                    /* Evitar quebra de página dentro dos elementos */
                    .section-container, .category-box, .total-box, footer {
                        page-break-inside: avoid;
                    }
                    
                    /* Cores escuras para o texto impresso */
                    * { color: #000 !important; } 
                    header h1, .contact-info, .servico-valor, .category-title { color: var(--cor-primaria) !important; }
                    .total-display { 
                        background-color: #e9ecef !important;
                        color: #000 !important;
                        border: 1px solid var(--cor-total);
                        box-shadow: none;
                    }
                    .itens-table th {
                         background-color: var(--cor-primaria) !important;
                         color: white !important;
                    }
                }

            </style>
        </head>
        <body>
            <div class="document-container">
                <header>
                    <h1>ORÇAMENTO DE SERVIÇOS</h1>
                    <p>Referente a Sistemas de Segurança e Instalações Elétricas</p>
                </header>

                <main>
                    <div class="section-container">
                        <h3 class="section-title">Dados do Cliente</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <p><strong>Cliente:</strong> ${cliente || 'Não informado'}</p>
                            </div>
                            <div class="info-item">
                                <p><strong>Endereço:</strong> ${endereco || 'Não informado'}</p>
                            </div>
                            <div class="info-item" style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                                <p><strong>Contato:</strong> ${telefone || 'Não informado'}</p>
                                <p><strong>Data:</strong> ${
                                    // Formata a data de YYYY-MM-DD para DD/MM/YYYY
                                    data ? new Date(data + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informada'
                                }</p>
                            </div>
                        </div>
                    </div>

                    ${servicosHtml}

                    <div class="category-box">
                        <h3 class="category-title">Itens Adicionais (Materiais/Peças)</h3>
                        ${itensHtml}
                    </div>

                    <div class="category-box">
                        <h3 class="category-title">Custos Adicionais</h3>
                        <div class="section-content">
                            <div class="info-item">
                                <p>Deslocamento/Taxas/Outros Custos: <strong>${formatCurrency(outrosCustos)}</strong></p>
                            </div>
                        </div>
                    </div>

                    ${obsHtml}
                </main>

                <div class="total-box">
                    <span class="total-display">
                        TOTAL: ${total}
                    </span>
                </div>

                <footer>
                    <div class="validade">
                        Orçamento válido por 15 dias, sujeito à aprovação final do escopo.
                    </div>
                    <div class="contact-info">
                        <p>-- postGit --</p>
                        <p>(87) postGit // Att. postGit</p>
                    </div>
                </footer>
            </div>
        </body>
        </html>
    `);

    // --- Acionar a impressão ---

    printWindow.document.close();
    printWindow.focus();
    // Atraso para garantir que tudo foi renderizado antes de imprimir
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

/**
 * Inicializa a aplicação após o carregamento do DOM.
 * Aplica todos os Event Listeners aqui.
 */
document.addEventListener('DOMContentLoaded', function () {
    // Botão de Adicionar Item
    document.querySelector('.item-adder button').addEventListener('click', addItem);

    // Botão de Impressão
    document.querySelector('.btn-print').addEventListener('click', generatePrintableQuote);

    // Recálculo ao mudar o campo de Custos Adicionais
    document.getElementById('outros_valores').addEventListener('input', calculateTotal);

    // Recálculo ao mudar um Serviço Principal (Checkbox ou Valor)
    document.querySelectorAll('.servico-group').forEach(function (groupDiv) {
        const checkbox = groupDiv.querySelector('input[type="checkbox"]');
        const valorInput = groupDiv.querySelector('.valor-principal');

        if (checkbox) {
            checkbox.addEventListener('change', function () {
                // Chama a função de toggle e depois recalcula o total
                toggleServiceDetails(this); 
                calculateTotal();
            });
        }
        if (valorInput) {
            valorInput.addEventListener('input', calculateTotal);
        }
    });
});