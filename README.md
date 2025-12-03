This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Using ngrok for Backend API During Hackathon

1. Install ngrok if you don't have it (macOS Homebrew):
	```bash
	brew install ngrok
	```
2. Start your backend locally (listening on `http://localhost:8000`).
3. Expose it via ngrok:
	```bash
	ngrok http 8000
	```
4. Copy the HTTPS forwarding URL (e.g. `https://abc123.ngrok-free.app`).
5. Create `.env.local` in project root and set:
	```bash
	NEXT_PUBLIC_API_BASE_URL=https://abc123.ngrok-free.app
	```
6. Restart dev server so env var loads.
7. All auth requests now target the ngrok URL automatically.

### Switching Back
Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` or remove it and restart.

### Verify
Check browser Network tab during login/register; requests should hit the ngrok domain.
Resolve CORS issues by allowing the ngrok origin in backend.

## Authentication Error Handling
`apiRequest` surfaces backend `detail`/`message`; `AuthContext` shows them with `react-hot-toast` (e.g. `Incorrect email or password`).

