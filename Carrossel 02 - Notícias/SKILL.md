---
name: carrossel-noticias
description: Cria carrosséis de análise de notícias/comentários para o Instagram da KA (Kelly Albert | Inteligência para Marcas). Use quando o usuário pedir carrossel com comentários reais, carrossel de análise de caso, carrossel editorial, carrossel sobre polêmica, carrossel com prints de comentários, ou qualquer variação de "cria um carrossel analisando [notícia/polêmica]". Este formato usa screenshots de comentários reais do Instagram como prova, com análise da Kelly conectando ao posicionamento. Entrega em HTML com cards no tamanho do celular, um embaixo do outro.
---

# Carrossel Notícias / Análise de Comentários — Skill de Produção

Gera carrosséis editoriais que analisam notícias e polêmicas de marca usando comentários reais como evidência.

## Formato de entrega

- SEMPRE arquivo **HTML** em `/mnt/user-data/outputs/`
- Cards com **270x338px** (proporção 4:5)
- Cards **um embaixo do outro** (flex-direction: column)
- Fundo da página: `#000`

### Layout padrão (todos os cards)

- **Conteúdo centralizado verticalmente** no card — nunca preso só no cabeçalho nem só no rodapé. O card é uma coluna flex com `justify-content:center`.
- **Header da autora** no topo, idêntico em todos os cards: foto redonda da Kelly (`assets/kelly-avatar.jpg`) + duas linhas ao lado — `KELLY ALBERT` (Montserrat 600, CAIXA ALTA) na primeira e `@kellyalbert.brand` (Montserrat 300) na segunda.
- **Sem numeração de card** — NÃO usar paginação "N / 10" em canto nenhum.
- **Imagem com tamanho variável** — o print/imagem pode aparecer **pequeno** (faixa fina, ~70–90px) ou **grande** (ocupando até ~metade do card). Varie conforme a força da prova; não é tamanho fixo.
- Bloco principal (dado, análise, comentário, frase) ocupa o **centro** do card.

```css
body{background:#000;display:flex;flex-direction:column;gap:20px;padding:20px;align-items:center}
.card{width:270px;height:338px;border-radius:10px;position:relative;overflow:hidden;flex-shrink:0;
  display:flex;flex-direction:column;padding:18px}
.card .content{flex:1;display:flex;flex-direction:column;justify-content:center} /* conteúdo no meio */
```

## Inputs necessários

1. **Notícia/polêmica**: o que aconteceu (ex: "nova camisa da Seleção", "polêmica BYD")
2. **Dados**: números impactantes com fonte (ex: "75% rejeição — FGV")
3. **Comentários reais**: prints ou textos de comentários do Instagram (o usuário envia os screenshots)
4. **Análise da Kelly**: pode ser fornecida ou gerada pelo Claude no tom da KA

## Paleta

```
Azul Claro:     #7EA8B3    Azul Marinho:   #152535
Azul Médio:     #5B8D9B    Creme Papel:    #EDE8DD
Azul Escuro:    #3D6B7E    Canela:         #CC8855
Cobre Luminoso: #DCAA7A
```

## Fontes (mesmas do Carrossel 01)

```
Playfair Display 400/900 + Italic — títulos, grifado, dados grandes, conceitos
Montserrat 300-400                — corpo, análise, handle
Montserrat 500-600 (CAIXA ALTA)   — labels, fonte dos dados, "KELLY ALBERT"
Mrs Saint Delafield               — assinatura decorativa (opcional)
```

Carregar via Google Fonts: `Playfair Display`, `Montserrat`, `Mrs Saint Delafield`.

## Estrutura dos 10 cards

### Card 1 — Hook com dado impactante
- Fundo: Creme #EDE8DD + estampa grid
- Avatar + nome + handle no topo
- Dados em destaque: número grande em Playfair Display 900
- Fonte do dado em Montserrat 600 caixa alta (ex: "PESQUISA FGV 2026")
- Imagem/print da notícia na parte inferior (border-radius 6px)
- Grifado em Azul Escuro

### Card 2 — Contexto
- Fundo: Azul Marinho #152535 + estampa grid
- Texto puro, sem imagem
- Introduz a análise da Kelly
- Conecta os dados do card 1 com o que vem depois
- Grifado em Canela #CC8855

### Cards 3-7 — Comentários reais + análise
- **Alternância Creme ↔ Azul Marinho**
- Cada card tem:
  - **Topo**: análise da Kelly (2-3 frases em Montserrat 300, 13-14px)
  - **Embaixo**: screenshot do comentário real (border-radius 6px)
- A análise vem ANTES da imagem (texto primeiro, prova depois)
- Uma cor de destaque por card:
  - Creme usa Azul Escuro #3D6B7E
  - Marinho usa Canela #CC8855 ou Cobre Luminoso #DCAA7A
- **Escrita do corpo herdada do Carrossel 01** (ver "Regras de copy" abaixo): minúsculas, **negrito (Montserrat 700)** na revelação/ponto, *itálico serifado (Playfair)* no conceito-chave — em minúsculas, sem inicial maiúscula.
- NUNCA julgar o comentarista. SEMPRE extrair o insight estratégico

### Regras da análise dos comentários

A análise da Kelly:
- É curta (2-3 frases)
- Vai direto ao ponto
- Conecta a reação emocional do público a um conceito de posicionamento
- NUNCA julga a pessoa que comentou
- SEMPRE extrai o insight por trás da emoção
- Tom: autoridade tranquila, provocação inteligente

Exemplos de análise (no estilo de escrita do Carrossel 01 — minúsculas, *itálico* no conceito, **negrito** na revelação):
- "quando o público usa a palavra 'horrores', não está falando de estética. está falando de *traição* a algo que considera **seu.**"
- "'este povo que aprovou.' o erro não é da designer. é de quem **aprovou.** é erro de *gestão de marca.*"

### Regras de copy (corpo) — herdadas do Carrossel 01

- Corpo em **minúsculas**; maiúsculas só em nomes próprios e no CTA/anúncio (e em `KELLY ALBERT`).
- **Negrito (Montserrat 700)** = a revelação / o "ponto" da frase.
- *Itálico serifado (Playfair Display)* = conceito central (ex.: *essência, verdade, pertencimento, memória*).
- "©" sempre colado após "Essência" (ex.: "Essência©").
- Frases curtas, ritmo de manifesto. Sem emojis.

### Cards 8-9 — Síntese e lição
- Texto puro, sem imagem
- Tamanho do texto levemente menor
- Card 8: sintetiza o padrão encontrado nos comentários
- Card 9: conecta com o universo do seguidor ("isso acontece com marcas de todos os tamanhos")
- Alternância Creme ↔ Marinho mantida

### Card 10 — CTA
- Fundo: Azul Escuro #3D6B7E + estampa grid
- Avatar + nome + handle (brancos)
- Playfair 900: frase conectando o tema ao Livro
- "Livro Marca com Essência©" em Playfair Itálico + Cobre Luminoso
- Botão pill "LINK NA BIO" em Montserrat 600, fundo Azul Marinho

## Como processar screenshots de comentários

Se o usuário enviar screenshots:
```python
from PIL import Image
import base64, io

img = Image.open(path).convert("RGB")
w, h = img.size
if w > 500:
    ratio = 500 / w
    img = img.resize((500, int(h * ratio)), Image.LANCZOS)
buf = io.BytesIO()
img.save(buf, format="JPEG", quality=75)
b64 = base64.b64encode(buf.getvalue()).decode()
```

Se não enviar screenshots, simular o comentário em CSS:
```html
<div style="background:#FFF;border-radius:6px;padding:8px;margin-top:8px">
  <div style="font-size:8px;font-weight:600;color:#262626">@usuario_real</div>
  <div style="font-size:8px;color:#262626;margin-top:2px">Texto do comentário aqui...</div>
</div>
```

## Regras visuais

1. **Foto da Kelly** (`assets/kelly-avatar.jpg`, círculo) + `KELLY ALBERT` / `@kellyalbert.brand` em cada card
2. **`KELLY ALBERT` sempre em CAIXA ALTA** (Montserrat 600, letter-spacing); handle `@kellyalbert.brand` em Montserrat 300
3. **Conteúdo centralizado verticalmente** no card (ver Layout padrão)
4. Sem logo, sem assinatura no rodapé
5. Alternância Creme ↔ Azul Marinho, CTA em Azul Escuro
6. **Estampa de fundo suave** — linhas/dots de baixíssima opacidade (~3–5%), nunca marcante; nunca liso
7. Texto da análise ANTES do screenshot (nunca imagem em cima)
8. Screenshots com border-radius 6px
9. Uma cor de destaque por card
10. Escrita do corpo no estilo do Carrossel 01: minúsculas; **negrito Montserrat 700** na revelação; *itálico serifado Playfair* no conceito (sem inicial maiúscula)
11. Texto alinhado à esquerda
12. NUNCA label "OPINIÃO FORTE"
13. NUNCA julgar o comentarista
14. NUNCA falar mal da marca/designer analisado

## NUNCA fazer

- NUNCA entregar fora de HTML
- NUNCA cards lado a lado
- NUNCA imagem antes do texto
- NUNCA sem avatar
- NUNCA fundo liso
- NUNCA julgar quem comentou
- NUNCA falar mal de marcas/designers
- NUNCA preto puro como fundo
- NUNCA label "OPINIÃO FORTE"
- NUNCA inventar dados sem fonte
