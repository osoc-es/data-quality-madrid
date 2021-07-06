from fastapi import FastAPI


app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get('/getSmth/{name}')
def getSmth(name:str):
    return {"name":name}

