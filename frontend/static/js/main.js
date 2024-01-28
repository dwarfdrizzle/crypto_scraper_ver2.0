import 'chartjs-adapter-date-fns';
import Chart from 'chart.js/auto';
import { format } from 'date-fns';
import $ from 'jquery';

console.log('main.js is loaded');
let btcChart; //Declare to be global
let uniqueTimestamps;

//Chart.js section
document.addEventListener('DOMContentLoaded', function() {
    let ctx = document.getElementById('btcChart').getContext('2d');
    btcChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: uniqueTimestamps,
            datasets: datasets,
        },
        options: {
            animation: {
                duration: 300, // 0.3 second

            },
            scales: {
                y: {
                    beginAtZero: false,
                },
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        displayFormats: {
                            minute: 'HH:mm:ss',
                        },
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
            }
        },
    });


//colour for exchanges defined
const exchangeColors = {
    
    "Binance": "#FF5733",
    "Coinbase Pro": "#33FF57",
    //"Poloniex": "3357FF",
    "Bybit": "#68f597",
    "Gateio": "#464531",
    "Bitfinex": "#A2231D",
    "Crypto.com": "#3B83BD",
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
            let formattedDate = format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm:ss'); //using date-fns
            
            let row = `
                <tr>
                    <td data-title="Crypto">${crypto}</td>
                    <td data-title="Exchange">${entry.exchange}</td>
                    <td data-title="Price">${entry.price}</td>
                    <td data-title="Volume">${entry.volume}</td>
                    <td data-title="Timestamp">${formattedDate}</td> <!-- Use formatted date here -->
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
        //$('#priceDifference').text(calculateDifference(data).toFixed(2));
        $('#avgPrice').text(calculateAverage(data).toFixed(2));
        $('#stdDev').text(calculateStandardDeviation(data).toFixed(2));
    }

    function updateRank(data) {
        let latestPrices = {};
        for (let entry of data) {
            if (!latestPrices[entry.exchange] || entry.timestamp > latestPrices[entry.exchange].timestamp) {
                latestPrices[entry.exchange] = entry;
            }
        }
    
        let latestEntries = Object.values(latestPrices);
        const sorted = latestEntries.sort((a, b) => b.price - a.price);
    
        // Assuming the first entry has the highest price
        const highestPrice = sorted.length > 0 ? parseFloat(sorted[0].price) : 0;
    
        let tableBody = document.getElementById('rankings-body');
        tableBody.innerHTML = ''; // Clear current content
    
        sorted.forEach((item, index) => {
            let row = tableBody.insertRow();
            let cellRank = row.insertCell(0);
            let cellExchange = row.insertCell(1);
            let cellPrice = row.insertCell(2);
            let cellDiff = row.insertCell(3); // Cell for price difference
    
            cellRank.textContent = index + 1;
            cellExchange.textContent = item.exchange;
            cellPrice.textContent = item.price;
    
            // Calculate the difference and update the cell
            let priceDiff = highestPrice - parseFloat(item.price);
            cellDiff.textContent = priceDiff.toFixed(2); // Adjust decimal points as needed
        });
    }

    

});

//show and hide overlays, modded to show html content
function toggleOverlay(contentHtml = '') {
    var overlay = document.getElementById("overlay-container");
    if (overlay.classList.contains("active")) {
        overlay.classList.remove("active");
        overlay.innerHTML = ''; // Clear content when hiding
    } else {
        overlay.innerHTML = contentHtml; // Insert new content
        overlay.classList.add("active");
    }
};


document.addEventListener('DOMContentLoaded', function() {
    // This ensures the DOM is fully loaded before attaching the event listener.
    var showDataButton = document.getElementById('show-data-button');
    if (showDataButton) {
        showDataButton.addEventListener('click', showData);
    }
});

document.addEventListener('DOMContentLoaded', function() {    
    var showAnalysisButton = document.getElementById('show-analysis-button');
    if (showAnalysisButton) {
        showAnalysisButton.addEventListener('click', showAnalysis);
    }
});

//Analysis overlay
function showAnalysis() {
    console.log("showAnalysis called"); // Log to show when it is called
    var overlayContent = `
    <h1>Analysis</h1>
    <div class="analytics data-card">
    <p><strong>Average Price:</strong> <span id="avgPrice">...</span></p>
    <p><strong>Standard Deviation:</strong> <span id="stdDev">...</span></p>        
    </div>

    <button id="close-button" onclick="toggleOverlay()">
    <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2"/>
    </svg>
    </button>
    `; // Content for the overlay

    toggleOverlay(overlayContent);
};


// Show raw data card
function showData() {
    console.log("showData Called"); //log when asked
    var overlayContent = `
    <h1>Data</h1>
    <section class="data-card">
        <div>
            <table class="recent-data-box">
                <thead>
                    <tr>
                        <th>Crypto</th>
                        <th>Exchange</th>
                        <th>Price</th>
                        <th>Volume</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody id>
                <!-- Rows will be populated here via JS -->
                
                </tbody>
            </table>   
        </div>
    </section>
    <button id="close-button" onclick="toggleOverlay()">
    <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2"/>
    </svg>
    </button>
    `; // content for raw data
    
    toggleOverlay(overlayContent);
};

//Burger menu toggle 
function toggleMenu() {
    const navLinks = document.getElementById("nav-links");
    if (navLinks) {
        navLinks.classList.toggle("active");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('hamburger-menu');
    if (menuButton) {
        menuButton.addEventListener('click', toggleMenu);
    }
});

window.addEventListener('scroll', () => {
    console.log("Scroll event triggered"); // To check if the scroll event is working
    document.querySelectorAll('.mission-statement svg').forEach((svg, index) => {
        console.log(`Checking SVG ${index}`); // Log each SVG being checked
        if (svg.getBoundingClientRect().top < window.innerHeight) {
            console.log(`Animating SVG ${index}`); // Log when an SVG should animate
            svg.classList.add('active');
        } else {
            svg.classList.remove('active');
        }
    });
});


//create cells for hero-section
document.addEventListener("DOMContentLoaded", function() {
    const gridContainer = document.querySelector('.hero-section .grid-container');

    if (gridContainer) {
        for (let i = 0; i < 16; i++) { // Adjust the number for your grid size
            const gridCell = document.createElement('div');
            gridContainer.appendChild(gridCell);
        }
    }
});