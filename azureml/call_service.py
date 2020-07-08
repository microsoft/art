import requests
import json

resp = requests.post(
    "https://extern2020apim.azure-api.net/cknn/",
    json={
    "url":"https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/AK-BR-324.jpg",
    "n":5,
    "query":"prints"})

print(resp.text)

response_data = json.loads(resp.content, encoding="utf-8")
if "results" not in response_data.keys():
    raise Exception("FAILED: No results field.")