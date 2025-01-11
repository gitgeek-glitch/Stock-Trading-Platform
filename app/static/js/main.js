document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }

    // Chatbot functionality
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbot = document.getElementById('chatbot');
    const closeChatbot = document.getElementById('close-chatbot');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (chatbotIcon && chatbot && closeChatbot && chatForm && chatInput && chatMessages) {
        chatbotIcon.addEventListener('click', function() {
            chatbot.style.display = 'flex';
            chatbotIcon.style.display = 'none';
        });

        closeChatbot.addEventListener('click', function() {
            chatbot.style.display = 'none';
            chatbotIcon.style.display = 'flex';
        });

        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (message) {
                addMessage('user', message);
                chatInput.value = '';
                // Send message to the server and get a response
                fetch('/api/chatbot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message })
                })
                .then(response => response.json())
                .then(data => {
                    addMessage('bot', data.response);
                })
                .catch(error => {
                    console.error('Error:', error);
                    addMessage('bot', 'Sorry, there was an error processing your request.');
                });
            }
        });

        function addMessage(sender, message) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message', sender);
            messageElement.textContent = message;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Trade form submission
    const tradeForm = document.getElementById('trade-form');
    if (tradeForm) {
        tradeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(tradeForm);
            const symbol = formData.get('symbol');
            const quantity = formData.get('quantity');
            const action = formData.get('action');

            // Send trade request to server
            fetch('/api/trade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    symbol: symbol,
                    quantity: parseInt(quantity),
                    action: action
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(`Trade successful: ${data.message}`);
                    // Update user balance and portfolio (you may want to refresh the page or update specific elements)
                    location.reload();
                } else {
                    alert(`Trade failed: ${data.error}`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while processing your trade. Please try again.');
            });
        });
    }

    // Real-time stock price updates (simulated)
    function updateStockPrices() {
        const stockRows = document.querySelectorAll('#market-data-table tbody tr');
        stockRows.forEach(row => {
            const priceCell = row.querySelector('td:nth-child(3)');
            const changeCell = row.querySelector('td:nth-child(4)');
            if (priceCell && changeCell) {
                const currentPrice = parseFloat(priceCell.textContent.replace('$', ''));
                const newPrice = currentPrice + (Math.random() - 0.5); // Simulated price change
                const priceChange = ((newPrice - currentPrice) / currentPrice) * 100;

                priceCell.textContent = `$${newPrice.toFixed(2)}`;
                changeCell.textContent = `${priceChange.toFixed(2)}%`;
                changeCell.className = priceChange >= 0 ? 'text-success' : 'text-danger';
            }
        });
    }

    // Update stock prices every 5 seconds (simulated real-time updates)
    setInterval(updateStockPrices, 5000);

    // Chart updates (if charts are present)
    function updateCharts() {
        const portfolioChart = Chart.getChart('portfolioChart');
        const performanceChart = Chart.getChart('performanceChart');

        if (portfolioChart) {
            // Update portfolio chart data (replace with actual data in production)
            portfolioChart.data.datasets[0].data = portfolioChart.data.datasets[0].data.map(value => value * (1 + (Math.random() - 0.5) * 0.02));
            portfolioChart.update();
        }

        if (performanceChart) {
            // Update performance chart data (replace with actual data in production)
            const lastValue = performanceChart.data.datasets[0].data[performanceChart.data.datasets[0].data.length - 1];
            performanceChart.data.datasets[0].data.push(lastValue * (1 + (Math.random() - 0.5) * 0.05));
            performanceChart.data.labels.push('');
            if (performanceChart.data.datasets[0].data.length > 20) {
                performanceChart.data.datasets[0].data.shift();
                performanceChart.data.labels.shift();
            }
            performanceChart.update();
        }
    }

    // Update charts every 30 seconds
    setInterval(updateCharts, 30000);

    // Function to format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }

    // Update user balance
    function updateUserBalance() {
        const balanceElement = document.getElementById('user-balance');
        if (balanceElement) {
            fetch('/api/user/balance')
                .then(response => response.json())
                .then(data => {
                    balanceElement.textContent = formatCurrency(data.balance);
                })
                .catch(error => console.error('Error fetching user balance:', error));
        }
    }

    // Update user balance every minute
    setInterval(updateUserBalance, 60000);

    // Implement smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Handle form validation
    const forms = document.querySelectorAll('.needs-validation');
    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Implement lazy loading for images
    const lazyImages = document.querySelectorAll('img.lazy');
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const lazyImage = entry.target;
                lazyImage.src = lazyImage.dataset.src;
                lazyImage.classList.remove('lazy');
                lazyImageObserver.unobserve(lazyImage);
            }
        });
    });
    lazyImages.forEach(lazyImage => {
        lazyImageObserver.observe(lazyImage);
    });

    console.log('All scripts loaded and initialized successfully.');
});
