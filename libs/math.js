var SafeMath = {
	add: function(a, b) {
		a = isNaN(a) ? 0 : a, b = isNaN(b) ? 0 : b;
		a = new BigNumber(a), b = new BigNumber(b), b = a.plus(b);
		if (-1 === b.comparedTo(a)) throw new Error("SafeMath: addition overflow");
		return b.toString()
	},
	sub: function(a, b) {
		a = isNaN(a) ? 0 : a, b = isNaN(b) ? 0 : b;
		a = new BigNumber(a), b = new BigNumber(b);
		if (1 === b.comparedTo(a)) throw new Error("SafeMath: subtraction overflow");
		return a.minus(b).toString()
	},
	mul: function(a, b) {
		if (a = isNaN(a) ? 0 : a, b = isNaN(b) ? 0 : b, 0 === a) return "0";
		var a = new BigNumber(a),
			b = new BigNumber(b),
			numberC = a.times(b);
		if (0 !== numberC.dividedBy(a).comparedTo(b)) throw new Error("SafeMath: multiplication overflow");
		return numberC.toString()
	},
	div: function(a, b) {
		if (0 === b || isNaN(b)) throw new Error("SafeMath: division by zero or NaN is not allowed");
		if (a = isNaN(a) ? 0 : a, b <= 0) throw new Error("SafeMath: division by zero");
		a = new BigNumber(a), b = new BigNumber(b);
		return a.dividedBy(b).toString()
	},
	mod: function(a, b) {
		if (a = isNaN(a) ? 0 : a, 0 === (b = isNaN(b) ? 0 : b)) throw new Error("SafeMath: modulo by zero");
		a = new BigNumber(a), b = new BigNumber(b);
		return a.mod(b).toString()
	},
	pow: function(base, exponent) {
		base = isNaN(base) ? 0 : base, exponent = isNaN(exponent) ? 0 : exponent;
		base = new BigNumber(base), exponent = new BigNumber(exponent);
		return base.pow(exponent).toString()
	},
	fixed: function(e, r) {
		return n = isNaN(n) ? 0 : n, new BigNumber(n).toFixed(e, r)
	},
	num: function(n) {
		return n = isNaN(n) ? 0 : n, new BigNumber(n).toNumber()
	},
	val: function(n) {
		return n = isNaN(n) ? 0 : n, new BigNumber(n).toString()
	},
	eq: function(a, b) {
		a = isNaN(a) ? 0 : a, b = isNaN(b) ? 0 : b;
		a = new BigNumber(a), b = new BigNumber(b);
		return a.eq(b)
	},
	neq: function(a, b) {
		a = isNaN(a) ? 0 : a, b = isNaN(b) ? 0 : b;
		a = new BigNumber(a), b = new BigNumber(b);
		return !a.eq(b)
	},
	gt: function(a, b) {
		a = isNaN(a) ? 0 : a, b = isNaN(b) ? 0 : b;
		a = new BigNumber(a), b = new BigNumber(b);
		return a.gt(b)
	},
	lt: function(a, b) {
		a = isNaN(a) ? 0 : a, b = isNaN(b) ? 0 : b;
		a = new BigNumber(a), b = new BigNumber(b);
		return a.lt(b)
	},
	gte: function(a, b) {
		a = isNaN(a) ? 0 : a, b = isNaN(b) ? 0 : b;
		a = new BigNumber(a), b = new BigNumber(b);
		return a.gte(b)
	},
	lte: function(a, b) {
		a = isNaN(a) ? 0 : a, b = isNaN(b) ? 0 : b;
		a = new BigNumber(a), b = new BigNumber(b);
		return a.lte(b)
	}
};