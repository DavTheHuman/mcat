if (!(Test-Path -Path $PROFILE)) {New-Item -ItemType File -Path $PROFILE -Force}
Add-Content $PROFILE "`nfunction mcat {`$input | node $PSScriptRoot\index.js `$args}"
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted