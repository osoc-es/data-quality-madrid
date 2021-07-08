from SPARQLWrapper import SPARQLWrapper, JSON
from rdflib import Graph
import json

sparql = SPARQLWrapper("https://datos.gob.es/virtuoso/sparql")
sparql.setQuery("""
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    select distinct ?x where
    {
    ?x ?p ?o 
    FILTER  (regex(?x,"/Organismo/","i"))
    }

    LIMIT 100
""")

sparql.setReturnFormat(JSON)
results = sparql.query().convert()
print(results)