# PowerShell script to remove console.log and console.warn from all JSX files

$files = Get-ChildItem -Path "src" -Include "*.jsx", "*.js" -Recurse -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove console.log statements (including multi-line)
    $content = $content -replace "console\.log\s*\([^;]*\);\s*", ""
    
    # Remove console.warn statements
    $content = $content -replace "console\.warn\s*\([^;]*\);\s*", ""
    
    # Remove empty useEffect that only had console.log
    $content = $content -replace "useEffect\(\(\) => \{\s*\}, \[lastMessage\]\);\s*", ""
    
    # Write back only if changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Cleaned: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`nCleanup complete!" -ForegroundColor Cyan
