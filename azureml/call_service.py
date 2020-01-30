import requests

resp = requests.post(
    "https://extern2020apim.azure-api.net/cknn/",
    json={
    "url":"https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/AK-BR-324.jpg",
    "n":5,
    "query":"prints"})

print(resp.text)