from fastapi import FastAPI
from fastapi.responses import FileResponse
from RDF.funciones import getTematicas,getPublicadores,getDatasetInfo
from random import choice
import os
from Model.InputFilters import InputFilters
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def helloWorld():
    return {"Hello": "World"}

@app.get('/getSmth/{name}')
def getSmth(name:str):
    return {"name":name}

@app.get("/daShrek")
def shrek():
    res = choice(os.listdir("Shreks"))
    return FileResponse(f"Shreks/{res}")

@app.get("/breathtaking")
def breathtaking():
    return FileResponse(f"theKeanu.png")

@app.post('/tematicas')
async def tematicas(endpoint:str = "https://datos.gob.es/virtuoso/sparql"):
    '''
    Devuelve tematicas de la forma
    {
        "name" : nombreTematica,
        "url" : URI de Busqueda
    }
    '''
    print(f"TEMATICAS>> {endpoint}")
    return getTematicas(endpoint)

@app.post('/organismos')
async def organismos(endpoint:str = "https://datos.gob.es/virtuoso/sparql"):
    '''
    Devuelve organismos de la forma
    {
        "name" : nombreOrganismo,
        "url" : URI de Busqueda
    }
    '''
    print(f"ORGANISMOS>> {endpoint}")
    return getPublicadores(endpoint)

@app.post('/themePublisher')
async def theme_publisher(endpoint:str = "https://datos.gob.es/virtuoso/sparql"):
    '''
    Devuelve tematicas y organismos de la forma
    {
        "themes" : [
            {
                "name" : nombreTematica,
                "url" : URI de Busqueda
            }
        ],
        "publisher": [
            {
                "name" : nombreOrganismo,
                "url" : URI de Busqueda
            }
        ]
    }
    '''
    print(f"theme&publisher >> {endpoint}")

    result = {
        "themes":getTematicas(endpoint),
        "publisher":getPublicadores(endpoint)
    }

    return result

@app.post("/validateInput")
async def validateInput(inputfilters:InputFilters):
    organismo = inputfilters.publisher if inputfilters.publisher != "All/Unspecified" else "/Organismo/"
    sector = inputfilters.theme if inputfilters.theme != "All/Unspecified" else "/sector/"

    print(f"validateInput >> Sector:{sector} \tOrganismo: {organismo}")
    return {"results":getDatasetInfo(organismo,sector,endpoint=inputfilters.endpoint)}


