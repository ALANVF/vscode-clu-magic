import * as vscode from "vscode";
import {workspace, ExtensionContext} from "vscode";

import {CLUDocumentSymbolProvider} from "./documentSymbolProvider";
import { CLUSignatureHelpProvider } from "./signatureHelpProvider";

export function activate(context: ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerDocumentSymbolProvider(
			[{language: "clu", scheme: "file"}],
			new CLUDocumentSymbolProvider()
		)
	);

	/*context.subscriptions.push(
		vscode.languages.registerSignatureHelpProvider(
			[{language: "clu", scheme: "file"}],
			new CLUSignatureHelpProvider(),
			"(", ","
		)
	);*/
}

export function deactivate() {}