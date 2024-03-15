param (
    [Parameter(Mandatory=$true)]
    [ValidateScript({Test-Path $_ -PathType 'Container'})]
    [string]$from,

    [Parameter(Mandatory=$true)]
    [string]$to
)

# Copy files from source to destination
Get-ChildItem -Path $from -File | ForEach-Object {
    $destinationPath = Join-Path -Path $to -ChildPath $_.Name
    Copy-Item -Path $_.FullName -Destination $destinationPath -Force
}