import torch
import torchvision.models as models
import torchvision.transforms as transforms
from torch.autograd import Variable
from PIL import Image

import numpy as np
import pickle
import time
import json
import tqdm

import os

import torch.nn as nn
from torch.utils import data
import torchvision.datasets as datasets
from torchvision.models import SqueezeNet, ResNet


def load_dataset(batch_size):
    """ Loads the dataset from the dataset/fonts folder with the specified batch size. """

    data_path = 'dataset/art_dirs/'
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
    """ Computes the cosine similarity between two vectors using PyTorch's built-in function. """

    cos = nn.CosineSimilarity(dim=1, eps=1e-6)
    cos_sim = cos(a.unsqueeze(0), b.unsqueeze(0))
    # cos_sim = cos(a, b)
    
    # print('\nCosine similarity: {0}\n'.format(cos_sim))
    return cos_sim


def get_feature_vector(imgs, model, layer):
    """ Extracts the feature vectors from a particular model at a particular layer, given a Tensor of images. """

    def get_vector(imgs):

        def vector_size(layer):
            for param in layer.parameters():
                return param.shape[1]
        
        def copy_data(m, i, o):
            my_embedding.copy_(o.data.squeeze())

        t_imgs = Variable(imgs)


        if isinstance(model, SqueezeNet):
            my_embedding = torch.zeros(imgs.shape[0], 1000)
        elif isinstance(model, ResNet):
            my_embedding = torch.zeros(imgs.shape[0], vector_size(model._modules.get('fc'))) # extracts size of vector from the shape of the FC layer

        h = layer.register_forward_hook(copy_data)
        model(t_imgs)
        h.remove()

        return my_embedding

    img_vector = get_vector(imgs).numpy()
    return img_vector


# def get_sample_filenames():
#     # Small dataset to do testing things
#     img1 = "datasets/animals/birb.jpg"
#     img2 = "datasets/animals/birb2.jpg"
#     img3 = "datasets/animals/bork.jpg"
#     img4 = "datasets/animals/snek.jpg"

#     imgs = [img1, img2, img3, img4]
#     return imgs


def get_filenames(): 
    """ Extracts filenames from the dataset/fonts folder. """
    # TODO replace with better data reading?
    total_filenames = []
    root_dir = "dataset/art_dirs/"
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            total_filenames.append(os.path.join(root, file).replace('\\', '/'))
    return total_filenames


def get_metadata(filenames):
    """ Extracts metadata from filenames and writes them to a .pkl file. """
    total_metadata = []
    for filename in filenames:
        with open(filename) as f:
            metadata = json.load(f)
            total_metadata.append(metadata)
    
    with open("metadata.json", 'w') as outfile:
        json.dump(total_metadata, outfile)


def process_images(model, dataset):
    """ Extracts all the feature vectors of a particular dataset using a particular model and writes them to a .pkl file. """

    # start = time.time()
    total_features = []
    
    model.cuda()
    if isinstance(model, ResNet):
        layer = model._modules.get('avgpool')
    elif isinstance(model, SqueezeNet):
        layer = list(model.children())[-1][-1]

    model.eval()

    print(model.name)
    count = 0
    for imgs, label in dataset:
        try:
            feature_vector = get_feature_vector(imgs.cuda(), model, layer)
            total_features.extend(feature_vector)
            if count%120 == 0:
                print(count)
            count += 1
        except:
            print("error loading: {}".format(label))

    total_numpy_features = np.array(total_features)

    pickle.dump(total_numpy_features, open("dataset/art_features-" + model.name + ".pkl", "wb"))
    # end = time.time()
    # print(end - start)
    # print(model.name)



def run_models():
    """ Extracts the feature vectors from the dataset from a variety of different models. """

    dataset = load_dataset(32)
    

    # resnet18 = models.resnet18(pretrained=True)
    # resnet34 = models.resnet34(pretrained=True)
    # resnet50 = models.resnet50(pretrained=True)
    # resnet101 = models.resnet101(pretrained=True)
    # resnet152 = models.resnet152(pretrained=True)
    
    # inception = models.inception_v3(pretrained=True)
    # googlenet = models.googlenet(pretrained=True)
    # shufflenet = models.shufflenet_v2_x1_0(pretrained=True)
    # resnext50_32x4d = models.resnext50_32x4d(pretrained=True)
    # resnext101_32x8d = models.resnext101_32x8d(pretrained=True)
    # wide_resnet101_2 = models.wide_resnet101_2(pretrained=True)
    # wide_resnet50_2 = models.wide_resnet50_2(pretrained=True)
    # alexnet = models.alexnet(pretrained=True)
    squeezenet = models.squeezenet1_1(pretrained=True)
    # vgg16 = models.vgg16(pretrained=True)
    # densenet = models.densenet161(pretrained=True)
    # mobilenet = models.mobilenet_v2(pretrained=True)
    # mnasnet = models.mnasnet1_0(pretrained=True)


    # resnet18.name = "resnet18"
    # resnet34.name = "resnet34"
    # resnet50.name = "resnet50"
    # resnet101.name = "resnet101"
    # resnet152.name = "resnet152"

    # inception.name = "inception"
    # googlenet.name = "googlenet"
    # shufflenet.name = "shufflenet"
    # resnext50_32x4d.name = "resnext50_32x4d"
    # resnext101_32x8d.name = "resnext101_32x8d"
    # wide_resnet101_2.name = "wide_resnet101_2"
    # wide_resnet50_2.name = "wide_resnet50_2"
    # alexnet.name = "alexnet"
    squeezenet.name = "squeezenet"
    # vgg16.name = "vgg16"
    # densenet.name = "densenet"
    # mobilenet.name = "mobilenet"
    # mnasnet.name = "mnasnet"

    print("Models created")

    # # only needs to be run once, commented out for now
    # filenames = get_filenames()
    # get_metadata(filenames)
    # print("Metadata done")

    # all_models = [resnet18, alexnet, squeezenet, vgg16, densenet, inception, googlenet,
    #               shufflenet, mobilenet, resnext50_32x4d, wide_resnet50_2, mnasnet]
    all_models = [squeezenet]

    for model in all_models:
        process_images(model, dataset)
        print(model.name + " done")


def benchmark_different():
    models = ["datasets/features-resnet18.pkl", "datasets/features-resnet34.pkl", "datasets/features-resnet50.pkl", "datasets/features-resnet101.pkl", "datasets/features-resnext50_32x4d.pkl", "datasets/features-wide_resnet50_2.pkl"]
    # models = ["datasets/features-resnext50_32x4d.pkl"]
    for model in models:
        vectors = pickle.load(open(model, "rb"))

        sum = 0
        for i in range(248):
            for j in range(248):
                sum += cosine_similarity(torch.from_numpy(vectors[i]), torch.from_numpy(vectors[j]))
        
        print(model)
        print(sum / 61504)


if __name__ == '__main__':
    torch.multiprocessing.freeze_support()

    run_models()
    # print(torch.cuda.is_available())
    # benchmark_different()
    
    # print(pickle.load(open("datasets/metadata.pkl", "rb")))
    # vectors = pickle.load(open("datasets/features-resnet18.pkl", "rb"))
    # print(cosine_similarity(torch.from_numpy(vectors[10]), torch.from_numpy(vectors[11])))


    # datasets/features-resnet18.pkl
    # tensor([0.8278])
    # datasets/features-resnet34.pkl
    # tensor([0.8308])
    # datasets/features-resnet50.pkl
    # tensor([0.8584])
    # datasets/features-resnet101.pkl
    # tensor([0.8729])
    # datasets/features-resnext50_32x4d.pkl
    # tensor([0.8269])
    # datasets/features-wide_resnet50_2.pkl
    # tensor([0.8112])

    # datasets/features-resnet18.pkl
    # tensor([0.8796])
    # datasets/features-resnet34.pkl
    # tensor([0.8815])
    # datasets/features-resnet50.pkl
    # tensor([0.9034])
    # datasets/features-resnet101.pkl
    # tensor([0.9034])
    # datasets/features-resnext50_32x4d.pkl
    # tensor([0.8826])
    # datasets/features-wide_resnet50_2.pkl
    # tensor([0.8732])
