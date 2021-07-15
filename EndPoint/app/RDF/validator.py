import csv
from datetime import datetime
import re
import time

def initializeProcess(csvFile:str):
    start = time.time()
    # Initialize the process
    f = open(csvFile, "r",encoding="ISO8859-1")
    lines = f.readlines()

    delimiter = findDelimiter(lines[0:10])

    rowCount = 0

    dictErrs = {
        "columnas":
            {
                "repeticion" :[]
            },

        "CamposTexto":
            {
                "ceroizquierda": []
            },
        "CampoNumerico":
            {
                "Region" :[]
            },
        "Fechas":
            {
                "formatoFecha" :[]
            },
        "CampoTelefono":
            {
                "codigopais":[]
            },
        "CoordGeoGraficas":{
            "noSeparadas":[]
        },
        "errorProcessing":"" 
        }
    
    f.close()
    for line in lines:
        row = line.split(delimiter)

        if(rowCount == 0):
            dictErrs["repetition"] = hasRepetitiveCols(row,rowCount)
            rowCount += 1
            continue

        col = 0
        for val in row:
            # Pasar filtros
            # ((rowCount,col), <Error/Valor>)
            try:
                dictErrs["CamposTexto"]["ceroizquierda"] += [((rowCount,col), val)] if checkNumber(val) else []
                dictErrs["CampoNumerico"]["Region"] += [((rowCount,col), val)] if checkCorrectNumber(val) else []            
                dictErrs["Fechas"]["formatoFecha"] += [((rowCount,col), val)] if checkFechas(val) else []
                dictErrs["CampoTelefono"]["codigopais"] += [((rowCount,col), val)] if checkTelephone(val) else []
                dictErrs["CoordGeoGraficas"]["noSeparadas"] += [((rowCount,col), val)] if checkCoordinates(val) else []
            except Exception as e:
                print(e)
                continue

            col += 1
        if(rowCount>50):
            break
        rowCount += 1
    end = time.time()
    print(f"initializeProcess >> TIME ELAPSE IN CSV : {end-start}")
    return dictErrs

def hasRepetitiveCols(row,rowCount):
    '''Check if the row has repetitive columns
          
      Args:
          row: the row to be checked
      Returns:
          True if the row has repetitive columns
    '''
    repetitives = []
    cols = set()
    colNum = 0
    for col in row:
        if col in cols:
            repetitives += [((rowCount,colNum),col)]
        cols.add(col)
        colNum += 1
    return repetitives

def findDelimiter(lines):
    '''Find delimiter
          
      Args:
          csvFile: csv file path
      Returns:
          delimiter
    '''
    def most_frequent(List):
        return max(set(List), key = List.count)

    delimitadores = []
    for i in lines:
        
        dialect = csv.Sniffer().sniff(i)
        delimitadores += [dialect.delimiter]
    
    return most_frequent(delimitadores)
    
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
      return True

def checkCorrectNumber(value):
    #Si tenemos un entero, hemos de revisar que en caso de ser negativo no vaya entre parentesis.
    #El valor es negativo, luego revisamos que no haya instancias de "("
    if(((value.count(")")) > 0) and ((value.count("(")) > 0)):
        if(int((value.replace("(","")).replace(")","")) < 0):
            return True
    else:
        #Revisamos que no tenga separador de millares. 
        if value.count(".") > 0:
            res = value.split(".")
            #Vemos que lo que queda a ambos lados del punto sean enteros.
            for i in res:
                try:
                    int(i)
                except Exception:
                    pass
            return True
        #Revisamos si es un numero con separador regional (en ESP, comas). 
        if value.count(",") > 0:
            if(float("123,123".replace(",","."))):
                pass
            else:
                res = value.split(",")
                for i in res:
                    try:
                        int(i)
                    except Exception:
                        pass
                return True

def checkCoordinates(value):
    '''
    Given a value checks if it is a coordinate
    '''
    regex_string =[ 
        r"(?:(-?[1-8]?d(?:.d{1,18})?|90(?:.0{1,18})?),(-?(?:1[0-7]|[1-9])?d(?:.d{1,18})?|180(?:.0{1,18})?))(?:|(?:(-?[1-8]?d(?:.d{1,18})?|90(?:.0{1,18})?),(-?(?:1[0-7]|[1-9])?d(?:.d{1,18})?|180(?:.0{1,18})?)))*$",
        r"^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$",
        r"^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$",
        r"^([-+]?)([\d]{1,3})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)([-+]?)([\d]{1,3})((\.)(\d+))?)$",
        r"^(\()([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?(\)))$",
        r"(-?(90[ :°d]*00[ :\'\'m]*00(\.0+)?|[0-8][0-9][ :°d]*[0-5][0-9][ :\'\'m]*[0-5][0-9](\.\d+)?)[ :\?\"s]*(N|n|S|s)?)[ ,]*(-?(180[ :°d]*00[ :\'\'m]*00(\.0+)?|(1[0-7][0-9]|0[0-9][0-9])[ :°d]*[0-5][0-9][ :\'\'m]*[0-5][0-9](\.\d+)?)[ :\?\"s]*(E|e|W|w)?)"
        r"""([0-8]?\d(°|\s)[0-5]?\d('|\s)[0-5]?\d(\.\d{1,6})?"?|90(°|\s)0?0('|\s)0?0"?)\s{0,}[NnSs]\s{1,}([0-1]?[0-7]?\d(°|\s)[0-5]?\d('|\s)[0-5]?\d(\.\d{1,6})?"?|180(°|\s)0?0('|\s)0?0"?)\s{0,}[EeOoWw]"""
        r"^(?:(-?[1-8]?d(?:.d{1,18})?|90(?:.0{1,18})?),(-?(?:1[0-7]|[1-9])?d(?:.d{1,18})?|180(?:.0{1,18})?))(?:|(?:(-?[1-8]?d(?:.d{1,18})?|90(?:.0{1,18})?),(-?(?:1[0-7]|[1-9])?d(?:.d{1,18})?|180(?:.0{1,18})?)))*$"]

    for i in regex_string:
        if re.match(i, value):
            return True
    return False