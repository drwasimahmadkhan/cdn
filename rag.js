(function() {
    function loadChatbot() {
        const chatbotContainer = document.getElementById('chatbot-container');

        // Hardcoded values or dynamic retrieval (adjust as needed)
        const userIdentifier = "dummy_user_12345"; 
        const userName = "Dummy User"; // Replace with actual user name
        const userEmail = "dummyuser@example.com"; // Replace with actual user email
        const userStatus = "premium";  // Replace with actual membership level
        const selectedRag = "External FAQs";  // Adjust based on login status
        const destinationValue = "default_destination";  // Replace with actual destination value

        chatbotContainer.innerHTML = `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
                #chatbot-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 360px;
                    z-index: 1000;
                    font-family: 'Segoe UI', sans-serif;
                }
                #chatbot-box {
                    display: none;
                    flex-direction: column;
                    justify-content: space-between;
                    background: #f9f9f9;
                    border: 1px solid #ddd;
                    border-radius: 0px;
                    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.15);
                }
                #chatbot-header {
                    background: #0073aa;
                    color: #fff;
                    padding: 12px;
                    font-size: 18px;
                    text-align: center;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                #chatbot-header:hover {
                    background: #005f8c;
                }
                #chatbot-content {
                    padding: 15px;
                    font-size: 14px;
                    color: #333;
                    height: 400px;
                    overflow-y: auto;
                }
                #chatbot-input {
                    padding: 15px;
                    display: flex;
                }
                #chatbot-input textarea {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    resize: none;
                    height: 42px;
                    font-size: 14px;
                }
                #chatbot-input button {
                    padding: 10px 20px;
                    background: #0073aa;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    margin-left: 10px;
                    cursor: pointer;
                }
            </style>
            <div id="chatbot-header">
                <span>RAG Chatbot</span>
                <i class="fas fa-expand-arrows-alt"></i>
            </div>
            <div id="chatbot-box">
                <div id="chatbot-content"></div>
                <div id="chatbot-input">
                    <textarea id="chatbot-message" placeholder="Type your message..."></textarea>
                    <button id="send-button">Send</button>
                </div>
            </div>
        `;

        document.body.appendChild(chatbotContainer);

        const chatbotHeader = document.getElementById('chatbot-header');
        const chatbotBox = document.getElementById('chatbot-box');
        const sendButton = document.getElementById('send-button');
        const chatbotContent = document.getElementById('chatbot-content');
        const chatbotMessage = document.getElementById('chatbot-message');

        chatbotHeader.addEventListener('click', () => {
            chatbotBox.style.display = chatbotBox.style.display === 'none' ? 'flex' : 'none';
        });

        sendButton.addEventListener('click', async () => {
            const message = chatbotMessage.value.trim();
            if (message) {
                const userMessage = document.createElement('div');
                userMessage.className = 'message_user';
                userMessage.innerHTML = `<strong>You:</strong> ${message}`;
                chatbotContent.appendChild(userMessage);
                chatbotMessage.value = '';
                chatbotContent.scrollTop = chatbotContent.scrollHeight;

                let botMessage = document.createElement("div");
                botMessage.className = 'message_bot';
                botMessage.innerHTML = "<strong>RAG Chatbot:</strong> <span id='bot-response'></span>";
                chatbotContent.appendChild(botMessage);
                let botResponseSpan = botMessage.querySelector('#bot-response');

                try {
                    const response = await fetch("https://qjqmv2vx22.ap-southeast-2.awsapprunner.com/api/generate_response", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            user_query: message,
                            user_id: userIdentifier,  // Hardcoded user identifier
                            name: userName,  // Hardcoded user name
                            email: userEmail,  // Hardcoded user email
                            membership_level: userStatus,  // Hardcoded membership level
                            selected_rag: selectedRag,  // Context based on login status
                            destination: destinationValue  // Hardcoded destination value
                        })
                    });

                    const reader = response.body.getReader();
                    const textDecoder = new TextDecoder();
                    let fullResponse = '';
                    
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunk = textDecoder.decode(value, { stream: true });
                        fullResponse += chunk;

                        // Parsing markdown to HTML using marked.js
                        let parsedHTML = marked.parse(fullResponse);
                        botResponseSpan.innerHTML = parsedHTML;

                        // Open links in a new tab
                        let links = botResponseSpan.getElementsByTagName('a');
                        for (let i = 0; i < links.length; i++) {
                            links[i].setAttribute('target', '_blank');
                        }

                        chatbotContent.scrollTop = chatbotContent.scrollHeight;
                    }
                } catch (error) {
                    botResponseSpan.innerHTML = "Error: Unable to fetch response.";
                }
            }
        });
    }

    // Ensure the chatbot loads after the page content
    window.addEventListener('load', loadChatbot);
})();
