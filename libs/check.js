function isKeyword(field) {
	let keywords = [
		'__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__',
		'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf',
		'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
		'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if',
		'in', 'instanceof', 'import', 'let', 'new', 'return', 'super', 'switch', 'this',
		'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'event', 'randomInt',
		'randomFloat', 'deploy', 'md5e', 'sha256e', 'keccak256', 'base64e', 'base64d', 'NewContract', 'require',
		'constructor', 'init', "tag"
	];

	return keywords.includes(field);
};


function extractParameters(func) {
	let code = func.toString();
	let start = code.indexOf('(') + 1;
	let end = code.indexOf(')');
	let parameters = code.slice(start, end).split(',')
		.map(param => param.trim())
		.filter(param => param !== '');
	return parameters;
};


//ABI,KIP
function checkContract(contract) {
	let ABI = [];
	let prototype = Object.getPrototypeOf(contract);

	if (!contract['init']) {
		throw new Error("Class [Contract] 需要包含init函数")
	}

	Object.keys(contract).forEach(item => {
		if (typeof contract[item] === 'function') {
			throw new Error('itself and its parent class cannot have explicit functions [' + item + ']')
		}
	})

	function get_o_abi(prototype) {
		const descriptors = Object.getOwnPropertyDescriptors(prototype);
		Object.getOwnPropertyNames(prototype).forEach(funcName => {
			
			//检测是否存在异步函数
			if (funcName !== 'constructor' && descriptors[funcName].value.toString().includes('async')) {
				throw new Error('disable async function')
			}
			
			if (typeof prototype[funcName] === 'function') {
				let func = prototype[funcName];
				let params = extractParameters(func);
				//如果是私有函数或者是构造函数名称则跳过
				if (funcName == "constructor" || funcName.startsWith("_")) {
					return
				}
				
				if (!isKeyword(funcName)) {
					ABI.push({
						name: funcName,
						params
					})
				}
			}
		});
		// 递归获取所有原型函数
		const nextPrototype = Object.getPrototypeOf(prototype);
		if (nextPrototype !== null) {
			get_o_abi(nextPrototype);
		}
	}

	//检测ABI
	get_o_abi(prototype);

	//识别合约是否是协议标准
	let kName = KIP_Index(contract)

	//检测结果
	let result = {
		abi: ABI,
		kip: kName
	}

	return result;
};


//系列标准
const KIPS = [{
	//代币
	name: "K20",
	methods: ["$name", "$symbol", "$totalSupply", "$balanceOf", "approve", "increaseAllowance",
		"decreaseAllowance", "$allowance", "transfer", "transferFrom"
	]
}, {
	//铭文
	name: "K10",
	methods: ["$name", "$symbol", "$totalSupply", "$totalSupplyMax", "$mintMax", "$balanceOf", "transfer",
		"mint"
	]
}];


//标准索引
function KIP_Index(contract) {
	let KIP = "K0";
	KIPS.forEach(k => {
		let has = hasMethods(contract, k.methods)
		if (has) {
			KIP = k.name;
			return
		}
	})
	return KIP
}


//检测存在方法
function hasMethods(obj, methods) {
	let prototype = Object.getPrototypeOf(obj)
	let parent = Object.getPrototypeOf(prototype)
	for (let method of methods) {
		if (!prototype.hasOwnProperty(method) && !parent.hasOwnProperty(method)) {
			return false;
		}
	}
	return true;
};