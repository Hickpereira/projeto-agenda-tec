// Sistema de Agendamento Online - Nova Agenda TEC
// JavaScript principal com todas as funcionalidades

class AgendaSystem {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.userType = null;
        this.schedules = [];
        this.requests = [];
        this.notifications = [];
        this.selectedOrientador = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.setupAccessibility();
        this.checkAuthStatus();
		// Ajustar termos exibidos na interface
		this.replaceCoordinatorTerms();
    }

    // Event Listeners
    setupEventListeners() {
        // Navegação
        document.getElementById('nav-toggle')?.addEventListener('click', this.toggleMobileMenu.bind(this));
        
        // Modais
        document.getElementById('loginBtn')?.addEventListener('click', () => this.showModal('loginModal'));
        document.getElementById('registerBtn')?.addEventListener('click', () => this.showModal('registerModal'));
        document.getElementById('closeLogin')?.addEventListener('click', () => this.hideModal('loginModal'));
        document.getElementById('closeRegister')?.addEventListener('click', () => this.hideModal('registerModal'));
        
        // Formulários
        document.getElementById('loginForm')?.addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('registerForm')?.addEventListener('submit', this.handleRegister.bind(this));
        
        // Alternância entre modais
        document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('loginModal');
            this.showModal('registerModal');
        });
        document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('registerModal');
            this.showModal('loginModal');
        });
        
        // Dashboard
        document.getElementById('startScheduling')?.addEventListener('click', this.startScheduling.bind(this));
        document.getElementById('scheduleMeetingBtn')?.addEventListener('click', this.showScheduleModal.bind(this));
        document.getElementById('viewSchedulesBtn')?.addEventListener('click', this.showSchedulesList.bind(this));
        document.getElementById('viewRequestsBtn')?.addEventListener('click', this.showRequestsList.bind(this));
        document.getElementById('manageScheduleBtn')?.addEventListener('click', this.showScheduleManager.bind(this));
        document.getElementById('viewReportsBtn')?.addEventListener('click', this.showReports.bind(this));
        
        // Acessibilidade
        document.getElementById('darkModeToggle')?.addEventListener('click', this.toggleDarkMode.bind(this));
        document.getElementById('fontSizeIncrease')?.addEventListener('click', this.increaseFontSize.bind(this));
        document.getElementById('fontSizeDecrease')?.addEventListener('click', this.decreaseFontSize.bind(this));
        document.getElementById('highContrastToggle')?.addEventListener('click', this.toggleHighContrast.bind(this));
        
        // Fechar modais ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
        
        // Header logout button
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'logoutBtn') {
                this.handleLogout();
            }
        });
        
        // Navegação suave
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

		// Recarregar a página ao entrar nas abas de Responsável ou Orientador
		['loginTabResponsavel','loginTabCoordenador','registerTabResponsavel','registerTabCoordenador']
			.forEach(id => {
				const el = document.getElementById(id);
				el?.addEventListener('click', () => {
					window.location.reload();
				});
			});
    }

    // Sistema de Autenticação
    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const loginData = Object.fromEntries(formData);
        
        try {
            if (this.validateLogin(loginData)) {
                this.currentUser = this.getStoredUsers().find(u => u.email === loginData.email);
                this.isLoggedIn = true;
                this.userType = this.currentUser.userType;
                this.saveUserData();
                this.showNotification('Login realizado com sucesso!', 'success');
                this.hideModal('loginModal');
                this.showDashboard();
            }
        } catch (error) {
            this.showNotification('Erro ao fazer login. Tente novamente.', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const registerData = Object.fromEntries(formData);
        
        try {
            if (!this.validateRegisterData(registerData)) {
                return;
            }
            
            const user = await this.createUser(registerData);
            this.currentUser = user;
            this.isLoggedIn = true;
            this.userType = user.userType;
            this.saveUserData();
            
            this.showNotification('Cadastro realizado com sucesso!', 'success');
            this.hideModal('registerModal');
            this.showDashboard();
        } catch (error) {
            this.showNotification('Erro ao cadastrar. Tente novamente.', 'error');
        }
    }

    validateLogin(loginData) {
        const users = this.getStoredUsers();
        const user = users.find(u => 
            u.email === loginData.email && 
            u.password === loginData.password
        );
        
        if (!user) {
            this.showNotification('Email ou senha incorretos.', 'error');
            return false;
        }
        
        return true;
    }

    validateRegisterData(registerData) {
        if (registerData.password.length < 6) {
            this.showNotification('A senha deve ter pelo menos 6 caracteres.', 'error');
            return false;
        }
        
        const users = this.getStoredUsers();
        if (users.some(u => u.email === registerData.email)) {
            this.showNotification('Este email já está cadastrado.', 'error');
            return false;
        }
        
        return true;
    }

    async createUser(userData) {
        const user = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
            userType: userData.userType,
            createdAt: new Date().toISOString()
        };
        
        const users = this.getStoredUsers();
        users.push(user);
        localStorage.setItem('agenda_users', JSON.stringify(users));
        
        return user;
    }

    getStoredUsers() {
        return JSON.parse(localStorage.getItem('agenda_users') || '[]');
    }

    startScheduling() {
        if (!this.isLoggedIn) {
            this.showModal('loginModal');
            return;
        }
        this.showScheduleModal();
    }

    showDashboard() {
        document.getElementById('home').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
        // Animar entrada do dashboard
        const dashboard = document.getElementById('dashboard');
        dashboard.style.opacity = '0';
        dashboard.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            dashboard.style.transition = 'all 0.6s ease-out';
            dashboard.style.opacity = '1';
            dashboard.style.transform = 'translateY(0)';
        }, 100);
        
        // Mostrar dashboard específico do tipo de usuário
        if (this.userType === 'responsavel') {
            document.getElementById('responsavelDashboard').classList.remove('hidden');
            document.getElementById('coordenadorDashboard').classList.add('hidden');
            this.showResponsibleNotifications();
        } else if (this.userType === 'coordenador') {
            document.getElementById('coordenadorDashboard').classList.remove('hidden');
            document.getElementById('responsavelDashboard').classList.add('hidden');
            this.updateCoordinatorDashboard();
            this.startAutoRefresh();
            this.addSearchFunctionality();
        }
    }

    updateCoordinatorDashboard() {
        const pendingRequests = this.requests.filter(req => req.status === 'pending');
        const pendingCount = document.getElementById('pendingCount');
        if (pendingCount) {
            pendingCount.textContent = `${pendingRequests.length} solicitações aguardando`;
        }
    }

    handleLogout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.userType = null;
        this.stopAutoRefresh();
        localStorage.removeItem('currentUser');
        document.getElementById('dashboard').classList.add('hidden');
        document.querySelector('main').style.display = 'block';
        
        this.updateHeaderForGuest();
        this.showNotification('Logout realizado com sucesso!', 'success');
    }

    // Funções para atualizar o header
    updateHeaderForLoggedUser() {
        const guestMenu = document.getElementById('guest-menu');
        const userMenu = document.getElementById('user-menu');
        
        if (guestMenu && userMenu) {
            guestMenu.classList.add('hidden');
            userMenu.classList.remove('hidden');
            this.updateUserProfile();
        }
    }

    updateHeaderForGuest() {
        const guestMenu = document.getElementById('guest-menu');
        const userMenu = document.getElementById('user-menu');
        
        if (guestMenu && userMenu) {
            guestMenu.classList.remove('hidden');
            userMenu.classList.add('hidden');
        }
    }

    updateUserProfile() {
        if (this.currentUser) {
            const userGreeting = document.getElementById('userGreeting');
            const userTypeDisplay = document.getElementById('userTypeDisplay');
            
            if (userGreeting) {
                userGreeting.textContent = `Olá, ${this.currentUser.name.split(' ')[0]}!`;
            }
            
            if (userTypeDisplay) {
                userTypeDisplay.textContent = this.getUserTypeDisplayName(this.userType);
                userTypeDisplay.className = `user-type ${this.userType}`;
            }
        }
    }

    getUserTypeDisplayName(userType) {
        const typeNames = {
            'responsavel': 'Responsável',
			'coordenador': 'Orientador Educacional'
        };
        return typeNames[userType] || 'Usuário';
    }

    showScheduleModal() {
        const modalHTML = `
            <div id="scheduleModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Agendar Reunião</h2>
                        <span class="close" id="closeSchedule">&times;</span>
                    </div>
                    <form id="scheduleForm" class="auth-form">
                        <div class="form-group">
                            <label for="orientadorSelect">Escolha o Orientador</label>
                            <select id="orientadorSelect" name="orientador" required>
                                <option value="">Selecione um orientador...</option>
                                ${this.generateOrientadorOptions()}
                            </select>
                        </div>
                        <div id="orientadorInfo" class="orientador-info hidden">
                            <div class="orientador-card">
                                <div class="orientador-avatar"></div>
                                <div class="orientador-details">
                                    <h3 class="orientador-name"></h3>
                                    <p class="orientador-specialty"></p>
                                    <p class="orientador-description"></p>
                                    <div class="orientador-contact">
                                        <span class="orientador-email"></span>
                                        <span class="orientador-phone"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="scheduleDate">Data</label>
                            <input type="date" id="scheduleDate" name="date" required>
                        </div>
                        <div class="form-group">
                            <label for="scheduleTime">Horário</label>
                            <select id="scheduleTime" name="time" required>
                                <option value="">Selecione um horário...</option>
                                ${this.generateAvailableTimeSlots()}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="scheduleSubject">Assunto</label>
                            <input type="text" id="scheduleSubject" name="subject" placeholder="Ex: Dúvidas sobre rendimento escolar" required>
                        </div>
                        <div class="form-group">
                            <label for="scheduleMessage">Mensagem</label>
                            <textarea id="scheduleMessage" name="message" rows="4" placeholder="Descreva o motivo da reunião..."></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">Solicitar Agendamento</button>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Event listeners para o modal
        document.getElementById('closeSchedule').addEventListener('click', () => this.hideModal('scheduleModal'));
        document.getElementById('scheduleForm').addEventListener('submit', this.handleScheduleRequest.bind(this));
        
        // Event listener para seleção de orientador
        document.getElementById('orientadorSelect').addEventListener('change', (e) => {
            this.showOrientadorInfo(e.target.value);
        });
        
        // Definir data mínima como hoje
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('scheduleDate').min = today;
        
        // Atualizar horários quando a data mudar
        document.getElementById('scheduleDate').addEventListener('change', () => {
            this.updateAvailableTimeSlots();
        });
        
        this.showModal('scheduleModal');
    }

	generateOrientadorOptions() {
		return '<option value="orientador">Orientador Educacional - Orientação Geral</option>';
	}

	showOrientadorInfo(orientadorId) {
        const orientadorInfo = document.getElementById('orientadorInfo');
        
		if (orientadorId === 'orientador') {
            this.selectedOrientador = {
				id: 'orientador',
				name: 'Orientador Educacional',
                specialty: 'Orientação Geral',
                description: 'Responsável pela orientação educacional e acompanhamento dos alunos',
				email: 'orientador@escola.com',
                phone: '(11) 99999-0000',
                avatar: '👨‍🏫'
            };
            
            // Atualizar informações do coordenador
            document.querySelector('.orientador-avatar').textContent = '👨‍🏫';
			document.querySelector('.orientador-name').textContent = 'Orientador Educacional';
            document.querySelector('.orientador-specialty').textContent = 'Orientação Geral';
            document.querySelector('.orientador-description').textContent = 'Responsável pela orientação educacional e acompanhamento dos alunos';
			document.querySelector('.orientador-email').textContent = 'orientador@escola.com';
            document.querySelector('.orientador-phone').textContent = '(11) 99999-0000';
            
            // Adicionar indicador de status
            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'orientador-status';
            statusIndicator.innerHTML = `
                <span class="status-online">🟢 Disponível</span>
                <span class="status-available">Disponível para agendamentos</span>
            `;
            statusIndicator.style.background = 'var(--success-color)';
            
            // Remover status anterior se existir
            const existingStatus = document.querySelector('.orientador-status');
            if (existingStatus) {
                existingStatus.remove();
            }
            
            document.querySelector('.orientador-details').appendChild(statusIndicator);
            
            orientadorInfo.classList.remove('hidden');
        } else {
            orientadorInfo.classList.add('hidden');
            this.selectedOrientador = null;
        }
    }

    handleScheduleRequest(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const scheduleData = Object.fromEntries(formData);
        
        if (!this.selectedOrientador) {
            this.showNotification('Por favor, selecione um orientador', 'error');
            return;
        }
        
        const request = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            userEmail: this.currentUser.email,
            orientador: this.selectedOrientador,
            date: scheduleData.date,
            time: scheduleData.time,
            subject: scheduleData.subject,
            message: scheduleData.message,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        this.requests.push(request);
        this.saveRequests();
        this.hideModal('scheduleModal');
        this.showNotification(`Solicitação enviada para ${this.selectedOrientador.name} com sucesso!`, 'success');
        
        // Remover modal do DOM
        document.getElementById('scheduleModal').remove();
    }

    generateAvailableTimeSlots() {
        const timeSlots = [
            '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
            '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
            '16:00', '16:30', '17:00', '17:30'
        ];
        
        return timeSlots.map(time => 
            `<option value="${time}">${time}</option>`
        ).join('');
    }

    updateAvailableTimeSlots() {
        const timeSelect = document.getElementById('scheduleTime');
        if (timeSelect) {
            timeSelect.innerHTML = `
                <option value="">Selecione um horário...</option>
                ${this.generateAvailableTimeSlots()}
            `;
        }
    }

    showSchedulesList() {
        const userSchedules = this.requests.filter(req => req.userId === this.currentUser.id);
        
        const modalHTML = `
            <div id="schedulesModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Meus Agendamentos</h2>
                        <span class="close" id="closeSchedules">&times;</span>
                    </div>
                    <div class="schedules-list" id="schedulesList">
                        ${userSchedules.length === 0 ? 
                            '<p>Nenhum agendamento encontrado.</p>' :
                            userSchedules.map(schedule => `
                                <div class="schedule-item">
                                    <div class="schedule-info">
                                        <h4>${schedule.subject}</h4>
                                        ${schedule.orientador ? `
                                            <p><strong>Orientador:</strong> ${schedule.orientador.name} - ${schedule.orientador.specialty}</p>
                                        ` : ''}
                                        <p><strong>Data:</strong> ${this.formatDate(schedule.date)}</p>
                                        <p><strong>Horário:</strong> ${schedule.time}</p>
                                        <p><strong>Status:</strong> <span class="status-${schedule.status}">${this.getStatusText(schedule.status)}</span></p>
                                        ${schedule.message ? `<p><strong>Mensagem:</strong> ${schedule.message}</p>` : ''}
                                    </div>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('closeSchedules').addEventListener('click', () => {
            this.hideModal('schedulesModal');
            document.getElementById('schedulesModal').remove();
        });
        
        this.showModal('schedulesModal');
    }

    showRequestsList() {
        const pendingRequests = this.requests.filter(req => req.status === 'pending');
        
        const modalHTML = `
            <div id="requestsModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Solicitações Pendentes</h2>
                        <span class="close" id="closeRequests">&times;</span>
                    </div>
                    <div class="requests-list">
                        ${pendingRequests.length === 0 ? 
                            '<p>Nenhuma solicitação pendente.</p>' :
                            pendingRequests.map(request => `
                                <div class="request-item">
                                    <div class="request-info">
                                        <h4>${request.subject}</h4>
                                        <p><strong>Solicitante:</strong> ${request.userName}</p>
                                        <p><strong>Email:</strong> ${request.userEmail}</p>
                                        ${request.orientador ? `
                                            <p><strong>Orientador:</strong> ${request.orientador.name} - ${request.orientador.specialty}</p>
                                        ` : ''}
                                        <p><strong>Data:</strong> ${this.formatDate(request.date)}</p>
                                        <p><strong>Horário:</strong> ${request.time}</p>
                                        ${request.message ? `<p><strong>Mensagem:</strong> ${request.message}</p>` : ''}
                                    </div>
                                    <div class="request-actions">
                                        <button class="btn btn-primary" onclick="agendaSystem.approveRequest('${request.id}')">
                                            <i class="fas fa-check"></i> Aceitar
                                        </button>
                                        <button class="btn btn-outline" onclick="agendaSystem.rejectRequest('${request.id}')">
                                            <i class="fas fa-times"></i> Recusar
                                        </button>
                                    </div>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('closeRequests').addEventListener('click', () => {
            this.hideModal('requestsModal');
            document.getElementById('requestsModal').remove();
        });
        
        this.showModal('requestsModal');
    }

    approveRequest(requestId) {
        const request = this.requests.find(req => req.id === requestId);
        if (request) {
            request.status = 'approved';
            this.saveRequests();
            this.updateCoordinatorDashboard();
            this.showNotification('Solicitação aprovada!', 'success');
        }
    }

    rejectRequest(requestId) {
        const request = this.requests.find(req => req.id === requestId);
        if (request) {
            request.status = 'rejected';
            this.saveRequests();
            this.updateCoordinatorDashboard();
            this.showNotification('Solicitação recusada.', 'info');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    getStatusText(status) {
        const statusTexts = {
            'pending': 'Pendente',
            'approved': 'Aprovado',
            'rejected': 'Recusado'
        };
        return statusTexts[status] || status;
    }

    showScheduleManager() {
        this.showNotification('Funcionalidade em desenvolvimento', 'info');
    }

    showReports() {
        this.showNotification('Funcionalidade em desenvolvimento', 'info');
    }

    showResponsibleNotifications() {
        // Implementar notificações para responsáveis
    }

    addSearchFunctionality() {
        // Implementar busca para coordenadores
    }

    startAutoRefresh() {
        // Implementar auto-refresh
    }

    stopAutoRefresh() {
        // Implementar parada do auto-refresh
    }

    // Sistema de Modais
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Sistema de Notificações
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.getElementById('notificationContainer').appendChild(notification);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // Botão de fechar
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    // Sistema de Acessibilidade
    setupAccessibility() {
        // Implementar funcionalidades de acessibilidade
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
    }

    increaseFontSize() {
        document.body.style.fontSize = '1.1em';
    }

    decreaseFontSize() {
        document.body.style.fontSize = '0.9em';
    }

    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
    }

	// Substitui termos visíveis na interface para padronizar nomenclatura
	replaceCoordinatorTerms() {
		const replacements = [
			['Coordenador', 'Orientador Educacional'],
			['coordenador', 'orientador educacional']
		];
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
		let node;
		while ((node = walker.nextNode())) {
			let text = node.nodeValue;
			replacements.forEach(([from, to]) => {
				// Usa replaceAll quando disponível
				text = text.split(from).join(to);
			});
			if (text !== node.nodeValue) {
				node.nodeValue = text;
			}
		}
	}

    toggleMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        navMenu.classList.toggle('active');
    }

    // Sistema de Persistência
    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    loadUserData() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.isLoggedIn = true;
            this.userType = this.currentUser.userType;
        }
    }

    saveRequests() {
        localStorage.setItem('agenda_requests', JSON.stringify(this.requests));
    }

    loadRequests() {
        const savedRequests = localStorage.getItem('agenda_requests');
        if (savedRequests) {
            this.requests = JSON.parse(savedRequests);
        }
    }

    checkAuthStatus() {
        if (this.isLoggedIn) {
            this.updateHeaderForLoggedUser();
            this.showDashboard();
        } else {
            this.updateHeaderForGuest();
        }
        this.loadRequests();
    }
}

// Inicializar o sistema quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.agendaSystem = new AgendaSystem();
});


