# brightscriptcomment README

Brightscript Comment prints a function definition for the highlighted function name

## Features

Creates a block comment above a function/sub declaration with all, params and outputs (including default values if available)
Example: 

    ''''''''
    ' OpenView:
    '
    ' @param  {String} viewId=""
    ' @param  {Object} content
    ' @returns String
    ''''''''
    Function OpenView(viewId = "" as String,content as Object) as String

## To Use:
1. Highlight the whole line with the function definition you wish to comment 
2. Bring up command pallet with Command + Shift + P 
3. Select 'Brightscript Function Comment'
or
1. Highlight the whole line with the function definition you wish to comment 
2. Use the keyboard shortcut - Default shortcut is Alt-Ctrl-C (Alt-Cmd-C for Mac).

Comment will appear as above. 
If the function is not formatted correctly the comment will fail or be deformed. 

Credit to https://github.com/microsoft/vscode-comment for the base code used in this project

## Keyboard Shortcuts:

The extension registers keyboard shortcut brightscriptcomment.brightScriptAddComment to execute checking immediately. Default shortcut is Alt-Ctrl-C (Alt-Cmd-C for Mac).

## Issues and Contributing:

If you have found a bug or you want to suggest some improvements or new functionality, create a pull request or an issue on GitHub.