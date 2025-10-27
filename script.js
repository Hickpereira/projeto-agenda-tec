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
    // Padroniza termos visíveis na interface
    this.replaceCoordinatorTerms();
  }

  addSearchFunctionality() {
    console.log("Futura implementação: Lógica de busca no painel.");
    // TODO: Adicionar aqui a lógica para filtrar agendamentos ou solicitações.
    // Por enquanto, a função existe e não vai mais causar erro.
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

  // Event Listeners
  setupEventListeners() {
    // Navegação
    document
      .getElementById("nav-toggle")
      ?.addEventListener("click", this.toggleMobileMenu.bind(this));

    // Modais
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

    // Tabs: Login
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
    // Tabs: Register
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

    // Alternância entre modais
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

    // Dashboard
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

    // Adicionar botão de visualização de agenda para coordenadores será feito no showDashboard

    // Acessibilidade - painel único
    this.initAccessibilityPanel();

    // Botão de acessibilidade alternativo no header
    document.getElementById("a11yHeaderBtn")?.addEventListener("click", () => {
      const panel = document.getElementById("a11yPanel");
      if (panel) {
        panel.classList.toggle("hidden");
      }
    });

    // Navegação por teclado para acessibilidade
    document.addEventListener(
      "keydown",
      this.handleKeyboardNavigation.bind(this)
    );

    // Fechar modais ao clicar fora (apenas para modais específicos, não formulários)
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

    // Header logout button
    document.addEventListener("click", (e) => {
      if (e.target && e.target.id === "logoutBtn") {
        this.handleLogout();
      }
    });

    // Navegação suave
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

    // Removido recarregamento ao trocar abas; uso de switchAuthTab já cuida da alternância
  }

  // Acessibilidade: painel e preferências
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

  getOrientadorById(orientadorId) {
    const orientadores = [
      {
        id: "orientador1",
        name: "Dr. Carlos Silva",
        specialty: "Orientação Educacional",
        email: "carlos.silva@escola.com",
        phone: "(11) 99999-1111",
      },
      {
        id: "orientador2",
        name: "Dra. Maria Santos",
        specialty: "Psicologia Escolar",
        email: "maria.santos@escola.com",
        phone: "(11) 99999-2222",
      },
      {
        id: "orientador3",
        name: "Prof. João Oliveira",
        specialty: "Coordenação Pedagógica",
        email: "joao.oliveira@escola.com",
        phone: "(11) 99999-3333",
      },
    ];

    return (
      orientadores.find((o) => o.id === orientadorId) || {
        id: orientadorId,
        name: "Orientador",
        specialty: "Orientação Educacional",
      }
    );
  }

  async carregarOrientadoresPorEscola(escolaId) {
    console.log(
      `Buscando no Firestore onde 'escola_orientador' == '${escolaId}'`
    );
    const orientadorSelect = document.getElementById("orientadorSelect");
    const orientadorInfoCard = document.getElementById("orientadorInfo");

    // Limpa as opções anteriores e desabilita o seletor enquanto carrega
    orientadorSelect.innerHTML = '<option value="">Carregando...</option>';
    orientadorSelect.disabled = true;
    orientadorInfoCard.classList.add("hidden"); // Esconde o card de informações

    if (!escolaId) {
      orientadorSelect.innerHTML =
        '<option value="">Selecione uma escola primeiro</option>';
      orientadorSelect.disabled = false;
      return;
    }

    try {
      // Assumindo que a instância do Firestore está em window.db
      const orientadoresRef = window.db.collection("orientador_pedagogico");

      // Busca no Firestore por orientadores onde o campo 'escola_orientador' é igual ao ID da escola
      const snapshot = await orientadoresRef
        .where("escola_orientador", "==", escolaId)
        .get();

      // Limpa novamente para adicionar os novos resultados
      orientadorSelect.innerHTML =
        '<option value="">Selecione um orientador...</option>';

      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          const orientadorData = doc.data();
          const orientadorId = doc.id;
          const option = document.createElement("option");
          option.value = orientadorId;
          option.textContent = orientadorData.nome_orientador;

          // Armazena todos os dados do orientador no próprio elemento <option>
          // para fácil acesso posterior, evitando novas consultas.
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
      // Reabilita o seletor após a operação
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
    // Recarrega uma vez ao entrar em cada dashboard para garantir atualização
    if (this.refreshOnceOnDashboardEntry(this.userType)) {
      return;
    }

    // Esconder todo o conteúdo principal
    document.querySelector("main").style.display = "none";
    document.getElementById("dashboard").classList.remove("hidden");

    // Animar entrada do dashboard
    const dashboard = document.getElementById("dashboard");
    dashboard.style.opacity = "0";
    dashboard.style.transform = "translateY(20px)";

    setTimeout(() => {
      dashboard.style.transition = "all 0.6s ease-out";
      dashboard.style.opacity = "1";
      dashboard.style.transform = "translateY(0)";
    }, 100);

    // Mostrar dashboard específico do tipo de usuário
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

  // Evita recarregamento automático ao entrar no dashboard
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
    document.getElementById("dashboard").classList.add("hidden");
    document.querySelector("main").style.display = "block";

    this.updateHeaderForGuest();
    this.showNotification("Logout realizado com sucesso!", "success");
  }

  // Funções para atualizar o header
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

    // Adiciona os listeners DEPOIS que o modal existe no DOM
    document
      .getElementById("escola_orientador_modal")
      .addEventListener("change", (e) => {
        this.carregarOrientadoresPorEscola(e.target.value);
      });

    const orientadorSelectElement = document.getElementById("orientadorSelect");
    if (orientadorSelectElement) {
      console.log(
        "DEBUG: Elemento 'orientadorSelect' encontrado. Adicionando event listener."
      );
      orientadorSelectElement.addEventListener("change", (e) => {
        console.log("DEBUG: Evento 'change' DISPARADO em orientadorSelect."); // <-- PONTO 1
        const selectedOption = e.target.options[e.target.selectedIndex];
        console.log("DEBUG: Option selecionada:", selectedOption); // <-- PONTO 2
        console.log(
          "DEBUG: dataset.info da option:",
          selectedOption.dataset.info
        ); // <-- PONTO 3
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
    console.log("DEBUG: Função 'showOrientadorInfo' foi chamada."); // <-- PONTO 4
    const orientadorInfo = document.getElementById("orientadorInfo");
    const orientadorId = selectedOption ? selectedOption.value : null;

    if (!orientadorId || !selectedOption.dataset.info) {
      orientadorInfo.classList.add("hidden");
      this.selectedOrientador = null;
      console.log(
        "DEBUG: Condição de falha atingida. this.selectedOrientador definido como NULL."
      ); // <-- PONTO 5
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
    ); // <-- PONTO 6

    document.querySelector(".orientador-avatar").textContent = "👨‍🏫";
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

    // Desabilita o botão para prevenir múltiplos envios
    if (submitButton) submitButton.disabled = true;

    try {
      const formData = new FormData(form);
      const scheduleData = Object.fromEntries(formData);

      if (!this.selectedOrientador) {
        this.showNotification("Por favor, selecione um orientador.", "error");
        throw new Error("Orientador não selecionado."); // Interrompe a execução
      }

      // Monta o objeto com todos os dados necessários
      const requestPayload = {
        orientador: this.selectedOrientador,
        date: scheduleData.date,
        time: scheduleData.time,
        subject: scheduleData.subject,
        studentName: scheduleData.studentName,
        studentGrade: scheduleData.studentGrade,
        studentClass: scheduleData.studentClass,
        message: scheduleData.message || "",
        escola_orientador: scheduleData.escola_orientador,
      };

      // Chama e ESPERA (await) a conclusão da função no app.js
      await window.scheduleService.createRequest(requestPayload);

      // ---- SE CHEGOU ATÉ AQUI, TUDO DEU CERTO! ----
      console.log(
        "SUCESSO! A solicitação foi enviada. Fechando o modal agora."
      );

      // A notificação de sucesso já é mostrada pelo app.js.
      // Agora, fechamos e removemos o modal da tela.
      this.hideModal("scheduleModal");
      const scheduleModal = document.getElementById("scheduleModal");
      if (scheduleModal) {
        scheduleModal.remove(); // Garante que o modal seja removido do DOM
      }
    } catch (error) {
      // Se qualquer erro ocorrer (seja no `await` ou antes), ele será capturado aqui.
      console.error("Falha no handleScheduleRequest:", error.message);
      // A notificação de erro já é (geralmente) mostrada pelo app.js.
      // Se não for, você pode adicionar uma aqui.
      // this.showNotification("Falha ao enviar. Tente novamente.", "error");
    } finally {
      // ESTE BLOCO SEMPRE EXECUTA, independentemente de sucesso ou erro.
      // Garante que o botão seja reativado para o usuário poder tentar de novo.
      if (submitButton) submitButton.disabled = false;
    }
  }

  generateAvailableTimeSlots() {
    const customTimeSlots = this.getTimeSlots();
    const selectedDate = document.getElementById("scheduleDate")?.value;

    // Sempre tentar usar horários personalizados primeiro
    if (customTimeSlots.length > 0 && selectedDate) {
      const jsDay = new Date(selectedDate).getDay();
      const systemDay = this.convertToSystemDay(jsDay);
      const daySlots = customTimeSlots.filter(
        (slot) => slot.dayOfWeek === systemDay
      );

      if (daySlots.length > 0) {
        const availableSlots = [];
        daySlots.forEach((slot) => {
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
        }
      }
    }

    // Fallback para horários padrão se não houver horários personalizados
    const defaultTimeSlots = [
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
    ];

    return defaultTimeSlots
      .map((time) => `<option value="${time}">${time}</option>`)
      .join("");
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
      timeSelect.innerHTML = `
                <option value="">Selecione um horário...</option>
                ${this.generateAvailableTimeSlots()}
            `;
    }
  }

  async showSchedulesList() {
    // Recarregar solicitações do Firebase antes de exibir
    await this.loadRequestsFromFirebase();

    // Para responsáveis: mostrar seus próprios agendamentos
    // Para coordenadores: mostrar todos os agendamentos aprovados
    let schedulesToShow;
    let modalTitle;

    if (this.userType === "coordenador") {
      schedulesToShow = this.requests.filter(
        (req) => req.status === "approved"
      );
      modalTitle = "Agendamentos Confirmados";
    } else {
      schedulesToShow = this.requests.filter(
        (req) => req.userId === this.currentUser.id
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

  async showRequestsList() {
    // Recarregar solicitações do Firebase antes de exibir
    await this.loadRequestsFromFirebase();

    const pendingRequests = this.requests.filter(
      (req) => req.status === "pending"
    );
    const acceptedRequests = this.requests.filter(
      (req) => req.status === "approved"
    );
    const rejectedRequests = this.requests.filter(
      (req) => req.status === "rejected"
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
                                          this.createRequestItem(request, true)
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

    // Event listeners
    document.getElementById("closeRequests").addEventListener("click", () => {
      this.hideModal("requestsModal");
      document.getElementById("requestsModal").remove();
    });

    // Tab switching (scoped to this modal)
    document.querySelectorAll("#requestsModal .tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const buttonEl = e.currentTarget || e.target.closest("button");
        const tabName = buttonEl?.dataset.tab;
        if (tabName) this.switchRequestTab(tabName, "requestsModal");
      });
    });

    this.showModal("requestsModal");
  }

  createRequestItem(request, isReadOnly = false) {
    const statusClass =
      request.status === "approved"
        ? "success"
        : request.status === "rejected"
        ? "danger"
        : "warning";

    return `
            <div class="request-item ${statusClass}">
                <div class="request-info">
                    <div class="request-header">
                        <h4>${request.subject}</h4>
                        <span class="request-status status-${request.status}">
                            ${this.getStatusText(request.status)}
                        </span>
                    </div>
                    <div class="request-details">
                        <p><strong>Solicitante:</strong> ${request.userName}</p>
                        <p><strong>Email:</strong> ${request.userEmail}</p>
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
                    </div>
                </div>
                ${
                  !isReadOnly
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
                    : ""
                }
            </div>
        `;
  }

  switchRequestTab(tabName, modalId = "requestsModal") {
    // Remove active class from all tabs and panes inside the modal
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

  getStatusText(status) {
    const statusMap = {
      pending: "Pendente",
      approved: "Aprovada",
      rejected: "Rejeitada",
    };
    return statusMap[status] || status;
  }

  approveRequest(requestId) {
    const request = this.requests.find((req) => req.id === requestId);
    if (request) {
      request.status = "approved";
      request.responseDate = new Date().toISOString().split("T")[0];
      this.saveRequests();
      this.updateCoordinatorDashboard();
      this.showNotification("Solicitação aprovada!", "success");
      this.refreshRequestsModal();
    }
  }

  rejectRequest(requestId) {
    const request = this.requests.find((req) => req.id === requestId);
    if (request) {
      request.status = "rejected";
      request.responseDate = new Date().toISOString().split("T")[0];
      this.saveRequests();
      this.updateCoordinatorDashboard();
      this.showNotification("Solicitação rejeitada!", "info");
      this.refreshRequestsModal();
    }
  }

  async refreshRequestsModal() {
    // Recarregar solicitações do Firebase
    await this.loadRequestsFromFirebase();

    // Remove modal atual
    const currentModal = document.getElementById("requestsModal");
    if (currentModal) {
      currentModal.remove();
    }

    // Recriar modal com dados atualizados
    await this.showRequestsList();
  }

  formatDate(dateString) {
    const date = new Date(dateString);
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

  showReports() {
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

    // Generate chart
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
                            <div class="monthly-schedule" id="monthlySchedule">
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
        if (tabName) this.switchScheduleTab(tabName, "scheduleViewModal");
      });
    });

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
    const distanceToMonday = (jsWeekDay + 6) % 7; // 0 se segunda, 1 se terça, ... 6 se domingo
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

  generateMonthlySchedule(schedules) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Agrupar agendamentos por dia do mês
    const monthSchedules = {};
    schedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.date);
      if (
        scheduleDate.getMonth() === currentMonth &&
        scheduleDate.getFullYear() === currentYear
      ) {
        const day = scheduleDate.getDate();
        if (!monthSchedules[day]) {
          monthSchedules[day] = [];
        }
        monthSchedules[day].push(schedule);
      }
    });

    // Ordenar agendamentos por horário
    Object.values(monthSchedules).forEach((daySchedules) => {
      daySchedules.sort((a, b) => a.time.localeCompare(b.time));
    });

    const monthName = today.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const html = `
            <div class="monthly-header">
                <h3>${monthName}</h3>
            </div>
            <div class="monthly-grid">
                ${Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const daySchedules = monthSchedules[day] || [];
                  const isToday = day === today.getDate();

                  return `
                        <div class="month-day ${
                          isToday ? "today" : ""
                        }" data-day="${day}" data-month="${currentMonth}" data-year="${currentYear}" style="cursor: pointer;">
                            <div class="day-number">${day}</div>
                            <div class="day-schedules">
                                ${
                                  daySchedules.length === 0
                                    ? ""
                                    : `
                                    <div class="schedule-count">${
                                      daySchedules.length
                                    } agendamento(s)</div>
                                    ${daySchedules
                                      .slice(0, 2)
                                      .map(
                                        (schedule) => `
                                        <div class="mini-schedule">
                                            <span class="mini-time">${schedule.time}</span>
                                            <span class="mini-subject">${schedule.subject}</span>
                                        </div>
                                    `
                                      )
                                      .join("")}
                                    ${
                                      daySchedules.length > 2
                                        ? `<div class="more-schedules">+${
                                            daySchedules.length - 2
                                          } mais</div>`
                                        : ""
                                    }
                                `
                                }
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;

    // Adicionar event listeners após renderizar o calendário
    setTimeout(() => {
      this.addCalendarClickListeners(monthSchedules, currentMonth, currentYear);
    }, 100);

    return html;
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
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

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

    document.getElementById("notificationContainer").appendChild(notification);

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
      // Forçar sincronização com Firebase após carregar dados do usuário
      this.loadRequestsFromFirebase();
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
    // Também carregar do Firebase se disponível
    this.loadRequestsFromFirebase();
  }

  async loadRequestsFromFirebase() {
    try {
      if (window.db && this.currentUser) {
        // Carregar solicitações como responsável
        const responsavelQuery = await db
          .collection("solicitacoes")
          .where("responsavelId", "==", this.currentUser.id)
          .orderBy("criadoEm", "desc")
          .get();

        // Carregar solicitações como orientador pelo UID
        const orientadorQuery = await db
          .collection("solicitacoes")
          .where("orientadorId", "==", this.currentUser.id)
          .orderBy("criadoEm", "desc")
          .get();

        // Quando o usuário logado é um orientador, também carregar as solicitações
        // destinadas ao orientador genérico "coordenador"
        let genericOrientadorQuery = { forEach: () => {} };
        if (this.userType === "coordenador") {
          genericOrientadorQuery = await db
            .collection("solicitacoes")
            .where("orientadorId", "==", "coordenador")
            .orderBy("criadoEm", "desc")
            .get();
        }

        const firebaseRequests = [];

        responsavelQuery.forEach((doc) => {
          const data = doc.data();
          firebaseRequests.push({
            id: doc.id,
            userId: data.responsavelId,
            orientadorId: data.orientadorId,
            date: data.data,
            time: data.horario,
            subject: data.assunto,
            message: data.mensagem,
            status: data.status,
            createdAt: data.criadoEm?.toDate?.() || new Date(),
            orientador: this.getOrientadorById(data.orientadorId),
          });
        });

        // Solicitações endereçadas diretamente ao orientador logado
        orientadorQuery.forEach((doc) => {
          const data = doc.data();
          firebaseRequests.push({
            id: doc.id,
            userId: data.responsavelId,
            orientadorId: data.orientadorId,
            date: data.data,
            time: data.horario,
            subject: data.assunto,
            message: data.mensagem,
            status: data.status,
            createdAt: data.criadoEm?.toDate?.() || new Date(),
            orientador: this.getOrientadorById(data.orientadorId),
            responsavelNome: data.responsavelNome,
            responsavelEmail: data.responsavelEmail,
          });
        });

        // Solicitações destinadas ao orientador genérico
        genericOrientadorQuery.forEach((doc) => {
          const data = doc.data();
          firebaseRequests.push({
            id: doc.id,
            userId: data.responsavelId,
            orientadorId: data.orientadorId,
            date: data.data,
            time: data.horario,
            subject: data.assunto,
            message: data.mensagem,
            status: data.status,
            createdAt: data.criadoEm?.toDate?.() || new Date(),
            orientador: this.getOrientadorById(data.orientadorId),
            responsavelNome: data.responsavelNome,
            responsavelEmail: data.responsavelEmail,
          });
        });

        // Mesclar com requests existentes, evitando duplicatas
        const existingIds = new Set(this.requests.map((r) => r.id));
        const newRequests = firebaseRequests.filter(
          (r) => !existingIds.has(r.id)
        );
        this.requests = [...this.requests, ...newRequests];

        this.saveRequests();
      }
    } catch (error) {
      console.error("Erro ao carregar solicitações do Firebase:", error);
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
    this.loadRequests();
  }

  // Funções auxiliares para gerenciamento de agenda
  generateTimeSlotsHTML() {
    const timeSlots = this.getTimeSlots();
    if (timeSlots.length === 0) {
      return '<div class="empty-state"><i class="fas fa-clock"></i><p>Nenhum horário configurado</p></div>';
    }

    return timeSlots
      .map(
        (slot) => `
            <div class="time-slot-item">
                <div class="slot-info">
                    <span class="slot-day">${this.getDayName(
                      slot.dayOfWeek
                    )}</span>
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
          workingDays: [1, 2, 3, 4, 5], // Segunda a sexta
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
    const formHTML = `
            <div class="time-slot-form">
                <h4>Adicionar Horário</h4>
                <form id="addTimeSlotForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Dias da Semana:</label>
                            <div class="days-selection">
                                ${[
                                  "Domingo",
                                  "Segunda",
                                  "Terça",
                                  "Quarta",
                                  "Quinta",
                                  "Sexta",
                                  "Sábado",
                                ]
                                  .map(
                                    (day, index) => `
                                    <label class="day-checkbox">
                                        <input type="checkbox" name="selectedDays" value="${index}">
                                        <span class="day-label">${day}</span>
                                    </label>
                                `
                                  )
                                  .join("")}
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

    document
      .getElementById("addTimeSlotForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveTimeSlot();
      });
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
    const selectedDays = formData.getAll("selectedDays");

    // Validações
    if (selectedDays.length === 0) {
      this.showNotification("Selecione pelo menos um dia da semana.", "error");
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

    // Criar um slot para cada dia selecionado
    selectedDays.forEach((dayValue) => {
      const dayOfWeek = parseInt(dayValue);

      // Verificar se já existe um horário para o mesmo dia e período
      const conflictingSlot = timeSlots.find(
        (slot) =>
          slot.dayOfWeek === dayOfWeek &&
          ((startTime >= slot.startTime && startTime < slot.endTime) ||
            (endTime > slot.startTime && endTime <= slot.endTime) ||
            (startTime <= slot.startTime && endTime >= slot.endTime))
      );

      if (conflictingSlot) {
        this.showNotification(
          `Já existe um horário configurado para ${this.getDayName(
            dayOfWeek
          )} neste período.`,
          "error"
        );
        return;
      }

      const timeSlot = {
        id: Date.now().toString() + "-" + dayOfWeek,
        dayOfWeek: dayOfWeek,
        startTime: startTime,
        endTime: endTime,
        duration: parseInt(formData.get("duration")),
        createdAt: new Date().toISOString(),
      };

      newSlots.push(timeSlot);
    });

    // Adicionar todos os novos slots
    timeSlots.push(...newSlots);
    localStorage.setItem("timeSlots", JSON.stringify(timeSlots));

    const daysText = selectedDays
      .map((day) => this.getDayName(parseInt(day)))
      .join(", ");
    this.showNotification(
      `Horário adicionado com sucesso para: ${daysText}`,
      "success"
    );
    this.refreshTimeSlots();
  }

  saveBlockedDate() {
    const formData = new FormData(
      document.getElementById("addBlockedDateForm")
    );
    const blockedDate = {
      id: Date.now().toString(),
      date: formData.get("date"),
      reason: formData.get("reason"),
    };

    const blockedDates = this.getBlockedDates();
    blockedDates.push(blockedDate);
    localStorage.setItem("blockedDates", JSON.stringify(blockedDates));

    this.showNotification("Data bloqueada com sucesso!", "success");
    this.refreshBlockedDates();
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

  deleteTimeSlot(slotId) {
    if (confirm("Tem certeza que deseja excluir este horário?")) {
      const timeSlots = this.getTimeSlots().filter(
        (slot) => slot.id !== slotId
      );
      localStorage.setItem("timeSlots", JSON.stringify(timeSlots));
      this.showNotification("Horário excluído!", "success");
      this.refreshTimeSlots();
    }
  }

  deleteBlockedDate(dateId) {
    if (confirm("Tem certeza que deseja excluir esta data bloqueada?")) {
      const blockedDates = this.getBlockedDates().filter(
        (date) => date.id !== dateId
      );
      localStorage.setItem("blockedDates", JSON.stringify(blockedDates));
      this.showNotification("Data bloqueada excluída!", "success");
      this.refreshBlockedDates();
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
    const reportData = {
      generatedAt: new Date().toISOString(),
      totalRequests: this.requests.length,
      pendingRequests: this.requests.filter((r) => r.status === "pending")
        .length,
      approvedRequests: this.requests.filter((r) => r.status === "approved")
        .length,
      rejectedRequests: this.requests.filter((r) => r.status === "rejected")
        .length,
      requests: this.requests,
    };

    this.showNotification("Relatório gerado com sucesso!", "success");
    console.log("Relatório completo:", reportData);
  }

  exportReport() {
    const reportData = {
      generatedAt: new Date().toISOString(),
      totalRequests: this.requests.length,
      pendingRequests: this.requests.filter((r) => r.status === "pending")
        .length,
      approvedRequests: this.requests.filter((r) => r.status === "approved")
        .length,
      rejectedRequests: this.requests.filter((r) => r.status === "rejected")
        .length,
      requests: this.requests,
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
                    </div>
                    
                    <h2>Detalhes das Solicitações</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Solicitante</th>
                                <th>Assunto</th>
                                <th>Data</th>
                                <th>Horário</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.requests
                              .map(
                                (request) => `
                                <tr>
                                    <td>${request.userName}</td>
                                    <td>${request.subject}</td>
                                    <td>${this.formatDate(request.date)}</td>
                                    <td>${request.time}</td>
                                    <td>${this.getStatusText(
                                      request.status
                                    )}</td>
                                </tr>
                            `
                              )
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
}

// Inicializar o sistema quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  window.agendaSystem = new AgendaSystem();
});
