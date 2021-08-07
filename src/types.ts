import {TextDocument, Position, Range} from "vscode";


type TypeParams = {
	
};


type Cluster = {
	kind: "cluster"

	document: TextDocument	
	range: Range

	name: string

	
}


/*type Proc = {
	kind: "proc"
	name: string
	typeParams
}*/