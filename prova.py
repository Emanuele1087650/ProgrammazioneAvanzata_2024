import os
import requests
import shutil

def uploadDataset():
    url = 'http://127.0.0.1:8000/uploadDataset/riccardo'
    file_path = 'dataset1'
    shutil.make_archive(file_path, 'zip', file_path)

    with open(f"{file_path}.zip", 'rb') as f:
        files = {'dataset': f}
        response = requests.post(url, data={'name': file_path}, files=files)

    print(response.text)
    
def uploadImage():
    url = 'http://127.0.0.1:5000/uploadImage/riccardo/dataset1'
    image = "dataset2/Downpic.cc-177119287.jpg"

    with open(image, 'rb') as i:
        files = {'image': i}
        response = requests.post(url, data={'name_img': os.path.splitext(os.path.basename(image))[0]}, files=files)

    print(response.text)

uploadDataset()
