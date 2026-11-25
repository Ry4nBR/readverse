# BookShelf

Biblioteca pessoal digital em React, JavaScript e Vite. A estante de livros físicos reúne o cadastro por ISBN ou manual, a pesquisa, os filtros e o gerenciamento dos livros.

## Executar localmente

Use Node.js 24 LTS e npm. Na raiz do repositório, execute:

```sh
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite no terminal (normalmente `http://localhost:5173`). No PowerShell, use `npm.cmd` se a política do sistema bloquear o script `npm.ps1`.

## Estante de livros físicos

- Em **Cadastrar livro**, pesquise por ISBN-10 ou ISBN-13 ou preencha os dados manualmente. Título e autor são obrigatórios. Revise os dados do catálogo antes de salvar.
- A capa personalizada aceita JPEG, PNG, WebP ou GIF de até 5 MB. Você pode remover ou substituir a capa ao editar.
- Em **Meus livros**, busque por título ou autor, filtre por gênero ou status e abra o título para consultar os detalhes, editar ou excluir o livro.
- Os dados e as capas enviadas ficam no IndexedDB do navegador, associados ao endereço da aplicação. Use o mesmo navegador e endereço para reencontrar a estante. Limpar os dados do site remove os livros. Capas vindas dos catálogos usam URLs externas.

### Catálogos por ISBN

A consulta começa pelo [Google Books](https://developers.google.com/books/docs/v1/using) e segue para a [Open Library](https://openlibrary.org/developers/api) quando a primeira consulta não encontra a edição ou falha. O cadastro manual funciona sem consultar os catálogos.

Para usar uma chave pública de navegador do Google Books, habilite a API no Google Cloud, restrinja a chave à API e aos endereços autorizados e configure `VITE_GOOGLE_BOOKS_API_KEY` no arquivo local `.env.local`. Reinicie o Vite após alterar o arquivo. O Vite inclui variáveis `VITE_` no código entregue ao navegador, portanto use apenas credenciais destinadas a aplicações de navegador.

## Verificar o projeto

```sh
npm run lint
npm test
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
- `src/services/` integra os catálogos e gerencia a persistência.
- `src/hooks/` carrega os livros para as telas.
- `src/utils/` reúne a validação de ISBN e os dados do formulário.
- `tests/` contém os testes da validação e da integração com os catálogos.
