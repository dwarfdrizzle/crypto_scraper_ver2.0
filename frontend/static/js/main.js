//Chart.js section
$(document).ready(function() {
    let ctx = document.getElementById('btcChart').getContext('2d');
    let datasets = [];
    let uniqueTimestamps = [];

    let btcChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: uniqueTimestamps,
            datasets: datasets
        },
        options: {
            animation: {
                duration: 1000 //animation for 1 second
            },
            scales: {
                y: {
                    beginAtZero: false
                },
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        displayFormats: {
                            minute: 'HH:mm'
                        }
                    }
                }
            }
        }
    });

//colour for exchanges defined
const exchangeColors = {
    "Binance": "#FF5733",
    "Coinbase Pro": "#33FF57",
    "Poloniex": "#3357FF",
        // ... Add more exchanges and their colors here
};
    
    //fetchBTCPrices because there will be other coins in future, most recent prices
    function fetchCryptoPrices(crypto = "BTC") {
        $.ajax({
            url: `/${crypto.toLowerCase()}_prices`, // Assuming you want this dynamic URL, otherwise use your endpoint
            type: "GET",
            dataType: "json",  // This is the line you missed in the current version
            success: function(data) {
                let allTimestamps = data.map(price => new Date(price.timestamp).toISOString());
                uniqueTimestamps = [...new Set(allTimestamps)].sort();
                let uniqueExchanges = [...new Set(data.map(price => price.exchange))];
    
                //... (rest of the preprocessing code stays the same)
    
                uniqueExchanges.forEach(function(exchange) {
                    let exchangeData = data.filter(price => price.exchange === exchange);
                    let prices = [];
                    
                    uniqueTimestamps.forEach(function(timestamp) {
                        let entry = exchangeData.find(e => new Date(e.timestamp).toISOString() === timestamp);
                        prices.push(entry ? entry.price : null);
                    });
                
                    let colorForExchange = exchangeColors[exchange] || "";
                
                    // Check if the dataset for this exchange already exists
                    let existingDataset = btcChart.data.datasets.find(ds => ds.label === exchange);
                
                    if (existingDataset) {
                        // Update existing dataset
                        existingDataset.data = prices;
                        existingDataset.borderColor = colorForExchange;  // Ensure color matches exchange name
                    } else {
                        // Add a new dataset
                        btcChart.data.datasets.push({
                            label: exchange,
                            data: prices,
                            fill: false,
                            borderColor: colorForExchange,
                            borderWidth: 1,
                            pointRadius: 2,
                            pointBackgroundColor: "rgba(255,255,255,1)",
                            tension: 0.2,
                        });
                    }
                });
    
                // Remove any extra datasets if they exist
                while (btcChart.data.datasets.length > uniqueExchanges.length) {
                    btcChart.data.datasets.pop();
                }
    
                // Update the labels and refresh the chart
                btcChart.data.labels = uniqueTimestamps;
                btcChart.update();
    
                updateRecentDataTable(data, crypto); // Update table
                updateAnalytics(data); // Update the analytics
                updateRank(data); //update for ranks
            },
    
            error: function(error) {
                console.error("Error:", error);
            }
        });
    }

    function updateRecentDataTable(data, crypto) {
        console.log("Updating the data table...")
        let tableBody = $(".recent-data-box tbody");
        tableBody.empty();  // Clear the current rows
    
        // Adjust based on how many recent entries you'd like to show:
        let recentData = data.slice(-30); // This gets the last 5 entries, adjust as needed
    
        recentData.forEach(entry => {
            let formattedDate = moment(entry.timestamp).format('YYYY-MM-DD HH:mm:ss'); // Using moment.js for formatting
            
            let row = `
                <tr>
                    <td>${crypto}</td>
                    <td>${entry.exchange}</td>
                    <td>${entry.price}</td>
                    <td>${formattedDate}</td> <!-- Use formatted date here -->
                </tr>
            `;
            tableBody.append(row);
        });
    }

    fetchCryptoPrices();
    setInterval(fetchCryptoPrices, 1000); //fetches prices at a 1 second(s) interval

    //Analysis Section
    function calculateDifference(data) {
        let highestPrice = Math.max(...data.map(price => price.price));
        let lowestPrice = Math.min(...data.map(price => price.price));
        return highestPrice - lowestPrice;
    }
    
    function calculateAverage(data) {
        return data.reduce((acc, price) => acc + price.price, 0) / data.length;
    }
    
    function calculateStandardDeviation(data) {
        let avg = calculateAverage(data);
        let sumOfSquares = data.reduce((acc, price) => acc + Math.pow(price.price - avg, 2), 0);
        return Math.sqrt(sumOfSquares / data.length);
    }

    function updateAnalytics(data) {
        $('#priceDifference').text(calculateDifference(data).toFixed(2));
        $('#avgPrice').text(calculateAverage(data).toFixed(2));
        $('#stdDev').text(calculateStandardDeviation(data).toFixed(2));
    }

    function updateRank(data) {
        //Get the latest price for each exchange
        let latestPrices = {};
        for (let entry of data) {
            // Assuming each entry has fields: exchange, price, and timestamp (or a similar date field)
            if (!latestPrices[entry.exchange] || entry.timestamp > latestPrices[entry.exchange].timestamp) {
                latestPrices[entry.exchange] = entry;
            }
        }
        
        //Convert the object to an array
        let latestEntries = Object.values(latestPrices);
    
        //Sort the latest entries in descending order based on price
        const sorted = latestEntries.sort((a, b) => b.price - a.price); 
    
        //Map over the sorted data to create the ranking string
        let rankString = sorted.map((item, index) => `${index + 1}. ${item.exchange}`).join(' ');
    
        // Update the HTML display
        $('#rank').text(rankString);
    }

   
    
});    

//Loading screen section
    
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        document.getElementById("loading-screen").classList.add("hidden");
    }, 1800); // Adjust the delay as needed
});     