from fastapi import FastAPI
from fastapi.responses import FileResponse
from .RDF.funciones import getTematicas,getPublicadores,getDatasetInfo,getDistributionInfo
from random import choice
import os
from .Model.InputFilters import InputFilters
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

@app.post("/getDatasets")
async def getDatasets(inputfilters:InputFilters):
    organismo = f"<{inputfilters.publisher}>" if inputfilters.publisher != "All/Unspecified" else "?publisherURI"
    sector = f"<{inputfilters.theme}>" if inputfilters.theme != "All/Unspecified" else "?theme"

    inputfilters_str =""
    if(len(inputfilters.keywords) == 0):
        inputfilters_str = ""
    elif(len(inputfilters.keywords) == 1):
        inputfilters_str = """
         \nOPTIONAL {
            ?dataset dcat:keyword ?result
                FILTER (regex(?result,\""""+inputfilters.keywords[0]+"""\","i")) 
        }\n
        """
    else:
        inputfilters_str = """
         \nOPTIONAL {
            ?dataset dcat:keyword ?result
                FILTER (regex(?result,"""+"|".join(inputfilters.keywords)+""","i")) 
        }\n
        """
    

    print(f"getDatasets >> Sector:{sector} \tOrganismo: {organismo}\tKeywords: {inputfilters.keywords}")
    return {"results":getDatasetInfo(organismo,sector,inputfilters_str,endpoint=inputfilters.endpoint)}

@app.post("/getDistributions")
async def getDistributions(distributionUri:str,endpoint:str = "https://datos.gob.es/virtuoso/sparql"):

    print(f"getDistributions >> {distributionUri}")
    return {"results":getDistributionInfo(distributionUri,endpoint=endpoint)}

@app.post("/validateDataset")
async def validateDataset(datasetLink:str):
    return datasetLink

