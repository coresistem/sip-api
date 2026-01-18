$env:API_KEY = "sk-user-tFYEOPlSYlNUz3q7Gcdtlt6jdhB3OAW_DIGMjrJeI03i46oZeei2UAuGSVHhGMpNPd2t_dEaOGGQKE2qVd8lisuede8_W1tbO0Ksi3Sdzuv_JckMD10p2kz9kknsChlx2jg"
Write-Host "Starting TestSprite Integration Check..."
.\node_modules\.bin\testsprite-mcp-plugin.cmd generateCodeAndExecute
