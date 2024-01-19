class Map {
	tag = "lib.map";

	constructor() {
		this.data = {};
	}

	set(key, value) {
		if (typeof key !== 'object' || key === null) {
			this.data[key] = new Entry(key, value);
		} else {
			const nestedMap = new Map();
			nestedMap.setAll(key, value);
			this.data[key] = nestedMap;
		}
	}

	get(key) {
		if (typeof key !== 'object' || key === null) {
			return this.data[key] ? this.data[key].value : undefined;
		} else {
			return this.data[key].value;
		}
	}

	delete(key) {
		if (typeof key !== 'object' || key === null) {
			delete this.data[key];
		} else {
			delete this.data[key].value;
		}
	}

	hasKey(key) {
		if (typeof key !== 'object' || key === null) {
			return key in this.data && this.data[key] !== undefined;
		} else {
			return key in this.data && this.data[key].value !== undefined;
		}
	}

	clear() {
		this.data = {};
	}

	size() {
		let count = 0;
		for (let key in this.data) {
			if (this.hasOwnProperty(key)) {
				if (this.data[key].value !== undefined) {
					count += this.data[key].value.size();
				} else {
					++count;
				}
			}
		}
		return count;
	}

	setAll(entries) {
		entries.forEach((entry) => {
			const [key, value] = entry;
			this.set(key, value);
		});
	}

	setBucket(...args) {
		let aLen = args.length
		if (aLen == 2) {
			this.set(...args)
		} else if (aLen > 2) {
			const arr = Array.from(args)
			const key = arr[0]
			const mapping = arr.slice(1, arr.length - 1);
			const value = arr[arr.length - 1]
			const nValue = createNestedObject(mapping, value)
			const oldBucket = this.getBucket(key)
			const newBucket = {
				...oldBucket,
				...nValue
			}
			this.set(key, newBucket)
		} else {
			throw new Error("invalid key-value")
		}
	}

	getBucket(...args) {
		let aLen = args.length
		if (aLen == 1) {
			return this.get(...args)
		} else if (aLen >= 2) {
			const arr = Array.from(args)
			const key = arr[0]
			const bucket = this.get(key)
			if (bucket) {
				const mapping = arr.slice(1, arr.length);
				return getNestedObject(bucket, mapping)
			}
			return null
		} else {
			throw new Error("invalid key")
		}
	}

	delBucket(...args) {
		let aLen = args.length
		if (aLen == 1) {
			return this.delete(...args)
		} else if (aLen >= 2) {
			const arr = Array.from(args)
			const mapping = arr.slice(0, arr.length - 1);
			let bucket = this.getBucket(...mapping)
			if (bucket) {
				delete bucket[arr[arr.length - 1]]
			}
		} else {
			throw new Error("invalid key")
		}
	}


};


function createNestedObject(arr, value) {
	const nestedObj = {};
	if (arr.length === 1) {
		nestedObj[arr[0]] = value;
	} else {
		const key = arr[0];
		const remainingArr = arr.slice(1);

		nestedObj[key] = createNestedObject(remainingArr, value);
	}
	return nestedObj;
}

function getNestedObject(bucket, mapping) {
	let tree = null;

	mapping.forEach(key => {
		if (tree === null) {
			if (!bucket[key]) {
				return;
			}
			tree = bucket[key];
		} else {
			if (!tree[key]) {
				return;
			}
			tree = tree[key];
		}
		if (typeof tree !== 'object') {
			return;
		}
	})
	return tree
};