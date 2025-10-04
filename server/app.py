from flask import Flask, request, jsonify
from flask_cors import CORS  # important for Chrome Extension requests

app = Flask(__name__)
CORS(app)  # allow cross-origin requests (from extension to server)

@app.route('/compute', methods=['POST'])
def compute():
    data = request.get_json()
    x = data.get('x', 0)
    result = x ** 2  # replace with your actual computation
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
