var Date = null;
let _callList = [],
	_originalFunc = [],
	_callMap = {},
	_Caller = function(address, cScript, msgSender) {
		if (!address) throw new Error("invalid address");
		let Obj = null,
			exist = !1,
			callIndex = null;
		try {
			if (_callMap[address]) {
				exist = !0, Obj = _callMap[address];
				for (var i = 0; i < _callList.length; i++)
					if (_callList[i].addr === address) {
						callIndex = i;
						break
					}
			}
			if (!exist) {
				if (Obj = cScript ? loadContract(address, cScript) : loadContract(address), Obj.initLock) {
					let _keys = {},
						pTypeOf = (Obj && Object.keys(Obj).forEach(item => {
							function genKeys(obj, name) {
								if ("object" == typeof obj && obj)
									if (obj.tag) {
										let tagObj = getTagObject(obj.tag);
										Object.keys(obj).forEach(k => {
											tagObj[k] = obj[k]
										}), obj = tagObj
									} else Object.keys(obj).forEach($ => {
										"object" == typeof obj[$] && (obj[$] = genKeys(obj[$], $)),
											"string" == typeof obj[$] && isFuncStr(obj[$]) && (_keys[
												name + "." + $] = obj[$], eval("obj." + $ + " = " +
												obj[$]))
									});
								return obj
							}
							Obj[item] = genKeys(Obj[item], item)
						}), Object.getPrototypeOf(Obj));

					function protoKeys(prototype) {
						Object.getOwnPropertyNames(prototype).forEach(item => {
							let obj = prototype[item];

							function genKeys(obj, name) {
								if ("object" == typeof obj) {
									if (obj)
										if (obj.tag) {
											let tagObj = getTagObject(obj.tag);
											Object.keys(obj).forEach(k => {
												tagObj[k] = obj[k]
											}), obj = tagObj
										} else Object.keys(obj).forEach($ => {
											"object" == typeof obj[$] && (obj[$] = genKeys(obj[$], $)),
												"string" == typeof obj[$] && isFuncStr(obj[$]) && (
													_keys[name + "." + $] = obj[$], eval("obj." + $ +
														" = " + obj[$]))
										});
									return obj
								}
							}
							obj = genKeys(obj, item);
							const nextPrototype = Object.getPrototypeOf(prototype);
							null !== nextPrototype && protoKeys(nextPrototype)
						})
					}
					protoKeys(pTypeOf), _originalFunc.push(_keys)
				}
				Obj.Caller = caller, Obj.address = address, Obj.height = height, Obj.msgSender = msgSender, Obj
					.txOrigin = sender, Obj.timeStamp = timeStamp, Obj.txHash = txHash, Obj.memo = memo, Obj.event =
					function(data) {
						if ("object" != typeof data || null === data) throw new Error("event is not object");
						if (!isFirstKey(data, "name")) throw new Error("event firstKey is not name");
						null != this.events && null != this.events || (this.events = []), this.events.push(data)
					}, Obj.randomInt = function(min, max) {
						let nStr = "0";
						var mNumbers = Obj.msgSender.match(/\d+/g),
							mNumbers = (3 <= mNumbers.length ? nStr = mNumbers[0] + mNumbers[1] + mNumbers[2] : 0 <
								mNumbers.length && (nStr = mNumbers[0]), Number(nStr)),
							timeStamp = Number(Obj.timeStamp);
						return random(timeStamp + mNumbers, min, max, !1)
					}, Obj.randomFloat = function(min, max) {
						let nStr = "0";
						var mNumbers = Obj.msgSender.match(/\d+/g),
							mNumbers = (3 <= mNumbers.length ? nStr = mNumbers[0] + mNumbers[1] + mNumbers[2] : 0 <
								mNumbers.length && (nStr = mNumbers[0]), Number(nStr)),
							timeStamp = Number(Obj.timeStamp);
						return random(timeStamp + mNumbers, min, max, !0)
					};
				let writableNames = ["memo", "address", "msgSender", "height", "txOrigin", "timeStamp", "txHash",
					"Caller", "randomInt", "randomFloat", "event", "deploy", "HashA", "HashB"
				];
				writableNames.forEach(name => {
					Object.defineProperty(Obj, name, {
						writable: !1
					})
				}), _callMap[address] = Obj, _callList.push({
					addr: address,
					values: Obj
				})
			}
		} catch (e) {
			throw e
		}
		const callObj = {
			call(method, ...args) {
				function checkParams(...args) {
					if (Array.isArray(args)) args.forEach(item => {
						if (isFuncStr(item)) {
							let eScript = "this['_func']=" + item;
							if ("function" == typeof eval(eScript)) throw new Error(
								"params cant not is func.toString()")
						}
					});
					else if (isFuncStr(args)) {
						let eScript = "this['_func']=" + args;
						if ("function" == typeof eval(eScript)) throw new Error(
							"params cant not is func.toString()")
					}
				}
				if (checkParams(args), "_" === method[0]) throw new Error("inaccessible private attribute", method);
				try {
					var contract = _callMap[address];
					if ("init" === method && contract.initLock) throw new Error("init is locked...");
					let result = contract[method](...args),
						rType = typeof result;
					return "function" === rType ? result = "function" : "object" === rType && (result = JSON
						.stringify(result)), result
				} catch (e) {
					throw e
				}
			}
		};
		return callObj
	},
	callLock = !1,
	_call = function(kid, method, args) {
		function checkParams(...args) {
			if (Array.isArray(args)) args.forEach(item => {
				if (isFuncStr(item)) {
					let eScript = "this['_func']=" + item;
					if ("function" == typeof eval(eScript)) throw new Error(
						"params cant not is func.toString()")
				}
			});
			else if (isFuncStr(args)) {
				let eScript = "this['_func']=" + args;
				if ("function" == typeof eval(eScript)) throw new Error("params cant not is func.toString()")
			}
		}
		if (checkParams(args), "_" === method[0]) throw new Error("inaccessible private attribute", method);
		if (1 == callLock) throw new Error("call is locked...");
		callLock = !0;
		try {
			disableFunc();
			let contract = _callMap[kid];
			if ("init" === method && contract.initLock) throw new Error("init is locked...");
			let result = contract[method](...args),
				rType = typeof result;
			return "function" === rType ? result = "function" : "object" === rType && (result = JSON.stringify(result)),
				result
		} catch (e) {
			throw e
		}
	},
	isFuncStr = function(str) {
		return /^\s*function\s?\w?\([^)]*\)\s*{[\s\S]*}$/i.test(str)
	};

function callIndexState() {
	var callArry = [];
	for (let index = 0; index < _callList.length; index++) {
		let call = _callList[index].values;
		call && Object.keys(call).forEach(item => {
			var func, str, pType = typeof call[item];

			function func2Str(obj, objName, index) {
				if (obj) {
					if (obj.tag) return obj;
					Object.keys(obj).forEach(cItem => {
						var t, str;
						isKeyword_common(cItem) || ("object" == typeof obj[cItem] && (obj[cItem] =
							func2Str(obj[cItem], cItem, index)), "function" == (t = typeof obj[
							cItem]) && "constructor" != t && (_originalFunc.length == _callList
							.length ? obj[cItem] = _originalFunc[index][objName + "." + cItem] :
							(str = (t = obj[cItem]).toString(), str = /{\s*([\s\S]*?)?.*}/g
								.exec(str), t = extractParameters(t), str = str[0], obj[cItem] =
								"function(" + t.toString() + ")" + str)))
					}), ! function pFunc(prototype) {
						Object.getOwnPropertyNames(prototype).forEach(funcName => {
							var func, str;
							isKeyword_common(funcName) || ("object" == typeof prototype[funcName] &&
								(prototype[funcName] = func2Str(prototype[funcName], funcName,
									index)), "function" == typeof prototype[funcName] &&
								"constructor" != funcName && (_originalFunc.length == _callList
									.length ? obj[funcName] = _originalFunc[index][objName +
										"." + funcName
									] : (str = (func = prototype[funcName]).toString(), str =
										/{\s*([\s\S]*?)?.*}/g.exec(str), func =
										extractParameters(func), str = str[0], obj[funcName] =
										"function(" + func.toString() + ")" + str)))
						});
						var nextPrototype = Object.getPrototypeOf(prototype);
						null !== nextPrototype && pFunc(nextPrototype)
					}(Object.getPrototypeOf(obj))
				}
				return obj
			}
			"function" == pType && (_originalFunc.length == _callList.length ? call[item] = _originalFunc[index]
				[item] : (str = (func = call[item]).toString(), str = /{\s*([\s\S]*?)?.*}/g.exec(str),
					func = extractParameters(func), str = str[0], call[item] = "function(" + func
				.toString() + ")" + str)), "object" == pType && (call[item] = func2Str(call[item], item,
				index))
		}), _callList[index].values = call, callArry.push(_callList[index])
	}
	return _callList
}

function extractParameters(func) {
	var func = func.toString(),
		start = func.indexOf("(") + 1,
		end = func.indexOf(")");
	return func.slice(start, end).split(",").map(param => param.trim()).filter(param => "" !== param)
}

function isKeyword_common(field) {
	return ["__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__", "hasOwnProperty",
		"isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf", "break", "case", "catch",
		"class", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "extends", "finally",
		"for", "function", "if", "in", "instanceof", "import", "let", "new", "return", "super", "switch", "this",
		"throw", "try", "typeof", "var", "void", "while", "with", "yield", "event", "randomInt", "randomFloat",
		"deploy", "md5e", "sha256e", "keccak256", "base64e", "base64d", "NewContract", "require", "constructor",
		"init", "tag", "_NewContract"
	].includes(field)
}

function callIndexSize() {
	return _callList.length
}

function isFirstKey(obj, key) {
	obj = Object.keys(obj);
	return 0 < obj.length && obj[0] === key
}

function getTagObject(tag) {
	if ("lib.map" === tag) return new Map
}
Math.random = function() {
	return 0
};