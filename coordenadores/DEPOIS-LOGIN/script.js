// Dados de exemplo para agendamentos (em um sistema real, viriam de uma API ou banco de dados)
let agendamentos = [
    {
        id: 1,
        data: '2024-08-12',
        horario: '14:00 - 14:30',
        nome: 'João Silva',
        parentesco: 'Pai',
        contato: 'joao@email.com',
        finalidade: 'Dúvidas sobre notas do filho',
        coordenador: 'Valeria'
    },
    {
        id: 2,
        data: '2024-08-12',
        horario: '15:00 - 15:30',
        nome: 'Maria Santos',
        parentesco: 'Mãe',
        contato: '(11) 99999-9999',
        finalidade: 'Conversa sobre comportamento',
        coordenador: 'Lucia'
    },
    {
        id: 3,
        data: '2024-08-15',
        horario: '16:00 - 16:30',
        nome: 'Pedro Costa',
        parentesco: 'Responsável',
        contato: 'pedro@email.com',
        finalidade: 'Informações sobre transferência',
        coordenador: 'Vania'
    },
    {
        id: 4,
        data: '2024-08-20',
        horario: '14:30 - 15:00',
        nome: 'Ana Oliveira',
        parentesco: 'Mãe',
        contato: '(11) 88888-8888',
        finalidade: 'Dúvidas sobre matrícula',
        coordenador: 'Valeria'
    }
];

// Variáveis globais
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();
let diaSelecionado = null;

// Elementos do DOM
const modal = document.getElementById('modalAgendamentos');
const btnVerAgendamentos = document.getElementById('btnVerAgendamentos');
const btnFecharModal = document.getElementById('btnFecharModal');
const btnMesAnterior = document.getElementById('btnMesAnterior');
const btnMesProximo = document.getElementById('btnMesProximo');
const mesAnoAtual = document.getElementById('mesAnoAtual');
const calendarioGrid = document.getElementById('calendarioAgendamentos');
const diaSelecionadoSpan = document.getElementById('diaSelecionado');
const listaAgendamentos = document.getElementById('listaAgendamentos');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, configurando event listeners...');
    
    // Verificar se os elementos existem antes de adicionar event listeners
    if (btnVerAgendamentos) {
        console.log('Botão ver agendamentos encontrado');
        btnVerAgendamentos.addEventListener('click', abrirModal);
    } else {
        console.error('Botão ver agendamentos NÃO encontrado');
    }
    
    if (btnFecharModal) {
        console.log('Botão fechar modal encontrado');
        btnFecharModal.addEventListener('click', fecharModal);
    } else {
        console.error('Botão fechar modal NÃO encontrado');
    }
    
    if (btnMesAnterior) {
        btnMesAnterior.addEventListener('click', mesAnterior);
    }
    
    if (btnMesProximo) {
        btnMesProximo.addEventListener('click', mesProximo);
    }
    
    if (modal) {
        console.log('Modal encontrado');
        // Fechar modal ao clicar fora dele
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                fecharModal();
            }
        });
    } else {
        console.error('Modal NÃO encontrado');
    }
    
    // Fechar modal com tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            fecharModal();
        }
    });
    
    console.log('Event listeners configurados com sucesso!');
});

// Funções do Modal
function abrirModal() {
    console.log('Tentando abrir modal...');
    if (modal) {
        console.log('Modal encontrado, adicionando classe show');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        // Aguardar um pouco para o modal aparecer antes de gerar o calendário
        setTimeout(() => {
            gerarCalendario();
        }, 100);
        console.log('Modal aberto com sucesso');
    } else {
        console.error('Modal não encontrado ao tentar abrir');
    }
}

function fecharModal() {
    console.log('Tentando fechar modal...');
    if (modal) {
        console.log('Modal encontrado, removendo classe show');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        diaSelecionado = null;
        if (diaSelecionadoSpan) {
            diaSelecionadoSpan.textContent = '--';
        }
        if (listaAgendamentos) {
            listaAgendamentos.innerHTML = '<p class="sem-agendamentos">Selecione um dia para ver os agendamentos</p>';
        }
        console.log('Modal fechado com sucesso');
    } else {
        console.error('Modal não encontrado ao tentar fechar');
    }
}

// Funções de Navegação do Calendário
function mesAnterior() {
    mesAtual--;
    if (mesAtual < 0) {
        mesAtual = 11;
        anoAtual--;
    }
    gerarCalendario();
}

function mesProximo() {
    mesAtual++;
    if (mesAtual > 11) {
        mesAtual = 0;
        anoAtual++;
    }
    gerarCalendario();
}

// Função para gerar o calendário
function gerarCalendario() {
    if (!calendarioGrid || !mesAnoAtual) {
        console.error('Elementos do calendário não encontrados');
        return;
    }
    
    const nomesMeses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Atualizar título do mês
    mesAnoAtual.textContent = `${nomesMeses[mesAtual]} ${anoAtual}`;
    
    // Calcular primeiro dia do mês
    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const primeiroDiaSemana = primeiroDia.getDay();
    const totalDias = ultimoDia.getDate();
    
    // Gerar HTML do calendário
    let html = '';
    
    // Cabeçalho dos dias da semana
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    html += '<div class="dias-semana">';
    diasSemana.forEach(dia => {
        html += `<div class="dia-semana ${dia === 'Dom' ? 'domingo' : ''}">${dia}</div>`;
    });
    html += '</div>';
    
    // Dias do mês
    html += '<div class="dias-mes">';
    
    // Dias vazios no início
    for (let i = 0; i < primeiroDiaSemana; i++) {
        html += '<div class="dia-vazio"></div>';
    }
    
    // Dias do mês
    for (let dia = 1; dia <= totalDias; dia++) {
        const dataCompleta = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const agendamentosDia = agendamentos.filter(ag => ag.data === dataCompleta);
        const temAgendamentos = agendamentosDia.length > 0;
        const isHoje = new Date().toDateString() === new Date(anoAtual, mesAtual, dia).toDateString();
        const isSelecionado = diaSelecionado === dataCompleta;
        
        let classes = 'dia';
        if (isHoje) classes += ' hoje';
        if (isSelecionado) classes += ' selecionado';
        if (temAgendamentos) classes += ' com-agendamentos';
        
        html += `<div class="${classes}" data-data="${dataCompleta}" data-dia="${dia}">`;
        html += `<span class="numero-dia">${dia}</span>`;
        if (temAgendamentos) {
            html += `<span class="indicador-agendamentos">${agendamentosDia.length}</span>`;
        }
        html += '</div>';
    }
    
    html += '</div>';
    
    calendarioGrid.innerHTML = html;
    
    // Adicionar event listeners aos dias
    document.querySelectorAll('.dias-mes .dia').forEach(diaElement => {
        diaElement.addEventListener('click', function() {
            const data = this.dataset.data;
            selecionarDia(data);
        });
    });
    
    console.log('Calendário gerado com sucesso!');
}

// Função para selecionar um dia
function selecionarDia(data) {
    // Remover seleção anterior
    document.querySelectorAll('.dia').forEach(dia => dia.classList.remove('selecionado'));
    
    // Selecionar novo dia
    const diaElement = document.querySelector(`[data-data="${data}"]`);
    if (diaElement) {
        diaElement.classList.add('selecionado');
    }
    
    diaSelecionado = data;
    
    // Atualizar texto do dia selecionado
    if (diaSelecionadoSpan) {
        const dataObj = new Date(data);
        const dia = dataObj.getDate();
        const mes = dataObj.getMonth();
        const nomesMeses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        diaSelecionadoSpan.textContent = `${dia} de ${nomesMeses[mes]}`;
    }
    
    // Mostrar agendamentos do dia
    mostrarAgendamentosDia(data);
}

// Função para mostrar agendamentos de um dia específico
function mostrarAgendamentosDia(data) {
    if (!listaAgendamentos) {
        console.error('Elemento listaAgendamentos não encontrado');
        return;
    }
    
    const agendamentosDia = agendamentos.filter(ag => ag.data === data);
    
    if (agendamentosDia.length === 0) {
        listaAgendamentos.innerHTML = '<p class="sem-agendamentos">Nenhum agendamento para este dia</p>';
        return;
    }
    
    // Ordenar por horário
    agendamentosDia.sort((a, b) => {
        const horaA = a.horario.split(' - ')[0];
        const horaB = b.horario.split(' - ')[0];
        return horaA.localeCompare(horaB);
    });
    
    let html = '';
    agendamentosDia.forEach(agendamento => {
        html += `
            <div class="agendamento-item">
                <div class="agendamento-header">
                    <div class="horario">${agendamento.horario}</div>
                    <div class="coordenador">${agendamento.coordenador}</div>
                </div>
                <div class="agendamento-detalhes">
                    <div class="nome">${agendamento.nome}</div>
                    <div class="parentesco">${agendamento.parentesco}</div>
                    <div class="contato">${agendamento.contato}</div>
                    <div class="finalidade">${agendamento.finalidade}</div>
                </div>
            </div>
        `;
    });
    
    listaAgendamentos.innerHTML = html;
    console.log(`Mostrando ${agendamentosDia.length} agendamentos para ${data}`);
}
