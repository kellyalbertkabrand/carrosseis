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

```css
body{background:#000;display:flex;flex-direction:column;gap:20px;padding:20px;align-items:center}
.card{width:270px;height:338px;border-radius:10px;position:relative;overflow:hidden;flex-shrink:0}
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

## Fontes

```
Playfair Display 900/Italic — títulos, grifado, dados grandes
IBM Plex Serif 300-400      — corpo, análise
IBM Plex Serif 100          — números grandes
IBM Plex Mono 500           — labels, fonte dos dados, paginação
IBM Plex Mono 300           — handle
```

## Estrutura dos 10 cards

### Card 1 — Hook com dado impactante
- Fundo: Creme #EDE8DD + estampa grid
- Avatar + nome + handle no topo
- Dados em destaque: número grande em Playfair 900 ou Plex Serif Thin 100
- Fonte do dado em Plex Mono 500 caixa alta (ex: "PESQUISA FGV 2026")
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
  - **Topo**: análise da Kelly (2-3 frases em Plex Serif, 13-14px)
  - **Embaixo**: screenshot do comentário real (border-radius 6px)
- A análise vem ANTES da imagem (texto primeiro, prova depois)
- Uma cor de destaque por card:
  - Creme usa Azul Escuro #3D6B7E
  - Marinho usa Canela #CC8855 ou Cobre Luminoso #DCAA7A
- Grifado em Playfair Itálico + cor + Inicial Maiúscula
- NUNCA julgar o comentarista. SEMPRE extrair o insight estratégico

### Regras da análise dos comentários

A análise da Kelly:
- É curta (2-3 frases)
- Vai direto ao ponto
- Conecta a reação emocional do público a um conceito de posicionamento
- NUNCA julga a pessoa que comentou
- SEMPRE extrai o insight por trás da emoção
- Tom: autoridade tranquila, provocação inteligente

Exemplos de análise:
- "Quando o público usa a palavra 'horrores', não está falando de estética. Está falando de *Traição* a algo que ele considera seu."
- "'Este povo que aprovou.' O público entendeu: o erro não é da designer. É de quem *Aprovou.* É erro de gestão de marca."

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
- Botão pill "LINK NA BIO" em Plex Mono 500, fundo Azul Marinho
- "10 / 10"

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

1. Avatar + nome + handle em cada card
2. Sem logo, sem assinatura no rodapé
3. Alternância Creme ↔ Azul Marinho, CTA em Azul Escuro
4. Estampa em todo fundo (nunca liso)
5. Texto da análise ANTES do screenshot (nunca imagem em cima)
6. Screenshots com border-radius 6px
7. Uma cor de destaque por card
8. Grifado: Playfair 900 Itálico + Inicial Maiúscula
9. Texto alinhado à esquerda
10. NUNCA label "OPINIÃO FORTE"
11. NUNCA julgar o comentarista
12. NUNCA falar mal da marca/designer analisado

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
