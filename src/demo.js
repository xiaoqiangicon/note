let promise1 = new Promise((resolve, reject) => {
  console.log(0);
  setTimeout(() => {
    console.log(1)
    resolve('success')
  }, 1000)
}).then(() => {
  console.log('then')
})

let promise2 = Promise.resolve().then(() => {
  console.log(2)
}).then(() => {
  console.log(4)
})

console.log(3);