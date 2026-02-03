; Custom NSIS script for Horus Coworking installer
; Ensures user data persists across reinstalls

  ; Create app data directory in user's AppData for database persistence
  CreateDirectory "$APPDATA\horus-coworking"
!macroend

!macro customUnInstall
  ; Preserve user data on uninstall
  ; Only application files are removed, database and user data are kept
  ; Users can manually delete $APPDATA\horus-coworking if needed
  
  DetailPrint "User data has been preserved in $APPDATA\horus-coworking"
  DetailPrint "To completely remove all data, manually delete this folder"
!macroend
