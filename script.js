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
    // PADRONIZACAO DA INTERFACE 
    this.replaceCoordinatorTerms();
  }

  addSearchFunctionality() {
    console.log("Futura implementação: Lógica de busca no painel.");
  
  }

  replaceCoordinatorTerms() {
    const replacements = [
      ["Coordenador", "Orientador Educacional"],
      ["coordenador", "orientador educacional"],
    ];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    let node;
    while ((node = walker.nextNode())) {
      let text = node.nodeValue;
      replacements.forEach(([from, to]) => {
        text = text.split(from).join(to);
      });
      if (text !== node.nodeValue) {
        node.nodeValue = text;
      }
    }
  }

  startAutoRefresh() {
    console.log("Futura implementação: Lógica de auto-refresh.");
    // TODO: Adicionar aqui a lógica para atualizar o painel periodicamente.
    // Por enquanto, a função existe e não vai mais causar erro.
  }

  setupEventListeners() {
    // NAVEGACAO
    document
      .getElementById("nav-toggle")
      ?.addEventListener("click", this.toggleMobileMenu.bind(this));

    // MODAIS
    document
      .getElementById("loginBtn")
      ?.addEventListener("click", () => this.showModal("loginModal"));
    document
      .getElementById("registerBtn")
      ?.addEventListener("click", () => this.showModal("registerModal"));
    document
      .getElementById("closeLogin")
      ?.addEventListener("click", () => this.hideFormModal("loginModal"));
    document
      .getElementById("closeRegister")
      ?.addEventListener("click", () => this.hideFormModal("registerModal"));

    // LOGIN
    document
      .getElementById("loginTabResponsavel")
      ?.addEventListener("click", () =>
        this.switchAuthTab("login", "responsavel")
      );
    document
      .getElementById("loginTabCoordenador")
      ?.addEventListener("click", () =>
        this.switchAuthTab("login", "coordenador")
      );
    // REGISTER
    document
      .getElementById("registerTabResponsavel")
      ?.addEventListener("click", () =>
        this.switchAuthTab("register", "responsavel")
      );
    document
      .getElementById("registerTabCoordenador")
      ?.addEventListener("click", () =>
        this.switchAuthTab("register", "coordenador")
      );

    // Formulários - Jogados para 'firebase-config.js'
    //document.getElementById('loginForm')?.addEventListener('submit', this.handleLogin.bind(this));
    //document.getElementById('registerForm')?.addEventListener('submit', this.handleRegister.bind(this));

    // ALTERNACAO ENTRE MODAIS
    document
      .getElementById("switchToRegister")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        this.hideModal("loginModal");
        this.showModal("registerModal");
      });
    document.getElementById("switchToLogin")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.hideModal("registerModal");
      this.showModal("loginModal");
    });

    // DASHBOARD
    document
      .getElementById("startScheduling")
      ?.addEventListener("click", this.startScheduling.bind(this));
    document
      .getElementById("scheduleMeetingBtn")
      ?.addEventListener("click", this.showScheduleModal.bind(this));
    document
      .getElementById("viewSchedulesBtn")
      ?.addEventListener("click", this.showSchedulesList.bind(this));
    document
      .getElementById("viewRequestsBtn")
      ?.addEventListener("click", this.showRequestsList.bind(this));
    document
      .getElementById("manageScheduleBtn")
      ?.addEventListener("click", this.showScheduleManager.bind(this));
    document
      .getElementById("viewReportsBtn")
      ?.addEventListener("click", this.showReports.bind(this));


    // ACESSIBILIDADE - PANEL UNICO
    this.initAccessibilityPanel();

    // BOTAO DE ACESSIBILIDADE ALTERNATIVO NO HEADER
    document.getElementById("a11yHeaderBtn")?.addEventListener("click", () => {
      const panel = document.getElementById("a11yPanel");
      if (panel) {
        panel.classList.toggle("hidden");
      }
    });

   
    document.addEventListener(
      "keydown",
      this.handleKeyboardNavigation.bind(this)
    );

    
    window.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("modal") &&
        !e.target.id.includes("login") &&
        !e.target.id.includes("register") &&
        !e.target.id.includes("schedule")
      ) {
        this.hideModal(e.target.id);
      }
    });

    // HEADER LOGOUT BUTTON
    document.addEventListener("click", (e) => {
      if (e.target && e.target.id === "logoutBtn") {
        this.handleLogout();
      }
    });

    // BOTAO DE PERFIL
    document.getElementById("profileBtn")?.addEventListener("click", () => {
      this.showProfileModal();
    });

    // MODAL DE PERFIL
    document.getElementById("closeProfile")?.addEventListener("click", () => {
      this.hideModal("profileModal");
    });
    document
      .getElementById("cancelProfileBtn")
      ?.addEventListener("click", () => {
        this.hideModal("profileModal");
      });
    document.getElementById("profileForm")?.addEventListener("submit", (e) => {
      this.handleProfileUpdate(e);
    });

    // UPLOAD DE FOTO
    document
      .getElementById("profilePhotoInput")
      ?.addEventListener("change", (e) => {
        this.handleProfilePhotoUpload(e);
      });

    // BOTOES DE VERIFICACAO
    document.getElementById("verifyEmailBtn")?.addEventListener("click", () => {
      this.verifyEmail();
    });
    document.getElementById("verifyPhoneBtn")?.addEventListener("click", () => {
      this.verifyPhone();
    });

    // APLICAR MASCARAS
    this.initMasks();

  
    document
      .querySelectorAll('a[href^="#"]:not([href="#"])')
      .forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
          e.preventDefault();
          const target = document.querySelector(anchor.getAttribute("href"));
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
          }
        });
      });

  }

  // ACESSIBILIDADE: PANEL E PREFERENCIAS
  initAccessibilityPanel() {
    const openBtn = document.getElementById("a11yOpenBtn");
    const closeBtn = document.getElementById("a11yCloseBtn");
    const panel = document.getElementById("a11yPanel");
    const darkBtn = document.getElementById("a11yDarkToggle");
    const contrastBtn = document.getElementById("a11yContrastToggle");
    const readableBtn = document.getElementById("a11yReadableFont");
    const underlineBtn = document.getElementById("a11yUnderlineLinks");
    const fontMinus = document.getElementById("a11yFontMinus");
    const fontPlus = document.getElementById("a11yFontPlus");
    const fontDisplay = document.getElementById("a11yFontDisplay");
    const lineMinus = document.getElementById("a11yLineMinus");
    const linePlus = document.getElementById("a11yLinePlus");
    const lineDisplay = document.getElementById("a11yLineDisplay");
    const reduceMotionBtn = document.getElementById("a11yReduceMotion");
    const focusVisibleBtn = document.getElementById("a11yFocusVisible");
    const resetBtn = document.getElementById("a11yReset");

    if (!openBtn || !panel) {
      console.error("Botão de acessibilidade não encontrado:", {
        openBtn,
        panel,
      });
      return;
    }
    console.log("Botão de acessibilidade encontrado e funcionando");

    const applyPrefs = (prefs) => {
      if (prefs.darkMode) document.body.classList.add("dark-mode");
      else document.body.classList.remove("dark-mode");
      if (prefs.highContrast) document.body.classList.add("high-contrast");
      else document.body.classList.remove("high-contrast");
      document.documentElement.style.setProperty(
        "--base-font-scale",
        `${prefs.fontScale}`
      );
      document.documentElement.style.fontSize = `${Math.round(
        prefs.fontScale * 100
      )}%`;
      if (fontDisplay)
        fontDisplay.textContent = `${Math.round(prefs.fontScale * 100)}%`;
      document.documentElement.style.setProperty(
        "--line-scale",
        `${prefs.lineScale}`
      );
      if (lineDisplay)
        lineDisplay.textContent = `${Math.round(prefs.lineScale * 100)}%`;
      document.body.classList.toggle("readable-font", !!prefs.readableFont);
      document.body.classList.toggle("underline-links", !!prefs.underlineLinks);
      document.body.classList.toggle("reduce-motion", !!prefs.reduceMotion);
      document.body.classList.toggle("focus-visible", !!prefs.focusVisible);
    };

    const loadPrefs = () => {
      try {
        const raw = localStorage.getItem("a11y_prefs");
        const prefs = raw
          ? JSON.parse(raw)
          : {
              darkMode: false,
              highContrast: false,
              fontScale: 1,
              lineScale: 1,
              readableFont: false,
              underlineLinks: false,
              reduceMotion: false,
              focusVisible: false,
            };
        return {
          darkMode: !!prefs.darkMode,
          highContrast: !!prefs.highContrast,
          fontScale: Number(prefs.fontScale) || 1,
          lineScale: Number(prefs.lineScale) || 1,
          readableFont: !!prefs.readableFont,
          underlineLinks: !!prefs.underlineLinks,
          reduceMotion: !!prefs.reduceMotion,
          focusVisible: !!prefs.focusVisible,
        };
      } catch {
        return {
          darkMode: false,
          highContrast: false,
          fontScale: 1,
          lineScale: 1,
          readableFont: false,
          underlineLinks: false,
          reduceMotion: false,
          focusVisible: false,
        };
      }
    };

    const savePrefs = (prefs) => {
      localStorage.setItem("a11y_prefs", JSON.stringify(prefs));
    };

    let prefs = loadPrefs();
    applyPrefs(prefs);

    const openPanel = () => {
      panel.classList.remove("hidden");
      openBtn.setAttribute("aria-expanded", "true");
      panel.focus();
    };
    const closePanel = () => {
      panel.classList.add("hidden");
      openBtn.setAttribute("aria-expanded", "false");
      openBtn.focus();
    };

    openBtn.addEventListener("click", openPanel);
    closeBtn?.addEventListener("click", closePanel);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.classList.contains("hidden"))
        closePanel();
    });

    darkBtn?.addEventListener("click", () => {
      prefs.darkMode = !prefs.darkMode;
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    contrastBtn?.addEventListener("click", () => {
      prefs.highContrast = !prefs.highContrast;
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    readableBtn?.addEventListener("click", () => {
      prefs.readableFont = !prefs.readableFont;
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    underlineBtn?.addEventListener("click", () => {
      prefs.underlineLinks = !prefs.underlineLinks;
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    fontMinus?.addEventListener("click", () => {
      prefs.fontScale = Math.max(
        0.8,
        Number((prefs.fontScale - 0.05).toFixed(2))
      );
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    fontPlus?.addEventListener("click", () => {
      prefs.fontScale = Math.min(
        1.5,
        Number((prefs.fontScale + 0.05).toFixed(2))
      );
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    lineMinus?.addEventListener("click", () => {
      prefs.lineScale = Math.max(
        1,
        Number((prefs.lineScale - 0.05).toFixed(2))
      );
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    linePlus?.addEventListener("click", () => {
      prefs.lineScale = Math.min(
        2,
        Number((prefs.lineScale + 0.05).toFixed(2))
      );
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    reduceMotionBtn?.addEventListener("click", () => {
      prefs.reduceMotion = !prefs.reduceMotion;
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    focusVisibleBtn?.addEventListener("click", () => {
      prefs.focusVisible = !prefs.focusVisible;
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    resetBtn?.addEventListener("click", () => {
      prefs = {
        darkMode: false,
        highContrast: false,
        fontScale: 1,
        lineScale: 1,
        readableFont: false,
        underlineLinks: false,
        reduceMotion: false,
        focusVisible: false,
      };
      applyPrefs(prefs);
      savePrefs(prefs);
    });
  }

  // SISTEMA DE AUTENTICACAO
  async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const raw = Object.fromEntries(formData);
        const selectedType = raw.loginUserType || 'responsavel';
        // COLETAR APENAS CAMPOS DA ABA ATIVA PARA EVITAR CONFLITOS DE NOMES REPETIDOS
        const loginData = selectedType === 'coordenador'
            ? {
                loginUserType: 'coordenador',
                cpf: (document.getElementById('loginCpf')?.value || '').trim(),
                password: (document.getElementById('loginPasswordCoord')?.value || '')
              }
            : {
                loginUserType: 'responsavel',
                email: (document.getElementById('loginEmail')?.value || '').trim(),
                password: (document.getElementById('loginPassword')?.value || '')
              };
        
        try {
            if (this.validateLogin(loginData)) {
                // SE FOR O COORDENADOR FIXO, CRIAR O USUARIO AUTOMATICAMENTE
                if (loginData.email === 'coordenador@escola.com' && loginData.password === '123456') {
                    this.currentUser = {
                        id: 'coord-001',
                        name: 'Orientador Educacional',
                        email: 'coordenador@escola.com',
                        phone: '(11) 99999-0000',
                        password: '123456',
                        userType: 'coordenador',
                        createdAt: new Date().toISOString()
                    };
                } else {
                    if (selectedType === 'coordenador' && loginData.cpf) {
                        this.currentUser = this.getStoredUsers().find(u => u.userType === 'coordenador' && u.cpf === this.onlyDigits(loginData.cpf));
                    } else {
                        this.currentUser = this.getStoredUsers().find(u => u.email === loginData.email);
                    }
                }
                
                this.isLoggedIn = true;
                this.userType = this.currentUser.userType;
                this.saveUserData();
                this.updateHeaderForLoggedUser();
                this.showNotification('Login realizado com sucesso!', 'success');
                this.hideModal('loginModal');
                this.showDashboard();
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Erro ao fazer login. Tente novamente.', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const raw = Object.fromEntries(formData);
        const regType = raw.registerUserType || 'responsavel';
        const registerData = regType === 'coordenador'
            ? {
                registerUserType: 'coordenador',
                name: (document.getElementById('registerNameCoord')?.value || '').trim(),
                email: (document.getElementById('registerEmailCoord')?.value || '').trim(),
                cpf: (document.getElementById('registerCpf')?.value || '').trim(),
                password: (document.getElementById('registerPasswordCoord')?.value || '')
              }
            : {
                registerUserType: 'responsavel',
                name: (document.getElementById('registerName')?.value || '').trim(),
                email: (document.getElementById('registerEmail')?.value || '').trim(),
                phone: (document.getElementById('registerPhone')?.value || '').trim(),
                parentesco: (document.getElementById('registerParentesco')?.value || ''),
                password: (document.getElementById('registerPassword')?.value || '')
              };
        
        try {
            if (!this.validateRegisterData(registerData)) {
                return;
            }
            
            const user = await this.createUser(registerData);
            this.currentUser = user;
            this.isLoggedIn = true;
            this.userType = user.userType;
            this.saveUserData();
            this.updateHeaderForLoggedUser();
            
            this.showNotification('Cadastro realizado com sucesso!', 'success');
            this.hideModal('registerModal');
            this.showDashboard();
        } catch (error) {
            console.error('Register error:', error);
            this.showNotification('Erro ao cadastrar. Tente novamente.', 'error');
        }
    }

    validateLogin(loginData) {
        // COORDENADOR FIXO POR E-MAIL
        if (loginData.email === 'coordenador@escola.com' && loginData.password === '123456') {
            return true;
        }
       
        if (this.onlyDigits(loginData.cpf) === '12345678911' && loginData.password === '123456') {
            this.currentUser = {
                id: 'coord-demo',
                name: 'Orientador Educacional',
                email: 'orientador@escola.com',
                cpf: '12345678911',
                userType: 'coordenador',
                password: '123456',
                createdAt: new Date().toISOString()
            };
            return true;
        }
        
        const selectedType = loginData.loginUserType || 'responsavel';
        const users = this.getStoredUsers();
        let user = null;
        if (selectedType === 'coordenador' && loginData.cpf) {
            user = users.find(u => u.userType === 'coordenador' && u.cpf === this.onlyDigits(loginData.cpf) && u.password === loginData.password);
            if (!user) {
                this.showNotification('CPF ou senha incorretos.', 'error');
                return false;
            }
        } else {
            user = users.find(u => u.userType !== 'coordenador' && u.email === loginData.email && u.password === loginData.password);
            if (!user) {
                this.showNotification('Email ou senha incorretos.', 'error');
                return false;
            }
        }
        
        return true;
    }

    validateRegisterData(registerData) {
        const regType = (registerData.registerUserType || 'responsavel');
        if (!registerData.password || registerData.password.length < 6) {
            this.showNotification('A senha deve ter pelo menos 6 caracteres.', 'error');
            return false;
        }
        const users = this.getStoredUsers();
        if (regType === 'responsavel') {
            if (!registerData.name) {
                this.showNotification('Informe o nome do responsável.', 'error');
                return false;
            }
            const hasEmail = registerData.email && registerData.email.trim() !== '';
            const hasPhone = registerData.phone && registerData.phone.trim() !== '';
            if (!hasEmail && !hasPhone) {
                this.showNotification('Informe Telefone ou E-mail (pelo menos um).', 'error');
                return false;
            }
            if (!registerData.parentesco) {
                this.showNotification('Selecione o grau de parentesco.', 'error');
                return false;
            }
            if (hasEmail && users.some(u => u.email === registerData.email)) {
                this.showNotification('Este email já está cadastrado.', 'error');
                return false;
            }
        } else if (regType === 'coordenador') {
            if (!registerData.name || !registerData.email || !registerData.cpf) {
                this.showNotification('Preencha Nome, E-mail e CPF.', 'error');
                return false;
            }
            const cpf = this.onlyDigits(registerData.cpf);
            if (cpf.length !== 11) {
                this.showNotification('CPF inválido. Digite 11 números.', 'error');
                return false;
            }
            if (users.some(u => u.cpf === cpf)) {
                this.showNotification('Este CPF já está cadastrado.', 'error');
                return false;
            }
            if (users.some(u => u.email === registerData.email)) {
                this.showNotification('Este email já está cadastrado.', 'error');
                return false;
            }
        }
        return true;
    }

    async createUser(userData) {
        const regType = (userData.registerUserType || 'responsavel');
        const base = {
            id: Date.now().toString(),
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            password: userData.password,
            userType: regType,
            createdAt: new Date().toISOString()
        };
        if (regType === 'responsavel') {
            base.parentesco = userData.parentesco || '';
        } else if (regType === 'coordenador') {
            base.cpf = this.onlyDigits(userData.cpf || '');
        }
        const user = base;
        
        const users = this.getStoredUsers();
        users.push(user);
        localStorage.setItem('agenda_users', JSON.stringify(users));
        
        return user;
    }
        
  switchAuthTab(kind, type) {
    if (kind === "login") {
      const respBtn = document.getElementById("loginTabResponsavel");
      const coordBtn = document.getElementById("loginTabCoordenador");
      respBtn.classList.toggle("active", type === "responsavel");
      coordBtn.classList.toggle("active", type === "coordenador");
      document
        .getElementById("loginPaneResponsavel")
        .classList.toggle("active", type === "responsavel");
      document
        .getElementById("loginPaneCoordenador")
        .classList.toggle("active", type === "coordenador");
      const hidden = document.getElementById("loginUserType");
      if (hidden) hidden.value = type;
    } else if (kind === "register") {
      const respBtn = document.getElementById("registerTabResponsavel");
      const coordBtn = document.getElementById("registerTabCoordenador");
      respBtn.classList.toggle("active", type === "responsavel");
      coordBtn.classList.toggle("active", type === "coordenador");
      document
        .getElementById("registerPaneResponsavel")
        .classList.toggle("active", type === "responsavel");
      document
        .getElementById("registerPaneCoordenador")
        .classList.toggle("active", type === "coordenador");
      const hidden = document.getElementById("registerUserTypeHidden");
      if (hidden) hidden.value = type;
    }
  }

  onlyDigits(value) {
    return String(value || "").replace(/\D+/g, "");
  }

  getStoredUsers() {
    try {
      const raw = localStorage.getItem("agenda_users");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn(
        "Falha ao ler agenda_users do storage, resetando para vazio.",
        e
      );
      return [];
    }
  }

 
  async carregarOrientadoresPorEscola(escolaId) {
    console.log(
      `Buscando no Firestore onde 'escola_orientador' == '${escolaId}'`
    );
    const orientadorSelect = document.getElementById("orientadorSelect");
    const orientadorInfoCard = document.getElementById("orientadorInfo");

    // LIMPA AS OPCOES ANTERIORES E DESABILITA O SELETOR ENQUANTO CARREGA
    orientadorSelect.innerHTML = '<option value="">Carregando...</option>';
    orientadorSelect.disabled = true;
    orientadorInfoCard.classList.add("hidden"); 

    if (!escolaId) {
      orientadorSelect.innerHTML =
        '<option value="">Selecione uma escola primeiro</option>';
      orientadorSelect.disabled = false;
      return;
    }

    try {
      // ASSUMINDO QUE A INSTANCIA DO FIRESTORE ESTA EM window.db
      const orientadoresRef = window.db.collection("orientador_pedagogico");

      // BUSCA NO FIRESTORE POR ORIENTADORES ONDE O CAMPO 'ESCOLA_ORIENTADOR' E IGUAL AO ID DA ESCOLA
      const snapshot = await orientadoresRef
        .where("escola_orientador", "==", escolaId)
        .get();

      // LIMPA NOVAMENTE PARA ADICIONAR OS NOVOS RESULTADOS
      orientadorSelect.innerHTML =
        '<option value="">Selecione um orientador...</option>';

      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          const orientadorData = doc.data();
          const orientadorId = doc.id;
          const option = document.createElement("option");
          option.value = orientadorId;
          option.textContent = orientadorData.nome_orientador;

          // ARMAZENA TODOS OS DADOS DO ORIENTADOR NO PROPRIO ELEMENTO <OPTION>
          // PARA FACIL ACESSO POSTERIOR, EVITANDO NOVAS CONSULTAS.
          option.dataset.info = JSON.stringify(orientadorData);

          orientadorSelect.appendChild(option);
        });
      } else {
        orientadorSelect.innerHTML =
          '<option value="">Nenhum orientador encontrado para esta escola</option>';
      }
    } catch (error) {
      console.error("Erro ao buscar orientadores:", error);
      orientadorSelect.innerHTML =
        '<option value="">Erro ao carregar orientadores</option>';
    } finally {
      orientadorSelect.disabled = false;
    }
  }

  startScheduling() {
    if (!this.isLoggedIn) {
      this.showModal("loginModal");
      return;
    }
    this.showScheduleModal();
  }

  showDashboard() {
    // RECARREGA UMA VEZ AO ENTRAR EM CADA DASHBOARD PARA GARANTIR ATUALIZACAO
    if (this.refreshOnceOnDashboardEntry(this.userType)) {
      return;
    }

    // ESCONDER TODO O CONTEUDO PRINCIPAL
    document.querySelector("main").style.display = "none";
    document.getElementById("dashboard").classList.remove("hidden");

    // ANIMAR ENTRADA DO DASHBOARD
    const dashboard = document.getElementById("dashboard");
    dashboard.style.opacity = "0";
    dashboard.style.transform = "translateY(20px)";

    setTimeout(() => {
      dashboard.style.transition = "all 0.6s ease-out";
      dashboard.style.opacity = "1";
      dashboard.style.transform = "translateY(0)";
    }, 100);

    // MOSTRAR DASHBOARD ESPECIFICO DO TIPO DE USUARIO
    if (this.userType === "responsavel") {
      document
        .getElementById("responsavelDashboard")
        .classList.remove("hidden");
      document.getElementById("coordenadorDashboard").classList.add("hidden");
    } else if (this.userType === "coordenador") {
      document
        .getElementById("coordenadorDashboard")
        .classList.remove("hidden");
      document.getElementById("responsavelDashboard").classList.add("hidden");
      this.updateCoordinatorDashboard();
      this.startAutoRefresh();
      this.addSearchFunctionality();
      this.addScheduleViewButton();
    }
  }

  // EVITA RECARREGAMENTO AUTOMATICO AO ENTRAR NO DASHBOARD
  refreshOnceOnDashboardEntry(userType) {
    return false;
  }

  updateCoordinatorDashboard() {
    const pendingRequests = this.requests.filter(
      (req) => req.status === "pending"
    );
    const pendingCount = document.getElementById("pendingCount");
    if (pendingCount) {
      pendingCount.textContent = `${pendingRequests.length} solicitações aguardando`;
    }
  }

  handleLogout() {
    this.currentUser = null;
    this.isLoggedIn = false;
    this.userType = null;
    this.stopAutoRefresh();
    localStorage.removeItem("currentUser");

    localStorage.removeItem("agenda_requests");
    localStorage.removeItem("timeSlots");
    localStorage.removeItem("blockedDates");
    this.requests = [];

    const headerAvatar = document.getElementById("headerUserAvatar");
    if (headerAvatar) {
      headerAvatar.innerHTML = "";
    }
    document.getElementById("dashboard").classList.add("hidden");
    document.querySelector("main").style.display = "block";

    this.updateHeaderForGuest();
    this.showNotification("Logout realizado com sucesso!", "success");
  }

  // FUNCOES PARA ATUALIZAR O HEADER
  updateHeaderForLoggedUser() {
    const guestMenu = document.getElementById("guest-menu");
    const userMenu = document.getElementById("user-menu");

    if (guestMenu && userMenu) {
      guestMenu.classList.add("hidden");
      userMenu.classList.remove("hidden");
      this.updateUserProfile();
    }
  }

  updateHeaderForGuest() {
    const guestMenu = document.getElementById("guest-menu");
    const userMenu = document.getElementById("user-menu");

    if (guestMenu && userMenu) {
      guestMenu.classList.remove("hidden");
      userMenu.classList.add("hidden");
    }
  }

  updateUserProfile() {
    if (this.currentUser) {
      const userGreeting = document.getElementById("userGreeting");
      const userTypeDisplay = document.getElementById("userTypeDisplay");
      const profileBtn = document.getElementById("profileBtn");

      const headerAvatar = document.getElementById("headerUserAvatar");
      if (headerAvatar) {
        if (this.userType === "coordenador" && this.currentUser.foto_perfil) {
          headerAvatar.innerHTML = `<img src="${this.currentUser.foto_perfil}" alt="Foto" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else if (this.userType === "coordenador") {
          headerAvatar.innerHTML = '<i class="fas fa-user-shield"></i>';
        } else {
          headerAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
        }
      }

      if (userGreeting) {
        userGreeting.textContent = `Olá, ${
          this.currentUser.name.split(" ")[0]
        }!`;
      }

      if (userTypeDisplay) {
        userTypeDisplay.textContent = this.getUserTypeDisplayName(
          this.userType
        );
        userTypeDisplay.className = `user-type ${this.userType}`;
      }

      if (profileBtn) {
        if (this.userType === "coordenador") {
          profileBtn.style.display = "inline-flex";
        } else {
          profileBtn.style.display = "none";
        }
      }
    }
  }

  getUserTypeDisplayName(userType) {
    const typeNames = {
      responsavel: "Responsável",
      coordenador: "Orientador Educacional",
    };
    return typeNames[userType] || "Usuário";
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
                            <label for="escola_orientador_modal">Escola onde o aluno estuda</label>
                            <select id="escola_orientador_modal" name="escola_orientador" required>
                                <option value="">Selecione a escola...</option>
                                <option value="escola_a">Etec de Heliópolis - Arquiteto Ruy Ohtake (ZS)</option>
                                <option value="escola_b">Etec Getúlio Vargas (Ipiranga)</option>
                                <option value="escola_c">Etec Jorge Street - Jardim São Caetano</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="orientadorSelect">Escolha o Orientador</label>
                            <select id="orientadorSelect" name="orientador" required>
                                <option value="">Selecione uma escola primeiro</option>
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
                            <label for="studentName">Nome do Aluno</label>
                            <input type="text" id="studentName" name="studentName" placeholder="Digite o nome completo do aluno" required>
                        </div>
                        <div class="form-group">
                            <label for="studentGrade">Série</label>
                            <select id="studentGrade" name="studentGrade" required>
                                <option value="">Selecione a série...</option>
                                <option value="1medio">1º Ensino Médio</option>
                                <option value="2medio">2º Ensino Médio</option>
                                <option value="3medio">3º Ensino Médio</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="studentClass">Turma</label>
                            <input type="text" id="studentClass" name="studentClass" placeholder="Ex: AMS, ADM, JOGOS Etc..." required>
                        </div>
                        <div class="form-group">
                            <label for="scheduleSubject">Assunto</label>
                            <input type="text" id="scheduleSubject" name="subject" placeholder="Ex: Dúvidas sobre rendimento escolar" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">Solicitar Agendamento</button>
                    </form>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // ADICIONA OS LISTENERS DEPOIS QUE O MODAL EXISTE NO DOM
    document
      .getElementById("escola_orientador_modal")
      .addEventListener("change", (e) => {
        this.carregarOrientadoresPorEscola(e.target.value);
      });

    const orientadorSelectElement = document.getElementById("orientadorSelect");
    if (orientadorSelectElement) {
      orientadorSelectElement.addEventListener("change", (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        console.log(
          "DEBUG: dataset.info da option:",
          selectedOption.dataset.info
        );
        this.showOrientadorInfo(selectedOption);
      });
    } else {
      console.error(
        "DEBUG: CRÍTICO! Elemento com id 'orientadorSelect' não foi encontrado no modal."
      );
    }

    document
      .getElementById("closeSchedule")
      .addEventListener("click", () => this.hideModal("scheduleModal"));
    document
      .getElementById("scheduleForm")
      .addEventListener("submit", (e) => this.handleScheduleRequest(e));

    const now = new Date();
    const todayLocal = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    document.getElementById("scheduleDate").min = todayLocal;

    document.getElementById("scheduleDate").addEventListener("change", () => {
      this.updateAvailableTimeSlots();
    });

    this.showModal("scheduleModal");
  }

  generateOrientadorOptions() {
    return "";
  }

  showOrientadorInfo(selectedOption) {
    console.log("DEBUG: Função 'showOrientadorInfo' foi chamada.");
    const orientadorInfo = document.getElementById("orientadorInfo");
    const orientadorId = selectedOption ? selectedOption.value : null;

    if (!orientadorId || !selectedOption.dataset.info) {
      orientadorInfo.classList.add("hidden");
      this.selectedOrientador = null;
      console.log(
        "DEBUG: Condição de falha atingida. this.selectedOrientador definido como NULL."
      );
      return;
    }

    const orientadorData = JSON.parse(selectedOption.dataset.info);

    this.selectedOrientador = {
      id: orientadorId,
      ...orientadorData,
    };
    console.log(
      "DEBUG: SUCESSO! this.selectedOrientador foi definido como:",
      this.selectedOrientador
    );

    // Exibir foto de perfil se disponível
    const avatarElement = document.querySelector(".orientador-avatar");
    if (orientadorData.foto_perfil) {
      avatarElement.innerHTML = `<img src="${orientadorData.foto_perfil}" alt="Foto do Orientador" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
      avatarElement.textContent = "👨‍🏫";
    }

    document.querySelector(".orientador-name").textContent =
      orientadorData.nome_orientador || "Nome não informado";
    document.querySelector(".orientador-specialty").textContent =
      orientadorData.specialty || "Orientador Educacional";
    document.querySelector(".orientador-description").textContent =
      orientadorData.description || "Disponível para agendamentos.";
    document.querySelector(".orientador-email").textContent =
      orientadorData.email_orientador || "";
    document.querySelector(".orientador-phone").textContent =
      orientadorData.telefone_orientador || "";

    orientadorInfo.classList.remove("hidden");
  }

  async handleScheduleRequest(e) {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');

    // DESABILITA O BOTAO PARA PREVENIR MULTIPLOS ENVIOS
    if (submitButton) submitButton.disabled = true;

    try {
      const formData = new FormData(form);
      const scheduleData = Object.fromEntries(formData);

      // VALIDACOES
      if (!this.selectedOrientador) {
        this.showNotification("Por favor, selecione um orientador.", "error");
        throw new Error("Orientador não selecionado.");
      }

      if (!scheduleData.date) {
        this.showNotification("Por favor, selecione uma data.", "error");
        throw new Error("Data não selecionada.");
      }

      if (!scheduleData.time) {
        this.showNotification("Por favor, selecione um horário.", "error");
        throw new Error("Horário não selecionado.");
      }

      if (!scheduleData.subject || scheduleData.subject.trim() === "") {
        this.showNotification(
          "Por favor, informe o assunto do agendamento.",
          "error"
        );
        throw new Error("Assunto não informado.");
      }

      if (!scheduleData.studentName || scheduleData.studentName.trim() === "") {
        this.showNotification("Por favor, informe o nome do aluno.", "error");
        throw new Error("Nome do aluno não informado.");
      }

      if (!scheduleData.studentGrade) {
        this.showNotification(
          "Por favor, selecione a série do aluno.",
          "error"
        );
        throw new Error("Série não selecionada.");
      }

      if (
        !scheduleData.studentClass ||
        scheduleData.studentClass.trim() === ""
      ) {
        this.showNotification("Por favor, informe a turma do aluno.", "error");
        throw new Error("Turma não informada.");
      }

      if (!scheduleData.escola_orientador) {
        this.showNotification("Por favor, selecione a escola.", "error");
        throw new Error("Escola não selecionada.");
      }

      const requestPayload = {
        orientador: this.selectedOrientador,
        date: scheduleData.date,
        time: scheduleData.time,
        subject: scheduleData.subject.trim(),
        studentName: scheduleData.studentName.trim(),
        studentGrade: scheduleData.studentGrade,
        studentClass: scheduleData.studentClass.trim(),
        message: (scheduleData.message || "").trim(),
        escola_orientador: scheduleData.escola_orientador,
      };

      console.log("Payload de Solicitação:", requestPayload);
      console.log("ID do Orientador no Payload:", requestPayload.orientador.id);
      await window.services.schedule.createRequest(requestPayload);

      console.log(
        "SUCESSO! A solicitação foi enviada. Fechando o modal agora."
      );

      this.hideModal("scheduleModal");
      const scheduleModal = document.getElementById("scheduleModal");
      if (scheduleModal) {
        scheduleModal.remove();
      }
    } catch (error) {
      console.error("Falha no handleScheduleRequest:", error.message);
      if (!error.handled) {
        this.showNotification(
          error.message || "Falha ao enviar solicitação. Tente novamente.",
          "error"
        );
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  }

  /**
   * VERIFICA SE UMA DATA ESPECIFICA ESTA BLOQUEADA PARA O ORIENTADOR SELECIONADO
   * @param {string} date - DATA NO FORMATO YYYY-MM-DD
   * @returns {boolean} - TRUE SE A DATA ESTIVER BLOQUEADA
   */
  isDateBlocked(date) {
    if (!date) return false;

    // id oe
    const orientadorId = this.selectedOrientador?.id;
    if (!orientadorId) return false;

    const blockedDates = this.getBlockedDates();

    return blockedDates.some(
      (blocked) =>
        blocked.date === date && blocked.orientadorId === orientadorId
    );
  }

  /**
   * VERIFICA SE HÁ HORARIOS CRIADOS PARA O ORIENTADOR SELECIONADO
   * @param {string} date - DATA NO FORMATO YYYY-MM-DD
   * @returns {boolean} - TRUE SE HOUVER HORARIOS
   */
  hasTimeSlotsForDate(date) {
    if (!date) return false;

    const orientadorId = this.selectedOrientador?.id;
    if (!orientadorId) return false;

    const customTimeSlots = this.getTimeSlots();

    return customTimeSlots.some(
      (slot) => slot.date === date && slot.orientadorId === orientadorId
    );
  }

  generateAvailableTimeSlots() {
    const selectedDate = document.getElementById("scheduleDate")?.value;

    const orientadorId = this.selectedOrientador?.id;

    if (!orientadorId) {
      return '<option value="">Selecione um Orientador primeiro</option>';
    }

    if (!selectedDate) {
      return '<option value="">Selecione uma data primeiro</option>';
    }

    // DATA BLOQUEADA (AGORA FILTRA POR ORIENTADORID)
    if (this.isDateBlocked(selectedDate)) {
      return '<option value="" disabled>Data Indisponível (Orientador)</option>';
    }

    const customTimeSlots = this.getTimeSlots();
    if (customTimeSlots.length > 0 && selectedDate) {
      const dateSlots = customTimeSlots.filter(
        (slot) =>
          slot.date === selectedDate && slot.orientadorId === orientadorId
      );

      // SEM HORARIOS PARA DATA ESCOLHIDA
      if (dateSlots.length === 0) {
        return '<option value="" disabled>Nenhum horário disponível para esta data</option>';
      }

      // HORARIOS DISPONIVEIS
      const availableSlots = [];
      dateSlots.forEach((slot) => {
        const start = this.timeToMinutes(slot.startTime);
        const end = this.timeToMinutes(slot.endTime);
        const duration = slot.duration;

        for (let time = start; time < end; time += duration) {
          const timeString = this.minutesToTime(time);
          if (!this.isTimeSlotBooked(selectedDate, timeString)) {
            availableSlots.push(timeString);
          }
        }
      });

      if (availableSlots.length > 0) {
        return availableSlots
          .map((time) => `<option value="${time}">${time}</option>`)
          .join("");
      } else {
        return '<option value="" disabled>Nenhum horário disponível para esta data</option>';
      }
    }

    return '<option value="" disabled>Nenhum horário disponível para esta data</option>';
  }

  timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  }

  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  }

  isTimeSlotBooked(date, time) {
    return this.requests.some(
      (request) =>
        request.date === date &&
        request.time === time &&
        request.status === "approved"
    );
  }

  updateAvailableTimeSlots() {
    const timeSelect = document.getElementById("scheduleTime");
    if (timeSelect) {
      const selectedDate = document.getElementById("scheduleDate")?.value;

      const orientadorId = this.selectedOrientador?.id;
      if (!orientadorId) {
        timeSelect.innerHTML =
          '<option value="">Selecione um Orientador primeiro</option>';
        timeSelect.disabled = true;
        return;
      }

      // VERIFICAR SE A DATA ESTA BLOQUEADA
      if (this.isDateBlocked(selectedDate)) {
        timeSelect.innerHTML =
          '<option value="" disabled>Data Indisponível</option>';
        timeSelect.disabled = true;

        const blockedDates = this.getBlockedDates();
        const blockedDate = blockedDates.find((bd) => bd.date === selectedDate);
        const reason = blockedDate?.reason ? ` (${blockedDate.reason})` : "";
        this.showNotification(`Esta data está bloqueada${reason}`, "info");
        return;
      }

      if (!this.hasTimeSlotsForDate(selectedDate)) {
        timeSelect.innerHTML =
          '<option value="" disabled>Nenhum horário disponível para esta data</option>';
        timeSelect.disabled = true;
        this.showNotification(
          "Nenhum horário cadastrado para esta data. Entre em contato com o orientador.",
          "info"
        );
        return;
      }

      // HÁ HORARIOS DISPONIVEIS - GERAR LISTA
      const slotsHTML = this.generateAvailableTimeSlots();

      if (slotsHTML.includes("disabled")) {
        timeSelect.disabled = true;
      } else {
        timeSelect.disabled = false;
      }

      timeSelect.innerHTML = `
                <option value="">Selecione um horário...</option>
                ${slotsHTML}
            `;
    }
  }

  async showSchedulesList() {
    await this.loadRequestsFromFirebase();

    let schedulesToShow;
    let modalTitle;

    if (this.userType === "coordenador") {
      schedulesToShow = this.requests.filter(
        (req) => req.status === "approved"
      );
      modalTitle = "Agendamentos Confirmados";
    } else {
      schedulesToShow = this.requests.filter(
        (req) => req.responsavelId === this.currentUser.id
      );
      modalTitle = "Meus Agendamentos";
    }

    const modalHTML = `
            <div id="schedulesModal" class="modal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h2>${modalTitle}</h2>
                        <span class="close" id="closeSchedules">&times;</span>
                    </div>
                    
                    <div class="schedules-tabs">
                        <button class="tab-btn active" data-tab="all">
                            <i class="fas fa-calendar-check"></i>
                            Todos (${schedulesToShow.length})
                        </button>
                        <button class="tab-btn" data-tab="upcoming">
                            <i class="fas fa-clock"></i>
                            Próximos
                        </button>
                        <button class="tab-btn" data-tab="past">
                            <i class="fas fa-history"></i>
                            Passados
                        </button>
                    </div>
                    
                    <div class="tab-content">
                        <div id="all-tab" class="tab-pane active">
                            <div class="schedules-list" id="schedulesList">
                                ${
                                  schedulesToShow.length === 0
                                    ? '<div class="empty-state"><i class="fas fa-calendar-times"></i><p>Nenhum agendamento encontrado.</p></div>'
                                    : schedulesToShow
                                        .map((schedule) =>
                                          this.createScheduleItem(schedule)
                                        )
                                        .join("")
                                }
                            </div>
                        </div>
                        
                        <div id="upcoming-tab" class="tab-pane">
                            <div class="schedules-list" id="upcomingSchedulesList">
                                ${
                                  this.getUpcomingSchedules(schedulesToShow)
                                    .length === 0
                                    ? '<div class="empty-state"><i class="fas fa-calendar-plus"></i><p>Nenhum agendamento futuro.</p></div>'
                                    : this.getUpcomingSchedules(schedulesToShow)
                                        .map((schedule) =>
                                          this.createScheduleItem(schedule)
                                        )
                                        .join("")
                                }
                            </div>
                        </div>
                        
                        <div id="past-tab" class="tab-pane">
                            <div class="schedules-list" id="pastSchedulesList">
                                ${
                                  this.getPastSchedules(schedulesToShow)
                                    .length === 0
                                    ? '<div class="empty-state"><i class="fas fa-calendar-minus"></i><p>Nenhum agendamento passado.</p></div>'
                                    : this.getPastSchedules(schedulesToShow)
                                        .map((schedule) =>
                                          this.createScheduleItem(schedule)
                                        )
                                        .join("")
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Event listeners
    document.getElementById("closeSchedules").addEventListener("click", () => {
      this.hideModal("schedulesModal");
      document.getElementById("schedulesModal").remove();
    });

    // Tab switching
    document.querySelectorAll("#schedulesModal .tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const buttonEl = e.currentTarget || e.target.closest("button");
        const tabName = buttonEl?.dataset.tab;
        if (tabName) this.switchScheduleTab(tabName, "schedulesModal");
      });
    });

    this.showModal("schedulesModal");
  }

  /**
   * VERIFICA SE UM AGENDAMENTO ESTA PASSADO (DATA/HORA JÁ EXPIRARAM)
   */
  isSchedulePast(schedule) {
    if (!schedule.date || !schedule.time) return false;
    const scheduleDateTime = new Date(`${schedule.date}T${schedule.time}:00`);
    return scheduleDateTime < new Date();
  }

  /**
   * VERIFICA SE UM AGENDAMENTO PRECISA DE FEEDBACK
   */
  needsFeedback(request) {
    // APENAS AGENDAMENTOS APROVADOS QUE JÁ PASSARAM E NÃO FORAM ENCERRADOS
    if (request.status !== "approved") return false;
    if (
      request.attendanceStatus === "concluido" ||
      request.attendanceStatus === "faltou"
    )
      return false;

    // VERIFICAR SE A DATA/HORA JÁ PASSOU
    return this.isSchedulePast(request);
  }

  async showRequestsList() {
    // PULA SOLICITACOES FIREBASE ANTES DE MOSTRAR
    await this.loadRequestsFromFirebase();

    this.updateCoordinatorDashboard();

    const pendingRequests = this.requests.filter(
      (req) => req.status === "pending"
    );

    // AGENDAMENTOS APROVADOS QUE AINDA NÃO PASSARAM OU QUE JÁ FORAM ENCERRADOS
    const acceptedRequests = this.requests.filter(
      (req) =>
        req.status === "approved" &&
        req.attendanceStatus !== "concluido" &&
        req.attendanceStatus !== "faltou" &&
        !this.needsFeedback(req)
    );

    // AGENDAMENTOS PASSADOS QUE PRECISAM DE FEEDBACK (AGUARDANDO FEEDBACK)
    const awaitingFeedback = this.requests.filter((req) =>
      this.needsFeedback(req)
    );

    const rejectedRequests = this.requests.filter(
      (req) => req.status === "rejected"
    );

    // AGENDAMENTOS JÁ ENCERRADOS (COM FEEDBACK)
    const completedRequests = this.requests.filter(
      (req) =>
        req.attendanceStatus === "concluido" ||
        req.attendanceStatus === "faltou"
    );

    const modalHTML = `
            <div id="requestsModal" class="modal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h2>Gerenciar Solicitações</h2>
                        <span class="close" id="closeRequests">&times;</span>
                    </div>
                    
                    <div class="requests-tabs">
                        <button class="tab-btn active" data-tab="pending">
                            <i class="fas fa-clock"></i>
                            Pendentes (${pendingRequests.length})
                        </button>
                        <button class="tab-btn" data-tab="accepted">
                            <i class="fas fa-check-circle"></i>
                            Aceitas (${acceptedRequests.length})
                        </button>
                        <button class="tab-btn" data-tab="rejected">
                            <i class="fas fa-times-circle"></i>
                            Rejeitadas (${rejectedRequests.length})
                        </button>
                    </div>
                    
                    <div class="tab-content">
                        <div id="pending-tab" class="tab-pane active">
                            <div class="requests-list">
                                ${
                                  pendingRequests.length === 0
                                    ? '<div class="empty-state"><i class="fas fa-inbox"></i><p>Nenhuma solicitação pendente</p></div>'
                                    : pendingRequests
                                        .map((request) =>
                                          this.createRequestItem(request)
                                        )
                                        .join("")
                                }
                            </div>
                        </div>
                        
                        <div id="accepted-tab" class="tab-pane">
                            <div class="requests-list">
                                ${
                                  acceptedRequests.length === 0
                                    ? '<div class="empty-state"><i class="fas fa-check-circle"></i><p>Nenhuma solicitação aceita</p></div>'
                                    : acceptedRequests
                                        .map((request) =>
                                          this.createRequestItem(
                                            request,
                                            false,
                                            true
                                          )
                                        )
                                        .join("")
                                }
                            </div>
                        </div>
                        
                        <div id="rejected-tab" class="tab-pane">
                            <div class="requests-list">
                                ${
                                  rejectedRequests.length === 0
                                    ? '<div class="empty-state"><i class="fas fa-times-circle"></i><p>Nenhuma solicitação rejeitada</p></div>'
                                    : rejectedRequests
                                        .map((request) =>
                                          this.createRequestItem(request, true)
                                        )
                                        .join("")
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // EVENT LISTENERS
    document.getElementById("closeRequests").addEventListener("click", () => {
      this.hideModal("requestsModal");
      document.getElementById("requestsModal").remove();
    });

    // TAB SWITCHING (SCOPED TO THIS MODAL)
    document.querySelectorAll("#requestsModal .tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const buttonEl = e.currentTarget || e.target.closest("button");
        const tabName = buttonEl?.dataset.tab;
        if (tabName) this.switchRequestTab(tabName, "requestsModal");
      });
    });

    this.showModal("requestsModal");
  }

  createRequestItem(
    request,
    isReadOnly = false,
    isAccepted = false,
    needsFeedback = false
  ) {
    const statusClass =
      request.status === "approved"
        ? "success"
        : request.status === "rejected"
        ? "danger"
        : "warning";

    const attendanceStatus = request.attendanceStatus || "pendente";
    const attendanceStatusText = this.getAttendanceStatusText(attendanceStatus);

    // SE PRECISA DE FEEDBACK, DESTACAR VISUALMENTE
    const feedbackClass = needsFeedback ? "needs-feedback" : "";

    return `
            <div class="request-item ${statusClass} ${feedbackClass}">
                ${
                  needsFeedback
                    ? `
                <div class="feedback-required-badge">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Requer Encerramento</span>
                </div>
                `
                    : ""
                }
                <div class="request-info">
                    <div class="request-header">
                        <h4>${request.subject}</h4>
                        <span class="request-status status-${request.status}">
                            ${this.getStatusText(request.status)}
                        </span>
                        ${
                          attendanceStatus !== "pendente"
                            ? `
                        <span class="request-status status-${attendanceStatus}" style="margin-left: 10px;">
                            ${attendanceStatusText}
                        </span>
                        `
                            : ""
                        }
                        ${
                          needsFeedback
                            ? `
                        <span class="request-status status-pending-feedback" style="margin-left: 10px;">
                            <i class="fas fa-clock"></i> Aguardando Feedback
                        </span>
                        `
                            : ""
                        }
                    </div>
                    <div class="request-details">
                        <p><strong>Solicitante:</strong> ${
                          request.userName || request.responsavelNome || "N/A"
                        }</p>
                        <p><strong>Email:</strong> ${
                          request.userEmail || request.responsavelEmail || "N/A"
                        }</p>
                        ${
                          request.orientador
                            ? `
                            <p><strong>Orientador:</strong> ${request.orientador.name} - ${request.orientador.specialty}</p>
                        `
                            : ""
                        }
                        <p><strong>Data:</strong> ${this.formatDate(
                          request.date
                        )}</p>
                        <p><strong>Horário:</strong> ${request.time}</p>
                        ${
                          request.message
                            ? `<p><strong>Mensagem:</strong> ${request.message}</p>`
                            : ""
                        }
                        ${
                          request.responseDate
                            ? `<p><strong>Respondido em:</strong> ${this.formatDate(
                                request.responseDate
                              )}</p>`
                            : ""
                        }
                        ${
                          request.postAttendanceFeedback ||
                          request.attendanceFeedback
                            ? `<p><strong>Feedback Pós-Atendimento:</strong> ${
                                request.postAttendanceFeedback ||
                                request.attendanceFeedback
                              }</p>`
                            : ""
                        }
                    </div>
                </div>
                ${
                  !isReadOnly && !isAccepted
                    ? `
                    <div class="request-actions">
                        <button class="btn btn-success" onclick="agendaSystem.approveRequest('${request.id}')">
                            <i class="fas fa-check"></i> Aceitar
                        </button>
                        <button class="btn btn-danger" onclick="agendaSystem.rejectRequest('${request.id}')">
                            <i class="fas fa-times"></i> Rejeitar
                        </button>
                    </div>
                `
                    : needsFeedback
                    ? `
                    <div class="request-actions">
                        <button class="btn btn-primary btn-large" onclick="agendaSystem.showCloseScheduleModal('${request.id}')">
                            <i class="fas fa-clipboard-check"></i> Encerrar Agendamento (Obrigatório)
                        </button>
                    </div>
                `
                    : isAccepted && attendanceStatus === "pendente"
                    ? `
                    <div class="request-actions">
                        <button class="btn btn-success" onclick="agendaSystem.markAttendanceStatus('${request.id}', 'concluido')">
                            <i class="fas fa-check-circle"></i> Atendimento Concluído
                        </button>
                        <button class="btn btn-warning" onclick="agendaSystem.showAttendanceFeedbackModal('${request.id}')">
                            <i class="fas fa-user-times"></i> Faltou ao Atendimento
                        </button>
                    </div>
                `
                    : ""
                }
            </div>
        `;
  }

  getAttendanceStatusText(status) {
    const statusMap = {
      concluido: "Atendimento Concluído",
      faltou: "Faltou ao Atendimento",
      pendente: "Pendente",
    };
    return statusMap[status] || status;
  }

  switchRequestTab(tabName, modalId = "requestsModal") {
   
    document
      .querySelectorAll(`#${modalId} .tab-btn`)
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(`#${modalId} .tab-pane`)
      .forEach((pane) => pane.classList.remove("active"));


    document
      .querySelector(`#${modalId} [data-tab="${tabName}"]`)
      .classList.add("active");
    document.getElementById(`${tabName}-tab`).classList.add("active");
  }

  getStatusText(status) {
    const statusMap = {
      pending: "Pendente",
      approved: "Aprovada",
      rejected: "Rejeitada",
    };
    return statusMap[status] || status;
  }

  async approveRequest(requestId) {
    try {
      await window.services.schedule.updateRequestStatus(requestId, "approved");

      const request = this.requests.find((req) => req.id === requestId);
      if (request) {
        request.status = "approved";
        request.responseDate = new Date().toISOString().split("T")[0];
        this.saveRequests();
      }

      this.updateCoordinatorDashboard();

      this.showNotification("Agendamento confirmado com sucesso!", "success");

      setTimeout(() => {
        this.refreshRequestsModal();
      }, 500);
    } catch (error) {
      console.error("Falha ao aprovar solicitação:", error);
      this.showNotification(
        "Erro ao confirmar agendamento. Tente novamente.",
        "error"
      );
    }
  }

  async rejectRequest(requestId) {
    try {
      await window.services.schedule.updateRequestStatus(requestId, "reject");

      const request = this.requests.find((req) => req.id === requestId);
      if (request) {
        request.status = "rejected";
        request.responseDate = new Date().toISOString().split("T")[0];
        this.saveRequests();
      }

      this.updateCoordinatorDashboard();
      this.showNotification("Solicitação rejeitada.", "info");
      this.refreshRequestsModal();
    } catch (error) {
      console.error("Falha ao rejeitar solicitação:", error);
    }
  }

  async refreshRequestsModal() {
    // RECARREGAR SOLICITACOES DO FIREBASE
    await this.loadRequestsFromFirebase();

    // REMOVE MODAL ATUAL
    const currentModal = document.getElementById("requestsModal");
    if (currentModal) {
      currentModal.remove();
    }

    // RECRIAR MODAL COM DADOS ATUALIZADOS
    await this.showRequestsList();
  }

  async markAttendanceStatus(requestId, status) {
    try {
      const request = this.requests.find((req) => req.id === requestId);
      if (!request) {
        this.showNotification("Solicitação não encontrada.", "error");
        return;
      }


      // ATUALIZAR LOCALMENTE
      request.attendanceStatus = status;
      this.saveRequests();

      this.showNotification(
        status === "concluido"
          ? "Atendimento marcado como concluído!"
          : "Status atualizado!",
        "success"
      );
      this.refreshRequestsModal();
    } catch (error) {
      console.error("Erro ao atualizar status de atendimento:", error);
      this.showNotification(
        "Erro ao atualizar status do atendimento.",
        "error"
      );
    }
  }

  showAttendanceFeedbackModal(requestId) {
    const request = this.requests.find((req) => req.id === requestId);
    if (!request) {
      this.showNotification("Solicitação não encontrada.", "error");
      return;
    }

    const modalHTML = `
      <div id="attendanceFeedbackModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Registrar Falta ao Atendimento</h2>
            <span class="close" id="closeAttendanceFeedback">&times;</span>
          </div>
          <form id="attendanceFeedbackForm" class="auth-form">
            <div class="form-group">
              <label for="attendanceFeedback">Feedback/Observação (opcional):</label>
              <textarea 
                id="attendanceFeedback" 
                name="feedback" 
                rows="4" 
                placeholder="Descreva o motivo da falta ou qualquer observação relevante..."
                style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: var(--border-radius); font-family: inherit; resize: vertical;"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-warning">
                <i class="fas fa-user-times"></i> Confirmar Falta
              </button>
              <button type="button" class="btn btn-outline" onclick="agendaSystem.closeAttendanceFeedbackModal()">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // lista de eventos para o modal de feedback de atendimento
    document
      .getElementById("closeAttendanceFeedback")
      .addEventListener("click", () => {
        this.closeAttendanceFeedbackModal();
      });

    document
      .getElementById("attendanceFeedbackForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const feedback = document.getElementById("attendanceFeedback").value;
        await this.markAttendanceStatusWithFeedback(requestId, feedback);
      });

    this.showModal("attendanceFeedbackModal");
  }

  closeAttendanceFeedbackModal() {
    const modal = document.getElementById("attendanceFeedbackModal");
    if (modal) {
      modal.remove();
    }
  }

  async markAttendanceStatusWithFeedback(requestId, feedback) {
    try {
      const request = this.requests.find((req) => req.id === requestId);
      if (!request) {
        this.showNotification("Solicitação não encontrada.", "error");
        return;
      }

      // ATUALIZAR NO FIREBASE
      if (window.db) {
        const requestRef = db.collection("solicitacoes").doc(requestId);
        await requestRef.update({
          attendanceStatus: "faltou",
          attendanceFeedback: feedback || "",
          attendanceUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }

      // ATUALIZAR LOCALMENTE
      request.attendanceStatus = "faltou";
      request.attendanceFeedback = feedback || "";
      this.saveRequests();

      this.closeAttendanceFeedbackModal();
      this.showNotification(
        "Falta ao atendimento registrada com sucesso!",
        "success"
      );
      this.refreshRequestsModal();
    } catch (error) {
      console.error("Erro ao registrar falta:", error);
      this.showNotification("Erro ao registrar falta ao atendimento.", "error");
    }
  }

  /**
   * MODAL OBRIGATORIO PARA ENCERRAR AGENDAMENTOS PASSADOS COM FEEDBACK
   */
  showCloseScheduleModal(requestId) {
    const request = this.requests.find((req) => req.id === requestId);
    if (!request) {
      this.showNotification("Solicitação não encontrada.", "error");
      return;
    }

    const modalHTML = `
      <div id="closeScheduleModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Encerrar Agendamento</h2>
            <span class="close" id="closeCloseSchedule">&times;</span>
          </div>
          <form id="closeScheduleForm" class="auth-form">
            <div class="form-group">
              <label>Informações do Agendamento</label>
              <div class="schedule-info-box">
                <p><strong>Solicitante:</strong> ${
                  request.userName || request.responsavelNome || "N/A"
                }</p>
                <p><strong>Data:</strong> ${this.formatDate(request.date)}</p>
                <p><strong>Horário:</strong> ${request.time}</p>
                <p><strong>Assunto:</strong> ${request.subject}</p>
              </div>
            </div>

            <div class="form-group">
              <label>Status do Atendimento <span class="required">*</span></label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="attendanceStatus" value="concluido" required>
                  <span class="radio-custom"></span>
                  <span class="radio-text">Atendimento Realizado</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="attendanceStatus" value="faltou" required>
                  <span class="radio-custom"></span>
                  <span class="radio-text">Aluno Não Compareceu (No-show)</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="postAttendanceFeedback">
                Feedback Pós-Atendimento <span class="required">*</span>
              </label>
              <small class="field-hint">Obrigatório mesmo se o aluno não compareceu</small>
              <textarea 
                id="postAttendanceFeedback" 
                name="feedback" 
                rows="6" 
                required
                placeholder="Descreva o que aconteceu no atendimento ou as tentativas de contato, observações sobre o aluno, próximos passos, etc. Este campo é obrigatório para todos os agendamentos."
                class="feedback-textarea"
              ></textarea>
              <small class="field-hint">
                Mesmo que o aluno não tenha comparecido, registre a ausência e qualquer observação relevante (ex: "Tentativa de contato sem sucesso", "Aluno faltou sem aviso").
              </small>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-full">
                <i class="fas fa-save"></i> Encerrar e Salvar Feedback
              </button>
              <button type="button" class="btn btn-outline btn-full" onclick="agendaSystem.closeCloseScheduleModal()">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    
    document
      .getElementById("closeCloseSchedule")
      .addEventListener("click", () => {
        this.closeCloseScheduleModal();
      });

    // VALIDAR FORMULARIO ANTES DE ENVIAR
    document
      .getElementById("closeScheduleForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const attendanceStatus = formData.get("attendanceStatus");
        const feedback = formData.get("feedback")?.trim();

        // VALIDACAO ADICIONAL
        if (!attendanceStatus) {
          this.showNotification(
            "Por favor, selecione o status do atendimento.",
            "error"
          );
          return;
        }

        if (!feedback || feedback.length < 10) {
          this.showNotification(
            "Por favor, preencha o feedback com pelo menos 10 caracteres.",
            "error"
          );
          document.getElementById("postAttendanceFeedback").focus();
          return;
        }

        // ENCERRAR AGENDAMENTO
        await this.closeScheduleWithFeedback(
          requestId,
          attendanceStatus,
          feedback
        );
      });

    this.showModal("closeScheduleModal");
  }

  closeCloseScheduleModal() {
    const modal = document.getElementById("closeScheduleModal");
    if (modal) {
      modal.remove();
    }
  }

  async closeScheduleWithFeedback(requestId, attendanceStatus, feedback) {
    try {
      const request = this.requests.find((req) => req.id === requestId);
      if (!request) {
        this.showNotification("Solicitação não encontrada.", "error");
        return;
      }

      if (window.db) {
        const requestRef = db.collection("solicitacoes").doc(requestId);
        await requestRef.update({
          attendanceStatus: attendanceStatus,
          attendanceFeedback: feedback,
          postAttendanceFeedback: feedback,
          attendanceUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          closedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }

      request.attendanceStatus = attendanceStatus;
      request.attendanceFeedback = feedback;
      request.postAttendanceFeedback = feedback;
      this.saveRequests();

      this.closeCloseScheduleModal();

      const statusText =
        attendanceStatus === "concluido"
          ? "Atendimento Realizado"
          : "Aluno Não Compareceu";

      this.showNotification(
        `Agendamento encerrado com sucesso! Status: ${statusText}`,
        "success"
      );

      this.refreshRequestsModal();
    } catch (error) {
      console.error("Erro ao encerrar agendamento:", error);
      this.showNotification("Erro ao encerrar agendamento.", "error");
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString + "T00:00:00");

    if (isNaN(date)) {
      console.error("Data inválida para formatação:", dateString);
      return dateString;
    }

    return date.toLocaleDateString("pt-BR");
  }

  getStatusText(status) {
    const statusTexts = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Recusado",
      cancelled: "Cancelado",
    };
    return statusTexts[status] || status;
  }

  formatGrade(grade) {
    const gradeTexts = {
      "1ano": "1º Ano",
      "2ano": "2º Ano",
      "3ano": "3º Ano",
      "4ano": "4º Ano",
      "5ano": "5º Ano",
      "6ano": "6º Ano",
      "7ano": "7º Ano",
      "8ano": "8º Ano",
      "9ano": "9º Ano",
      "1medio": "1º Ensino Médio",
      "2medio": "2º Ensino Médio",
      "3medio": "3º Ensino Médio",
    };
    return gradeTexts[grade] || grade;
  }

  showScheduleManager() {
    const modalHTML = `
            <div id="scheduleManagerModal" class="modal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h2>Gerenciar Agenda</h2>
                        <span class="close" id="closeScheduleManager">&times;</span>
                    </div>
                    
                    <div class="schedule-manager-content">
                        <div class="schedule-tabs">
                            <button class="tab-btn active" data-tab="availability">
                                <i class="fas fa-clock"></i>
                                Horários Disponíveis
                            </button>
                            <button class="tab-btn" data-tab="blocked">
                                <i class="fas fa-ban"></i>
                                Datas Bloqueadas
                            </button>
                            <button class="tab-btn" data-tab="settings">
                                <i class="fas fa-cog"></i>
                                Configurações
                            </button>
                        </div>
                        
                        <div class="tab-content">
                            <div id="availability-tab" class="tab-pane active">
                                <div class="availability-header">
                                    <h3>Horários Disponíveis</h3>
                                    <button class="btn btn-primary" id="addTimeSlotBtn">
                                        <i class="fas fa-plus"></i>
                                        Adicionar Horário
                                    </button>
                                </div>
                                <div class="time-slots-container" id="timeSlotsContainer">
                                    ${this.generateTimeSlotsHTML()}
                                </div>
                            </div>
                            
                            <div id="blocked-tab" class="tab-pane">
                                <div class="blocked-dates-header">
                                    <h3>Datas Bloqueadas</h3>
                                    <button class="btn btn-primary" id="addBlockedDateBtn">
                                        <i class="fas fa-plus"></i>
                                        Bloquear Data
                                    </button>
                                </div>
                                <div class="blocked-dates-container" id="blockedDatesContainer">
                                    ${this.generateBlockedDatesHTML()}
                                </div>
                            </div>
                            
                            <div id="settings-tab" class="tab-pane">
                                <div class="settings-content">
                                    <h3>Configurações da Agenda</h3>
                                    <form id="scheduleSettingsForm">
                                        <div class="form-group">
                                            <label for="defaultDuration">Duração Padrão (minutos):</label>
                                            <input type="number" id="defaultDuration" name="defaultDuration" 
                                                   value="${
                                                     this.getScheduleSettings()
                                                       .defaultDuration
                                                   }" min="15" max="120" step="15">
                                        </div>
                                        <div class="form-group">
                                            <label for="advanceNotice">Aviso Prévio (horas):</label>
                                            <input type="number" id="advanceNotice" name="advanceNotice" 
                                                   value="${
                                                     this.getScheduleSettings()
                                                       .advanceNotice
                                                   }" min="1" max="168">
                                        </div>
                                        <div class="form-group">
                                            <label for="maxDailySlots">Máximo de Agendamentos por Dia:</label>
                                            <input type="number" id="maxDailySlots" name="maxDailySlots" 
                                                   value="${
                                                     this.getScheduleSettings()
                                                       .maxDailySlots
                                                   }" min="1" max="20">
                                        </div>
                                        <div class="form-group">
                                            <label>Dias de Funcionamento:</label>
                                            <div class="checkbox-group">
                                                ${[
                                                  "Segunda",
                                                  "Terça",
                                                  "Quarta",
                                                  "Quinta",
                                                  "Sexta",
                                                  "Sábado",
                                                  "Domingo",
                                                ]
                                                  .map(
                                                    (day, index) => `
                                                    <label class="checkbox-label">
                                                        <input type="checkbox" name="workingDays" value="${index}" 
                                                               ${
                                                                 this.getScheduleSettings().workingDays.includes(
                                                                   index
                                                                 )
                                                                   ? "checked"
                                                                   : ""
                                                               }>
                                                        ${day}
                                                    </label>
                                                `
                                                  )
                                                  .join("")}
                                            </div>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-save"></i>
                                                Salvar Configurações
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Event listeners
    document
      .getElementById("closeScheduleManager")
      .addEventListener("click", () => {
        this.hideModal("scheduleManagerModal");
        document.getElementById("scheduleManagerModal").remove();
      });

    // Tab switching
    document
      .querySelectorAll("#scheduleManagerModal .tab-btn")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const buttonEl = e.currentTarget || e.target.closest("button");
          const tabName = buttonEl?.dataset.tab;
          if (tabName) this.switchScheduleTab(tabName);
        });
      });

    // Add time slot
    document.getElementById("addTimeSlotBtn").addEventListener("click", () => {
      this.showAddTimeSlotForm();
    });

    // Add blocked date
    document
      .getElementById("addBlockedDateBtn")
      .addEventListener("click", () => {
        this.showAddBlockedDateForm();
      });

    // Save settings
    document
      .getElementById("scheduleSettingsForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveScheduleSettings();
      });

    this.showModal("scheduleManagerModal");
  }

  async showReports() {
    await this.loadRequestsFromFirebase();
    const modalHTML = `
            <div id="reportsModal" class="modal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h2>Relatórios e Estatísticas</h2>
                        <span class="close" id="closeReports">&times;</span>
                    </div>
                    
                    <div class="reports-content">
                        <div class="reports-actions">
                            <button class="btn btn-primary" id="generateReportBtn">
                                <i class="fas fa-chart-bar"></i>
                                Gerar Relatório
                            </button>
                            <button class="btn btn-outline" id="exportReportBtn">
                                <i class="fas fa-download"></i>
                                Exportar
                            </button>
                            <button class="btn btn-outline" id="printReportBtn">
                                <i class="fas fa-print"></i>
                                Imprimir
                            </button>
                        </div>
                        
                        <div class="reports-grid">
                            <div class="report-card">
                                <h3>Resumo Geral</h3>
                                <div class="stats-grid">
                                    <div class="stat-item">
                                        <span class="stat-number">${
                                          this.requests.length
                                        }</span>
                                        <span class="stat-label">Total de Solicitações</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-number">${
                                          this.requests.filter(
                                            (r) => r.status === "pending"
                                          ).length
                                        }</span>
                                        <span class="stat-label">Pendentes</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-number">${
                                          this.requests.filter(
                                            (r) => r.status === "approved"
                                          ).length
                                        }</span>
                                        <span class="stat-label">Aprovadas</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-number">${
                                          this.requests.filter(
                                            (r) => r.status === "rejected"
                                          ).length
                                        }</span>
                                        <span class="stat-label">Rejeitadas</span>
                                    </div>
                                    <div class="stat-item ${
                                      this.requests.filter((r) =>
                                        this.needsFeedback(r)
                                      ).length > 0
                                        ? "stat-item-warning"
                                        : ""
                                    }">
                                        <span class="stat-number">${
                                          this.requests.filter((r) =>
                                            this.needsFeedback(r)
                                          ).length
                                        }</span>
                                        <span class="stat-label">Aguardando Feedback</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-number">${
                                          this.requests.filter(
                                            (r) =>
                                              r.attendanceStatus ===
                                                "concluido" ||
                                              r.attendanceStatus === "faltou"
                                          ).length
                                        }</span>
                                        <span class="stat-label">Encerrados</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="report-card">
                                <h3>Status dos Agendamentos</h3>
                                <div class="chart-container">
                                    <canvas id="statusChart" width="300" height="200"></canvas>
                                </div>
                            </div>
                            
                            <div class="report-card">
                                <h3>Timeline de Atividades</h3>
                                <div class="timeline" id="activityTimeline">
                                    ${this.generateActivityTimeline()}
                                </div>
                            </div>
                            
                            <div class="report-card">
                                <h3>Top Solicitantes</h3>
                                <div class="top-users" id="topUsers">
                                    ${this.generateTopUsers()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Event listeners
    document.getElementById("closeReports").addEventListener("click", () => {
      this.hideModal("reportsModal");
      document.getElementById("reportsModal").remove();
    });

    document
      .getElementById("generateReportBtn")
      .addEventListener("click", () => {
        this.generateFullReport();
      });

    document.getElementById("exportReportBtn").addEventListener("click", () => {
      this.exportReport();
    });

    document.getElementById("printReportBtn").addEventListener("click", () => {
      this.printReport();
    });

    setTimeout(() => {
      this.createStatusChart();
    }, 100);

    this.showModal("reportsModal");
  }

  showResponsibleNotifications() {
    // Implementar notificações para responsáveis
  }

  addScheduleViewButton() {
    const dashboardGrid = document.querySelector(
      "#coordenadorDashboard .dashboard-grid"
    );
    if (dashboardGrid && !document.getElementById("viewScheduleBtn")) {
      const scheduleViewCard = document.createElement("div");
      scheduleViewCard.className = "dashboard-card";
      scheduleViewCard.innerHTML = `
                <h3>Visualizar Agenda</h3>
                <p>Veja sua agenda semanal e mensal de forma organizada</p>
                <button class="btn btn-outline" id="viewScheduleBtn">
                    <i class="fas fa-calendar-alt"></i>
                    Ver Agenda
                </button>
            `;
      dashboardGrid.appendChild(scheduleViewCard);

      document
        .getElementById("viewScheduleBtn")
        .addEventListener("click", this.showScheduleView.bind(this));
    }
  }

  showScheduleView() {
    const approvedSchedules = this.requests.filter(
      (req) => req.status === "approved"
    );

    const modalHTML = `
            <div id="scheduleViewModal" class="modal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h2>Visualização da Agenda</h2>
                        <span class="close" id="closeScheduleView">&times;</span>
                    </div>
                    
                    <div class="schedule-view-tabs">
                        <button class="tab-btn active" data-tab="weekly">
                            <i class="fas fa-calendar-week"></i>
                            Agenda Semanal
                        </button>
                        <button class="tab-btn" data-tab="monthly">
                            <i class="fas fa-calendar-alt"></i>
                            Agenda Mensal
                        </button>
                        <button class="tab-btn" data-tab="list">
                            <i class="fas fa-list"></i>
                            Lista Detalhada
                        </button>
                    </div>
                    
                    <div class="tab-content">
                        <div id="weekly-tab" class="tab-pane active">
                            <div class="weekly-schedule" id="weeklySchedule">
                                ${this.generateWeeklySchedule(
                                  approvedSchedules
                                )}
                            </div>
                        </div>
                        
                        <div id="monthly-tab" class="tab-pane">
                            <div class="monthly-schedule calendar-container" id="monthlySchedule">
                                ${this.generateMonthlySchedule(
                                  approvedSchedules
                                )}
                            </div>
                        </div>
                        
                        <div id="list-tab" class="tab-pane">
                            <div class="schedule-list" id="scheduleListView">
                                ${
                                  approvedSchedules.length === 0
                                    ? '<div class="empty-state"><i class="fas fa-calendar-times"></i><p>Nenhum agendamento confirmado.</p></div>'
                                    : approvedSchedules
                                        .map((schedule) =>
                                          this.createScheduleItem(schedule)
                                        )
                                        .join("")
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Event listeners
    document
      .getElementById("closeScheduleView")
      .addEventListener("click", () => {
        this.hideModal("scheduleViewModal");
        document.getElementById("scheduleViewModal").remove();
      });

    // Tab switching
    document.querySelectorAll("#scheduleViewModal .tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const buttonEl = e.currentTarget || e.target.closest("button");
        const tabName = buttonEl?.dataset.tab;
        if (tabName) {
          this.switchScheduleTab(tabName, "scheduleViewModal");

          if (tabName === "monthly") {
            setTimeout(() => {
              const currentMonth =
                this.currentScheduleMonth !== undefined
                  ? this.currentScheduleMonth
                  : new Date().getMonth();
              const currentYear =
                this.currentScheduleYear !== undefined
                  ? this.currentScheduleYear
                  : new Date().getFullYear();
              this.addScheduleCalendarClickListeners(currentMonth, currentYear);
            }, 100);
          }
        }
      });
    });

    setTimeout(() => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      this.addScheduleCalendarClickListeners(currentMonth, currentYear);
    }, 200);

    this.showModal("scheduleViewModal");
  }

  generateWeeklySchedule(schedules) {
    const today = new Date();
    const startOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const jsWeekDay = today.getDay();
    const distanceToMonday = (jsWeekDay + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - distanceToMonday);

    const weekDays = [
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
      "Domingo",
    ];
    const weekSchedules = {};

    // Inicializar dias da semana
    for (let i = 0; i < 7; i++) {
      const day = new Date(
        startOfWeek.getFullYear(),
        startOfWeek.getMonth(),
        startOfWeek.getDate() + i
      );
      const dayKey = `${day.getFullYear()}-${String(
        day.getMonth() + 1
      ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      weekSchedules[dayKey] = {
        date: day,
        schedules: [],
      };
    }

    // Agrupar agendamentos por dia
    schedules.forEach((schedule) => {
      const scheduleDate = schedule.date;
      if (weekSchedules[scheduleDate]) {
        weekSchedules[scheduleDate].schedules.push(schedule);
      }
    });

    // Ordenar agendamentos por horário
    Object.values(weekSchedules).forEach((day) => {
      day.schedules.sort((a, b) => a.time.localeCompare(b.time));
    });

    return `
            <div class="weekly-grid">
                ${Object.entries(weekSchedules)
                  .map(
                    ([date, dayData]) => `
                    <div class="week-day">
                        <div class="day-header">
                            <h4>${
                              weekDays[(dayData.date.getDay() + 6) % 7]
                            }</h4>
                            <span class="day-date">${dayData.date.getDate()}/${
                      dayData.date.getMonth() + 1
                    }</span>
                        </div>
                        <div class="day-schedules">
                            ${
                              dayData.schedules.length === 0
                                ? '<div class="no-schedules">Sem agendamentos</div>'
                                : dayData.schedules
                                    .map(
                                      (schedule) => `
                                    <div class="schedule-slot">
                                        <div class="slot-time">${schedule.time}</div>
                                        <div class="slot-info">
                                            <div class="slot-subject">${schedule.subject}</div>
                                            <div class="slot-user">${schedule.userName}</div>
                                        </div>
                                    </div>
                                `
                                    )
                                    .join("")
                            }
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  }

  generateMonthlySchedule(schedules, month = null, year = null) {
    const today = new Date();
    const currentMonth = month !== null ? month : today.getMonth();
    const currentYear = year !== null ? year : today.getFullYear();

    // Agrupar agendamentos por data (YYYY-MM-DD)
    const schedulesByDate = {};
    schedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.date);
      if (
        scheduleDate.getMonth() === currentMonth &&
        scheduleDate.getFullYear() === currentYear
      ) {
        const dateKey = schedule.date; // Já está no formato YYYY-MM-DD
        if (!schedulesByDate[dateKey]) {
          schedulesByDate[dateKey] = [];
        }
        schedulesByDate[dateKey].push(schedule);
      }
    });

    // Ordenar agendamentos por horário em cada dia
    Object.values(schedulesByDate).forEach((daySchedules) => {
      daySchedules.sort((a, b) => a.time.localeCompare(b.time));
    });

    // Usar o mesmo componente de calendário visual
    return this.generateMonthlyCalendarWithSchedules(
      currentMonth,
      currentYear,
      schedulesByDate
    );
  }

  generateMonthlyCalendarWithSchedules(month, year, schedulesByDate = {}) {
    const now = new Date();
    const currentMonth = month !== null ? month : now.getMonth();
    const currentYear = year !== null ? year : now.getFullYear();

    // Primeiro dia do mês
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    const today = new Date();
    const isCurrentMonth =
      currentMonth === today.getMonth() && currentYear === today.getFullYear();

    let calendarHTML = `
      <div class="month-calendar">
        <div class="calendar-header">
          <button type="button" class="calendar-nav-btn" id="prevMonthScheduleBtn" onclick="agendaSystem.changeScheduleMonth(-1)">
            <i class="fas fa-chevron-left"></i>
          </button>
          <h3 class="calendar-month-title">${
            monthNames[currentMonth]
          } ${currentYear}</h3>
          <button type="button" class="calendar-nav-btn" id="nextMonthScheduleBtn" onclick="agendaSystem.changeScheduleMonth(1)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="calendar-weekdays">
          ${weekDays
            .map((day) => `<div class="calendar-weekday">${day}</div>`)
            .join("")}
        </div>
        <div class="calendar-days" id="scheduleCalendarDays" data-month="${currentMonth}" data-year="${currentYear}">
    `;

    // Espaços vazios para os dias antes do primeiro dia do mês
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarHTML += '<div class="calendar-day empty"></div>';
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const dateObj = new Date(currentYear, currentMonth, day);
      const isPast =
        dateObj < today && dateObj.toDateString() !== today.toDateString();
      const isToday = isCurrentMonth && day === today.getDate();
      const daySchedules = schedulesByDate[dateStr] || [];
      const hasSchedules = daySchedules.length > 0;

      calendarHTML += `
        <div class="calendar-day ${isPast ? "past" : ""} ${
        isToday ? "today" : ""
      } ${hasSchedules ? "has-schedules" : ""}" 
             data-date="${dateStr}" 
             data-day="${day}"
             data-month="${currentMonth}"
             data-year="${currentYear}"
             ${isPast ? "" : 'style="cursor: pointer;"'}>
          <div class="calendar-day-number">${day}</div>
          ${
            hasSchedules
              ? `
            <div class="calendar-day-schedules">
              <div class="schedule-count-badge">${daySchedules.length}</div>
              ${daySchedules
                .slice(0, 2)
                .map(
                  (schedule) => `
                <div class="mini-schedule-item">
                  <span class="mini-time">${schedule.time}</span>
                  <span class="mini-subject" title="${schedule.subject}">${
                    schedule.subject.length > 15
                      ? schedule.subject.substring(0, 15) + "..."
                      : schedule.subject
                  }</span>
                </div>
              `
                )
                .join("")}
              ${
                daySchedules.length > 2
                  ? `<div class="more-schedules">+${
                      daySchedules.length - 2
                    }</div>`
                  : ""
              }
            </div>
          `
              : ""
          }
        </div>
      `;
    }

    calendarHTML += `
        </div>
      </div>
    `;

    // Armazenar schedules para uso nos event listeners
    if (!this.scheduleCalendarData) {
      this.scheduleCalendarData = {};
    }
    this.scheduleCalendarData[`${currentMonth}-${currentYear}`] =
      schedulesByDate;
    this.currentScheduleMonth = currentMonth;
    this.currentScheduleYear = currentYear;

    return calendarHTML;
  }

  changeScheduleMonth(direction) {
    if (
      this.currentScheduleMonth === undefined ||
      this.currentScheduleYear === undefined
    ) {
      const today = new Date();
      this.currentScheduleMonth = today.getMonth();
      this.currentScheduleYear = today.getFullYear();
    }

    let currentMonth = this.currentScheduleMonth;
    let currentYear = this.currentScheduleYear;

    currentMonth += direction;

    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    } else if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }

    this.currentScheduleMonth = currentMonth;
    this.currentScheduleYear = currentYear;

    // Recarregar agendamentos do mês atual
    const approvedSchedules = this.requests.filter(
      (req) => req.status === "approved"
    );

    // Agrupar agendamentos por data
    const schedulesByDate = {};
    approvedSchedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.date);
      if (
        scheduleDate.getMonth() === currentMonth &&
        scheduleDate.getFullYear() === currentYear
      ) {
        const dateKey = schedule.date;
        if (!schedulesByDate[dateKey]) {
          schedulesByDate[dateKey] = [];
        }
        schedulesByDate[dateKey].push(schedule);
      }
    });

    // Gerar novo calendário
    const calendarHTML = this.generateMonthlyCalendarWithSchedules(
      currentMonth,
      currentYear,
      schedulesByDate
    );

    // Atualizar calendário no modal
    const calendarContainer = document.getElementById("monthlySchedule");
    if (calendarContainer) {
      calendarContainer.innerHTML = calendarHTML;
    }

    // Adicionar event listeners nos dias
    setTimeout(() => {
      this.addScheduleCalendarClickListeners(currentMonth, currentYear);
    }, 100);
  }

  addScheduleCalendarClickListeners(currentMonth, currentYear) {
    document
      .querySelectorAll(
        "#scheduleCalendarDays .calendar-day:not(.empty):not(.past)"
      )
      .forEach((dayElement) => {
        dayElement.addEventListener("click", (e) => {
          const dateStr = dayElement.getAttribute("data-date");
          const day = parseInt(dayElement.getAttribute("data-day"));
          const month = parseInt(dayElement.getAttribute("data-month"));
          const year = parseInt(dayElement.getAttribute("data-year"));

          // Buscar agendamentos para este dia
          const key = `${month}-${year}`;
          const schedulesByDate = this.scheduleCalendarData[key] || {};
          const daySchedules = schedulesByDate[dateStr] || [];

          // Mostrar modal com agendamentos do dia
          this.showDayAgendamentosModal(day, month, year, daySchedules);
        });
      });
  }

  startAutoRefresh() {
    // Implementar auto-refresh
  }

  stopAutoRefresh() {
    // Implementar parada do auto-refresh
  }

  // Função para adicionar event listeners nos dias do calendário
  addCalendarClickListeners(monthSchedules, currentMonth, currentYear) {
    document.querySelectorAll(".month-day").forEach((dayElement) => {
      dayElement.addEventListener("click", (e) => {
        const day = parseInt(dayElement.getAttribute("data-day"));
        const month = parseInt(dayElement.getAttribute("data-month"));
        const year = parseInt(dayElement.getAttribute("data-year"));

        // Buscar agendamentos para este dia específico
        const daySchedules = monthSchedules[day] || [];

        // Mostrar modal com agendamentos do dia
        this.showDayAgendamentosModal(day, month, year, daySchedules);
      });
    });
  }

  // Função para mostrar modal com agendamentos de um dia específico
  showDayAgendamentosModal(day, month, year, daySchedules) {
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const date = new Date(year, month, day);
    const formattedDate = date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    let schedulesHTML = "";

    if (daySchedules.length === 0) {
      schedulesHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>Nenhum agendamento para este dia</p>
                </div>
            `;
    } else {
      schedulesHTML = daySchedules
        .map((schedule) => {
          const statusClass =
            schedule.status === "approved"
              ? "success"
              : schedule.status === "rejected"
              ? "danger"
              : "warning";
          const statusText =
            schedule.status === "approved"
              ? "APROVADO"
              : schedule.status === "rejected"
              ? "RECUSADO"
              : "PENDENTE";

          return `
                    <div class="day-agendamento-item ${statusClass}">
                        <div class="agendamento-header">
                            <div class="agendamento-time">
                                <i class="fas fa-clock"></i>
                                <span>${schedule.time}</span>
                            </div>
                            <span class="agendamento-status status-${
                              schedule.status
                            }">
                                ${statusText}
                            </span>
                        </div>
                        <div class="agendamento-content">
                            <h4 class="agendamento-subject">${
                              schedule.subject
                            }</h4>
                            ${
                              schedule.message
                                ? `<p class="agendamento-message">${schedule.message}</p>`
                                : ""
                            }
                            <div class="agendamento-details">
                                ${
                                  schedule.orientador
                                    ? `
                                    <p><strong>Orientador:</strong> ${schedule.orientador.name} - ${schedule.orientador.specialty}</p>
                                `
                                    : ""
                                }
                                ${
                                  schedule.userName
                                    ? `<p><strong>Solicitante:</strong> ${schedule.userName}</p>`
                                    : ""
                                }
                                ${
                                  schedule.userEmail
                                    ? `<p><strong>Email:</strong> ${schedule.userEmail}</p>`
                                    : ""
                                }
                                ${
                                  schedule.responseDate
                                    ? `<p><strong>Confirmado em:</strong> ${this.formatDate(
                                        schedule.responseDate
                                      )}</p>`
                                    : ""
                                }
                            </div>
                        </div>
                        ${
                          this.userType === "coordenador"
                            ? `
                            <div class="agendamento-actions">
                                ${
                                  schedule.status === "pending"
                                    ? `
                                    <button class="btn btn-sm btn-success" onclick="agendaSystem.approveSchedule('${schedule.id}')">
                                        <i class="fas fa-check"></i> Aprovar
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="agendaSystem.rejectSchedule('${schedule.id}')">
                                        <i class="fas fa-times"></i> Recusar
                                    </button>
                                `
                                    : ""
                                }
                            </div>
                        `
                            : ""
                        }
                    </div>
                `;
        })
        .join("");
    }

    const modalHTML = `
            <div id="dayAgendamentosModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Agendamentos - ${formattedDate}</h2>
                        <span class="close" id="closeDayAgendamentos">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="day-agendamentos-container">
                            ${schedulesHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Remover modal anterior se existir
    const existingModal = document.getElementById("dayAgendamentosModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Adicionar novo modal
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Adicionar event listener para fechar modal
    document
      .getElementById("closeDayAgendamentos")
      .addEventListener("click", () => {
        this.hideModal("dayAgendamentosModal");
        document.getElementById("dayAgendamentosModal").remove();
      });

    // Mostrar modal
    this.showModal("dayAgendamentosModal");
  }

  // Sistema de Modais
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  }

  // Função específica para fechar modais de formulários (apenas com X)
  hideFormModal(modalId) {
    this.hideModal(modalId);
  }

  // Sistema de Notificações
  showNotification(message, type = "info") {
    // Garantir que o container de notificações existe e está no topo do DOM
    let container = document.getElementById("notificationContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "notificationContainer";
      container.className = "notification-container";
      // Adicionar ao final do body para garantir que está acima de tudo
      document.body.appendChild(container);
    }

    // Garantir z-index máximo via estilo inline como fallback
    container.style.zIndex = "99999";
    container.style.position = "fixed";

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    // Garantir z-index nas notificações individuais também
    notification.style.zIndex = "99999";
    notification.style.position = "relative";

    // Ícones para cada tipo de notificação
    const icons = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    };

    notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon ${icons[type] || icons.info}"></i>
                <span class="notification-text">${message}</span>
            </div>
            <button class="notification-close" aria-label="Fechar notificação">&times;</button>
        `;

    container.appendChild(notification);

    // Auto-remover após 5 segundos
    const autoRemove = setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation =
          "notificationSlideOut 0.3s ease forwards";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);

    // Botão de fechar
    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        clearTimeout(autoRemove);
        if (notification.parentNode) {
          notification.style.animation =
            "notificationSlideOut 0.3s ease forwards";
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }
      });

    // Pausar auto-remover ao hover
    notification.addEventListener("mouseenter", () => {
      clearTimeout(autoRemove);
    });

    notification.addEventListener("mouseleave", () => {
      const newAutoRemove = setTimeout(() => {
        if (notification.parentNode) {
          notification.style.animation =
            "notificationSlideOut 0.3s ease forwards";
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }
      }, 3000);
    });
  }

  // Sistema de Acessibilidade
  setupAccessibility() {
    this.loadAccessibilitySettings();
    this.updateAccessibilityUI();
  }

  toggleDarkMode() {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    document.body.setAttribute("data-theme", isDark ? "light" : "dark");
    this.saveAccessibilitySetting("theme", isDark ? "light" : "dark");
    this.updateAccessibilityUI();
    this.showAccessibilityIndicator(
      isDark ? "Modo Claro Ativado" : "Modo Escuro Ativado"
    );
  }

  increaseFontSize() {
    const currentSize =
      document.body.getAttribute("data-font-size") || "normal";
    const sizes = ["small", "normal", "large", "xlarge"];
    const currentIndex = sizes.indexOf(currentSize);
    const newIndex = Math.min(currentIndex + 1, sizes.length - 1);
    const newSize = sizes[newIndex];

    if (newSize !== currentSize) {
      document.body.setAttribute("data-font-size", newSize);
      this.saveAccessibilitySetting("fontSize", newSize);
      this.updateAccessibilityUI();
      this.showAccessibilityIndicator(
        `Fonte: ${newSize.charAt(0).toUpperCase() + newSize.slice(1)}`
      );
    }
  }

  decreaseFontSize() {
    const currentSize =
      document.body.getAttribute("data-font-size") || "normal";
    const sizes = ["small", "normal", "large", "xlarge"];
    const currentIndex = sizes.indexOf(currentSize);
    const newIndex = Math.max(currentIndex - 1, 0);
    const newSize = sizes[newIndex];

    if (newSize !== currentSize) {
      document.body.setAttribute("data-font-size", newSize);
      this.saveAccessibilitySetting("fontSize", newSize);
      this.updateAccessibilityUI();
      this.showAccessibilityIndicator(
        `Fonte: ${newSize.charAt(0).toUpperCase() + newSize.slice(1)}`
      );
    }
  }

  toggleHighContrast() {
    const isHighContrast =
      document.body.getAttribute("data-contrast") === "high";
    document.body.setAttribute(
      "data-contrast",
      isHighContrast ? "normal" : "high"
    );
    this.saveAccessibilitySetting(
      "contrast",
      isHighContrast ? "normal" : "high"
    );
    this.updateAccessibilityUI();
    this.showAccessibilityIndicator(
      isHighContrast ? "Alto Contraste Desativado" : "Alto Contraste Ativado"
    );
  }

  saveAccessibilitySetting(key, value) {
    const settings = this.getAccessibilitySettings();
    settings[key] = value;
    localStorage.setItem("accessibility_settings", JSON.stringify(settings));
  }

  getAccessibilitySettings() {
    return JSON.parse(localStorage.getItem("accessibility_settings") || "{}");
  }

  loadAccessibilitySettings() {
    const settings = this.getAccessibilitySettings();

    if (settings.theme) {
      document.body.setAttribute("data-theme", settings.theme);
    }

    if (settings.fontSize) {
      document.body.setAttribute("data-font-size", settings.fontSize);
    }

    if (settings.contrast) {
      document.body.setAttribute("data-contrast", settings.contrast);
    }
  }

  updateAccessibilityUI() {
    // Atualizar ícones dos botões de acessibilidade
    const darkModeBtn = document.getElementById("darkModeToggle");
    const fontSizeIncreaseBtn = document.getElementById("fontSizeIncrease");
    const fontSizeDecreaseBtn = document.getElementById("fontSizeDecrease");
    const highContrastBtn = document.getElementById("highContrastToggle");

    if (darkModeBtn) {
      const isDark = document.body.getAttribute("data-theme") === "dark";
      darkModeBtn.innerHTML = `<i class="fas ${
        isDark ? "fa-sun" : "fa-moon"
      }"></i>`;
      darkModeBtn.title = isDark ? "Modo Claro" : "Modo Escuro";
    }

    if (fontSizeIncreaseBtn) {
      const currentSize =
        document.body.getAttribute("data-font-size") || "normal";
      const sizes = ["small", "normal", "large", "xlarge"];
      const currentIndex = sizes.indexOf(currentSize);
      const isMaxSize = currentIndex >= sizes.length - 1;
      fontSizeIncreaseBtn.disabled = isMaxSize;
      fontSizeIncreaseBtn.style.opacity = isMaxSize ? "0.5" : "1";
    }

    if (fontSizeDecreaseBtn) {
      const currentSize =
        document.body.getAttribute("data-font-size") || "normal";
      const sizes = ["small", "normal", "large", "xlarge"];
      const currentIndex = sizes.indexOf(currentSize);
      const isMinSize = currentIndex <= 0;
      fontSizeDecreaseBtn.disabled = isMinSize;
      fontSizeDecreaseBtn.style.opacity = isMinSize ? "0.5" : "1";
    }

    if (highContrastBtn) {
      const isHighContrast =
        document.body.getAttribute("data-contrast") === "high";
      highContrastBtn.innerHTML = `<i class="fas ${
        isHighContrast ? "fa-adjust" : "fa-adjust"
      }"></i>`;
      highContrastBtn.title = isHighContrast
        ? "Contraste Normal"
        : "Alto Contraste";
      highContrastBtn.style.backgroundColor = isHighContrast ? "#000" : "";
      highContrastBtn.style.color = isHighContrast ? "#fff" : "";
    }
  }

  handleKeyboardNavigation(e) {
    // Atalhos de teclado para acessibilidade
    if (e.altKey) {
      switch (e.key) {
        case "1":
          e.preventDefault();
          this.toggleDarkMode();
          this.showNotification("Modo escuro/claro alternado", "info");
          break;
        case "2":
          e.preventDefault();
          this.increaseFontSize();
          this.showNotification("Fonte aumentada", "info");
          break;
        case "3":
          e.preventDefault();
          this.decreaseFontSize();
          this.showNotification("Fonte diminuída", "info");
          break;
        case "4":
          e.preventDefault();
          this.toggleHighContrast();
          this.showNotification("Alto contraste alternado", "info");
          break;
        case "h":
          e.preventDefault();
          this.showAccessibilityHelp();
          break;
      }
    }

    // ESC para fechar modais
    if (e.key === "Escape") {
      const openModal = document.querySelector('.modal[style*="block"]');
      if (openModal) {
        this.hideModal(openModal.id);
      }
    }
  }

  showAccessibilityHelp() {
    const modalHTML = `
            <div id="accessibilityHelpModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Atalhos de Acessibilidade</h2>
                        <span class="close" id="closeAccessibilityHelp">&times;</span>
                    </div>
                    <div class="auth-form">
                        <div class="accessibility-help">
                            <h3>Atalhos de Teclado:</h3>
                            <ul>
                                <li><strong>Alt + 1:</strong> Alternar modo escuro/claro</li>
                                <li><strong>Alt + 2:</strong> Aumentar tamanho da fonte</li>
                                <li><strong>Alt + 3:</strong> Diminuir tamanho da fonte</li>
                                <li><strong>Alt + 4:</strong> Alternar alto contraste</li>
                                <li><strong>Alt + H:</strong> Mostrar esta ajuda</li>
                                <li><strong>ESC:</strong> Fechar modais</li>
                            </ul>
                            
                            <h3>Controles de Acessibilidade:</h3>
                            <p>Use os botões flutuantes no canto inferior direito da tela para:</p>
                            <ul>
                                <li>🌙/☀️ Alternar tema escuro/claro</li>
                                <li>➕ Aumentar fonte</li>
                                <li>➖ Diminuir fonte</li>
                                <li>⚖️ Alto contraste</li>
                            </ul>
                            
                            <h3>Navegação:</h3>
                            <ul>
                                <li>Use Tab para navegar entre elementos</li>
                                <li>Use Enter ou Espaço para ativar botões</li>
                                <li>Use setas para navegar em listas</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document
      .getElementById("closeAccessibilityHelp")
      .addEventListener("click", () => {
        this.hideModal("accessibilityHelpModal");
        document.getElementById("accessibilityHelpModal").remove();
      });

    this.showModal("accessibilityHelpModal");
  }

  showAccessibilityIndicator(message) {
    // Remover indicador anterior se existir
    const existingIndicator = document.querySelector(
      ".accessibility-indicator"
    );
    if (existingIndicator) {
      existingIndicator.remove();
    }

    // Criar novo indicador
    const indicator = document.createElement("div");
    indicator.className = "accessibility-indicator";
    indicator.textContent = message;

    document.body.appendChild(indicator);

    // Remover após 3 segundos
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.remove();
      }
    }, 3000);
  }

  toggleMobileMenu() {
    const navMenu = document.getElementById("nav-menu");
    navMenu.classList.toggle("active");
  }

  // Sistema de Persistência
  saveUserData() {
    if (this.currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
    }
  }

  loadUserData() {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.isLoggedIn = true;
      this.userType = this.currentUser.userType;
    }
  }

  saveRequests() {
    localStorage.setItem("agenda_requests", JSON.stringify(this.requests));
  }

  loadRequests() {
    const savedRequests = localStorage.getItem("agenda_requests");
    if (savedRequests) {
      this.requests = JSON.parse(savedRequests);
    }
    this.loadRequestsFromFirebase();
  }

  async loadRequestsFromFirebase() {
    try {
      const firebaseAuthUser = firebase.auth().currentUser;

      if (!window.db || !firebaseAuthUser) {
        console.error(
          "Usuário do Firebase Auth não encontrado ou DB indisponível. Consulta abortada."
        );
        return;
      }

      const authUid = firebaseAuthUser.uid;
      const currentUserId = this.currentUser?.id;

      if (currentUserId && authUid !== currentUserId) {
        console.warn(
          "AVISO: UID da aplicação (this.currentUser.id) difere do UID de Auth! Usando UID de Auth para a consulta."
        );
      }

      console.log("DEBUG AUTH UID (Usado na query):", authUid);

      const responsavelQuery = await db
        .collection("solicitacoes")
        .where("responsavelId", "==", authUid)
        .get();

      const orientadorQuery = await db
        .collection("solicitacoes")
        .where("orientadorId", "==", authUid)
        .get();

      const firebaseRequests = [];

      responsavelQuery.forEach((doc) => {
        const data = doc.data();
        firebaseRequests.push({
          id: doc.id,
          userId: data.responsavelId,
          responsavelId: data.responsavelId,
          orientadorId: data.orientadorId,
          date: data.data,
          time: data.horario,
          subject: data.assunto,
          message: data.mensagem,
          status: data.status,
          attendanceStatus: data.attendanceStatus || "pendente",
          attendanceFeedback: data.attendanceFeedback || "",
          postAttendanceFeedback:
            data.postAttendanceFeedback || data.attendanceFeedback || "",
          createdAt: data.criadoEm?.toDate?.() || new Date(0),
          orientador: this.getOrientadorById(data.orientadorId),
          responsavelNome: data.responsavelNome,
          responsavelEmail: data.responsavelEmail,
        });
      });

      orientadorQuery.forEach((doc) => {
        const data = doc.data();
        if (!firebaseRequests.some((r) => r.id === doc.id)) {
          firebaseRequests.push({
            id: doc.id,
            userId: data.responsavelId,
            responsavelId: data.responsavelId,
            orientadorId: data.orientadorId,
            date: data.data,
            time: data.horario,
            subject: data.assunto,
            message: data.mensagem,
            status: data.status,
            attendanceStatus: data.attendanceStatus || "pendente",
            attendanceFeedback: data.attendanceFeedback || "",
            postAttendanceFeedback:
              data.postAttendanceFeedback || data.attendanceFeedback || "",
            createdAt: data.criadoEm?.toDate?.() || new Date(0),
            orientador: this.getOrientadorById(data.orientadorId),
            responsavelNome: data.responsavelNome,
            responsavelEmail: data.responsavelEmail,
          });
        }
      });

      firebaseRequests.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      this.requests = firebaseRequests;
      this.saveRequests();
    } catch (error) {
      console.error("Erro ao carregar solicitações do Firebase:", error);
    }
  }

  /**
   * Carrega os horários (time slots) do Firebase,
   * filtrados pelo Orientador (para gerenciar) ou
   * todos (para o Responsável agendar).
   */
  async loadTimeSlotsFromFirebase() {
    try {
      const firebaseAuthUser = firebase.auth().currentUser;

      if (!window.db || !firebaseAuthUser) {
        console.error("loadTimeSlots: Auth/DB indisponível.");
        localStorage.setItem("timeSlots", JSON.stringify([]));
        return;
      }

      const authUid = firebaseAuthUser.uid;
      let slotsQuery;

      if (this.userType === "coordenador") {
        console.log(`Carregando horários PARA o Orientador ${authUid}`);
        slotsQuery = db
          .collection("horarios_disponiveis")
          .where("orientadorId", "==", authUid);
      } else if (this.userType === "responsavel") {
        console.log("Carregando TODOS os horários para o Responsável");
        slotsQuery = db.collection("horarios_disponiveis");
      } else {
        localStorage.setItem("timeSlots", JSON.stringify([]));
        return;
      }

      const snapshot = await slotsQuery.get();

      const firebaseTimeSlots = [];
      snapshot.forEach((doc) => {
        firebaseTimeSlots.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      localStorage.setItem("timeSlots", JSON.stringify(firebaseTimeSlots));

      console.log(`Carregados ${firebaseTimeSlots.length} horários no total.`);
    } catch (error) {
      console.error("Erro ao carregar horários do Firebase:", error);
      localStorage.setItem("timeSlots", JSON.stringify([]));
    }
  }

  /**
   * Carrega as DATAS BLOQUEADAS do Firebase,
   * filtradas pelo Orientador (para gerenciar) ou
   * todas (para o Responsável agendar).
   */
  async loadBlockedDatesFromFirebase() {
    try {
      const firebaseAuthUser = firebase.auth().currentUser;

      if (!window.db || !firebaseAuthUser) {
        localStorage.setItem("blockedDates", JSON.stringify([]));
        return;
      }

      const authUid = firebaseAuthUser.uid;
      let blockedQuery;

      if (this.userType === "coordenador") {
        // Orientador: Carrega APENAS os seus bloqueios
        console.log(`Carregando bloqueios PARA o Orientador ${authUid}`);
        blockedQuery = db
          .collection("datas_bloqueadas")
          .where("orientadorId", "==", authUid);
      } else if (this.userType === "responsavel") {
        // Responsável: Carrega TODOS os bloqueios de TODOS orientadores
        console.log("Carregando TODOS os bloqueios para o Responsável");
        blockedQuery = db.collection("datas_bloqueadas");
      } else {
        localStorage.setItem("blockedDates", JSON.stringify([]));
        return;
      }

      const snapshot = await blockedQuery.get();

      const firebaseBlockedDates = [];
      snapshot.forEach((doc) => {
        firebaseBlockedDates.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      localStorage.setItem(
        "blockedDates",
        JSON.stringify(firebaseBlockedDates)
      );
      console.log(
        `Carregadas ${firebaseBlockedDates.length} datas bloqueadas.`
      );
    } catch (error) {
      console.error("Erro ao carregar datas bloqueadas do Firebase:", error);
      localStorage.setItem("blockedDates", JSON.stringify([]));
    }
  }

  checkAuthStatus() {
    if (this.isLoggedIn) {
      this.updateHeaderForLoggedUser();
      this.showDashboard();
    } else {
      this.updateHeaderForGuest();
      // Garantir que o conteúdo principal está visível
      document.querySelector("main").style.display = "block";
      document.getElementById("dashboard").classList.add("hidden");
    }
  }

  // Funções auxiliares para gerenciamento de agenda
  generateTimeSlotsHTML() {
    const timeSlots = this.getTimeSlots();
    if (timeSlots.length === 0) {
      return '<div class="empty-state"><i class="fas fa-clock"></i><p>Nenhum horário configurado</p></div>';
    }

    // Ordenar por data
    const sortedSlots = [...timeSlots].sort((a, b) => {
      const dateA = a.date || (a.dayOfWeek ? "9999-99-99" : "0000-00-00");
      const dateB = b.date || (b.dayOfWeek ? "9999-99-99" : "0000-00-00");
      return dateA.localeCompare(dateB);
    });

    return sortedSlots
      .map(
        (slot) => `
            <div class="time-slot-item">
                <div class="slot-info">
                    <span class="slot-day">${
                      slot.date
                        ? this.formatDate(slot.date)
                        : slot.dayOfWeek !== undefined
                        ? this.getDayName(slot.dayOfWeek)
                        : "N/A"
                    }</span>
                    <span class="slot-time">${slot.startTime} - ${
          slot.endTime
        }</span>
                    <span class="slot-duration">${slot.duration} min</span>
                </div>
                <div class="slot-actions">
                    <button class="btn btn-sm btn-outline" onclick="agendaSystem.editTimeSlot('${
                      slot.id
                    }')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="agendaSystem.deleteTimeSlot('${
                      slot.id
                    }')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `
      )
      .join("");
  }

  generateBlockedDatesHTML() {
    const blockedDates = this.getBlockedDates();
    if (blockedDates.length === 0) {
      return '<div class="empty-state"><i class="fas fa-ban"></i><p>Nenhuma data bloqueada</p></div>';
    }

    return blockedDates
      .map(
        (date) => `
            <div class="blocked-date-item">
                <div class="date-info">
                    <span class="blocked-date">${this.formatDate(
                      date.date
                    )}</span>
                    <span class="blocked-reason">${date.reason}</span>
                </div>
                <div class="date-actions">
                    <button class="btn btn-sm btn-outline" onclick="agendaSystem.editBlockedDate('${
                      date.id
                    }')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="agendaSystem.deleteBlockedDate('${
                      date.id
                    }')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `
      )
      .join("");
  }

  getTimeSlots() {
    const stored = localStorage.getItem("timeSlots");
    return stored ? JSON.parse(stored) : [];
  }

  getBlockedDates() {
    const stored = localStorage.getItem("blockedDates");
    return stored ? JSON.parse(stored) : [];
  }

  getScheduleSettings() {
    const stored = localStorage.getItem("scheduleSettings");
    return stored
      ? JSON.parse(stored)
      : {
          defaultDuration: 30,
          advanceNotice: 24,
          maxDailySlots: 10,
          workingDays: [], // Todos os dias desmarcados por padrão
        };
  }

  getDayName(dayIndex) {
    const days = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];
    return days[dayIndex];
  }

  // Converter dia da semana do JavaScript (0=domingo) para nosso sistema (1=segunda)
  convertToSystemDay(jsDay) {
    // JavaScript: 0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado
    // Nosso sistema: 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado, 0=domingo
    return jsDay === 0 ? 0 : jsDay; // Manter domingo como 0, outros dias como estão
  }

  // Converter dia do nosso sistema para JavaScript
  convertFromSystemDay(systemDay) {
    return systemDay;
  }

  switchScheduleTab(tabName, modalId = "scheduleManagerModal") {
    // Remove active class from all tabs and panes
    document
      .querySelectorAll(`#${modalId} .tab-btn`)
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(`#${modalId} .tab-pane`)
      .forEach((pane) => pane.classList.remove("active"));

    // Add active class to selected tab and pane
    document
      .querySelector(`#${modalId} [data-tab="${tabName}"]`)
      .classList.add("active");
    document.getElementById(`${tabName}-tab`).classList.add("active");
  }

  createScheduleItem(schedule) {
    const isUpcoming = new Date(schedule.date) >= new Date();
    const statusClass =
      schedule.status === "approved"
        ? "success"
        : schedule.status === "rejected"
        ? "danger"
        : "warning";

    return `
            <div class="schedule-item ${statusClass} ${
      isUpcoming ? "upcoming" : "past"
    }">
                <div class="schedule-info">
                    <div class="schedule-header">
                        <h4>${schedule.subject}</h4>
                        <span class="schedule-status status-${schedule.status}">
                            ${this.getStatusText(schedule.status)}
                        </span>
                    </div>
                    <div class="schedule-details">
                        ${
                          schedule.orientador
                            ? `
                            <p><strong>Orientador:</strong> ${schedule.orientador.name} - ${schedule.orientador.specialty}</p>
                        `
                            : ""
                        }
                        ${
                          schedule.studentName
                            ? `<p><strong>Aluno:</strong> ${schedule.studentName}</p>`
                            : ""
                        }
                        ${
                          schedule.studentGrade
                            ? `<p><strong>Série:</strong> ${this.formatGrade(
                                schedule.studentGrade
                              )}</p>`
                            : ""
                        }
                        ${
                          schedule.studentClass
                            ? `<p><strong>Turma:</strong> ${schedule.studentClass}</p>`
                            : ""
                        }
                        <p><strong>Data:</strong> ${this.formatDate(
                          schedule.date
                        )}</p>
                        <p><strong>Horário:</strong> ${schedule.time}</p>
                        ${
                          this.userType === "coordenador"
                            ? `
                            <p><strong>Solicitante:</strong> ${schedule.userName}</p>
                            <p><strong>Email:</strong> ${schedule.userEmail}</p>
                        `
                            : ""
                        }
                        ${
                          schedule.message
                            ? `<p><strong>Mensagem:</strong> ${schedule.message}</p>`
                            : ""
                        }
                        ${
                          schedule.responseDate
                            ? `<p><strong>Confirmado em:</strong> ${this.formatDate(
                                schedule.responseDate
                              )}</p>`
                            : ""
                        }
                    </div>
                </div>
                <div class="schedule-actions">
                    ${
                      isUpcoming && this.userType === "coordenador"
                        ? `
                        <button class="btn btn-sm btn-outline" onclick="agendaSystem.editSchedule('${schedule.id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="agendaSystem.cancelSchedule('${schedule.id}')">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    `
                        : ""
                    }
                    ${
                      this.userType === "responsavel" && isUpcoming
                        ? `
                        <button class="btn btn-sm btn-outline" onclick="agendaSystem.rescheduleRequest('${schedule.id}')">
                            <i class="fas fa-calendar-alt"></i> Reagendar
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  }

  getUpcomingSchedules(schedules) {
    const today = new Date();
    return schedules
      .filter((schedule) => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  getPastSchedules(schedules) {
    const today = new Date();
    return schedules
      .filter((schedule) => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate < today;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  showAddTimeSlotForm() {
    const calendarHTML = this.generateMonthlyCalendar();

    const formHTML = `
            <div class="time-slot-form">
                <h4>Adicionar Horário</h4>
                <form id="addTimeSlotForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Selecione as Datas:</label>
                            <div class="calendar-container">
                                ${calendarHTML}
                            </div>
                            <div class="selected-dates-summary" id="selectedDatesSummary" style="margin-top: 10px; padding: 10px; background: var(--bg-secondary); border-radius: 8px; display: none;">
                                <strong>Datas selecionadas:</strong>
                                <div id="selectedDatesList" style="margin-top: 5px;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="slotStartTime">Horário Início:</label>
                            <input type="time" id="slotStartTime" name="startTime" required>
                        </div>
                        <div class="form-group">
                            <label for="slotEndTime">Horário Fim:</label>
                            <input type="time" id="slotEndTime" name="endTime" required>
                        </div>
                        <div class="form-group">
                            <label for="slotDuration">Duração (min):</label>
                            <input type="number" id="slotDuration" name="duration" value="30" min="15" max="120" step="15" required>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Salvar</button>
                        <button type="button" class="btn btn-outline" onclick="agendaSystem.cancelTimeSlot()">Cancelar</button>
                    </div>
                </form>
            </div>
        `;

    document.getElementById("timeSlotsContainer").innerHTML = formHTML;

    // Inicializar seleção de datas
    this.initCalendarSelection();

    document
      .getElementById("addTimeSlotForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveTimeSlot();
      });
  }

  generateMonthlyCalendar(month = null, year = null) {
    const now = new Date();
    const currentMonth = month !== null ? month : now.getMonth();
    const currentYear = year !== null ? year : now.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    let calendarHTML = `
      <div class="month-calendar">
        <div class="calendar-header">
          <button type="button" class="calendar-nav-btn" id="prevMonthBtn" onclick="agendaSystem.changeCalendarMonth(-1)">
            <i class="fas fa-chevron-left"></i>
          </button>
          <h3 class="calendar-month-title">${
            monthNames[currentMonth]
          } ${currentYear}</h3>
          <button type="button" class="calendar-nav-btn" id="nextMonthBtn" onclick="agendaSystem.changeCalendarMonth(1)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="calendar-weekdays">
          ${weekDays
            .map((day) => `<div class="calendar-weekday">${day}</div>`)
            .join("")}
        </div>
        <div class="calendar-days" id="calendarDays" data-month="${currentMonth}" data-year="${currentYear}">
    `;

    // Espaços vazios para os dias antes do primeiro dia do mês
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarHTML += '<div class="calendar-day empty"></div>';
    }

    // Dias do mês
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const dateObj = new Date(currentYear, currentMonth, day);
      const isPast =
        dateObj < today && dateObj.toDateString() !== today.toDateString();

      calendarHTML += `
        <div class="calendar-day ${isPast ? "past" : ""}" 
             data-date="${dateStr}" 
             ${
               isPast ? "" : 'onclick="agendaSystem.toggleDateSelection(this)"'
             }>
          ${day}
        </div>
      `;
    }

    calendarHTML += `
        </div>
      </div>
    `;

    return calendarHTML;
  }

  initCalendarSelection() {
    // Esta função será chamada após o calendário ser renderizado
    // Armazenar seleções no escopo do objeto
    if (!this.selectedDates) {
      this.selectedDates = new Set();
    }
  }

  toggleDateSelection(element) {
    const date = element.getAttribute("data-date");

    if (!this.selectedDates) {
      this.selectedDates = new Set();
    }

    if (this.selectedDates.has(date)) {
      this.selectedDates.delete(date);
      element.classList.remove("selected");
    } else {
      this.selectedDates.add(date);
      element.classList.add("selected");
    }

    this.updateSelectedDatesSummary();
  }

  updateSelectedDatesSummary() {
    const summaryDiv = document.getElementById("selectedDatesSummary");
    const listDiv = document.getElementById("selectedDatesList");

    if (!summaryDiv || !listDiv) return;

    if (this.selectedDates && this.selectedDates.size > 0) {
      summaryDiv.style.display = "block";
      const datesArray = Array.from(this.selectedDates).sort();
      listDiv.innerHTML = datesArray
        .map((date) => {
          const dateObj = new Date(date + "T00:00:00");
          return `<span class="selected-date-badge">${this.formatDate(
            date
          )}</span>`;
        })
        .join("");
    } else {
      summaryDiv.style.display = "none";
    }
  }

  changeCalendarMonth(direction) {
    const calendarDays = document.getElementById("calendarDays");
    if (!calendarDays) return;

    let currentMonth = parseInt(calendarDays.getAttribute("data-month"));
    let currentYear = parseInt(calendarDays.getAttribute("data-year"));

    currentMonth += direction;

    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    } else if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }

    // Gerar novo calendário com mês/ano atualizados usando a função existente
    const calendarHTML = this.generateMonthlyCalendar(
      currentMonth,
      currentYear
    );

    // Atualizar calendário
    const formGroup = document.querySelector(".calendar-container");
    if (formGroup) {
      formGroup.innerHTML = calendarHTML;
    }

    // Restaurar seleções
    if (this.selectedDates && this.selectedDates.size > 0) {
      this.selectedDates.forEach((date) => {
        const dayElement = document.querySelector(
          `.calendar-day[data-date="${date}"]`
        );
        if (dayElement && !dayElement.classList.contains("past")) {
          dayElement.classList.add("selected");
        }
      });
    }

    this.initCalendarSelection();
    this.updateSelectedDatesSummary();
  }

  showAddBlockedDateForm() {
    const formHTML = `
            <div class="blocked-date-form">
                <h4>Bloquear Data</h4>
                <form id="addBlockedDateForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="blockedDate">Data:</label>
                            <input type="date" id="blockedDate" name="date" required>
                        </div>
                        <div class="form-group">
                            <label for="blockedReason">Motivo:</label>
                            <input type="text" id="blockedReason" name="reason" placeholder="Ex: Feriado, Reunião" required>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Salvar</button>
                        <button type="button" class="btn btn-outline" onclick="agendaSystem.cancelBlockedDate()">Cancelar</button>
                    </div>
                </form>
            </div>
        `;

    document.getElementById("blockedDatesContainer").innerHTML = formHTML;

    document
      .getElementById("addBlockedDateForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveBlockedDate();
      });
  }

  saveTimeSlot() {
    const formData = new FormData(document.getElementById("addTimeSlotForm"));
    const startTime = formData.get("startTime");
    const endTime = formData.get("endTime");
    const duration = parseInt(formData.get("duration"));

    // Validações
    if (!this.selectedDates || this.selectedDates.size === 0) {
      this.showNotification(
        "Selecione pelo menos uma data no calendário.",
        "error"
      );
      return;
    }

    if (startTime >= endTime) {
      this.showNotification(
        "O horário de início deve ser anterior ao horário de fim.",
        "error"
      );
      return;
    }

    const timeSlots = this.getTimeSlots();
    const newSlots = [];
    const selectedDatesArray = Array.from(this.selectedDates);

    // Criar um slot para cada data selecionada
    selectedDatesArray.forEach((date) => {
      // Verificar se já existe um horário para a mesma data e período
      const conflictingSlot = timeSlots.find(
        (slot) =>
          slot.date === date &&
          ((startTime >= slot.startTime && startTime < slot.endTime) ||
            (endTime > slot.startTime && endTime <= slot.endTime) ||
            (startTime <= slot.startTime && endTime >= slot.endTime))
      );

      if (conflictingSlot) {
        this.showNotification(
          `Já existe um horário configurado para ${this.formatDate(
            date
          )} neste período.`,
          "error"
        );
        return;
      }

      const timeSlot = {
        id:
          Date.now().toString() +
          "-" +
          date +
          "-" +
          Math.random().toString(36).substr(2, 9),
        date: date,
        startTime: startTime,
        endTime: endTime,
        duration: duration,
        createdAt: new Date().toISOString(),
      };

      newSlots.push(timeSlot);
    });

    // Adicionar todos os novos slots
    timeSlots.push(...newSlots);

    // Salvar no localStorage e no Firebase
    localStorage.setItem("timeSlots", JSON.stringify(timeSlots));
    this.saveTimeSlotsToFirebase(newSlots);

    const datesText = selectedDatesArray
      .map((date) => this.formatDate(date))
      .join(", ");
    this.showNotification(
      `Horário adicionado com sucesso para ${newSlots.length} data(s): ${datesText}`,
      "success"
    );

    // Limpar seleções
    this.selectedDates = new Set();
    this.refreshTimeSlots();
  }

  async saveTimeSlotsToFirebase(timeSlots) {
    try {
      if (window.db && this.currentUser && this.userType === "coordenador") {
        const orientadorId = this.currentUser.id;
        const batch = db.batch();

        timeSlots.forEach((slot) => {
          const slotRef = db.collection("horarios_disponiveis").doc();
          batch.set(slotRef, {
            orientadorId: orientadorId,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: slot.duration,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        });

        await batch.commit();
      }
    } catch (error) {
      console.error("Erro ao salvar horários no Firebase:", error);
    }
  }

  async saveBlockedDate() {
    const formData = new FormData(
      document.getElementById("addBlockedDateForm")
    );
    const date = formData.get("date");
    const reason = formData.get("reason");

    if (!date || !reason) {
      this.showNotification("Data e Motivo são obrigatórios.", "error");
      return;
    }

    try {
      const orientadorId = this.currentUser.id;
      if (!window.db || !orientadorId) {
        throw new Error("Usuário não autenticado ou DB indisponível.");
      }

      // firebase
      const docRef = await db.collection("datas_bloqueadas").add({
        orientadorId: orientadorId,
        date: date,
        reason: reason,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      //localStorage
      const blockedDates = this.getBlockedDates();
      blockedDates.push({
        id: docRef.id,
        date: date,
        reason: reason,
        orientadorId: orientadorId,
      });
      localStorage.setItem("blockedDates", JSON.stringify(blockedDates));

      this.showNotification("Data bloqueada com sucesso!", "success");
      this.refreshBlockedDates();
    } catch (error) {
      console.error("Erro ao salvar data bloqueada:", error);
      this.showNotification(
        "Erro ao salvar bloqueio. Tente novamente.",
        "error"
      );
    }
  }
  saveScheduleSettings() {
    const formData = new FormData(
      document.getElementById("scheduleSettingsForm")
    );
    const workingDays = Array.from(
      document.querySelectorAll('input[name="workingDays"]:checked')
    ).map((input) => parseInt(input.value));

    const settings = {
      defaultDuration: parseInt(formData.get("defaultDuration")),
      advanceNotice: parseInt(formData.get("advanceNotice")),
      maxDailySlots: parseInt(formData.get("maxDailySlots")),
      workingDays: workingDays,
    };

    localStorage.setItem("scheduleSettings", JSON.stringify(settings));
    this.showNotification("Configurações salvas com sucesso!", "success");
  }

  refreshTimeSlots() {
    document.getElementById("timeSlotsContainer").innerHTML =
      this.generateTimeSlotsHTML();
  }

  refreshBlockedDates() {
    document.getElementById("blockedDatesContainer").innerHTML =
      this.generateBlockedDatesHTML();
  }

  cancelTimeSlot() {
    this.refreshTimeSlots();
  }

  cancelBlockedDate() {
    this.refreshBlockedDates();
  }

  async deleteTimeSlot(slotId) {
    //busca o id do horario
    const timeSlots = this.getTimeSlots();
    const slot = timeSlots.find((s) => s.id === slotId);

    if (!slotId) {
      this.showNotification("ID do horário não encontrado.", "error");
      return;
    }

    if (confirm("Tem certeza que deseja excluir este horário?")) {
      try {
        //exclui do firebase
        await window.services.schedule.deleteTimeSlot(slotId);

        //excluir loalstorage
        const updatedTimeSlots = this.getTimeSlots().filter(
          (slot) => slot.id !== slotId
        );
        localStorage.setItem("timeSlots", JSON.stringify(updatedTimeSlots));

        this.showNotification("Horário excluído com sucesso!", "success");
        this.refreshTimeSlots();
      } catch (error) {
        console.error("Erro ao excluir horário:", error);
      }
    }
  }

  async deleteBlockedDate(dateId) {
    if (!dateId) {
      this.showNotification("ID do bloqueio não encontrado.", "error");
      return;
    }

    if (confirm("Tem certeza que deseja excluir esta data bloqueada?")) {
      try {
        //excluir firebase
        await window.services.schedule.deleteBlockedDate(dateId);

        //excluir localstorage
        const blockedDates = this.getBlockedDates().filter(
          (date) => date.id !== dateId
        );
        localStorage.setItem("blockedDates", JSON.stringify(blockedDates));

        this.showNotification(
          "Data bloqueada excluída com sucesso!",
          "success"
        );
        this.refreshBlockedDates();
      } catch (error) {
        console.error("Erro ao excluir data bloqueada:", error);
      }
    }
  }

  editTimeSlot(slotId) {
    // Implementar edição de horário
    this.showNotification(
      "Funcionalidade de edição em desenvolvimento",
      "info"
    );
  }

  editBlockedDate(dateId) {
    // Implementar edição de data bloqueada
    this.showNotification(
      "Funcionalidade de edição em desenvolvimento",
      "info"
    );
  }

  editSchedule(scheduleId) {
    const schedule = this.requests.find((req) => req.id === scheduleId);
    if (!schedule) return;

    const modalHTML = `
            <div id="editScheduleModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Editar Agendamento</h2>
                        <span class="close" id="closeEditSchedule">&times;</span>
                    </div>
                    <form id="editScheduleForm" class="auth-form">
                        <div class="form-group">
                            <label for="editScheduleDate">Data</label>
                            <input type="date" id="editScheduleDate" name="date" value="${
                              schedule.date
                            }" required>
                        </div>
                        <div class="form-group">
                            <label for="editScheduleTime">Horário</label>
                            <select id="editScheduleTime" name="time" required>
                                <option value="">Selecione um horário...</option>
                                ${this.generateAvailableTimeSlots()}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editScheduleSubject">Assunto</label>
                            <input type="text" id="editScheduleSubject" name="subject" value="${
                              schedule.subject
                            }" required>
                        </div>
                        <div class="form-group">
                            <label for="editScheduleMessage">Mensagem</label>
                            <textarea id="editScheduleMessage" name="message" rows="4">${
                              schedule.message || ""
                            }</textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Salvar Alterações
                            </button>
                            <button type="button" class="btn btn-outline" onclick="agendaSystem.hideModal('editScheduleModal')">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Set current time
    document.getElementById("editScheduleTime").value = schedule.time;

    // Event listeners
    document
      .getElementById("closeEditSchedule")
      .addEventListener("click", () => {
        this.hideModal("editScheduleModal");
        document.getElementById("editScheduleModal").remove();
      });

    document
      .getElementById("editScheduleForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveScheduleEdit(scheduleId);
      });

    this.showModal("editScheduleModal");
  }

  saveScheduleEdit(scheduleId) {
    const formData = new FormData(document.getElementById("editScheduleForm"));
    const schedule = this.requests.find((req) => req.id === scheduleId);

    if (schedule) {
      schedule.date = formData.get("date");
      schedule.time = formData.get("time");
      schedule.subject = formData.get("subject");
      schedule.message = formData.get("message");
      schedule.updatedAt = new Date().toISOString();

      this.saveRequests();
      this.showNotification("Agendamento atualizado com sucesso!", "success");
      this.hideModal("editScheduleModal");
      document.getElementById("editScheduleModal").remove();

      // Refresh the schedules modal if it's open
      const schedulesModal = document.getElementById("schedulesModal");
      if (schedulesModal) {
        schedulesModal.remove();
        this.showSchedulesList();
      }
    }
  }

  cancelSchedule(scheduleId) {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      const schedule = this.requests.find((req) => req.id === scheduleId);
      if (schedule) {
        schedule.status = "cancelled";
        schedule.cancelledAt = new Date().toISOString();
        this.saveRequests();
        this.showNotification("Agendamento cancelado com sucesso!", "success");

        // Refresh the schedules modal if it's open
        const schedulesModal = document.getElementById("schedulesModal");
        if (schedulesModal) {
          schedulesModal.remove();
          this.showSchedulesList();
        }
      }
    }
  }

  rescheduleRequest(scheduleId) {
    const schedule = this.requests.find((req) => req.id === scheduleId);
    if (!schedule) return;

    // Create a new request based on the existing one
    const newRequest = {
      ...schedule,
      id: Date.now().toString(),
      status: "pending",
      createdAt: new Date().toISOString(),
      originalScheduleId: scheduleId,
    };

    // Cancel the original schedule
    schedule.status = "cancelled";
    schedule.cancelledAt = new Date().toISOString();

    this.requests.push(newRequest);
    this.saveRequests();
    this.showNotification("Solicitação de reagendamento enviada!", "success");

    // Refresh the schedules modal if it's open
    const schedulesModal = document.getElementById("schedulesModal");
    if (schedulesModal) {
      schedulesModal.remove();
      this.showSchedulesList();
    }
  }

  // Funções auxiliares para relatórios
  generateActivityTimeline() {
    const recentRequests = this.requests
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    if (recentRequests.length === 0) {
      return "<p>Nenhuma atividade recente</p>";
    }

    return recentRequests
      .map(
        (request) => `
            <div class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <h4>${request.subject}</h4>
                    <p>${request.userName} - ${this.formatDate(
          request.date
        )}</p>
                    <span class="timeline-status status-${
                      request.status
                    }">${this.getStatusText(request.status)}</span>
                </div>
            </div>
        `
      )
      .join("");
  }

  generateTopUsers() {
    const userCounts = {};
    this.requests.forEach((request) => {
      userCounts[request.userName] = (userCounts[request.userName] || 0) + 1;
    });

    const topUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    if (topUsers.length === 0) {
      return "<p>Nenhum usuário encontrado</p>";
    }

    return topUsers
      .map(
        ([userName, count]) => `
            <div class="user-item">
                <span class="user-name">${userName}</span>
                <span class="user-count">${count} solicitações</span>
            </div>
        `
      )
      .join("");
  }

  createStatusChart() {
    const canvas = document.getElementById("statusChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const pending = this.requests.filter((r) => r.status === "pending").length;
    const approved = this.requests.filter(
      (r) => r.status === "approved"
    ).length;
    const rejected = this.requests.filter(
      (r) => r.status === "rejected"
    ).length;

    const data = [pending, approved, rejected];
    const labels = ["Pendentes", "Aprovadas", "Rejeitadas"];
    const colors = ["#ffc107", "#28a745", "#dc3545"];

    // Desenhar gráfico de pizza simples
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    let currentAngle = 0;
    const total = data.reduce((sum, value) => sum + value, 0);

    if (total === 0) {
      ctx.fillStyle = "#6c757d";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Sem dados", centerX, centerY);
      return;
    }

    data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.closePath();
      ctx.fillStyle = colors[index];
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Adicionar legenda
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    let legendY = 20;
    labels.forEach((label, index) => {
      ctx.fillStyle = colors[index];
      ctx.fillRect(10, legendY - 10, 15, 15);
      ctx.fillStyle = "#333";
      ctx.fillText(`${label}: ${data[index]}`, 30, legendY);
      legendY += 20;
    });
  }

  generateFullReport() {
    // Filtrar apenas agendamentos encerrados para o relatório detalhado
    const completedRequests = this.requests.filter(
      (r) =>
        r.attendanceStatus === "concluido" || r.attendanceStatus === "faltou"
    );

    const reportData = {
      generatedAt: new Date().toISOString(),
      totalRequests: this.requests.length,
      pendingRequests: this.requests.filter((r) => r.status === "pending")
        .length,
      approvedRequests: this.requests.filter((r) => r.status === "approved")
        .length,
      rejectedRequests: this.requests.filter((r) => r.status === "rejected")
        .length,
      completedRequests: completedRequests.length,
      requests: this.requests.map((r) => ({
        ...r,
        // Incluir feedback pós-atendimento no relatório
        feedbackPosAtendimento:
          r.postAttendanceFeedback || r.attendanceFeedback || "Não fornecido",
        statusAtendimento:
          r.attendanceStatus === "concluido"
            ? "Atendimento Realizado"
            : r.attendanceStatus === "faltou"
            ? "Aluno Não Compareceu"
            : "Pendente",
      })),
    };

    this.showNotification(
      "Relatório gerado com sucesso! Verifique o console para detalhes.",
      "success"
    );
    console.log("Relatório completo:", reportData);
    console.log(
      "Agendamentos com Feedback:",
      completedRequests.map((r) => ({
        id: r.id,
        assunto: r.subject,
        data: r.date,
        horario: r.time,
        status:
          r.attendanceStatus === "concluido" ? "Realizado" : "Não Compareceu",
        feedback:
          r.postAttendanceFeedback || r.attendanceFeedback || "Não fornecido",
      }))
    );
  }

  exportReport() {
    // Filtrar apenas agendamentos encerrados para o relatório detalhado
    const completedRequests = this.requests.filter(
      (r) =>
        r.attendanceStatus === "concluido" || r.attendanceStatus === "faltou"
    );

    const reportData = {
      generatedAt: new Date().toISOString(),
      totalRequests: this.requests.length,
      pendingRequests: this.requests.filter((r) => r.status === "pending")
        .length,
      approvedRequests: this.requests.filter((r) => r.status === "approved")
        .length,
      rejectedRequests: this.requests.filter((r) => r.status === "rejected")
        .length,
      completedRequests: completedRequests.length,
      requests: this.requests.map((r) => ({
        id: r.id,
        solicitante: r.userName || r.responsavelNome || "N/A",
        email: r.userEmail || r.responsavelEmail || "N/A",
        assunto: r.subject,
        data: r.date,
        horario: r.time,
        status: this.getStatusText(r.status),
        statusAtendimento:
          r.attendanceStatus === "concluido"
            ? "Atendimento Realizado"
            : r.attendanceStatus === "faltou"
            ? "Aluno Não Compareceu"
            : "Pendente",
        feedbackPosAtendimento:
          r.postAttendanceFeedback || r.attendanceFeedback || "Não fornecido",
        criadoEm: r.createdAt
          ? new Date(r.createdAt).toLocaleString("pt-BR")
          : "N/A",
      })),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-agendamentos-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);
    this.showNotification("Relatório exportado com sucesso!", "success");
  }

  printReport() {
    const printWindow = window.open("", "_blank");
    const reportContent = `
            <html>
                <head>
                    <title>Relatório de Agendamentos</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1, h2 { color: #333; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                        .stat { text-align: center; }
                        .stat-number { font-size: 24px; font-weight: bold; color: #FF161F; }
                    </style>
                </head>
                <body>
                    <h1>Relatório de Agendamentos - Agenda TEC</h1>
                    <p>Gerado em: ${new Date().toLocaleDateString("pt-BR")}</p>
                    
                    <div class="stats">
                        <div class="stat">
                            <div class="stat-number">${
                              this.requests.length
                            }</div>
                            <div>Total de Solicitações</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${
                              this.requests.filter(
                                (r) => r.status === "pending"
                              ).length
                            }</div>
                            <div>Pendentes</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${
                              this.requests.filter(
                                (r) => r.status === "approved"
                              ).length
                            }</div>
                            <div>Aprovadas</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${
                              this.requests.filter(
                                (r) => r.status === "rejected"
                              ).length
                            }</div>
                            <div>Rejeitadas</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${
                              this.requests.filter((r) => this.needsFeedback(r))
                                .length
                            }</div>
                            <div>Aguardando Feedback</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${
                              this.requests.filter(
                                (r) =>
                                  r.attendanceStatus === "concluido" ||
                                  r.attendanceStatus === "faltou"
                              ).length
                            }</div>
                            <div>Encerrados</div>
                        </div>
                    </div>
                    
                    <h2>Detalhes das Solicitações</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Horário</th>
                                <th>Solicitante</th>
                                <th>Assunto</th>
                                <th>Status</th>
                                <th>Status Atendimento</th>
                                <th>Feedback Pós-Atendimento</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.requests
                              .map((request) => {
                                const statusAtendimento =
                                  request.attendanceStatus === "concluido"
                                    ? "Atendimento Realizado"
                                    : request.attendanceStatus === "faltou"
                                    ? "Aluno Não Compareceu"
                                    : "Pendente";
                                const feedback =
                                  request.postAttendanceFeedback ||
                                  request.attendanceFeedback ||
                                  "Não fornecido";

                                return `
                                <tr>
                                    <td>${this.formatDate(request.date)}</td>
                                    <td>${request.time}</td>
                                    <td>${
                                      request.userName ||
                                      request.responsavelNome ||
                                      "N/A"
                                    }</td>
                                    <td>${request.subject}</td>
                                    <td>${this.getStatusText(
                                      request.status
                                    )}</td>
                                    <td>${statusAtendimento}</td>
                                    <td style="max-width: 300px; word-wrap: break-word;">${feedback}</td>
                                </tr>
                            `;
                              })
                              .join("")}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.print();

    this.showNotification("Relatório enviado para impressão!", "success");
  }

  // ========== FUNÇÕES DE PERFIL DO ORIENTADOR ==========

  async showProfileModal() {
    if (this.userType !== "coordenador") {
      this.showNotification(
        "Acesso negado. Apenas orientadores podem acessar o perfil.",
        "error"
      );
      return;
    }

    await this.loadProfileData();
    this.showModal("profileModal");
  }

  async loadProfileData() {
    try {
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        this.showNotification("Usuário não autenticado.", "error");
        return;
      }

      const orientadorDoc = await window.db
        .collection("orientador_pedagogico")
        .doc(currentUser.uid)
        .get();

      if (!orientadorDoc.exists) {
        this.showNotification("Dados do orientador não encontrados.", "error");
        return;
      }

      const data = orientadorDoc.data();

      // Preencher formulário
      document.getElementById("profileNome").value = data.nome_orientador || "";
      document.getElementById("profileEmail").value =
        data.email_orientador || currentUser.email || "";
      document.getElementById("profileTelefone").value =
        data.telefone_orientador || "";
      document.getElementById("profileEscola").value =
        data.escola_orientador || "";
      document.getElementById("profileCpf").value = this.formatCPF(
        data.cpf_orientador || ""
      );

      // Limpar status de verificação e resetar botões
      const emailStatus = document.getElementById("emailVerifyStatus");
      const phoneStatus = document.getElementById("phoneVerifyStatus");
      const emailBtn = document.getElementById("verifyEmailBtn");
      const phoneBtn = document.getElementById("verifyPhoneBtn");

      if (emailStatus) {
        emailStatus.textContent = "";
        emailStatus.className = "verify-status";
      }
      if (phoneStatus) {
        phoneStatus.textContent = "";
        phoneStatus.className = "verify-status";
      }
      if (emailBtn) {
        emailBtn.disabled = false;
        emailBtn.innerHTML =
          '<i class="fas fa-check-circle"></i> <span>Verificar</span>';
        emailBtn.classList.remove("verified");
      }
      if (phoneBtn) {
        phoneBtn.disabled = false;
        phoneBtn.innerHTML =
          '<i class="fas fa-check-circle"></i> <span>Verificar</span>';
        phoneBtn.classList.remove("verified");
      }

      // Carregar foto de perfil
      if (data.foto_perfil) {
        const photoPreview = document.getElementById("profilePhotoPreview");
        const photoPlaceholder = document.getElementById(
          "profilePhotoPlaceholder"
        );
        if (photoPreview && photoPlaceholder) {
          photoPreview.src = data.foto_perfil;
          photoPreview.style.display = "block";
          photoPlaceholder.style.display = "none";
        }
        // Atualizar foto no header também
        const headerAvatar = document.getElementById("headerUserAvatar");
        if (headerAvatar) {
          headerAvatar.innerHTML = `<img src="${data.foto_perfil}" alt="Foto" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        }
      } else {
        const photoPreview = document.getElementById("profilePhotoPreview");
        const photoPlaceholder = document.getElementById(
          "profilePhotoPlaceholder"
        );
        if (photoPreview && photoPlaceholder) {
          photoPreview.style.display = "none";
          photoPlaceholder.style.display = "flex";
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do perfil:", error);
      this.showNotification("Erro ao carregar dados do perfil.", "error");
    }
  }

  async handleProfileUpdate(e) {
    e.preventDefault();

    if (this.userType !== "coordenador") {
      this.showNotification("Acesso negado.", "error");
      return;
    }

    try {
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        this.showNotification("Usuário não autenticado.", "error");
        return;
      }

      const email = document.getElementById("profileEmail").value.trim();
      const telefone = document.getElementById("profileTelefone").value.trim();
      const escola = document.getElementById("profileEscola").value;

      if (!email || !telefone || !escola) {
        this.showNotification(
          "Preencha todos os campos obrigatórios.",
          "error"
        );
        return;
      }

      // Validar telefone
      const telefoneLimpo = this.onlyDigits(telefone);
      if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        this.showNotification("Telefone inválido.", "error");
        return;
      }

      // Atualizar no Firestore
      await window.db
        .collection("orientador_pedagogico")
        .doc(currentUser.uid)
        .update({
          email_orientador: email,
          telefone_orientador: telefone,
          escola_orientador: escola,
          atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        });

      // Atualizar email no Auth se mudou
      if (email !== currentUser.email) {
        await currentUser.updateEmail(email);
      }

      // Atualizar dados locais
      if (this.currentUser) {
        this.currentUser.email = email;
        this.saveUserData();
      }

      this.showNotification("Perfil atualizado com sucesso!", "success");
      this.hideModal("profileModal");
      this.updateUserProfile();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      let errorMessage = "Erro ao atualizar perfil.";
      if (error.code === "auth/requires-recent-login") {
        errorMessage =
          "Por segurança, faça login novamente para alterar o e-mail.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      this.showNotification(errorMessage, "error");
    }
  }

  async handleProfilePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      this.showNotification("Por favor, selecione uma imagem.", "error");
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showNotification("A imagem deve ter no máximo 5MB.", "error");
      return;
    }

    try {
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        this.showNotification("Usuário não autenticado.", "error");
        return;
      }

      this.showNotification("Enviando foto...", "info");

      // Inicializar Firebase Storage se ainda não foi
      if (!firebase.storage) {
        const storageScript = document.createElement("script");
        storageScript.src =
          "https://www.gstatic.com/firebasejs/8.10.1/firebase-storage.js";
        document.head.appendChild(storageScript);
        await new Promise((resolve) => {
          storageScript.onload = resolve;
        });
      }

      const storage = firebase.storage();
      const storageRef = storage.ref();
      const photoRef = storageRef.child(
        `orientadores/${currentUser.uid}/foto_perfil.jpg`
      );

      // Upload da foto
      const uploadTask = photoRef.put(file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progresso do upload (opcional)
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload progress:", progress + "%");
        },
        (error) => {
          console.error("Erro no upload:", error);
          this.showNotification("Erro ao fazer upload da foto.", "error");
        },
        async () => {
          try {
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();

            // Salvar URL no Firestore
            await window.db
              .collection("orientador_pedagogico")
              .doc(currentUser.uid)
              .update({
                foto_perfil: downloadURL,
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
              });

            if (this.currentUser) this.currentUser.foto_perfil = downloadURL;

            // Atualizar preview
            const photoPreview = document.getElementById("profilePhotoPreview");
            const photoPlaceholder = document.getElementById(
              "profilePhotoPlaceholder"
            );
            if (photoPreview && photoPlaceholder) {
              photoPreview.src = downloadURL;
              photoPreview.style.display = "block";
              photoPlaceholder.style.display = "none";
            }

            // Atualizar foto no header
            const headerAvatar = document.getElementById("headerUserAvatar");
            if (headerAvatar) {
              headerAvatar.innerHTML = `<img src="${downloadURL}" alt="Foto" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            }

            this.showNotification(
              "Foto de perfil atualizada com sucesso!",
              "success"
            );
          } catch (error) {
            console.error("Erro ao salvar URL da foto:", error);
            this.showNotification("Erro ao salvar foto de perfil.", "error");
          }
        }
      );
    } catch (error) {
      console.error("Erro no upload da foto:", error);
      this.showNotification("Erro ao fazer upload da foto.", "error");
    }
  }

  // ========== FUNÇÕES DE MÁSCARA E VALIDAÇÃO ==========

  initMasks() {
    // Máscara de telefone
    const telefoneInputs = document.querySelectorAll(
      'input[type="tel"], input[id*="telefone"], input[name*="telefone"]'
    );
    telefoneInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        e.target.value = this.maskPhone(e.target.value);
      });
      input.addEventListener("blur", (e) => {
        e.target.value = this.maskPhone(e.target.value);
      });
    });

    // Máscara de CPF
    const cpfInputs = document.querySelectorAll(
      'input[id*="cpf"], input[name*="cpf"]'
    );
    cpfInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        e.target.value = this.maskCPF(e.target.value);
      });
      input.addEventListener("blur", (e) => {
        const cpf = this.onlyDigits(e.target.value);
        if (cpf.length === 11 && !this.validateCPF(cpf)) {
          const errorElement =
            e.target.nextElementSibling ||
            document.getElementById(e.target.id + "-error");
          if (errorElement && errorElement.tagName === "SMALL") {
            errorElement.textContent = "CPF inválido.";
            errorElement.style.color = "red";
          }
        } else {
          const errorElement =
            e.target.nextElementSibling ||
            document.getElementById(e.target.id + "-error");
          if (errorElement && errorElement.tagName === "SMALL") {
            errorElement.textContent = "";
          }
        }
      });
    });
  }

  maskPhone(value) {
    const digits = this.onlyDigits(value);
    if (digits.length === 0) return "";

    if (digits.length <= 10) {
      // Telefone fixo: (XX) XXXX-XXXX
      if (digits.length <= 2) {
        return `(${digits}`;
      } else if (digits.length <= 6) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      } else {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(
          6,
          10
        )}`;
      }
    } else {
      // Celular: (XX) XXXXX-XXXX
      if (digits.length <= 2) {
        return `(${digits}`;
      } else if (digits.length <= 7) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      } else {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(
          7,
          11
        )}`;
      }
    }
  }

  maskCPF(value) {
    const digits = this.onlyDigits(value);
    return digits.replace(
      /(\d{3})(\d{3})(\d{3})(\d{0,2})/,
      (match, p1, p2, p3, p4) => {
        if (p4) return `${p1}.${p2}.${p3}-${p4}`;
        if (p3) return `${p1}.${p2}.${p3}`;
        if (p2) return `${p1}.${p2}`;
        if (p1) return p1;
        return digits;
      }
    );
  }

  formatCPF(cpf) {
    const digits = this.onlyDigits(cpf);
    if (digits.length === 11) {
      return this.maskCPF(digits);
    }
    return cpf;
  }

  validateCPF(cpf) {
    const digits = this.onlyDigits(cpf);

    if (digits.length !== 11) return false;

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(digits)) return false;

    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(digits.charAt(i)) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 >= 10) digit1 = 0;
    if (digit1 !== parseInt(digits.charAt(9))) return false;

    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits.charAt(i)) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 >= 10) digit2 = 0;
    if (digit2 !== parseInt(digits.charAt(10))) return false;

    return true;
  }

  // ========== FUNÇÕES DE VERIFICAÇÃO FICTÍCIAS ==========

  async verifyEmail() {
    const emailInput = document.getElementById("profileEmail");
    const statusElement = document.getElementById("emailVerifyStatus");
    const verifyBtn = document.getElementById("verifyEmailBtn");

    if (!emailInput || !statusElement || !verifyBtn) return;

    const email = emailInput.value.trim();

    if (!email) {
      statusElement.textContent = "Por favor, preencha o e-mail.";
      statusElement.className = "verify-status error";
      return;
    }

    // Validar formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      statusElement.textContent = "Formato de e-mail inválido.";
      statusElement.className = "verify-status error";
      return;
    }

    // Desabilitar botão durante verificação
    verifyBtn.disabled = true;
    verifyBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> <span>Verificando...</span>';
    statusElement.textContent = "Verificando e-mail...";
    statusElement.className = "verify-status verifying";

    // Simular verificação (fictícia) - aguardar 2 segundos
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const isVerified = Math.random() > 0.2; // 80% de chance de sucesso

    if (isVerified) {
      statusElement.textContent = "✓ E-mail verificado com sucesso!";
      statusElement.className = "verify-status success";
      verifyBtn.innerHTML =
        '<i class="fas fa-check-circle"></i> <span>Verificado</span>';
      verifyBtn.classList.add("verified");
    } else {
      statusElement.textContent =
        "✗ Não foi possível verificar o e-mail. Tente novamente.";
      statusElement.className = "verify-status error";
      verifyBtn.innerHTML =
        '<i class="fas fa-check-circle"></i> <span>Verificar</span>';
      verifyBtn.disabled = false;
    }
  }

  async verifyPhone() {
    const phoneInput = document.getElementById("profileTelefone");
    const statusElement = document.getElementById("phoneVerifyStatus");
    const verifyBtn = document.getElementById("verifyPhoneBtn");

    if (!phoneInput || !statusElement || !verifyBtn) return;

    const phone = phoneInput.value.trim();
    const phoneDigits = this.onlyDigits(phone);

    if (!phone) {
      statusElement.textContent = "Por favor, preencha o telefone.";
      statusElement.className = "verify-status error";
      return;
    }

    // Validar tamanho do telefone
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      statusElement.textContent =
        "Telefone inválido. Digite um telefone válido.";
      statusElement.className = "verify-status error";
      return;
    }

    // Desabilitar botão durante verificação
    verifyBtn.disabled = true;
    verifyBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> <span>Verificando...</span>';
    statusElement.textContent = "Enviando código de verificação...";
    statusElement.className = "verify-status verifying";

    // Simular envio de código SMS (fictício) - aguardar 2 segundos
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simular resultado (sempre bem-sucedido para demonstração)
    const isVerified = Math.random() > 0.2; // 80% de chance de sucesso

    if (isVerified) {
      statusElement.textContent =
        "✓ Código enviado! Telefone verificado com sucesso!";
      statusElement.className = "verify-status success";
      verifyBtn.innerHTML =
        '<i class="fas fa-check-circle"></i> <span>Verificado</span>';
      verifyBtn.classList.add("verified");
    } else {
      statusElement.textContent =
        "✗ Não foi possível enviar o código. Tente novamente.";
      statusElement.className = "verify-status error";
      verifyBtn.innerHTML =
        '<i class="fas fa-check-circle"></i> <span>Verificar</span>';
      verifyBtn.disabled = false;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.agendaSystem = new AgendaSystem();
});
