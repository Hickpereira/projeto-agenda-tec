document.addEventListener('DOMContentLoaded', () => {

    // Validação inicial para garantir que a interface (script.js) foi carregada primeiro.
    if (!window.agendaSystem) {
        console.error("CRÍTICO: O objeto global 'agendaSystem' não foi encontrado. Verifique se 'script.js' está sendo carregado ANTES de 'app.js'.");
        return;
    }

    // --- 1. SELEÇÃO DOS ELEMENTOS GLOBAIS ---
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginGoogleBtn = document.getElementById('loginGoogleBtn');
    const registerGoogleBtn = document.getElementById('registerGoogleBtn');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');

    const authService = {
        /**
         * Atualiza a sessão na interface (script.js) após um login ou cadastro bem-sucedido.
         * @param {object} firebaseUser - O objeto do usuário retornado pelo Firebase Auth.
         * @param {string} userType - O tipo de usuário ('responsavel' ou 'coordenador').
         */
        async updateUserSession(firebaseUser, userType) {
            const collectionName = userType === 'responsavel' ? 'responsaveis' : 'orientador_pedagogico';
            const userDoc = await db.collection(collectionName).doc(firebaseUser.uid).get();

            if (!userDoc.exists) {
                await auth.signOut();
                throw new Error("Dados do usuário não encontrados para este tipo de perfil.");
            }

            const userData = userDoc.data();

            window.agendaSystem.currentUser = {
                id: firebaseUser.uid,
                name: userData.nome_responsavel || userData.nome_orientador,
                email: firebaseUser.email,
                userType: userType,
            };
            window.agendaSystem.isLoggedIn = true;
            window.agendaSystem.userType = userType;

            window.agendaSystem.saveUserData();
            window.agendaSystem.updateHeaderForLoggedUser();
            window.agendaSystem.showDashboard();
            window.agendaSystem.hideModal('loginModal');
            window.agendaSystem.hideModal('registerModal');
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
            const email = document.getElementById('loginEmail').value || document.getElementById('loginEmailOrientador').value;
            if (!email) {
                window.agendaSystem.showNotification('Digite seu e-mail no campo para redefinir a senha.', 'error');
                return;
            }
            try {
                await auth.sendPasswordResetEmail(email);
                window.agendaSystem.showNotification('E-mail de redefinição de senha enviado para ' + email, 'success');
            } catch (error) {
                console.error("Erro ao enviar e-mail de redefinição:", error);
                window.agendaSystem.showNotification('Falha ao enviar e-mail. Verifique se o e-mail está correto e cadastrado.', 'error');
            }
        },

        async handleGoogleSignIn() {
            const provider = new firebase.auth.GoogleAuthProvider();
            try {
                const result = await auth.signInWithPopup(provider);
                const user = result.user;
                const responsavelRef = db.collection('responsaveis').doc(user.uid);
                const orientadorRef = db.collection('orientador_pedagogico').doc(user.uid);
                const [responsavelDoc, orientadorDoc] = await Promise.all([responsavelRef.get(), orientadorRef.get()]);

                if (responsavelDoc.exists) {
                    await this.updateUserSession(user, 'responsavel');
                    window.agendaSystem.showNotification('Login como Responsável efetuado com sucesso!', 'success');
                } else if (orientadorDoc.exists) {
                    await this.updateUserSession(user, 'coordenador');
                    window.agendaSystem.showNotification('Login como Orientador efetuado com sucesso!', 'success');
                } else {
                    await responsavelRef.set({
                        nome_responsavel: user.displayName,
                        email_responsavel: user.email,
                        telefone_responsavel: user.phoneNumber || "",
                        grau_parentesco: "Não especificado"
                    });
                    await this.updateUserSession(user, 'responsavel');
                    window.agendaSystem.showNotification('Cadastro como Responsável efetuado com sucesso!', 'success');
                }
            } catch (error) {
                console.error("Erro no login com Google:", error);
                if (error.code !== 'auth/popup-closed-by-user') {
                    window.agendaSystem.showNotification('Falha no login com Google. Tente novamente.', 'error');
                }
            }
        },
        
        async handleRegister(e) {
            e.preventDefault();
            const userType = document.getElementById('registerUserTypeHidden').value;
            try {
                if (userType === 'responsavel') {
                    const nome = document.getElementById('nome_responsavel').value;
                    const email = document.getElementById('email_responsavel').value;
                    const telefone = document.getElementById('telefone_responsavel').value;
                    const parentesco = document.getElementById('grau_parentesco').value;
                    const senha = document.getElementById('senhaCadastroResponsavel').value;
                    const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
                    await db.collection('responsaveis').doc(userCredential.user.uid).set({
                        nome_responsavel: nome, email_responsavel: email, telefone_responsavel: telefone, grau_parentesco: parentesco
                    });
                    await this.updateUserSession(userCredential.user, 'responsavel');
                    window.agendaSystem.showNotification('Cadastro de Responsável realizado com sucesso!', 'success');
                } else if (userType === 'coordenador') {
                    const nome = document.getElementById('nome_orientador').value;
                    const email = document.getElementById('email_orientador').value;
                    const telefone = document.getElementById('telefone_orientador').value;
                    const cpf = document.getElementById('cpf_orientador').value;
                    if (!validateCPF(cpf)) {
                     window.agendaSystem.showNotification('CPF inválido. Por favor, verifique o número digitado.', 'error');
                    return; 
                    }
                    const chaveAcesso = document.getElementById('ChaveAcessoOrientador').value;
                    const senha = document.getElementById('senhaCadastroOrientador').value;
                    const chaveQuery = await db.collection('chave_acesso_orientador').where('chave', '==', chaveAcesso).where('usada', '==', false).get();
                    if (chaveQuery.empty) throw new Error('Chave de acesso inválida ou já utilizada.');
                    const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
                    const user = userCredential.user;
                    const chaveDocRef = db.collection('chave_acesso_orientador').doc(chaveQuery.docs[0].id);
                    const orientadorDocRef = db.collection('orientador_pedagogico').doc(user.uid);
                    await db.runTransaction(async (transaction) => {
                        transaction.update(chaveDocRef, { usada: true });
                        transaction.set(orientadorDocRef, {
                            nome_orientador: nome, email_orientador: email, telefone_orientador: telefone, cpf_orientador: cpf
                        });
                    });
                    await this.updateUserSession(user, 'coordenador');
                    window.agendaSystem.showNotification('Cadastro de Orientador realizado com sucesso!', 'success');
                }
            } catch (error) {
                console.error("Erro no cadastro:", error);
                const message = error.code === 'auth/email-already-in-use' ? 'Este e-mail já está cadastrado.' : error.message;
                window.agendaSystem.showNotification(message, 'error');
            }
        },

        async handleLogin(e) {
            e.preventDefault();
            const userType = document.getElementById('loginUserType').value;
            try {
                const email = (userType === 'responsavel') ? document.getElementById('loginEmail').value : document.getElementById('loginEmailOrientador').value;
                const password = (userType === 'responsavel') ? document.getElementById('senhaLoginResponsavel').value : document.getElementById('senhaLoginOrientador').value;
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                await this.updateUserSession(userCredential.user, userType);
                window.agendaSystem.showNotification('Login realizado com sucesso!', 'success');
            } catch (error) {
                console.error("Erro no login:", error);
                const message = (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential')
                    ? 'E-mail ou senha inválidos.'
                    : 'Ocorreu um erro ao tentar fazer login.';
                window.agendaSystem.showNotification(message, 'error');
            }
        },

        init() {
            if (registerForm) registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            if (loginGoogleBtn) loginGoogleBtn.addEventListener('click', () => this.handleGoogleSignIn());
            if (registerGoogleBtn) registerGoogleBtn.addEventListener('click', () => this.handleGoogleSignIn());
            if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', (e) => this.handleForgotPassword(e));
        }
    };

    /**
     * Objeto que agrupa as funções relacionadas a agendamentos.
     */
    const scheduleService = {
        /**
         * Cria uma nova solicitação de agendamento no Firestore.
         * @param {object} requestData - Os dados do formulário vindos do script.js
         */
        async createRequest(requestData) {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                window.agendaSystem.showNotification("Você precisa estar logado para fazer uma solicitação.", "error");
                throw new Error("Usuário não autenticado.");
            }
            const finalRequestData = {
                responsavelId: currentUser.uid,
                responsavelNome: window.agendaSystem.currentUser.name || currentUser.displayName,
                responsavelEmail: currentUser.email,
                orientadorId: requestData.orientador.id,
                data: requestData.date,
                horario: requestData.time,
                assunto: requestData.subject,
                mensagem: requestData.message,
                status: 'pendente',
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            };
            try {
                const docRef = await db.collection('solicitacoes').add(finalRequestData);
                console.log("Solicitação salva com sucesso! ID:", docRef.id);
                window.agendaSystem.showNotification('Solicitação de agendamento enviada com sucesso!', 'success');
            } catch (error) {
                console.error("Erro ao salvar a solicitação no Firestore:", error);
                window.agendaSystem.showNotification('Ocorreu um erro ao enviar sua solicitação. Tente novamente.', 'error');
                throw error;
            }
        },
        
        init() {
            console.log("Serviço de Agendamento iniciado.");
        }
    };

    // --- 3. INICIALIZAÇÃO DOS SERVIÇOS ---
    authService.init();
    window.authService = authService; // Torna o serviço acessível globalmente
    
    scheduleService.init();
    window.scheduleService = scheduleService; // Torna o serviço acessível globalmente
});