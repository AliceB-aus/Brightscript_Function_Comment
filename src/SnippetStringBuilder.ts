import * as vs from 'vscode';

const BrsCommentHeader = "''''''''";

/**
 * This is taken from https://github.com/joelday/vscode-docthis
 *
 * @export
 * @class StringBuilder
 */
export class StringBuilder {
  private _text = "";

  append(text = "") {
    this._text += text.toString();
  }

  appendLine(text = "") {
    this._text += text.toString() + "\n";
  }

  toString() {
    return this._text;
  }
}


/**
 * This is taken from https://github.com/joelday/vscode-docthis
 *
 * @export
 * @class SnippetStringBuilder
 */
export class SnippetStringBuilder {
  private readonly _snippet = new vs.SnippetString();

  constructor(private addJsStyleComments = false, private addExtraAtStartAndEnd = false) { }

  append(value: string) {
    this._snippet.appendText(value.toString());

    return this;
  }

  appendLine(value: string = "") {
    this.append(value.toString() + "\n");
    return this;
  }

  appendSnippetTabstop(index?: number) {
    this._snippet.appendTabstop(index);

    return this;
  }

  appendSnippetPlaceholder(value: string | ((snippet: vs.SnippetString) => any), index?: number) {
    this._snippet.appendPlaceholder(value, index);

    return this;
  }

  appendSnippetVariable(name: string, defaultValue: string | ((snippet: vs.SnippetString) => any)) {
    this._snippet.appendVariable(name, defaultValue);

    return this;
  }

  // Added to setup comments in Brightscript style
  private strToCommentLine(str: string, forceNoJsStyleComments = false, ignoreSpaceBeforeCommentString = false): string {
    const useJsStyleComments = this.addJsStyleComments && !forceNoJsStyleComments;
    const prefix = `${!ignoreSpaceBeforeCommentString ? ' ' : ''}${useJsStyleComments ? ' * ' : ''}`;
    return `'${prefix}${str}`;
  }

  toCommentValue() {
    let sb = new StringBuilder();

    if (this.addExtraAtStartAndEnd) {
      sb.appendLine(this.strToCommentLine(BrsCommentHeader, true, true));
    }
    if (this.addJsStyleComments) {
      sb.appendLine(this.strToCommentLine("/**", true));
    }

    const lines = this._snippet.value.split("\n");
    lines.forEach((line, i) => {
      if (line === "" && i === lines.length - 1) {
        return;
      }
      sb.appendLine(this.strToCommentLine(line));
    });


    if (this.addJsStyleComments) {
      sb.appendLine(this.strToCommentLine(" */", true));
    }
    if (this.addExtraAtStartAndEnd) {
      sb.appendLine(this.strToCommentLine(BrsCommentHeader, true, true));
    }


    return new vs.SnippetString(sb.toString());
  }
}