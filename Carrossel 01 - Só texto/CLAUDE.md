# CLAUDE.md — Carrosséis Mentoria Marca com Essência©

> Este arquivo é lido automaticamente pelo Claude Code no início de cada sessão.
> Ele contém TODO o contexto necessário para criar, editar e entregar os
> carrosséis. Você não precisa repetir nada — só dizer o que quer.

---

## 1. O projeto

- **Autora / cliente:** Kelly Albert
- **Produto:** Mentoria Marca com Essência©
- **Peça:** carrosséis para Instagram (feed 4:5)
- **Idioma:** português (pt-br)
- **Landing de referência:** kellyalbert.com.br/mentoria
- **Tom:** estratégico, provocativo e elegante. Minúsculas no corpo;
  **negrito** para a revelação/ponto de cada frase; *itálico serifado* para
  conceitos-chave. Sem emojis, sem gradientes, sem ícones genéricos.

Hoje existem **2 carrosséis**:
1. **Manifesto de lançamento** (`data.js`) — 10 cards, mais provocativo.
2. **Apresentando a Mentoria** (`data-apresentacao.js`) — 10 cards, didático/conversão.

---

## 2. Identidade visual

### Paleta (PALETTE em `cards-core.jsx`)
```
navy   #152535   fundo escuro principal
copper #C47830   acento / fundo quente
cream  #f6f5f0   fundo claro principal  ← tom claro oficial
warm   #F7F3EA   alternativa creme
steel  #3D6B7E   apoio frio
ink    #2D2D2D   texto neutro
```

### Temas de card (combinações fixas)
- **cream:** fundo cream, texto navy, acento copper
- **navy:** fundo navy, texto cream, acento copper
- **copper:** fundo copper, texto cream, acento navy

### Tipografia (Google Fonts, carregadas no `<head>`)
```css
--serif:  'Playfair Display', Georgia, serif;   /* títulos e itálicos conceituais */
--sans:   'Montserrat', system-ui, sans-serif;  /* corpo / UI (300–700) */
--script: 'Mrs Saint Delafield', cursive;       /* assinaturas decorativas */
```
Alternativas de serifa via painel Tweaks: Fraunces, Cormorant Garamond, DM Serif Display.
Alternativas de script: Petit Formal Script, Sacramento, Allura.

### Formato
- **Dimensões:** 1080 × 1350 px (4:5)
- **Padding interno:** 120 (Y) × 110 (X). Rodapé reservado: 200 px.
- **Assinatura no rodapé:** logo Kelly Albert (wordmark, 180 px) ou monograma KA
  (62 px), versão `cream` ou `navy` conforme o fundo. Campo `signature: "kelly" | "ka"`.

### Helpers de texto (`cards-core.jsx`)
- `<Bold>` → peso 700
- `<Italic>` → itálico em serifa
- `<Accent>` → cor `--accent` do tema
- `withTightCopyright(texto)` → renderiza o `©` menor e colado (ex.: "Essência©")

### Regra de layout
Cada card tem um `kind` (layout visual) **único** — nenhum se repete, nem dentro
do carrossel nem entre os dois. Cada kind exige um renderer próprio.

---

## 3. Arquitetura de arquivos

```
index.html             shell + fontes + montagem dos scripts + seletor de aba
data.js                conteúdo do carrossel 1 (window.CAROUSEL)
data-apresentacao.js   conteúdo do carrossel 2 (window.CAROUSEL_APRESENTACAO)
cards-core.jsx         PALETTE, THEMES, CardFrame, helpers, window.Cards
cards-extra.jsx        renderers dos 10 kinds do carrossel 1
cards-apresentacao.jsx renderers dos 10 kinds do carrossel 2
main.jsx               App, ScaledCard, grid, seletor de carrossel, Tweaks
tweaks-panel.jsx       painel de Tweaks (tipografia)
apresentacao.html      ENTREGÁVEL: arquivo único autocontido do carrossel 2
assets/                logos: ka-logo-{cream,navy}.png, kelly-albert-{cream,navy}.png
ESPECIFICACOES.md      spec original do carrossel 1
```

**Como funciona:** React + Babel rodam no browser (CDN). Os `.jsx` são
transformados na hora. O `main.jsx` monta uma grid de cards escalados (~340 px),
com clique para abrir em fullscreen. O seletor de aba alterna entre os carrosséis
(estado persistido no hash da URL: `#manifesto` / `#apresentacao`).

Para adicionar um carrossel ao `main.jsx`, ele lê do array `CAROUSELS`:
```js
const CAROUSELS = [
  { id: "manifesto",    label: "Manifesto de lançamento", data: window.CAROUSEL },
  { id: "apresentacao", label: "Apresentando a Mentoria",  data: window.CAROUSEL_APRESENTACAO },
].filter(c => c.data);
```

---

## 4. Catálogo de kinds (layouts já existentes)

### Carrossel 1 — Manifesto (`cards-extra.jsx`)
| kind | bg | descrição |
|------|----|-----------|
| `capa-palavra` | cream | palavra-chave entre linhas + subtítulo |
| `pergunta-loop` | cream | pergunta provocativa com loop SVG |
| `texto-esquerda-oval` | cream | comparativo + frase final em oval |
| `constelacao` | navy | pills conectadas por linhas/dots |
| `mitos-caixas` | navy | 3 mitos em caixas + revelação |
| `alvo` | copper | círculos concêntricos (mercado→essência) |
| `oval-grande` | cream | frase em oval grande + corpo |
| `promessa-lista` | cream | lista numerada de promessas |
| `para-voce` | cream | qualificador + 4 itens |
| `anuncio-mentoria` | navy | anúncio oficial: datas, inclui, preço, CTA |

### Carrossel 2 — Apresentação (`cards-apresentacao.jsx`)
| kind | bg | descrição |
|------|----|-----------|
| `capa-contraste` | cream | duas frases em contraste, divisor com dot |
| `diagnostico-duplo` | cream | ≠ (riscado) vs → (destaque) + explicação |
| `anafora-copia` | navy | 3 linhas anafóricas com barra lateral |
| `essencia-bloco` | copper | negação riscada + afirmação + qualificadores |
| `voz-autora` | cream | abertura + pull-quote com barra + fechamento |
| `consequencias-cascata` | navy | lista que escorre para a direita |
| `reconhecimento` | cream | pergunta-empatia + admissões + revelação |
| `explicar-anafora` | cream | lista "explicar X" com marcadores circulares |
| `mentoria-organiza` | navy | título + lista temática em 2 colunas |
| `cta-bio` | copper | gancho + data-herói + botão pill + bio (campo `vagas` opcional) |

---

## 5. Conteúdo atual — Carrossel 2 (Apresentando a Mentoria)

1. **Capa:** "a sua empresa não parece pequena pelo que **entrega.** / parece pequena pela forma como a *marca se apresenta.*"
2. **Diagnóstico:** "muitas empresas não têm problema de **qualidade.** / elas têm problema de *clareza.* / ou seja: são boas, entregam bem, mas não conseguem mostrar isso de um jeito simples."
3. **Cópia:** "quando a marca não sabe bem quem ela é, começa a copiar os outros. / copia o jeito de falar / vender / aparecer. / e, sem perceber, começa a parecer *igual a todo mundo.*"
4. **Essência:** "~~marca forte não nasce de cópia~~ / marca forte nasce da *essência.* / daquilo que só a sua marca tem · do jeito dela pensar · entregar · existir."
5. **Voz autora:** "depois de mais de 20 anos trabalhando com marcas, eu entendi uma coisa: / 'não existe marca forte sem *verdade.*' / e essa verdade começa nas pessoas que criaram a empresa."
6. **Consequências:** "quando essa verdade não está clara: comunicação confusa, posicionamento fraco, diferenciais não aparecem, presença digital sem direção / e o mercado **não entende o real valor** da empresa."
7. **Reconhecimento:** "talvez seja isso que esteja acontecendo com a *sua marca.* / pode ser boa · entregar muito · ter experiência / mas ainda não conseguir mostrar isso **com clareza.**"
8. **Explicar:** "e aí alguém precisa explicar tudo o tempo inteiro: o valor, o diferencial, por que é diferente, por que o preço faz sentido. / *e isso cansa.*"
9. **A Mentoria:** "na mentoria marca com essência© / vamos organizar a **Base Estratégica da Sua Marca.** / quem ela é · o que entrega · por que é diferente · como se comunica · como se posiciona · como ser percebida com mais valor."
10. **CTA:** "inscrições abertas · 2ª turma / as inscrições para a *segunda turma* da Mentoria Marca com Essência© estão abertas. / início das aulas: **16 · maio · 2026** / [garanta sua vaga →] / clique abaixo ou no link da minha bio."

---

## 6. Dados da Mentoria (fonte de verdade do CTA)

- **Nome:** Mentoria Marca com Essência©
- **Turma atual:** 2ª turma — inscrições abertas
- **Início das aulas:** 16 de maio de 2026
- **Inclui:** Livro Marca com Essência© · 7 Agentes de IA exclusivos · Base Estratégica da Sua Marca
- **Encadeamento do método:** Essência dos fundadores → Cultura organizacional → Cultura da marca → Percepção → Posicionamento
- **Inscrições:** kellyalbert.com.br/mentoria (ou link na bio)

---

## 7. Como gerar o entregável (HTML único autocontido)

O `apresentacao.html` é um arquivo único que abre com duplo-clique (logos
embutidos em base64; React/Babel/fontes via CDN). Para regerar após editar
o conteúdo ou os renderers, há um script de build que:
1. lê `data-apresentacao.js` + `cards-core.jsx` + `cards-apresentacao.jsx`;
2. substitui os caminhos `assets/*.png` por data-URLs base64;
3. injeta um `main` mínimo (grid + zoom, sem seletor/Tweaks);
4. escreve `apresentacao.html`.

Peça: **"regera o apresentacao.html"** e o assistente reconstrói e valida
(Playwright headless) que os 10 cards renderizam sem erro.

---

## 8. Como criar um carrossel novo (fluxo padrão)

1. **Roteiro:** receber os slides em texto (1 ideia por card).
2. **Dados:** criar `data-<nome>.js` com `window.CAROUSEL_<NOME>`, um objeto por
   card com `kind`, `bg`, `align`, `signature` e os campos de texto.
3. **Kinds:** reusar kinds existentes quando o layout encaixar; senão criar
   renderers novos em `cards-<nome>.jsx` e registrar via
   `Object.assign(window.Cards.renderers, { ... })`. Nomes de kind únicos.
4. **Montagem:** adicionar `<script>` no `index.html` e a entrada no array
   `CAROUSELS` do `main.jsx`.
5. **Entrega:** gerar o HTML único autocontido e validar visualmente.

---

## 9. Regras de copy (resumo)

- Corpo em **minúsculas**; maiúsculas só em nomes próprios e no CTA/anúncio.
- **Negrito (700)** = a revelação / o "ponto" da frase.
- *Itálico serifado* = conceito central (ex.: *essência, verdade, clareza*).
- "©" sempre tight (helper `withTightCopyright`) após "Essência".
- Frases curtas, ritmo de manifesto. Sem emojis.
