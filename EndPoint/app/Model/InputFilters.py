from pydantic import BaseModel

class InputFilters(BaseModel):
    endpoint:str = "https://datos.gob.es/virtuoso/sparql"
    theme:str = "All/Unspecified"
    publisher:str = "All/Unspecified"
    keywords:list[str]= []

