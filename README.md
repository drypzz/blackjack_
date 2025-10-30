# 🎰 MZK2 Bet - Simulador de Cassino

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-050505?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.23-171717?logo=framer)

Bem-vindo ao **MZK2 Bet**, um simulador de jogos de cassino interativo construído com as tecnologias web mais modernas. Este projeto é executado inteiramente no lado do cliente, utilizando o `LocalStorage` do navegador para persistir os dados do usuário, saldos e histórico de jogos.

## ✨ Funcionalidades

-   **Autenticação e Persistência de Dados:** Sistema completo de cadastro e login. Todos os perfis de usuário, saldos e histórico de jogos são salvos localmente no `LocalStorage` do seu navegador.
-   **Saldo Inicial:** Novos usuários recebem um saldo inicial de R$ 1.000,00 para começar a jogar.
-   **Três Jogos Completos:**
    -   **🎰 Slot Machine:** Um caça-níqueis clássico de 3 rolos. Combine três símbolos para ganhar multiplicadores de até 10x.
    -   **🃏 Blackjack:** Jogue o clássico "21" contra a casa. Inclui pagamentos de 2.5x para Blackjack (21 natural) e um modo de dificuldade adaptativo: após 3 vitórias seguidas, o dealer tem uma chance maior de conseguir uma mão forte.
    -   **⚪ Roleta:** Faça apostas em Vermelho/Preto, Par/Ímpar, ou 1-18/19-36. O jogo inclui um "Modo Educativo" que permite ajustar a probabilidade de vitória para demonstrar a "Teoria da Ruína do Jogador".
-   **Perfil de Usuário Detalhado:** Uma página de perfil onde o usuário pode ver estatísticas detalhadas, como lucro líquido, taxa de retorno e total de jogos jogados.
-   **Gráfico de Desempenho:** Um gráfico de linha interativo (usando `recharts`) que mostra a evolução do saldo do usuário ao longo do tempo.
-   **Histórico de Jogos:** O perfil exibe uma lista de todos os jogos recentes, mostrando a aposta, o lucro (ou perda) e o saldo resultante.
-   **Exportação de Dados:** Funcionalidade para exportar todo o histórico de jogos do usuário para um arquivo `.csv`.

## 🛠️ Tecnologias Utilizadas

-   **Framework:** [Next.js 15 (com Turbopack)](https://nextjs.org/)
-   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
-   **UI:** [React 19](https://react.dev/)
-   **Estilização:** [Tailwind CSS 4](https://tailwindcss.com/)
-   **Animações:** [Framer Motion](https://www.framer.com/motion/)
-   **Gráficos:** [Recharts](https://recharts.org/)
-   **Ícones:** [Lucide React](https://lucide.dev/) e [Heroicons](https://heroicons.com/)
-   **Linting:** [ESLint](https://eslint.org/)

## 🚀 Como Executar

Siga estas etapas para configurar e executar o projeto localmente.

1.  **Clone o repositório:**
    ```bash
    git clone git@github.com:drypzz/mzk2bet.git
    cd mzk2bet
    ```

2.  **Instale as dependências:**
    (Use o gerenciador de pacotes de sua preferência)
    ```bash
    npm install
    # ou
    yarn install
    # ou
    pnpm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    O projeto está configurado para usar o Turbopack por padrão.
    ```bash
    npm run dev
    # ou
    yarn dev
    # ou
    pnpm dev
    ```

4.  **Abra no navegador:**
    Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## 👨‍💻 Desenvolvido por

-   [Drypzz](https://github.com/drypzz)
-   [Felipe-G-Schmitt](https://github.com/Felipe-G-Schmitt)
-   [Function404](https://github.com/function404)
