Dim fso, scriptDir, shell
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

Set shell = CreateObject("WScript.Shell")
shell.Run "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & scriptDir & "\start-academic-os.ps1""", 0, True
shell.Run "http://localhost:3000", 1, False
