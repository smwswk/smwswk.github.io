Option Explicit

Const FSI_FILE_SYSTEM_ISO9660 = 1
Const FSI_FILE_SYSTEM_JOLIET = 2
Const FSI_FILE_SYSTEM_UDF = 4
Const MEDIA_TYPE_CDR = 2
Const MEDIA_TYPE_CDRW = 3

Dim fso, rootFolder, sourceFolder, volumeName
Set fso = CreateObject("Scripting.FileSystemObject")
rootFolder = fso.GetParentFolderName(WScript.ScriptFullName)
sourceFolder = fso.BuildPath(rootFolder, "需要刻录的文件")
volumeName = "DATA_DISC"

If Not fso.FolderExists(sourceFolder) Then
    Die "找不到待刻录文件夹：" & sourceFolder
End If

Main

Sub Main()
    Dim copies, recorder, i

    Say "Win7 光盘刻录工具"
    Say "待刻录目录：" & sourceFolder
    copies = AskCopies()
    Set recorder = SelectRecorder()

    Say "使用刻录机：" & RecorderName(recorder)
    Say "共需刻录 " & copies & " 张。"

    For i = 1 To copies
        Say "第 " & i & "/" & copies & " 张：请插入空白 CD/DVD。"
        WaitForEnter "插好后按回车开始检测..."
        BurnOneDisc recorder, i, copies

        If i < copies Then
            Say "请取出已完成光盘，放入下一张空白光盘。"
            WaitForEnter "准备好后按回车继续，或直接关闭窗口停止。"
        End If
    Next

    Say "全部完成。"
End Sub

Function AskCopies()
    Dim answer, n

    Do
        answer = Trim(ReadConsole("请输入要刻录的光盘张数（直接回车默认 1 张）："))
        If answer = "" Then
            AskCopies = 1
            Exit Function
        End If

        If IsNumeric(answer) Then
            n = CLng(answer)
            If n > 0 Then
                AskCopies = n
                Exit Function
            End If
        End If

        Say "请输入大于 0 的数字。"
    Loop
End Function

Function SelectRecorder()
    Dim master, recorder, i, answer, choice

    Set master = CreateObject("IMAPI2.MsftDiscMaster2")
    If master.Count = 0 Then
        Die "没有检测到刻录光驱。"
    End If

    If master.Count = 1 Then
        Set recorder = CreateObject("IMAPI2.MsftDiscRecorder2")
        recorder.InitializeDiscRecorder master.Item(0)
        Set SelectRecorder = recorder
        Exit Function
    End If

    Say "检测到多个刻录设备："
    For i = 0 To master.Count - 1
        Set recorder = CreateObject("IMAPI2.MsftDiscRecorder2")
        recorder.InitializeDiscRecorder master.Item(i)
        Say "  " & (i + 1) & ". " & RecorderName(recorder)
    Next

    Do
        answer = Trim(ReadConsole("请选择刻录机编号："))
        If IsNumeric(answer) Then
            choice = CLng(answer)
            If choice >= 1 And choice <= master.Count Then
                Set recorder = CreateObject("IMAPI2.MsftDiscRecorder2")
                recorder.InitializeDiscRecorder master.Item(choice - 1)
                Set SelectRecorder = recorder
                Exit Function
            End If
        End If
        Say "编号无效。"
    Loop
End Function

Sub BurnOneDisc(recorder, discIndex, discTotal)
    Dim dataWriter, fileSystem, resultImage, imageStream, mediaType, fileSystems

    Set dataWriter = CreateObject("IMAPI2.MsftDiscFormat2Data")
    dataWriter.Recorder = recorder
    dataWriter.ClientName = "Win7DiscBurner"

    If Not dataWriter.IsRecorderSupported(recorder) Then
        Die "当前刻录机不支持 IMAPI2 数据刻录。"
    End If

    WaitForSupportedBlankMedia dataWriter, recorder
    mediaType = dataWriter.CurrentPhysicalMediaType

    If mediaType = MEDIA_TYPE_CDR Or mediaType = MEDIA_TYPE_CDRW Then
        fileSystems = FSI_FILE_SYSTEM_ISO9660 + FSI_FILE_SYSTEM_JOLIET
        Say "检测到 CD 介质，使用 ISO9660 + Joliet。"
    Else
        fileSystems = FSI_FILE_SYSTEM_ISO9660 + FSI_FILE_SYSTEM_JOLIET + FSI_FILE_SYSTEM_UDF
        Say "检测到 DVD 或其他数据光盘介质，使用 ISO9660 + Joliet + UDF。"
    End If

    Set fileSystem = CreateObject("IMAPI2FS.MsftFileSystemImage")
    fileSystem.ChooseImageDefaults recorder
    fileSystem.FileSystemsToCreate = fileSystems
    fileSystem.VolumeName = volumeName

    Say "正在整理待刻录文件目录..."
    fileSystem.Root.AddTree sourceFolder, False
    Set resultImage = fileSystem.CreateResultImage()
    Set imageStream = resultImage.ImageStream

    On Error Resume Next
    dataWriter.ForceMediaToBeClosed = False
    If Err.Number <> 0 Then
        Err.Clear
    End If
    On Error GoTo 0

    Say "开始刻录第 " & discIndex & "/" & discTotal & " 张，请不要关闭窗口。"
    dataWriter.Write imageStream
    Say "第 " & discIndex & " 张刻录完成。"

    On Error Resume Next
    recorder.EjectMedia
    On Error GoTo 0
End Sub

Sub WaitForSupportedBlankMedia(dataWriter, recorder)
    Do
        On Error Resume Next
        Err.Clear
        If dataWriter.IsCurrentMediaSupported(recorder) Then
            If dataWriter.MediaHeuristicallyBlank Then
                On Error GoTo 0
                Exit Sub
            End If
            Say "检测到的光盘不是空白盘。请换一张空白 CD/DVD。"
        Else
            Say "未检测到可用空白光盘，或当前介质不支持数据刻录。"
        End If

        If Err.Number <> 0 Then
            Say "检测光盘时出错：" & Err.Description
            Err.Clear
        End If
        On Error GoTo 0

        WaitForEnter "换好空白光盘后按回车重新检测..."
    Loop
End Sub

Function RecorderName(recorder)
    RecorderName = Trim(recorder.VendorId & " " & recorder.ProductId)
    If RecorderName = "" Then
        RecorderName = "(未命名刻录机)"
    End If
End Function

Function ReadConsole(prompt)
    WScript.StdOut.Write prompt
    ReadConsole = WScript.StdIn.ReadLine
End Function

Sub WaitForEnter(prompt)
    Dim ignored
    ignored = ReadConsole(prompt)
End Sub

Sub Say(message)
    WScript.Echo Timestamp() & "  " & message
End Sub

Function Timestamp()
    Dim d
    d = Now()
    Timestamp = Right("0" & Hour(d), 2) & ":" & Right("0" & Minute(d), 2) & ":" & Right("0" & Second(d), 2)
End Function

Sub Die(message)
    WScript.Echo "错误：" & message
    WScript.Quit 1
End Sub
