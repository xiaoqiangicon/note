import { arguments } from "file-loader";

// 1.对象的深拷贝
function deepClone(obj) {
  function isObject(o) {
    return (typeof o === "object" || typeof o === "function") && o !== null;
  }

	if (!isObject(obj)) {
		throw new Error('非对象');
	}

	let isArray = Array.isArray(obj);
	let newObj = isArray ? [...obj] : {...obj};

	// 循环对象赋值
	Object.keys(newObj).forEach(key => {
		newObj[key] = isObject(obj[key]) ? deepClone(obj[key]) : obj[key];
	})

	// Reflect.ownKeys(newObj).forEach(key => {
	// 	newObj[key] = isObject(obj[key]) ? deepClone(obj[key]) : obj[key];
	// })

	return newObj;
}

// 每个对象都有__proto__属性， 指向对象原型；
// 每个constructor构造函数都有一个prototype属性；
// 原型的constructor指向构造函数，构造函数的prototype指向原型


// 2.继承（原型继承和class继承）
// class只是语法糖，本质还是函数； Class instanceof Function

// 组合继承：在子类构造函数中调用父类构造函数继承父类的属性，然后改变子类的原型为new parent()来继承父类的函数；
function Parent(value) {
	this.val = value;
}
Parent.prototype.getValue = function() {
	console.log(this.val);
}

function Child(value) {
	Parent.call(this, value);
}
Child.prototype = new Parent();

// 寄生组合继承：组合继承缺点在于继承父类函数时调用了父类构造函数；
function Parent(value) {
	this.val = value;
}
Parent.prototype.getValue = function() {
	console.log(this.val);
}

function Child(value) {
	Parent.call(this, value);
}
Child.prototype = Object.create(Parent.prototype, {
	constructor: {
		value: Child,
		enumberable: false,
		writable: true,
		configurable: true,
	}
})
// 以上继承实现的核心就是将父类的原型赋值给子类，并且将构造函数设置为子类，这样解决了父类属性问题，也能正确找到子类的构造函数。

// class继承中的super等于Parent.call(this, value);



// 3.模块化：解决命名冲突，提供复用性，提高代码可维护性；
// 手段：立即执行函数；（函数作用域的方式）；AMD和CMD；
// commonjs和ES module
// exports === module.exports;所以不能对exports直接赋值；
// 区别：1.commonJs支持动态导入 2.commonjs是同步导入，因为用在服务端，文件都在本地，所以影响不大。后者用于浏览器，需要下载文件，所以同步影响大。3.commonjs导出时都是值拷贝，就算导出的值变了，导入的值也不会变，必须重新导入。后者是实时绑定；4.ES module会编译成require/exports执行；



// 4.proxy  new Proxy(target, handler);
// 数据响应式
let onWatch = (obj, setBind, getLogger) => {
	let handler = {
		get(target, property, receiver) {
			getLogger(target, property);	// 读取时触发的函数
			return Reflect.get(target, property, receiver)
		},
		set(target, property, value, receiver) {
			setBind(value, property);	// 改变时触发的函数
			return Reflect.set(target, property, value);
		}
	}

	return new Proxy(obj, handler);
}


// 5.map,filter,reduce
// map是操作后放入新数组；索引元素，索引，原数组；
// filter也是生成新数组，在遍历数组的时候将返回值为true的元素放入新数组；同样的三个元素；
// reduce可以将数组中的元素通过回调函数最终转换为一个值。两个参数：回调函数和初始值。回调函数有四个参数：累计值，当前元素，当前索引，原数组。累计值由每次函数的返回值更新。所以必须有return;
// 累加器
var arr = [1, 2, 3];
var sum = arr.reduce((acc, current) => acc + current, 0);
// 通过reduce实现map
var arr = [1, 2, 3];
var mapArray = arr.map(value => value * 2);
var reduceArray = arr.reduce((acc, current) => {
	acc.push(current * 2);
	return acc;
}, []);


// 6.并行和并发：并发是宏观概念；并行是围观概念

// 7.promise 三个状态 pending, resolve, rejected
// 缺点：无法取消promise，错误需要回调函数捕获.promise构造函数是同步执行的，then方法是异步执行的.


// 8 async和await
// async就是将函数返回值使用Promise.resolve()包裹一下.await将异步代码改造成了同步代码；

// 9.手写promise
const PENDING = 'pengding';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

function MyPromise (fn) {
	const that = this;
	that .state = PENDING;
	that.value = null;
	that.resolvedCallbacks = [];
	that.rejectedCallbacks = [];

	function resolve(value) {
		if (that.state === PENDING) {
			that.state = RESOLVED;
			that.value = value;
			that.resolvedCallbacks.map(cb => {
				cb(that.value);
			})
		}
	}

	function reject(value) {
		if (that.state === PENDING) {
			that.state = REJECTED;
			that.value = value;
			that.rejectedCallbacks.map(cb => {
				cb(that.value);
			})
		}
	}

	try {
		fn(resolve, reject)
	} catch(e) {
		reject(e);
	}
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
	const that = this;
	onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
	onRejected = typeof onRejected === 'function' ? onRejected : r => {throw r};

	if (that.state === PENDING) {
		that.resolvedCallbacks.push(onFulfilled);
		that.rejectedCallbacks.push(onRejected);
	}
	if (that.state === RESOLVED) {
		onFulfilled(that.value);
	}
	if (that.state === REJECTED) {
		onRejected(that.value);
	}
}



// 10. EventLoop
// 因为js是单线程，遇到异步的代码就会被挂起在需要执行的时候加入Task任务队列钟。执行栈为空，event loop就会从task队列钟拿出需要执行的代码；
// 微任务：process.nextTick,promise, mutationobserver
// 宏任务：script, setTimeout, I/O, UI rendering


// 11.手写call,apply,bind
Function.prototype.myCall = function(context) {
	if (typeof this !== 'function') {
		throw 'error'
	}

	context = context || window;
	context.fn = this;
	const args = [...arguments].slice(1);
	const result = context.fn(...args);
	delete context.fn;
	return result;
}

Function.prototype.myApply = function(context) {
	if (typeof this !== 'function') {
		throw 'error'
	}

	context = context || window;
	context.fn = this;
	let result

	// 处理参数和call有区别
	if (arguments[1]) {
		result = context.fn(...arguments[1])
	} else {
		result = context.fn();
	}
	delete context.fn;
	return result;
}

Function.prototype.myBind = function(context) {
	if (typeof this !== 'function') {
		throw 'error'
	}

	const _this = this;
	const args = [...arguments].slice(1);

	// 返回一个函数f.bind(obj, 1)(2)
	return function F() {
		// 因为返回了一个函数,我们可以new F(),所以需要判断
		if (this instanceof F) {
			return new _this(...args, ...arguments)
		}
		return _this.apply(context, args.concat(...arguments))
	}
}


// 12.new
// 1.生成一个新对象；链接到原型；绑定this,返回新对象
function myNew() {
	let obj = {};
	let Con = [].shift.call(arguments);	// 获取构造函数;
	obj.__proto__ = Con.prototype;
	let result = Con.apply(obj, arguments);
	return result instanceof Object ? result : obj;
}


// 13.instanceof
// 通过判断对象的原型链钟是不是能找到类型的protoType；
function myInstanceof(left, right) {
	let prototype = right.prototype;
	left = left.__proto__;

	while(true) {
		if (left === null || left === undefined) return false;
		if (prototype === left) return true;
		left = left.__proto__;
	}
}


// 14.vue2和vue3响应式原理
function defineReactive(data, key, val) {
	Object.defineProperty(data, key, {
		enumerable: true,
		configurable: true,
		get() {
			return val;
		},
		set(newVal) {
			val = newVal;
		}
	})
}

function observe(data) {
	Object.keys(data).forEach(key => {
		defineReactive(data, key, data[key])
	})
}

let p = new Proxy(data, {
	get(target, key, receiver) {
			// target 目标对象，这里即data
			console.log('get value:', key)
			return target[key]
	},
	set(target, key, value, receiver) {
			// receiver 最初被调用的对象。通常是proxy本身，但handler的set方法也有可能在原型链上或以其他方式被间接地调用（因此不一定是proxy本身）。
			// 比如，假设有一段代码执行 obj.name = "jen"，obj不是一个proxy且自身不含name属性，但它的原型链上有一个proxy，那么那个proxy的set拦截函数会被调用，此时obj会作为receiver参数传进来。
			console.log('set value:', key, value)
			target[key] = value
			return true // 在严格模式下，若set方法返回false，则会抛出一个 TypeError 异常。
	}
})



// 23.事件代理
function delegate(element, eventType, selector, fn) {
	element.addEventListener(eventType, e => {
		let el = e.target;

		while(!el.matches(selector)) {
			if (element === el) {
				el = null;
				break;
			}
			el = el.parentNode
		}
		el && fn.call(el, e, el);
	})
	return element;
}

// 24.数组去重
(arr) => [...new Set(arr)];
// filter采用indexOf返回最近的index；
function unique(array) {
	var res = array.filter(function(item, index, array) {
		return array.indexOf(item) === index;
	})
	return res;
}
// reduce去重 includes判断有无当前元素；
function unique(array) {
	var res = array.reduce((pre, cur) => {
		return pre.includes(cur) ? pre : [...pre, cur]
	}, [])
}


// 25.函数柯里化:就是把接受多个参数的函数变换成接受单一参数的函数，并且返回接受余下参数返回结果的应用。
// 思路：判断传递的参数是否达到执行函数的fn个数，没有达到的话继续返回新的函数，并且返回curry函数传递剩余参数。
let myCurry = (fn, ...args) => {
	console.log(args, ...arguments);
	return fn.length > args.length ? (...arguments) => myCurry(fn, ...args, ...arguments) : fn(...args);
}
let add = (a,b,c) => a+b+c;
let addSum = myCurry(add);

// 26 数组展平
function myFlat(arr, d=1) {
	return arr.reduce((res, cur) => {
		if (Array.isArray(cur)) {
			return [...res, ...myFlat(cur)]
		} else {
			return [...res, cur]
		}
	}, []);
}
function flatDeep(arr, d = 1) {
	return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val),
	[]) :
			arr.slice();
};

function flatDeep(arr, d = 1) {
	return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val),
	[]) :
			arr.slice();
};

// 27实现sleep和reduce
function sleep(fn, time) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(fn)
		}, time);
	})
}
function myReduce(fn, initVal) {
	let result = initVal;
	let i = 0;
	if (typeof initVal === 'undefined') {
		result = this[i]
		i++;
	}
	while(i < this.length) {
		result = fn(result, this[i])
	}
	return result;
}