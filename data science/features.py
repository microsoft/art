import torch
import torchvision.models as models
import torchvision.transforms as transforms
from torch.autograd import Variable
from PIL import Image

import numpy as np
import pickle
import time

import os

import torch.nn as nn
from torch.utils import data
import torchvision.datasets as datasets


def load_dataset(batch_size):
    data_path = 'datasets/fonts'
    train_dataset = datasets.ImageFolder(
        root=data_path,
        transform=transforms.Compose([transforms.Resize((224, 224)), transforms.ToTensor(), transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])])
    )
    # think about other possible transforms to scale to 224x224? random crop, etc.

    train_loader = data.DataLoader(
        train_dataset,
        batch_size=batch_size,
        num_workers=6,
        shuffle=False
    )
    return train_loader


def cosine_similarity(a, b):
    # Using PyTorch Cosine Similarity
    cos = nn.CosineSimilarity(dim=1, eps=1e-6)
    # cos_sim = cos(a.unsqueeze(0), b.unsqueeze(0))
    cos_sim = cos(a, b)
    
    # print('\nCosine similarity: {0}\n'.format(cos_sim))
    return cos_sim


def get_feature_vector(imgs, model, layer):
    
    def get_vector(imgs):

        def vector_size(layer):
            for param in layer.parameters():
                return param.shape[1]
        
        def copy_data(m, i, o):
            my_embedding.copy_(o.data.squeeze())

        t_imgs = Variable(imgs)
        my_embedding = torch.zeros(imgs.shape[0], vector_size(model._modules.get('fc')))

        h = layer.register_forward_hook(copy_data)
        model(t_imgs)
        h.remove()

        return my_embedding

    img_vector = get_vector(imgs).numpy()
    return img_vector


def get_sample_filenames():
    # Small dataset to do testing things
    img1 = "datasets/animals/birb.jpg"
    img2 = "datasets/animals/birb2.jpg"
    img3 = "datasets/animals/bork.jpg"
    img4 = "datasets/animals/snek.jpg"

    imgs = [img1, img2, img3, img4]
    return imgs


def get_filenames():
    # TODO replace with better data reading?
    total_filenames = []
    root_dir = "datasets/fonts"
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            total_filenames.append(os.path.join(root, file).replace('\\', '/'))
    return total_filenames


def get_metadata(filenames):
    total_metadata = []
    for filename in filenames:
        split_name = filename.split('/')
        content = split_name[-2]
        style = split_name[-1].split('.')[0]
        metadata = (content, style)
        total_metadata.append(metadata)

    pickle.dump(total_metadata, open("datasets/metadata.pkl", "wb"))


def process_images(model):
    dataset = load_dataset(128)
    total_features = []

    # for imgs, label in dataset:
    #     feature_vector = get_feature_vector(imgs.cuda(), model)
    #     total_features.append(feature_vector)

    model.cuda()
    layer = model._modules.get('avgpool')
    model.eval()

    for imgs, label in dataset:
        feature_vector = get_feature_vector(imgs.cuda(), model, layer)
        total_features.extend(feature_vector)

    total_numpy_features = np.array(total_features)

    pickle.dump(total_numpy_features, open("datasets/features-" + model.name + ".pkl", "wb"))


def run_models():
    resnet18 = models.resnet18(pretrained=True)
    # alexnet = models.alexnet(pretrained=True)
    # squeezenet = models.squeezenet1_0(pretrained=True)
    # vgg16 = models.vgg16(pretrained=True)
    # densenet = models.densenet161(pretrained=True)
    # inception = models.inception_v3(pretrained=True)
    # googlenet = models.googlenet(pretrained=True)
    # shufflenet = models.shufflenet_v2_x1_0(pretrained=True)
    # mobilenet = models.mobilenet_v2(pretrained=True)
    # resnext50_32x4d = models.resnext50_32x4d(pretrained=True)
    # wide_resnet50_2 = models.wide_resnet50_2(pretrained=True)
    # mnasnet = models.mnasnet1_0(pretrained=True)

    resnet18.name = "resnet18"
    # alexnet.name = "alexnet"
    # squeezenet.name = "squeezenet"
    # vgg16.name = "vgg16"
    # densenet.name = "densenet"
    # inception.name = "inception"
    # googlenet.name = "googlenet"
    # shufflenet.name = "shufflenet"
    # mobilenet.name = "mobilenet"
    # resnext50_32x4d.name = "resnext50_32x4d"
    # wide_resnet50_2.name = "wide_resnet50_2"
    # mnasnet.name = "mnasnet"

    print("Models created")

    filenames = get_filenames()
    get_metadata(filenames)

    print("Metadata done")

    # all_models = [resnet18, alexnet, squeezenet, vgg16, densenet, inception, googlenet,
    #               shufflenet, mobilenet, resnext50_32x4d, wide_resnet50_2, mnasnet]
    
    all_models = [resnet18]

    for model in all_models:
        process_images(model)
        print(model.name + " done")

if __name__ == '__main__':
    torch.multiprocessing.freeze_support()

    start = time.time()
    run_models()
    end = time.time()
    print(end - start)
    
    # # print(pickle.load(open("datasets/metadata.pkl", "rb")))
    # vectors = pickle.load(open("datasets/features-resnet18.pkl", "rb"))
    # # print(vectors[0].shape)
    # print(cosine_similarity(torch.from_numpy(vectors[250]), torch.from_numpy(vectors[260])))

