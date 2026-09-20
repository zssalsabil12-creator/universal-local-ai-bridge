$p='C:\Users\PC\ulab\desktop\renderer\src\i18n\translations.ts'
$s=Get-Content $p -Raw
$s=$s -replace '(?m)^\s*''workspace\.demoMode'': string;\r?\n',''
$s=$s -replace '(?m)^\s*''workspace\.demoMode'': ''[^'']*'',\r?\n',''
$s=$s -replace '(?m)^\s*''features\.universal\.desc'': ''[^'']*'',','  ''features.universal.desc'': ''Universal AI Bridge connects your AI chat to the selected local workspace'',
Set-Content -Path $p -Value $s -NoNewline
Write-Output 'TRANSLATIONS_CLEANED'