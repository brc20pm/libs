//使用EVMCaller向外暴露接口
function EVMCaller() {
	let _etherJs = ethers;
	return {
		call: function(rpcUrl, abi, contract, method, args = []) {
			try {
				const interface = new _etherJs.utils.Interface(abi);
				const data = interface.encodeFunctionData(method, args);
				const encodedData = EVM_CALL(rpcUrl, contract, data);
				const decodedData = interface.decodeFunctionResult(method, encodedData);
				return decodedData.toString()
			} catch (e) {
				throw new Error(e);
			}
		}
	}
}

var ethers = null;