import torch
import torch.nn as nn
from torch.utils import data
import torchvision.datasets as datasets
import torchvision.models as models
import torchvision.transforms as transforms
from torch.autograd import Variable
from PIL import Image

def load_dataset(batch_size):
    data_path = './test/'
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

# Load the pretrained model
model = models.resnet18(pretrained=True)
# Use CUDA to utilize the GPU
# print(torch.cuda.is_available())
model.cuda()
# Use the model object to select the desired layer
layer = model._modules.get('avgpool')
# Set model to evaluation mode
model.eval()


def image_vectors(imgs):

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


def cosine_similarity(a, b):
    # Using PyTorch Cosine Similarity
    cos = nn.CosineSimilarity(dim=1, eps=1e-6)
    cos_sim = cos(a.unsqueeze(0), b.unsqueeze(0))
    
    # print('\nCosine similarity: {0}\n'.format(cos_sim))
    return cos_sim


if __name__ == '__main__':
    torch.multiprocessing.freeze_support()

    batch_size = 64
    dataset = load_dataset(batch_size)
    
    for batch, labels in dataset:
        a = image_vectors(batch.cuda()) # features, matrix of dimensions (batch size) x (vector size)
        b = labels
    

    # test on dogs and cats
    for pair in [(0, 1), (2, 3), (0, 2), (1, 3)]:
        print(cosine_similarity(a[pair[0]], a[pair[1]]))