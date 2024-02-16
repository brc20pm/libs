var EVMCaller = {
	call: function(rpcUrl, abi, contract, method, args = []) {
		try {
			const interface = new ethers.utils.Interface(abi);
			const data = interface.encodeFunctionData(method, args);
			//调用合约
			const encodedData = EVM_CALL(rpcUrl, contract, data);
			const decodedData = interface.decodeFunctionResult(method, encodedData);
			return decodedData.toString()
		} catch (e) {
			throw new Error(e);
		}
	}
}