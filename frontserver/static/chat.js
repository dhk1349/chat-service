Vue.component('chat-app', {
    props: {
        sessionId: {
            type: String,
            default: null // 기본값 null 설정
        }
    },
    template: `
      <div class="chat-container">
        <div class="chat-header">
          <h2>dhk1349의 챗봇</h2>
        </div>
        <div class="chat-body" ref="chatBody">
            <div v-for="message in messages" :key="message.id" :class="['message', message.sender === 'user' ? 'user' : 'bot']">
                <div class="message-text" v-text="message.text"></div>
            </div>
        </div>
        <div class="chat-input">
          <input type="text" v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type your message...">
          <button @click="sendMessage">전송</button>
        </div>
      </div>
    `,
    data() {
      return {
        messages: [
          { id: 'A', sender: 'bot', text: '안녕하세요. 무엇을 도와드릴까요?' },
        ],
        newMessage: '',
        userId: generateUserId(),
    
      }
    },
    methods:{
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
            axios.post('http://localhost:7080/chat', {
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

const app = new Vue({
    el: '#app',
    data: {
        sessionId: null
    },
    created() {
        this.authenticateUser()
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
        
    }
  })

function generateUserId() {
    return 'user-' + Math.random().toString(36).substr(2, 9);
}