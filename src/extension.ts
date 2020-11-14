// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BrightScriptCommenter, checkDocumentLanguage, AcceptableLanguages, CompletionInitiator } from "./BrightScriptCommenter";

let brsCommenter: BrightScriptCommenter;

/**
 * Initialize a BrightScriptCommenter instance, if it hasn't been done yet
 *
 */
function lazyInitializeCommenter() {
  if (!brsCommenter) {
    brsCommenter = new BrightScriptCommenter();
  }
}

function runCommand(editor: vscode.TextEditor, implFunc: () => void) {
  if (!editor || !checkDocumentLanguage(editor)) {
    return;
  }

  try {
    lazyInitializeCommenter();
    implFunc();
  }
  catch (e) {
    debugger;
    console.error(e);
  }
}


/**
 * Mostly cribbed from https://github.com/joelday/vscode-docthis
 * CompletionItem class for use when launched from intellisense
 *
 * @class BrightscriptFunctionCommentCompletionItem
 * @extends {vscode.CompletionItem}
 */
class BrightscriptFunctionCommentCompletionItem extends vscode.CompletionItem {
  constructor(document: vscode.TextDocument, position: vscode.Position) {
    super("' Brightscript Function Comment", vscode.CompletionItemKind.Snippet);
    this.insertText = "";
    this.sortText = "\0";

    this.command = {
      title: "Brightscript Function Comment",
      command: "brightscriptcomment.brightScriptAddComment",
      arguments: [true]
    };
  }
}




// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Running extension: "brightscriptcomment"');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const addCommentCommand = vscode.commands.registerCommand('brightscriptcomment.brightScriptAddComment', (forCompletion = false) => {

    runCommand(<vscode.TextEditor>vscode.window.activeTextEditor, () => {
      brsCommenter.addComment(forCompletion);
    });

  });

  context.subscriptions.push(addCommentCommand);

  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
    AcceptableLanguages,
    {
      provideCompletionItems: (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) => {
        const line = document.lineAt(position.line).text;
        const prefix = line.slice(0, position.character);

        const matches = prefix.match(/^\s*$|\'\'\s*$|^\s*\'\'\s*$/);
        if (matches) {
          return [new BrightscriptFunctionCommentCompletionItem(document, position)];
        }

        return;
      }
    }, "'", "'"));
}

// this method is called when your extension is deactivated
export function deactivate() { }
