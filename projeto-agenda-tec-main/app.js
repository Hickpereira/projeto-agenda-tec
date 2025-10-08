// app.js - VERSÃO FINAL CORRIGIDA (com gestão de 'required')

document.addEventListener('DOMContentLoaded', () => {
    // Garante que o agendaSystem do script.js esteja pronto
    if (!window.agendaSystem) {
        console.error("CRÍTICO: O objeto global 'agendaSystem' não foi encontrado. Verifique se 'script.js' está sendo carregado ANTES de 'app.js'.");
        return;
    }

    // --- Seleção dos Formulários ---
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // --- NOVA FUNÇÃO: Gerencia quais campos são obrigatórios ---
    function toggleRequiredAttributes(activePane) {
        if (!registerForm) return;
        // Encontra todos os inputs e selects dentro do formulário de registro
        const allInputs = registerForm.querySelectorAll('input, select');
        
        allInputs.forEach(input => {
            // Verifica se o input está dentro do painel que está ativo
            if (activePane.contains(input)) {
                // Se o input não for o telefone do responsável (que é opcional), adiciona 'required'
                if (input.id !== 'telefone_responsavel') {
                    input.required = true;
                }
            } else {
                // Se o input está em um painel escondido, remove 'required'
                input.required = false;
            }
        });
    }

    // --- LÓGICA DE ABAS (MODIFICADA) ---
    function setupTabs(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const tabs = form.querySelectorAll('.tab-btn');
        const panes = form.querySelectorAll('.tab-pane');
        const userTypeInput = form.querySelector('input[name$="UserType"]');

        // Configuração inicial ao carregar a página
        const initialActivePane = form.querySelector('.tab-pane.active');
        if (initialActivePane && formId === 'registerForm') {
            toggleRequiredAttributes(initialActivePane);
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));

                tab.classList.add('active');
                const targetPaneId = tab.getAttribute('data-target');
                const targetPane = document.getElementById(targetPaneId);
                targetPane.classList.add('active');

                if (userTypeInput) {
                    userTypeInput.value = targetPaneId.includes('Responsavel') ? 'responsavel' : 'orientador';
                }

                // CHAMA A NOVA FUNÇÃO A CADA TROCA DE ABA NO FORMULÁRIO DE REGISTRO
                if (formId === 'registerForm') {
                    toggleRequiredAttributes(targetPane);
                }
            });
        });
    }

    setupTabs('loginForm');
    setupTabs('registerForm');


    // --- FUNÇÃO PONTE: Atualiza a sessão no agendaSystem após um login/cadastro bem-sucedido ---
    async function updateUserSession(firebaseUser, userType) {
        const collectionName = userType === 'responsavel' ? 'responsaveis' : 'orientador_pedagogico';
        const userDoc = await db.collection(collectionName).doc(firebaseUser.uid).get();

        if (!userDoc.exists) {
            throw new Error("Dados do usuário não encontrados no banco de dados após o login.");
        }

        const userData = userDoc.data();

        // Preenche o objeto 'currentUser' do agendaSystem com dados do Firebase
        window.agendaSystem.currentUser = {
            id: firebaseUser.uid,
            name: userData.nome_responsavel || userData.nome_orientador,
            email: firebaseUser.email,
            userType: userType,
        };
        window.agendaSystem.isLoggedIn = true;
        window.agendaSystem.userType = userType;

        // Usa os métodos do próprio agendaSystem para atualizar a interface
        window.agendaSystem.saveUserData();
        window.agendaSystem.updateHeaderForLoggedUser();
        window.agendaSystem.showDashboard();
        window.agendaSystem.hideModal('loginModal');
        window.agendaSystem.hideModal('registerModal');
    }


    // --- LÓGICA DE CADASTRO ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
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
                    const user = userCredential.user;

                    await db.collection('responsaveis').doc(user.uid).set({
                        nome_responsavel: nome,
                        email_responsavel: email,
                        telefone_responsavel: telefone,
                        grau_parentesco: parentesco
                    });

                    await updateUserSession(user, 'responsavel');
                    window.agendaSystem.showNotification('Cadastro de Responsável realizado com sucesso!', 'success');

                } else if (userType === 'orientador') {
                    const nome = document.getElementById('nome_orientador').value;
                    const email = document.getElementById('email_orientador').value;
                    const telefone = document.getElementById('telefone_orientador').value;
                    const cpf = document.getElementById('cpf_orientador').value;
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
                            nome_orientador: nome,
                            email_orientador: email,
                            telefone_orientador: telefone,
                            cpf_orientador: cpf
                        });
                    });

                    await updateUserSession(user, 'orientador');
                    window.agendaSystem.showNotification('Cadastro de Orientador realizado com sucesso!', 'success');
                }
            } catch (error) {
                console.error("Erro no cadastro:", error);
                const message = error.code === 'auth/email-already-in-use' ? 'Este e-mail já está cadastrado.' : error.message;
                window.agendaSystem.showNotification(message, 'error');
            }
        });
    }

    // --- LÓGICA DE LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userType = document.getElementById('loginUserType').value;

            try {
                let email, password;

                if (userType === 'responsavel') {
                    email = document.getElementById('loginEmail').value;
                    password = document.getElementById('senhaLoginResponsavel').value;
                } else { // orientador
                    email = document.getElementById('loginEmailOrientador').value;
                    password = document.getElementById('senhaLoginOrientador').value;
                }

                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                
                await updateUserSession(userCredential.user, userType);
                window.agendaSystem.showNotification('Login realizado com sucesso!', 'success');

            } catch (error) {
                console.error("Erro no login:", error);
                let message = 'Ocorreu um erro ao tentar fazer login.';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    message = 'E-mail ou senha inválidos.';
                }
                window.agendaSystem.showNotification(message, 'error');
            }
        });
    }
});