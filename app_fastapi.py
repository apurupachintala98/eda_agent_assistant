from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from app_backend import  exec_backend_func,exec_update_fdbk
from typing import Dict,Any
 
description = """
 
## Items
 
You can ** communicate with various chatbots transparently **.
 
"""
 
app = FastAPI(
    title="Chat With CHATBOT",
    description=description,
    summary="The service is to interact with application chatbot",
    version="0.0.1", )
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
class StatusResponse(BaseModel):
    Status: str
 
    class Config:
        json_schema_extra = {
            "example": {
                "Status": "Running"
            }
        }
 
@app.get("/", response_model=StatusResponse)
def check_status_of_service():
  """
    This endpoint is to just check if the api service is running. <BR>
  """
  return {"Status": "Running"}
 
class Message(BaseModel):
    role: str
    content: str
 
 
@app.post("/api/cortex/complete/")
async def get_llm_response(payload: Dict[str, Any]):
    backend_response = exec_backend_func(payload)
    return backend_response
 
 
async def get_llm_feedback(payload: Dict[str, Any]):
    update_response = exec_update_fdbk(payload)
    return update_response