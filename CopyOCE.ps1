#$Source = ""
#$Destination = ""
#$compareDate = (Get-Date).AddDays(-11) 
#get-childitem -Force $Source -filter *pdf -recurse | Where-Object { $_.LastWriteTime -gt $compareDate} | copy-item -Destination $Destination