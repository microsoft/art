import azureml, json, os, requests, shutil, urllib

def call(scoring_uri,url):
    """
    Makes a call to the scoring uri with url parameter.
    """
    headers = {'Content-Type':'application/json'}
    test_data = json.dumps({"url":url})
    return requests.post(scoring_uri, data=test_data, headers=headers)

if __name__ == "__main__":
    scoring_uri = 'http://localhost:5050/score'
    url='https://wamu.org/wp-content/uploads/2019/12/Bei-Bei-trip-to-china-1500x1266.jpg'
    response = call(scoring_uri, url)

    print(response.status_code)
    print(response.elapsed)
    print(response.text)