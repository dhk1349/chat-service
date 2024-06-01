from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import uvicorn

import re
import json
import requests

regex = r'^https?://localhost(:\d+)?$'


app = FastAPI()

origins = [
    re.compile(regex), # set proxy server for 
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for chat logs
chat_logs: Dict[str, list] = {}

# Model for chat message
class ChatMessage(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    sender: str
    text: str
    id: int

# Endpoint for handling chat messages
@app.post("/chat")
async def chat(message: ChatMessage):
    session_id = message.session_id
    user_message = message.message

    # Load your language model here and generate a response
    # response_text = generate_response(user_message)
    
    # Store the chat log
    if session_id not in chat_logs:
        chat_logs[session_id] = [{"role":"system", "content": "한글만 사용해."}, {"role": "assistant", "content":"안녕하세요. 무엇을 도와드릴까요?"}]
    message_id = len(chat_logs[session_id]) + 1
    chat_logs[session_id].append({"role": "user", "content": user_message})
    print(session_id)
    print(chat_logs[session_id])

    response = llama_chat(chat_logs[session_id])
    response_text = response["content"]
    chat_logs[session_id].append({"role": "assistant", "content": response_text})

    response = ChatResponse(
        sender="bot",
        text=response_text,
        id=message_id
    )
    return response.dict()

def llama_chat(messages):
    stream = False
    r = requests.post(
        "http://0.0.0.0:11434/api/chat",
        json={"model": "llama3:8b-instruct-q2_K", "messages": messages, "stream": stream},
	stream=stream
    )
    r.raise_for_status()
    output = ""
    
    for line in r.iter_lines():
        body = json.loads(line)
        if "error" in body:
            raise Exception(body["error"])
        if body.get("done") is False:
            message = body.get("message", "")
            content = message.get("content", "")
            output += content
            # the response streams one token at a time, print that as we receive it
            print(content, end="", flush=True)

        if body.get("done", False):
            if not stream:
                message = body.get("message", "")
            else:    
                message["content"] = output
            return message


# Function to generate a response using your language model
def generate_response(message):
    # Load your language model and generate a response
    return "This is a sample response."


if __name__ == "__main__":
    import os
    import uvicorn

    # Get the name of the current script file
    script_name = os.path.basename(__file__).replace(".py", "")

    # Construct the import string for the application instance
    app_import_string = f"{script_name}:app"

    uvicorn.run(app_import_string, host="0.0.0.0", port=70, reload=True)

