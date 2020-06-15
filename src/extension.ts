// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as functionParser from './functionParser';

//used to indent the commeents as required 
var indentString = require('indent-string');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Running extension: "brightscriptcomment"');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('brightscriptcomment.brightScriptAddComment', () => {

		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World from BrightscriptComment!');

		var lang = undefined;
		var editor = vscode.window.activeTextEditor;
		if (!editor) {
			console.log("No open text editor");
			vscode.window.showInformationMessage("Please open a Brightscript document and highlight a function signature");
			
		}
		if (editor !== undefined) {
			lang = editor.document.languageId;
		
		//	if (lang !== undefined) {
		//		console.log('Lang is ' + lang );
		//	}
		if (lang === "brightscript"){
			var selection = editor.selection;
			var startLine = selection.start.line - 1;
			var selectedText = editor.document.getText(selection);
			var outputMessage: string = 'Please select a Brightscript function signature';

			if (selectedText.length === 0) {
				vscode.window.showInformationMessage(outputMessage);
				return;
			}

			if (functionParser.stripComments(selectedText).length === 0) {
				vscode.window.showInformationMessage(outputMessage);
				return;
			}
			// Split the text sting on the '('
			var selectedTextArray = selectedText.split('(');

			// get the space before the function name eg after Sub or Function 
			var nameStringStart = selectedTextArray[0].lastIndexOf(' ');
			var nameString = selectedTextArray[0].slice(nameStringStart);
			
			// Params and returns are in this string 
			selectedText = selectedTextArray[1];

			// remove the comments from the line if any 
			selectedText = functionParser.stripComments(selectedText);

			//exract the return value 
			var returnText = functionParser.getReturns(selectedText);
			//get the parameters 
			var params: functionParser.ParamDeclaration[] = functionParser.getParameters(selectedText);

			// if there are params or a return 
			if (params.length > 0 ||  returnText.length > 0 || nameString.length> 0) {

				// create the params text 
				var textToInsert = functionParser.getParameterText(params, returnText, nameString);
				//console.log('textToInsert is ' + textToInsert );

				editor.edit((editBuilder: vscode.TextEditorEdit) => {
					if (startLine < 0) {
						//If the function declaration is on the first line in the editor we need to set startLine to first line
						//and then add an extra newline at the end of the text to insert
						startLine = 0;
						textToInsert = textToInsert + '\n';
						}
						//Check if there is any text on startLine. If there is, add a new line at the end
						var temp = vscode.window.activeTextEditor;

						if (temp !== null && temp !== undefined && startLine !== undefined ){
							var lastCharIndex = temp.document.lineAt(startLine).text.length;
							var pos:vscode.Position;
						
							if ((lastCharIndex > 0) && (startLine !== 0)) {
								pos = new vscode.Position(startLine, lastCharIndex);
								textToInsert = '\n' + textToInsert; 	
							}
							else {
								pos = new vscode.Position(startLine, 0);
							}

							var line:string = temp.document.lineAt(selection.start.line).text;
							var firstNonWhiteSpace :number = temp.document.lineAt(selection.start.line).firstNonWhitespaceCharacterIndex;
						
							var stringToIndent: string = '';
							for (var i = 0; i < firstNonWhiteSpace; i++) {
								if (line.charAt(i) === '\t') {
									stringToIndent = stringToIndent + '\t';
								}
								else if (line.charAt(i) === ' ') {
									stringToIndent = stringToIndent + ' ';
								}
							}		
										
							textToInsert = indentString(textToInsert, 1, {"indent":stringToIndent});
							editBuilder.insert(pos, textToInsert);

						}
					}).then(() => {
						
					});
				}

			}
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
