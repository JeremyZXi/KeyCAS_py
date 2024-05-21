from flask import Flask, render_template, url_for, flash, redirect, request, send_file, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, current_user, logout_user, login_required
import os
from models import app, db, bcrypt, User, create_database

# Ensure the database is created
with app.app_context():
    create_database()

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        user = User(username=username, email=email, password=hashed_password)
        db.session.add(user)
        db.session.commit()
        user_dir = os.path.join('users', username)
        os.makedirs(user_dir)
        with open(os.path.join(user_dir, 'index.html'), 'w') as f:
            f.write('<h1>Welcome, {}!</h1>'.format(username))
        flash('Your account has been created! You are now able to log in', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user, remember=request.form.get('remember'))
            return redirect(url_for('dashboard'))
        else:
            flash('Login Unsuccessful. Please check email and password', 'danger')
    return render_template('login.html')

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('register'))

@app.route('/dashboard')
@login_required
def dashboard():
    user_dir = os.path.join('users', current_user.username)
    user_index_file = os.path.join(user_dir, 'index.html')
    return render_template('index.html', user_index_file=user_index_file)

@app.route('/save', methods=['POST'])
@login_required
def save():
    data = request.json.get('content')
    if data:
        user_dir = os.path.join('users', current_user.username)
        user_index_file = os.path.join(user_dir, 'index.html')
        with open(user_index_file, 'w') as f:
            f.write(data)
        return jsonify({'message': 'Content saved successfully!'})
    return jsonify({'message': 'No content to save!'}), 400

@app.route('/load')
@login_required
def load():
    user_dir = os.path.join('users', current_user.username)
    user_index_file = os.path.join(user_dir, 'index.html')
    if os.path.exists(user_index_file):
        with open(user_index_file, 'r') as f:
            content = f.read()
        return jsonify({'content': content})
    return jsonify({'content': ''})

if __name__ == '__main__':
    app.run(debug=True)