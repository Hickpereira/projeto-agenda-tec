// Dados de demonstração para o sistema Nova Agenda TEC
// Execute este script no console do navegador para popular o sistema com dados de exemplo

const demoData = {
    users: [
        {
            id: "1",
            name: "Maria Silva Santos",
            email: "maria.silva@email.com",
            phone: "(11) 99999-1111",
            password: "123456",
            userType: "responsavel",
            createdAt: "2024-01-15T10:00:00.000Z"
        },
        {
            id: "2",
            name: "João Oliveira Costa",
            email: "joao.oliveira@email.com",
            phone: "(11) 99999-2222",
            password: "123456",
            userType: "responsavel",
            createdAt: "2024-01-16T14:30:00.000Z"
        },
        {
            id: "3",
            name: "Ana Coordenadora",
            email: "ana.coordenadora@escola.com",
            phone: "(11) 99999-3333",
            password: "123456",
            userType: "coordenador",
            createdAt: "2024-01-10T08:00:00.000Z"
        },
        {
            id: "4",
            name: "Carlos Coordenador",
            email: "carlos.coordenador@escola.com",
            phone: "(11) 99999-4444",
            password: "123456",
            userType: "coordenador",
            createdAt: "2024-01-12T09:15:00.000Z"
        }
    ],
    requests: [
        {
            id: "req1",
            userId: "1",
            userName: "Maria Silva Santos",
            userEmail: "maria.silva@email.com",
            date: "2024-02-15",
            time: "14:00",
            subject: "Dúvidas sobre rendimento escolar",
            message: "Gostaria de conversar sobre o desempenho do meu filho João na disciplina de Matemática.",
            status: "pending",
            createdAt: "2024-01-20T10:30:00.000Z"
        },
        {
            id: "req2",
            userId: "2",
            userName: "João Oliveira Costa",
            userEmail: "joao.oliveira@email.com",
            date: "2024-02-10",
            time: "09:00",
            subject: "Reunião sobre comportamento",
            message: "Preciso agendar uma reunião para discutir questões de comportamento do meu filho Pedro.",
            status: "approved",
            createdAt: "2024-01-18T15:45:00.000Z"
        },
        {
            id: "req3",
            userId: "1",
            userName: "Maria Silva Santos",
            userEmail: "maria.silva@email.com",
            date: "2024-02-20",
            time: "16:00",
            subject: "Orientações para o próximo semestre",
            message: "Gostaria de receber orientações sobre as atividades do próximo semestre.",
            status: "rejected",
            createdAt: "2024-01-22T11:20:00.000Z"
        }
    ]
};

// Função para popular o sistema com dados de demonstração
function loadDemoData() {
    try {
        // Salvar usuários
        localStorage.setItem('agenda_users', JSON.stringify(demoData.users));
        
        // Salvar solicitações
        localStorage.setItem('agenda_requests', JSON.stringify(demoData.requests));
        
        console.log('✅ Dados de demonstração carregados com sucesso!');
        console.log('👥 Usuários disponíveis:');
        demoData.users.forEach(user => {
            console.log(`   - ${user.name} (${user.userType}) - Email: ${user.email} - Senha: ${user.password}`);
        });
        console.log('\n📅 Solicitações de exemplo:');
        demoData.requests.forEach(req => {
            console.log(`   - ${req.subject} - Status: ${req.status} - Data: ${req.date}`);
        });
        
        // Recarregar a página para aplicar os dados
        if (confirm('Dados carregados! Deseja recarregar a página para aplicar as mudanças?')) {
            window.location.reload();
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados de demonstração:', error);
    }
}

// Função para limpar todos os dados
function clearAllData() {
    if (confirm('⚠️ Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem('agenda_users');
        localStorage.removeItem('agenda_requests');
        localStorage.removeItem('currentUser');
        console.log('🗑️ Todos os dados foram limpos!');
        window.location.reload();
    }
}

// Função para mostrar informações do sistema
function showSystemInfo() {
    const users = JSON.parse(localStorage.getItem('agenda_users') || '[]');
    const requests = JSON.parse(localStorage.getItem('agenda_requests') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    console.log('📊 Informações do Sistema:');
    console.log(`👥 Total de usuários: ${users.length}`);
    console.log(`📅 Total de solicitações: ${requests.length}`);
    console.log(`🔐 Usuário logado: ${currentUser ? currentUser.name : 'Nenhum'}`);
    
    if (requests.length > 0) {
        const pendingRequests = requests.filter(req => req.status === 'pending');
        const approvedRequests = requests.filter(req => req.status === 'approved');
        const rejectedRequests = requests.filter(req => req.status === 'rejected');
        
        console.log(`⏳ Solicitações pendentes: ${pendingRequests.length}`);
        console.log(`✅ Solicitações aprovadas: ${approvedRequests.length}`);
        console.log(`❌ Solicitações recusadas: ${rejectedRequests.length}`);
    }
}

// Adicionar funções ao objeto global para facilitar o acesso
window.loadDemoData = loadDemoData;
window.clearAllData = clearAllData;
window.showSystemInfo = showSystemInfo;

// Instruções de uso
console.log(`
🎯 NOVA AGENDA TEC - DADOS DE DEMONSTRAÇÃO

Para carregar dados de exemplo, execute:
loadDemoData()

Para limpar todos os dados:
clearAllData()

Para ver informações do sistema:
showSystemInfo()

👥 USUÁRIOS DE TESTE:
- Responsável: maria.silva@email.com / 123456
- Responsável: joao.oliveira@email.com / 123456  
- Coordenador: ana.coordenadora@escola.com / 123456
- Coordenador: carlos.coordenador@escola.com / 123456

📅 SOLICITAÇÕES DE EXEMPLO:
- 3 solicitações com diferentes status (pendente, aprovada, recusada)
- Dados realistas para teste completo do sistema
`);

// Auto-executar se estiver em ambiente de desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🚀 Ambiente de desenvolvimento detectado. Execute loadDemoData() para começar!');
}

