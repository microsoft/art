import os

def extract_image_type(filename):
    split_name = int(filename.split("_")[2])
    return split_name

base = "C://Users/v-stfu/Documents/GitHub/art/data science/dataset/"

for root, dirs, files in os.walk(base + "art"):
    for file in files:
        image_type = extract_image_type(file)
        if not os.path.exists(base + "art_dirs/" + str(image_type)):
            os.mkdir(base + "art_dirs/" + str(image_type))
        os.rename("C://Users/v-stfu/Documents/GitHub/art/data science/dataset/art/" + file,
                  "C://Users/v-stfu/Documents/GitHub/art/data science/dataset/art_dirs/" + str(image_type) + "/" + file)