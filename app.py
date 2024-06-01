from flask import Flask, render_template, request, send_file
import os

app = Flask(__name__)

# 路由到主页，加载编辑器
@app.route('/')
def index():
    return render_template('index.html')

# 保存编辑器内容到服务器
@app.route('/save', methods=['POST'])
def save():
    data = request.json.get('content')
    if data:
        with open('saved_content.html', 'w') as f:
            f.write(data)
        return {'message': 'Content saved successfully'}
    else:
        return {'message': 'No content to save'}, 400

# 下载保存的文件
@app.route('/download')
def download():
    file_path = 'saved_content.html'
    return send_file(file_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)