const app = new Vue({
    el: '#app',
    data: {
        messages: [{"id":"A", "sender": "api serverside", "text": "안녕토이"}, {"id":"A", "sender": "api serverside", "text": "안녕토이"}],
        newMessage: '',
        userId: generateUserId()
    },
    mounted() {
        this.authenticateUser();
        this.$el.innerHTML = `
            <div class="chat-container">
                <div class="chat-header">
                    <h2>Chatbot</h2>
                </div>
                <div class="chat-body" ref="chatBody">
                    <div v-for="message in messages" :key="message.id" :class="['message', message.sender]">
                        <div class="message-text">안녕하세요.</div>
                    </div>
                </div>
                
                <div class="chat-body" ref="chatBody">
                    <div v-for="message in messages" :key="message.id" :class="['message', message.sender]">
                        <div class="message-text" v-text="message.text">안녕하세요 22..</div>
                    </div>
                </div>

                <div class="chat-input">
                    <input type="text" v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type your message...">
                    <button @click="sendMessage">전송</button>
                </div>
            </div>
        `;
    },
    methods: {
        authenticateUser() {
            const userId = generateUserId();
            axios.post('/authenticate', { user_id: userId })
                .then(response => {
                    this.sessionId = response.data.session_id;
                })
                .catch(error => {
                    console.error('Authentication error:', error);
                });
        },
        sendMessage() {
            console.log("sendMessage trigerred")
            if (this.newMessage.trim()) {
                this.addMessageToChat('user', this.newMessage);
                this.sendMessageToServer(this.newMessage);
                this.newMessage = '';
            }
        },
        sendMessageToServer(message) {
            console.log("sendMessageToserver trigerred")
            axios.post('/chat', {
                session_id: this.sessionId,
                message: message
            })
            .then(response => {
                this.addMessageToChat(response.data.sender, response.data.text, response.data.id);
            })
            .catch(error => {
                console.error('Error sending message:', error);
            });
        },
        addMessageToChat(sender, message, id) {
            this.messages.push({
                id: id,
                sender: sender,
                text: message
            });
            this.$nextTick(() => {
                const chatBody = this.$refs.chatBody;
                chatBody.scrollTop = chatBody.scrollHeight;
            });
        }
    }
});

function generateUserId() {
    return 'user-' + Math.random().toString(36).substr(2, 9);
}