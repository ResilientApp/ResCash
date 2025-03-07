import WebSocket from 'ws';

// Replace with your WebSocket endpoint
const wsUrl = 'ws://35.193.4.170:18000/blockupdatelistener';

const ws = new WebSocket(wsUrl);

// Handle connection opening
ws.on('open', () => {
    console.log('WebSocket connection established successfully.');
});

// Handle incoming messages
ws.on('message', (data) => {
    const message = data.toString('utf8'); // Convert buffer to string
    console.log('Message received from WebSocket:', message);

    try {
        const parsed = JSON.parse(message); // Try parsing as JSON
        console.log('Parsed message as JSON:', parsed);
    } catch (err) {
        console.warn('Could not parse message as JSON. Treating as plain text:', message);
        // Handle plain text messages (e.g., "Update blocks")
        if (message === 'Update blocks') {
            console.log('Fetching new blocks...');
    // Replace with actual API call logic
    fetch('http://35.193.4.170:18000/v1/blocks')
    .then((response) => response.json())
    .then((data) => {
        console.log('Fetched blocks from API:');
        data.forEach((block) => {
            console.log(`Block ID: ${block.id}, Number: ${block.number}, Created At: ${block.createdAt}`);
            console.log('Transactions:');
            console.log(JSON.stringify(block.transactions, null, 2)); // Log full transaction details
        });
    })
    .catch((error) => {
        console.error('Error fetching blocks:', error);
    });
        }
    }
});


// Handle errors
ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

// Handle connection closure
ws.on('close', () => {
    console.log('WebSocket connection closed.');
});
