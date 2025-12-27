; ANYON NSIS Installer Hooks
; Registers anyon:// deep link protocol handler during installation

!macro NSIS_HOOK_POSTINSTALL
  ; Register anyon:// deep link protocol handler
  ; Using SHCTX for automatic HKLM (admin) / HKCU (user) selection
  ; Note: Backslashes must be escaped in NSIS strings
  WriteRegStr SHCTX "Software\\Classes\\anyon" "" "URL:ANYON Protocol"
  WriteRegStr SHCTX "Software\\Classes\\anyon" "URL Protocol" ""
  WriteRegStr SHCTX "Software\\Classes\\anyon\\DefaultIcon" "" "$INSTDIR\\anyon.exe,0"
  WriteRegStr SHCTX "Software\\Classes\\anyon\\shell\\open\\command" "" '"$INSTDIR\\anyon.exe" "%1"'
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  ; Remove anyon:// protocol handler on uninstall
  DeleteRegKey SHCTX "Software\\Classes\\anyon"
!macroend
