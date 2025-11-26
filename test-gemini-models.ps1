$apiKey = "AIzaSyAXRMhvGP_X5alfLZnh6C_qWfgA1FGDqko"

Write-Host "Testing with v1beta endpoint..."
Write-Host ""

$body = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "Hello"
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

# Try v1beta endpoint
try {
    $uri = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$apiKey"
    Write-Host "Testing: $uri"
    $response = Invoke-RestMethod -Uri $uri -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
    Write-Host "SUCCESS with v1beta!" -ForegroundColor Green
    Write-Host "Response: $($response.candidates[0].content.parts[0].text)" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "v1beta failed: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host "Error details: $errorBody" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Checking if Gemini API is enabled in your project..." -ForegroundColor Yellow
Write-Host ""
Write-Host "SOLUTION:" -ForegroundColor Cyan
Write-Host "1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com" -ForegroundColor White
Write-Host "2. Click 'ENABLE' to enable the Generative Language API" -ForegroundColor White
Write-Host "3. Make sure billing is enabled on your Google Cloud project" -ForegroundColor White
Write-Host "4. Wait 1-2 minutes for the API to activate" -ForegroundColor White
Write-Host "5. Try the key again" -ForegroundColor White
