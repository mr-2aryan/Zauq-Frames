# Zauq catalogue — design direction

A structured product catalogue in the Zauq brand: bold headings, clear product cards, generous text and a single signature shape, the arch.

## Visual system

- **Colour:** olive `#475325` is the lead colour, used for section bands, page numbers, badges and the back cover. Cream `#f3efe6` and mist `#e4e8d2` are for panels and soft shapes. Sage `#d3dbae` is for accents on olive. Ink `#121110` is for text. Coral is reserved and currently unused.
- **Type:**
  - Bricolage Grotesque, bold, for headings.
  - Instrument Serif italic for the accent word in each heading ("Zauq for *business*").
  - Bricolage at 8–9 pt for body text.
  - Small, letter-spaced olive "kickers" above headings.
- **Arch:** photos sit in arch-shaped windows, a nod to the mihrab and the arched alcoves in the product photography. Every arch is 7:10 (width:height), and each gets an offset olive or sage arch (or outline) behind it.
- **Centring rule:** the framed artwork is always horizontally centred in its arch or card, fully visible, with wall showing above it, below the arch curve. Crops are generated from the original photos by detecting the frame (see "Image crops" below). Never rely on `object-position` to place a frame.
- **Product cards:** a cream image panel, then the name, a two-line description, and size and orientation tags. There are no product codes. Calligraphy pieces are framed flats in a CSS black frame. The other collections use room shots cropped so the frame is centred.
- **No Urdu mark:** the ذوق glyph is not used as a logo. The brand mark is the ZAUQ / PREMIUM FRAMES wordmark only.
- **Collection pages** share one template: an olive header band with an outlined number, the title, an introduction and "ideal for", plus an arch photo breaking out of the band. Product cards sit below.
- **Furniture:** the section name top-left, "Product Catalogue 2026" top-right, the website bottom-left and the page number in an olive circle bottom-right.

## Pages (12)

1. Cover
2. Welcome and contents
3. About
4. Services for business
5. Islamic Calligraphy
6. Modern & Minimal
7. Art & Culture, with a guide by space
8. Custom & branded frames
9. Quality & craftsmanship
10. Sizes & price list
11. How to order and FAQ
12. Contact

## Print specification

| | |
|---|---|
| Trim size | A4 portrait, 210 × 297 mm |
| Bleed | 3 mm (`…-PRINT-3mm-bleed.pdf` is 216 × 303 mm) |
| Margins | 12 mm sides; content from 20 mm at the top to 17 mm at the bottom |
| Safe area | Headers and page numbers sit at least 7 mm inside the trim |
| Pages | 12 (a multiple of 4, for saddle-stitch binding) |
| Suggested stock | Cover 300 gsm matte art board with matte lamination; inner pages 150–170 gsm matte art paper |

## Image crops

- `arch-*.jpg` are 1400 × 2000 px (7:10) and `card-*.jpg` match their card boxes exactly. Both are cut from the originals in `D:\Products`.
- The black frame is located automatically on light walls; on the four dark-room Art & Culture photos it was located by hand.
- The crop is centred on the frame. Where a frame sat too close to the top of the photo, up to 6% of plain wall was continued upwards, so the arch curve never clips it.
- The angled studio shot (`arch-craft.jpg`) has its white background multiplied to the cream panel colour.

## Rebuilding

```bash
node catalogue/build-pdf.mjs
```

This writes the A4 PDF (for email and office printing) and the print PDF with bleed.
