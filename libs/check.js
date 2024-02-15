function isKeyword(field) {
	return ["__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__", "hasOwnProperty",
		"isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf", "break", "case", "catch",
		"class", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "extends", "finally",
		"for", "function", "if", "in", "instanceof", "import", "let", "new", "return", "super", "switch", "this",
		"throw", "try", "typeof", "var", "void", "while", "with", "yield", "event", "randomInt", "randomFloat",
		"deploy", "md5e", "sha256e", "keccak256", "base64e", "base64d", "NewContract", "require", "constructor",
		"init", "tag"
	].includes(field)
}

function extractParameters(func) {
	var func = func.toString(),
		start = func.indexOf("(") + 1,
		end = func.indexOf(")");
	return func.slice(start, end).split(",").map(param => param.trim()).filter(param => "" !== param)
}

function checkContract(contract) {
	let ABI = [];
	var prototype = Object.getPrototypeOf(contract);
	if (!contract.init) throw new Error("Class [Contract] 需要包含init函数");
	Object.keys(contract).forEach(item => {
			if ("function" == typeof contract[item]) throw new Error(
				"itself and its parent class cannot have explicit functions [" + item + "]")
		}),
		function get_o_abi(prototype) {
			const descriptors = Object.getOwnPropertyDescriptors(prototype);
			Object.getOwnPropertyNames(prototype).forEach(funcName => {
				var dsv = descriptors[funcName].value;
				if (dsv && "constructor" != funcName && dsv.toString().includes("async")) throw new Error(
					"disable async function");
				"function" == typeof prototype[funcName] && (dsv = extractParameters(prototype[funcName]),
					"constructor" == funcName || funcName.startsWith("_") || isKeyword(funcName) || ABI
					.push({
						name: funcName,
						params: dsv
					}))
			});
			var nextPrototype = Object.getPrototypeOf(prototype);
			null !== nextPrototype && get_o_abi(nextPrototype)
		}(prototype);
	prototype = KIP_Index(contract);
	return {
		abi: ABI,
		kip: prototype
	}
}
const KIPS = [{
	name: "K20",
	methods: ["$name", "$symbol", "$totalSupply", "$balanceOf", "approve", "increaseAllowance",
		"decreaseAllowance", "$allowance", "transfer", "transferFrom"
	]
}, {
	name: "K10",
	methods: ["$name", "$symbol", "$totalSupply", "$totalSupplyMax", "$mintMax", "$balanceOf", "transfer",
		"mint"
	]
}];

function KIP_Index(contract) {
	let KIP = "K0";
	return KIPS.forEach(k => {
		hasMethods(contract, k.methods) && (KIP = k.name)
	}), KIP
}

function hasMethods(obj, methods) {
	var method, prototype = Object.getPrototypeOf(obj),
		parent = Object.getPrototypeOf(prototype);
	for (method of methods)
		if (!prototype.hasOwnProperty(method) && !parent.hasOwnProperty(method)) return !1;
	return !0
}