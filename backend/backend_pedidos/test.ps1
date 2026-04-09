add-type @"
using System.Net;
using System.Security.Cryptography.X509Certificates;
public class TrustAllCertsPolicy : ICertificatePolicy {
    public bool CheckValidationResult(
        ServicePoint srvPoint, X509Certificate certificate,
        WebRequest request, int certificateProblem) {
        return true;
    }
}
"@

[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy

Write-Host "==============================="
Write-Host "PRUEBA 1: XSS (inyeccion)"
Write-Host "==============================="

# 🔴 ATAQUE XSS
$body1 = @{
    puntuacion = 5
    texto = "<script>alert('hack')</script>"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://localhost:8443/api/v1/comentarios" `
-Method POST `
-Headers @{ "Content-Type" = "application/json" } `
-Body $body1

$response

Write-Host "`nResultado esperado:"
Write-Host "- El texto debe estar sanitizado"
Write-Host "- No debe ejecutarse ningun script"

Write-Host "`n==============================="
Write-Host "PRUEBA 2: RATE LIMIT (ataque)"
Write-Host "==============================="

for ($i=1; $i -le 15; $i++) {

    Write-Host "Peticion $i"

    # ✅ CUERPO CORRECTO SEGÚN TU API
    $body2 = @{
        puntuacion = 5
        texto = "Probando HTTPS $i"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "https://localhost:8443/api/v1/comentarios" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $body2

        Write-Host "OK"
    }
    catch {
        Write-Host "ERROR DETECTADO (esperado despues de 10):"
        Write-Host $_.Exception.Response.StatusCode
    }

    Write-Host "---------------------------"
}

Write-Host "`nResultado esperado:"
Write-Host "- Despues de 10 peticiones debe aparecer 429 Too Many Requests"

Write-Host "`n==============================="
Write-Host "PRUEBA 3: REDIRECCION HTTP A HTTPS"
Write-Host "==============================="

Invoke-WebRequest -Uri "http://localhost:8080" -MaximumRedirection 0 -UseBasicParsing -ErrorAction SilentlyContinue

Write-Host "`nResultado esperado:"
Write-Host "- Codigo 301 Moved Permanently"
Write-Host "- Redireccion a https://localhost:8443"