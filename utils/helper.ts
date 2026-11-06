export class Helper {
  static convertPriceToNumber(price: string): number {
    return Number(price.replace(/[^0-9.]/g, ""));
  }

  static getProductDetails() {
    return {
      productName: "MacBook",
      productQuantity: "1",
      totalPrice: "$602.00",
    };
  }

  static getLoginDetails() {
    const { APP_EMAIL, APP_PASSWORD } = process.env;

    if (!APP_EMAIL || !APP_PASSWORD) {
      throw new Error("APP_EMAIL and APP_PASSWORD must be configured.");
    }

    return {
      email: APP_EMAIL,
      password: APP_PASSWORD,
    };
  }
}