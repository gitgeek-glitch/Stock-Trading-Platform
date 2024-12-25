from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app import db
from app.models import Stock, Portfolio, Transaction

bp = Blueprint('api', __name__)

@bp.route('/api/trade', methods=['POST'])
@login_required
def trade():
    data = request.json
    symbol = data['symbol']
    quantity = int(data['quantity'])
    action = data['action']

    stock = Stock.query.filter_by(symbol=symbol).first()
    if not stock:
        return jsonify({'error': 'Invalid stock symbol'}), 400

    if action == 'buy':
        total_cost = stock.price * quantity
        if current_user.balance < total_cost:
            return jsonify({'error': 'Insufficient funds'}), 400
        
        current_user.balance -= total_cost
        portfolio_item = Portfolio.query.filter_by(user_id=current_user.id, stock_id=stock.id).first()
        if portfolio_item:
            new_quantity = portfolio_item.quantity + quantity
            new_average_price = (portfolio_item.average_price * portfolio_item.quantity + total_cost) / new_quantity
            portfolio_item.quantity = new_quantity
            portfolio_item.average_price = new_average_price
        else:
            new_item = Portfolio(user_id=current_user.id, stock_id=stock.id, quantity=quantity, average_price=stock.price)
            db.session.add(new_item)
    
    elif action == 'sell':
        portfolio_item = Portfolio.query.filter_by(user_id=current_user.id, stock_id=stock.id).first()
        if not portfolio_item or portfolio_item.quantity < quantity:
            return jsonify({'error': 'Insufficient stocks to sell'}), 400
        
        total_value = stock.price * quantity
        current_user.balance += total_value
        portfolio_item.quantity -= quantity
        if portfolio_item.quantity == 0:
            db.session.delete(portfolio_item)
    
    transaction = Transaction(user_id=current_user.id, stock_id=stock.id, quantity=quantity, price=stock.price, transaction_type=action)
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': f'Successfully {action}ed {quantity} shares of {stock.symbol}',
        'balance': current_user.balance,
        'stock_price': stock.price
    })

@bp.route('/api/portfolio')
@login_required
def get_portfolio():
    portfolio = Portfolio.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'symbol': item.stock.symbol,
        'name': item.stock.name,
        'quantity': item.quantity,
        'average_price': item.average_price,
        'current_price': item.stock.price,
        'total_value': item.total_value,
        'profit_loss': item.profit_loss
    } for item in portfolio])

@bp.route('/api/transactions')
@login_required
def get_transactions():
    transactions = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.timestamp.desc()).limit(10).all()
    return jsonify([{
        'symbol': transaction.stock.symbol,
        'quantity': transaction.quantity,
        'price': transaction.price,
        'type': transaction.transaction_type,
        'timestamp': transaction.timestamp.isoformat()
    } for transaction in transactions])

@bp.route('/api/market_data')
def get_market_data():
    stocks = Stock.query.all()
    return jsonify([{
        'symbol': stock.symbol,
        'name': stock.name,
        'price': stock.price,
        'change': stock.change,
        'volume': stock.volume,
        'last_updated': stock.last_updated.isoformat()
    } for stock in stocks])

@bp.route('/api/chatbot', methods=['POST'])
@login_required
def chatbot():
    data = request.json
    message = data.get('message', '').lower()
    
    if 'stock' in message:
        response = "I can help you with stock information. What specific stock are you interested in?"
    elif 'trade' in message:
        response = "To make a trade, go to the Trade page and select the stock, quantity, and whether you want to buy or sell."
    elif 'portfolio' in message:
        response = "You can view your portfolio on the Dashboard page. It shows all the stocks you currently own."
    elif 'balance' in message:
        response = f"Your current balance is ${current_user.balance:.2f}."
    else:
        response = "I'm here to help with any questions about stocks, trading, or your portfolio. What would you like to know?"
    
    return jsonify({'response': response})