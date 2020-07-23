import os

import pandas as pd
import torch
import torch.nn as nn
from PIL import Image
from torch.utils.data import Dataset
from torchvision import models, transforms
from tqdm import tqdm
import numpy as np
import pickle

data_dir = 'images'
metadata_fn = "metadata.json"
features_dir = "features"
features_file = os.path.join(features_dir, "pytorch_rn50.pkl")
featurize_images = True
device = torch.device("cuda:0")

os.makedirs(data_dir, exist_ok=True)
os.makedirs(features_dir, exist_ok=True)

if featurize_images:
    class ArtDataset(Dataset):
        """Face Landmarks dataset."""

        def __init__(self, metadata_json, image_dir, transform):
            """
            Args:
                csv_file (string): Path to the csv file with annotations.
                root_dir (string): Directory with all the images.
                transform (callable, optional): Optional transform to be applied
                    on a sample.
            """
            self.metadata = pd.read_json(metadata_json, lines=True)
            self.image_dir = image_dir
            self.transform = transform

        def __len__(self):
            return len(self.metadata)

        def __getitem__(self, idx):
            if torch.is_tensor(idx):
                idx = idx.tolist()
            metadata = self.metadata.iloc[idx]
            with open(os.path.join(self.image_dir, metadata["id"] + ".jpg"), "rb") as f:
                image = Image.open(f).convert("RGB")
            return self.transform(image), metadata["id"]


    data_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    dataset = ArtDataset(metadata_fn, data_dir, data_transform)
    data_loader = torch.utils.data.DataLoader(dataset, batch_size=64, shuffle=False, num_workers=4)

    dataset_size = len(dataset)

    # Get a batch of training data
    model = models.resnet50(pretrained=True)
    model.eval()
    model.to(device)
    cut_model = nn.Sequential(*list(model.children())[:-1])

    all_outputs = []
    all_ids = []
    for i, (inputs, ids) in enumerate(tqdm(data_loader)):
        inputs = inputs.to(device)
        outputs = torch.squeeze(cut_model(inputs)).detach().cpu().numpy()
        all_outputs.append(outputs)
        all_ids.append(list(ids))

    all_outputs = np.concatenate(all_outputs, axis=0)
    all_ids = np.concatenate(all_ids, axis=0)

    with open(features_file, "wb+") as f:
        pickle.dump((all_outputs, all_ids), f)

with open(features_file, "rb") as f:
    with torch.no_grad():
        (all_outputs, all_ids) = pickle.load(f)
        all_urls = np.array(pd.read_json(metadata_fn, lines=True).loc[:, "Thumbnail_Url"])
        features = torch.from_numpy(all_outputs).float().to("cpu:0")
        features = features / torch.sqrt(torch.sum(features ** 2, dim=1, keepdim=True))
        features = features.to(device)
        indicies = torch.arange(0, features.shape[0]).to(device)
        print("loaded features")

        metadata = pd.read_json(metadata_fn, lines=True)
        culture_arr = np.array(metadata["Culture"])
        cultures = metadata.groupby("Culture").count()["id"].sort_values(ascending=False).index.to_list()
        media_arr = np.array(metadata["Classification"])
        media = metadata.groupby("Classification").count()["id"].sort_values(ascending=False).index.to_list()
        ids = np.array(metadata["id"])


        masks = {"culture": {}, "medium": {}}
        for culture in cultures:
            masks["culture"][culture] = torch.from_numpy(culture_arr == culture).to(device)
        for medium in media:
            masks["medium"][medium] = torch.from_numpy(media_arr == medium).to(device)


        all_matches = []
        for i, row in tqdm(metadata.iterrows()):
            feature = features[i]
            matches = {"culture": {}, "medium": {}}
            all_dists = torch.sum(features * feature, dim=1).to(device)
            for culture in cultures:
                selected_indicies = indicies[masks["culture"][culture]]
                k = min(10, selected_indicies.shape[0])
                dists, inds = torch.topk(all_dists[selected_indicies], k, sorted=True)
                matches["culture"][culture] = ids[selected_indicies[inds].cpu().numpy()]
            for medium in media:
                selected_indicies = indicies[masks["medium"][medium]]
                k = min(10, selected_indicies.shape[0])
                dists, inds = torch.topk(all_dists[selected_indicies], k, sorted=True)
                matches["medium"][medium] = ids[selected_indicies[inds].cpu().numpy()]
            all_matches.append(matches)

        metadata["matches"] = all_matches

        metadata.to_json("results/metadata_enriched.json")
        print("here")


