from app import create_app, db
from app.models import User, Stock, Portfolio

app = create_app()

def init_db():
    with app.app_context():
        # Drop all existing tables to reset the schema (Be careful: This will delete all data)
        db.drop_all()
        db.create_all()

        # Check if data already exists
        if User.query.first() is not None:
            print("Database already contains data. Skipping initialization.")
            return

        # Add sample user
        user = User(username="test_user", email="test@example.com")
        user.set_password("password123")
        user.balance = 10000.0
        db.session.add(user)
        
        # Add sample stocks
        stocks = [
            Stock(symbol="AAPL", name="Apple Inc.", price=150.0),
            Stock(symbol="GOOGL", name="Alphabet Inc.", price=2500.0),
            Stock(symbol="MSFT", name="Microsoft Corporation", price=300.0),
            Stock(symbol="AMZN", name="Amazon.com, Inc.", price=3300.0),
            Stock(symbol="FB", name="Meta Platforms, Inc.", price=330.0),
            Stock(symbol="TSLA", name="Tesla, Inc.", price=700.0),
            Stock(symbol="NVDA", name="NVIDIA Corporation", price=600.0),
            Stock(symbol="JPM", name="JPMorgan Chase & Co.", price=150.0),
            Stock(symbol="JNJ", name="Johnson & Johnson", price=170.0),
            Stock(symbol="V", name="Visa Inc.", price=230.0)
        ]
        
        for stock in stocks:
            db.session.add(stock)
        
        # Add sample portfolio items
        portfolio_items = [
            Portfolio(user_id=1, stock_id=1, quantity=10, average_price=150.0),  # Set a valid average price
            Portfolio(user_id=1, stock_id=2, quantity=5, average_price=2500.0),
            Portfolio(user_id=1, stock_id=3, quantity=8, average_price=300.0)
        ]

        
        for item in portfolio_items:
            db.session.add(item)
        
        # Commit the changes
        db.session.commit()
        
        print("Database initialized with sample data.")

if __name__ == "__main__":
    init_db()