$body = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "Say hello"
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=AIzaSyCoTjokVxcxTWqBmtp1m0vMnTakFo2fhGA" -Method POST -ContentType "application/json" -Body $body
    Write-Host "SUCCESS! API Key works!"
    Write-Host "Response: $($response | ConvertTo-Json)"
} catch {
    Write-Host "ERROR: API Key test failed"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error Message: $($_.Exception.Message)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host "Error Body: $errorBody"
}
