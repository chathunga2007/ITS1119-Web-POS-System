export class Order {
    constructor(orderId, customerId, date, total, discount, cash, balance) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.date = date;
        this.total = total;
        this.discount = discount;
        this.cash = cash;
        this.balance = balance;
    }
}