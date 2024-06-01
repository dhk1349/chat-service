from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import uvicorn
import re

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
    response_text = generate_response(user_message)

    # Store the chat log
    if session_id not in chat_logs:
        chat_logs[session_id] = []
    message_id = len(chat_logs[session_id]) + 1
    chat_logs[session_id].append({"user": user_message, "bot": response_text})

    response = ChatResponse(
        sender="bot",
        text=response_text,
        id=message_id
    )

    return response.dict()

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

