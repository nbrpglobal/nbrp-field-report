# NBRP Field Report Production

This repository is intentionally flat so the files can be uploaded directly through the GitHub web interface

## Cloudflare components

- Pages for the web app
- Worker for the API
- D1 for users sessions reports photos metadata and audit logs
- R2 for photos and signatures

## First deployment

1 Create a D1 database named nbrp-fieldreport
2 Run schema.sql against that database
3 Create an R2 bucket named nbrp-fieldreport-media
4 Put the real D1 database ID into wrangler.toml
5 Put the real Pages origin into APP_ORIGIN
6 Deploy worker.js with Wrangler
7 Put the Worker URL into config.js
8 Deploy the static web files through Cloudflare Pages

Do not expose D1 credentials or R2 credentials in frontend files

## Current zero-upfront-cost scope

Authentication reports history photos signatures admin role protection trial data and print-ready PDF are implemented without a paid third-party provider

Paid email password recovery verification payment subscriptions and paid analytics are intentionally excluded until the product has revenue
