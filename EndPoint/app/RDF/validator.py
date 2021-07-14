import csv
from datetime import datetime
import re

def initializeProcess(csvFile:str):

    # Initialize the process
    f = open(csvFile, "r")
    lines = f.readlines()
    delimiter = findDelimiter(f)

    rowCount = 0

    dictErrs = {
        "fechas" : [],
        "numbers": [],
        "telf":[],
        "repetition": [],
        "text" : []
    }

    for line in lines:
        row = line.split(delimiter)

        if(rowCount == 0):
            dictErrs["repetition"] = hasRepetitiveCols(row)
            continue
        col = 0
        for i in row:
            
            col += 1



        rowCount += 1

    return dictErrs
def hasRepetitiveCols(row):
    '''Check if the row has repetitive columns
          
      Args:
          row: the row to be checked
      Returns:
          True if the row has repetitive columns
    '''
    cols = set()
    for col in row:
        if col in cols:
            return True
        cols.add(col)
    return False

def findDelimiter(csvFile):
    '''Find delimiter
          
      Args:
          csvFile: csv file path
      Returns:
          delimiter
    '''
    dialect = csv.Sniffer().sniff(csvFile.read())
    csvFile.seek(0)
    csvFile.close()
    return dialect.delimiter

def checkNumber(value):
    # Se puede convertir 009 --> 9
    try:
        float(value)
    except Exception:
        return False
    # Se pueden pasar numeros, en tal caso esta formateado    
    if(type(value) == float or type(value) == int or value == "0"): 
        return False
    
    # Es String y es numerico
    return (not not (re.match(r"[0][0-9]*",value)) ) 

def checkFechas(value):
    if not (type(value) == str):
        return False
    # Puede ser fecha al tener - y /
    if possibleDateEncounter(value):
        # ¿Puede se hora con :?
        if ":" in value:
            try:
                datetime.strptime(value, "%Y-%m-%d:%H:%M:%S")
            except ValueError:
                return True
        else:
            try:
                datetime.strptime(value, "%Y-%m-%d")
            except ValueError:
                return True
    return False

def possibleDateEncounter(value):
    if value.count('-') == 2 or value.count('/') == 2:
        res = value.split("-") if "-" in value else value.split("/")
        if ":" in res[2] :
            res = [res[0],res[1]]+res[2].split(":")
        for i in res:
            try:
                int(i)
                if(len(i)>4):
                    return False
            except Exception:
                return False

            
        return True
        
def checkTelephone(value):
  if type(value) == int:
    value = str(value)
    if len(value) == 9:
      return f"Possible telephone number without prefix: {value}"

def checkCorrectNumber(value):
    #Si tenemos un entero, hemos de revisar que en caso de ser negativo no vaya entre parentesis.
    try:
        #El valor es negativo, luego revisamos que no haya instancias de "("
        if (int(value) < 0):
            if(value.count("(")) > 0:
                return True
    except Exception:
        #Revisamos si es un numero con separador regional (en ESP, comas). Ha de tener una sola coma.
        if value.count(",") > 1:
            return True
        else:
            res = value.split(",")
            #Vemos que lo que queda a ambos lados de la coma sean enteros.
            for i in res:
                try:
                    int(i)
                except Exception:
                    return True