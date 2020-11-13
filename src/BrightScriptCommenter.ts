import * as bs from "brighterscript";
import * as vscode from 'vscode';
import { SnippetStringBuilder } from "./SnippetStringBuilder";

export const AcceptableLanguages = ["brightscript", "brighterscript"];
const GeneralErrorMessage = "Please open a Brightscript document and place cursor on or before function signature";
export const CompletionInitiator = "''";


/**
 *
 *
 * @export
 * @param {vscode.TextEditor} editor
 * @returns {boolean}
 */
export function checkDocumentLanguage(editor: vscode.TextEditor): boolean {
  const lang = editor.document.languageId;

  if (!AcceptableLanguages.includes(lang)) {
    const error = `Invalid language: ${lang}`;
    vscode.window.showWarningMessage(GeneralErrorMessage + " - " + error);
    return false;
  }
  return true;
}


/**
 * Utility interface to get multiple details back from BrightScriptCommenter.getFunctionStatementForLine()
 *
 * @interface FunctionAtLine
 */
interface FunctionAtLine {
  funcStmt?: bs.FunctionStatement;
  lineNumber?: number;
  lineOfCode?: string;
  cameToEndOfFunction?: boolean
}


/**
 * Main class used to add a BrightScriptDoc comment a Bright(er)script function based on cursor placement in a vscode editor
 *
 * @export
 * @class BrightScriptCommenter
 */
export class BrightScriptCommenter {
  private parser: bs.Parser = new bs.Parser();
  private addJsStyleComments = false;
  private addExtraAtStartAndEnd = true;
  private addFunctionName = true;
  private useLowercaseTypeNames = false;
  private useSimpleTypeNames = true;
  private useDynamicIfNoTypeGiven = false;

  constructor() {
  }


  private refreshCurrentConfig(): void {
    this.addJsStyleComments = vscode.workspace.getConfiguration().get(`brightscriptcomment.addJsStyleComments`, false);
    this.addExtraAtStartAndEnd = vscode.workspace.getConfiguration().get(`brightscriptcomment.addExtraAtStartAndEnd`, true);
    this.addFunctionName = vscode.workspace.getConfiguration().get(`brightscriptcomment.addFunctionName`, true);
    this.useLowercaseTypeNames = vscode.workspace.getConfiguration().get(`brightscriptcomment.useLowercaseTypeNames`, false);
    this.useSimpleTypeNames = vscode.workspace.getConfiguration().get(`brightscriptcomment.useSimpleTypeNames`, true);
    this.useDynamicIfNoTypeGiven = vscode.workspace.getConfiguration().get(`brightscriptcomment.useDynamicIfNoTypeGiven`, false);
  }


  /**
   * Adds a BrightScriptDoc comment as a snippet to the nearest function declaration
   *
   * @param {boolean} [forCompletion=false]
   * @returns {void}
   * @memberof BrightScriptCommenter
   */
  addComment(forCompletion = false): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      console.log("No open text editor");
      vscode.window.showInformationMessage(GeneralErrorMessage);
      return;
    }
    this.refreshCurrentConfig();

    const selection = editor.selection;
    const caret = selection.start;
    const currentLine = caret.line;
    const outputMessage: string = 'Place cursor on or before a Brightscript function signature';

    editor.edit((editBuilder: vscode.TextEditorEdit) => {
      if (forCompletion) {
        let placeModifier = 0;
        const replaceRange = new vscode.Range(caret.translate(0, -CompletionInitiator.length),
          caret);

        editBuilder.delete(replaceRange);
      }
    }).then(() => {
      let funcStmtAtLine = <FunctionAtLine>this.getFunctionStatementForLine(editor.document, currentLine)
        || this.getFunctionStatementForLine(editor.document, currentLine, true);

      const funcStmt = funcStmtAtLine?.funcStmt;
      const commentStartLine = <number>funcStmtAtLine?.lineNumber;

      if (!funcStmt || undefined === commentStartLine) {
        vscode.window.showInformationMessage(outputMessage);
        return;
      }

      const paramsLines = this.getParametersLines(funcStmtAtLine);
      const returnText = this.getReturnText(funcStmt.func);
      const snippetToInsert = this.getCommentSnippet(paramsLines, returnText, funcStmt.name.text);
      // Find place where snippet should be inserted
      const firstNonWhiteSpace = editor.document.lineAt(commentStartLine).firstNonWhitespaceCharacterIndex;
      const commentPos = new vscode.Position(commentStartLine, firstNonWhiteSpace);
      editor.insertSnippet(snippetToInsert, commentPos);
    });
  };


  /**
   * Finds the next function declaration based on a given line of code
   * @private
   * @param {vscode.TextDocument} document
   * @param {number} startLine
   * @param {boolean} [searchUp=false] If this is true, it searches before the current line
   * @returns {(FunctionAtLine | undefined)}
   * @memberof BrightScriptCommenter
   */
  private getFunctionStatementForLine(document: vscode.TextDocument, startLine: number, searchUp = false): FunctionAtLine | undefined {
    let textLine;
    let currentLine = startLine;
    let funcStmtResult;
    let searchLineDelta = searchUp ? -1 : +1;
    while (currentLine < document.lineCount && currentLine >= 0) {
      textLine = document.lineAt(currentLine);
      funcStmtResult = this.getFunctionStatement(textLine.text);
      if (funcStmtResult) {
        if (funcStmtResult.cameToEndOfFunction) {
          return undefined;
        }
        return { ...funcStmtResult, lineNumber: currentLine };
      }
      currentLine += searchLineDelta;
    }
    return undefined;
  }

  /**
   * Gets a function statement (if it exists) for a line of code
   * Ignores method modifiers (override, private, etc)
   *
   * @private
   * @param {string} sourceLine
   * @returns {(FunctionStatementSearchResult | undefined)}
   * @memberof BrightScriptCommenter
   */
  private getFunctionStatement(sourceLine: string): FunctionAtLine | undefined {
    // Get the first line that is a sub or function, remove modifiers, and close off the function, so it can be parsed
    let isFunc = false, isSub = false, endOfFunction = false;
    let funcLine = sourceLine.split("\n")
      .map(line => line.trim().replace(/^\s*((private)|(public)|(override)|\s*)*\s*/, ""))
      .filter(line => line)
      .find(line => {
        // simplify the line to check for sub or function
        const brsLine = line.toLowerCase();

        isSub = brsLine.startsWith("sub ");
        isFunc = brsLine.startsWith("function ");

        endOfFunction = brsLine.startsWith("end sub") || brsLine.startsWith("end function");

        return isFunc || isSub || endOfFunction;
      });
    if (endOfFunction) {
      return { cameToEndOfFunction: true };
    }
    if (!funcLine) {
      return;
    }
    const lineOfCode = funcLine;


    // End the statement, so it can be parsed
    if (isFunc) {
      funcLine += "\nend function\n";
    }
    else if (isSub) {
      funcLine += "\nend sub\n";
    }

    const lexResult = bs.Lexer.scan(funcLine);
    const parseResult = this.parser.parse(lexResult.tokens);
    const statements = parseResult.statements;
    let funcStmtResult = <bs.FunctionStatement>statements.find(stmt => stmt instanceof bs.ClassMethodStatement);

    if (!funcStmtResult) {
      funcStmtResult = <bs.FunctionStatement>statements.find(stmt => stmt instanceof bs.FunctionStatement);
    }

    return { funcStmt: funcStmtResult, lineOfCode };
  }



  /**
   * Gets the comment lines for the parameters in a function expression
   *
   * @param {FunctionAtLine} funcExpr
   * @param {string} funcExprLineOfCode
   * @returns {string[]}
   * @memberof BrightScriptCommenter
   */
  private getParametersLines(funcExpr: FunctionAtLine): string[] {
    const paramsText = (funcExpr.funcStmt?.func.parameters || []).map((param) => {
      const paramTypeText = this.getTypeName(param.type.kind, param.asToken);
      let paramNameText = param.name.text;
      if (param.defaultValue) {
        const start = param.defaultValue.range.start;
        const end = param.defaultValue.range.end;
        const defaultValue = funcExpr.lineOfCode?.slice(start.character, end.character);
        paramNameText = `[${param.name.text}=${defaultValue}]`;
      }
      return `@param {${paramTypeText}} ${paramNameText}`;
    });

    return paramsText;
  }

  /**
   * Gets the comment lines for the return value in a function expression
   *
   * @private
   * @param {bs.FunctionExpression} funcExpr
   * @returns {string}
   * @memberof BrightScriptCommenter
   */
  private getReturnText(funcExpr: bs.FunctionExpression): string {
    let returnStr = "";
    if (!funcExpr.functionType?.text.toLowerCase().includes("sub")) {
      // this is not a sub, but a function
      // include a @returns line
      let returnType = "";
      if (funcExpr.returnTypeToken) {
        returnType = this.getTypeName(funcExpr.returnTypeToken);
      }
      else {
        returnType = this.getTypeName(funcExpr.returns);
      }
      if (returnType) {
        returnStr = `@return {${returnType}}`;
      }
      else {
        returnStr = `@return`;
      }
    }
    return returnStr;
  }

  /**
   * Returns the whole BrightScriptDoc comment as a snippet, with tabstops
   *
   * @private
   * @param {string[]} [paramsLines=[]]
   * @param {string} [returnText='']
   * @param {string} [functionName='']
   * @returns {vscode.SnippetString}
   * @memberof BrightScriptCommenter
   */
  private getCommentSnippet(paramsLines: string[] = [], returnText: string = '', functionName: string = ''): vscode.SnippetString {
    const ssb = new SnippetStringBuilder(this.addJsStyleComments, this.addExtraAtStartAndEnd);
    if (this.addFunctionName) {
      ssb.append(`${functionName}: `);
    }
    ssb.appendSnippetTabstop()
      .appendLine()
      .appendLine();
    paramsLines.forEach(paramLine => {
      ssb.append(paramLine).appendSnippetTabstop().appendLine();
    });
    if (returnText) {
      ssb.append(returnText).appendSnippetTabstop().appendLine();
    }
    return ssb.toCommentValue();
  }

  /**
   * Gets the type name for the given type
   * Defaults to "Dynamic" if it can't decide
   *
   * @param { number | bs.Token } type id or Type Token
   * @param { bs.Token } token actual token for the type name
   * @returns {string} the name for the type id given
   */
  private getTypeName(type: number | bs.Token, token?: bs.Token): string {
    let typeName = this.useDynamicIfNoTypeGiven ? "Dynamic" : "";
    if (type) {
      if (typeof type === "number") {
        const valueKind = bs.ValueKind[type];
        if (valueKind) {
          typeName = valueKind.toString();
          if (this.useSimpleTypeNames) {
            if (typeName === "Int32") {
              typeName = "Integer";
            }
            else if (typeName === "Int64") {
              typeName = "LongInteger";
            }
          }

          if (this.useLowercaseTypeNames) {
            typeName = typeName.toLowerCase();
          }

          if (typeName.toLowerCase() === "dynamic" && !token && !this.useDynamicIfNoTypeGiven) {
            // no actual type was used in the definition, and config says not to use "dynamic"
            typeName = "";
          }
        }
      }
      else if ((<bs.Token>type).text) {
        // if we can only look at the text value, just go ahead and use that
        typeName = type.text;
      }
    }
    return typeName;
  }


}