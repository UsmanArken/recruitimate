from pydantic import BaseModel


class CreateClientRequest(BaseModel):
    name: str
    website: str | None = None
    companyProfile: str | None = None
    impressionNotes: str | None = None


class UpdateClientRequest(BaseModel):
    name: str | None = None
    website: str | None = None
    companyProfile: str | None = None
    impressionNotes: str | None = None


class GenerateJobDraftRequest(BaseModel):
    title: str
