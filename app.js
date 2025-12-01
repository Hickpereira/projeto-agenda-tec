document.addEventListener("DOMContentLoaded", () => {
  window.services = {};

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginGoogleBtn = document.getElementById("loginGoogleBtn");
  const registerGoogleBtn = document.getElementById("registerGoogleBtn");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");

  /**
   * Objeto que agrupa todas as funções relacionadas à autenticação
   * e gerenciamento de usuários no Firebase.
   */
  const authService = {
    /**
     * Atualiza a sessão na interface (script.js) após um login ou cadastro bem-sucedido.
     * @param {object} firebaseUser - O objeto do usuário retornado pelo Firebase Auth.
     * @param {string} userType - O tipo de usuário ('responsavel' ou 'coordenador').
     */
    async updateUserSession(firebaseUser, userType) {
      const collectionName =
        userType === "responsavel" ? "responsaveis" : "orientador_pedagogico";
      const userDoc = await db
        .collection(collectionName)
        .doc(firebaseUser.uid)
        .get();

      if (!userDoc.exists) {
        await auth.signOut();
        throw new Error(
          "Dados do usuário não encontrados para este tipo de perfil."
        );
      }

      const userData = userDoc.data();

      window.agendaSystem.currentUser = {
        id: firebaseUser.uid,
        name: userData.nome_responsavel || userData.nome_orientador,
        email: firebaseUser.email,
        userType: userType,
        foto_perfil: userData.foto_perfil || null,
        telefone: userData.telefone_responsavel || null,
      };
      window.agendaSystem.isLoggedIn = true;
      window.agendaSystem.userType = userType;

      window.agendaSystem.saveUserData();
      window.agendaSystem.updateHeaderForLoggedUser();
      window.agendaSystem.showDashboard();
      window.agendaSystem.hideModal("loginModal");
      window.agendaSystem.hideModal("registerModal");
      window.agendaSystem.requests = [];

      // carrega solicitação e horários e datas bloq do ususario logado
      await window.agendaSystem.loadRequestsFromFirebase();
      await window.agendaSystem.loadTimeSlotsFromFirebase();
      await window.agendaSystem.loadBlockedDatesFromFirebase();

      window.agendaSystem.showDashboard();
    },

    async logout() {
      try {
        await auth.signOut();
        window.location.reload();
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        window.agendaSystem.showNotification("Erro ao tentar sair.", "error");
      }
    },

    async handleForgotPassword(e) {
      e.preventDefault();
      const email =
        document.getElementById("loginEmail").value ||
        document.getElementById("loginEmailOrientador").value;
      if (!email) {
        window.agendaSystem.showNotification(
          "Digite seu e-mail no campo para redefinir a senha.",
          "error"
        );
        return;
      }
      try {
        await auth.sendPasswordResetEmail(email);
        window.agendaSystem.showNotification(
          "E-mail de redefinição de senha enviado para " + email,
          "success"
        );
      } catch (error) {
        console.error("Erro ao enviar e-mail de redefinição:", error);
        window.agendaSystem.showNotification(
          "Falha ao enviar e-mail. Verifique se o e-mail está correto e cadastrado.",
          "error"
        );
      }
    },

    async handleGoogleSignIn() {
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        const responsavelRef = db.collection("responsaveis").doc(user.uid);
        const orientadorRef = db
          .collection("orientador_pedagogico")
          .doc(user.uid);
        const [responsavelDoc, orientadorDoc] = await Promise.all([
          responsavelRef.get(),
          orientadorRef.get(),
        ]);

        if (responsavelDoc.exists) {
          await this.updateUserSession(user, "responsavel");
          window.agendaSystem.showNotification(
            "Login como Responsável efetuado com sucesso!",
            "success"
          );
        } else if (orientadorDoc.exists) {
          await this.updateUserSession(user, "coordenador");
          window.agendaSystem.showNotification(
            "Login como Orientador efetuado com sucesso!",
            "success"
          );
        } else {
          await responsavelRef.set({
            nome_responsavel: user.displayName,
            email_responsavel: user.email,
            telefone_responsavel: user.phoneNumber || "",
            grau_parentesco: "Não especificado",
          });
          await this.updateUserSession(user, "responsavel");
          window.agendaSystem.showNotification(
            "Cadastro como Responsável efetuado com sucesso!",
            "success"
          );
        }
      } catch (error) {
        console.error("Erro no login com Google:", error);
        if (error.code !== "auth/popup-closed-by-user") {
          window.agendaSystem.showNotification(
            "Falha no login com Google. Tente novamente.",
            "error"
          );
        }
      }
    },

    async handleRegister(e) {
      e.preventDefault();
      const userType = document.getElementById("registerUserTypeHidden").value;
      try {
        if (userType === "responsavel") {
          const nome = document.getElementById("nome_responsavel").value;
          const email = document.getElementById("email_responsavel").value;
          const telefone = document.getElementById(
            "telefone_responsavel"
          ).value;
          const parentesco = document.getElementById("grau_parentesco").value;
          const senha = document.getElementById(
            "senhaCadastroResponsavel"
          ).value;
          const userCredential = await auth.createUserWithEmailAndPassword(
            email,
            senha
          );
          await db.collection("responsaveis").doc(userCredential.user.uid).set({
            nome_responsavel: nome,
            email_responsavel: email,
            telefone_responsavel: telefone,
            grau_parentesco: parentesco,
          });
          await this.updateUserSession(userCredential.user, "responsavel");
          window.agendaSystem.showNotification(
            "Cadastro de Responsável realizado com sucesso!",
            "success"
          );
        } else if (userType === "coordenador") {
          const nome = document.getElementById("nome_orientador").value;
          const email = document.getElementById("email_orientador").value;
          const escola = document.getElementById(
            "escola_orientador_register"
          ).value;
          const telefone = document.getElementById("telefone_orientador").value;
          const cpf = document.getElementById("cpf_orientador").value;
          const chaveAcesso = document.getElementById(
            "ChaveAcessoOrientador"
          ).value;
          const senha = document.getElementById(
            "senhaCadastroOrientador"
          ).value;

          // Validar CPF
          const cpfLimpo = window.agendaSystem.onlyDigits(cpf);
          if (
            cpfLimpo.length !== 11 ||
            !window.agendaSystem.validateCPF(cpfLimpo)
          ) {
            throw new Error(
              "CPF inválido. Por favor, verifique o CPF digitado."
            );
          }

          const chaveQuery = await db
            .collection("chave_acesso_orientador")
            .where("chave", "==", chaveAcesso)
            .where("usada", "==", false)
            .get();
          if (chaveQuery.empty)
            throw new Error("Chave de acesso inválida ou já utilizada.");
          const userCredential = await auth.createUserWithEmailAndPassword(
            email,
            senha
          );
          const user = userCredential.user;
          const chaveDocRef = db
            .collection("chave_acesso_orientador")
            .doc(chaveQuery.docs[0].id);
          const orientadorDocRef = db
            .collection("orientador_pedagogico")
            .doc(user.uid);
          await db.runTransaction(async (transaction) => {
            transaction.update(chaveDocRef, { usada: true });
            transaction.set(orientadorDocRef, {
              nome_orientador: nome,
              email_orientador: email,
              telefone_orientador: telefone,
              cpf_orientador: cpfLimpo,
              escola_orientador: escola,
            });
          });
          await this.updateUserSession(user, "coordenador");
          window.agendaSystem.showNotification(
            "Cadastro de Orientador realizado com sucesso!",
            "success"
          );
        }
      } catch (error) {
        console.error("Erro no cadastro:", error);
        const message =
          error.code === "auth/email-already-in-use"
            ? "Este e-mail já está cadastrado."
            : error.message;
        window.agendaSystem.showNotification(message, "error");
      }
    },

    async handleLogin(e) {
      e.preventDefault();
      const userType = document.getElementById("loginUserType").value;
      try {
        const email =
          userType === "responsavel"
            ? document.getElementById("loginEmail").value
            : document.getElementById("loginEmailOrientador").value;
        const password =
          userType === "responsavel"
            ? document.getElementById("senhaLoginResponsavel").value
            : document.getElementById("senhaLoginOrientador").value;
        const userCredential = await auth.signInWithEmailAndPassword(
          email,
          password
        );
        await this.updateUserSession(userCredential.user, userType);
        window.agendaSystem.showNotification(
          "Login realizado com sucesso!",
          "success"
        );
      } catch (error) {
        console.error("Erro no login:", error);
        const errorMessageString = (error.message || "").toLowerCase();
        let message;

        if (
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password" ||
          error.code === "auth/invalid-credential" ||
          (error.code === "auth/internal-error" &&
            errorMessageString.includes("invalid_login_credentials"))
        ) {
          message = "E-mail ou senha inválidos.";
        } else if (
          errorMessageString.includes("dados do usuário não encontrados")
        ) {
          message = `Login aprovado, mas não foi encontrado um perfil de ${
            userType === "responsavel" ? "Responsável" : "Orientador"
          } para este usuário.`;
        } else {
          message = "Ocorreu um erro ao tentar fazer login.";

          window.agendaSystem.showNotification(message, "error");
        }
      }
    },

    init() {
      if (registerForm)
        registerForm.addEventListener("submit", (e) => this.handleRegister(e));
      if (loginForm)
        loginForm.addEventListener("submit", (e) => this.handleLogin(e));
      if (loginGoogleBtn)
        loginGoogleBtn.addEventListener("click", () =>
          this.handleGoogleSignIn()
        );
      if (registerGoogleBtn)
        registerGoogleBtn.addEventListener("click", () =>
          this.handleGoogleSignIn()
        );
      if (forgotPasswordLink)
        forgotPasswordLink.addEventListener("click", (e) =>
          this.handleForgotPassword(e)
        );
    },
  };

  /**
   * Objeto que agrupa as funções relacionadas a agendamentos
   */
  const scheduleService = {
    /**
     * Cria uma nova solicitação de agendamento no firebae
     * @param {object} requestData
     * * Atualiza o status de uma solicitação específica no Firestore
     * @param {string} requestId - id do documento da solicitação
     * @param {string} newStatus - status - aceita,rejeitada,concluida,cancelada
     */

    async createRequest(requestData) {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        window.agendaSystem.showNotification(
          "Você precisa estar logado para fazer uma solicitação.",
          "error"
        );
        throw new Error("Usuário não autenticado.");
      }

      try {
        // verifica se data já esta como "aceita"
        const approvedSlotQuery = await db
          .collection("solicitacoes")
          .where("orientadorId", "==", requestData.orientador.id)
          .where("data", "==", requestData.date)
          .where("horario", "==", requestData.time)
          .where("status", "==", "approved") // checa se solicitaçao esta como aceita
          .get();

        if (!approvedSlotQuery.empty) {
          // Se não estiver vazio, o horário está ocupado
          throw new Error(
            "Este horário já foi preenchido. Tente outro horário."
          );
        }

        // verifica se pai tem solicitacao igual pendente
        const duplicateCheckQuery = await db
          .collection("solicitacoes")
          .where("responsavelId", "==", currentUser.uid)
          .where("orientadorId", "==", requestData.orientador.id)
          .where("data", "==", requestData.date)
          .where("horario", "==", requestData.time)
          .where("status", "==", "pending")
          .get();

        if (!duplicateCheckQuery.empty) {
          throw new Error(
            "Você já possui uma solicitação pendente para este mesmo horário."
          );
        }

        const finalRequestData = {
          responsavelId: currentUser.uid,
          orientadorId: requestData.orientador.id,
          responsavelNome:
            window.agendaSystem.currentUser.name || currentUser.displayName,
          responsavelEmail: currentUser.email,
          data: requestData.date,
          horario: requestData.time,
          assunto: requestData.subject,
          mensagem: requestData.message || "",
          escolaAluno: requestData.escola_orientador,
          alunoNome: requestData.studentName,
          alunoSerie: requestData.studentGrade,
          alunoTurma: requestData.studentClass,
          status: "pending",
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db
          .collection("solicitacoes")
          .add(finalRequestData);

        console.log("Solicitação salva com sucesso! ID:", docRef.id);

        await window.agendaSystem.loadRequestsFromFirebase();

        window.agendaSystem.showNotification(
          "Solicitação de agendamento enviada com sucesso!",
          "success"
        );
      } catch (error) {
        console.error("Erro ao salvar a solicitação no Firestore:", error);

        let errorMessage =
          "Ocorreu um erro ao enviar sua solicitação. Tente novamente.";

        if (
          error.message.includes("duplicada") ||
          error.message.includes("preenchido")
        ) {
          errorMessage = error.message;
        } else if (error.code === "permission-denied") {
          errorMessage = "Você não tem permissão para realizar esta ação.";
        }

        window.agendaSystem.showNotification(errorMessage, "error");

        error.handled = true;
        throw error;
      }
    },

    /**
     * Atualiza o status de uma solicitação.
     * SE o newStatus for 'approved', ele rejeita automaticamente
     * todas as outras solicitações pendentes para o mesmo horário.
     */
    async updateRequestStatus(requestId, newStatus) {
      if (!requestId || !newStatus) {
        throw new Error("ID da solicitação e novo status são obrigatórios.");
      }

      const requestDocRef = db.collection("solicitacoes").doc(requestId);

      if (newStatus === "approved") {
        const batch = db.batch();

        try {
          const requestDoc = await requestDocRef.get();
          if (!requestDoc.exists) {
            throw new Error("Solicitação a ser aprovada não encontrada.");
          }
          const requestData = requestDoc.data();

          // busca todas as solicitacoes pendentes na msm data e hoarrio
          const conflictsQuery = await db
            .collection("solicitacoes")
            .where("orientadorId", "==", requestData.orientadorId)
            .where("data", "==", requestData.data)
            .where("horario", "==", requestData.horario)
            .where("status", "==", "pending")
            .get();

          let rejectedCount = 0;
          conflictsQuery.forEach((doc) => {
            // Garante que não vai rejeita a própria solicitação que esta sendo aprovada
            if (doc.id !== requestId) {
              const conflictDocRef = db.collection("solicitacoes").doc(doc.id);
              batch.update(conflictDocRef, {
                status: "rejected",
                rejectionReason:
                  "Horário preenchido por outra solicitação. Tente outro horário",
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
              });
              rejectedCount++;
            }
          });

          batch.update(requestDocRef, {
            status: "approved",
            rejectionReason: null,
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
          });

          await batch.commit();
          console.log(
            `Solicitação ${requestId} aprovada e ${rejectedCount} conflitos rejeitados.`
          );
        } catch (error) {
          console.error("Erro na transação de aprovação/rejeição:", error);
          window.agendaSystem.showNotification(
            "Falha ao aprovar a solicitação e rejeitar conflitos.",
            "error"
          );
          throw error;
        }
      } else {
        // se for outro status apenas atualiza
        try {
          await requestDocRef.update({
            status: newStatus,
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
          });
          console.log(
            `Status da solicitação ${requestId} atualizado para ${newStatus}.`
          );
        } catch (error) {
          console.error("Erro ao atualizar status no Firestore:", error);
          window.agendaSystem.showNotification(
            "Falha ao atualizar o status da solicitação.",
            "error"
          );
          throw error;
        }
      }
    },

    /**
     * Exclui um horário disponível do Firestore.
     * @param {string} slotId - O ID do documento do horário.
     */
    async deleteTimeSlot(slotId) {
      if (!slotId) {
        throw new Error("ID do horário é obrigatório.");
      }
      const slotDocRef = db.collection("horarios_disponiveis").doc(slotId);
      try {
        await slotDocRef.delete();
        console.log(`Horário ${slotId} excluído do Firestore.`);
      } catch (error) {
        console.error("Erro ao excluir horário do Firestore:", error);
        window.agendaSystem.showNotification(
          "Falha ao excluir o horário do banco de dados.",
          "error"
        );
        throw error;
      }
    },

    /**
     * Exclui uma data bloqueada do Firestore.
     * @param {string} dateId - O ID do documento de bloqueio.
     */
    async deleteBlockedDate(dateId) {
      if (!dateId) {
        throw new Error("ID do bloqueio é obrigatório.");
      }
      const dateDocRef = db.collection("datas_bloqueadas").doc(dateId);
      try {
        await dateDocRef.delete();
        console.log(`Bloqueio ${dateId} excluído do Firestore.`);
      } catch (error) {
        console.error("Erro ao excluir bloqueio do Firestore:", error);
        window.agendaSystem.showNotification(
          "Falha ao excluir o bloqueio do banco de dados.",
          "error"
        );
        throw error;
      }
    },

    init() {
      console.log("Serviço de Agendamento iniciado.");
    },
  };

  authService.init();
  window.services.auth = authService;
  scheduleService.init();
  window.services.schedule = scheduleService;
});
