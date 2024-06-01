from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import asyncio

import uuid
from pydantic import BaseModel

class User(BaseModel):
    user_id: str

class ChatObject(BaseModel):
    session_id: str
    message: str

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# 연결된 WebSocket 클라이언트를 저장할 {}
connected_clients = {}

# 채팅 메시지를 저장할 리스트
chat_messages = []

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/authenticate")
async def authenticate_user(user_info: User):
    # 모의 인증 처리
    print(f"request for auth: {user_info}")
    connected_clients[user_info.user_id] = str(uuid.uuid4())  # 임의의 세션 ID 생성
    return {"session_id": connected_clients[user_info.user_id]}

# @app.post("/chat")
# async def mock_chat(user_id: str, message: str):
#     # 여기에 mock 응답을 작성하세요.
#     mock_response = "This is a mock response from the server."
#     return {"response": mock_response}

@app.post("/chat")
async def mock_chat(chatobj: ChatObject):
    session_id = chatobj.session_id
    message = chatobj.message
    
    user_id = [user for user, sid in connected_clients.items() if sid == session_id]
    if user_id:
        user_id = user_id[0]
        message_obj = {"id": str(uuid.uuid4()), "user_id": user_id, "text": message, "sender": "bot"}
        chat_messages.append(message_obj)
        return message_obj
    else:
        return {"error": "Invalid session ID"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)

    try:
        while True:
            # 클라이언트로부터 메시지 수신
            data = await websocket.receive_text()
            chat_messages.append(data)

            # 연결된 모든 클라이언트에게 메시지 전송
            await asyncio.wait([client.send_text(data) for client in connected_clients])

    except WebSocketDisconnect:
        connected_clients.remove(websocket)

if __name__ == "__main__":
    import os
    import uvicorn

    # Get the name of the current script file
    script_name = os.path.basename(__file__).replace(".py", "")

    # Construct the import string for the application instance
    app_import_string = f"{script_name}:app"

    uvicorn.run(app_import_string, host="0.0.0.0", port=81, reload=True)
    # uvicorn.run(app, host="0.0.0.0", port=81, reload=True)