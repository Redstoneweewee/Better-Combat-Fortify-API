## Better Combat: Fortify API
This is a new project created by Redstoneweewee from Warden Creations. This is a Minecraft Bedrock addon that uses the Minecraft scripting API to create new custom APIs for custom weapons.

### Note:
This addon requires Minecraft version 1.21.100+

## Contributing

### Prerequisites
Before contributing to this project, ensure you have the following installed:

- **Node.js** (v14 or higher) - Required for building and running scripts
- **npm** - Comes with Node.js, used for package management
- **TypeScript** (v5.6.2 or higher) - For TypeScript compilation
- **Regolith** - Build tool for Minecraft Bedrock Edition addons
- **Minecraft Bedrock Edition** (v1.21.100+) - For testing the addon

### Tech Stack

**Languages:**
- TypeScript 5.6.2 - Primary development language
- JavaScript - Compiled output for Minecraft scripts

**Minecraft APIs:**
- `@minecraft/server` (v2.0.0+) - Core scripting API for game logic
- `@minecraft/server-ui` (v2.0.0+) - UI components and dialogs

**Build Tools:**
- Regolith - Addon build and deployment system
- `@minecraft/core-build-tasks` (v5.5.0) - Minecraft-specific build utilities
- just-scripts - Task runner for build automation
- ESLint - Code linting with `eslint-plugin-minecraft-linting`

**Development Tools:**
- ts-node - TypeScript execution for build scripts
- source-map - Source mapping for debugging

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run just-scripts to convert ts to js:
   ```bash
   just-scripts local-deploy
   ```
4. Run Regolith to deploy to Minecraft development folders:
   ```bash
   regolith run
   ```

### Continuous Development
5. Place just-scripts and Regolith on watch:
   ```bash
   just-scripts local-deploy --watch
   regolith watch
   ```
   Or use this powershell function in your $PROFILE:
   ```
    function fortify_dev_watch {
        $projectRoot = Get-Location

        Push-Location "$projectRoot/ts-setup"
        $npxProcess = Start-Process npx `
            -ArgumentList "just-scripts local-deploy --watch" `
            -NoNewWindow `
            -PassThru
        Pop-Location

        try {
            Push-Location "$projectRoot/Regolith"
            regolith watch
        }
        finally {
            Write-Host "Stopping dev processes..."
            Stop-Process -Id $npxProcess.Id -Force -ErrorAction SilentlyContinue
            Pop-Location
        }
    }
   ```

## License  
This project is licensed under the CC BY-NC-ND 4.0 License.  
You may share this work with attribution, but you may not use it commercially or create and distribute derivative works.  
Full license: [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/)
