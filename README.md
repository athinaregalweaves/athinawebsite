# Project Setup

This project is built with Vite, TypeScript, React, shadcn-ui, and Tailwind CSS.

## Hostinger Connection Setup

1. Copy `.env.example` to `.env`.
2. Set your Hostinger backend API URL:

```sh
VITE_API_URL=https://your-domain.com/api
```

3. Restart the dev server after changing env vars.

### Important

- This frontend connects only to your PHP backend endpoints (for example `orders.php`, `products.php`, `auth.php`).
- `phpMyAdmin` is not connected directly from the frontend.
- Your Hostinger PHP backend must be configured with Hostinger MySQL credentials from hPanel/phpMyAdmin.
- Make sure your backend returns JSON and allows CORS from your frontend domain.

## Development

```sh
npm install
npm run dev
```

## Build and Preview

```sh
npm run build
npm run preview
```
