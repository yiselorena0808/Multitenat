from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64

app = Flask(_name_)
CORS(app)

def base64_to_image(base64_str):
    img_data = base64.b64decode(base64_str.split(',')[-1])
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    return img

def comparar_huellas(img1, img2):
    # Simple comparación de correlación normalizada
    try:
        res = cv2.matchTemplate(img1, img2, cv2.TM_CCOEFF_NORMED)
        return float(res.max())
    except:
        return 0.0

@app.route('/compare', methods=['POST'])
def compare():
    data = request.get_json()
    t1 = data['t1']
    t2 = data['t2']

    img1 = base64_to_image(t1)
    img2 = base64_to_image(t2)

    score = comparar_huellas(img1, img2)
    return jsonify({'score': score})

if _name_ == '_main_':
    app.run(host='0.0.0.0', port=6000)