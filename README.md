# brightscriptcomment README

Brightscript Comment creates a function definition for the selected function name

## Features

Creates a block comment above a function/sub declaration with all params (default and type values if avaiable) and outputs  
Example: 

 ``'''''''`
 `' OpenView:`    
 `'`   
 `' @param  {String} viewId=""`   
 `' @param  {Object} content=invalid`   
 `' @returns String`   
 `''''''''`   
`Sub OpenView(viewId = "" as String,content = invalid as Object) as String`

1. Highlight the whole function definition you wish to comment 
2. Run with Command + Shift + P 
3. Select 'Brightscript Function Comment'

Comment will appear above function definition. If the function is not formatted correctly the comment will fail or be misformed 

Credit to 
https://github.com/microsoft/vscode-comment
for the base code used in this project 
