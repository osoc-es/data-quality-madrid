from SPARQLWrapper import SPARQLWrapper, JSON
from rdflib import Graph
import json
from string import Template
import time

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
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

        select distinct ?name ?url where
        {
        ?url rdf:type skos:Concept .
        ?url skos:notation ?name
        FILTER  (regex(?url,"/sector/","i"))
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
                "name":i["name"]["value"],
                "url":i["url"]["value"]
            }
        )
    
    end = time.time()
    print(f"getTematicas >> TIME ELAPSE FORMATTING : {end - start}")
    return filtered

def getPublicadores(endpoint:str = "https://datos.gob.es/virtuoso/sparql"):
    start = time.time()
    query = """
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

        select distinct ?name ?url where
        {
        ?url rdf:type skos:Concept .
        ?url skos:prefLabel ?name
        FILTER  (regex(?url,"/Organismo/","i"))
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
                "url":i["url"]["value"]
            }
        )
    
    end = time.time()
    print(f"getPublicadores >> TIME ELAPSE FORMATTING : {end - start}")

    return filtered

def getDatasetInfo(organismo,sector,endpoint:str = "https://datos.gob.es/virtuoso/sparql"):
    start = time.time()
    sparql = SPARQLWrapper(endpoint)
    query = Template("""
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX dcat: <http://www.w3.org/ns/dcat#> 
    PREFIX dct: <http://purl.org/dc/terms/>
	PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

    select distinct ?title ?url ?lang ?sector ?publisher ?issued ?modified ?license ?format_value where
    {
    ?dataset rdf:type dcat:Dataset .
        ?dataset dct:title ?title .  
        ?dataset dct:issued ?issued .
        ?dataset dct:license ?license .
        ?dataset dct:language ?lang .
  		?dataset dct:modified ?modified.
  	
    ?dataset dcat:distribution ?distribution .
  		?distribution dcat:accessURL ?url .
        ?distribution dct:format ?format .
            ?format rdf:value ?format_value .
  	?dataset dcat:theme ?theme .
    	?theme rdf:type skos:Concept .
        	?theme skos:notation ?sector .
        	
  	?dataset dct:publisher ?publisherURI .
  		?publisherURI rdf:type skos:Concept .
        	?publisherURI skos:prefLabel ?publisher .
        	
        
    # Filtros 
      	
    FILTER  (regex(?theme,"$SECTOR","i")) # Filtro Sector 
    FILTER  (regex(?publisherURI,"$ORGANISMO","i")) # Filtro Organismo     
    FILTER (regex(?format_value,"text/csv","i")) # Tiene que ser CSV
    }
    """)

    sparql.setQuery(query.substitute(SECTOR=sector,ORGANISMO=organismo))

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
                "url":i["url"]["value"],
                "lang":i["lang"]["value"],
                "sector":i["sector"]["value"],
                "publisher":i["publisher"]["value"],
                "issued":i["issued"]["value"],
                "modified":i["modified"]["value"],
                "license":i["license"]["value"],
                "format":i["format_value"]["value"]
            }
        )
     
    end = time.time()
    print(f"getDatasetInfo >> TIME ELAPSE FORMATTING : {end - start}")

    return filtered