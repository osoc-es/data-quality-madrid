from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
from RDF.funciones import getTematicas,getPublicadores
from random import randint

app = FastAPI()


@app.get("/")
def helloWorld():
    return {"Hello": "World"}

@app.get('/getSmth/{name}')
def getSmth(name:str):
    return {"name":name}

@app.get("/daShrek")
def shrek():
    return FileResponse(f"Shreks/shrek{randint(0,4)}.jpg")

@app.get("/breathtaking")
def breathtaking():
    return FileResponse(f"theKeanu.png")

@app.post('/tematicas')
async def tematicas(endpoint:str = "https://datos.gob.es/virtuoso/sparql",):
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
async def organismos(endpoint:str = "https://datos.gob.es/virtuoso/sparql",):
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
async def theme_publisher(endpoint:str = "https://datos.gob.es/virtuoso/sparql",):
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



