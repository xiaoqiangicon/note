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
	// 递归子属性
	observe(val);
	let dp = new Dep();
	Object.defineProperty(data, key, {
		enumerable: true,
		configurable: true,
		get() {
			// 将watch添加到订阅
			if (Dep.target) {
				dp.addSub(Dep.target);
			}
			return val;
		},
		set(newVal) {
			val = newVal;
			dp.notify();
		}
	})
}

function observe(data) {
	Object.keys(data).forEach(key => {
		defineReactive(data, key, data[key])
	})
}

// 解耦属性的依赖收集和派发更新操作
class Dep {
	constructor() {
		this.subs = [];
	}

	// 添加依赖
	addSub() {
		this.subs.push(sub)
	}

	// 更新
	notify() {
		this.subs.forEach(sub => {
			sub.update();
		})
	}
}
// 全局属性，通过该属性配置watcher
Dep.target = null;

class Watch {
	constructor(obj, key, cb) {
		// 将Dep.target指向自己，然后触发属性的getter添加监听,最后将Dep.target置空
		Dep.target = this;
		this.cb = cb;
		this.obj = obj;
		this.key = key;
		this.value = obj[key];
		Dep.target = null;
	}
	update() {
		// 获得新值
		this.value = this.obj[this.key];
		// 调用update更新DOM
		this.cb(this.value);
	}
}
// 核心就是手动触发一次属性的getter来实现依赖收集

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


// 15.子节点是动态生成，子节点需要注册事件的话应该注册到父节点上；
// 节省内存，不需要给子节点注销事件。

// 16.跨域  JSONP和cors 服务端设置Access-Control-AAllow-Origin就可以开启CORS。
// document.domain.只适用于二级域名相同的情况。比如a.test.com和b.test.com  给页面添加document.domain = 'test.com';
// postMessage 通常用于获取嵌入页面的第三方页面数据，一个页面发送消息，另一个页面判断来源并接收消息。



// 17.储存  cookie,session,localstorage,sessionStorage,indexDB
// cookie一般由服务器生成，可以设置过期时间，4k，每次都会携带在header中，对于请求性能影响。


// 18.浏览器缓存。缓存位置和缓存策略。
// 缓存位置：service worker  memory cache disk cache push cache 网络请求
// 缓存策略：强缓存和协商缓存。通过HTTP Header实现。
// 强缓存通过Expires和Cache-Contorl设置。
// 协商缓存通过 Last-Modified和ETag实现。浏览器发起验证资源时，如果资源没变，那么服务端就会返回304状态码。

// 19.浏览器渲染原理：插入几万个DOM怎么不卡顿，就是只渲染可视区域的内容，在用户滚动的时候实时替换渲染的内容。
// 重绘：改变外观，不改变布局。  回流：布局或者几何属性需要改变。回流必定重绘，重绘不一定回流。
// 如何加快渲染速度：1.从文件大小考虑，2.从script标签使用考虑；3.从css，html书写考虑 4.从需要下载的内容是否需要在首屏使用考虑


// 20.前端安全。
// xss攻击：攻击者将可执行的代码注入到网页中。通过转义字符规避，也可以通过白名单过滤的方法。
// csp：本质上就是建立白名单，只需要配置规则。1.通过设置header的Content-Security-Policy  2.通过设置meta标签的<meta http-equiv="Content-Security-Policy">开启。

// csrf攻击。跨站请求伪造。
// 防范：1.get请求不对数据修改   2.不让第三方网站访问到用户COOKIE，3.阻止第三方网站请求接口  4.请求时附带验证信息，比如验证码或者Token。可以通过验证Referer判断是否时第三方网站发起的。

// 点击劫持：攻击者将需要攻击的网站通过iframe嵌入页面，将iframe设置为透明，诱导用户点击。
// 可以通过设置X-FRAME-OPTIONS响应头来设置。DENY,SAMEORIGIN,ALLOW-FROM
// 通过js防御： self === top则代表内嵌入其他页面。


// 21.前端优化
// DNS预解析。<link rel="dns-prefetch" href="">
// 节流：滚动发起请求事件，每隔一段时间发起一次。
function throttle(func, wait=50) {
	// 上一次执行该函数的时间
	let lastTime = 0;
	return function(...args) {
		// 当前时间
		let now = +new Date();
		if (now - lastTime > wait) {
			lastTime = now;
			func.apply(this, args);
		}
	}
}

// 防抖：按钮点击触发网络请求，不希望每次点击都发起网络请求，当用户点击按钮一段时间后没有再次点击才去发起请求。短时间大量触发同一事件，只会执行一次。
function debounce(func, wait=50) {
	let timer = 0;

	return function(...args) {
		if (timer)	clearTimeout(timer);

		timer = setTimeout(() => {
			func.apply(this, args);
		}, wait)
	}
}

// 预加载 预渲染prerender   懒加载   懒执行   CDN  


// 22.webpack性能优化
// 减少打包时间：1.优化Loader,优化loader的文件搜索范围  2.HappyPack，webpack打包过程是单线程的，happypack可以将loader的同步执行转换为异步的。  3.DllPlugin可以将特定的类库提前打包然后引入，减少打包类库的次数，并且也实现了公共代码抽离成单独文件的优化方案。  4.代码压缩，一般使用UglifyJS压缩代码。webpack4中mode为production就默认压缩代码。 一些小的优化点：resolve.alias通过别名映射一个路径，更快找到路径。表明文件后缀列表，减少查找。

// 减少打包的体积：1.按需加载。 2.scope hoisting 分析出模块的依赖关系，尽可能把打包的模块合并到一个函数中去。 3.tree shaking。生产环境自动开启。     


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


// 28.前端路由 onhashchange和history.pushState,history.replaceState改变url；1.hash模式无需后端配置，history模式在用户手动输入地址或者刷新页面时候会发起url请求，后端需要配置Index.html页面用于匹配不到静态资源的时候。

// 29.生命周期函数：beforeCreate created beforeMount(创建VDOM) mounted（渲染） beforeDestory destoryed   
// keep-alive的生命周期有  actived(命中缓存时调用)  deactivated
// NextTick:下次Dom更新循环结束之后执行延迟回调，用于获取更新后的DOM。

// 30 UDP和TCP：UDP是无连接的，通信不需要建立连接，所以不可靠，不拆分不拼接。高效，一对一一对多多对多多对一都可。
// 输入URL到页面渲染的整个流程  1.解析DNS   2.建立TCP连接   3.浏览器解析渲染页面
