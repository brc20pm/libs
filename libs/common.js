var Date = null;
let _callList = [];
let _originalFunc = []

let _NewContract = function(address, cScript) {
	let Obj = null;
	let exist = false;
	let callIndex = null;

	try {

		for (var i = 0; i < _callList.length; i++) {
			if (_callList[i].addr === address) {
				exist = true;
				Obj = _callList[i].values;
				callIndex = i;
				break
			}
		}

		if (!exist) {
			Obj = loadContract(address, cScript);
			//如果合约不是第一次初始化
			if (Obj['initLock']) {
				//恢复方法
				//A->keysA-keysB
				let _keys = {}

				if (Obj) {
					//显式KEY
					Object.keys(Obj).forEach((item => {
						//Contract自身上的显式函数
						// if (typeof Obj[item] === 'string') {
						//     _keys[item] = Obj[item]
						//     //这里修改后goja会把我们的函数变成底层native code 所以装备一个数组装原汁原味的函数字符串
						//     eval("Obj." + item + " = " + Obj[item])
						// }

						function genKeys(obj, name) {
							if (typeof obj === 'object') {
								if (obj) {
									if (obj['tag']) {
										let tagObj = getTagObject(obj['tag'])
										Object.keys(obj).forEach((k => {
											//这里将属性值全部赋值给tagObj
											tagObj[k] = obj[k]
										}))
										//将处理完成的tagObj赋值给状态对象
										obj = tagObj
									} else {
										//从字符串上恢复函数
										Object.keys(obj).forEach(($ => {
											if (typeof obj[$] === 'object') {
												obj[$] = genKeys(obj[$], $)
											}

											if (typeof obj[$] === 'string') {
												//这里判断下如果是函数字符串才去执行
												if (isFuncStr(obj[$])) {
													_keys[name + '.' + $] = obj[$]
													//这里修改后goja会把我们的函数变成底层native code 所以装备一个数组装原汁原味的函数字符串
													eval("obj." + $ + " = " + obj[$])
												}
											}
										}))
									}
								}
							}
							//无论处不处理都要返回(别写错了,之前放到if里面了 没处理就没返回cnmd)
							return obj;
						}

						Obj[item] = genKeys(Obj[item], item)

					}))

				}

				//隐式KEY
				let pTypeOf = Object.getPrototypeOf(Obj);

				function protoKeys(prototype) {
					Object.getOwnPropertyNames(prototype).forEach((item => {
						let obj = prototype[item]

						function genKeys(obj, name) {
							if (typeof obj === 'object') {
								if (obj) {
									if (obj['tag']) {
										let tagObj = getTagObject(obj['tag'])
										Object.keys(obj).forEach((k => {
											tagObj[k] = obj[k]
										}))
										//将处理完成的tagObj赋值给状态对象
										obj = tagObj
									} else {
										Object.keys(obj).forEach(($ => {
											if (typeof obj[$] === 'object') {
												obj[$] = genKeys(obj[$], $)
											}

											if (typeof obj[$] === 'string') {
												//这里判断下如果是函数字符串才去执行
												if (isFuncStr(obj[$])) {
													_keys[name + '.' + $] = obj[$]
													//这里修改后goja会把我们的函数变成底层native code 所以装备一个数组装原汁原味的函数字符串
													eval("obj." + $ + " = " + obj[$])
												}
											}
										}))
									}
								}
								return obj
							}
						}

						obj = genKeys(obj, item)

						// 递归获取所有原型函数
						const nextPrototype = Object.getPrototypeOf(prototype);
						if (nextPrototype !== null) {
							protoKeys(nextPrototype);
						}
					}))
				}

				//获取隐式函数
				protoKeys(pTypeOf);

				//装进原汁原味的函数体
				_originalFunc.push(_keys)

			}

			Obj['address'] = address;
			Obj['height'] = height;
			Obj['txOrigin'] = sender;
			Obj['timeStamp'] = timeStamp;
			Obj['txHash'] = txHash;

			Obj['event'] = function(data) {
				if (typeof data === 'object' && data !== null) {
					var flag = isFirstKey(data, 'name');
					if (flag) {
						if (this['events'] == undefined || this['events'] == null) {
							this['events'] = [];
						}
						this['events'].push(data);
					} else {
						throw new Error('event firstKey is not name');
					}
				} else {
					throw new Error('event is not object');
				}
			};
			let callLen = _callList.length;
			if (_callList.length == 0) {
				Obj['msgSender'] = sender
			} else {
				Obj['msgSender'] = _callList[callLen - 1].addr
			};

			Obj['randomInt'] = function(min, max) {
				let msgSender = Obj['msgSender'];
				let nStr = "0";
				let mNumbers = msgSender.match(/\d+/g);
				if (mNumbers.length >= 3) {
					nStr = mNumbers[0] + mNumbers[1] + mNumbers[2];
				} else if (mNumbers.length > 0) {
					nStr = mNumbers[0];
				}
				let number = Number(nStr);
				let timeStamp = Number(Obj['timeStamp']);
				let seed = timeStamp + number;
				return random(seed, min, max, false);
			};
			Obj['randomFloat'] = function(min, max) {
				let msgSender = Obj['msgSender'];
				let nStr = "0";
				let mNumbers = msgSender.match(/\d+/g);
				if (mNumbers.length >= 3) {
					nStr = mNumbers[0] + mNumbers[1] + mNumbers[2];
				} else if (mNumbers.length > 0) {
					nStr = mNumbers[0];
				}
				let number = Number(nStr);
				let timeStamp = Number(Obj['timeStamp']);
				let seed = timeStamp + number;
				return random(seed, min, max, true);
			}

			//禁止修改某些属性
			let writableNames = ['address', 'msgSender', 'height', 'txOrigin', 'timeStamp', 'txHash', 'randomInt',
				'randomFloat', 'event', 'deploy'
			];
			writableNames.forEach(name => {
				Object.defineProperty(Obj, name, {
					writable: false
				});
			})
			//追加到call列表
			_callList.push({
				addr: address,
				values: Obj
			});
		}
	} catch (e) {
		throw e;
	}


	const callObj = {
		call(method, ...args) {
			function checkParams(...args) {
				if (Array.isArray(args)) {
					args.forEach((item => {
						//这里判断下如果是函数字符串才去执行
						if (isFuncStr(item)) {
							let eScript = "this['_func']" + "=" + item
							if (typeof eval(eScript) === 'function') {
								throw new Error("params cant not is func.toString()")
							}
						}
					}))
				} else {
					//这里判断下如果是函数字符串才去执行
					if (isFuncStr(args)) {
						let eScript = "this['_func']" + "=" + args
						if (typeof eval(eScript) === 'function') {
							throw new Error("params cant not is func.toString()")
						}
					}
				}
			}

			checkParams(args)

			if (method[0] === "_") {
				throw new Error('inaccessible private attribute', method);
			}

			try {
				//如果存在则用原有CallIndex,不存在用新Push的长度-1
				var contract = _callList[exist ? callIndex : _callList.length - 1].values;
				if (method === 'init' && contract['initLock']) {
					throw new Error('init is locked...');
				}
				let result = contract[method](...args);
				return result;
			} catch (e) {
				throw e;
			}
		}
	};
	return callObj;
};


function NewContract(address) {
	let Obj = null;
	let exist = false;
	let callIndex = null;

	try {

		for (var i = 0; i < _callList.length; i++) {
			if (_callList[i].addr === address) {
				exist = true;
				Obj = _callList[i].values;
				callIndex = i;
				break
			}
		}

		if (!exist) {
			Obj = loadContract(address);
			//如果合约不是第一次初始化
			if (Obj['initLock']) {
				//恢复方法
				//A->keysA-keysB
				let _keys = {}

				if (Obj) {
					//显式KEY
					Object.keys(Obj).forEach((item => {
						//Contract自身上的显式函数
						// if (typeof Obj[item] === 'string') {
						//     _keys[item] = Obj[item]
						//     //这里修改后goja会把我们的函数变成底层native code 所以装备一个数组装原汁原味的函数字符串
						//     eval("Obj." + item + " = " + Obj[item])
						// }

						function genKeys(obj, name) {
							if (typeof obj === 'object') {
								if (obj) {
									if (obj['tag']) {
										let tagObj = getTagObject(obj['tag'])
										Object.keys(obj).forEach((k => {
											//这里将属性值全部赋值给tagObj
											tagObj[k] = obj[k]
										}))
										//将处理完成的tagObj赋值给状态对象
										obj = tagObj
									} else {
										//从字符串上恢复函数
										Object.keys(obj).forEach(($ => {
											if (typeof obj[$] === 'object') {
												obj[$] = genKeys(obj[$], $)
											}

											if (typeof obj[$] === 'string') {
												//这里判断下如果是函数字符串才去执行
												if (isFuncStr(obj[$])) {
													_keys[name + '.' + $] = obj[$]
													//这里修改后goja会把我们的函数变成底层native code 所以装备一个数组装原汁原味的函数字符串
													eval("obj." + $ + " = " + obj[$])
												}
											}
										}))
									}
								}
							}
							//无论处不处理都要返回(别写错了,之前放到if里面了 没处理就没返回cnmd)
							return obj;
						}

						Obj[item] = genKeys(Obj[item], item)

					}))

				}

				//隐式KEY
				let pTypeOf = Object.getPrototypeOf(Obj);

				function protoKeys(prototype) {
					Object.getOwnPropertyNames(prototype).forEach((item => {
						let obj = prototype[item]

						function genKeys(obj, name) {
							if (typeof obj === 'object') {
								if (obj) {
									if (obj['tag']) {
										let tagObj = getTagObject(obj['tag'])
										Object.keys(obj).forEach((k => {
											tagObj[k] = obj[k]
										}))
										//将处理完成的tagObj赋值给状态对象
										obj = tagObj
									} else {
										Object.keys(obj).forEach(($ => {
											if (typeof obj[$] === 'object') {
												obj[$] = genKeys(obj[$], $)
											}

											if (typeof obj[$] === 'string') {
												//这里判断下如果是函数字符串才去执行
												if (isFuncStr(obj[$])) {
													_keys[name + '.' + $] = obj[$]
													//这里修改后goja会把我们的函数变成底层native code 所以装备一个数组装原汁原味的函数字符串
													eval("obj." + $ + " = " + obj[$])
												}
											}
										}))
									}
								}
								return obj
							}
						}

						obj = genKeys(obj, item)

						// 递归获取所有原型函数
						const nextPrototype = Object.getPrototypeOf(prototype);
						if (nextPrototype !== null) {
							protoKeys(nextPrototype);
						}
					}))
				}

				//获取隐式函数
				protoKeys(pTypeOf);

				//装进原汁原味的函数体
				_originalFunc.push(_keys)

			}

			Obj['address'] = address;
			Obj['height'] = height;
			Obj['txOrigin'] = sender;
			Obj['timeStamp'] = timeStamp;
			Obj['txHash'] = txHash;

			Obj['event'] = function(data) {
				if (typeof data === 'object' && data !== null) {
					var flag = isFirstKey(data, 'name');
					if (flag) {
						if (this['events'] == undefined || this['events'] == null) {
							this['events'] = [];
						}
						this['events'].push(data);
					} else {
						throw new Error('event firstKey is not name');
					}
				} else {
					throw new Error('event is not object');
				}
			};
			let callLen = _callList.length;
			if (_callList.length == 0) {
				Obj['msgSender'] = sender
			} else {
				Obj['msgSender'] = _callList[callLen - 1].addr
			};

			Obj['randomInt'] = function(min, max) {
				let msgSender = Obj['msgSender'];
				let nStr = "0";
				let mNumbers = msgSender.match(/\d+/g);
				if (mNumbers.length >= 3) {
					nStr = mNumbers[0] + mNumbers[1] + mNumbers[2];
				} else if (mNumbers.length > 0) {
					nStr = mNumbers[0];
				}
				let number = Number(nStr);
				let timeStamp = Number(Obj['timeStamp']);
				let seed = timeStamp + number;
				return random(seed, min, max, false);
			};
			Obj['randomFloat'] = function(min, max) {
				let msgSender = Obj['msgSender'];
				let nStr = "0";
				let mNumbers = msgSender.match(/\d+/g);
				if (mNumbers.length >= 3) {
					nStr = mNumbers[0] + mNumbers[1] + mNumbers[2];
				} else if (mNumbers.length > 0) {
					nStr = mNumbers[0];
				}
				let number = Number(nStr);
				let timeStamp = Number(Obj['timeStamp']);
				let seed = timeStamp + number;
				return random(seed, min, max, true);
			}

			//禁止修改某些属性
			let writableNames = ['address', 'msgSender', 'height', 'txOrigin', 'timeStamp', 'txHash', 'randomInt',
				'randomFloat', 'event', 'deploy'
			];
			writableNames.forEach(name => {
				Object.defineProperty(Obj, name, {
					writable: false
				});
			})
			//追加到call列表
			_callList.push({
				addr: address,
				values: Obj
			});
		}
	} catch (e) {
		throw e;
	}


	const callObj = {
		call(method, ...args) {
			function checkParams(...args) {
				if (Array.isArray(args)) {
					args.forEach((item => {
						//这里判断下如果是函数字符串才去执行
						if (isFuncStr(item)) {
							let eScript = "this['_func']" + "=" + item
							if (typeof eval(eScript) === 'function') {
								throw new Error("params cant not is func.toString()")
							}
						}
					}))
				} else {
					//这里判断下如果是函数字符串才去执行
					if (isFuncStr(args)) {
						let eScript = "this['_func']" + "=" + args
						if (typeof eval(eScript) === 'function') {
							throw new Error("params cant not is func.toString()")
						}
					}
				}
			}

			checkParams(args)

			if (method[0] === "_") {
				throw new Error('inaccessible private attribute', method);
			}

			try {
				//如果存在则用原有CallIndex,不存在用新Push的长度-1
				var contract = _callList[exist ? callIndex : _callList.length - 1].values;
				if (method === 'init' && contract['initLock']) {
					throw new Error('init is locked...');
				}
				let result = contract[method](...args);
				return result;
			} catch (e) {
				throw e;
			}
		}
	};
	return callObj;
};


var callLock = false;


function call(method, args) {
	function checkParams(...args) {
		if (Array.isArray(args)) {
			args.forEach((item => {
				//这里判断下如果是函数字符串才去执行
				if (isFuncStr(item)) {
					let eScript = "this['_func']" + "=" + item
					if (typeof eval(eScript) === 'function') {
						throw new Error("params cant not is func.toString()")
					}
				}
			}))
		} else {
			//这里判断下如果是函数字符串才去执行
			if (isFuncStr(args)) {
				let eScript = "this['_func']" + "=" + args
				if (typeof eval(eScript) === 'function') {
					throw new Error("params cant not is func.toString()")
				}
			}
		}
	}

	checkParams(args)

	if (method[0] === "_") {
		throw new Error('inaccessible private attribute', method);
	}

	//如果已经上锁
	if (callLock == true) {
		throw new Error('call is locked...');
	}
	//上锁
	callLock = true;


	try {
		//禁用本文件可以用,但是合约不可以用的函数
		disableFunc()

		let contract = _callList[0].values;
		if (method === 'init' && contract['initLock']) {
			throw new Error('init is locked...');
		}
		let result = contract[method](...args);
		let rType = typeof result;
		if (rType === 'function') {
			result = 'function'
		} else if (rType === 'object') {
			if (result) {
				Object.keys(result).forEach(key => {
					if (typeof result[key] === 'function') {
						result[key] = 'function'
					}
				})
			}
		}
		return result;
	} catch (e) {
		throw e;
	}
};



function isFuncStr(str) {
	let regex = /^\s*function\s?\w?\([^)]*\)\s*{[\s\S]*}$/i;
	return regex.test(str);
}


function callIndexState() {
	let callArry = []

	for (let index = 0; index < _callList.length; index++) {
		let call = _callList[index]["values"]
		delete call["deploy"]
		if (call) {
			Object.keys(call).forEach((item => {
				let pType = typeof call[item]

				if (pType === 'function') {
					//这里有被goja改变的所以我们取出原汁原味的函数
					if (_originalFunc.length == _callList.length) {
						call[item] = _originalFunc[index][item]
					} else {
						let func = call[item]
						let str = func.toString()
						// 使用正则表达式来匹配函数名和函数体
						const regex = /{\s*([\s\S]*?)?.*}/g;
						const matches = regex.exec(str);
						let params = extractParameters(func)
						const functionBody = matches[0];
						call[item] = 'function(' + params.toString() + ')' + functionBody
					}
				}


				if (pType === 'object') {
					function func2Str(obj, objName, index) {
						if (obj) {

							//如果有标签lib.xxx直接返回
							if (obj['tag']) {
								return obj
							}

							// 获取显示函数
							Object.keys(obj).forEach((cItem) => {
								if (isKeyword(cItem)) {
									return
								}
								if (typeof obj[cItem] === 'object') {
									obj[cItem] = func2Str(obj[cItem], cItem, index)
								}

								let t = typeof obj[cItem];
								if (t === 'function' && t != 'constructor') {
									//这里有被goja改变的所以我们取出原汁原味的函数
									if (_originalFunc.length == _callList.length) {
										obj[cItem] = _originalFunc[index][objName + '.' + cItem]
									} else {
										let func = obj[cItem]
										let str = func.toString()
										// 使用正则表达式来匹配函数名和函数体
										const regex = /{\s*([\s\S]*?)?.*}/g;
										const matches = regex.exec(str);
										let params = extractParameters(func)
										const functionBody = matches[0];
										obj[cItem] = 'function(' + params.toString() + ')' +
											functionBody
									}
								}
							})


							//获取隐式函数
							let prototype = Object.getPrototypeOf(obj);

							function pFunc(prototype) {
								Object.getOwnPropertyNames(prototype).forEach((funcName) => {
									if (isKeyword(funcName)) {
										return
									}
									if (typeof prototype[funcName] === 'object') {
										prototype[funcName] = func2Str(prototype[funcName],
											funcName,
											index)
									}
									let t = typeof prototype[funcName];
									if (t === 'function' && funcName != 'constructor') {
										//这里有被goja改变的所以我们取出原汁原味的函数
										if (_originalFunc.length == _callList.length) {
											obj[funcName] = _originalFunc[index][objName + '.' +
												funcName
											]
										} else {
											let func = prototype[funcName]
											let str = func.toString()
											// 使用正则表达式来匹配函数名和函数体
											const regex = /{\s*([\s\S]*?)?.*}/g;
											const matches = regex.exec(str);
											let params = extractParameters(func)
											// // 获取函数名和函数体
											const functionBody = matches[0];
											obj[funcName] = 'function(' + params.toString() + ')' +
												functionBody
										}
									}
								})

								// 递归获取所有原型函数
								const nextPrototype = Object.getPrototypeOf(prototype);
								if (nextPrototype !== null) {
									pFunc(nextPrototype);
								}
							}

							pFunc(prototype)
						}
						return obj
					}

					call[item] = func2Str(call[item], item, index)

				}
			}))
		}
		_callList[index]["values"] = call
		callArry.push(_callList[index])
	}


	return _callList
}


function extractParameters(func) {
	let code = func.toString();
	let start = code.indexOf('(') + 1;
	let end = code.indexOf(')');
	let parameters = code.slice(start, end).split(',')
		.map(( /** @type {string} */ param) => param.trim())
		.filter(( /** @type {string} */ param) => param !== '');
	return parameters;
}

function isKeyword(field) {
	// 因为这里只是去检验不是生成ABI所以不需要排除init方法 'init'
	//在生成ABI的时候,我们不会去提供init方法的ABI所以需要添加上
	let keywords = [
		'__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__',
		'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf',
		'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
		'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if',
		'in', 'instanceof', 'import', 'let', 'new', 'return', 'super', 'switch', 'this',
		'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'event', 'randomInt',
		'randomFloat', 'deploy', 'md5e', 'sha256e', 'keccak256', 'base64e', 'base64d', 'NewContract', 'require',
		'constructor', 'init', 'tag'
	];

	return keywords.includes(field);
}



function callIndexSize() {
	return _callList.length;
};



function isFirstKey(obj, key) {
	let keys = Object.keys(obj);
	if (keys.length > 0 && keys[0] === key) {
		return true;
	} else {
		return false;
	}
};

Math['random'] = function() {
	return 0;
};


function getTagObject(tag) {
	switch (tag) {
		case "lib.map":
			return new Map();
	}
};