# NBRP Field Report V1.1

Mobile-first field report web app for creating professional PDF reports from job-site photos.

## V1.1 visual and PDF fixes
- PDF uses explicit A4 page sizing with zero browser page margin.
- Each report page remains one physical PDF page.
- Footer is placed at the bottom of every report page.
- NBRP brand accent changed from brown-orange to deep navy blue.
- Increased breathing room between NBRP FIELD REPORT and the main report title.
- Top-left brand layout is logo + NBRP GLOBAL on the first line, Field Report on the second line.

## Deployment
Upload the files in this package to the root of the `nbrp-field-report` GitHub repository.
Keep the existing `nbrplogo.svg` file in the repository root. Do not delete it when replacing the other files.

Cloudflare Workers deployment command:
`npx wrangler deploy`
