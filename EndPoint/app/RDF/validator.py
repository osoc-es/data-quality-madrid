import csv

def initializeProcess(csvFile:str):

    # Initialize the process
    with open(csvFile) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=findDelimiter(csvFile))
        line_count = 0
        for row in csv_reader:
            print()
        print(f'Processed {line_count} lines.')
    




def findDelimiter(csvFile):
    '''Find delimiter
          
      Args:
          csvFile: csv file path
      Returns:
          delimiter
    '''
    try:
        csv_file = open(csvFile,encoding="ISO8859-1")
    except IOError as e:
        print(f'Unable to open the file {csvFile}')
        print(e)
    
    dialect = csv.Sniffer().sniff(csv_file.read())
    csv_file.seek(0)
    csv_file.close()
    return dialect.delimiter

