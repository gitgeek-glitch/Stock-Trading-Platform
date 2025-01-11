// app/static/js/trade.js

// Function to search for stocks
function searchStocks() {
    const input = document.getElementById('search-symbol').value;
    const symbolSelect = document.getElementById('symbol');
    
    // Clear previous options
    symbolSelect.innerHTML = '<option value="">Select a stock</option>';

    if (input.length < 1) {
        return; // Exit if input is empty
    }

    fetch(`/api/search_stock?query=${input}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Stock not found');
            }
            return response.json();
        })
        .then(data => {
            // Check if data is valid
            if (data.symbol) {
                // Populate the stock symbol dropdown
                const option = document.createElement('option');
                option.value = data.symbol;
                option.textContent = `${data.symbol} - ${data.name}`;
                symbolSelect.appendChild(option);

                // Update the market data table
                const newRow = document.createElement('tr');
                newRow.setAttribute('data-symbol', data.symbol);
                newRow.innerHTML = `
                    <td>${data.symbol}</td>
                    <td>${data.name}</td>
                    <td>$<span id="price-${data.symbol}">${data.price.toFixed(2)}</span></td>
                    <td>
                        <button onclick="buyStock('${data.symbol}')">Buy</button>
                        <button onclick="sellStock('${data.symbol}')">Sell</button>
                    </td>
                `;
                document.querySelector('#market-data-table tbody').appendChild(newRow);
            } else {
                console.error('No stock data returned');
            }
        })
        .catch(error => {
            console.error('Error fetching stock data:', error);
        });
}