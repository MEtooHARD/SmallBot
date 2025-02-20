const firstPromise = new Promise(resolve => setTimeout(resolve, 1000, 'first'));
const secondPromise = new Promise(resolve => setTimeout(resolve, 500, 'second'));

(async () => {
    console.log('Before await');
    console.log(await secondPromise); // Logs 'second' after 500ms
    console.log(await firstPromise);  // Logs 'first' after 1 second
    console.log('After await');
})()
