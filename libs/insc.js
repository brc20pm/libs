class INSC {

	_name;
	_symbol;
	_mintMax;
	_totalSupply;
	_totalSupplyMax;
	_balances = new Map();

	init() {
		this._name = 'KFC-INSC';
		this._symbol = 'KI';
		this._mintMax = SafeMath.val(1000);
		this._totalSupply = SafeMath.val(0);
		this._totalSupplyMax = SafeMath.val(1000000);
	}

	$name() {
		return this._name;
	};

	$symbol() {
		return this._symbol;
	}

	$mintMax() {
		return SafeMath.val(this._mintMax);
	}

	$totalSupply() {
		return SafeMath.val(this._totalSupply);
	};

	$totalSupplyMax() {
		return SafeMath.val(this._totalSupplyMax);
	};

	$balanceOf(account) {
		return SafeMath.val(this._balances.getBucket(account));
	};

	mint(amount) {
		require(SafeMath.lte(amount, this._mintMax), 'KFC-INSC: maximum mint number exceeded');
		this._mint(amount);
		return true;
	}

	_mint(amount) {
		this._totalSupply = SafeMath.add(this._totalSupply, amount)
		let owner = this._msgSender();
		let oldR = this._balances.getBucket(owner)
		this._balances.setBucket(owner, SafeMath.add(oldR, amount))
		this.event({
			name: 'Transfer',
			from: 'fapiao.org',
			to: owner,
			amount: amount
		});
	}

	transfer(recipient, amount) {
		this._transfer(this._msgSender(), recipient, amount);
		return true;
	};

	_transfer(owner, recipient, amount) {
		let oldO = this._balances.getBucket(owner);

		require(SafeMath.gte(oldO, amount), 'KFC-INSC: transfer amount exceeds balance');

		let oldR = this._balances.getBucket(recipient)

		this._balances.setBucket(owner, SafeMath.sub(oldO, amount));
		this._balances.setBucket(recipient, SafeMath.add(oldR, amount))

		this.event({
			name: 'Transfer',
			from: owner,
			to: recipient,
			amount: amount
		});
	};

	_msgSender() {
		return this.msgSender;
	}
};