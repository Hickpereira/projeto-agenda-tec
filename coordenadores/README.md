# Sistema de Calendário de Agendamentos - AGENDA TEC

## Descrição
Sistema web para visualização e gerenciamento de agendamentos escolares, desenvolvido para coordenadores educacionais.

## Funcionalidades

### 1. Página Principal (`index.html`)
- Interface inicial com botão "Ver agendamentos"
- Design responsivo e moderno
- Navegação para outras funcionalidades

### 2. Sistema de Calendário (`calendario.html`)
- **Visualização mensal**: Navegação entre meses com botões de seta
- **Indicadores visuais**: 
  - Dias ocupados marcados com ponto vermelho
  - Dia atual destacado em azul
  - Dia selecionado destacado em vermelho
- **Modal de horários**: Ao clicar em um dia, abre modal mostrando:
  - Lista de horários disponíveis (14:00 - 17:30)
  - Status de cada horário (disponível/ocupado)
  - Detalhes dos agendamentos existentes

### 3. Personalização de Horários
- **Configuração automática**: Geração automática de horários baseada em intervalo
- **Horários personalizados**: Adição/remoção de horários específicos
- **Dias de atendimento**: Seleção de quais dias da semana atendem
- **Salvamento local**: Configurações salvas no navegador

### 4. Sistema de Relatórios
- **Filtros avançados**: Por período, status e ordenação
- **Exportação Excel**: Geração de arquivos .xlsx com SheetJS
- **Exportação CSV**: Arquivos CSV para análise em outras ferramentas
- **Preview dos dados**: Visualização em tabela antes da exportação

### 3. Informações dos Agendamentos
Para cada horário ocupado, o sistema exibe:
- Nome completo da pessoa
- Grau de parentesco
- Email/Telefone
- Finalidade do atendimento

## Como Usar

### Para Coordenadores:
1. Acesse a página principal
2. Clique em "Ver agendamentos"
3. Use as abas para navegar entre funcionalidades:
   - **Calendário**: Visualizar agendamentos por dia
   - **Personalizar Horários**: Configurar horários de atendimento
   - **Relatórios**: Gerar relatórios e exportar dados

#### Calendário:
- Navegue pelo calendário usando as setas
- Clique em qualquer dia para ver os horários
- Visualize detalhes dos agendamentos clicando em "Ver"

#### Personalizar Horários:
- Configure horário de início e fim
- Escolha o intervalo entre horários
- Adicione/remova horários específicos
- Selecione dias de atendimento
- Salve a configuração

#### Relatórios:
- Defina período de análise
- Filtre por status dos agendamentos
- Escolha ordenação dos dados
- Visualize preview antes de exportar
- Exporte em Excel (.xlsx) ou CSV

### Navegação no Calendário:
- **Setas laterais**: Navegar entre meses
- **Dias clicáveis**: Selecionar para ver horários
- **Indicadores visuais**: 
  - 🔴 Ponto vermelho = Dia com agendamentos
  - 🔵 Azul = Dia atual
  - 🔴 Vermelho = Dia selecionado

## Estrutura de Arquivos

```
coordenadores/
├── DEPOIS-LOGIN/
│   ├── index.html          # Página principal
│   ├── calendario.html     # Página do calendário
│   ├── calendario.css      # Estilos do calendário
│   ├── calendario.js       # Funcionalidades JavaScript
│   └── style.css           # Estilos gerais
├── LOGIN-CADASTRO/         # Sistema de login
├── IMG/                    # Imagens do sistema
└── README.md               # Este arquivo
```

## Tecnologias Utilizadas
- HTML5
- CSS3 (com gradientes e animações)
- JavaScript (ES6+)
- Font Awesome (ícones)
- Google Fonts (Rubik)
- SheetJS (xlsx) para exportação Excel
- LocalStorage para persistência de dados

## Dados de Demonstração
O sistema inclui dados simulados para demonstração:
- **12 de Agosto**: 2 horários ocupados (15:00-15:30 e 17:00-17:30)
- **15 de Agosto**: 1 horário ocupado (14:00-14:30)

## Responsividade
- Design adaptável para desktop, tablet e mobile
- Layout em grid responsivo
- Modal otimizado para diferentes tamanhos de tela

## Personalização
Para adicionar novos agendamentos, edite o arquivo `calendario.js` na seção `agendamentos`.

## Compatibilidade
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Suporte a dispositivos móveis
- Funciona offline (dados locais)
