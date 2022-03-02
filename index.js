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
