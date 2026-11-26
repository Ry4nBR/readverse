# Readverse

Readverse é um universo particular de leitura, desenvolvido em React, JavaScript e Vite, com estante para livros físicos, biblioteca para arquivos digitais (PDF, EPUB e MOBI), estantes personalizadas, acompanhamento de leitura e leitores integrados.

## Objetivo

Centralizar o controle de acervo pessoal (físico e digital) em uma aplicação web local-first, permitindo cadastrar livros por ISBN ou manualmente, importar e-books com persistência offline no navegador, acompanhar metas e histórico de leitura e ler arquivos EPUB e PDF diretamente na interface.

## Funcionalidades implementadas

- **Visão geral (Dashboard):** totais reais de livros físicos, digitais, lidos, em andamento e quero ler; meta anual; listas de leitura e gráficos por mês, gênero e formato.
- **Livros físicos:** consulta automática por ISBN-10 e ISBN-13, cadastro manual, upload de capa, edição, exclusão, busca e filtros por gênero e status.
- **Estante digital:** importação múltipla de PDF, EPUB e MOBI (até 100 MB), validação estrutural, detecção de duplicidade por SHA-256, extração de metadados, edição, download do original e exclusão.
- **Personalização:** criação, edição, exclusão e ordenação de estantes personalizadas; vínculo de livros físicos e digitais; alternância entre grade de capas e prateleiras visuais; temas claro, escuro e sépia; cor de destaque e densidade.
- **Acompanhamento de leitura:** status (*Quero ler*, *Lendo*, *Lido*), datas de início e conclusão, avaliação (1 a 5), observações, progresso percentual, meta anual e histórico.
- **Leitores digitais:** leitor EPUB (`epubjs`) com sumário, capítulos, marcadores, ajustes de fonte/entrelinha/margens/tema e tela cheia; leitor PDF (`react-pdf` / `pdfjs-dist`) com paginação, zoom, tela cheia e retomada de página.

## Tecnologias, bibliotecas e APIs

- **Base:** React `19.3.1`, React DOM `19.3.1`, Vite `8.3.8`, JavaScript (ES Modules), CSS Modules.
- **Roteamento:** `react-router-dom` `7.18.7`.
- **Ícones:** `lucide-react` `1.80.0`.
- **Leitores e arquivos:** `epubjs` `0.3.93`, `react-pdf` `11.1.0`, `pdfjs-dist` `6.5.438`, `@zip.js/zip.js` `2.25.0`.
- **Qualidade e testes:** ESLint `10.15.0`, `node --test`, `fake-indexeddb` `6.2.8`.
- **APIs externas:** [Google Books API](https://developers.google.com/books/docs/v1/using) e [Open Library API](https://openlibrary.org/developers/api) (para pesquisa por ISBN).
- **Armazenamento no navegador:** IndexedDB (`bookshelf`, `bookshelf-digital`, `bookshelf-organization`) e `localStorage` (preferências de aparência, modo de exibição, configurações do leitor e meta anual).

## Requisitos e execução localmente

Use Node.js (`^22.13.0` ou `>=24.0.0`, conforme `package.json`) e npm. Na raiz do repositório, execute:

```sh
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite no terminal (normalmente `http://localhost:5173`). No PowerShell, use `npm.cmd` se a política do sistema bloquear o script `npm.ps1`. Para configurar uma chave opcional da Google Books API, copie `.env.example` para `.env.local`.

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

A importação verifica a extensão, o tipo informado pelo navegador quando é específico e a estrutura do arquivo. Os arquivos de conteúdo idêntico são identificados por SHA-256, mesmo se forem renomeados. A extração preenche os campos disponíveis e pode ser limitada em arquivos protegidos ou sem metadados. Use **Ler agora** para abrir EPUB, PDF ou um EPUB vinculado a um MOBI.

Os livros digitais ficam em um banco IndexedDB separado da estante física. A gravação reúne os dados, a capa e o arquivo original em uma transação. Para recuperar a estante após reiniciar, use o mesmo perfil do navegador e a mesma origem, incluindo a porta. A disponibilidade depende da cota e das políticas do navegador. Limpar dados do site ou encerrar uma sessão privada pode remover os arquivos. Use **Baixar original** se precisar manter uma cópia fora do navegador.

## Estantes personalizadas e aparência

- Em **Estantes**, crie uma coleção com nome, descrição e cor. Use **Subir** ou **Descer** para mudar sua posição. Excluir uma estante libera seus vínculos e preserva os livros nas bibliotecas de origem.
- Em **Organizar livros**, selecione um livro físico ou digital e a estante de destino. Cada livro pertence a uma estante personalizada por vez. Escolha **Sem estante personalizada** para retirar o vínculo. Os rótulos **Físico**, **PDF**, **EPUB** e **MOBI** identificam os itens.
- Use **Modo de exibição** para alternar entre **Prateleiras visuais** e **Grade de capas**. A escolha vale para as estantes física, digital e personalizadas.
- Em **Aparência**, selecione o tema claro, escuro ou sépia, personalize a cor de destaque, ajuste a densidade das capas e escolha se os autores aparecem nas estantes. A cor de destaque pode ser ajustada visualmente para manter o contraste no tema escolhido.

As estantes, sua ordem e os vínculos são gravados no IndexedDB. As preferências de aparência ficam no armazenamento local do navegador. Ambos são acessados por serviços próprios, com dados separados dos cadastros e arquivos. As preferências e estantes podem ser recuperadas no mesmo perfil e endereço da aplicação.

## Acompanhamento de leitura

- Altere o status para **Quero ler**, **Lendo** ou **Lido** pelo card ou pelos detalhes de um livro físico ou digital.
- Nos detalhes, salve as datas de início e conclusão, a avaliação de 1 a 5, observações e o progresso de 0 a 100%. Marcar como **Lido** ou salvar 100% em **Lendo** registra a conclusão. Voltar para **Lendo** de um livro já concluído zera o progresso e retira a conclusão anterior das estatísticas.
- Na **Visão geral**, acompanhe os totais, os livros em andamento, a lista de próximas leituras, as últimas inclusões e os gráficos. A meta do ano corrente pode ser definida e alterada no painel.
- O **Histórico de leitura** mostra os livros atualmente marcados como lidos, com datas e avaliações quando disponíveis. Livros antigos sem data de conclusão entram no total geral e no histórico. O gráfico mensal e a meta anual usam somente conclusões datadas do ano corrente.

Cada cadastro físico ou digital conta uma vez, mesmo quando aparece em uma estante personalizada. Os dados de leitura são gravados junto ao registro do livro no IndexedDB. A meta fica no armazenamento local do navegador, com uma chave por ano. Para livros digitais, os detalhes aceitam ajustes manuais e o leitor também atualiza o acompanhamento.

## Leitura digital

- Abra um livro da estante digital com **Ler agora**. O leitor carrega o arquivo do IndexedDB e retoma a última posição no mesmo navegador e endereço.
- **EPUB** usa epub.js. Você pode navegar por páginas, capítulos e sumário quando disponível, guardar marcadores favoritos e ajustar tamanho da fonte, família, entrelinha, margens e tema. As preferências do leitor são guardadas no navegador e aplicadas ao conteúdo do livro. Publicações de layout fixo preservam sua composição, e conteúdo externo ou dependente de scripts pode ficar indisponível.
- **PDF** usa React-PDF e PDF.js. Você pode avançar e voltar, consultar o total de páginas, ajustar o zoom e retomar a última página. PDFs que exigem senha exibem um aviso.
- Os dois leitores oferecem **Tela cheia**. Abrir uma página válida inicia a leitura. A posição é salva mesmo ao voltar páginas, enquanto o percentual indica o maior avanço registrado. Use **Concluir leitura** e confirme para marcar como lido. Chegar à última página mantém o progresso em até 99% até a confirmação.

### Ler um livro MOBI

O navegador não converte MOBI nesta versão. Baixe o original nos detalhes, converta um arquivo sem DRM fora do navegador com o [Calibre](https://manual.calibre-ebook.com/generated/en/ebook-convert.html) e selecione a versão em **Vincular EPUB convertido** no mesmo cadastro:

```sh
ebook-convert "livro.mobi" "livro.epub"
```

A biblioteca valida e armazena o EPUB ao lado do MOBI, preservando o original para download e usando o mesmo registro de leitura. Calibre também pode gerar HTML, mas o EPUB mantém a navegação e os recursos de leitura integrados. Bibliotecas como [Foliate JS](https://github.com/johnfactotum/foliate-js) são outra opção para uma futura leitura direta no navegador.

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
- `tests/` cobre a validação de ISBN, os catálogos, a validação de arquivos digitais, a persistência no IndexedDB, as preferências de aparência e as regras e estatísticas de leitura.

## Conceitos React aplicados

### React State e `useState`
O estado local controla filtros, formulários, carregamento, erros e preferências de leitura. Em `src/pages/PhysicalShelfPage.jsx`, os filtros de busca são mantidos com `useState`:

```jsx
const [query, setQuery] = useState('')
const [genre, setGenre] = useState('')
const [status, setStatus] = useState('')
```

### `useEffect`
O hook `useEffect` sincroniza efeitos colaterais com o ciclo de vida dos componentes, como carregamento assíncrono do IndexedDB, listeners de tela cheia e inicialização do leitor EPUB, sempre com função de limpeza. Em `src/pages/DigitalReaderPage.jsx`:

```jsx
useEffect(() => {
  let active = true
  openReaderFile(id).then((data) => { if (active) setResult(data) }, (error) => {
    if (active) setResult({ error: error.message })
  })
  return () => { active = false }
}, [id])
```

### Formulários
Os formulários utilizam componentes controlados, validação antes do envio e bloqueio durante operações assíncronas. Em `src/components/PhysicalBookForm.jsx`, `update` atualiza o estado de cada campo e `submit` valida com `validateBookForm(book)` antes de chamar `onSave(normalized)`:

```jsx
const message = validateBookForm(book)
if (message) {
  setError(message)
  return
}
```

### Consumo de APIs
As consultas externas usam `fetch` com `AbortSignal` para cancelamento e tempo limite, tratando respostas inválidas e indisponibilidade. Em `src/services/bookLookup.js`, `lookupBook` consulta a Google Books API e recorre à Open Library API quando necessário:

```js
const response = await fetch(url, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout })
if (!response.ok) throw new Error('O catálogo respondeu com HTTP ' + response.status)
```

### React Router DOM
A aplicação envolve `AppRoutes` em `BrowserRouter` (`src/main.jsx`) e define rotas aninhadas com `Routes` e `Route` em `src/routes/AppRoutes.jsx`, usando rotas dinâmicas (`biblioteca/:bookId`, `biblioteca-digital/:bookId/ler`), `NavLink` na barra lateral (`src/components/Sidebar.jsx`) e hooks como `useParams` e `useNavigate` nas páginas:

```jsx
<Routes>
  <Route path="biblioteca-digital/:bookId/ler" element={<DigitalReaderPage />} />
  <Route element={<LibraryLayout />}>
    <Route index element={<DashboardPage />} />
    <Route path="biblioteca" element={<PhysicalShelfPage />} />
    <Route path="biblioteca/:bookId" element={<PhysicalBookDetailsPage />} />
  </Route>
</Routes>
```

## Limitações conhecidas

- **Leitura direta de MOBI:** o navegador valida e extrai metadados do MOBI, mas não converte nem renderiza o formato diretamente; é necessário converter para EPUB externamente (ex.: Calibre) e vincular o arquivo convertido no cadastro.
- **Armazenamento local:** os dados e arquivos ficam no IndexedDB e `localStorage` do navegador/origem atual; limpar dados do site ou usar navegação privada remove a biblioteca local.
- **Versão do Node.js:** o build (`vite 8`), o linter (`eslint 10`) e as suítes de teste que usam `File`, `crypto.subtle`, `structuredClone` e `AbortSignal.any` exigem Node.js `^22.13.0` ou `>=24.0.0`.

## Autoria

Desenvolvido por **Ry4nBR** (`amorim2002ryan@gmail.com`) como projeto acadêmico em React.
