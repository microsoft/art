FROM ubuntu:18.04

RUN apt-get update -y && \
    apt-get install -y python-pip python-dev

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "python", "./application.py" ]