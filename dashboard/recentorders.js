// NOTE: Legacy DOM-manipulating script from pre-React dashboard.
// The React dashboard uses `src/data/recentorders.js` instead. Editing this file will
// not change what you see in the Recent Orders component. Safe to delete after migration.
const recentorders = [
  {
    productName: "Remote Control Car",
    productNumber: "5234",
    paymentStatus: "Due",
    shipping: "Pending",
  },
  {
    productName: "Buddha Statue Wodden",
    productNumber: "7634",
    paymentStatus: "Refunded",
    shipping: "Declined",
  },

  {
    productName: "Naruto Manga Set Season:1",
    productNumber: "8453",
    paymentStatus: "Due",
    shipping: "Pending",
  },
  {
    productName: "Batman Mask",
    productNumber: "7345",
    paymentStatus: "Paid",
    shipping: "Delivered",
  },
  {
    productName: "Iphone 15 Pro",
    productNumber: "7341",
    paymentStatus: "Paid",
    shipping: "Delivered",
  },
];

recentorders.forEach((order) => {
  var tr = document.createElement("tr");
  var trContent = `
  <td>${order.productName}</td>
  <td>${order.productNumber}</td>
  <td class="${
    order.paymentStatus === "Due"
      ? "warning"
      : order.paymentStatus === "Refunded"
      ? "danger"
      : "success"
  }">
  ${order.paymentStatus}
</td>
  <td>
    ${order.shipping}
  </td>
  <td class="primary">Details</td>
`;

  tr.innerHTML = trContent;
  document.querySelector("table tbody").appendChild(tr);
});
