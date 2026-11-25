# BookShelf

Biblioteca pessoal digital em React, JavaScript e Vite. A versão inicial inclui a visão geral, o menu de navegação e as páginas preparadas para o cadastro de livros, a importação de arquivos, as estantes e as leituras.

## Executar localmente

Use Node.js 24 LTS e npm. Na raiz do repositório, execute:

```sh
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite no terminal (normalmente `http://localhost:5173`). No PowerShell, use `npm.cmd` se a política do sistema bloquear o script `npm.ps1`.

## Verificar o projeto

```sh
npm run lint
npm run build
npm run preview
```

O build é gerado em `dist/`. Em uma hospedagem estática, configure o redirecionamento de caminhos da aplicação para `index.html` para permitir o acesso direto às rotas.

## Organização

- `src/components/` contém a navegação e o cabeçalho.
- `src/layouts/` reúne a estrutura compartilhada entre as páginas.
- `src/pages/` contém as telas da aplicação.
- `src/routes/` define as rotas e os destinos do menu.
- `src/styles/` contém os estilos globais. Os estilos locais usam CSS Modules.
