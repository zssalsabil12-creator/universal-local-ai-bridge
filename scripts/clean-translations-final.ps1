$p='C:\Users\PC\ulab\desktop\renderer\src\i18n\translations.ts'
$s=[IO.File]::ReadAllText($p)
$lines=$s -split "`r?`n"
$out=@()
foreach($line in $lines){
  if($line -match "workspace\.demoMode"){ continue }
  $line=$line.Replace('ULP protocol','Universal AI Bridge').Replace('protocole ULP','Universal AI Bridge').Replace('protocolo ULP','Universal AI Bridge').Replace('ULP协议','Universal AI Bridge').Replace('ULP 프로토콜','Universal AI Bridge').Replace('بروتوكول ULP','Universal AI Bridge')
  $out += $line
}
[IO.File]::WriteAllText($p,($out -join [Environment]::NewLine),(New-Object Text.UTF8Encoding($false)))
Write-Output 'TRANSLATIONS_FULLY_CLEANED'