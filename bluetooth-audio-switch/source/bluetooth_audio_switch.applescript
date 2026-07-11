set defaultOutputName to "OPPO Enco Air5 Pro"

try
	tell application "Finder" to set scriptFolderAlias to container of (path to me) as alias
	set scriptFolder to POSIX path of scriptFolderAlias
	set runScript to scriptFolder & "run.sh"
	do shell script "BLUETOOTH_OUTPUT_NAME=" & quoted form of defaultOutputName & " " & quoted form of runScript
	display notification defaultOutputName & " -> A2DP / AAC" with title "Bluetooth audio switch" sound name "Blow"
on error errMsg
	display notification errMsg with title "Bluetooth audio switch failed" sound name "Basso"
end try
