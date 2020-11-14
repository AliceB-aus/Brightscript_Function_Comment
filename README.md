# Brightscript Function Comment

Brightscript Function Comment prints a function definition for the current function name.

Works with both Brightscript functions and Brighterscript functions and class methods in ".brs" or ".bs" files.

## Features

Creates a block comment above a function/sub declaration with all, params and outputs (including default values if available)
Example:

    ''''''''
    ' OpenView:
    '
    ' @param  {Object} content
    ' @param  {String} [viewId=""]
    ' @returns String
    ''''''''
    Function OpenView( content as Object, viewId = "" as String) as String

## Usage

This extension adds a BrightScriptDoc-style comment to a Brightscript function. The comment will be placed as a "snippet" with tab stops to easily allow adding extra detail.

### Command

1. Place cursor before or in the function definition you wish to comment
2. Bring up command pallet with Command + Shift + P
3. Select 'Brightscript Function Comment'
   or
4. Place cursor before or in the function definition you wish to comment
5. Use the keyboard shortcut - Default shortcut is Alt-Ctrl-C (Alt-Cmd-C for Mac).

Comment will appear as above.
If the function is not formatted correctly the comment may fail or be deformed.

### Keyboard Shortcuts

The extension registers keyboard shortcut brightscriptcomment.brightScriptAddComment to execute checking immediately. Default shortcut is Alt-Ctrl-C (Alt-Cmd-C for Mac).

### Completion Item

1. Place cursor before or in the function definition you wish to comment
2. Type `''`, and intellisense window should pop up
3. Use the command `' Brightscript Function Comment`

## Configuration

Brightscript Function Comment has a few options for styling the comments:

- `brightscriptcomment.addJsStyleComments`:
  When enabled, wraps comments in JS-style /\*\* \*/ comment tags. (default - false)
- `brightscriptcomment.addExtraAtStartAndEnd`:
  When enabled, adds extra comment markers at beginning and end (''''') to delineate the comment. (default - true)
- `brightscriptcomment.addFunctionName`:
  When enabled, adds the function name and a colon to the comment. (default - true)
- `brightscriptcomment.useLowercaseTypeName`:
  When enabled, docs will use 'string' or 'object' instead of 'String' or 'Object', etc. (default - false)
- `brightscriptcomment.useSimpleTypeNames`:
  When enabled, docs use 'Integer' and 'LongInteger' instead of 'Int32' and 'Int64' (default - true)
- `brightscriptcomment.useDynamicIfNoTypeGiven`:
  When enabled, params will use 'Dynamic' as their types if no type was given (default - false)
- `brightscriptcomment.addReturnOnVoidFunctions`
  When enabled, functions that are 'as void' and subs will not have the @return tag  (default - false)
- `brightscriptcomment.addReturnOnVoidFunctions`
  When enabled, warns the user when a sub returns a non 'as void' property  (default - true)

## Credit

Credit to https://github.com/microsoft/vscode-comment for the base code used in this project

Many ideas and code samples were used from https://github.com/joelday/vscode-docthis

Thanks to @markwpearce for the help and significant feature uplift 

## Issues and Contributing:

If you have found a bug or you want to suggest some improvements or new functionality, create a pull request or an issue on GitHub.
