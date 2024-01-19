var SafeMath = {
	//加
	add: function(a, b) {
		a = isNaN(a) ? 0 : a;
		b = isNaN(b) ? 0 : b;
		let numberA = new BigNumber(a);
		let numberB = new BigNumber(b);
		let numberC = numberA.plus(numberB);
		//如果C小于A则加法溢出
		if (numberC.comparedTo(numberA) === -1) {
			throw new Error('SafeMath: addition overflow');
		}
		return numberC.toString();
	},
	//减
	sub: function(a, b) {
		a = isNaN(a) ? 0 : a;
		b = isNaN(b) ? 0 : b;
		let numberA = new BigNumber(a);
		let numberB = new BigNumber(b);
		//如果B大于A则减法溢出
		if (numberB.comparedTo(numberA) === 1) {
			throw new Error('SafeMath: subtraction overflow');
		}
		let numberC = numberA.minus(numberB);
		return numberC.toString();
	},
	//乘
	mul: function(a, b) {
		a = isNaN(a) ? 0 : a;
		b = isNaN(b) ? 0 : b;
		//如果A等于0则结果为0
		if (a === 0) {
			return '0';
		}
		let numberA = new BigNumber(a);
		let numberB = new BigNumber(b);
		let numberC = numberA.times(numberB);
		//如果C/A不等于B则乘法溢出
		if (numberC.dividedBy(numberA).comparedTo(numberB) !== 0) {
			throw new Error('SafeMath: multiplication overflow');
		}
		return numberC.toString();
	},
	//除
	div: function(a, b) {
		if (b === 0 || isNaN(b)) {
			throw new Error('SafeMath: division by zero or NaN is not allowed');
		}
		a = isNaN(a) ? 0 : a;
		//如果b小于等于0则除法溢出
		if (b <= 0) {
			throw new Error('SafeMath: division by zero');
		}
		let numberA = new BigNumber(a);
		let numberB = new BigNumber(b);
		let numberC = numberA.dividedBy(numberB);
		return numberC.toString();
	},
	//余
	mod: function(a, b) {
		a = isNaN(a) ? 0 : a;
		b = isNaN(b) ? 0 : b;
		//如果b等于0则取模溢出
		if (b === 0) {
			throw new Error('SafeMath: modulo by zero');
		}
		let numberA = new BigNumber(a);
		let numberB = new BigNumber(b);
		let numberC = numberA.mod(numberB);
		return numberC.toString();
	},
	//平方
	pow: function(base, exponent) {
		base = isNaN(base) ? 0 : base;
		exponent = isNaN(exponent) ? 0 : exponent;
		let numberA = new BigNumber(base);
		let numberB = new BigNumber(exponent);
		let numberC = numberA.pow(numberB);
		return numberC.toString();
	},
	//保留小数位
	fixed: function(e, r) {
		n = isNaN(n) ? 0 : n;
		return new BigNumber(n).toFixed(e, r);
	},
	//数字
	num: function(n) {
		n = isNaN(n) ? 0 : n;
		return new BigNumber(n).toNumber();
	},
	//字符串
	val: function(n) {
		n = isNaN(n) ? 0 : n;
		return new BigNumber(n).toString();
	},
	//相等
	eq: function(a, b) {
		a = isNaN(a) ? 0 : a;
		b = isNaN(b) ? 0 : b;
		let numberA = new BigNumber(a);
		let numberB = new BigNumber(b);
		return numberA.eq(numberB);
	},
	//不相等
	neq: function(a, b) {
		a = isNaN(a) ? 0 : a;
		b = isNaN(b) ? 0 : b;
		let numberA = new BigNumber(a);
		let numberB = new BigNumber(b);
		return !numberA.eq(numberB);
	},
	//大于
	gt: function(a, b) {
		a = isNaN(a) ? 0 : a;
		b = isNaN(b) ? 0 : b;
		let numberA = new BigNumber(a);
		let numberB = new BigNumber(b);
		return numberA.gt(numberB);
	},
	//小于
	lt: function(a, b) {
		a = isNaN(a) ? 0 : a;
		b = isNaN(b) ? 0 : b;
		let numberA = new BigNumber(a);
		let numberB = new BigNumber(b);
		return numberA.lt(numberB);
	},
	//大于等于
	gte: function(a, b) {
		a = isNaN(a) ? 0 : a;
		b = isNaN(b) ? 0 : b;
		let numberA = new BigNumber(a);
		let numberB = new BigNumber(b);
		return numberA.gte(numberB);
	},
	//小于等于
	lte: function(a, b) {
		a = isNaN(a) ? 0 : a;
		b = isNaN(b) ? 0 : b;
		let numberA = new BigNumber(a);
		let numberB = new BigNumber(b);
		return numberA.lte(numberB);
	}
};