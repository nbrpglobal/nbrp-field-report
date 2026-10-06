# NBRP Field Report V1

Mobile-first field report web app for turning job-site photos, project information and notes into customer-ready reports.

## PDF layout fixes
- 3 photos produce 3 A4 report pages.
- Each page contains its own footer inside the page area.
- No fixed-position footer is used, preventing blank footer-only pages.
- NBRP deep blue replaces the previous brown/orange accent.
- Report title hierarchy has deliberate vertical spacing.
- Report brand layout is logo + NBRP GLOBAL on one row, with Field Report below.

## Deployment
Cloudflare Worker deployment is configured separately in the repository.
