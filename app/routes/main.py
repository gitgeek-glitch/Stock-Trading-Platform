from flask import Blueprint, render_template
from flask_login import login_required, current_user
from app.models import Stock, Portfolio, Transaction

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/dashboard')
@login_required
def dashboard():
    stocks = Stock.query.all()
    portfolio = Portfolio.query.filter_by(user_id=current_user.id).all()
    recent_transactions = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.timestamp.desc()).limit(5).all()
    return render_template('dashboard.html', stocks=stocks, portfolio=portfolio, recent_transactions=recent_transactions)

@bp.route('/portfolio')
@login_required
def portfolio():
    portfolio = Portfolio.query.filter_by(user_id=current_user.id).all()
    total_value = sum(item.total_value for item in portfolio)
    return render_template('portfolio.html', portfolio=portfolio, total_value=total_value)

@bp.route('/trade')
@login_required
def trade():
    stocks = Stock.query.all()
    return render_template('trade.html', stocks=stocks)