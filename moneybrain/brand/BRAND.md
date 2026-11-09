# MONEY BRAIN — brand kit

## Name
**Money Brain**

The name says what the channel does: money, seen through the brain. It's two short words, reads well on a
phone and fits the cast, since your brain (Impulse) is a character. The word "BRAIN" is always terracotta in the logo.

**Handle:** pick the first one that's free, in this order: `@MoneyBrain` → `@TheMoneyBrain` → `@MoneyBrainToons` → `@MoneyBrainExplained`.
(I couldn't check YouTube from here. Search the name too, and if a big channel is already called "Money Brain", tell me and we'll adjust.)

## Tagline
**The psychology of your money.**

## Short description
Why smart people make bad money moves, and the simple math that fixes them, explained with cartoons.

## About (paste into YouTube → Customize channel → Basic info)

> Ever wonder why you're broke on a good salary? Why a $700 car payment feels fine but a $5 coffee feels like a crime?
>
> It's not you. It's your brain.
>
> Money Brain explains the psychology of money in short animated videos. Meet the crew:
> 🫘 **Bean**: that's you, trying to do the right thing.
> 🧠 **Impulse**: your brain, who always has a "great" idea for your paycheck.
> 🧮 **Prof. Calc**: the one who actually does the math.
>
> Each video takes one money myth, shows the mental trick behind it, and gives you one small move you can make this week.
> No hype, no get-rich-quick, just the math your brain keeps skipping.
>
> New videos every [DAY]. Subscribe and stop letting your brain spend your money.
>
> *Everything here is for education and entertainment, not personal financial advice. Numbers in videos are illustrative unless a source is shown.*

## Channel keywords (Settings → Channel → Keywords)
personal finance, money psychology, behavioral finance, budgeting, saving money, lifestyle creep, credit card debt,
401k, investing for beginners, financial literacy, money mistakes, animated explainer

## Files (`brand/out/`)
| File | Size | Where it goes |
|---|---|---|
| `avatar.png` | 800×800 | **Profile picture** (main). Bean waving with a coin. YouTube crops it to a circle; `avatar-preview-sizes.png` shows it at real sizes |
| `avatar-duo.png` | 800×800 | Alternative profile picture: Bean and Impulse together (better big, busier small) |
| `banner.png` | 2560×1440 | **Banner**. The logo, tagline, Bean and Impulse sit inside the 1546×423 middle that every device shows; coins, Prof. Calc and the piggy bank only appear on desktop and TV |
| `banner-safe-area-guide.png` | 2560×1440 | The same banner with the mobile-safe box drawn in red, for reference only |
| `watermark.png` | 150×150 | **Video watermark** (Customize channel → Branding), transparent PNG |

Each PNG has an `.svg` next to it, so the art scales cleanly for merch, a website or print.
Rebuild everything with `node brand/make.mjs`.

## Brand rules (short)
- Colours: paper `#F4EBD5`, ink `#231F1C`, terracotta `#B8704F`, olive `#8E9B6A`, slate `#5F7C90`, mustard `#D3A43F`, Bean gold `#E2B04A`, Impulse pink `#E7958C`.
- Type: Archivo Black for titles, Patrick Hand for handwriting, Space Mono for numbers and receipts.
- Thumbnails: ledger-paper background, one character with a big expression, a price tag of 3 words or fewer, and one number on a receipt.
- Full style guide: `../IDENTITY.md`.
