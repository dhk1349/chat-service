Vue.component('chat-app', {
    props: {
        sessionId: {
            type: String,
            default: null // 기본값 null 설정
        }
    },
    template: `
    <div>
      <div class="chat-container">
        <div class="chat-header">
          <h2>dhk1349의 챗봇</h2>
          <select v-model="selectedApi">
            <option value="local:llama3:8b-instruct-q2_K">local:llama3:8b-instruct-q2_K</option>
            <option value="claude">claude</option>
          </select>
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

      <div class="modal" v-show="showModalFlag" @click.self="toggleModal()">
        <div class="modal-content">
            <span class="close" @click.stop="toggleModal()">&times;</span>
            <h3>API 키 입력</h3>
            <input type="text" v-model="apiKey" placeholder="API 키를 입력하세요">
            <button @click="saveApiKey">확인</button>
        </div>
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
          apiKeyRequired: {
            'local:llama3:8b-instruct-q2_K': false,
            'claude': true
          },
          selectedApi: 'local:llama3:8b-instruct-q2_K', // 기본 API 설정
          apiKey: '', // API 키 값의 입력필드
          apiKeys: {}, // API 키 저장용 객체

          showModalFlag: false,
        }
      },
    watch: {
        selectedApi(newApi) {
          if (this.apiKeyRequired[newApi] && !this.apiKeys[newApi]) {
            this.showModalFlag = true;
          }
        }
      },
    methods:{
        toggleModal() {
            this.showModalFlag = !this.showModalFlag; // 데이터 속성 값 토글
          },
        saveApiKey() {
            this.apiKeys[this.selectedApi] = this.apiKey; // 선택한 API에 대한 키 저장
            this.apiKey = ''; // 입력 필드 초기화
            this.showModalFlag = false;
        },    
        sendMessage() {
            console.log("sendMessage trigerred")
            if (this.newMessage.trim()) {
                this.addMessageToChat('user', this.newMessage);
                this.sendMessageToServer(this.newMessage);
                this.newMessage = '';
            }
        },
        sendMessageToServer(message) { //better to encrypt api key
            const api = this.selectedApi
            const apiKey = this.apiKeys[this.selectedApi];
            const url = `http://localhost:7080/chat`;
            const requestData = {
                session_id: this.sessionId,
                message: message,
                api: api,
                api_key: apiKey // Add the API key to the request data
            };

            console.log("sendMessageToserver trigerred")
            axios.post(url, requestData)
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
