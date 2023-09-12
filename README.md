# `icloud_ftp`

A basic FTP server that serves files from iCloud Drive. It is essentially a 'glue' program between my [`icloud.js`](https://github.com/foxt/icloud.js) library and the [`ftp-srv`](https://npmjs.com/package/ftp-srv) library.

## Usage

Usage is simple. Run the program and it will interactively ask you for your iCloud username and password. It will then start an FTP server, accessible to your local machine, on port 9102.

You can then connect to the server with a FTP client. **Note:** Authentication is NOT supported on the FTP side, meaning that anyone who can connect to the server can access your files.

## Advanced Options

icloud_ftp supports a advanced options set as environment variables. Use the `--help` flag to see a list of all supported options.

## FTP Client Support
| Client | Support | Notes |
| --- | --- | --- |
| FileZilla | ✔️ | Tested on 3.65.0 |
| Transmit | ✔️ | Tested on 5.7.0 |
| Windows Explorer | ✔️ | Tested on Windows 11 22H2 - double clicking a file doesn't work, you need to copy it to your local machine first. |
| GNOME Files | ❓ | Flaky, tested on Ubuntu 23.04 |
| WinSCP | ❓ | Defaults to PASV mode. Thinks files are directories, so you can't open files. |
| macOS Finder | ❌ | Empty directory listing. |


## License

This program is licensed under the MIT license.


```
Copyright 2023 foxt (https://foxt.dev)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```