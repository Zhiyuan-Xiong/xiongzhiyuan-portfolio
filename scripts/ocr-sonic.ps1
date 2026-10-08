Add-Type -AssemblyName System.Runtime.WindowsRuntime
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.Streams.IRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder,Windows.Graphics.Imaging,ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.SoftwareBitmap,Windows.Graphics.Imaging,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine,Windows.Media.Ocr,ContentType=WindowsRuntime] | Out-Null
[Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime] | Out-Null
$taskAwaitMethod=[System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
function AwaitTask($taskOperation,$taskType){ $taskResult=$taskAwaitMethod.MakeGenericMethod($taskType).Invoke($null,@($taskOperation)); $taskResult.GetAwaiter().GetResult() }
$taskLanguage=New-Object Windows.Globalization.Language('en-US')
$taskEngine=[Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($taskLanguage)
if(!$taskEngine){throw 'English OCR unavailable'}
$taskDirectory='D:\aaa作品集\portfolio-site\.cache\sonic'
Get-ChildItem -LiteralPath $taskDirectory -Filter 'original-*.png' | Sort-Object Name | ForEach-Object {
 $taskFile=AwaitTask ([Windows.Storage.StorageFile]::GetFileFromPathAsync($_.FullName)) ([Windows.Storage.StorageFile])
 $taskStream=AwaitTask ($taskFile.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
 $taskDecoder=AwaitTask ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($taskStream)) ([Windows.Graphics.Imaging.BitmapDecoder])
 $taskBitmap=AwaitTask ($taskDecoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
 $taskResult=AwaitTask ($taskEngine.RecognizeAsync($taskBitmap)) ([Windows.Media.Ocr.OcrResult])
 $taskOutput=$_.FullName.Replace('original-','ocr-').Replace('.png','.txt')
 [System.IO.File]::WriteAllText($taskOutput,($taskResult.Lines | ForEach-Object {$_.Text}) -join "`n")
 $taskStream.Dispose();$taskBitmap.Dispose();Write-Output $_.Name
}
