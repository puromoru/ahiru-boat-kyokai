$ErrorActionPreference = 'Stop'
$url = 'https://script.google.com/macros/s/AKfycbxipq9bmGyD86d747AbfyaHA7Vt6-4JrXqkOAEDuRGyRg8InwF9Dyd-sHy7b8jG-cw-vQ/exec'
$dir = Join-Path $PSScriptRoot 'seed-data'
$files = Get-ChildItem -Path $dir -Filter '*.json' | Sort-Object Name

foreach ($f in $files) {
  $body = [System.IO.File]::ReadAllBytes($f.FullName)
  try {
    $res = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType 'text/plain;charset=utf-8' -MaximumRedirection 10
    Write-Host ("OK : {0} -> ok={1} id={2}" -f $f.Name, $res.ok, $res.review.id)
  } catch {
    Write-Host ("FAIL: {0} -- {1}" -f $f.Name, $_.Exception.Message)
  }
  Start-Sleep -Milliseconds 700
}
