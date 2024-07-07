FROM python:3.12.3-bullseye

WORKDIR /usr/app/src

COPY requirements.txt .
COPY PA.py .

RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
RUN pip install -r requirements.txt

CMD ["flask", "--app", "PA", "run", "--debug", "--host=0.0.0.0", "--port=8000"]

# indica quale interfacce di rete vanno in ascolto, con 0.0.0.0 dico tutte (WiFi, LAN, ecc 1, 2, 4, 8)