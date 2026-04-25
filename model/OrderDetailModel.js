export class OrderDetail {
    constructor(orderId, itemCode, price, qty, total) {
        this.orderId = orderId;
        this.itemCode = itemCode;
        this.price = price;
        this.qty = qty;
        this.total = total;
    }
}