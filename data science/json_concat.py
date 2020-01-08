"""Given json files in a folder, output a json list of all files in alphabetical order by filename"""

import os
from tqdm import tqdm
import json

FOLDER_PATH = "./dataset/metadata"
total_filenames = []
total_metadata = []
for root, dirs, files in os.walk(FOLDER_PATH):
    for file in tqdm(files):
        total_filenames.append(os.path.join(root, file).replace('\\', '/'))

for filename in tqdm(total_filenames):
  with open(filename, encoding="utf8") as jsonfile:
    try:
      metadata = json.load(jsonfile)
      total_metadata.append(metadata)
    except:
      print("Error parsing: {}".format(filename))

with open("metadata.json", "w") as outfile:
  json.dump(total_metadata, outfile)

