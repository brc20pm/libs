//使用EVMCaller向外暴露接口
function EVMCaller() {
	let _etherJs = ethers;
	return {
		call: function(msg) {
			try {
				const interface = new _etherJs.utils.Interface(msg.abi);
				const data = interface.encodeFunctionData(msg.method, msg.args);
				const encodedData = EVM_CALL(msg.rpcUrl, msg.contract,data);
				const decodedData = interface.decodeFunctionResult(msg.method, encodedData);
				return decodedData.toString()
			} catch (e) {
				throw new Error(e);
			}
		}
	}
}

//禁用ethers库
var ethers = null;