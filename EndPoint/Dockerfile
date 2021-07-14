FROM python:3.9.2-slim-buster

COPY ./app /app


RUN pip install wheel
RUN pip install -r /app/requirements.txt

EXPOSE 80

RUN ls -la
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]

