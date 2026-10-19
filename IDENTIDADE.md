# 🔒 IDENTIDADE E REGRAS FIXAS — 123 Quadros / Site de Quadros

> **ESTE ARQUIVO É A FONTE DE VERDADE DO PROJETO.**
> As informações marcadas com 🔒 **NUNCA podem ser alteradas, apagadas ou substituídas**
> sem aprovação explícita da cliente. Qualquer alteração de identidade visual, cores,
> tipografia, logo ou textos-chave deve ser primeiro atualizada aqui e depois no site.
>
> **Como usar:** 🔒 = travado · ⏳ = a confirmar com o catálogo (PDF) da cliente

---

## 1. 📁 Arquivos de marca (logo)

| Item | Caminho | Regra |
|---|---|---|
| Logo oficial (uso no site) | `imagens/logo/logo.jpg` | 🔒 Único arquivo usado no site (1792 × 2400 px — upscale feito pelo cliente em 18/10/2026). **Nunca** substituir por ícone, emoji ou texto. |
| Logo original (backup, não usar no site) | `imagens/logo/WhatsApp Image 2026-10-17 at 18.50.50.jpeg` | 🔒 Nunca apagar nem editar. É a fonte original. |
| Dimensões do arquivo em uso | 1792 × 2400 px (formato `.jpg`) | 🔒 Não editar o arquivo; se precisar de versão nova, gerar do original. |

### Regras de exibição da logo 🔒
- **Navbar:** classe `h-16 sm:h-20` (nunca reduzir abaixo disso — prioridade de marca).
- **Footer:** classe `h-16 sm:h-20`.
- **Hover:** expansão `hover:scale-110` com `transition-transform duration-300` e easing `cubic-bezier(.16,1,.3,1)` + `hover:drop-shadow-md`.
- A logo deve permanecer **clicável** (link para o topo/`#`) e com `alt` preenchido.
- Nunca aplicar filtros, cores ou bordas sobre a logo.

---

## 2. 🎨 Cores oficiais da marca 🔒

> 🔒 **Paleta OFICIAL confirmada pela cliente em 18/10/2026** — as 4 cores exatas da logo
> (valores HEX validados por amostragem de pixels e aprovados). Nenhuma outra cor de marca
> pode ser criada ou substituída sem nova aprovação.

| Cor | HEX | RGB | Participação na logo | Uso 🔒 |
|---|---|---|---|---|
| **Magenta** | `#EA0273` | 234, 2, 115 | 24,6% | Cor principal de destaque do site |
| **Amarelo** | `#FDC303` | 253, 195, 3 | 17,3% | Destaques sobre fundo escuro / selos |
| **Azul** | `#019AEB` | 1, 154, 235 | 16,9% | Destaques secundários |
| **Preto** | `#020202` | 2, 2, 2 | 2,3% | Nome da logo, base escura do site |

---

## 3. 🎨 Cores do site (tema claro premium) 🔒

**Fundo principal:** `#ffffff` (branco puro) 🔒 — o site é claro. Não trocar por fundo escuro.

### Paleta funcional
| Token | Hex | Uso 🔒 |
|---|---|---|
| `ink-950` | `#020202` | Botões primários (CTA) e contrastes — **é o preto oficial da marca (§2)** |
| `ink-900` | `#0d0d11` | Reservas escuras |
| `ink-800` | `#131318` | Reservas escuras |
| Fundo do body | `#ffffff` | Fundo do site |
| Texto principal | `zinc-900` (`#18181b`) | Títulos e textos fortes |
| Texto secundário | `zinc-500` / `zinc-600` | Parágrafos de apoio, legendas |
| Bordas | `zinc-200` (padrão) / `zinc-300` (hover) | Cards, botões, seções |
| Cards / superfícies | `zinc-50` | Fundo de cards sobre o branco |

### Tokens de marca (paleta oficial §2 — gerados no `tailwind.config`) 🔒
| Token | Hex | Uso 🔒 |
|---|---|---|
| `brand-magenta` | `#EA0273` | Acento padrão sobre branco: eyebrows, hovers, foco de formulário, glows, avatares |
| `brand-amarelo` | `#FDC303` | Só sobre fundo escuro/vidro (selos "EDIÇÃO LIMITADA"/"NOVO"), estrelas (fill), tiles com ícone/texto **preto**, avatar "MC" |
| `brand-azul` | `#019AEB` | Tiles de ícone, ícones de confiança, gradiente do título do hero, glow lateral do hero, avatares |
| `brand-preto` | `#020202` | Sinônimo do `ink-950` — evitar duplicar usos |

> 🔒 A paleta dourada antiga (`gold-300`…`gold-700`) e o acento roxo (`glow: #7c5cff`)
> foram **substituídos** pela paleta oficial em 18/10/2026. Nenhuma classe `gold-*`
> ou `glow` de cor deve voltar a existir no HTML/CSS/JS.

### Sombras 🔒
- `soft`: `0 18px 40px -22px rgba(9,9,11,.28)`
- `glow`: `0 0 40px -12px rgba(234,2,115,.45)` (brilho magenta nos CTAs)
- `glow-sm`: `0 0 22px -8px rgba(234,2,115,.4)` (brilho magenta)

### Regras de contraste 🔒
- **Nunca** colocar texto claro (`white`/`zinc-300`) sobre o fundo branco.
- **Nunca** usar `brand-amarelo` (`#FDC303`) em texto pequeno ou ícone sobre branco (contraste baixo). Amarelo só: sobre fundo escuro/vidro, como fundo de tile com ícone **preto** (`text-ink-950`), ou em estrelas de avaliação com contorno preto.
- `brand-magenta` é o acento padrão sobre branco (eyebrows, links, hovers).
- Badges sobre obras (artes escuras) permanecem em vidro escuro (`bg-ink-950/60` + `border-white/20` + `text-brand-amarelo`).

---

## 4. ✍️ Tipografia 🔒

| Uso | Fonte | Pesos |
|---|---|---|
| Display / títulos | **Plus Jakarta Sans** | 400–800 (`font-display`) |
| Texto corrido / interface | **Inter** | 400–600 (`font-sans`) |

- 🔒 Carregadas via Google Fonts no `<head>`. Não substituir sem aprovação.
- 🔒 Títulos sempre com `font-display` + `font-extrabold`/`bold` + `tracking-tight`.

---

## 5. 🧱 Estrutura de seções (não apagar) 🔒

Ordem atual do `index.html` — **todas as seções devem existir**:

1. **Topbar de urgência + Navbar** — faixa `#FFDE21` pequena com aviso de urgência + barra limpa contendo **apenas a logo** (canto superior esquerdo, `h-16 sm:h-20`)
2. **Hero** — headline com gradiente de marca + CTAs + carrossel de 5 obras (autoplay, setas, dots-pílula e contador)
3. **Coleção** — grid de 8 obras com imagens reais + chips de filtro + botão **Comprar** em cada card (sem preços)
4. **Depoimentos** — 3 cards
5. **FAQ** — acordeão (6 perguntas)
6. **CTA final** — captação de e-mail (10% off) + faixa de confiança (compra protegida, 7 dias, frete grátis)
7. **Footer** — logo + descrição + redes sociais + 3 colunas de links + pagamentos

### Elementos que não podem sumir 🔒
- Topbar de urgência (fundo `#FFDE21` + letras pretas — cor por pedido em 18/10/2026, exceção à paleta oficial §2)
- Logo da navbar e do rodapé (seguindo as regras da Seção 1)
- CTA "Explorar a coleção" (botão primário escuro com glow magenta)
- Carrossel do hero com as obras em destaque
- Selos "Edição limitada" / "NOVO" nos cards de obras
- Botão **"Comprar"** em cada card da Coleção (substitui os preços)
- Faixa de confiança do CTA final e colunas de links do rodapé

### Removidos a pedido da cliente (18/10/2026) — 🔒 não recriar
- Menu de links na navbar (desktop e mobile), ícones de favoritos/carrinho e botão "Comprar arte" na navbar
- Seção **Planos / Clube** e todos os links "Clube"
- Faixa de números (2.400+ / 180 / 12 / 4,9★)
- Micro-provas sociais (nota 4,9 / +2.400 colecionadores) e badges de Certificado e Frete grátis no hero
- Pill "Curadoria independente" e grade `bg-grid`
- Seção **Por que a 123 Quadros / Diferenciais** (bento grid de 6 blocos) e o botão secundário do hero **"Como funciona"**
- **Preços das obras (R$)** nos cards da Coleção — hoje cada card exibe botão **"Comprar"**

---

## 6. 📦 Conteúdo do catálogo (PDF) — fonte oficial ⏳

> Espaço reservado para as informações extraídas do PDF da cliente.
> **Nada daqui pode ser inventado ou alterado por IA.**

- ⏳ Nome oficial da marca / razão social: marca **123 Quadros** (em uso no site desde 18/10/2026 por pedido; razão social a confirmar no catálogo)
- ⏳ Slogan / missão:
- ⏳ Tipagem de cores exatas (CMYK/HEX/Pantone):
- ⏳ Tipografia oficial da marca:
- ⏳ Catálogo de obras (nomes, artistas, técnicas, dimensões, preços):
- ⏳ Textos institucionais (sobre, curadoria, diferenciais):
- ⏳ Dados de contato (WhatsApp, e-mail, endereço, redes sociais):
- ⏳ Políticas (frete, prazos, trocas, garantia):
- ⏳ Demais regras do manual da marca:

---

*Atualizado em: 18/10/2026 · Arquivo de trava — alterações apenas com aprovação da cliente.*
