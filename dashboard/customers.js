// NOTE: Legacy DOM-manipulating script left over from a pre-React version of the dashboard.
// The current React app (under src/) does NOT import or use this file. React uses the
// dummy data in `src/data/customers.js`. If you're expecting changes here to show up in
// the Customers page, they won't. Update `src/data/customers.js` instead or migrate to
// real API calls.
// You can safely delete this file once fully migrated.
const customers = [
  {
    customerName: "JJ. Smith",
    phoneNumber: "52345325",
    emailId: "jj@gmail.com",
    gst: "GFA245FA",
    orders: "32",
  },
  {
    customerName: "Raj Singhania",
    phoneNumber: "915323525",
    emailId: "rs@gmail.com",
    gst: "HFD5FA",
    orders: "53",
  },
  {
    customerName: "Sourav Kumar",
    phoneNumber: "593745187",
    emailId: "sk@gmail.com",
    gst: "OJH5D83A",
    orders: "97",
  },
  {
    customerName: "John Brooks",
    phoneNumber: "52346355",
    emailId: "jb@gmail.com",
    gst: "GFA245FA",
    orders: "374",
  },
  {
    customerName: "SR. Trivadi",
    phoneNumber: "91435425",
    emailId: "srt@gmail.com",
    gst: "TSD245A",
    orders: "83",
  },
  {
    customerName: "Devi Prasad",
    phoneNumber: "57585325",
    emailId: "ds@gmail.com",
    gst: "GFA245FA",
    orders: "3",
  },
  {
    customerName: "Makhan Singh",
    phoneNumber: "956473242",
    emailId: "ms@gmail.com",
    gst: "KUJT45FA",
    orders: "66",
  },
];

customers.forEach((customer) => {
  const tr = document.createElement("tr");
  const trContent = `
        <td>${customer.customerName}</td>
        <td>${customer.phoneNumber}</td>
        <td>${customer.emailId}</td>
        <td>${customer.gst}</td>
        <td>${customer.orders}</td>
      `;
  tr.innerHTML = trContent;
  document.querySelector(".customer tbody").appendChild(tr);
});
