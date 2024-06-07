# 🤖 Chat Service

<div align="center">
  <img width="524" alt="chatscreen" src="https://github.com/dhk1349/chat-service/assets/41980618/d0029e06-a14b-4d83-a69b-0ba21d3546a4">
</div>



https://github.com/dhk1349/chat-service/assets/41980618/ca1bc1e2-a8f5-41db-bd6c-272c8cabb406



This is a chatbot project that consists of two separate servers: a chat server and a front server. The front server is responsible for handling the user interface, while the chat server handles the chatbot functionality.

## 🚀 Getting Started

To get started with this project, follow these steps:

1. **Install Dependencies**

   Make sure you have the required dependencies installed. You can install them by running the following command:

   ```bash
   curl -fsSL https://ollama.com/install.sh | sh


2. **Start the Front Server**

   Navigate to the front server directory and run the main.py file:
  
   python main.py

3. **Start the Chat Server**

   Open three separate terminal sessions and run the following commands in each:

   Terminal 1:

   python main.py
   
   Terminal 2:

   install llama3:8b-instruct-q2_K and start ollama server 

   **OR use Claude API**
   
Note: The current chatbot is running with the llama3:8b-instruct-q2_K model.

## ✅ To Do

1. Use DB to store userId and sessionId and chatlogs.
   
2. Test on a larger models for better chat experience.

3. Deploy the application to a production server for external access.

4. Integrating additional features and improvements, such as improved error handling, better security measures, and performance optimizations.

## ✍️ Remarks

Currently, the project has been tested on local docker environment(with multiple docker containers), and further testing will be conducted in different environments.
