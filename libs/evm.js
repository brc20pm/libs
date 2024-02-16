

//以太坊调用者
function EVMCaller(rpcUrl, abi, contract, method, args = []) {
	throw new Error(ethers);
	const interface = new ethers.utils.Interface(abi);
	const data = interface.encodeFunctionData(method, args);
	//调用合约
	const encodedData = EVM_CALL(rpcUrl,contract,data);
	const decodedData = interface.decodeFunctionResult(method, encodedData);
	// console.log(decodedData.toString())
}