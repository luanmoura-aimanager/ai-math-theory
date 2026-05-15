# ai-math-theory — setup local

MVP do site descrito em `../website_plan.md`. **Escopo atual:** plataforma
de leitura sem login e sem banco — progresso fica salvo no `localStorage` do
navegador. Auth + DB voltam quando o site tiver leitores reais (ver
`CLAUDE.md §8`).

## Pré-requisitos

- Node 20+ (recomendado: 22 LTS via `nvm`).
- `npm` (já vem com Node). Você também pode usar `pnpm` se preferir; o
  `package.json` aceita os dois.

## Rodar pela primeira vez

```bash
cd ai-math-theory
npm install
npm run dev
```

Abra <http://localhost:3000>. Você deve ver:

- Header com título "AI / ML Theory".
- Sidebar à esquerda com Capítulo 0 e duas sessões demo.
- Landing centralizada com link para a primeira sessão.
- Cada sessão renderiza prosa textbook + equações KaTeX (incluindo as caixas
  `\boxed{...}` da derivação do produto interno e da regra de backprop).
- Botão **Marcar como concluída** ao final de cada sessão. O ✓ aparece na
  sidebar e **persiste no `localStorage`** — fechar e reabrir a aba mantém
  o estado. Limpar dados do navegador zera.

## Build de produção

```bash
npm run build
npm run start
```

O build pré-renderiza todas as sessões via `generateStaticParams`. Adicionar
um novo `.mdx` em `content/<chapter>/` é suficiente — a página aparece na
sidebar e ganha rota própria no próximo build.

## Estrutura

```
ai-math-theory/
├── content/                            # Conteúdo de estudo (Cowork edita)
│   ├── chapters.json
│   └── ch0-math-foundations/
│       ├── 0.1-vector-spaces.mdx
│       └── 0.2-matrix-calculus.mdx
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # shell global (header + sidebar + main)
│   │   ├── page.tsx                    # landing
│   │   ├── globals.css                 # tokens + tipografia .prose-textbook
│   │   └── session/[...slug]/page.tsx  # rota dinâmica para cada .mdx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx                 # árvore + checkmarks
│   │   ├── ProgressProvider.tsx        # contexto + localStorage
│   │   ├── MarkCompleteButton.tsx
│   │   └── mdx/                        # Aside, SelfTest, Figure
│   ├── lib/content.ts                  # leitor da árvore /content
│   └── mdx-components.tsx              # registra os componentes MDX
├── next.config.ts                      # MDX + remark-math + rehype-katex
└── package.json
```

## Fluxo de trabalho com os agentes

- **Cowork** escreve as sessões `.mdx` em `content/`. Você abre o Cowork
  com a tese e o roadmap carregados pra puxar conteúdo novo.
- **Claude Code** mexe no resto (componentes, estilo, libs, deploy futuro).
  Abra `claude` dentro de `ai-math-theory/` e ele lê o `CLAUDE.md`
  automaticamente.
- Os dois compartilham o filesystem e usam `CLAUDE.md` + `website_plan.md`
  como contrato.

## Quando voltar a ter login + sync entre dispositivos

Veja `CLAUDE.md §8`. Resumo: re-habilitar Phases C/D/F/G do `website_plan.md`
(Prisma + Postgres + Auth.js + Vercel). O contrato de `useProgress()` foi
desenhado pra essa migração ser localizada.
