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
                
                // Mostrar mensagem de seleção
                showSelectionMessage(this.value);
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
    
    // Função para mostrar mensagem de seleção
    function showSelectionMessage(pessoa) {
        // Remover mensagem anterior se existir
        const existingMessage = document.querySelector('.selection-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Criar nova mensagem
        const message = document.createElement('div');
        message.className = 'selection-message';
        message.innerHTML = `
            <div class="message-content">
                <span>✓ Selecionado: ${pessoa.charAt(0).toUpperCase() + pessoa.slice(1)}</span>
                <button class="close-message">&times;</button>
            </div>
        `;
        
        // Adicionar estilos inline para a mensagem
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        // Adicionar estilos para o conteúdo da mensagem
        const messageContent = message.querySelector('.message-content');
        messageContent.style.cssText = `
            display: flex;
            align-items: center;
            gap: 15px;
            font-weight: 600;
        `;
        
        // Adicionar estilos para o botão de fechar
        const closeButton = message.querySelector('.close-message');
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.3s ease;
        `;
        
        closeButton.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(255,255,255,0.2)';
        });
        
        closeButton.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
        });
        
        // Adicionar evento de fechar
        closeButton.addEventListener('click', function() {
            message.remove();
        });
        
        // Adicionar ao DOM
        document.body.appendChild(message);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
    }
    
    // Adicionar CSS para animação
    if (!document.querySelector('#message-styles')) {
        const style = document.createElement('style');
        style.id = 'message-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
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
            } else {
                console.error('Elemento de horários não encontrado');
            }
        });
    });
}

// Gerar calendário do mês atual
const hoje = new Date();
gerarCalendario(hoje.getMonth(), hoje.getFullYear());
