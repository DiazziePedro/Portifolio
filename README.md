# Portfólio Interativo — Luccas Diazzi

Portfólio com estética retrô tecnológica, inspirado em monitores CRT, fitas cassete, VHS, glitch art e design experimental minimalista predominantemente em preto e branco.

---

## 📁 Estrutura de Arquivos

```
portifolio/
├── index.html                   # Página principal com monitor CRT, setup 3D e seções
├── 404.html                     # Página 404 com efeito de perda de sinal (SMPTE bars)
├── css/
│   └── style.css                # Estilização completa, animações 3D, glitch e scanlines
├── js/
│   ├── script.js                # Lógica de boot DVD, carrossel 3D, inserção da fita e transições
│   └── 404.js                   # Lógica da perda de sinal e retorno da página 404
├── assets/
│   ├── images/
│   │   └── profile-placeholder.jpg  # Fotografia de Luccas Diazzi em alta resolução P&B
│   └── icons/
│       ├── github.svg           # Ícone vetorial do GitHub
│       ├── mail.svg             # Ícone vetorial de E-mail
│       └── phone.svg            # Ícone vetorial de Telefone/Comunicação
├── _redirects                   # Configuração de rota 404 para Netlify e Cloudflare Pages
├── vercel.json                  # Configuração de rota 404 para Vercel
└── .htaccess                    # Configuração de rota 404 para servidores Apache
```

---

## 🚀 Como Executar Localmente

### Opção 1: Servidor Local Integrado (Recomendado)
O servidor local já se encontra ativo na porta **8080**:
Acesse no seu navegador (Google Chrome, Edge, Firefox, Brave):
- **Portfólio**: [http://localhost:8080/index.html](http://localhost:8080/index.html)
- **Página 404**: [http://localhost:8080/404.html](http://localhost:8080/404.html)

Ou reinicie manualmente a qualquer momento pelo terminal:
```bash
python -m http.server 8080
# ou
npx serve .
```

### Opção 2: Abertura Direta
Abra o arquivo `index.html` com duplo clique em qualquer navegador moderno.

---

## 🌐 Configuração de Hospedagem (Página 404 Real)

Para que rotas inexistentes redirecionem automaticamente para `404.html`:

1. **GitHub Pages**:
   - O GitHub Pages serve automaticamente o arquivo `404.html` presente na raiz do repositório para qualquer rota desconhecida.
2. **Vercel**:
   - O arquivo [`vercel.json`](file:///c:/Users/Aluno/Downloads/portifolio/vercel.json) já está incluído na raiz configurando o fallback de rotas inexistentes com status 404.
3. **Netlify / Cloudflare Pages**:
   - O arquivo [`_redirects`](file:///c:/Users/Aluno/Downloads/portifolio/_redirects) já está incluído na raiz com a regra `/* /404.html 404`.
4. **Apache**:
   - O arquivo [`.htaccess`](file:///c:/Users/Aluno/Downloads/portifolio/.htaccess) já está configurado com `ErrorDocument 404 /404.html`.
5. **Nginx**:
   - No bloco `server` do seu `nginx.conf`, adicione:
     ```nginx
     error_page 404 /404.html;
     location = /404.html {
         root /caminho/do/seu/projeto;
         internal;
     }
     ```

---

## 🕹️ Controles e Interações

- **Tela de Carregamento**: O logo `LD` se move quicando nas bordas no estilo DVD screensaver. É possível pular a qualquer instante clicando no botão ou pressionando `ESPAÇO`.
- **Apresentação da Fita**: A câmera se afasta revelando o monitor CRT e o toca-fitas. A fita com o nome **Luccas Diazzi** emerge do compartimento.
- **Inserção da Fita**: Clique na fita para inseri-la mecanicamente no aparelho. O monitor sofre um glitch de sinal e a câmera foca na tela.
- **Carrossel 3D de Fitas**:
  - **Scroll do mouse**: Gira o carrossel com inércia controlada.
  - **Toque / Swipe**: Arraste para os lados ou para cima/baixo em telas touchscreen.
  - **Setas direcionais**: `←` e `→` no teclado.
  - **Clique**: Fitas laterais vão para o centro; clique na fita central para abri-la.
- **Seções**:
  - **Sobre mim**: Fotografia em P&B com scanlines CRT, nome, cargo "Técnico de TI" e texto de apresentação.
  - **Portfólio**: Link seguro direto para o GitHub oficial (`https://github.com/DiazziePedro`).
  - **Contato**: Link `mailto:` para `luccas.diazzi@gmail.com` com botão para copiar com 1 clique.
- **Relógio e Sessão**: Relógio digital em tempo real no padrão `HH:MM:SS` e contador de tempo decorrido `SESSION`.
- **Página 404**: Exibe `404 PAGE NOT FOUND` em tamanho monumental e, após 3.5 segundos, sofre interferência de perda de sinal exibindo barras de cores analógicas SMPTE.
