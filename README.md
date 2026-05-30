# Stopwatch

Simple stopwatch webapp with:

- persistent browser-side storage via `localStorage`
- large `HHHH:MM:SS` display
- start/pause toggle and reset
- manual resume from an input time
- support for at least 2000 hours

## Run locally

```powershell
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## Deploy to Railway

1. Push this repo to GitHub.
2. Create a new Railway project from the repo.
3. Railway will detect the Node app automatically.
4. Deploy with the default start command: `npm start`.

No database is required because persistence is handled in the browser with `localStorage`.
