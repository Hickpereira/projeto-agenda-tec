const registerBtn = document.getElementById('register');
const container = document.getElementById('container');
const loginBtn = document.getElementById('login');

// Elementos dos formulários
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Botões de alternância para mobile
const tabButtons = document.querySelectorAll('.tab-btn');

// Função para mostrar o formulário de cadastro (desktop)
function showRegister() {
    container.classList.add("active");
    loginForm.classList.remove("active");
    registerForm.classList.add("active");
}

// Função para mostrar o formulário de login (desktop)
function showLogin() {
    container.classList.remove("active");
    registerForm.classList.remove("active");
    loginForm.classList.add("active");
}

// Função para alternar entre abas (mobile)
function switchTab(tabName) {
    // Remover classe active de todos os botões
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Remover classe active de todos os formulários
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.remove('active');
    });
    
    // Adicionar classe active ao botão clicado
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Mostrar formulário correspondente
    if (tabName === 'login') {
        loginForm.classList.add('active');
    } else {
        registerForm.classList.add('active');
    }
}

// Event listeners para os botões desktop
registerBtn.addEventListener('click', showRegister);
loginBtn.addEventListener('click', showLogin);

// Event listeners para os botões de alternância mobile
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        switchTab(tabName);
    });
});

// Adicionar suporte para tecla Enter nos formulários
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const form = this.closest('form');
            if (form) {
                const submitBtn = form.querySelector('button:not(.hidden)');
                if (submitBtn) {
                    submitBtn.click();
                }
            }
        }
    });
});

// Adicionar efeitos de foco nos inputs
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.style.borderColor = '#0a57a2';
        this.style.boxShadow = '0 0 0 3px rgba(10, 87, 162, 0.1)';
    });
    
    input.addEventListener('blur', function() {
        this.style.borderColor = 'transparent';
        this.style.boxShadow = 'none';
    });
    
    input.addEventListener('input', function() {
        if (this.value.trim()) {
            this.style.backgroundColor = '#f0f8ff';
        } else {
            this.style.backgroundColor = '#eee';
        }
    });
});

// Adicionar efeitos de hover nos botões
document.querySelectorAll('button:not(.hidden)').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 5px 15px rgba(10, 87, 162, 0.3)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    });
});

// Efeito ripple nos botões principais
document.querySelectorAll('button:not(.hidden)').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// CSS para animação de ripple
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Validação dos formulários e redirecionamento no login
loginForm.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    const inputs = this.querySelectorAll('input');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.border = '2px solid #ff4444';
            input.style.backgroundColor = '#ffe6e6';
        }
    });

    if (isValid) {
        // Redireciona para a página após login
        window.location.href = "../DEPOIS-LOGIN/index.html";
    } else {
        alert("Por favor, preencha todos os campos.");
        setTimeout(() => {
            inputs.forEach(input => {
                input.style.border = 'none';
                input.style.backgroundColor = '#eee';
            });
        }, 3000);
    }
});

// Validação do cadastro (permanece igual)
registerForm.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    const inputs = this.querySelectorAll('input');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.border = '2px solid #ff4444';
            input.style.backgroundColor = '#ffe6e6';
        }
    });

    if (isValid) {
        alert("Cadastro realizado com sucesso!");
        this.reset();
        inputs.forEach(input => {
            input.style.border = 'none';
            input.style.backgroundColor = '#eee';
        });
    } else {
        alert("Por favor, preencha todos os campos.");
        setTimeout(() => {
            inputs.forEach(input => {
                input.style.border = 'none';
                input.style.backgroundColor = '#eee';
            });
        }, 3000);
    }
});

// Detectar orientação da tela e ajustar layout
function handleOrientationChange() {
    if (window.innerHeight < 500) {
        document.body.style.padding = '10px';
    } else {
        document.body.style.padding = '20px';
    }
}

window.addEventListener('orientationchange', handleOrientationChange);
window.addEventListener('resize', handleOrientationChange);
handleOrientationChange();

document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth <= 480) {
        switchTab('login');
    }
    
    setTimeout(() => {
        container.style.opacity = '0';
        container.style.transform = 'scale(0.95)';
        container.style.transition = 'all 0.8s ease';
        
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'scale(1)';
        }, 100);
    }, 100);
});
