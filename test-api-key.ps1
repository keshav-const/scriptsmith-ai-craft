$apiKey = "AIzaSyC7sVe9r5lCCq8xR1ydndqWELH7NAna1Ec"

Write-Host "Testing different endpoints and models..." -ForegroundColor Cyan
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

$tests = @(
    @{endpoint="v1beta"; model="gemini-1.5-flash"},
    @{endpoint="v1beta"; model="gemini-pro"},
    @{endpoint="v1"; model="gemini-1.5-flash"},
    @{endpoint="v1"; model="gemini-pro"}
)

foreach ($test in $tests) {
    $uri = "https://generativelanguage.googleapis.com/$($test.endpoint)/models/$($test.model):generateContent?key=$apiKey"
    Write-Host "Testing: $($test.endpoint)/$($test.model)" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $uri -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
        Write-Host "  SUCCESS!" -ForegroundColor Green
        Write-Host "  Response: $($response.candidates[0].content.parts[0].text)" -ForegroundColor Green
        Write-Host ""
        Write-Host "WORKING COMBINATION: $($test.endpoint)/$($test.model)" -ForegroundColor Cyan
        exit 0
    } catch {
        Write-Host "  Failed: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "All combinations failed. The API key might have restrictions." -ForegroundColor Yellow
