import * as vscode from "vscode";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log("Congratulations, your extension 'wordle' is now active!");

  let disposable = vscode.commands.registerCommand("wordle.start", () => {
    WordlePanel.createOrShow(context.extensionUri);
  });

  context.subscriptions.push(disposable);
}

class WordlePanel {
  public static currentPanel: WordlePanel | undefined;

  public static readonly viewType = "Wordle";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (WordlePanel.currentPanel) {
      WordlePanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      WordlePanel.viewType,
      "Wordle",
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media")],
      }
    );

    WordlePanel.currentPanel = new WordlePanel(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    WordlePanel.currentPanel = new WordlePanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      (e) => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    WordlePanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    this._panel.webview.html = this._getHtmlForWebview();
  }

  private _getHtmlForWebview() {
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.file(
		path.join(this._extensionUri.fsPath, "media", "app.js")
	);

    // And the uri we use to load this script in the webview
    const scriptUri = this._panel.webview.asWebviewUri(scriptPathOnDisk);

    // Local path to css styles
    const stylePathOnDisk = vscode.Uri.file(
		path.join(this._extensionUri.fsPath, "media", "style.css")
	);

	// And the uri we use to load this script in the webview
	const styleUri = this._panel.webview.asWebviewUri(stylePathOnDisk);

    // Use a nonce to only allow specific scripts to be run
    const nonce = uuidv4();

    return `<!DOCTYPE html>
	  <html lang="en">
	  <head>
		  <meta charset="UTF-8">
		  <!--
			  Use a content security policy to only allow loading images from https or from our extension directory,
			  and only allow scripts that have a specific nonce.
		  -->
		  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src ${this._panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <title>Play with graphs</title>
		  <link href="` + styleUri + `" rel="stylesheet">
	  </head>
	  <body>
    <div class="board">
        <div class="word word_0">
            <div class="character_00"></div>
            <div class="character_01"></div>
            <div class="character_02"></div>
            <div class="character_03"></div>
            <div class="character_04"></div>
        </div>
        <div class="word word_1">
            <div class="character_10"></div>
            <div class="character_11"></div>
            <div class="character_12"></div>
            <div class="character_13"></div>
            <div class="character_14"></div>
        </div>
        <div class="word word_2">
            <div class="character_20"></div>
            <div class="character_21"></div>
            <div class="character_22"></div>
            <div class="character_23"></div>
            <div class="character_24"></div>
        </div>
        <div class="word word_3">
            <div class="character_30"></div>
            <div class="character_31"></div>
            <div class="character_32"></div>
            <div class="character_33"></div>
            <div class="character_34"></div>
        </div>
        <div class="word word_4">
            <div class="character_40"></div>
            <div class="character_41"></div>
            <div class="character_42"></div>
            <div class="character_43"></div>
            <div class="character_44"></div>
        </div>
        <div class="word word_5">
            <div class="character_50"></div>
            <div class="character_51"></div>
            <div class="character_52"></div>
            <div class="character_53"></div>
            <div class="character_54"></div>
        </div>
    </div>
    <div class="buttons">
        <div class="row_1 row">
            <button id="Q">Q</button>
            <button id="W">W</button>
            <button id="E">E</button>
            <button id="R">R</button>
            <button id="T">T</button>
            <button id="Y">Y</button>
            <button id="U">U</button>
            <button id="I">I</button>
            <button id="O">O</button>
            <button id="P">P</button>
        </div>
        <div class="row_2 row">
            <button id="A">A</button>
            <button id="S">S</button>
            <button id="D">D</button>
            <button id="F">F</button>
            <button id="G">G</button>
            <button id="H">H</button>
            <button id="J">J</button>
            <button id="K">K</button>
            <button id="L">L</button>
        </div>
        <div class="row_3 row">
            <button id="clear">Clear</button>
            <button id="Z">Z</button>
            <button id="X">X</button>
            <button id="C">C</button>
            <button id="V">V</button>
            <button id="B">B</button>
            <button id="N">N</button>
            <button id="M">M</button>
            <button id="enter">Enter</button>
        </div>
    </div>
    <div class="new">New Game</div>
    <div class="alert"></div>
		<script nonce="${nonce}" src="${scriptUri}"></script>
	  </body>
	  </html>`;
  }
}
