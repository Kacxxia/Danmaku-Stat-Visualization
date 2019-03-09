const { interval } = require('rxjs')
const { take, publish, refCount } = require('rxjs/operators')

let liveStreaming$ = interval(1000).pipe(
  take(5)
);

liveStreaming$.subscribe( 
  data => console.log('subscriber from first minute'),
  err => console.log(err),
  () => console.log('completed')
)

setTimeout(() => {
   liveStreaming$.subscribe( 
  data => console.log('subscriber from 2nd minute'),
  err => console.log(err),
  () => console.log('completed')
) 
},2000)