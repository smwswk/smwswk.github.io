# Cross-Platform Disc Burner

Small data-disc burning scripts for two old but practical environments:

- macOS: Python wrapper around `hdiutil` and `drutil`.
- Windows 7: `.cmd` launcher plus VBScript using Windows IMAPI2.

Both versions expect a local folder named `需要刻录的文件` next to the launcher. Put the files for the disc in that folder, then run the double-click entry for the platform.

The public release intentionally ships with an empty placeholder folder only. No private media, case material, local path, or generated ISO is included.

## macOS

Run:

```sh
./双击刻光盘.command
```

Requirements:

- Python 3
- Apple `hdiutil`
- Apple `drutil`
- A writable optical drive

Defaults:

- Source folder: `需要刻录的文件`
- Temporary ISO: `mydisc.iso`
- Volume name: `DATA_DISC`

You can override the volume name:

```sh
DISC_VOLUME_NAME="MY_DISC" ./双击刻光盘.command
```

## Windows 7

Run:

```bat
双击刻光盘.cmd
```

Requirements:

- Windows 7
- Windows IMAPI2 service available
- A writable optical drive

The Windows version does not require Python.

## License

MIT License.
