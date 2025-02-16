const r = require("ts-morph");
let Project = r.Project;
console.log(process.argv[2]);
const project = new Project();
const sourceFile = project.addSourceFileAtPath(process.argv[2]); // Change to your file

const functions = sourceFile.getFunctions();

for (let f of functions){
	s = f.getName() + "(";
	type_str = [];
 	for(let param of f.getParameters()){
		type_str.push(param.getName() + " : " + param.getType().getText());
	}
	s += type_str.join(", ");
	s += ")";
	console.log(s);
}
