# ⚡ Gerador de Orçamentos de Elétrica

Uma ferramenta web simples e eficiente desenvolvida para eletricistas, técnicos e MEIs gerarem propostas comerciais e orçamentos de forma rápida e profissional.

![Status do Projeto](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![Tech Stack](https://img.shields.io/badge/HTML5-CSS3-JavaScript-blue)

## 📋 Sobre o Projeto

Este projeto consiste em uma página web estática (Single Page Application) que permite ao profissional preencher dados do cliente, selecionar serviços de elétrica, adicionar materiais/peças e calcular automaticamente o valor total. O objetivo é facilitar a criação de orçamentos padronizados prontos para impressão ou geração de PDF.

## 🚀 Funcionalidades

* **Dados do Cliente:** Campos para cadastro rápido (Nome, Endereço, Telefone e Data).
* **Seleção de Serviços:** Checkboxes para serviços comuns:
    * Instalação/Manutenção de Câmeras.
    * Cerca Elétrica.
    * Instalação Elétrica (Nova/Reforma).
    * Manutenção Geral.
* **Detalhamento Dinâmico:** Ao selecionar um serviço, abre-se um campo de texto para descrever os detalhes técnicos daquela execução específica.
* **Lista de Materiais:** Funcionalidade para adicionar itens avulsos (peças, disjuntores, cabos) com seus respectivos valores, somando ao total.
* **Cálculo Automático:** O valor total é atualizado em tempo real conforme serviços e itens são adicionados.
* **Observações e Custos Extras:** Campos dedicados para taxas de deslocamento e observações contratuais.
* **Modo de Impressão:** Botão configurado para preparar o layout para impressão (gerar PDF pelo navegador).

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estrutura semântica da página.
* **CSS3:** Estilização da interface (arquivo `style.css` e estilos inline para componentes dinâmicos).
* **JavaScript:** Lógica de cálculo, manipulação do DOM (exibir/ocultar detalhes) e adição de itens na tabela (arquivo `script.js`).

## 📂 Estrutura de Arquivos

```text
/
├── index.html      # Estrutura principal e formulário
├── style.css       # Estilos visuais (layout, cores, impressão)
└── script.js       # Lógica de funcionamento e cálculos
