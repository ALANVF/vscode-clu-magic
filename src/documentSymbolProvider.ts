import * as vscode from "vscode";
import {SymbolKind} from "vscode";


/*enum DeclKind {
	Cluster,
	OneOf,
	Variant,
	Struct,
	Record,
	Proc,
	Iter,
	Own,
	Value
}*/


function gatherTopSymbols(lines: vscode.TextLine[], startLine: number, stopLine: number) {
	const symbols: vscode.DocumentSymbol[] = [];

	for(let i = startLine; i < stopLine; i++) {
		const line = lines[i];
		const text = line.text;

		let match;

		if(match = text.trim().match(/^([a-zA-Z_]\w*)\s*=\s*(.*)$/)) {
			const [, name, rest] = match;
			const beginNamePos = text.indexOf(name);
			
			if(match = rest.match(/^(cluster|proc|iter)\b/i)) {
				const keyword = match[1].toLowerCase();
				for(let j = i + 1; j < stopLine; j++) {
					const endLine = lines[j];
					const endText = endLine.text;

					if(match = endText.trim().match(new RegExp(`^([eE][nN][dD])\\s+(${name})\\b`))) {
						const endNamePos = endText.indexOf(name);

						let kind: SymbolKind;
						let repIsNull = false;
						if(keyword === "cluster") {
							for(let k = i + 1; k < j; k++) {
								if(lines[k].text.trim().match(/^rep\s*=\s*null\s*(?:$|%)/i)) {
									repIsNull = true;
									break;
								}
							}

							kind = repIsNull ? SymbolKind.Module : SymbolKind.Class;
						} else {
							kind = SymbolKind.Function;
						}

						const symbol = new vscode.DocumentSymbol(
							name,
							"",
							kind,
							new vscode.Range(
								i, beginNamePos,
								j, endNamePos + name.length
							),
							new vscode.Range(
								i, beginNamePos,
								i, beginNamePos + name.length
							)
						);

						symbols.push(symbol);

						if(keyword === "cluster") {
							const contents = gatherClusterSymbols(
								lines,
								i + 1,
								j,
								repIsNull ? SymbolKind.Function : SymbolKind.Method
							);

							symbol.children = contents;
						} else {
							// ...
						}

						i = j;

						break;
					}
				}
			}
		}
	}

	return symbols;
}

function gatherClusterSymbols(lines: vscode.TextLine[], startLine: number, stopLine: number, procKind: SymbolKind) {
	const symbols: vscode.DocumentSymbol[] = [];

	for(let i = startLine; i < stopLine; i++) {
		const line = lines[i];
		const text = line.text;

		let match;

		if(match = text.trim().match(/^([a-zA-Z_]\w*)\s*=\s*(.*)$/)) {
			const [, name, rest] = match;
			const beginNamePos = text.indexOf(name);
			
			if(match = rest.match(/^(proc|iter)\b/i)) {
				for(let j = i + 1; j < stopLine; j++) {
					const endLine = lines[j];
					const endText = endLine.text;

					if(match = endText.trim().match(new RegExp(`^([eE][nN][dD])\\s+(${name})\\b`))) {
						const endNamePos = endText.indexOf(name);

						symbols.push(
							new vscode.DocumentSymbol(
								name,
								"",
								procKind,
								new vscode.Range(
									i, beginNamePos,
									j, endNamePos + name.length
								),
								new vscode.Range(
									i, beginNamePos,
									i, beginNamePos + name.length
								)
							)
						);

						break;
					}
				}
			}
		}
	}

	return symbols;
}


export class CLUDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	async provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken) {
		const lines = [];
		
		for(let i = 0; i < document.lineCount; i++) {
			lines.push(document.lineAt(i));
		}
		
		const symbols = gatherTopSymbols(lines, 0, lines.length);

		return symbols;
	}
}