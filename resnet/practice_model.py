import os
import numpy as np
from keras.applications.imagenet_utils import preprocess_input, decode_predictions
from keras.models import load_model
from keras.preprocessing import image
from keras.applications.resnet50 import ResNet50


def predict(img_path):
    #load model architecture with imagenet weights
    model = ResNet50(weights='imagenet')

    #load image in PIL format
    original = image.load_img(img_path, target_size=(224, 224))

    #convert from PIL format to NumPy format
    numpy_image = image.img_to_array(original)

    #convert from NumPy format to Batch format
    image_batch = np.expand_dims(numpy_image, axis=0)

    #pre-process img
    processed_image = preprocess_input(image_batch, mode='caffe')

    #classify img
    preds = model.predict(processed_image)

    #decode prediction
    pred_class = decode_predictions(preds, top=1)

    return pred_class[0][0][1]

if __name__ == '__main__':
    img_path = 'resnet/bird.jpg'
    print(predict(img_path))