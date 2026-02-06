export interface Address {
    floor: string;
    building: string;
    area: string;
    city: string;
    district: string;
    taluk: string;
    state: string;
    pincode: string;
    landmark: string;
}

export const emptyAddress: Address = {
    floor: "",
    building: "",
    area: "",
    city: "",
    district: "",
    taluk: "",
    state: "",
    pincode: "",
    landmark: ""
};

export const normalizeAddress = (input?: any): Address => {
    if (!input) return { ...emptyAddress };
    return {
        floor: input.floor || "",
        building: input.building || input.line1 || "", // Migration fallback
        area: input.area || input.line2 || "",         // Migration fallback
        city: input.city || "",
        district: input.district || "",
        taluk: input.taluk || "",
        state: input.state || "",
        pincode: input.pincode || "",
        landmark: input.landmark || ""
    };
};

export const formatAddress = (addr: Address): string => {
    return [
        [addr.floor, addr.building].filter(Boolean).join(', '),
        addr.area,
        [addr.city, addr.pincode].filter(Boolean).join(' - '),
        [addr.taluk, addr.district].filter(Boolean).join(', '),
        addr.state,
        addr.landmark
    ].filter(Boolean).join(', ');
};
