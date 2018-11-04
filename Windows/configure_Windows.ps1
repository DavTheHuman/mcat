$invocation = (Get-Variable MyInvocation).Value
$dirpath = Split-Path $invocation.MyCommand.Path
$mcpath = $dirpath + '\index.js'

if (!(Test-Path -Path $profile)) {New-Item -ItemType File -Path $profile -Force}

Add-Content $profile "`r`nfunction mcat {`$input | node $mcpath `$args}"

function mcat {$input | node $mcpath $args}