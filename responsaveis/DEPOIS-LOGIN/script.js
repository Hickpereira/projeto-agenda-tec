// Funcionalidade para os inputs de radio button da seção de agendamento
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar funcionalidade aos radio buttons
    const radioButtons = document.querySelectorAll('input[name="pessoa"]');
    const labels = document.querySelectorAll('label[for]');
    const btnConfirmar = document.getElementById('btn-confirmar-pessoa');
    let pessoaSelecionada = null;
    
    radioButtons.forEach((radio, index) => {
        radio.addEventListener('change', function() {
            // Remover seleção anterior
            labels.forEach(label => {
                label.style.background = 'linear-gradient(135deg, #87b7ff 0%, #6aa8ff 100%)';
                label.style.transform = 'translateY(0)';
                label.style.boxShadow = '0 4px 15px rgba(135, 183, 255, 0.3)';
            });
            
            // Aplicar seleção atual
            if (this.checked) {
                const currentLabel = document.querySelector(`label[for="${this.id}"]`);
                currentLabel.style.background = 'linear-gradient(135deg, #2764ff 0%, #1e5ac8 100%)';
                currentLabel.style.transform = 'translateY(-3px)';
                currentLabel.style.boxShadow = '0 8px 25px rgba(39, 100, 255, 0.4)';
                
                // Ativar botão de confirmação
                pessoaSelecionada = this.value;
                btnConfirmar.disabled = false;
                btnConfirmar.classList.add('ativo');
                btnConfirmar.textContent = `Confirmar: ${pessoaSelecionada.charAt(0).toUpperCase() + pessoaSelecionada.slice(1)}`;
                
                // Salvar coordenador selecionado
                sessionStorage.setItem('coordenador', this.value);
            }
        });
    });
    
    // Funcionalidade do botão de confirmação
    btnConfirmar.addEventListener('click', function() {
        if (pessoaSelecionada) {
            // Mostrar mensagem de confirmação
            showConfirmationMessage(pessoaSelecionada);
            
            // Desabilitar botão após confirmação
            this.disabled = true;
            this.classList.remove('ativo');
            this.textContent = 'Pessoa Confirmada ✓';
            
            // Adicionar classe de sucesso
            this.style.background = 'linear-gradient(135deg, #6c757d 0%, #495057 100%)';
            this.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
            
            // Scroll suave para a próxima seção
            setTimeout(() => {
                document.getElementById('finalidade').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 1500);
        }
    });
    
    // Função para mostrar mensagem de confirmação
    function showConfirmationMessage(pessoa) {
        const existingMessage = document.querySelector('.confirmation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const message = document.createElement('div');
        message.className = 'confirmation-message';
        message.innerHTML = `
            <div class="message-content">
                <span>🎉 Agendamento confirmado com ${pessoa.charAt(0).toUpperCase() + pessoa.slice(1)}!</span>
                <p>Redirecionando para próxima etapa...</p>
            </div>
        `;
        
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 25px 30px;
            border-radius: 25px;
            box-shadow: 0 10px 30px rgba(40, 167, 69, 0.4);
            z-index: 1000;
            text-align: center;
            animation: confirmationPop 0.5s ease;
            max-width: 90vw;
        `;
        
        const messageContent = message.querySelector('.message-content');
        messageContent.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-weight: 600;
        `;
        
        const messageText = message.querySelector('p');
        messageText.style.cssText = `
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
            font-weight: 400;
        `;
        
        document.body.appendChild(message);
        
        // Auto-remover após 3 segundos
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 3000);
    }
    
    // Adicionar CSS para animação
    if (!document.querySelector('#message-styles')) {
        const style = document.createElement('style');
        style.id = 'message-styles';
        style.textContent = `
            @keyframes confirmationPop {
                from {
                    transform: translate(-50%, -50%) scale(0.8);
                    opacity: 0;
                }
                to {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// Função para gerar calendário
function gerarCalendario(mes, ano) {
    const diasSemana = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const data = new Date(ano, mes, 1);
    const primeiroDia = data.getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    let html = '<table>';
    html += '<tr>' + diasSemana.map(d => `<th>${d}</th>`).join('') + '</tr><tr>';

    let dia = 1;
    for (let i = 0; i < 42; i++) {
        if (i < primeiroDia || dia > ultimoDia) {
            html += '<td></td>';
        } else {
            const hoje = new Date();
            const isHoje = dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
            html += `<td class="${isHoje ? 'dia-atual' : ''}" data-dia="${dia}">${dia}</td>`;
            dia++;
        }
        if ((i + 1) % 7 === 0 && i !== 41) html += '</tr><tr>';
    }
    html += '</tr></table>';

    document.getElementById('calendario').innerHTML = html;

    // Evento de clique para selecionar dia
    document.querySelectorAll('#calendario td[data-dia]').forEach(td => {
        td.addEventListener('click', () => {
            // Remover seleção anterior
            document.querySelectorAll('#calendario td').forEach(el => el.classList.remove('dia-selecionado'));
            td.classList.add('dia-selecionado');

            // Mostrar os horários
            const horariosElement = document.getElementById('horarios');
            if (horariosElement) {
                if (!horariosElement.classList.contains('visivel')) {
                    horariosElement.classList.add('visivel');

                    // Preparar para animação
                    horariosElement.style.display = 'flex';
                    horariosElement.style.opacity = 0;
                    horariosElement.style.transform = 'translateX(20px)';

                    setTimeout(() => {
                        horariosElement.style.transition = 'all 0.5s ease';
                        horariosElement.style.opacity = 1;
                        horariosElement.style.transform = 'translateX(0)';
                    }, 50);
                }

                // Scroll suave para os horários
                setTimeout(() => {
                    horariosElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
            }
        });
    });
}

// Gerar calendário do mês atual
const hoje = new Date();
gerarCalendario(hoje.getMonth(), hoje.getFullYear());

// Processo de agendamento simplificado
document.addEventListener('DOMContentLoaded', function() {
    // Capturar dados do formulário de finalidade
    const btnConfirmFinalidade = document.querySelector('.btn-confirm');
    if (btnConfirmFinalidade) {
        btnConfirmFinalidade.addEventListener('click', function() {
            const responsavel = document.querySelector('input[placeholder="Nome do responsável"]').value;
            const aluno = document.querySelector('input[placeholder="Nome do aluno"]').value;
            const finalidade = document.querySelector('textarea[placeholder="Finalidade do Atendimento"]').value;
            
            // Salvar dados temporariamente
            sessionStorage.setItem('responsavel', responsavel);
            sessionStorage.setItem('aluno', aluno);
            sessionStorage.setItem('finalidade', finalidade);
        });
    }
    
    // Capturar dados do agendamento final
    const btnAgendar = document.querySelector('.dia-horario button');
    if (btnAgendar) {
        btnAgendar.addEventListener('click', function() {
            const coordenador = sessionStorage.getItem('coordenador');
            const responsavel = sessionStorage.getItem('responsavel');
            const aluno = sessionStorage.getItem('aluno');
            const finalidade = sessionStorage.getItem('finalidade');
            const dataSelecionada = document.querySelector('.dia-selecionado');
            const horarioSelecionado = document.querySelector('.horarios input[type="checkbox"]:checked');
            
            if (coordenador && dataSelecionada && horarioSelecionado) {
                const data = new Date();
                data.setDate(parseInt(dataSelecionada.textContent));
                
                const horario = horarioSelecionado.parentElement.querySelector('span').textContent;
                
                const novoAgendamento = {
                    coordenador: coordenador,
                    responsavel: responsavel || 'Não informado',
                    aluno: aluno || 'Não informado',
                    finalidade: finalidade || 'Não informado',
                    data: data.toISOString(),
                    horario: horario,
                    dataCriacao: new Date().toISOString()
                };
                
                // Adicionar agendamento
                if (window.adicionarAgendamento) {
                    window.adicionarAgendamento(novoAgendamento);
                }
                
                // Limpar dados temporários
                sessionStorage.clear();
                
                // Resetar formulário
                document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
                document.querySelectorAll('input[type="text"], textarea').forEach(input => input.value = '');
                document.querySelectorAll('.dia-selecionado').forEach(el => el.classList.remove('dia-selecionado'));
                document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
                
                // Resetar botão de confirmação
                const btnConfirmar = document.getElementById('btn-confirmar-pessoa');
                if (btnConfirmar) {
                    btnConfirmar.disabled = true;
                    btnConfirmar.classList.remove('ativo');
                    btnConfirmar.textContent = 'Confirmar Pessoa';
                    btnConfirmar.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                    btnConfirmar.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                }
                
                // Ocultar horários
                const horariosElement = document.getElementById('horarios');
                if (horariosElement) {
                    horariosElement.classList.remove('visivel');
                    horariosElement.style.display = 'none';
                }
                
                // Mostrar mensagem de sucesso
                setTimeout(() => {
                    showNotification('Agendamento realizado', 'Agendamento realizado com sucesso! Verifique a aba de agendamentos.', 'success');
                }, 500);
                
            } else {
                showNotification('Erro de agendamento', 'Por favor, complete todas as etapas do agendamento:\n\n1. Selecione um coordenador\n2. Preencha os dados da finalidade\n3. Escolha uma data\n4. Selecione um horário', 'error');
            }
        });
    }
});

// FUNCIONALIDADE DA ABA FLUTUANTE DE AGENDAMENTOS
document.addEventListener('DOMContentLoaded', function() {
    // Elementos da aba flutuante
    const tabToggle = document.getElementById('tabToggle');
    const tabContent = document.getElementById('tabContent');
    const scheduleList = document.getElementById('scheduleList');
    const noSchedules = document.getElementById('noSchedules');
    const floatingTab = document.getElementById('floatingScheduleTab');
    
    // Botão de agendamento no header
    const btnAgendamento = document.querySelector('.botao-topo button');
    
    // Estado da aba
    let isTabCollapsed = false;
    let isTabVisible = false;
    
    // Dados de agendamentos do localStorage
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    
    // Função para alternar a aba
    function toggleTab() {
        isTabCollapsed = !isTabCollapsed;
        
        if (isTabCollapsed) {
            tabContent.classList.add('collapsed');
            tabToggle.textContent = '▶';
            tabToggle.style.transform = 'rotate(-90deg)';
        } else {
            tabContent.classList.remove('collapsed');
            tabToggle.textContent = '▼';
            tabToggle.style.transform = 'rotate(0deg)';
        }
    }
    
    // Função para mostrar a aba flutuante
    function showFloatingTab() {
        if (!isTabVisible) {
            floatingTab.classList.add('show');
            isTabVisible = true;
            
            // Renderizar agendamentos quando a aba for mostrada
            renderizarAgendamentos();
        }
    }
    
    // Função para ocultar a aba flutuante
    function hideFloatingTab() {
        if (isTabVisible) {
            floatingTab.classList.remove('show');
            isTabVisible = false;
        }
    }
    
    // Função para formatar data
    function formatarData(data) {
        const opcoes = { 
            weekday: 'short', 
            day: '2-digit', 
            month: 'short',
            year: 'numeric'
        };
        return new Date(data).toLocaleDateString('pt-BR', opcoes);
    }
    
    // Função para formatar hora
    function formatarHora(hora) {
        return hora;
    }
    
    // Função para renderizar agendamentos
    function renderizarAgendamentos() {
        if (agendamentos.length === 0) {
            scheduleList.style.display = 'none';
            noSchedules.style.display = 'block';
        } else {
            scheduleList.style.display = 'block';
            noSchedules.style.display = 'none';
            
            // Ordenar agendamentos por data
            agendamentos.sort((a, b) => new Date(a.data) - new Date(b.data));
            
            scheduleList.innerHTML = agendamentos.map((agendamento, index) => `
                <div class="schedule-item" style="animation-delay: ${index * 0.1}s">
                    <div class="schedule-header">
                        <div class="schedule-date">${formatarData(agendamento.data)}</div>
                        <div class="schedule-time">${formatarHora(agendamento.horario)}</div>
                    </div>
                    <div class="schedule-coordinator">${agendamento.coordenador}</div>
                    ${agendamento.finalidade ? `<div class="schedule-purpose">${agendamento.finalidade}</div>` : ''}
                </div>
            `).join('');
        }
    }
    
    // Função para adicionar novo agendamento
    function adicionarAgendamento(agendamento) {
        agendamentos.push(agendamento);
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        renderizarAgendamentos();
        atualizarIndicadorBotao();
        
        // Mostrar notificação moderna
        showNotification(
            'Agendamento Adicionado', 
            `Agendamento com ${agendamento.coordenador} para ${agendamento.data ? new Date(agendamento.data).toLocaleDateString('pt-BR') : 'data não informada'} foi adicionado com sucesso!`,
            'success'
        );
    }
    

    
    // Função para mostrar notificação moderna
    function showNotification(title, message, type = 'success', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? '✅' : 
                    type === 'error' ? '❌' : 
                    type === 'warning' ? '⚠️' : 'ℹ️';
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
            <div class="notification-progress"></div>
        `;
        
        // Adicionar ao container
        container.appendChild(notification);
        
        // Event listener para fechar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            removeNotification(notification);
        });
        
        // Auto-remover após duração
        setTimeout(() => {
            removeNotification(notification);
        }, duration);
        
        return notification;
    }
    
    // Função para remover notificação
    function removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideOutNotification 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }
    
    // Função para mostrar modal de confirmação
    function showConfirmationModal(title, message, onConfirm) {
        const modal = document.getElementById('confirmationModal');
        const modalTitle = document.getElementById('confirmationTitle');
        const modalMessage = document.getElementById('confirmationMessage');
        
        // Configurar conteúdo do modal
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        // Mostrar modal
        modal.classList.add('show');
        
        // Função para fechar modal
        const closeModal = () => {
            modal.classList.remove('show');
        };
        
        // Event listeners
        const confirmBtn = document.getElementById('confirmationConfirm');
        const cancelBtn = document.getElementById('confirmationCancel');
        
        // Remover listeners anteriores e adicionar novos
        confirmBtn.onclick = () => {
            closeModal();
            onConfirm();
        };
        
        cancelBtn.onclick = closeModal;
        
        // Fechar ao clicar fora
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };

        
        
        // Fechar com ESC
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
    
    // Função para atualizar indicador visual do botão
    function atualizarIndicadorBotao() {
        if (btnAgendamento) {
            if (agendamentos.length > 0) {
                btnAgendamento.innerHTML = `agendamento <span class="badge">${agendamentos.length}</span>`;
            } else {
                btnAgendamento.innerHTML = 'agendamento';
            }
        }
    }
    
    // Event listeners
    tabToggle.addEventListener('click', toggleTab);
    
    // Botão de agendamento no header
    if (btnAgendamento) {
        btnAgendamento.addEventListener('click', function() {
            showFloatingTab();
        });
    }
    
    // Fechar aba quando clicar fora dela
    document.addEventListener('click', function(event) {
        if (isTabVisible && !floatingTab.contains(event.target) && !btnAgendamento.contains(event.target)) {
            hideFloatingTab();
        }
    });
    
    // Fechar aba com tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && isTabVisible) {
            hideFloatingTab();
        }
    });
    
    // Botão de limpar agendamentos
    const clearSchedulesBtn = document.getElementById('clearSchedules');
    console.log('Botão de limpar encontrado:', clearSchedulesBtn);
    
    if (clearSchedulesBtn) {
        clearSchedulesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão de limpar clicado!');
            
            showConfirmationModal(
                'Limpar Agendamentos',
                'Tem certeza que deseja remover todos os agendamentos? Esta ação não pode ser desfeita.',
                () => {
                    console.log('Confirmando limpeza dos agendamentos');
                    agendamentos = [];
                    localStorage.removeItem('agendamentos');
                    renderizarAgendamentos();
                    atualizarIndicadorBotao();
                    showNotification(
                        'Agendamentos Removidos',
                        'Todos os agendamentos foram removidos com sucesso!',
                        'warning'
                    );
                }
            );
        });
        
        console.log('Event listener adicionado ao botão de limpar');
    } else {
        console.error('Botão de limpar agendamentos não encontrado!');
    }
    

    
    // Expor função globalmente para ser usada no processo de agendamento
    window.adicionarAgendamento = adicionarAgendamento;
    
    // Inicializar indicador do botão
    atualizarIndicadorBotao();
    
    // Configurar botão de limpar após renderização inicial
    setTimeout(() => {
        const clearSchedulesBtn = document.getElementById('clearSchedules');
        if (clearSchedulesBtn) {
            console.log('Configurando botão de limpar após renderização');
            clearSchedulesBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão de limpar clicado!');
                
                showConfirmationModal(
                    'Limpar Agendamentos',
                    'Tem certeza que deseja remover todos os agendamentos? Esta ação não pode ser desfeita.',
                    () => {
                        console.log('Confirmando limpeza dos agendamentos');
                        agendamentos = [];
                        localStorage.removeItem('agendamentos');
                        renderizarAgendamentos();
                        atualizarIndicadorBotao();
                        showNotification(
                            'Agendamentos Removidos',
                            'Todos os agendamentos foram removidos com sucesso!',
                            'warning'
                        );
                    }
                );
            };
        }
    }, 100);
    
    // Teste direto do botão de limpar
setTimeout(() => {
    const clearSchedulesBtn = document.getElementById('clearSchedules');
    if (clearSchedulesBtn) {
        console.log('Teste direto: Configurando botão de limpar');
        
        // Remover todos os event listeners anteriores
        const newBtn = clearSchedulesBtn.cloneNode(true);
        clearSchedulesBtn.parentNode.replaceChild(newBtn, clearSchedulesBtn);
        
        // Adicionar novo event listener
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('TESTE: Botão de limpar clicado!');
            
            showConfirmationModal(
                'Limpar Agendamentos',
                'Tem certeza que deseja remover todos os agendamentos? Esta ação não pode ser desfeita.',
                () => {
                    console.log('Confirmando limpeza dos agendamentos');
                    agendamentos = [];
                    localStorage.removeItem('agendamentos');
                    renderizarAgendamentos();
                    atualizarIndicadorBotao();
                    showNotification(
                        'Agendamentos Removidos',
                        'Todos os agendamentos foram removidos com sucesso!',
                        'warning'
                    );
                }
            );
        });
        
        console.log('Teste direto: Event listener adicionado');
    } else {
        console.error('Teste direto: Botão não encontrado!');
    }
}, 500);

});