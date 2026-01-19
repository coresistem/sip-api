# Prisma Maintenance Guide

## How to Regenerate Prisma Client
If you encounter lint errors like "Property 'roleRequest' does not exist on type 'PrismaClient'" or if you change `schema.dev.prisma`, you need to regenerate the client.

**Note:** You must STOP the running server before doing this to avoid file locking issues on Windows.

### Steps:

1.  **Stop the Server**
    - Go to the terminal running the server.
    - Press `Ctrl + C` (and confirm with `y` if prompted) to stop the process.

2.  **Navigate to Server Directory**
    ```powershell
    cd d:\Antigravity\sip\server
    ```

3.  **Run Generation Command**
    ```powershell
    npm run db:generate:local
    ```
    *This command runs `prisma generate --schema=prisma/schema.dev.prisma`*

4.  **Restart Server**
    ```powershell
    npx tsx watch src/index.ts
    ```

### Troubleshooting
- **EPERM / File Locked**: If you see an error about "operation not permitted" or permission denied, it means a node process is still holding onto the files. Ensure all header/server terminals are stopped.
- **Schema Validation Errors**: Read the error message; you might have a syntax error in `schema.dev.prisma`.
