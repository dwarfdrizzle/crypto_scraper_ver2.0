from flask import Flask, send_from_directory

app = Flask(__name__, static_folder='../frontend/static', static_url_path='/static')

@app.route('/')
def index():
    return "Hello World!"

@app.route('/teststatic/<path:filename>')
def custom_static(filename):
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    app.run(debug=True)
