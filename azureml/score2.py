import pickle
import json
import numpy as np
from sklearn.externals import joblib
from sklearn.linear_model import Ridge
from azureml.core.model import Model

from inference_schema.schema_decorators import input_schema, output_schema
from inference_schema.parameter_types.numpy_parameter_type import NumpyParameterType

from keras.applications.imagenet_utils import preprocess_input, decode_predictions
from keras.models import load_model
from keras.preprocessing import image
from keras.applications.resnet50 import ResNet50
#model = ResNet50(weights=’imagenet’)


def init():
    global model
    # note here "sklearn_regression_model.pkl" is the name of the model registered under
    # this is a different behavior than before when the code is run locally, even though the code is the same.
    #model_path = Model.get_model_path('sklearn_regression')
    # deserialize the model file back into a sklearn model
    #model = joblib.load(model_path)

    model = ResNet50(weights='imagenet')


input_sample = np.array([[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]])
input_sample = "thing.jpg"
output_sample = np.array([3726.995])
output_sample = "panda"


@input_schema('data', NumpyParameterType(input_sample))
@output_schema(NumpyParameterType(output_sample))
def run(data):
    try:
        original = image.load_img(data, target_size=(224, 224))
        np_img = image.img_to_array(original)
        img_batch = np.expand_dim(np_img, axis=0)
        processed_image = preprocess_input(img_batch, mode='caffe')
        preds = model.predict(processed_image)
        pred_class = decode_predictions(preds, top=1)
        #result = model.predict(data)
        # you can return any datatype as long as it is JSON-serializable
        return pred_class.tolist()
    except Exception as e:
        error = str(e)
        return error
