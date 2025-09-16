import React from "react";

const Map = ({ address = "Patna, Bihar, India", height = 360 }) => {
  const query = encodeURIComponent(address);
  // Using Google Maps Embed; if you have an API key and restrictions, replace with your key or use OpenStreetMap iframe
  const src = `https://www.google.com/maps?q=${query}&output=embed`;
  return (
    <div
      className="w-full rounded overflow-hidden shadow mt-8"
      style={{ height }}
    >
      <iframe
        title="office-location"
        src={src}
        width="100%"
        height={height}
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default Map;
