# BookShelf

Biblioteca pessoal em React, JavaScript e Vite, com uma estante para livros físicos e outra para arquivos PDF, EPUB e MOBI.

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

## Estante digital

1. Em **Importar arquivo**, selecione um ou mais arquivos ou arraste-os para a área de importação. São aceitos PDF, EPUB e MOBI com até 100 MB por arquivo.
2. Revise os dados extraídos, preencha o título ou o autor quando faltarem e ajuste gênero, descrição, status e capa. A capa aceita JPEG, PNG, WebP ou GIF de até 5 MB. Salve cada livro que deseja manter.
3. Na **Estante digital**, pesquise por título ou autor e combine filtros de formato, gênero e status. Abra um título para ver detalhes, editar, baixar o arquivo original ou excluir o livro.

A importação verifica a extensão, o tipo informado pelo navegador quando é específico e a estrutura do arquivo. Os arquivos de conteúdo idêntico são identificados por SHA-256, mesmo se forem renomeados. A extração preenche os campos disponíveis e pode ser limitada em arquivos protegidos ou sem metadados. A leitura dentro da aplicação está prevista para uma etapa posterior.

Os livros digitais ficam em um banco IndexedDB separado da estante física. A gravação reúne os dados, a capa e o arquivo original em uma transação. Para recuperar a estante após reiniciar, use o mesmo perfil do navegador e a mesma origem, incluindo a porta. A disponibilidade depende da cota e das políticas do navegador. Limpar dados do site ou encerrar uma sessão privada pode remover os arquivos. Use **Baixar original** se precisar manter uma cópia fora do navegador.

## Estantes personalizadas e aparência

- Em **Estantes**, crie uma coleção com nome, descrição e cor. Use **Subir** ou **Descer** para mudar sua posição. Excluir uma estante libera seus vínculos e preserva os livros nas bibliotecas de origem.
- Em **Organizar livros**, selecione um livro físico ou digital e a estante de destino. Cada livro pertence a uma estante personalizada por vez. Escolha **Sem estante personalizada** para retirar o vínculo. Os rótulos **Físico**, **PDF**, **EPUB** e **MOBI** identificam os itens.
- Use **Modo de exibição** para alternar entre **Prateleiras visuais** e **Grade de capas**. A escolha vale para as estantes física, digital e personalizadas.
- Em **Aparência**, selecione o tema claro, escuro ou sépia, personalize a cor de destaque, ajuste a densidade das capas e escolha se os autores aparecem nas estantes. A cor de destaque pode ser ajustada visualmente para manter o contraste no tema escolhido.

As estantes, sua ordem e os vínculos são gravados no IndexedDB. As preferências de aparência ficam no armazenamento local do navegador. Ambos são acessados por serviços próprios, com dados separados dos cadastros e arquivos. As preferências e estantes podem ser recuperadas no mesmo perfil e endereço da aplicação.

## Acompanhamento de leitura

- Altere o status para **Quero ler**, **Lendo** ou **Lido** pelo card ou pelos detalhes de um livro físico ou digital.
- Nos detalhes, salve as datas de início e conclusão, a avaliação de 1 a 5, observações e o progresso de 0 a 100%. Marcar como **Lido** ou salvar 100% em **Lendo** registra a conclusão. Voltar para **Lendo** de um livro já concluído abre uma nova leitura e retira a conclusão anterior das estatísticas.
- Na **Visão geral**, acompanhe os totais, os livros em andamento, a lista de próximas leituras, as últimas inclusões e os gráficos. A meta do ano corrente pode ser definida e alterada no painel.
- O **Histórico de leitura** mostra os livros atualmente marcados como lidos, com datas e avaliações quando disponíveis. Livros antigos sem data de conclusão entram no total geral e no histórico. O gráfico mensal e a meta anual usam somente conclusões datadas do ano corrente.

Cada cadastro físico ou digital conta uma vez, mesmo quando aparece em uma estante personalizada. Os dados de leitura são gravados junto ao registro do livro no IndexedDB. A meta fica no armazenamento local do navegador, com uma chave por ano. O progresso dos livros digitais é registrado manualmente nesta etapa. O serviço de leitura aceita atualizações parciais para a futura integração com o leitor.

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
- `src/services/` integra os catálogos, analisa arquivos digitais e gerencia a persistência.
- `src/hooks/` carrega os livros para as telas.
- `src/utils/` reúne a validação de ISBN e os dados do formulário.
- `tests/` cobre a validação de ISBN, os catálogos, a validação de arquivos digitais, a persistência no IndexedDB as preferências de aparência e as regras e estatísticas de leitura.
