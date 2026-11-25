Configuração das regras permanentes do projeto BookShelf

Crie um arquivo AGENTS.md na raiz do projeto contendo as regras abaixo. Estas instruções deverão ser respeitadas durante todo o desenvolvimento do BookShelf.

1. Sobre o projeto

BookShelf é uma biblioteca pessoal digital desenvolvida em React.

O sistema permitirá:

Cadastrar livros físicos por ISBN ou manualmente.
Consultar informações de livros através de APIs.
Importar e organizar arquivos PDF, EPUB e MOBI.
Personalizar capas e estantes.
Acompanhar o progresso de leitura.
Ler livros digitais dentro da própria aplicação.
Personalizar a experiência de leitura, incluindo tamanho da fonte no EPUB.
2. Regras obrigatórias de Git

Esta é uma regra inegociável: cada pequena alteração lógica concluída deve gerar seu próprio commit.

Nunca agrupe várias funcionalidades independentes em um único commit.

Procedimento obrigatório:

Identifique uma pequena tarefa.
Implemente somente essa tarefa.
Execute as verificações pertinentes.
Analise o diff completo.
Adicione ao stage somente os arquivos relacionados à tarefa.
Faça um commit individual.
Confira o resultado do commit.
Somente então inicie a próxima tarefa.

Não utilize git add . ou git add -A indiscriminadamente.

Não deixe várias alterações acumuladas para fazer um commit no final.

Não faça commits com funcionalidades incompletas ou que não passaram pelas verificações pertinentes.

Se uma tarefa precisar de várias pequenas alterações independentes, faça vários commits.

3. Padrão das mensagens

Utilize Conventional Commits com mensagens exclusivamente em português brasileiro.

Prefixos permitidos:

feat:
fix:
docs:
style:
refactor:
test:
chore:
perf:

Exemplos:

feat: adiciona cadastro manual de livros
fix: corrige validação do ISBN
docs: documenta integração com Google Books
chore: configura dependências do projeto

Mensagens curtas, objetivas e descritivas.

4. Autoria dos commits

Todos os commits devem ter exclusivamente a identidade Git do proprietário do repositório.

Regras obrigatórias:

Não adicionar Co-authored-by.
Não adicionar Signed-off-by.
Não adicionar trailers de coautoria.
Não mencionar Codex, ChatGPT ou outras ferramentas como autores.
Não adicionar créditos de colaboração nas mensagens dos commits.
Não alterar a identidade Git configurada sem autorização.

Antes de cada commit, verificar o nome e o e-mail configurados no Git.

Se a identidade estiver ausente ou incorreta, interromper e solicitar ao proprietário que configure os dados.

Não realizar commits com identidade inventada.

5. Segurança no Git
Não fazer push sem autorização explícita.
Não executar git commit --amend.
Não reescrever histórico.
Não executar git reset --hard.
Não excluir branches sem autorização.
Não sobrescrever alterações existentes do proprietário.
Não realizar merge sem verificar o estado das branches.
Não alterar configurações globais do Git.
6. GitFlow

Utilizar:

main: versão estável.
develop: integração do desenvolvimento.
feature/nome-da-funcionalidade: desenvolvimento de funcionalidades.
release/versao: preparação de versões.
hotfix/nome-da-correcao: correções urgentes em produção.

Criar branches feature a partir de develop e integrar as funcionalidades concluídas em develop.

7. Qualidade do código
Utilizar React com componentes funcionais e Hooks.
Preferir componentes pequenos e reutilizáveis.
Manter separação entre componentes, páginas, serviços e hooks.
Utilizar nomes claros e consistentes.
Evitar duplicação de código.
Tratar estados de carregamento, sucesso, vazio e erro.
Validar formulários.
Não deixar informações sensíveis no código.
Não inventar resultados de APIs.
Criar testes quando aplicável.
Manter a aplicação responsiva.
8. Forma de trabalho do Codex

Trabalhe de maneira incremental.

Não implemente uma etapa inteira em uma única alteração.

Divida o trabalho em pequenas tarefas independentes, faça um commit para cada uma e informe:

O que foi implementado.
Quais arquivos foram alterados.
Quais testes foram executados.
Qual commit foi criado.

Ao encontrar problemas, resolva-os em commits separados quando forem alterações independentes.

Se houver dúvida sobre uma decisão arquitetural importante, pergunte antes de implementar.

Estas regras são obrigatórias durante todo o desenvolvimento do BookShelf.