from pydantic import BaseModel, EmailStr


class CreateInviteRequest(BaseModel):
    email: EmailStr
    roleId: str


class AcceptInviteRequest(BaseModel):
    token: str
    name: str
    password: str
