import torch
import torchvision.models as models
import torchvision.transforms as transforms
from torch.autograd import Variable
from PIL import Image

import numpy as np
import pickle

import os


def get_feature_vector(filename, model):
    def get_vector(image_name, normalize, to_tensor, scaler):
        # TODO idk what the heck is going on here, replace with the transforms done when reading in files?
        img = Image.open(image_name)
        t_img = Variable(normalize(to_tensor(scaler(img))).unsqueeze(0))
        feature_vector = torch.zeros(512)  # TODO not always 512

        def copy_data(m, i, o):
            feature_vector.copy_(o.data.squeeze())

        h = layer.register_forward_hook(copy_data)
        model(t_img)
        h.remove()
        return feature_vector

    model = models.resnet18(pretrained=True)
    layer = model._modules.get('avgpool')

    model.eval()

    scaler = transforms.Resize((224, 224))
    normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                     std=[0.229, 0.224, 0.225])
    to_tensor = transforms.ToTensor()

    img_vector = get_vector(filename, normalize, to_tensor, scaler).numpy()
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
    root_dir = "datasets/fonts/32x32"
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

    pickle.dump(total_metadata, open("datasets/fonts/metadata.pkl", "wb"))


def process_images(filenames, model):
    total_features = []
    for filename in filenames:
        feature_vector = get_feature_vector(filename, model)
        total_features.append(feature_vector)
    total_numpy_features = np.array(total_features)

    pickle.dump(total_numpy_features, open("datasets/fonts/features-" + model.name + ".pkl", "wb"))


def run_models():
    resnet18 = models.resnet18(pretrained=True)
    alexnet = models.alexnet(pretrained=True)
    squeezenet = models.squeezenet1_0(pretrained=True)
    vgg16 = models.vgg16(pretrained=True)
    densenet = models.densenet161(pretrained=True)
    inception = models.inception_v3(pretrained=True)
    googlenet = models.googlenet(pretrained=True)
    shufflenet = models.shufflenet_v2_x1_0(pretrained=True)
    mobilenet = models.mobilenet_v2(pretrained=True)
    resnext50_32x4d = models.resnext50_32x4d(pretrained=True)
    wide_resnet50_2 = models.wide_resnet50_2(pretrained=True)
    mnasnet = models.mnasnet1_0(pretrained=True)

    resnet18.name = "resnet18"
    alexnet.name = "alexnet"
    squeezenet.name = "squeezenet"
    vgg16.name = "vgg16"
    densenet.name = "densenet"
    inception.name = "inception"
    googlenet.name = "googlenet"
    shufflenet.name = "shufflenet"
    mobilenet.name = "mobilenet"
    resnext50_32x4d.name = "resnext50_32x4d"
    wide_resnet50_2.name = "wide_resnet50_2"
    mnasnet.name = "mnasnet"

    print("Models created")

    filenames = get_filenames()
    get_metadata(filenames)

    print("Metadata done")

    all_models = [resnet18, alexnet, squeezenet, vgg16, densenet, inception, googlenet,
                  shufflenet, mobilenet, resnext50_32x4d, wide_resnet50_2, mnasnet]

    for model in all_models:
        process_images(filenames, model)
        print(model.name + " done")

run_models()
