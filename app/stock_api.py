# app/stock_api.py
import yfinance as yf

def get_stock_price(symbol):
    stock = yf.Ticker(symbol)
    return stock.history(period="1d")['Close'].iloc[-1]