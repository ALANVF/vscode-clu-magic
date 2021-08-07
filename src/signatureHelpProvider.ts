import {TextDocument, Position} from "vscode";
import * as vscode from "vscode";


export class CLUSignatureHelpProvider implements vscode.SignatureHelpProvider {
	async provideSignatureHelp(document: TextDocument, position: Position, token: vscode.CancellationToken) {
		//const help = new vscode.SignatureHelp();

		this.tryGetCall(document, position);

		return null;
	}

	tryGetCall(doc: TextDocument, pos: Position) {
		let line = doc.lineAt(pos);
		let text = line.text;
		let posChar = pos.character;
		//let left = text.slice(0, pos.character);
		//let right = text.slice(pos.character);
		
		type Token = [isString: boolean, begin: number, end: number, text: string];
		function genTokens(text: string, start: number): Token[] {
			const tokens: Token[] = [];

			const sq = text.indexOf("'", start);
			const dq = text.indexOf('"', start);
			const cm = text.indexOf("%", start);
			
			const sqe = sq !== -1;
			const dqe = dq !== -1;

			if(cm !== -1 && ((sqe && cm < sq) || (dqe && cm < dq))) {
				return [];
			}

			const gen = (idx: number, str: string) => {
				if(dq > 0) {
					tokens.push([true, start, idx - 1, text.slice(start, idx)]);
				}

				const end = text.indexOf(str, idx + 1);

				if(end === -1) {
					return;
				}

				tokens.push([true, idx, end, text.slice(idx, end + 1)]);
				
				if(end !== text.length) {
					tokens.push(...genTokens(text, end + 1));
				}
			}

			if(!sqe && !dqe) {
				return [[false, start, text.length-1, text.slice(start)]];
			} else {
				if(!sqe) {
					gen(dq, '"');
				} else if(!dqe) {
					gen(sq, "'");
				} else {
					if(sq < dq) {
						gen(sq, "'");
					} else {
						gen(dq, '"');
					}
				}

				return tokens;
			}
		}

		const lineTokens = genTokens(text, 0);
		console.log(lineTokens);
		//const relevantTokens = lineTokens.filter(([begin, end, _]) => begin <= pos.character && pos.character <= end);

		const foundTokens = lineTokens.filter(([isString, _, __, value]) => {
			if(isString) {
				return false
			} else {
				let match;
				
				if(match = value.match(/(\b[a-zA-Z_]\w*|\])\(/)) {
					const fn = match[1].toLowerCase();
					switch(fn) {
						case "proc":
						case "iter":
						case "returns":
						case "yields":
						case "signals":
						case "return":
						case "yield":
						case "up":
						case "down": {
							return false;
						}
						default: {
							return true;
						}
					}
				} else {
					return false;
				}
			}
		});

		let foundToken;
		if(foundToken = foundTokens.find(([_, begin, end, value]) => begin <= posChar && posChar <= end)) {
			console.log(foundToken);
		}

		return null;
	}
}