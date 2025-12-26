$token = gh auth token
$payload = @{ 
  required_status_checks = $null
  enforce_admins = $true
  required_pull_request_reviews = $null
  restrictions = $null
  allow_deletions = $false
  allow_force_pushes = $false
}

$json = $payload | ConvertTo-Json -Depth 6
$uri = 'https://api.github.com/repos/Stealan1/SkatesGamehosting/branches/main/protection'

try {
  $response = Invoke-RestMethod -Method Put -Uri $uri -Headers @{ Authorization = "Bearer $token"; Accept = 'application/vnd.github+json' } -Body $json -ContentType 'application/json'
  $response | ConvertTo-Json -Depth 5
} catch {
  Write-Host "ERROR:"; $_ | Format-List * -Force
  if ($_.Exception -and $_.Exception.Response -and $_.Exception.Response.Content) {
    try { $_.Exception.Response.Content.ReadAsStringAsync().Result | Write-Host } catch {}
  }
  exit 1
}