import os

import pandas as pd
import requests
from tqdm import tqdm

batch_size = 256
img_width = 225
img_height = 225
model = "resnet"
metadata_fn = "metadata.json"
data_dir = "images"

os.makedirs(data_dir, exist_ok=True)
metadata = pd.read_json(metadata_fn, lines=True)
for i, row in tqdm(metadata.iterrows()):
    target_file = os.path.join(data_dir, row["id"] + ".jpg")
    if not os.path.exists(target_file):
        try:
            with open(target_file, 'wb') as f:
                f.write(requests.get(row["Thumbnail_Url"]).content)
        except Exception as e:
            print(e)
