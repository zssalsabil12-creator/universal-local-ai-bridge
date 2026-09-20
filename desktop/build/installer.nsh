; ULAB uninstall hook: gracefully stop only the Agent belonging to this installation.
!macro customUnInstall
  ClearErrors
  IfFileExists "$INSTDIR\resources\agent\dist\ulab-agent.exe" 0 done
    ExecWait '"$INSTDIR\resources\agent\dist\ulab-agent.exe" --shutdown --port 19999' $0
    Sleep 500
    ExecWait `"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "$$p=Get-CimInstance Win32_Process | Where-Object { $$_.ExecutablePath -eq '$INSTDIR\resources\agent\dist\ulab-agent.exe' }; $$p | ForEach-Object { Stop-Process -Id $$_.ProcessId -Force -ErrorAction SilentlyContinue }"` $0
  done:
!macroend
