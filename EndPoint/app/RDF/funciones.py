from SPARQLWrapper import SPARQLWrapper, JSON
from rdflib import Graph
import json
from string import Template
import time
import requests
import os
import glob

def runQuery(endpoint:str,query:str):
    sparql = SPARQLWrapper(endpoint)
    sparql.setQuery(f"""
        {query}
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()

    return results

def getTematicas(endpoint:str = "https://datos.gob.es/virtuoso/sparql"):
    start = time.time()
    query = """
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX dcat: <http://www.w3.org/ns/dcat#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        select distinct ?theme ?sector where
        {
        ?dataset dcat:theme ?theme .
        ?theme skos:notation ?sector .
        }
    """
    
    results = runQuery(endpoint,query)["results"]["bindings"]
    end = time.time()
    print(f"getTematicas >> TIME ELAPSE QUERY : {end - start}")

    #print(results["results"]["bindings"])
    start = time.time()
    filtered = []
    for i in results:
        filtered.append(
            {
                "name":i["sector"]["value"],
                "url":i["theme"]["value"]
            }
        )
    
    end = time.time()
    print(f"getTematicas >> TIME ELAPSE FORMATTING : {end - start}")
    return filtered

def getPublicadores(endpoint:str = "https://datos.gob.es/virtuoso/sparql"):
    start = time.time()
    query = """
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX dcat: <http://www.w3.org/ns/dcat#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX dct: <http://purl.org/dc/terms/>

        select distinct ?publisher ?name where
        {
        ?dataset dct:publisher ?publisher .
        ?publisher skos:prefLabel ?name .
        }
    """
    results = runQuery(endpoint,query)["results"]["bindings"]
    end = time.time()
    print(f"getPublicadores >> TIME ELAPSE QUERY : {end - start}")

    start = time.time()
    filtered = []
    for i in results:
        filtered.append(
            {
                "name":i["name"]["value"],
                "url":i["publisher"]["value"]
            }
        )
    
    end = time.time()
    print(f"getPublicadores >> TIME ELAPSE FORMATTING : {end - start}")

    return filtered

def getDatasetInfo(organismo,sector,keywords,endpoint:str = "https://datos.gob.es/virtuoso/sparql"):
    start = time.time()
    sparql = SPARQLWrapper(endpoint)
    query = Template("""
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX dcat: <http://www.w3.org/ns/dcat#> 
    PREFIX dct: <http://purl.org/dc/terms/>
	PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

    select distinct ?title ?lang ?issued ?modified ?license ?dataset where
    {
    ?dataset rdf:type dcat:Dataset .
        ?dataset dct:title ?title .  
        ?dataset dct:issued ?issued .
        ?dataset dct:license ?license .
        ?dataset dct:language ?lang .
  		?dataset dct:modified ?modified.

    ?dataset dcat:theme $SECTOR . # ON-THE-FLY         	
  	?dataset dct:publisher $ORGANISMO . # ON-THE-FLY 

    ?dataset dcat:distribution ?distribution .
        ?distribution dct:format ?format .
            ?format rdf:value "text/csv" .
        
    
    $KEYWORDSFILTER

    }
    LIMIT 100
    """)

    sparql.setQuery(query.substitute(SECTOR=sector,ORGANISMO=organismo,KEYWORDSFILTER=keywords))

    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()["results"]["bindings"]

    end = time.time()
    print(f"getDatasetInfo >> TIME ELAPSE QUERY : {end - start}")

    #results = runQuery(endpoint,query)["results"]["bindings"]
    start = time.time()
    filtered = []
    for i in results:
        filtered.append(
            {
                "title":i["title"]["value"],
                "lang":i["lang"]["value"],
                "issued":i["issued"]["value"],
                "modified":i["modified"]["value"],
                "license":i["license"]["value"],
                "dataset":i["dataset"]["value"]
            }
        )
     
    end = time.time()
    print(f"getDatasetInfo >> TIME ELAPSE FORMATTING : {end - start}")

    return filtered

def getDistributionInfo(datasetURI,endpoint:str = "https://datos.gob.es/virtuoso/sparql"):
    start = time.time()
    sparql = SPARQLWrapper(endpoint)    
    query = Template("""
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX dcat: <http://www.w3.org/ns/dcat#> 
    PREFIX dct: <http://purl.org/dc/terms/>

        select distinct ?title ?accessURL where
        {
        <$DATASETURI> dcat:distribution ?distribution .
            ?distribution dct:format ?format .
            ?distribution dct:title ?title .
            ?distribution dcat:accessURL ?accessURL .
                ?format rdf:value "text/csv"      
        }
    """)
    sparql.setQuery(query.substitute(DATASETURI=datasetURI))
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()["results"]["bindings"]

    print(results)
    end = time.time()
    print(f"getDistributionInfo >> TIME ELAPSE QUERY : {end - start}")
    #results = runQuery(endpoint,query)["results"]["bindings"]
    start = time.time()
    filtered = []
    for i in results:
        filtered.append(
            {
                "name":i["title"]["value"],
                "url":i["accessURL"]["value"]
            }
        )
    
    end = time.time()
    print(f"getDistributionInfo >> TIME ELAPSE FORMATTING : {end - start}")
    return filtered

def downloadCSV(url:str):
    '''
    Downloads csv file from url and saves it
    '''
    csvFolder = "./CSV"

    start = time.time()       
    response = requests.get(url)       
    end = time.time()     
    
    print(f"downloadCSV >> TIME ELAPSE DOWNLOAD : {end - start}")   

    if not os.path.exists(csvFolder):
        os.mkdir(csvFolder)

    # Count files in CSV folder with extension .csv
    files_count = len(glob.glob(f'{csvFolder}/*.csv'))
    files_count += 1

    filename = f"{csvFolder}/CSV2Check{files_count}.csv"       
    with open(filename, "wb") as f:       
        f.write(response.content)   
    # Llamar al procesado de csv con el nombre del archivo
    # processCSV(filename)

    os.remove(filename)
    
    return filename

