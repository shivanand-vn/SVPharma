export const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;

    // Custom logic to join pincode with state
    let formatted = '';

    if (address.shopName) formatted += `${address.shopName}, `;
    if (address.line1) formatted += `${address.line1}, `;
    if (address.line2) formatted += `${address.line2}, `;
    if (address.area) formatted += `${address.area}, `;
    if (address.city) formatted += `${address.city}, `;
    if (address.district) formatted += `${address.district}, `;
    if (address.state) formatted += address.state;
    if (address.pincode) formatted += ` - ${address.pincode}`;
    if (address.landmark) formatted += ` (Near ${address.landmark})`;

    return formatted.replace(/,\s*$/, ""); // Remove trailing comma
};
