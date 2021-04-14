# Example for demonstrating card stacks

## How to run

If you are already running RecNChill with `npm run dev` or `npm start` then simply go `localhost:3000/card-stack/`. Otherwise,

Install `browser-sync` to run local server
```bash
npm install -g browser-sync
```

Then run the following command from the dir `/RecNChill/public/card-stack/`
```bash
❯ browser-sync start -s
[Browsersync] Access URLs:
 -------------------------------------
       Local: http://localhost:3000
    External: http://192.168.5.27:3000
 -------------------------------------
          UI: http://localhost:3001
 UI External: http://localhost:3001
 -------------------------------------
[Browsersync] Serving files from: ./
```

Navigate to `http://localhost:3000` and you should see the application running
