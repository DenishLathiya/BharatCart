const { randomBytes } = require("crypto");

const mockShippingProvider = {
  name: "BharatCart Mock Logistics",
  createShipment(order, shippedAt = new Date()) {
    const estimatedDelivery = new Date(shippedAt);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    return {
      provider: this.name,
      trackingNumber: `BC${randomBytes(6).toString("hex").toUpperCase()}`,
      trackingUrl: "",
      service: "Standard Delivery",
      estimatedDelivery,
      shippedAt,
      isMock: true,
    };
  },
};

module.exports = {
  createShipment: (order, shippedAt) => mockShippingProvider.createShipment(order, shippedAt),
};
