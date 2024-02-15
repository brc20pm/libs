class KFC20 {
	_name;
	_symbol;
	_totalSupply;
	_balances = new Map;
	_allowances = new Map;
	init() {
		this._name = "KFC20", this._symbol = "K2", this._totalSupply = SafeMath.val(1e8), this._balances.setBucket(
			this._msgSender(), this._totalSupply), this.event({
			name: "Transfer",
			from: "fapiao.org",
			to: this._msgSender(),
			amount: this._totalSupply
		})
	}
	$name() {
		return this._name
	}
	$symbol() {
		return this._symbol
	}
	$totalSupply() {
		return SafeMath.val(this._totalSupply)
	}
	$balanceOf(account) {
		return SafeMath.val(this._balances.getBucket(account))
	}
	approve(sender, amount) {
		return this._approve(this._msgSender(), sender, amount), !0
	}
	increaseAllowance(spender, addedValue) {
		let aOld = this._allowances.getBucket(owner, sender);
		return this._approve(this._msgSender(), spender, SafeMath.add(aOld, addedValue)), !0
	}
	decreaseAllowance(spender, subtractedValue) {
		let aOld = this.getBucket(owner, sender);
		return this._approve(this._msgSender(), spender, SafeMath.sub(aOld, subtractedValue)), !0
	}
	$allowance(owner, sender) {
		return SafeMath.val(this._allowances.getBucket(owner, sender))
	}
	transfer(recipient, amount) {
		return this._transfer(this._msgSender(), recipient, amount), !0
	}
	transferFrom(sender, recipient, amount) {
		let aOld = this._allowances.getBucket(sender, this._msgSender());
		return require(SafeMath.gte(aOld, amount), "KFC20: transfer amount exceeds allowance"), this._transfer(
			sender, recipient, amount), this._approve(sender, this._msgSender(), SafeMath.sub(aOld, amount)), !0
	}
	_approve(owner, sender, amount) {
		this._allowances.setBucket(owner, sender, SafeMath.val(amount)), this.event({
			name: "Approve",
			from: owner,
			to: sender,
			amount: amount
		})
	}
	_transfer(owner, recipient, amount) {
		let oldO = this._balances.getBucket(owner),
			oldR = (require(SafeMath.gte(oldO, amount), "KFC20: transfer amount exceeds balance"), this._balances
				.getBucket(recipient));
		this._balances.setBucket(owner, SafeMath.sub(oldO, amount)), this._balances.setBucket(recipient, SafeMath
			.add(oldR, amount)), this.event({
			name: "Transfer",
			from: owner,
			to: recipient,
			amount: amount
		})
	}
	_msgSender() {
		return this.msgSender
	}
}