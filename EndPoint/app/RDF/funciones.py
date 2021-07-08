from SPARQLWrapper import SPARQLWrapper, JSON
from rdflib import Graph
import json


def runQuery(endpoint:str,query:str):
    sparql = SPARQLWrapper(endpoint)
    sparql.setQuery(f"""
        {query}
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()

    return results


def getTematicas(endpoint:str = "https://datos.gob.es/virtuoso/sparql"):
    
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

    #print(results["results"]["bindings"])

    filtered = []
    for i in results:
        filtered.append(
            {
                "name":i["name"]["value"],
                "url":i["url"]["value"]
            }
        )
    

    return filtered


def getPublicadores(endpoint:str = "https://datos.gob.es/virtuoso/sparql"):
    
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
    
    filtered = []
    for i in results:
        filtered.append(
            {
                "name":i["name"]["value"],
                "url":i["url"]["value"]
            }
        )
    

    return filtered