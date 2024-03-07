class KFC721 {
	_name;
	_symbol;
	_baseUrl;
	_owners;
	_balances;
	_tokenExist;
	_tokenApprovals;
	_operatorApprovals;
	_tokenUrl;
	_tokenIdCounter;
	init() {
		this._tokenIdCounter = 1e3, this._name = "KFC-721", this._symbol = "K721", this._baseUrl = "", this
			._owners = new Map, this._balances = new Map, this._tokenExist = new Map, this._tokenApprovals =
			new Map, this._operatorApprovals = new Map, this._tokenUrl = new Map
	}
	$name() {
		return this._name
	}
	$symbol() {
		return this._symbol
	}
	$baseUrl() {
		return this._baseUrl
	}
	$balanceOf(address) {
		return this._balances.get(address) ? this._balances.get(address) : 0
	}
	$ownerOf(tokenId) {
		return this._tokenIdExist(tokenId), this._owners.get(tokenId)
	}
	$tokenURI(tokenId) {
		return this._tokenIdExist(tokenId), this._tokenUrl.get(tokenId)
	}
	$getApproved(tokenId) {
		return this._tokenIdExist(tokenId), this._tokenApprovals.get(tokenId)
	}
	$isApprovedForAll(owner, operator) {
		owner = this._operatorApprovals.getBucket(owner, operator);
		return owner || !1
	}
	mint(data) {
		return this._mint(this._msgSender(), data), !0
	}
	transfer(to, tokenId) {
		return this._tokenIdExist(tokenId), this._transfer(this._msgSender(), to, tokenId), !0
	}
	transferFrom(from, to, tokenId) {
		return this._tokenIdExist(tokenId), require(this._isApprovedOrOwner(this._msgSender(), tokenId),
			"KFC721: transfer caller is not owner nor approval"), this._transfer(from, to, tokenId), !0
	}
	approve(to, tokenId) {
		this._tokenIdExist(tokenId);
		var owner = this._owners.get(tokenId);
		return require(to != owner, "KFC721: approval to current owner"), require(this._msgSender() == owner || this
			.isApprovedForAll(owner, this._msgSender()),
			"KFC721: approval caller is not owner nor approved for all"), this._approve(to, tokenId), !0
	}
	setApprovalForAll(operator, approval) {
		return this._setApprovalForAll(this._msgSender(), operator, approval), !0
	}
	_mint(to, data) {
		var tokenId = this._tokenIdCounter++,
			data = (this._tokenExist.set(tokenId, !0), this._tokenUrl.set(tokenId, data), this._owners.set(tokenId,
				to), this._balances.get(to));
		this._balances.set(to, SafeMath.add(data, 1)), this.event({
			name: "Mint",
			owner: to,
			tokenId: tokenId
		})
	}
	_approve(to, tokenId) {
		this._tokenApprovals.set(tokenId, to), this.event({
			name: "Approvel",
			from: this.$ownerOf(tokenId),
			to: to,
			tokenId: tokenId
		})
	}
	_unApproval(tokenId) {
		this._tokenApprovals.delete(tokenId), this.event({
			name: "UnApproval",
			from: this.$ownerOf(tokenId),
			tokenId: tokenId
		})
	}
	_setApprovalForAll(owner, operator, approved) {
		require(owner != operator, "KFC721: approve to caller"), this._operatorApprovals.setBucket(owner, operator,
			approved), this.event({
			name: "ApprovelForAll",
			from: owner,
			to: operator,
			approved: approved
		})
	}
	_transfer(from, to, tokenId) {
		var owner = this._owners.get(tokenId),
			owner = (require(from == owner, "KFC721: transfer from incorrect owner"), this._unApproval(tokenId),
				this._balances.get(from)),
			oldL = this._balances.get(to);
		this._balances.set(from, SafeMath.sub(owner, 1)), this._balances.set(to, SafeMath.add(oldL, 1)), this
			._owners.set(tokenId, to), this.event({
				name: "Transfer",
				from: from,
				to: to,
				tokenId: tokenId
			})
	}
	_isApprovedOrOwner(spender, tokenId) {
		var owner = this.$ownerOf(tokenId);
		return spender == owner || this.$getApproved(tokenId) == spender || this.$isApprovedForAll(owner, spender)
	}
	_tokenIdExist(tokenId) {
		tokenId = this._tokenExist.get(tokenId);
		require(tokenId, "KFC721: nonexistent token")
	}
	_msgSender() {
		return this.msgSender
	}
}