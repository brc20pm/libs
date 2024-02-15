class Map {
	tag = "lib.map";
	constructor() {
		this.data = {}
	}
	set(key, value) {
		var nestedMap;
		"object" != typeof key || null === key ? this.data[key] = new Entry(key, value) : ((nestedMap = new Map)
			.setAll(key, value), this.data[key] = nestedMap)
	}
	get(key) {
		return "object" == typeof key && null !== key || this.data[key] ? this.data[key].value : void 0
	}
	delete(key) {
		"object" != typeof key || null === key ? delete this.data[key] : delete this.data[key].value
	}
	hasKey(key) {
		return "object" != typeof key || null === key ? key in this.data && void 0 !== this.data[key] : key in this
			.data && void 0 !== this.data[key].value
	}
	clear() {
		this.data = {}
	}
	size() {
		let count = 0;
		for (var key in this.data) this.hasOwnProperty(key) && (void 0 !== this.data[key].value ? count += this
			.data[key].value.size() : ++count);
		return count
	}
	setAll(entries) {
		entries.forEach(entry => {
			var [entry, value] = entry;
			this.set(entry, value)
		})
	}
	setBucket(...args) {
		var aLen = args.length;
		if (2 == aLen) this.set(...args);
		else {
			if (!(2 < aLen)) throw new Error("invalid key-value");
			aLen = Array.from(args), args = aLen[0], aLen = createNestedObject(aLen.slice(1, aLen.length - 1), aLen[
				aLen.length - 1]), aLen = {
				...this.getBucket(args),
				...aLen
			};
			this.set(args, aLen)
		}
	}
	getBucket(...args) {
		var aLen = args.length;
		if (1 == aLen) return this.get(...args);
		if (2 <= aLen) return args = (aLen = Array.from(args))[0], (args = this.get(args)) ? getNestedObject(args,
			aLen.slice(1, aLen.length)) : null;
		throw new Error("invalid key")
	}
	delBucket(...args) {
		var aLen = args.length;
		if (1 == aLen) return this.delete(...args);
		if (!(2 <= aLen)) throw new Error("invalid key");
		aLen = Array.from(args), args = aLen.slice(0, aLen.length - 1), args = this.getBucket(...args);
		args && delete args[aLen[aLen.length - 1]]
	}
}

function createNestedObject(arr, value) {
	var key, nestedObj = {};
	return 1 === arr.length ? nestedObj[arr[0]] = value : (key = arr[0], arr = arr.slice(1), nestedObj[key] =
		createNestedObject(arr, value)), nestedObj
}

function getNestedObject(bucket, mapping) {
	let tree = null;
	return mapping.forEach(key => {
		if (null === tree) {
			if (!bucket[key]) return;
			tree = bucket[key]
		} else {
			if (!tree[key]) return;
			tree = tree[key]
		}
		tree
	}), tree
}