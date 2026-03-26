import io from 'socket.io-client';
import fs from 'fs'

// const socket = io('https://redalert.orielhaim.com', {
//     auth: {
//         apiKey: 'pr_TwGtUQvnMgnWbYTRHOnwrGcKuZvDqppALWqwWdoJLSpfvsUYGNiyOfVwWoPBrOdr'
//     }
// });
// socket.on('connect', () => {
//     console.log('Connected to RedAlert');
// });


// Listen to all alerts (returns array of alerts)
// s

// Or listen to specific alert types (returns single alert object)
// socket.on('missiles', (alert) => {
//     console.log('Missile alert:', alert);
// });

// socket.on('endAlert', (alert) => {
//     console.log('End event:', alert);
// });

fetch("https://redalert.orielhaim.com/api/data/cities?include=coords&limit=500", {
  method: "GET",
  headers: {
    "Authorization": "Bearer pr_TwGtUQvnMgnWbYTRHOnwrGcKuZvDqppALWqwWdoJLSpfvsUYGNiyOfVwWoPBrOdr",
    "Content-Type": "application/json"
  }
})
  .then(response => response.json())
  .then(data => fs.writeFileSync('cities', JSON.stringify(data)))
  .catch(error => console.error(error));